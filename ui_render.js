import { gameState, SCENES, checkSkill, filterChoicesByRequirements, resetToCreation, saveGameLocal, loadGameLocal, startGame, handleCombatChoice, takeDamage } from './game_logic.js';
import { MANTES, PILOT_BASE_STATS, POOL_TOTAL, DISTRIBUTION_POOL, ENEMY_TYPES } from './models.js';

const gameView = document.getElementById('game-view');
const MANTE_SPECIAL_ATTACKS = {
    Phalange: {
        name: "Écrasement d'Assaut",
        stat: "Force",
        damageMult: 2,
        desc: "Dégâts doublés, difficile à éviter, utilise la Force pure de l'armure."
    },
    Aiguille: {
        name: "Frappe Chirurgicale",
        stat: "Agilité",
        damageMult: 1.5,
        desc: "Dégâts modérés, chance d'ignorer la défense ennemie."
    },
    Éclair: {
        name: "Surcharge de Vitesse",
        stat: "Vitesse",
        damageMult: 1.5,
        desc: "Dégâts modérés, chance d'obtenir un second tour."
    },
    Omni: {
        name: "Défaillance Systémique",
        stat: "Synchronisation",
        damageMult: 1.2,
        desc: "Dégâts légers, chance de réduire l'attaque de l'ennemi au prochain tour."
    }
};


export function updateLog(message) {
    gameState.log.push(message);
    if (gameState.log.length > 50) {
        gameState.log.shift();
    }
    const logEl = document.getElementById('log-display');
    if (logEl) {
        logEl.innerHTML = gameState.log.slice(-10).map(msg => `<p class="text-xs text-gray-400">${msg}</p>`).reverse().join('');
    }
}


function renderStatBar(stat, value, color) {
    const checkValue = ['Force', 'Agilité', 'Vitesse'].includes(stat) ? value / 10 : value;
    const max = 20;
    const percentage = Math.min(checkValue, max) / max * 100;

    return `
        <div class="mb-2">
            <div class="flex justify-between text-sm font-semibold">
                <span>${stat}</span>
                <span>${checkValue} <span class="text-gray-400">(${value})</span></span>
            </div>
            <div class="stat-bar-bg h-2 rounded-full mt-1">
                <div class="${color} h-2 rounded-full" style="width: ${percentage}%;"></div>
            </div>
        </div>
    `;
}

function renderHPBar(label, currentHP, maxHP, colorClass) {
    const percentage = (currentHP / maxHP) * 100;
    const displayHP = Math.max(0, currentHP);
    const isCritical = displayHP <= (maxHP * 0.2);

    return `
        <div class="mb-3">
            <div class="flex justify-between text-sm font-semibold text-white">
                <span>${label} (${displayHP}/${maxHP})</span>
                <span class="${isCritical ? 'text-red-400 font-extrabold animate-pulse' : 'text-green-400'}">${displayHP} PV</span>
            </div>
            <div class="stat-bar-bg h-3 rounded-full mt-1">
                <div class="h-3 rounded-full ${colorClass}" style="width: ${percentage}%;"></div>
            </div>
        </div>
    `;
}

export function renderGameUI() {
    const statsHTML = Object.entries(gameState.effectiveStats).map(([stat, value]) => {
        let color;
        switch (stat) {
            case 'Force': color = 'bg-red-500'; break;
            case 'Agilité': color = 'bg-blue-500'; break;
            case 'Vitesse': color = 'bg-yellow-500'; break;
            case 'Intelligence': color = 'bg-purple-500'; break;
            case 'Lucidité': color = 'bg-cyan-500'; break;
            case 'QI_de_Combat': color = 'bg-green-500'; break;
            case 'Synchronisation': color = 'bg-orange-500'; break;
            default: color = 'bg-gray-500';
        }
        return renderStatBar(stat, value, color);
    }).join('');

    const logHTML = gameState.log.slice(-10).map(msg => `<p class="text-xs text-gray-400">${msg}</p>`).reverse().join('');

    const currentScene = SCENES[gameState.currentScene];
    let sceneChoices = currentScene.choices;
    if (gameState.manteType) {
        sceneChoices = currentScene[`choices_${gameState.manteType}`] || currentScene.choices;
    }

    const availableChoices = filterChoicesByRequirements(sceneChoices);

    const choicesHTML = availableChoices.map((choice, index) => {
        let buttonClass = "btn-choice hover:ring-2 ring-green-500/50";
        let buttonText = choice.text;
        let isLocked = !!choice.disabledReason;
        if (buttonText.includes('[AVANTAGE/DETERMINANT]')) {
            buttonClass = "btn-choice bg-blue-900/40 border-blue-500 text-blue-300 font-bold hover:bg-blue-900/60";
            buttonText = buttonText.replace('[AVANTAGE/DETERMINANT]', '').trim();
        } else if (buttonText.includes('[DIFFICILE/CRITIQUE]')) {
            buttonClass = "btn-choice bg-red-900/40 border-red-500 text-red-300 font-bold hover:bg-red-900/60";
            buttonText = buttonText.replace('[DIFFICILE/CRITIQUE]', '').trim();
        }
        if (isLocked) {
            buttonClass = "btn-choice bg-gray-900/40 border-gray-700 text-gray-500 cursor-not-allowed";
            buttonText += ` ${choice.disabledReason}`;
        }

        return `
            <button onclick="handleChoiceWrapper('${gameState.currentScene}', ${sceneChoices.findIndex(c => c.text === choice.text)})"
                    class="${buttonClass} w-full text-left p-3 rounded-lg mt-3 text-sm" ${isLocked ? 'disabled' : ''}>
                ${buttonText}
            </button>
        `;
    }).join('');

    gameView.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Panneau de Statistiques et Log -->
            <aside class="lg:col-span-1 bg-gray-800 p-4 rounded-lg sticky top-0">
                <h2 class="text-xl font-bold mb-3 text-white">${gameState.name || 'Opérateur Inconnu'} | Mante ${gameState.manteType}</h2>
                
                ${renderHPBar('PV Pilote', gameState.pilotHP, 100, 'bg-red-500')}
                ${renderHPBar('PV Mante', gameState.manteHP, gameState.pilotStats.Force * 10, 'bg-green-500')}

                <div class="border-b border-gray-700 pb-3 mb-3">
                    <h3 class="text-md font-semibold mb-2 text-yellow-400">Aptitudes (Pilote/Effectif)</h3>
                    ${statsHTML}
                </div>
                
                <h3 class="text-lg font-semibold mb-2 text-green-400">Réputation (Max 10)</h3>
                <p class="text-sm">CEL: ${gameState.reputation.CEL} / FEU: ${gameState.reputation.FEU} / Aetheria: ${gameState.reputation.Aetheria}</p>
                
                <h3 class="text-lg font-semibold mt-4 mb-2 text-white">Journal des Opérations</h3>
                <div id="log-display" class="h-40 overflow-y-auto space-y-1 p-2 bg-gray-900 rounded text-xs">
                    ${logHTML}
                </div>
                
                <div class="grid grid-cols-2 gap-2 mt-4">
                    <button onclick="saveGameLocal()" class="btn-primary p-2 rounded-lg text-sm">Sauvegarde Locale</button>
                    <button onclick="loadGameLocal()" class="btn-choice p-2 rounded-lg text-sm">Charger Local</button>
                    <button onclick="exportRunAsJSON()" class="btn-choice p-2 rounded-lg text-sm">Exporter JSON</button>
                    <button onclick="exportRunAsPDF()" class="btn-choice p-2 rounded-lg text-sm">Exporter PDF</button>
                    <button onclick="resetToCreation()" class="btn-choice p-2 rounded-lg text-sm col-span-2">Nouvelle Partie</button>
                </div>
            </aside>

            <!-- Zone Narrative et Choix -->
            <main class="lg:col-span-2">
                <div class="bg-gray-800 p-6 rounded-lg">
                    <p class="text-base leading-relaxed whitespace-pre-line">${currentScene.text}</p>
                </div>

                <div class="mt-6">
                    <h3 class="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-2">Actions</h3>
                    ${choicesHTML || '<p class="text-gray-400">Fin de la scène. Veuillez continuer ou recharger la partie.</p>'}
                </div>
            </main>
        </div>
    `;
}

export function renderCombatScreen() {
    const combat = gameState.combatState;
    if (!combat) return;

    const enemy = ENEMY_TYPES[combat.enemyType];
    const manteAttack = MANTE_SPECIAL_ATTACKS[gameState.manteType];
    const logHTML = gameState.log.slice(-10).map(msg => `<p class="text-xs text-gray-400">${msg}</p>`).reverse().join('');

    gameView.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Panneau de Statistiques (Similaire à GameUI) -->
            <aside class="lg:col-span-1 bg-gray-800 p-4 rounded-lg">
                <h2 class="text-xl font-bold mb-3 text-white">COMBAT | Mante ${gameState.manteType}</h2>
                
                ${renderHPBar('PV Pilote', gameState.pilotHP, 100, 'bg-red-500')}
                ${renderHPBar('PV Mante', gameState.manteHP, gameState.pilotStats.Force * 10, 'bg-green-500')}

                <div class="mt-6">
                    <h3 class="text-lg font-semibold mb-2 text-white">Journal des Opérations</h3>
                    <div id="log-display" class="h-40 overflow-y-auto space-y-1 p-2 bg-gray-900 rounded text-xs">
                        ${logHTML}
                    </div>
                </div>
            </aside>
            
            <!-- Zone de Combat -->
            <main class="lg:col-span-2">
                <div class="bg-gray-800 p-6 rounded-lg text-center">
                    <h3 class="text-2xl font-bold text-red-400">${enemy.name}</h3>
                    <p class="text-gray-400 mb-4">${enemy.description}</p>
                    
                    ${renderHPBar('PV ENNEMI', combat.enemyHP, combat.enemyMaxHP, 'bg-purple-500')}
                    
                    <h4 class="text-xl font-semibold mt-6 mb-3 text-white border-b border-gray-700 pb-2">Choisissez votre action</h4>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <button onclick="handleCombatChoice('ATTACK_BASE')" class="btn-primary p-4 rounded-lg font-bold">
                            Attaque Standard (QI de Combat)
                        </button>
                        
                        <button onclick="handleCombatChoice('ATTACK_SPECIAL')" class="btn-choice p-4 rounded-lg font-bold bg-yellow-900/40 border-yellow-500 text-yellow-300 hover:bg-yellow-900/60">
                            ${manteAttack.name} (${manteAttack.stat})
                            <span class="text-xs block font-normal mt-1 text-gray-400">${manteAttack.desc}</span>
                        </button>
                        
                        <button onclick="handleCombatChoice('DEFEND')" class="btn-choice p-4 rounded-lg">
                            Défense (Réduit les dégâts entrants)
                        </button>
                        
                        <button onclick="handleCombatChoice('SCAN')" class="btn-choice p-4 rounded-lg">
                            Scan (Analyse l'ennemi)
                        </button>
                    </div>
                </div>
            </main>
        </div>
    `;
}

export function markdownTableToHtml(markdownTable) {
    if (!markdownTable) return '';

    // Nettoyage et préparation des lignes (ignore les séparateurs Markdown comme |:---|)
    const lines = markdownTable.trim().split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('|') && !line.match(/^\|:?-+:?\|/));

    if (lines.length < 1) return ''; // Nécessite au moins l'en-tête

    const header = lines[0].split('|').slice(1, -1).map(h => h.trim());
    const data = lines.slice(1).map(line => line.split('|').slice(1, -1).map(d => d.trim()));

    let html = '<table class="w-full text-sm mt-4 border border-gray-700 rounded-lg overflow-hidden">';

    // Header
    html += '<thead class="bg-gray-700">';
    html += '<tr>';
    header.forEach(h => {
        html += `<th class="p-3 text-left font-bold text-green-400">${h}</th>`;
    });
    html += '</tr>';
    html += '</thead>';

    // Body
    html += '<tbody class="divide-y divide-gray-700">';
    data.forEach(row => {
        html += '<tr class="hover:bg-gray-700/50 transition duration-150">';
        row.forEach((cell, index) => {
            let classAttr = 'p-3 whitespace-pre-line';
            // Mettre en gras les noms d'ECA
            if (index === 0) {
                classAttr += ' font-bold text-white';
            }
            // Mettre en évidence les avantages
            if (index === 2) {
                classAttr += ' text-green-300';
            }
            // Enlève les balises LaTeX des cellules
            const cellContent = cell.replace(/\$/g, '').replace(/\\times/g, 'x');

            html += `<td class="${classAttr}">${cellContent}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';
    html += '</table>';

    return html;
}

export function renderCreationScreen() {
    let optionsHTML = '';

    // Total de points actuel (doit commencer à 7)
    const initialStats = Object.values(PILOT_BASE_STATS).reduce((a, b) => a + b, 0);
    const statKeys = Object.keys(PILOT_BASE_STATS);

    for (const [key, mante] of Object.entries(MANTES)) {
        optionsHTML += `
            <div class="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-500 transition cursor-pointer" 
                 onclick="applyRecommendedDistribution('${key}')">
                <h3 class="font-bold text-lg text-green-400">${key}</h3>
                <p class="text-sm text-gray-400">${mante.description}</p>
            </div>
        `;
    }

    // HTML pour la distribution des points
    let distributionHTML = statKeys.map(stat => `
        <div class="flex items-center justify-between p-2 border-b border-gray-700 last:border-b-0">
            <label class="text-sm font-semibold text-white">${stat.replace(/_/g, ' ')}:</label>
            <input type="number" data-stat="${stat}" min="${PILOT_BASE_MIN}" max="18" value="${PILOT_BASE_MIN}"
                   oninput="updatePoolDisplay()"
                   class="w-16 p-1 rounded bg-gray-700 text-center border-none focus:ring-green-500 focus:border-green-500" />
        </div>
    `).join('');


    gameView.innerHTML = `
        <div class="max-w-3xl mx-auto space-y-6">
            <h2 class="text-2xl font-bold text-center">Création de Personnage</h2>
            <p class="text-center text-xs uppercase tracking-widest text-gray-400">DISTRIBUTION STATS (${POOL_TOTAL} points)</p>
            
            <div class="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p class="text-sm leading-relaxed whitespace-pre-line">${SCENES.CREATION.text}</p>
            </div>
            
            <!-- SECTION 1: Nom et Type de Mante -->
            <input type="text" id="player_name" placeholder="Nom de Code / Surnom (Ex: 'Ghost')"
                   class="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-green-500 focus:border-green-500" />
            
            <input type="hidden" id="mante_type" value="Phalange" />
            
            <h3 class="font-semibold text-lg text-white mt-4 border-b border-gray-700 pb-2">1. Distribution des ${POOL_TOTAL} Points</h3>
            
            <div id="stat_distribution" class="bg-gray-800 p-4 rounded-lg border border-gray-700 grid grid-cols-2 gap-4">
                ${distributionHTML}
            </div>
            
            <div class="bg-gray-800 p-4 rounded-lg border border-green-500/50">
                <h3 class="font-semibold text-lg">Répartition Totale: <span id="pool_current">${initialStats}</span> / ${POOL_TOTAL}</h3>
                <p class="text-sm text-gray-300">Points à distribuer restants : <span id="pool_remaining" class="text-green-400">${DISTRIBUTION_POOL}</span></p>
                <p id="points_error" class="text-sm text-red-400 mt-1 hidden">Veuillez ajuster les points pour atteindre exactement ${POOL_TOTAL}.</p>
            </div>

            <h3 class="font-semibold text-lg text-white mt-4 border-b border-gray-700 pb-2">2. Choisissez le Modèle Mante (Recommandations)</h3>
            <div class="grid grid-cols-2 gap-4">
                ${optionsHTML}
            </div>
            
            <!-- SECTION 3: Action -->
            <div class="flex gap-4">
                <button id="start_game_button" onclick="startGame(document.getElementById('mante_type').value || 'Phalange', document.getElementById('player_name').value || 'Inconnu')"
                        class="btn-primary flex-1 p-3 rounded-lg font-bold disabled:opacity-50" disabled>
                    Commencer la Campagne
                </button>
                <button onclick="loadGameLocal()" class="btn-choice flex-1 p-3 rounded-lg font-bold">
                    Charger la Dernière Partie
                </button>
            </div>
        </div>
    `;

    // Fonction utilitaire locale pour la gestion des points
    window.updatePoolDisplay = () => {
        let currentSum = 0;
        const inputs = document.querySelectorAll('#stat_distribution input[data-stat]');

        inputs.forEach(input => {
            // Assurer que la valeur reste dans les bornes et est un nombre
            let value = parseInt(input.value) || PILOT_BASE_MIN;
            value = Math.max(PILOT_BASE_MIN, Math.min(18, value)); // Max 18 défini précédemment
            input.value = value;
            currentSum += value;
        });

        const remaining = POOL_TOTAL - currentSum;
        const remainingEl = document.getElementById('pool_remaining');
        const currentSumEl = document.getElementById('pool_current');
        const errorEl = document.getElementById('points_error');
        const startBtn = document.getElementById('start_game_button');

        remainingEl.textContent = remaining;
        currentSumEl.textContent = currentSum;

        // Gérer les couleurs et le bouton Démarrer
        if (remaining === 0) {
            remainingEl.classList.remove('text-red-500', 'text-yellow-500');
            remainingEl.classList.add('text-green-400');
            errorEl.classList.add('hidden');
            startBtn.disabled = false;
        } else {
            remainingEl.classList.remove('text-green-400');
            startBtn.disabled = true;
            errorEl.classList.remove('hidden');
            if (remaining < 0) {
                remainingEl.classList.add('text-red-500');
            } else {
                remainingEl.classList.remove('text-red-500');
                remainingEl.classList.add('text-yellow-500');
            }
        }
    };

    window.applyRecommendedDistribution = (type) => {
        const distribution = MANTES[type].baseStats;
        document.getElementById('mante_type').value = type;

        Object.keys(distribution).forEach(stat => {
            const input = document.querySelector(`#stat_distribution input[data-stat="${stat}"]`);
            if (input) {
                input.value = distribution[stat];
            }
        });
        updatePoolDisplay();
    };

    // Appliquer la distribution par défaut (Phalange) au chargement
    window.applyRecommendedDistribution('Phalange');
}

export function renderGameOver() {
    const finalScene = SCENES[gameState.currentScene];
    let endingText = finalScene.text;
    let color = "text-yellow-500";

    if (gameState.gameStatus === "ENDED_SUCCESS") {
        color = "text-green-500";
    } else if (gameState.pilotHP <= 0 || gameState.manteHP <= 0) {
        color = "text-red-500";
        endingText = SCENES['GAME_OVER'].text + "\n\n" + endingText;
    }


    gameView.innerHTML = `
        <div class="max-w-xl mx-auto text-center space-y-6 p-8 bg-gray-800 rounded-xl">
            <h2 class="text-3xl font-bold ${color}">MISSION TERMINÉE (STATUT : ${gameState.gameStatus})</h2>
            <p class="text-base leading-relaxed whitespace-pre-line">${endingText}</p>
            <p class="text-lg font-semibold mt-4">Statut Final de l'Escouade ${gameState.name} (${gameState.manteType}) :</p>
            <p class="text-sm">Progression : ${gameState.progress}%</p>
            <p class="text-sm">PV Pilote : ${Math.max(0, gameState.pilotHP)} / PV Mante : ${Math.max(0, gameState.manteHP)}</p>
            <p class="text-sm">Réputation Aetheria : ${gameState.reputation.Aetheria}</p>
            <div class="grid grid-cols-2 gap-2 mt-6">
                <button onclick="saveGameLocal()" class="btn-primary p-3 rounded-lg font-bold">Sauvegarde Finale</button>
                <button onclick="exportRunAsJSON()" class="btn-choice p-3 rounded-lg font-bold">Exporter JSON</button>
                <button onclick="exportRunAsPDF()" class="btn-choice p-3 rounded-lg font-bold col-span-2">Exporter PDF</button>
            </div>
            <button onclick="resetToCreation()" class="btn-primary w-full p-3 rounded-lg font-bold mt-4">Recommencer une Nouvelle Partie</button>
        </div>
    `;
}

// --- RENDU DU LORE AU DÉBUT ---

export function renderLoreIntro() {
    const loreScene = SCENES['LORE_INTRO'];

    // Séparer le texte narratif du tableau Markdown
    const [narrative, tableMarkdown] = loreScene.text.split("TABLE_ECA_START");
    const tableHTML = markdownTableToHtml(tableMarkdown);

    gameView.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            <h2 class="text-3xl font-bold text-center text-green-400">DOSSIER MANTLE : LE CYCLE DE PROMÉTHÉE</h2>
            <p class="text-center text-xs uppercase tracking-widest text-gray-500">Confidentiel, Accès Opérateur</p>

            <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <p class="text-base leading-relaxed whitespace-pre-line mb-6">${narrative.trim()}</p>
                
                <h3 class="text-xl font-semibold mb-2 text-white border-b border-gray-700 pb-2">Composition des Escouades ECA (Mantes)</h3>
                ${tableHTML}
            </div>

            <div class="flex justify-center">
                <button onclick="handleChoiceWrapper('LORE_INTRO', 0)"
                        class="btn-primary p-4 rounded-lg font-bold text-lg hover:ring-2 ring-green-500">
                    Commencer la Création de Personnage
                </button>
            </div>
        </div>
    `;
}


export function renderScene(sceneKey) {
    gameState.currentScene = sceneKey;

    if (sceneKey === "LORE_INTRO") {
        renderLoreIntro();
    } else if (sceneKey === "CREATION") {
        renderCreationScreen();
    } else if (sceneKey.startsWith("ENDING") || sceneKey === "GAME_OVER") {
        renderGameOver();
        saveGameLocal(); // Sauvegarder la fin
    } else if (sceneKey === "COMBAT") {
        renderCombatScreen();
    } else {
        renderGameUI();
    }
}

// --- Fonctions d'Export ---
function buildRunSummary() {
    const lines = [];
    lines.push(`Joueur: ${gameState.name}`);
    lines.push(`Mante: ${gameState.manteType}`);
    lines.push('--- Statistiques de Base du Pilote ---');
    lines.push(`Force: ${gameState.pilotStats.Force}, Agilité: ${gameState.pilotStats.Agilité}, Vitesse: ${gameState.pilotStats.Vitesse}`);
    lines.push(`Intelligence: ${gameState.pilotStats.Intelligence}, Lucidité: ${gameState.pilotStats.Lucidité}, QI de Combat: ${gameState.pilotStats.QI_de_Combat}, Synchronisation: ${gameState.pilotStats.Synchronisation}`);
    lines.push('--- Statistiques Effectives ---');
    lines.push(`Force: ${gameState.effectiveStats.Force}, Agilité: ${gameState.effectiveStats.Agilité}, Vitesse: ${gameState.effectiveStats.Vitesse} (x10)`);
    lines.push(`Intelligence: ${gameState.effectiveStats.Intelligence}, Lucidité: ${gameState.effectiveStats.Lucidité}, QI de Combat: ${gameState.effectiveStats.QI_de_Combat}, Synchronisation: ${gameState.effectiveStats.Synchronisation}`);
    lines.push(`PV Pilote: ${Math.max(0, gameState.pilotHP)} / PV Mante: ${Math.max(0, gameState.manteHP)}`);
    lines.push(`Réputation: CEL ${gameState.reputation.CEL}, FEU ${gameState.reputation.FEU}, Aetheria ${gameState.reputation.Aetheria}`);
    lines.push(`Progression: ${gameState.progress}%`);
    lines.push(`Scène Courante: ${gameState.currentScene}`);
    lines.push('--- Journal (du plus récent au plus ancien) ---');
    const logLines = [...gameState.log].slice(-50).reverse();
    lines.push(...logLines);
    return lines.join('\n');
}

export function exportRunAsJSON() {
    const data = {
        timestamp: new Date().toISOString(),
        gameState
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mantle_run_${gameState.name || 'inconnu'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    updateLog('[Système] Exportation JSON réussie.');
}

export async function exportRunAsPDF() {
    try {
        const { jsPDF } = await import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
        const doc = new jsPDF();
        const text = buildRunSummary();
        const margin = 10;
        const maxWidth = 190;
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, margin, margin);
        doc.save(`mantle_run_${gameState.name || 'inconnu'}.pdf`);
        updateLog('[Système] Exportation PDF réussie.');
    } catch (error) {
        console.error('Erreur export PDF:', error);
        updateLog('[Erreur] Échec de l\'exportation PDF. Veuillez vérifier la console.');
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(`<pre>${buildRunSummary().replace(/</g, '&lt;')}</pre>`);
            w.document.close();
            w.focus();
            w.print();
        }
    }
}
