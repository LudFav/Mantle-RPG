import { SCENES_DATA } from './data/scenes_index.js'; // Correction du chemin
// Import des constantes des modèles pour l'initialisation (bien que les classes ne soient pas utilisées directement ici)
import { PILOT_BASE_MIN, POOL_TOTAL, MANTE_TYPES } from './models.js';

// Variables globales (fournies par l'environnement Canvas)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
let userId = null;
let authReady = false;

// --- DÉFINITIONS DU JEU ---

// Statistiques de base minimales du Pilote (7 stats, base 1)
const PILOT_BASE_STATS = { Force: PILOT_BASE_MIN, Agilité: PILOT_BASE_MIN, Vitesse: PILOT_BASE_MIN, Intelligence: PILOT_BASE_MIN, Lucidité: PILOT_BASE_MIN, QI_de_Combat: PILOT_BASE_MIN, Synchronisation: PILOT_BASE_MIN };
const BASE_STATS_TOTAL = Object.keys(PILOT_BASE_STATS).length * PILOT_BASE_MIN;
const DISTRIBUTION_POOL = POOL_TOTAL - BASE_STATS_TOTAL;

let gameState = {
    name: "",
    manteType: "",
    pilotStats: {}, // F, A, V, I, L, QC, S (valeurs de 1 à 10+)
    effectiveStats: {}, // F, A, V (*10), I, L, QC, S (directe) - utilisé pour l'affichage
    manteHP: { max: 0, current: 0 },
    pilotHP: { max: 0, current: 0 },
    reputation: { CEL: 5, FEU: 5, Aetheria: 0 },
    currentScene: "CREATION",
    log: [],
    progress: 0,
    gameStatus: "PLAYING"
};

// --- Initialisation et Construction des Scènes ---

// Applique les conséquences d'un objet de données au gameState
function applyConsequenceFromData(cons) {
    if (!cons) return;
    if (cons.reputation) {
        for (const k of Object.keys(cons.reputation)) {
            const delta = cons.reputation[k];
            gameState.reputation[k] = (gameState.reputation[k] || 0) + delta;
        }
    }
    if (cons.stats) {
        for (const k of Object.keys(cons.stats)) {
            const delta = cons.stats[k];
            if (gameState.pilotStats[k] !== undefined) {
                gameState.pilotStats[k] = Math.max(PILOT_BASE_MIN, gameState.pilotStats[k] + delta);
            }
        }
    }
    if (typeof cons.progress === 'number') {
        gameState.progress = cons.progress;
    }
    if (typeof cons.gameStatus === 'string') {
        gameState.gameStatus = cons.gameStatus;
    }
    if (typeof cons.damage === 'number') { // Dégâts à la Mante
        takeDamage(cons.damage, 0);
    }
    if (typeof cons.pilotDamage === 'number') { // Dégâts au Pilote
        takeDamage(0, cons.pilotDamage);
    }
    if (typeof cons.healMante === 'number') {
        gameState.manteHP.current = Math.min(gameState.manteHP.max, gameState.manteHP.current + cons.healMante);
        updateLog(`[Soin Mante] Armure réparée de ${cons.healMante} PV.`);
    }
    if (typeof cons.healPilot === 'number') {
        gameState.pilotHP.current = Math.min(gameState.pilotHP.max, gameState.pilotHP.current + cons.healPilot);
        updateLog(`[Soin Pilote] Pilote soigné de ${cons.healPilot} PV.`);
    }
}

// Transforme les données brutes des scènes en objets avec fonctions de conséquence
function buildScenes(data) {
    const scenes = {};
    for (const [key, value] of Object.entries(data)) {
        scenes[key] = {
            text: value.text || '',
            choices: value.choices || [],
            choices_Phalange: value.choices_Phalange,
            choices_Aiguille: value.choices_Aiguille,
            choices_Éclair: value.choices_Éclair,
            choices_Omni: value.choices_Omni,
            check: value.check,
            combatCheck: value.combatCheck, // Ajout pour le combatCheck
            renderFn: value.renderFn,
            consequence: value.consequence
                ? () => applyConsequenceFromData(value.consequence)
                : undefined
        };
    }
    if (scenes.CREATION) scenes.CREATION.renderFn = renderCreationScreen;
    if (scenes.GAME_OVER) scenes.GAME_OVER.renderFn = renderGameOver;
    return scenes;
}

const SCENES = buildScenes(SCENES_DATA);

// --- Sauvegarde Locale (LocalStorage) ---

function getLocalStorageKey() {
    const uid = userId || 'local';
    return `mantle_save_${appId}_${uid}`;
}

function saveGameLocal() {
    try {
        localStorage.setItem(getLocalStorageKey(), JSON.stringify(gameState));
        updateLog(`[Système] Partie sauvegardée en local à ${new Date().toLocaleTimeString()}.`);
    } catch (error) {
        console.error('Erreur sauvegarde locale:', error);
    }
}

function loadGameLocal() {
    try {
        const raw = localStorage.getItem(getLocalStorageKey());
        if (!raw) {
            updateLog('[Système] Aucune sauvegarde locale trouvée. Démarrage de la création de personnage.');
            renderScene('CREATION');
            return;
        }
        const loaded = JSON.parse(raw);
        Object.assign(gameState, loaded);

        calculateEffectiveStats();

        updateLog(`[Système] Partie locale chargée. Bienvenue, ${gameState.name} (${gameState.manteType}).`);
        renderScene(gameState.currentScene);
    } catch (error) {
        console.error('Erreur chargement local:', error);
        renderScene('CREATION');
    }
}

function saveGame() { saveGameLocal(); }
function loadGame() { loadGameLocal(); }

function resetToCreation() {
    try { localStorage.removeItem(getLocalStorageKey()); } catch (_) { }
    gameState.name = '';
    gameState.manteType = '';
    gameState.pilotStats = {};
    gameState.effectiveStats = {};
    gameState.manteHP = { max: 0, current: 0 };
    gameState.pilotHP = { max: 0, current: 0 };
    gameState.reputation = { CEL: 5, FEU: 5, Aetheria: 0 };
    gameState.log = [];
    gameState.progress = 0;
    gameState.gameStatus = 'PLAYING';
    renderScene('CREATION');
}

// --- Logique du Jeu ---

// Applique les dégâts à la Mante (priorité) puis au Pilote (si l'armure cède)
function takeDamage(manteDamage, pilotDamage) {
    let damageTaken = false;

    if (manteDamage > 0) {
        // La Mante absorbe les dégâts. Si les PV descendent sous zéro, le reste est transféré au Pilote.
        const remainingDamage = Math.max(0, manteDamage - gameState.manteHP.current);
        gameState.manteHP.current = Math.max(0, gameState.manteHP.current - manteDamage);
        damageTaken = true;

        if (remainingDamage > 0) {
            pilotDamage += remainingDamage;
            updateLog(`[Dégâts Mante] Armure brisée! ${remainingDamage} PV transférés au Pilote.`);
        } else {
            updateLog(`[Dégâts Mante] Armure frappée pour ${manteDamage} PV. PV restants: ${gameState.manteHP.current}.`);
        }
    }

    if (pilotDamage > 0) {
        gameState.pilotHP.current = Math.max(0, gameState.pilotHP.current - pilotDamage);
        damageTaken = true;
        updateLog(`[Dégâts Pilote] Pilote frappé pour ${pilotDamage} PV. PV restants: ${gameState.pilotHP.current}.`);
    }

    if (gameState.pilotHP.current <= 0) {
        renderScene("ENDING_DEFEAT_PILOT");
        return true;
    }
    if (gameState.manteHP.current <= 0 && gameState.pilotHP.current > 0) {
        renderScene("ENDING_DEFEAT_MANTE");
        return true;
    }
    return false;
}

// Calcule les 7 stats effectives (Physiques x10, Mentales x1)
function calculateEffectiveStats() {
    if (!gameState.manteType || Object.keys(gameState.pilotStats).length === 0) return;

    // Remplacement de "QI de Combat" par "QI_de_Combat"
    gameState.effectiveStats.Intelligence = gameState.pilotStats.Intelligence;
    gameState.effectiveStats.Lucidité = gameState.pilotStats.Lucidité;
    gameState.effectiveStats.QI_de_Combat = gameState.pilotStats.QI_de_Combat;
    gameState.effectiveStats.Synchronisation = gameState.pilotStats.Synchronisation;

    // Stats physiques (F, A, V) multipliées par 10
    gameState.effectiveStats.Force = gameState.pilotStats.Force * 10;
    gameState.effectiveStats.Agilité = gameState.pilotStats.Agilité * 10;
    gameState.effectiveStats.Vitesse = gameState.pilotStats.Vitesse * 10;
}

function newGame(manteType, name) {
    const inputs = document.querySelectorAll('#stat_distribution input[data-stat]');
    let stats = {};
    let currentSum = 0;

    inputs.forEach(input => {
        const statName = input.dataset.stat;
        const value = parseInt(input.value) || PILOT_BASE_MIN;
        stats[statName] = value;
        currentSum += value;
    });

    if (currentSum !== POOL_TOTAL) {
        updateLog(`[Erreur] Veuillez distribuer exactement ${POOL_TOTAL} points. Total actuel : ${currentSum}.`);
        return;
    }

    gameState.name = name;
    gameState.manteType = manteType;

    gameState.pilotStats = stats;

    // Initialisation des PV basé sur la Force du Pilote (modèle: Force x 100)
    const pilotForce = stats.Force;
    gameState.manteHP = {
        max: pilotForce * 100,
        current: pilotForce * 100
    };
    gameState.pilotHP = {
        max: 150,
        current: 150
    };

    calculateEffectiveStats();

    const effStats = gameState.effectiveStats;

    gameState.reputation = { CEL: 5, FEU: 5, Aetheria: 0 };

    // Remplacement de "QI de Combat" par "QI_de_Combat" dans le log
    gameState.log = [
        `[Départ] ${name} a choisi l'ECA Mante ${manteType}.`,
        `[Pilote Base] F:${stats.Force}, A:${stats.Agilité}, V:${stats.Vitesse}, I:${stats.Intelligence}, L:${stats.Lucidité}, QC:${stats.QI_de_Combat}, S:${stats.Synchronisation}.`,
        `[Mante Effective] F:${effStats.Force}, A:${effStats.Agilité}, V:${effStats.Vitesse}. PV Mante: ${gameState.manteHP.max}.`
    ];
    gameState.currentScene = "ACT_1_KAIROK_INTRO";
    gameState.progress = 0;
    gameState.gameStatus = "PLAYING";

    saveGame();
    renderScene("ACT_1_KAIROK_INTRO");
}

function updateLog(message) {
    gameState.log.push(message);
    if (gameState.log.length > 10) {
        gameState.log.shift();
    }
    renderGameUI();
}

function checkSkill(stat, difficulty) {
    // Utilise la stat non-amplifiée du pilote pour le D20 check
    const statValue = gameState.pilotStats[stat];

    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + statValue;

    const message = `[CHECK] ${stat} (Valeur: ${statValue} + D20 Jet: ${roll}) vs Diff: ${difficulty}. Total: ${total}.`;
    updateLog(message);

    return total >= difficulty;
}

// Résout une action de combat (décisive dans le cadre de ce JDR textuel)
function resolveCombatCheck(sceneCheck, successScene, failureScene) {
    const enemyName = sceneCheck.enemyName || "Mante Ennemie";
    const stat = sceneCheck.stat;
    const difficulty = sceneCheck.difficulty;
    const playerDamageOnSuccess = sceneCheck.playerDamageOnSuccess || 100;
    const enemyDamageOnFailure = sceneCheck.enemyDamageOnFailure || 150;

    const statValue = gameState.pilotStats[stat];
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + statValue;

    updateLog(`[COMBAT CHECK] Attaque tactique contre ${enemyName}. Jet de ${stat} (${statValue} + D20 Jet: ${roll}) vs Diff: ${difficulty}. Total: ${total}.`);

    if (total >= difficulty) {
        // SUCCÈS
        updateLog(`[Victoire Tactique] Succès! Votre manœuvre déchire l'armure de l'ennemi. (Dégâts infligés théoriques: ${playerDamageOnSuccess} PV). L'ennemi est neutralisé.`);
        renderScene(successScene);
    } else {
        // ÉCHEC - L'ennemi riposte
        updateLog(`[RIPOSTE ENNEMIE] Échec. ${enemyName} exécute une riposte violente. L'armure Mante subit ${enemyDamageOnFailure} dégâts.`);
        if (takeDamage(enemyDamageOnFailure, 0)) {
            return; // Game Over
        }
        renderScene(failureScene);
    }
}

function handleChoice(sceneKey, choiceIndex) {
    const currentScene = SCENES[sceneKey];

    let sceneChoices = currentScene.choices;
    if (gameState.manteType) {
        // Utilise la version spécifique à la Mante si elle existe
        sceneChoices = currentScene[`choices_${gameState.manteType}`] || currentScene.choices;
    }

    // Filtrer les choix verrouillés avant de prendre la décision
    const filteredChoices = sceneChoices.map(choice => {
        if (choice.requirements) {
            for (const [stat, reqValue] of Object.entries(choice.requirements)) {
                if ((gameState.pilotStats[stat] || 0) < reqValue) {
                    return { locked: true };
                }
            }
        }
        return choice;
    }).filter(choice => !choice.locked);

    // Ajustement de l'index pour le choix réel (si l'UI a envoyé l'index dans le tableau non filtré)
    // Ici on suppose que l'index reçu correspond au tableau filtré (l'UI ne doit pas afficher les boutons verrouillés comme cliquables)
    // Nous allons utiliser l'index dans le tableau affiché (filtré)

    const choice = filteredChoices[choiceIndex]; // Note: ceci est une simplification

    if (!choice || choice.locked) {
        updateLog('[Erreur Système] Tentative d\'accéder à une option verrouillée ou invalide.');
        return;
    }

    const nextSceneKey = choice.next;

    // Handle Consequence from the CHOICE itself (before moving)
    if (choice.consequence) {
        applyConsequenceFromData(choice.consequence);
        calculateEffectiveStats();
    }

    // Nouveau: Gestion du COMBAT_CHECK
    if (choice.combatCheck) {
        resolveCombatCheck(
            choice.combatCheck,
            choice.combatCheck.success,
            choice.combatCheck.failure
        );
        saveGame();
        return;
    }

    const scene = SCENES[nextSceneKey];

    // Gérer les vérifications de compétences simples
    if (scene.check) {
        const success = checkSkill(scene.check.stat, scene.check.difficulty);

        if (success) {
            updateLog(`[Résultat] Succès du jet de ${scene.check.stat}! L'action est fluide.`);
            renderScene(scene.check.success);
        } else {
            // J'ajoute des dégâts légers en cas d'échec de check simple pour plus d'impact
            updateLog(`[Résultat] Échec du jet de ${scene.check.stat}. Manœuvre avortée, légère répercussion (Dégâts Mante: 50).`);
            if (!takeDamage(50, 0)) {
                renderScene(scene.check.failure);
            }
        }
        saveGame();
        return;
    }

    // Gérer les conséquences de la scène simple (si la scène en a)
    if (scene.consequence) {
        scene.consequence();
        calculateEffectiveStats();
    }

    // Si la scène suivante n'est pas une fin de partie par dégât
    if (gameState.gameStatus === "PLAYING") {
        renderScene(nextSceneKey);
        saveGame();
    }
}

// --- Fonctions de Rendu (UI) ---

const gameView = document.getElementById('game-view');

function renderHPBar(label, current, max, colorClass) {
    const percentage = max > 0 ? Math.min(current, max) / max * 100 : 0;
    const textColor = current <= (max * 0.25) ? 'text-red-400' : 'text-white';
    return `
        <div class="mb-2">
            <div class="flex justify-between text-sm font-semibold">
                <span>${label}</span>
                <span class="${textColor}">${current} / ${max} PV</span>
            </div>
            <div class="stat-bar-bg h-2 rounded-full mt-1">
                <div class="${colorClass} h-2 rounded-full transition-all duration-300" style="width: ${percentage}%;"></div>
            </div>
        </div>
    `;
}

function renderStatBar(stat, value) {
    // Utilise la valeur non multipliée (pour le D20 check)
    const checkValue = gameState.pilotStats[stat];
    const effectiveValue = value; // Valeur affichée (x10 pour F,A,V)
    const max = 10; // Maximum visuel pour le Pilote
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

    const displayValue = ['Force', 'Agilité', 'Vitesse'].includes(stat)
        ? `${checkValue} <span class="text-gray-400">(${effectiveValue})</span>`
        : checkValue;

    return `
        <div class="mb-2">
            <div class="flex justify-between text-sm font-semibold">
                <span>${stat.replace('_', ' ')}</span>
                <span>${displayValue}</span>
            </div>
            <div class="stat-bar-bg h-2 rounded-full mt-1">
                <div class="${color} h-2 rounded-full" style="width: ${percentage}%;"></div>
            </div>
        </div>
    `;
}

function renderGameUI() {
    const statsHTML = Object.entries(gameState.effectiveStats).map(([stat, value]) => renderStatBar(stat, value)).join('');
    const logHTML = gameState.log.map(msg => `<p class="text-xs text-gray-400">${msg}</p>`).reverse().join('');

    const currentScene = SCENES[gameState.currentScene];

    let sceneChoices = currentScene.choices;
    if (gameState.manteType) {
        sceneChoices = currentScene[`choices_${gameState.manteType}`] || currentScene.choices;
    }

    // Fonction de filtrage pour les options verrouillées (affichage et logique)
    const filterChoicesForUI = (choices) => {
        return choices.map(choice => {
            if (choice.requirements) {
                for (const [stat, reqValue] of Object.entries(choice.requirements)) {
                    if ((gameState.pilotStats[stat] || 0) < reqValue) {
                        return {
                            text: `${choice.text} [VERROUILLÉ] (Req: ${stat.replace('_', ' ')} ${reqValue} / Actuel: ${gameState.pilotStats[stat] || 0})`,
                            locked: true,
                            next: ''
                        };
                    }
                }
            }
            return choice;
        });
    };

    const choicesForUI = filterChoicesForUI(sceneChoices || []);

    // L'index dans choicesForUI est l'index dans le tableau généré par map, qui est celui que l'onclick utilise.
    const choicesHTML = choicesForUI.map((choice, index) => {
        if (choice.locked) {
            return `<button class="btn-locked w-full text-left p-3 rounded-lg mt-3 text-sm bg-gray-700 text-gray-500 cursor-not-allowed">${choice.text}</button>`;
        }
        return `
            <button onclick="handleChoiceWrapper('${gameState.currentScene}', ${index})"
                    class="btn-choice w-full text-left p-3 rounded-lg mt-3 text-sm hover:ring-2 ring-green-500/50">
                ${choice.text}
            </button>
        `;
    }).join('');

    const hpMante = gameState.manteHP || { current: 0, max: 0 };
    const hpPilot = gameState.pilotHP || { current: 0, max: 0 };
    const hpHTML = renderHPBar('Armure Mante (PV)', hpMante.current, hpMante.max, 'bg-red-600') +
        renderHPBar('Pilote (PV)', hpPilot.current, hpPilot.max, 'bg-cyan-500');

    gameView.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Panneau de Statistiques et Log -->
            <aside class="lg:col-span-1 bg-gray-800 p-4 rounded-lg">
                <h2 class="text-xl font-bold mb-3 text-white">${gameState.name} | Mante ${gameState.manteType}</h2>
                
                <h3 class="text-md font-semibold mb-2 text-red-400">Statut (PV)</h3>
                <div class="border-b border-gray-700 pb-3 mb-3">
                    ${hpHTML}
                </div>
                
                <h3 class="text-md font-semibold mb-2 text-yellow-400">Statistiques de Jet (D20 + Stat)</h3>
                <p class="text-xs text-gray-400 mb-2">Physique: Valeur de jet / (Valeur amplifiée x10)</p>
                <div class="border-b border-gray-700 pb-3 mb-3">
                    ${statsHTML}
                </div>
                
                <h3 class="text-lg font-semibold mb-2 text-green-400">Réputation (Max 10)</h3>
                <p class="text-sm">CEL: ${gameState.reputation.CEL} / FEU: ${gameState.reputation.FEU} / Aetheria: ${gameState.reputation.Aetheria}</p>
                
                <h3 class="text-lg font-semibold mt-4 mb-2 text-white">Journal des Opérations</h3>
                <div class="h-40 overflow-y-auto space-y-1 p-2 bg-gray-900 rounded text-xs">
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
                    ${choicesHTML || '<p class="text-gray-400">Fin de la scène. Veuillez recharger la partie si le jeu n\'a pas pris fin.</p>'}
                </div>
            </main>
        </div>
    `;
}

function renderCreationScreen() {
    let optionsHTML = '';
    const statKeys = Object.keys(PILOT_BASE_STATS);

    for (const [key, mante] of Object.entries(MANTE_TYPES)) {
        optionsHTML += `
            <div class="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-500 transition cursor-pointer" 
                 onclick="applyRecommendedDistribution('${key}')">
                <h3 class="font-bold text-lg text-green-400">${key}</h3>
                <p class="text-sm text-gray-400">${mante.description}</p>
            </div>
        `;
    }

    // Remplacement de "QI de Combat" par "QI_de_Combat" dans l'UI
    let distributionHTML = statKeys.map(stat => `
        <div class="flex items-center justify-between p-2 border-b border-gray-700 last:border-b-0">
            <label class="text-sm font-semibold text-white">${stat.replace('_', ' ')}</label>
            <input type="number" data-stat="${stat}" min="1" max="18" value="1"
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
                   class="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-green-500 focus:border-green-500" />
            
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
                <button onclick="newGame(document.getElementById('mante_type').value || 'Phalange', document.getElementById('player_name').value || 'Inconnu')"
                        class="btn-primary flex-1 p-3 rounded-lg font-bold">
                    Commencer la Campagne
                </button>
                <button onclick="loadGame()" class="btn-choice flex-1 p-3 rounded-lg font-bold">
                    Charger la Dernière Partie
                </button>
            </div>
        </div>
    `;

    // Logic for distribution update (uses MANTE_TYPES)
    window.applyRecommendedDistribution = (type) => {
        const distribution = MANTE_TYPES[type].pilotDistribution;
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
            input.value = Math.max(PILOT_BASE_MIN, parseInt(input.value) || PILOT_BASE_MIN);
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

    const initialManteType = 'Phalange';
    window.applyRecommendedDistribution(initialManteType);
    window.updatePoolDisplay();
}

function renderGameOver() {
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

function renderScene(sceneKey) {
    gameState.currentScene = sceneKey;

    if (sceneKey === "CREATION") {
        renderCreationScreen();
    } else if (sceneKey.startsWith("ENDING")) {
        renderGameOver();
        saveGame();
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
    lines.push(`PV Mante: ${gameState.manteHP.current}/${gameState.manteHP.max} | PV Pilote: ${gameState.pilotHP.current}/${gameState.pilotHP.max}`);
    lines.push(`Réputation: CEL ${gameState.reputation.CEL}, FEU ${gameState.reputation.FEU}, Aetheria ${gameState.reputation.Aetheria}`);
    lines.push(`Progression: ${gameState.progress}%`);
    lines.push(`Scène Courante: ${gameState.currentScene}`);
    lines.push('--- Journal (du plus récent au plus ancien) ---');
    const logLines = [...gameState.log].slice(-50).reverse();
    lines.push(...logLines);
    return lines.join('\n');
}

function exportRunAsJSON() {
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
}

async function exportRunAsPDF() {
    try {
        const { jsPDF } = await import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
        const doc = new jsPDF();
        const text = buildRunSummary();
        const margin = 10;
        const maxWidth = 190;
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, margin, margin);
        doc.save(`mantle_run_${gameState.name || 'inconnu'}.pdf`);
    } catch (error) {
        console.error('Erreur export PDF:', error);
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(`<pre>${buildRunSummary().replace(/</g, '&lt;')}</pre>`);
            w.document.close();
            w.focus();
            w.print();
        }
    }
}

// --- Initialisation ---

window.handleChoiceWrapper = (sceneKey, choiceIndex) => {
    handleChoice(sceneKey, choiceIndex);
};
window.newGame = newGame;
window.loadGame = loadGame;
window.saveGameLocal = saveGameLocal;
window.loadGameLocal = loadGameLocal;
window.exportRunAsJSON = exportRunAsJSON;
window.exportRunAsPDF = exportRunAsPDF;
window.renderScene = renderScene;
window.resetToCreation = resetToCreation;

authReady = true;
userId = crypto.randomUUID();
loadGameLocal();
