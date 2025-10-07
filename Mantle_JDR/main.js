import { SCENES_DATA } from './data/scenes_index.js'; // Chemin correct, assuming data/ is a subdirectory

// Variables globales (fournies par l'environnement Canvas)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
let userId = null;
let authReady = false;

// --- DÉFINITIONS DU JEU ---

// Statistiques de base minimales du Pilote (7 stats, base 1)
const PILOT_BASE_MIN = 1;
// CORRECTION: Changement de 'QI de Combat' à 'QI_de_Combat' pour éviter les erreurs de clé d'objet
const PILOT_BASE_STATS = { Force: PILOT_BASE_MIN, Agilité: PILOT_BASE_MIN, Vitesse: PILOT_BASE_MIN, Intelligence: PILOT_BASE_MIN, Lucidité: PILOT_BASE_MIN, QI_de_Combat: PILOT_BASE_MIN, Synchronisation: PILOT_BASE_MIN };

// Total de points à distribuer
const POOL_TOTAL = 35; // Augmenté à 35
const BASE_STATS_TOTAL = Object.keys(PILOT_BASE_STATS).length * PILOT_BASE_MIN; // 7 * 1 = 7
const DISTRIBUTION_POOL = POOL_TOTAL - BASE_STATS_TOTAL; // 35 - 7 = 28 points à répartir

// MANTES : Distribution recommandée des 35 points (F, A, V, I, L, QC, S)
const MANTES = {
    Phalange: {
        // La somme de ces valeurs fait 35
        pilotDistribution: { Force: 9, Agilité: 3, Vitesse: 3, Intelligence: 6, Lucidité: 6, QI_de_Combat: 5, Synchronisation: 3 }, 
        description: "Assaut Lourd. Haute résistance. Mante optimisée pour l'impact et la tactique."
    },
    Aiguille: {
        pilotDistribution: { Force: 4, Agilité: 9, Vitesse: 5, Intelligence: 7, Lucidité: 7, QI_de_Combat: 2, Synchronisation: 1 }, 
        description: "Reconnaissance et CQC. Maîtrise du mouvement et analyse. Mante agile."
    },
    Éclair: {
        pilotDistribution: { Force: 4, Agilité: 4, Vitesse: 9, Intelligence: 6, Lucidité: 4, QI_de_Combat: 4, Synchronisation: 4 }, 
        description: "Interception Rapide. Évitement extrême. Mante optimisée pour la vitesse."
    },
    Omni: {
        pilotDistribution: { Force: 5, Agilité: 5, Vitesse: 5, Intelligence: 6, Lucidité: 5, QI_de_Combat: 5, Synchronisation: 4 }, 
        description: "Soutien et Commandement. Profil équilibré, excellente adaptabilité. Mante Polyvalente."
    }
};


let gameState = {
    name: "",
    manteType: "",
    pilotStats: {}, // F, A, V, I, L, QC, S (valeurs de 1 à 18)
    effectiveStats: {}, // F, A, V (*10), I, L, QC, S (directe) - utilisé pour les checks et l'affichage
    reputation: { CEL: 5, FEU: 5, Aetheria: 0 },
    currentScene: "CREATION",
    log: [],
    progress: 0,
    gameStatus: "PLAYING",
    // Ajout des PV pour le Pilote et l'Armure
    pilotHP: 50,
    pilotMaxHP: 50,
    manteHP: 0, // Initialisé dans newGame
    manteMaxHP: 0,
    // Pour gérer les conséquences de succès/échec de la vague 1
    lastCheckSuccess: false,
};

// --- Initialisation et Construction des Scènes ---

// Applique les conséquences d'un objet de données au gameState
function applyConsequenceFromData(cons) {
    if (!cons) return;
    if (cons.reputation) {
        for (const k of Object.keys(cons.reputation)) {
            const delta = cons.reputation[k];
            gameState.reputation[k] = Math.max(0, Math.min(10, (gameState.reputation[k] || 0) + delta)); // Limite de 0 à 10
        }
    }
    if (cons.stats) {
        // Applique la conséquence sur les 7 stats du pilote
        for (const k of Object.keys(cons.stats)) {
            const delta = cons.stats[k];
            if (gameState.pilotStats[k] !== undefined) {
                // Application de la modification, limitée par le max et le min
                gameState.pilotStats[k] = Math.max(PILOT_BASE_MIN, Math.min(18, gameState.pilotStats[k] + delta)); 
            }
        }
    }
    
    // Gestion des PV (ManteHP et PilotHP)
    if (cons.ManteHP !== undefined) {
        gameState.manteHP = Math.min(gameState.manteMaxHP, gameState.manteHP + cons.ManteHP);
        gameState.manteHP = Math.max(0, gameState.manteHP);
    }
    if (cons.PilotHP !== undefined) {
        gameState.pilotHP = Math.min(gameState.pilotMaxHP, gameState.pilotHP + cons.PilotHP);
        gameState.pilotHP = Math.max(0, gameState.pilotHP);
        if (gameState.pilotHP <= 0) {
            renderScene('GAME_OVER'); // Fin du jeu si le Pilote meurt
            return;
        }
    }

    // Gestion du statut de succès de la dernière action (pour les choix dynamiques)
    if (cons.successStatus !== undefined) {
        gameState.lastCheckSuccess = cons.successStatus;
    }
    
    if (typeof cons.progress === 'number') {
        gameState.progress = cons.progress;
    }
    if (typeof cons.gameStatus === 'string') {
        gameState.gameStatus = cons.gameStatus;
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
            renderFn: value.renderFn,
            consequence: value.consequence 
                ? () => applyConsequenceFromData(value.consequence)
                : undefined
        };
    }
    // Injection des fonctions de rendu spéciales
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
        
        // Recalcul des stats effectives après chargement et des max PV
        calculateEffectiveStats(); 
        calculateMaxHP();

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
    gameState.reputation = { CEL: 5, FEU: 5, Aetheria: 0 };
    gameState.log = [];
    gameState.progress = 0;
    gameState.gameStatus = 'PLAYING';
    gameState.pilotHP = 50;
    gameState.pilotMaxHP = 50;
    gameState.manteHP = 0;
    gameState.manteMaxHP = 0;
    gameState.lastCheckSuccess = false;

    renderScene('CREATION');
}

// Calcule les PV Max de la Mante (basé sur la Force du Pilote * 20)
function calculateMaxHP() {
    // La Force est la stat principale de l'armure
    const pilotForce = gameState.pilotStats.Force || PILOT_BASE_MIN;
    gameState.manteMaxHP = pilotForce * 20;

    // Si on charge ou initialise, s'assurer que HP ne dépasse pas MaxHP
    gameState.manteHP = Math.min(gameState.manteMaxHP, gameState.manteHP);
    gameState.pilotHP = Math.min(gameState.pilotMaxHP, gameState.pilotHP);
}

// Calcule les 7 stats effectives (Physiques x10, Mentales x1)
function calculateEffectiveStats() {
    if (!gameState.manteType || Object.keys(gameState.pilotStats).length === 0) return;

    // Stats mentales (I, L, QC, S)
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
    
    // Calcul des stats effectives et PV Max
    calculateEffectiveStats();
    calculateMaxHP();
    
    // Initialiser les PV au Max
    gameState.pilotHP = gameState.pilotMaxHP;
    gameState.manteHP = gameState.manteMaxHP;

    const effStats = gameState.effectiveStats; // Pour le log
    
    gameState.reputation = { CEL: 5, FEU: 5, Aetheria: 0 };
    gameState.log = [
        `[Départ] ${name} a choisi l'ECA Mante ${manteType}.`,
        `[Pilote Base] F:${stats.Force}, A:${stats.Agilité}, V:${stats.Vitesse}, I:${stats.Intelligence}, L:${stats.Lucidité}, QC:${stats.QI_de_Combat}, S:${stats.Synchronisation}.`,
        `[Mante Effective] F:${effStats.Force}, A:${effStats.Agilité}, V:${effStats.Vitesse}.`
    ];
    gameState.currentScene = "ACT_1_KAIROK_INTRO";
    gameState.progress = 0;
    gameState.gameStatus = "PLAYING";
    gameState.lastCheckSuccess = false; // Réinitialiser le statut

    saveGame();
    renderScene("ACT_1_KAIROK_INTRO");
}

function updateLog(message) {
    gameState.log.push(message);
    // Limiter le log aux 50 derniers messages pour garder la taille raisonnable
    if (gameState.log.length > 50) {
        gameState.log.shift();
    }
    renderGameUI();
}

function checkSkill(stat, difficulty) {
    // Utilise la stat du Pilote (valeur non multipliée)
    const checkValue = gameState.pilotStats[stat];
    
    if (checkValue === undefined) {
        console.error(`Statistique '${stat}' non trouvée dans pilotStats.`);
        return false;
    }

    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + checkValue;

    const message = `[CHECK] ${stat} (Valeur: ${checkValue} + D20 Jet: ${roll}) vs Diff: ${difficulty}. Total: ${total}.`;
    updateLog(message);

    return total >= difficulty;
}

// Logique pour filtrer les choix basés sur les exigences de statistiques et les statuts
function filterChoicesByRequirements(scene, pilotStats, lastCheckSuccess) {
    let choices = scene.choices || [];
    
    // Ajout des choix spécifiques au type de Mante
    const manteChoices = scene[`choices_${gameState.manteType}`];
    if (manteChoices) {
        choices = manteChoices;
    }

    // Filtrer les choix selon les exigences minimales (requirements)
    choices = choices.filter(choice => {
        if (!choice.requirements) return true;
        
        for (const [stat, requiredValue] of Object.entries(choice.requirements)) {
            if (pilotStats[stat] < requiredValue) {
                // Stocker la raison du verrouillage pour l'affichage
                choice.lockedReason = `Req: ${stat.replace('_', ' ')} ${requiredValue} (Actuel: ${pilotStats[stat]})`;
                return false;
            }
        }
        return true;
    });

    // Ajouter les choix avantageux ou critiques basés sur le statut du check précédent
    if (scene.requirements_success && lastCheckSuccess) {
        choices = choices.concat(scene.requirements_success.map(c => ({...c, isDeterminant: true})));
    }
    if (scene.requirements_failure && !lastCheckSuccess && sceneKey !== "ACT_1_KAIROK_INTRO" && sceneKey !== "CREATION") {
        // Ne pas appliquer si l'échec est dans l'écran de création ou la première intro
        choices = choices.concat(scene.requirements_failure.map(c => ({...c, isCritique: true})));
    }

    return choices;
}

function handleChoice(sceneKey, choiceIndex) {
    const currentScene = SCENES[sceneKey];
    
    // On utilise la fonction de filtrage pour obtenir les choix réellement disponibles
    const availableChoices = filterChoicesByRequirements(currentScene, gameState.pilotStats, gameState.lastCheckSuccess);
    
    const choice = availableChoices[choiceIndex];
    if (!choice) {
        updateLog(`[Erreur] Choix invalide à la scène ${sceneKey}.`);
        return;
    }
    
    const nextSceneKey = choice.next;
    
    // Réinitialiser le statut de succès pour le check suivant (sauf si on est sur la scène de check elle-même)
    gameState.lastCheckSuccess = false;

    // Appliquer les conséquences du choix immédiatement
    if (choice.consequence) {
        applyConsequenceFromData(choice.consequence);
        calculateEffectiveStats();
    }
    
    const scene = SCENES[nextSceneKey];

    if (scene.check) {
        // Si c'est un COMBAT_CHECK, on utilise une logique de dégâts simplifiée
        if (scene.check.type === "COMBAT_CHECK") {
            // Le COMBAT_CHECK est ici utilisé comme un jet de dés pour déterminer le succès
            const success = checkSkill(scene.check.stat, scene.check.difficulty);
            
            if (success) {
                updateLog(`[Résultat] Succès du jet de ${scene.check.stat} ! Combat terminé.`);
                // Appliquer les dégâts 'réussite' avant de passer à la scène succès
                applyConsequenceFromData({ ManteHP: -scene.check.damageManteSuccess, PilotHP: -scene.check.damagePilotSuccess });
                renderScene(scene.check.success);
            } else {
                updateLog(`[Résultat] Échec du jet de ${scene.check.stat}. Combat perdu.`);
                // Appliquer les dégâts 'échec' avant de passer à la scène échec
                applyConsequenceFromData({ ManteHP: -scene.check.damageManteFailure, PilotHP: -scene.check.damagePilotFailure });
                renderScene(scene.check.failure);
            }
            return;
        }

        // Logique pour les checks de compétences normales (non COMBAT_CHECK)
        const success = checkSkill(scene.check.stat, scene.check.difficulty);
        
        if (success) {
            updateLog(`[Résultat] Succès du jet de ${scene.check.stat} !`);
            
            // Appliquer les conséquences de succès
            if (SCENES[scene.check.success].consequence) {
                 SCENES[scene.check.success].consequence();
            }
            
            // Définir le statut de succès pour les choix futurs dans le gameState
            gameState.lastCheckSuccess = true;

            renderScene(scene.check.success);
        } else {
            updateLog(`[Résultat] Échec du jet de ${scene.check.stat}.`);
            
            // Appliquer les conséquences d'échec
            if (SCENES[scene.check.failure].consequence) {
                SCENES[scene.check.failure].consequence();
            }

            // Définir le statut d'échec pour les choix futurs dans le gameState
            gameState.lastCheckSuccess = false;

            renderScene(scene.check.failure);
        }
        return;
    }

    // Gérer les conséquences de la scène simple
    if (scene.consequence) {
        scene.consequence();
        calculateEffectiveStats();
    }

    renderScene(nextSceneKey);
    saveGame();
}


// --- Fonctions de Rendu (UI) ---

const gameView = document.getElementById('game-view');

function renderStatBar(stat, value) {
    const checkValue = value; // Valeur du pilote
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
    
    // Affichage des stats physiques (Force, Agilité, Vitesse) avec le bonus x10
    const effValue = gameState.effectiveStats[stat];
    const displayValue = ['Force', 'Agilité', 'Vitesse'].includes(stat) 
        ? `${checkValue} <span class="text-gray-400">(${effValue})</span>` 
        : `${checkValue}`;


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

function renderHPBar(label, currentHP, maxHP) {
    const percentage = maxHP > 0 ? (currentHP / maxHP) * 100 : 0;
    const color = label === 'Mante' ? 'bg-indigo-500' : (currentHP < maxHP / 3) ? 'bg-red-500' : 'bg-green-500';

    return `
        <div class="mb-2">
            <div class="flex justify-between text-sm font-semibold text-white">
                <span>${label} PV</span>
                <span>${currentHP} / ${maxHP}</span>
            </div>
            <div class="stat-bar-bg h-3 rounded-full mt-1">
                <div class="${color} h-3 rounded-full" style="width: ${percentage}%;"></div>
            </div>
        </div>
    `;
}

function renderGameUI() {
    // Affichage des stats du Pilote (valeurs de 1 à 18)
    const statsHTML = Object.entries(gameState.pilotStats).map(([stat, value]) => renderStatBar(stat, value)).join('');
    const logHTML = gameState.log.map(msg => `<p class="text-xs text-gray-400">${msg}</p>`).reverse().join('');
    
    const currentScene = SCENES[gameState.currentScene];
    
    // Filtrage dynamique des choix
    const availableChoices = filterChoicesByRequirements(currentScene, gameState.pilotStats, gameState.lastCheckSuccess);
    
    const choicesHTML = availableChoices.map((choice, index) => {
        let btnClass = "btn-choice";
        let text = choice.text;

        if (choice.lockedReason) {
            btnClass += " opacity-50 cursor-not-allowed text-gray-500 border-gray-700";
            text = `[VERROUILLÉ] ${choice.text} (${choice.lockedReason})`;
        } else if (choice.isDeterminant) {
            // Correspond à la couleur bleue/verte de l'avantage
            btnClass += " choice-determinant border-blue-500 text-blue-300 hover:bg-blue-900";
        } else if (choice.isCritique) {
            // Correspond à la couleur rouge du risque
            btnClass += " choice-critique border-red-500 text-red-300 hover:bg-red-900";
        }

        return `
            <button onclick="${choice.lockedReason ? '' : `handleChoiceWrapper('${gameState.currentScene}', ${index})`}"
                    class="${btnClass} w-full text-left p-3 rounded-lg mt-3 text-sm hover:ring-2 ring-green-500/50">
                ${text}
            </button>
        `;
    }).join('');

    gameView.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Panneau de Statistiques et Log -->
            <aside class="lg:col-span-1 bg-gray-800 p-4 rounded-lg">
                <h2 class="text-xl font-bold mb-3 text-white">${gameState.name} | Mante ${gameState.manteType}</h2>
                
                <h3 class="text-md font-semibold mb-2 text-yellow-400">Points de Vie</h3>
                ${renderHPBar('Mante', gameState.manteHP, gameState.manteMaxHP)}
                ${renderHPBar('Pilote', gameState.pilotHP, gameState.pilotMaxHP)}
                
                <div class="border-y border-gray-700 py-3 my-3">
                    <h3 class="text-md font-semibold mb-2 text-yellow-400">Statistiques du Pilote (Check Value/Armure x10)</h3>
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
                    ${choicesHTML || '<p class="text-gray-400">Fin de la scène. Veuillez recharger la partie si le jeu n\'a pas pris fin.</p>'}
                </div>
            </main>
        </div>
    `;
}

function renderCreationScreen() {
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
    
    // HTML pour la distribution des points
    let distributionHTML = statKeys.map(stat => {
        const displayName = stat.replace('_', ' '); // Affichage avec espace
        return `
            <div class="flex items-center justify-between p-2 border-b border-gray-700 last:border-b-0">
                <label class="text-sm font-semibold text-white">${displayName}</label>
                <input type="number" data-stat="${stat}" min="1" max="18" value="1"
                       oninput="updatePoolDisplay()"
                       class="w-16 p-1 rounded bg-gray-700 text-center border-none focus:ring-green-500 focus:border-green-500" />
            </div>
        `;
    }).join('');


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
    
    // Logique de distribution des points
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
            const val = parseInt(input.value) || PILOT_BASE_MIN;
            // Assurer que la valeur reste dans les bornes [1, 18]
            input.value = Math.max(PILOT_BASE_MIN, Math.min(18, val));
            currentSum += parseInt(input.value);
        });

        const remaining = POOL_TOTAL - currentSum;
        const remainingEl = document.getElementById('pool_remaining');
        
        remainingEl.textContent = remaining;
        
        if (currentSum > POOL_TOTAL) {
            remainingEl.classList.remove('text-green-400', 'text-yellow-500');
            remainingEl.classList.add('text-red-500');
        } else if (currentSum < POOL_TOTAL) {
            remainingEl.classList.remove('text-red-500', 'text-green-400');
            remainingEl.classList.add('text-yellow-500');
        } else {
            remainingEl.classList.remove('text-red-500', 'text-yellow-500');
            remainingEl.classList.add('text-green-400');
        }
    };
    
    // Appliquer la distribution par défaut (Phalange) au chargement
    window.applyRecommendedDistribution('Phalange');
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

    const finalQC = gameState.pilotStats.QI_de_Combat || 'N/A';

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
    } else if (sceneKey.startsWith("ENDING") || SCENES[sceneKey]?.gameStatus) {
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
    lines.push('--- Points de Vie ---');
    lines.push(`Mante PV: ${gameState.manteHP} / ${gameState.manteMaxHP}`);
    lines.push(`Pilote PV: ${gameState.pilotHP} / ${gameState.pilotMaxHP}`);
    lines.push('--- Statistiques du Pilote ---');
    lines.push(`Force: ${gameState.pilotStats.Force}, Agilité: ${gameState.pilotStats.Agilité}, Vitesse: ${gameState.pilotStats.Vitesse}`);
    lines.push(`Intelligence: ${gameState.pilotStats.Intelligence}, Lucidité: ${gameState.pilotStats.Lucidité}, QI de Combat: ${gameState.pilotStats.QI_de_Combat}, Synchronisation: ${gameState.pilotStats.Synchronisation}`);
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

window.handleChoiceWrapper = handleChoice;
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
