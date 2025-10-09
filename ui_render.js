import { gameState, SCENES, filterChoicesByRequirements, resetToCreation, saveGameLocal, loadGameLocal, startGame, handleCombatChoice } from './game_logic.js';
// CORRECTION : Importation des constantes depuis le fichier centralisé `models.js`.
import { MANTES, PILOT_BASE_STATS, POOL_TOTAL, DISTRIBUTION_POOL, ENEMY_TYPES, MANTE_SPECIAL_ATTACKS } from './models.js';

const gameView = document.getElementById('game-view');

// --- Fonctions d'Affichage ---

// Met à jour le journal des opérations.
export function updateLog(message) {
    gameState.log.push(message);
    if (gameState.log.length > 50) {
        gameState.log.shift(); // Limite la taille du log pour éviter les problèmes de performance
    }
    const logEl = document.getElementById('log-display');
    if (logEl) {
        logEl.innerHTML = gameState.log.slice(-10).map(msg => `<p class="text-xs text-gray-400">${msg}</p>`).reverse().join('');
    }
}

// Génère le HTML pour une barre de statistique.
function renderStatBar(stat, value, color) {
    const isPhysical = ['Force', 'Agilité', 'Vitesse'].includes(stat);
    const displayValue = isPhysical ? value / 10 : value; // Affiche la stat pilote pour les stats physiques
    const max = 20; // Max visuel pour la barre
    const percentage = Math.min(displayValue, max) / max * 100;

    return `
        <div class="mb-2">
            <div class="flex justify-between text-sm font-semibold">
                <span>${stat.replace(/_/g, ' ')}</span>
                <span>${displayValue} <span class="text-gray-400">(${value})</span></span>
            </div>
            <div class="stat-bar-bg h-2 rounded-full mt-1">
                <div class="${color} h-2 rounded-full" style="width: ${percentage}%;"></div>
            </div>
        </div>
    `;
}

// Génère le HTML pour une barre de points de vie.
function renderHPBar(label, currentHP, maxHP, colorClass) {
    const percentage = maxHP > 0 ? (currentHP / maxHP) * 100 : 0;
    const displayHP = Math.max(0, Math.round(currentHP));
    const isCritical = displayHP <= (maxHP * 0.2);

    return `
        <div class="mb-3">
            <div class="flex justify-between text-sm font-semibold text-white">
                <span>${label}</span>
                <span class="${isCritical ? 'text-red-400 font-extrabold animate-pulse' : 'text-green-400'}">${displayHP} / ${maxHP} PV</span>
            </div>
            <div class="stat-bar-bg h-3 rounded-full mt-1">
                <div class="h-3 rounded-full ${colorClass} transition-all duration-500" style="width: ${percentage}%;"></div>
            </div>
        </div>
    `;
}

// --- Rendu des Écrans Principaux ---

// Affiche l'interface de jeu principale (narration et choix).
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
    let sceneChoices = currentScene[`choices_${gameState.manteType}`] || currentScene.choices;

    // Filtre les choix en fonction des prérequis du joueur
    const availableChoices = filterChoicesByRequirements(sceneChoices);
    
    // Génère le HTML pour les boutons de choix
    const choicesHTML = availableChoices.map(choice => {
        // Trouve l'index original du choix pour le passer à la fonction handleChoice
        const originalIndex = sceneChoices.findIndex(c => c.text === choice.text);
        if (originalIndex === -1) return ''; // Sécurité

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
            <button onclick="handleChoice('${gameState.currentScene}', ${originalIndex})"
                    class="${buttonClass} w-full text-left p-3 rounded-lg mt-3 text-sm" ${isLocked ? 'disabled' : ''}>
                ${buttonText}
            </button>
        `;
    }).join('');

    gameView.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Panneau de Statistiques et Log -->
            <aside class="lg:col-span-1 bg-gray-800 p-4 rounded-lg sticky top-0">
                <h2 class="text-xl font-bold mb-3 text-white">${gameState.name || 'Opérateur'} | Mante ${gameState.manteType}</h2>
                
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
                    <button onclick="saveGameLocal()" class="btn-primary p-2 rounded-lg text-sm">Sauvegarde</button>
                    <button onclick="loadGameLocal()" class="btn-choice p-2 rounded-lg text-sm">Charger</button>
                    <button onclick="exportRunAsJSON()" class="btn-choice p-2 rounded-lg text-sm">Exporter JSON</button>
                    <button onclick="exportRunAsPDF()" class="btn-choice p-2 rounded-lg text-sm">Exporter PDF</button>
                    <button onclick="resetToCreation()" class="btn-choice p-2 rounded-lg text-sm col-span-2 bg-red-900/40 border-red-500 text-red-300">Nouvelle Partie</button>
                </div>
            </aside>

            <!-- Zone Narrative et Choix -->
            <main class="lg:col-span-2">
                <div class="bg-gray-800 p-6 rounded-lg">
                    <p class="text-base leading-relaxed whitespace-pre-line">${currentScene.text}</p>
                </div>

                <div class="mt-6">
                    <h3 class="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-2">Actions</h3>
                    ${choicesHTML || '<p class="text-gray-400">Fin de la scène.</p>'}
                </div>
            </main>
        </div>
    `;
}

// Affiche l'écran de combat.
export function renderCombatScreen() {
    const combat = gameState.combatState;
    if (!combat) return;

    const enemy = ENEMY_TYPES[combat.enemyType];
    const manteAttack = MANTE_SPECIAL_ATTACKS[gameState.manteType];
    const logHTML = gameState.log.slice(-10).map(msg => `<p class="text-xs text-gray-400">${msg}</p>`).reverse().join('');

    gameView.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            
            <main class="lg:col-span-2">
                <div class="bg-gray-800 p-6 rounded-lg text-center">
                    <h3 class="text-2xl font-bold text-red-400">${enemy.name}</h3>
                    <p class="text-gray-400 mb-4">${enemy.description}</p>
                    
                    ${renderHPBar('PV ENNEMI', combat.enemyHP, combat.enemyMaxHP, 'bg-purple-500')}
                    
                    <h4 class="text-xl font-semibold mt-6 mb-3 text-white border-b border-gray-700 pb-2">Actions de Combat</h4>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <button onclick="handleCombatChoice('ATTACK_BASE')" class="btn-primary p-4 rounded-lg font-bold">Attaque Standard</button>
                        <button onclick="handleCombatChoice('ATTACK_SPECIAL')" class="btn-choice p-4 rounded-lg font-bold bg-yellow-900/40 border-yellow-500 text-yellow-300 hover:bg-yellow-900/60">
                            ${manteAttack.name} (${manteAttack.stat})
                            <span class="text-xs block font-normal mt-1 text-gray-400">${manteAttack.desc}</span>
                        </button>
                        <button onclick="handleCombatChoice('DEFEND')" class="btn-choice p-4 rounded-lg">Défense</button>
                        <button onclick="handleCombatChoice('SCAN')" class="btn-choice p-4 rounded-lg">Scan</button>
                    </div>
                </div>
            </main>
        </div>
    `;
}

// Affiche l'écran de création de personnage.
export function renderCreationScreen() {
    const initialStats = Object.values(PILOT_BASE_STATS).reduce((a, b) => a + b, 0);
    const statKeys = Object.keys(PILOT_BASE_STATS);

    const optionsHTML = Object.entries(MANTES).map(([key, mante]) => `
        <div class="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-500 transition cursor-pointer" 
             onclick="applyRecommendedDistribution('${key}')">
            <h3 class="font-bold text-lg text-green-400">${key}</h3>
            <p class="text-sm text-gray-400">${mante.description}</p>
        </div>
    `).join('');

    const distributionHTML = statKeys.map(stat => `
        <div class="flex items-center justify-between p-2 border-b border-gray-700 last:border-b-0">
            <label class="text-sm font-semibold text-white">${stat.replace(/_/g, ' ')}:</label>
            <input type="number" data-stat="${stat}" min="${PILOT_BASE_STATS[stat]}" max="18" value="${PILOT_BASE_STATS[stat]}"
                   oninput="updatePoolDisplay()"
                   class="w-16 p-1 rounded bg-gray-700 text-center border-none focus:ring-green-500 focus:border-green-500" />
        </div>
    `).join('');

    gameView.innerHTML = `
        <div class="max-w-3xl mx-auto space-y-6">
            <h2 class="text-2xl font-bold text-center">Création de Personnage</h2>
            
            <div class="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p class="text-sm leading-relaxed whitespace-pre-line">${SCENES.CREATION.text}</p>
            </div>
            
            <input type="text" id="player_name" placeholder="Nom de Code (Ex: 'Ghost')"
                   class="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-green-500" />
            
            <input type="hidden" id="mante_type" value="Phalange" />
            
            <h3 class="font-semibold text-lg text-white mt-4 border-b border-gray-700 pb-2">1. Distribution des ${POOL_TOTAL} Points</h3>
            <div id="stat_distribution" class="bg-gray-800 p-4 rounded-lg border border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${distributionHTML}
            </div>
            
            <div class="bg-gray-800 p-4 rounded-lg border border-green-500/50">
                <h3>Total: <span id="pool_current">${initialStats}</span> / ${POOL_TOTAL}</h3>
                <p class="text-sm text-gray-300">Points restants : <span id="pool_remaining" class="font-bold text-green-400">${DISTRIBUTION_POOL}</span></p>
                <p id="points_error" class="text-sm text-red-400 mt-1 hidden">Le total doit être exactement de ${POOL_TOTAL}.</p>
            </div>

            <h3 class="font-semibold text-lg text-white mt-4 border-b border-gray-700 pb-2">2. Choix du Modèle Mante (Recommandations)</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${optionsHTML}
            </div>
            
            <div class="flex flex-col sm:flex-row gap-4">
                <button id="start_game_button" onclick="startGame(document.getElementById('mante_type').value, document.getElementById('player_name').value || 'Inconnu')"
                        class="btn-primary flex-1 p-3 rounded-lg font-bold disabled:opacity-50" disabled>
                    Commencer la Campagne
                </button>
                <button onclick="loadGameLocal()" class="btn-choice flex-1 p-3 rounded-lg font-bold">
                    Charger une Partie
                </button>
            </div>
        </div>
    `;

    // Fonctions locales pour la gestion de la création
    window.updatePoolDisplay = () => {
        let currentSum = 0;
        const inputs = document.querySelectorAll('#stat_distribution input[data-stat]');
        inputs.forEach(input => {
            let value = parseInt(input.value) || PILOT_BASE_STATS[input.dataset.stat];
            value = Math.max(PILOT_BASE_STATS[input.dataset.stat], Math.min(18, value));
            input.value = value;
            currentSum += value;
        });

        const remaining = POOL_TOTAL - currentSum;
        document.getElementById('pool_remaining').textContent = remaining;
        document.getElementById('pool_current').textContent = currentSum;

        const startBtn = document.getElementById('start_game_button');
        const errorEl = document.getElementById('points_error');
        if (currentSum === POOL_TOTAL) {
            startBtn.disabled = false;
            errorEl.classList.add('hidden');
            document.getElementById('pool_remaining').parentElement.classList.remove('text-red-400');
        } else {
            startBtn.disabled = true;
            errorEl.classList.remove('hidden');
            document.getElementById('pool_remaining').parentElement.classList.add('text-red-400');
        }
    };

    window.applyRecommendedDistribution = (type) => {
        const distribution = MANTES[type].baseStats;
        document.getElementById('mante_type').value = type;
        Object.keys(distribution).forEach(stat => {
            const input = document.querySelector(`#stat_distribution input[data-stat="${stat}"]`);
            if (input) input.value = distribution[stat];
        });
        updatePoolDisplay();
    };
    
    // Appliquer la distribution par défaut au chargement
    applyRecommendedDistribution('Phalange');
}

// Affiche l'écran de fin de partie.
export function renderGameOver() {
    const finalScene = SCENES[gameState.currentScene] || SCENES['GAME_OVER'];
    let color = "text-yellow-500";
    if (gameState.gameStatus === "ENDED_SUCCESS") {
        color = "text-green-500";
    } else if (gameState.pilotHP <= 0 || gameState.manteHP <= 0) {
        color = "text-red-500";
    }

    gameView.innerHTML = `
        <div class="max-w-xl mx-auto text-center space-y-6 p-8 bg-gray-800 rounded-xl">
            <h2 class="text-3xl font-bold ${color}">FIN DE LA MISSION (STATUT : ${gameState.gameStatus})</h2>
            <p class="text-base leading-relaxed whitespace-pre-line">${finalScene.text}</p>
            <div class="grid grid-cols-2 gap-2 mt-6">
                <button onclick="saveGameLocal()" class="btn-primary p-3 rounded-lg font-bold">Sauvegarde Finale</button>
                <button onclick="exportRunAsJSON()" class="btn-choice p-3 rounded-lg font-bold">Exporter JSON</button>
                <button onclick="exportRunAsPDF()" class="btn-choice p-3 rounded-lg font-bold col-span-2">Exporter PDF</button>
            </div>
            <button onclick="resetToCreation()" class="btn-primary w-full p-3 rounded-lg font-bold mt-4">Recommencer</button>
        </div>
    `;
}

// Affiche l'introduction narrative.
export function renderLoreIntro() {
    const loreScene = SCENES['LORE_INTRO'];
    gameView.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <p class="text-base leading-relaxed whitespace-pre-line mb-6">${loreScene.text}</p>
            </div>
            <div class="flex justify-center">
                <button onclick="handleChoice('LORE_INTRO', 0)"
                        class="btn-primary p-4 rounded-lg font-bold text-lg hover:ring-2 ring-green-500">
                    Commencer la Création
                </button>
            </div>
        </div>
    `;
}


// Aiguilleur principal pour le rendu des scènes.
export function renderScene(sceneKey) {
    gameState.currentScene = sceneKey;

    if (sceneKey === "LORE_INTRO") {
        renderLoreIntro();
    } else if (sceneKey === "CREATION") {
        renderCreationScreen();
    } else if (gameState.gameStatus.startsWith("ENDED") || sceneKey === "GAME_OVER") {
        renderGameOver();
        saveGameLocal(); // Sauvegarde automatique à la fin
    } else if (sceneKey === "COMBAT") {
        renderCombatScreen();
    } else {
        renderGameUI();
    }
}
-

function buildRunSummary() {
    return `
Joueur: ${gameState.name} | Mante: ${gameState.manteType}
--- STATS PILOTE ---
Force: ${gameState.pilotStats.Force}, Agilité: ${gameState.pilotStats.Agilité}, Vitesse: ${gameState.pilotStats.Vitesse}
Intelligence: ${gameState.pilotStats.Intelligence}, Lucidité: ${gameState.pilotStats.Lucidité}, QI de Combat: ${gameState.pilotStats.QI_de_Combat}, Synchro: ${gameState.pilotStats.Synchronisation}
--- STATS EFFECTIVES ---
Force: ${gameState.effectiveStats.Force}, Agilité: ${gameState.effectiveStats.Agilité}, Vitesse: ${gameState.effectiveStats.Vitesse}
--- STATUT ---
PV Pilote: ${Math.max(0, gameState.pilotHP)} / PV Mante: ${Math.max(0, gameState.manteHP)}
Réputation: CEL ${gameState.reputation.CEL}, FEU ${gameState.reputation.FEU}, Aetheria ${gameState.reputation.Aetheria}
Progression: ${gameState.progress}% | Scène: ${gameState.currentScene}
--- JOURNAL ---
${[...gameState.log].slice(-50).reverse().join('\n')}
    `.trim();
}

export function exportRunAsJSON() {
    const data = { timestamp: new Date().toISOString(), gameState };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mantle_run_${gameState.name || 'partie'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    updateLog('[Système] Exportation JSON réussie.');
}

export async function exportRunAsPDF() {
    try {
        const { jsPDF } = await import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
        const doc = new jsPDF();
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        const text = buildRunSummary();
        const margin = 10;
        const maxWidth = 190;
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, margin, margin);
        doc.save(`mantle_run_${gameState.name || 'partie'}.pdf`);
        updateLog('[Système] Exportation PDF réussie.');
    } catch (error) {
        console.error('Erreur export PDF:', error);
        updateLog('[Erreur] Échec de l\'exportation PDF. Un aperçu va s\'ouvrir pour impression.');
        // Solution de secours si l'import échoue (ex: bloqueurs de pub)
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(`<pre>${buildRunSummary().replace(/</g, '&lt;')}</pre>`);
            w.document.close();
            w.focus();
        }
    }
}
