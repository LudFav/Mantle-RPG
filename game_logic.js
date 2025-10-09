import { SCENES_DATA } from './data/scenes_index.js';
import { MANTES, PILOT_BASE_STATS, PILOT_BASE_MIN, POOL_TOTAL, ENEMY_TYPES, MANTE_SPECIAL_ATTACKS } from './models.js';
import { renderScene, updateLog, renderCombatScreen } from './ui_render.js';

// Utiliser une variable globale fournie par l'environnement d'exécution si disponible.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// État global du jeu
export let gameState = {
    name: "",
    manteType: "",
    pilotStats: {},
    effectiveStats: {},
    pilotHP: 100,
    manteHP: 100,
    reputation: { CEL: 5, FEU: 5, Aetheria: 0 },
    currentScene: "LORE_INTRO",
    log: [],
    progress: 0,
    gameStatus: "PLAYING", // PLAYING, ENDED_SUCCESS, ENDED_FAILURE
    combatState: null, // ou un objet contenant les infos de combat
    sceneHistory: [],
    statusFlags: {} // { success: true } ou { failure: true } pour les choix conditionnels
};

// --- Initialisation des Scènes ---

// Construit l'objet SCENES à partir des données brutes pour plus de flexibilité.
function buildScenes(data) {
    const scenes = {};
    for (const [key, value] of Object.entries(data)) {
        scenes[key] = {
            ...value, // Copie toutes les propriétés
            // Transforme l'objet 'consequence' en une fonction exécutable
            // Cela permet de garder les données pures dans scenes_index.js
            consequence: value.consequence
                ? () => applyConsequenceFromData(value.consequence)
                : undefined
        };
    }
    return scenes;
}

export const SCENES = buildScenes(SCENES_DATA);


// --- Logique des Statistiques ---

// Calcule les stats effectives de la Mante en se basant sur celles du pilote.
export function calculateEffectiveStats() {
    if (!gameState.manteType || Object.keys(gameState.pilotStats).length === 0) return;
    
    // Les stats mentales sont directes
    gameState.effectiveStats.Intelligence = gameState.pilotStats.Intelligence;
    gameState.effectiveStats.Lucidité = gameState.pilotStats.Lucidité;
    gameState.effectiveStats.QI_de_Combat = gameState.pilotStats.QI_de_Combat;
    gameState.effectiveStats.Synchronisation = gameState.pilotStats.Synchronisation;
    
    // Les stats physiques sont multipliées
    gameState.effectiveStats.Force = gameState.pilotStats.Force * 10;
    gameState.effectiveStats.Agilité = gameState.pilotStats.Agilité * 10;
    gameState.effectiveStats.Vitesse = gameState.pilotStats.Vitesse * 10;

    // Initialise les PV de la Mante si c'est la première fois
    if (gameState.manteHP === 100 && gameState.pilotStats.Force) {
        gameState.manteHP = gameState.pilotStats.Force * 10;
    }
}

// Applique les conséquences d'un choix ou d'une scène.
function applyConsequenceFromData(cons) {
    if (!cons) return;

    if (cons.reputation) {
        for (const k of Object.keys(cons.reputation)) {
            const delta = cons.reputation[k];
            // Assure que la réputation reste entre 0 et 10
            gameState.reputation[k] = Math.max(0, Math.min(10, (gameState.reputation[k] || 0) + delta));
        }
    }
    if (cons.ManteHP) {
        gameState.manteHP = Math.max(0, gameState.manteHP + cons.ManteHP);
        if (cons.ManteHP < 0) {
            updateLog(`[Dégâts] Armure Mante subit ${Math.abs(cons.ManteHP)} PV.`);
        } else if (cons.ManteHP > 0) {
            updateLog(`[Soin] Armure Mante récupère ${cons.ManteHP} PV.`);
        }
    }
    if (cons.PilotHP) {
        gameState.pilotHP = Math.max(0, gameState.pilotHP + cons.PilotHP);
        if (cons.PilotHP < 0) {
            updateLog(`[Blessure] Pilote subit ${Math.abs(cons.PilotHP)} PV. Danger !`);
        } else if (cons.PilotHP > 0) {
            updateLog(`[Soin] Pilote récupère ${cons.PilotHP} PV.`);
        }
    }
    if (cons.stats) {
        for (const k of Object.keys(cons.stats)) {
            const delta = cons.stats[k];
            if (gameState.pilotStats[k] !== undefined) {
                gameState.pilotStats[k] = Math.max(PILOT_BASE_MIN, gameState.pilotStats[k] + delta);
                updateLog(`[Stat Modifiée] ${k} : ${delta > 0 ? '+' : ''}${delta}. Nouvelle valeur : ${gameState.pilotStats[k]}`);
            }
        }
    }
    if (typeof cons.progress === 'number') gameState.progress = cons.progress;
    if (typeof cons.gameStatus === 'string') gameState.gameStatus = cons.gameStatus;
    
    // CORRECTION : Gère les marqueurs de succès/échec pour les choix conditionnels
    if (cons.setStatus) {
        if (cons.setStatus.success) gameState.statusFlags.success = true;
        if (cons.setStatus.failure) gameState.statusFlags.failure = true;
    }
}


// --- Logique des Choix et Scènes ---

// Filtre les choix pour n'afficher que ceux dont les prérequis sont remplis.
export function filterChoicesByRequirements(sceneChoices) {
    if (!sceneChoices) return [];
    return sceneChoices.map(choice => {
        let disabled = false;
        let reason = '';
        if (choice.requirements) {
            for (const stat in choice.requirements) {
                const requiredValue = choice.requirements[stat];
                
                // CORRECTION : Vérifie les marqueurs de statut dans gameState.statusFlags
                if (stat === 'success' || stat === 'failure') {
                    if (gameState.statusFlags[stat] !== requiredValue) {
                        disabled = true;
                        reason = `(Statut Événement non rempli)`;
                        break;
                    }
                } 
                // Vérifie les stats du pilote
                else if (gameState.pilotStats[stat] < requiredValue) {
                    disabled = true;
                    reason = `(Req: ${stat} ${requiredValue} requis, ${gameState.pilotStats[stat]} actuel)`;
                    break;
                }
            }
        }
        return { ...choice, disabledReason: disabled ? reason : null };
    });
}


// Effectue un jet de compétence (D20 + stat vs difficulté).
export function checkSkill(stat, difficulty) {
    const checkValue = gameState.pilotStats[stat];
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + checkValue;
    const message = `[CHECK] ${stat} (Valeur: ${checkValue} + D20 Jet: ${roll}) vs Diff: ${difficulty}. Total: ${total}.`;
    updateLog(message);
    return total >= difficulty;
}

// Gère la sélection d'un choix par le joueur.
export function handleChoice(sceneKey, choiceIndex) {
    if (gameState.gameStatus !== "PLAYING") return;

    const currentScene = SCENES[sceneKey];
    // Gère les choix spécifiques au type de Mante
    let sceneChoices = currentScene[`choices_${gameState.manteType}`] || currentScene.choices;
    
    const choice = sceneChoices[choiceIndex];
    if (!choice) return; // Sécurité

    // Applique une conséquence directe liée au choix
    if (choice.consequence) {
        choice.consequence();
    }
    
    const nextSceneKey = choice.next;
    const nextScene = SCENES[nextSceneKey];

    // CORRECTION : Réinitialise les marqueurs si la scène le demande
    if (nextScene.clearStatusFlags) {
        gameState.statusFlags = {};
    }

    // Si la scène suivante est un test de compétence
    if (nextScene.check) {
        if (nextScene.check.type === "COMBAT_INIT") {
            initCombat(nextScene.check);
            return;
        }
        const success = checkSkill(nextScene.check.stat, nextScene.check.difficulty);
        const resultSceneKey = success ? nextScene.check.success : nextScene.check.failure;
        if (success) {
            updateLog(`[Résultat] Succès du jet de ${nextScene.check.stat} !`);
        } else {
            updateLog(`[Résultat] Échec du jet de ${nextScene.check.stat}.`);
        }
        // Applique la conséquence de la scène de résultat avant de l'afficher
        const resultScene = SCENES[resultSceneKey];
        if (resultScene.consequence) {
            resultScene.consequence();
        }
        renderScene(resultSceneKey);

    } else { // Sinon, c'est une scène narrative simple
        if (nextScene.consequence) {
            nextScene.consequence();
        }
        renderScene(nextSceneKey);
    }
    
    checkPilotStatus();
    saveGameLocal(); // Sauvegarde après chaque action
}


// --- Logique de Combat ---

function initCombat(checkData) {
    const enemyType = checkData.enemyType;
    const enemy = ENEMY_TYPES[enemyType];
    if (!enemy) {
        updateLog(`[Erreur Combat] Ennemi inconnu: ${enemyType}.`);
        renderScene(checkData.failure);
        return;
    }
    gameState.sceneHistory.push(gameState.currentScene);
    gameState.currentScene = 'COMBAT';
    gameState.combatState = {
        enemyType: enemyType,
        enemyHP: enemy.maxHP,
        enemyMaxHP: enemy.maxHP,
        damageBase: enemy.damageBase,
        nextSceneSuccess: checkData.success,
        nextSceneFailure: checkData.failure,
        buffs: []
    };
    updateLog(`[COMBAT ENGAGÉ] Contre : ${enemy.name}. PV : ${enemy.maxHP}.`);
    renderCombatScreen();
}

export function handleCombatChoice(action) {
    if (gameState.gameStatus !== "PLAYING" || !gameState.combatState) return;
    const combat = gameState.combatState;
    const enemy = ENEMY_TYPES[combat.enemyType];
    const manteAttack = MANTE_SPECIAL_ATTACKS[gameState.manteType];
    let playerDamage = 0;
    let enemyDamage = combat.damageBase;
    updateLog(`--- Tour de combat ---`);

    switch (action) {
        case 'ATTACK_BASE':
            playerDamage = checkSkill('QI_de_Combat', 6)
                ? gameState.pilotStats.QI_de_Combat * 5
                : gameState.pilotStats.QI_de_Combat * 2;
            updateLog(`[Attaque Standard] Dégâts infligés : ${playerDamage} PV.`);
            break;
        case 'ATTACK_SPECIAL':
            playerDamage = checkSkill(manteAttack.stat, 8)
                ? Math.round((gameState.pilotStats[manteAttack.stat] * 5) * manteAttack.damageMult)
                : 0;
            updateLog(`[Attaque Spéciale - ${manteAttack.name}] Dégâts infligés : ${playerDamage} PV.`);
            break;
        case 'DEFEND':
            updateLog(`[Défense] Position défensive adoptée. Dégâts ennemis réduits.`);
            enemyDamage = Math.max(0, enemyDamage - 15);
            break;
        case 'SCAN':
            updateLog(`[Scan] Informations: ${enemy.name} a ${combat.enemyHP} PV restants. Dégâts de base: ${enemy.damageBase}.`);
            renderCombatScreen();
            return;
    }
    
    combat.enemyHP = Math.max(0, combat.enemyHP - playerDamage);
    updateLog(`[Ennemi] PV restants: ${combat.enemyHP}/${combat.enemyMaxHP}.`);

    if (combat.enemyHP <= 0) {
        updateLog(`[VICTOIRE] ${enemy.name} a été détruit !`);
        const nextScene = combat.nextSceneSuccess;
        gameState.combatState = null;
        renderScene(nextScene);
        saveGameLocal();
        return;
    }

    updateLog(`[Ennemi] Riposte et inflige ${enemyDamage} PV.`);
    takeDamage(enemyDamage);

    if (gameState.manteHP <= 0 && gameState.pilotHP <= 0) {
        updateLog(`[DÉFAITE] La Mante et le Pilote sont neutralisés.`);
        const nextScene = combat.nextSceneFailure;
        gameState.combatState = null;
        renderScene(nextScene);
        saveGameLocal();
        return;
    } else if (gameState.manteHP <= 0) {
        updateLog(`[CRITIQUE] L'armure Mante est hors service ! Le Pilote est exposé.`);
    }

    renderCombatScreen();
    saveGameLocal();
}

export function takeDamage(amount) {
    if (amount <= 0) return;
    const remainingAfterMante = amount - gameState.manteHP;
    gameState.manteHP = Math.max(0, gameState.manteHP - amount);
    
    if (remainingAfterMante > 0) {
        gameState.pilotHP = Math.max(0, gameState.pilotHP - remainingAfterMante);
        updateLog(`[Dégâts] L'armure est brisée. Pilote subit ${remainingAfterMante} PV !`);
    }
    checkPilotStatus();
}

function checkPilotStatus() {
    if (gameState.pilotHP <= 0) {
        updateLog(`[CRITIQUE] Le Pilote a succombé. Fin de la Campagne.`);
        gameState.gameStatus = "ENDED_FAILURE";
        renderScene('GAME_OVER');
    }
}


// --- Démarrage et Gestion de Partie ---

export function startGame(manteType, name) {
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
        alert(`La somme des stats doit être de ${POOL_TOTAL}. Actuellement : ${currentSum}.`);
        return;
    }

    // Réinitialisation de l'état du jeu
    gameState.name = name;
    gameState.manteType = manteType;
    gameState.pilotStats = stats;
    gameState.pilotHP = 100;
    gameState.manteHP = stats.Force * 10;
    calculateEffectiveStats();
    
    gameState.reputation = { CEL: 5, FEU: 5, Aetheria: 0 };
    gameState.log = [
        `[Départ] ${name} a choisi l'ECA Mante ${manteType}.`,
        `[Stats Pilote] F:${stats.Force}, A:${stats.Agilité}, V:${stats.Vitesse}, I:${stats.Intelligence}, L:${stats.Lucidité}, QC:${stats.QI_de_Combat}, S:${stats.Synchronisation}.`,
        `[Stats Mante] F:${gameState.effectiveStats.Force}, A:${gameState.effectiveStats.Agilité}, V:${gameState.effectiveStats.Vitesse}. PV Mante: ${gameState.manteHP}.`
    ];
    gameState.currentScene = "ACT_1_KAIROK_INTRO";
    gameState.progress = 0;
    gameState.gameStatus = "PLAYING";
    gameState.combatState = null;
    gameState.statusFlags = {};
    
    saveGameLocal();
    renderScene("ACT_1_KAIROK_INTRO");
}

export function resetToCreation() {
    // Réinitialise l'état du jeu à ses valeurs par défaut
    gameState = {
        ...gameState, // conserve certaines clés si nécessaire
        name: "", manteType: "", pilotStats: {}, effectiveStats: {},
        pilotHP: 100, manteHP: 100, reputation: { CEL: 5, FEU: 5, Aetheria: 0 },
        log: [], progress: 0, gameStatus: "PLAYING", combatState: null,
        statusFlags: {}, sceneHistory: []
    };
    try { 
        localStorage.removeItem(getLocalStorageKey()); 
    } catch (_) {}
    renderScene("LORE_INTRO");
}


// --- Sauvegarde et Chargement ---

// CORRECTION : Utilise une clé de sauvegarde constante pour pouvoir la retrouver.
function getLocalStorageKey() {
    return `mantle_save_${appId}`;
}

export function saveGameLocal() {
    try {
        const stateToSave = { ...gameState };
        stateToSave.log = stateToSave.log.slice(-50); // Limite la taille du log
        localStorage.setItem(getLocalStorageKey(), JSON.stringify(stateToSave));
        updateLog(`[Système] Partie sauvegardée à ${new Date().toLocaleTimeString()}.`);
    } catch (error) {
        console.error('Erreur de sauvegarde locale:', error);
        updateLog('[Erreur] Échec de la sauvegarde.');
    }
}

export function loadGameLocal() {
    try {
        const raw = localStorage.getItem(getLocalStorageKey());
        if (!raw) {
            updateLog('[Système] Aucune sauvegarde trouvée. Lancement de l\'intro.');
            renderScene('LORE_INTRO');
            return;
        }
        const loaded = JSON.parse(raw);
        Object.assign(gameState, loaded);
        calculateEffectiveStats(); // Recalcule les stats au cas où la logique aurait changé

        updateLog(`[Système] Partie chargée. Bienvenue, ${gameState.name}.`);

        if (gameState.combatState) {
            renderCombatScreen();
        } else {
            renderScene(gameState.currentScene);
        }
    } catch (error) {
        console.error('Erreur de chargement local:', error);
        updateLog('[Erreur] Sauvegarde corrompue. Réinitialisation.');
        resetToCreation();
    }
}
