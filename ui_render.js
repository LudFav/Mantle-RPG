import { gameState, SCENES, checkSkill, filterChoicesByRequirements, resetToCreation, saveGameLocal, loadGameLocal, startGame, handleCombatChoice } from './game_logic.js';
import { MANTES, PILOT_BASE_STATS, POOL_TOTAL, DISTRIBUTION_POOL, ENEMY_TYPES } from './models.js';

const gameView = document.getElementById('game-view');
const PILOT_BASE_MIN = 1;

function renderStatBar(stat, value) {
    const checkValue = ['Force', 'Agilité', 'Vitesse'].includes(stat) ? value / 10 : value;
    const max = 10;
    const percentage = Math.min(checkValue, max) / max * 100;
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

function renderHealthBar(name, currentHP, maxHP, isPilot = false) {
    const percentage = (currentHP / maxHP) * 100;
    const color = isPilot ? (percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500') : (percentage > 50 ? 'bg-green-600' : percentage > 20 ? 'bg-yellow-600' : 'bg-red-600');
    const displayColor = isPilot ? 'text-white' : 'text-gray-300';
    const displayMaxHP = isPilot ? 100 : maxHP;
    return `
        <div class="mb-2">
            <div class="flex justify-between text-sm font-semibold ${displayColor}">
                <span>${name} (${isPilot ? 'Pilote' : 'Armure'})</span>
                <span>${currentHP} / ${displayMaxHP} PV</span>
            </div>
            <div class="stat-bar-bg h-3 rounded-full mt-1">
                <div class="${color} h-3 rounded-full transition-all duration-500" style="width: ${percentage}%;"></div>
            </div>
        </div>
    `;
}

function markdownTableToHtml(markdown) {
    const lines = markdown.trim().split('\n');
    if (lines.length < 2) return '';
    const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
    const bodyLines = lines.slice(2);
    let html = '<table class="w-full text-sm text-left border-collapse">';
    html += '<thead class="bg-gray-700 text-green-400">';
    html += '<tr>' + headers.map(h => `<th class="p-2 border border-gray-600">${h}</th>`).join('') + '</tr>';
    html += '</thead>';
    html += '<tbody>';
    bodyLines.forEach((line, index) => {
        const cells = line.split('|').map(c => c.trim()).filter(c => c);
        const rowClass = index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900';
        html += `<tr class="${rowClass}">`;
        html += cells.map(c => `<td class="p-2 border border-gray-600 whitespace-pre-line">${c}</td>`).join('');
        html += '</tr>';
    });
    html += '</tbody>';
    html += '</table>';
    return html;
}

export function updateLog(message) {
    gameState.log.push(message);
    if (gameState.log.length > 50) { // Limiter à 50
        gameState.log.shift();
    }
    if (gameState.currentScene !== "CREATION" && gameState.currentScene !== "LORE_INTRO") {
        renderGameUI();
    }
}

export function renderGameUI() {
    if (gameState.combatState) {
        renderCombatScreen();
        return;
    }
    const statsHTML = Object.entries(gameState.pilotStats).map(([stat, value]) => renderStatBar(stat, gameState.effectiveStats[stat])).join('');
    const pilotHPBar = renderHealthBar("Pilote", gameState.pilotHP, 100, true);
    const manteHPBar = renderHealthBar(gameState.manteType, gameState.manteHP, gameState.pilotStats.Force * 10);
    const logHTML = gameState.log.map(msg => `<p class="text-xs text-gray-400">${msg}</p>`).reverse().join('');
    const currentScene = SCENES[gameState.currentScene];
    let sceneChoices = currentScene[`choices_${gameState.manteType}`] || currentScene.choices;
    const availableChoices = filterChoicesByRequirements(sceneChoices);
    const choicesHTML = (availableChoices || []).map((choice, index) => {
        let text = choice.text;
        let buttonClass = "btn-choice hover:ring-blue-500/50";
        let disabled = false;
        if (choice.disabledReason) {
            text += ` <span class="text-red-500/70 text-xs">${choice.disabledReason}</span>`;
            buttonClass += " opacity-50 cursor-not-allowed";
            disabled = true;
        }
        if (text.startsWith('[AVANTAGE/DETERMINANT]')) {
            buttonClass = "btn-primary ring-2 ring-blue-500/80 bg-blue-800 hover:bg-blue-700";
            text = text.replace('[AVANTAGE/DETERMINANT]', '<span class="text-blue-400 font-bold">[DÉTERMINANT]</span>');
        } else if (text.startsWith('[DIFFICILE/CRITIQUE]')) {
            buttonClass = "btn-primary ring-2 ring-red-500/80 bg-red-800 hover:bg-red-700";
            text = text.replace('[DIFFICILE/CRITIQUE]', '<span class="text-red-400 font-bold">[CRITIQUE]</span>');
        }
        return `
            <button onclick="${disabled ? '' : `handleChoiceWrapper('${gameState.currentScene}', ${sceneChoices.findIndex(c => c.text === choice.text)})`}"
                    class="${buttonClass} w-full text-left p-3 rounded-lg mt-3 text-sm"
                    ${disabled ? 'disabled' : ''}>
                ${text}
            </button>
        `;
    }).join('');

    gameView.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Panneau de Statistiques et Log -->
            <aside class="lg:col-span-1 bg-gray-800 p-4 rounded-lg">
                <h2 class="text-xl font-bold mb-3 text-white">${gameState.name} | Mante ${gameState.manteType}</h2>
                <div class="border-b border-gray-700 pb-3 mb-3">
                    <h3 class="text-md font-semibold mb-2 text-red-400">État : ${gameState.manteHP > 0 ? 'Opérationnel' : 'Hors service'}</h3>
                    ${pilotHPBar}
                    ${manteHPBar}
                </div>
                <div class="border-b border-gray-700 pb-3 mb-3">
                    <h3 class="text-md font-semibold mb-2 text-yellow-400">Statistiques Pilote (Check/Effectif)</h3>
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
                    ${choicesHTML || '<p class="text-gray-400">Fin de la scène ou action en cours. Cliquez sur Continuer si disponible.</p>'}
                </div>
            </main>
        </div>
    `;
    const logDisplay = document.getElementById('log-display');
    if (logDisplay) {
        logDisplay.scrollTop = 0; // Afficher les messages les plus récents en haut
    }
}

export function renderCombatScreen() {
    const combat = gameState.combatState;
    const enemy = gameState.combatState ? ENEMY_TYPES[gameState.combatState.enemyType] : null;
    if (!enemy || !combat) {
        renderGameUI(); // Revenir à l'UI normale si l'état est incohérent
        return;
    }
    const manteAttack = MANTE_SPECIAL_ATTACKS[gameState.manteType];
    const pilotHPBar = renderHealthBar("Pilote", gameState.pilotHP, 100, true);
    const manteHPBar = renderHealthBar(gameState.manteType, gameState.manteHP, gameState.pilotStats.Force * 10);
    const enemyHPBar = renderHealthBar(enemy.name, combat.enemyHP, combat.enemyMaxHP);
    const logHTML = gameState.log.map(msg => `<p class="text-xs text-gray-400">${msg}</p>`).reverse().join('');
    gameView.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Panneau de Statistiques (Similaire à UI normale) -->
            <aside class="lg:col-span-1 bg-gray-800 p-4 rounded-lg">
                <h2 class="text-2xl font-bold mb-3 text-red-400">COMBAT ACTIF</h2>
                <div class="border-b border-gray-700 pb-3 mb-3">
                    ${pilotHPBar}
                    ${manteHPBar}
                </div>
                <h3 class="text-lg font-semibold mt-4 mb-2 text-white">Journal de Combat</h3>
                <div id="log-display" class="h-64 overflow-y-auto space-y-1 p-2 bg-gray-900 rounded text-xs">
                    ${logHTML}
                </div>
                <button onclick="saveGameLocal()" class="btn-primary w-full p-2 rounded-lg text-sm mt-4">Sauvegarder l'État</button>
            </aside>
            <!-- Zone de Combat -->
            <main class="lg:col-span-2 flex flex-col justify-between">
                <div class="bg-gray-800 p-6 rounded-lg mb-4">
                    <h3 class="text-xl font-bold text-center mb-3 text-red-500">Menace : ${enemy.name}</h3>
                    ${enemyHPBar}
                    <p class="text-sm mt-4 text-center">${enemy.description}</p>
                </div>

                <div class="mt-4">
                    <h3 class="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-2">Actions de Combat</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="handleCombatChoice('ATTACK_BASE')" class="btn-primary p-3 rounded-lg font-bold bg-green-600 hover:bg-green-500">
                            Attaque Standard (Jet QI de Combat)
                        </button>
                        <button onclick="handleCombatChoice('ATTACK_SPECIAL')" class="btn-primary p-3 rounded-lg font-bold bg-purple-600 hover:bg-purple-500">
                            ${manteAttack.name} (Spécial ${manteAttack.stat})
                        </button>
                        <button onclick="handleCombatChoice('DEFEND')" class="btn-choice p-3 rounded-lg">
                            Défense (Réduit dégâts ennemis)
                        </button>
                        <button onclick="handleCombatChoice('SCAN')" class="btn-choice p-3 rounded-lg">
                            Scan (Infos / Pas de riposte)
                        </button>
                    </div>
                </div>
            </main>
        </div>
    `;
    const logDisplay = document.getElementById('log-display');
    if (logDisplay) {
        logDisplay.scrollTop = 0;
    }
}

export function renderCreationScreen() {
    let optionsHTML = '';
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

    let distributionHTML = statKeys.map(stat => `
        <div class="flex items-center justify-between p-2 border-b border-gray-700 last:border-b-0">
            <label class="text-sm font-semibold text-white">${stat}</label>
            <input type="number" data-stat="${stat}" min="${PILOT_BASE_MIN}" max="18" value="${PILOT_BASE_MIN}"
                   oninput="updatePoolDisplay()"
                   class="w-16 p-1 rounded bg-gray-700 text-center border-none focus:ring-green-500 focus:border-green-500" />
        </div>
    `).join('');

    gameView.innerHTML = `
        <div class="max-w-xl mx-auto space-y-6">
            <h2 class="text-2xl font-bold text-center">Création de Personnage</h2>
            <div class="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p class="text-sm leading-relaxed whitespace-pre-line">${SCENES.CREATION.text}</p>
            </div>
            <input type="text" id="player_name" placeholder="Nom de Code / Surnom (Ex: 'Ghost')"
                   class="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-green-500 focus:border-green-500" >            
            <input type="hidden" id="mante_type" value="Phalange" />
            <h3 class="font-semibold text-lg text-white mt-4 border-b border-gray-700 pb-2">1. Distribution des Points (${POOL_TOTAL} Total)</h3>
            <div id="stat_distribution" class="bg-gray-800 p-4 rounded-lg border border-green-500/50">
                <p class="text-center font-bold mb-3">Points Restants : <span id="pool_remaining" class="text-green-400">${DISTRIBUTION_POOL}</span></p>
                ${distributionHTML}
            </div>
            <h3 class="font-semibold text-lg text-white mt-4 border-b border-gray-700 pb-2">2. Choisissez le Modèle Mante (Recommandations)</h3>
            <div class="grid grid-cols-2 gap-4">
                ${optionsHTML}
            </div>
            <div class="flex gap-4">
                <button onclick="startGame(document.getElementById('mante_type').value || 'Phalange', document.getElementById('player_name').value || 'Inconnu')"
                        class="btn-primary flex-1 p-3 rounded-lg font-bold">
                    Commencer la Campagne
                </button>
                <button onclick="loadGameLocal()" class="btn-choice flex-1 p-3 rounded-lg font-bold">
                    Charger la Dernière Partie
                </button>
            </div>
        </div>
    `;

    window.applyRecommendedDistribution = (type) => {
        const distribution = MANTES[type].pilotDistribution;
        document.getElementById('mante_type').value = type;
        Object.keys(distribution).forEach(stat => {
            const input = document.querySelector(`input[data-stat="${stat}"]`);
            if (input) {
                input.value = distribution[stat];
            }
        });
        updatePoolDisplay();
    };

    window.updatePoolDisplay = () => {
        let currentSum = 0;
        const inputs = document.querySelectorAll('#stat_distribution input[data-stat]');
        inputs.forEach(input => {
            currentSum += parseInt(input.value) || PILOT_BASE_MIN;
            // Assurer que la valeur reste dans les bornes
            input.value = Math.max(PILOT_BASE_MIN, Math.min(18, parseInt(input.value) || PILOT_BASE_MIN));
        });
        const remaining = POOL_TOTAL - currentSum;
        const remainingEl = document.getElementById('pool_remaining');
        remainingEl.textContent = remaining;
        if (currentSum > POOL_TOTAL) {
            remainingEl.classList.remove('text-green-400', 'text-yellow-500');
            remainingEl.classList.add('text-red-500');
        } else if (currentSum < POOL_TOTAL) {
            remainingEl.classList.remove('text-green-400', 'text-red-500');
            remainingEl.classList.add('text-yellow-500');
        } else {
            remainingEl.classList.remove('text-red-500', 'text-yellow-500');
            remainingEl.classList.add('text-green-400');
        }
    };
    window.applyRecommendedDistribution('Phalange');
    window.updatePoolDisplay();
}

export function renderGameOver() {
    let endingText = "";
    let color = "text-green-500";
    if (gameState.gameStatus === "ENDED_SUCCESS") {
        endingText = `Fin de Partie (Succès) : ${SCENES[gameState.currentScene].text}`;
        color = "text-green-500";
    } else {
        endingText = `Fin de Partie (Mise en Danger) : ${SCENES[gameState.currentScene].text}`;
        color = "text-yellow-500";
    }
    const finalQC = gameState.effectiveStats.QI_de_Combat || 'N/A';
    gameView.innerHTML = `
        <div class="max-w-xl mx-auto text-center space-y-6 p-8 bg-gray-800 rounded-xl">
            <h2 class="text-3xl font-bold ${color}">FIN DE MISSION</h2>
            <p class="text-base leading-relaxed whitespace-pre-line">${endingText}</p>
            <p class="text-lg font-semibold mt-4">Statut Final de l'Escouade ${gameState.name} (${gameState.manteType}) :</p>
            <p class="text-sm">Progression : ${gameState.progress}%</p>
            <p class="text-sm">QI de Combat Final : ${finalQC}</p>
            <div class="grid grid-cols-2 gap-2 mt-6">
                <button onclick="saveGameLocal()" class="btn-primary p-3 rounded-lg font-bold">Sauvegarde Locale</button>
                <button onclick="exportRunAsJSON()" class="btn-choice p-3 rounded-lg font-bold">Exporter JSON</button>
                <button onclick="exportRunAsPDF()" class="btn-choice p-3 rounded-lg font-bold col-span-2">Exporter PDF</button>
            </div>
            <button onclick="resetToCreation()" class="btn-primary w-full p-3 rounded-lg font-bold mt-4">Recommencer une Nouvelle Partie</button>
        </div>
    `;
}

export function renderLoreIntro() {
    const scene = SCENES.LORE_INTRO;
    const parts = scene.text.split("Type d'ECA");
    const narrativeText = parts[0];
    const tableMarkdown = "Type d'ECA" + parts[1];
    const tableHTML = markdownTableToHtml(tableMarkdown);
    gameView.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6 p-8 bg-gray-800 rounded-xl">
            <h2 class="text-3xl font-bold text-center text-green-400">DOSSIER MANTLE : LE CYCLE DE PROMÉTHÉE</h2>
            <p class="text-center text-xs uppercase tracking-widest text-gray-400">Confidentiel, Accès Opérateur</p>
            <div class="space-y-4">
                <p class="text-base leading-relaxed whitespace-pre-line">${narrativeText.trim()}</p>
            </div>

            <h3 class="text-xl font-semibold mt-6 mb-3 text-white">Composition des Escouades ECA (Mantes)</h3>
            <div class="overflow-x-auto">
                ${tableHTML}
            </div>

            <div class="mt-8 text-center">
                <button onclick="renderScene('CREATION')" class="btn-primary p-3 rounded-lg font-bold text-lg">
                    Commencer la Création de Personnage
                </button>
                <button onclick="loadGameLocal()" class="btn-choice p-3 rounded-lg font-bold text-lg ml-4">
                    Charger la Dernière Partie
                </button>
            </div>
        </div>
    `;
}
export function renderScene(sceneKey) {
    gameState.currentScene = sceneKey;
    if (sceneKey === "CREATION") {
        renderCreationScreen();
    } else if (sceneKey === "LORE_INTRO") {
        renderLoreIntro();
    } else if (sceneKey.startsWith("ENDING") || sceneKey === "GAME_OVER") {
        renderGameOver();
        saveGameLocal();
    } else {
        renderGameUI();
    }
}
