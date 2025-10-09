import { SCENES_DATA } from './data/scenes_index.js';
import { MANTES, PILOT_BASE_STATS, PILOT_BASE_MIN, POOL_TOTAL, ENEMY_TYPES } from './models.js';
import { renderScene, updateLog, renderCombatScreen, renderGameOver, renderGameUI } from './ui_render.js';
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
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
    gameStatus: "PLAYING",
    combatState: null,
    sceneHistory: []
};

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
            consequence: value.consequence
                ? () => applyConsequenceFromData(value.consequence)
                : undefined
        };
    }
    return scenes;
}

export const SCENES = buildScenes(SCENES_DATA);

export function calculateEffectiveStats() {
    if (!gameState.manteType || Object.keys(gameState.pilotStats).length === 0) return;
    gameState.effectiveStats.Intelligence = gameState.pilotStats.Intelligence;
    gameState.effectiveStats.Lucidité = gameState.pilotStats.Lucidité;
    gameState.effectiveStats.QI_de_Combat = gameState.pilotStats.QI_de_Combat;
    gameState.effectiveStats.Synchronisation = gameState.pilotStats.Synchronisation;
    gameState.effectiveStats.Force = gameState.pilotStats.Force * 10;
    gameState.effectiveStats.Agilité = gameState.pilotStats.Agilité * 10;
    gameState.effectiveStats.Vitesse = gameState.pilotStats.Vitesse * 10;
    if (gameState.manteHP === 100) {
        gameState.manteHP = gameState.pilotStats.Force * 10;
    }
}

function applyConsequenceFromData(cons) {
    if (!cons) return;
    if (cons.reputation) {
        for (const k of Object.keys(cons.reputation)) {
            const delta = cons.reputation[k];
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
    if (typeof cons.progress === 'number') {
        gameState.progress = cons.progress;
    }
    if (typeof cons.gameStatus === 'string') {
        gameState.gameStatus = cons.gameStatus;
    }
}

export function filterChoicesByRequirements(sceneChoices) {
    if (!sceneChoices) return [];
    return sceneChoices.filter(choice => {
        if (!choice.requirements) return true;
        for (const stat in choice.requirements) {
            const requiredValue = choice.requirements[stat];
            const currentValue = gameState.pilotStats[stat];
            if (stat === 'successStatus' || stat === 'failureStatus') {
                const required = choice.requirements[stat];
                const actual = gameState.statusFlags[stat];
                if (required !== actual) {
                    choice.disabledReason = `(Statut Événement non rempli)`;
                    return false;
                }
            }
            else if (currentValue < requiredValue) {
                choice.disabledReason = `(Req: ${stat} ${requiredValue} requis, ${currentValue} actuel)`;
                return false;
            }
        }
        return true;
    });
}

export function checkSkill(stat, difficulty) {
    const checkValue = gameState.pilotStats[stat];
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + checkValue;
    const message = `[CHECK] ${stat} (Valeur: ${checkValue} + D20 Jet: ${roll}) vs Diff: ${difficulty}. Total: ${total}.`;
    updateLog(message);

    return total >= difficulty;
}

export function handleChoice(sceneKey, choiceIndex) {
    if (gameState.gameStatus !== "PLAYING") return;
    const currentScene = SCENES[sceneKey];
    let sceneChoices = currentScene.choices;
    if (gameState.manteType) {
        sceneChoices = currentScene[`choices_${gameState.manteType}`] || currentScene.choices;
    }
    const availableChoices = filterChoicesByRequirements(sceneChoices);
    const choice = availableChoices.find(c => c.text === sceneChoices[choiceIndex].text);
    if (!choice || choice.disabledReason) return;
    const nextSceneKey = choice.next;
    const consequenceFn = choice.consequence;
    if (consequenceFn) {
        consequenceFn();
    }
    const scene = SCENES[nextSceneKey];
    if (scene.check) {
        if (scene.check.type === "COMBAT_INIT") {
            initCombat(scene.check);
            return;
        }
        const success = checkSkill(scene.check.stat, scene.check.difficulty);
        if (success) {
            updateLog(`[Résultat] Succès du jet de ${scene.check.stat} !`);
            renderScene(scene.check.success);
        } else {
            updateLog(`[Résultat] Échec du jet de ${scene.check.stat}.`);
            renderScene(scene.check.failure);
        }
        checkPilotStatus();
        saveGame();
        return;
    }
    if (scene.consequence) {
        scene.consequence();
    }
    renderScene(nextSceneKey);
    checkPilotStatus();
    saveGame();
}

function checkPilotStatus() {
    if (gameState.pilotHP <= 0) {
        updateLog(`[CRITIQUE] Le Pilote a succombé à ses blessures. Fin de la Campagne.`);
        renderScene('GAME_OVER');
    }
}
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
function initCombat(checkData) {
    const enemyType = checkData.enemyType;
    const enemy = ENEMY_TYPES[enemyType];
    if (!enemy) {
        updateLog(`[Erreur Combat] Ennemi inconnu: ${enemyType}.`);
        renderScene(checkData.failure); // Sortir du combat
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
            const baseHit = checkSkill('QI_de_Combat', 6);
            playerDamage = baseHit ? gameState.pilotStats.QI_de_Combat * 5 : gameState.pilotStats.QI_de_Combat * 2;
            updateLog(`[Attaque Standard] Dégâts infligés : ${playerDamage} PV.`);
            break;
        case 'ATTACK_SPECIAL':
            const specialHit = checkSkill(manteAttack.stat, 8);
            playerDamage = specialHit ? (gameState.pilotStats[manteAttack.stat] * 5) * manteAttack.damageMult : 0;
            updateLog(`[Attaque Spéciale - ${manteAttack.name}] Dégâts infligés : ${playerDamage} PV.`);
            break;
        case 'DEFEND':
            updateLog(`[Défense] Position défensive adoptée. Dégâts ennemis réduits.`);
            enemyDamage = Math.max(0, enemyDamage - 15);
            break;
        case 'SCAN':
            updateLog(`[Scan] Informations sur l'ennemi: PV restants: ${combat.enemyHP}. Dégâts de base: ${enemy.damageBase}.`);
            renderCombatScreen();
            return;
    }
    combat.enemyHP = Math.max(0, combat.enemyHP - playerDamage);
    updateLog(`[Ennemi] PV restants: ${combat.enemyHP}/${combat.enemyMaxHP}.`);
    if (combat.enemyHP <= 0) {
        updateLog(`[VICTOIRE] ${enemy.name} a été détruit !`);
        gameState.combatState = null;
        const nextScene = combat.nextSceneSuccess;
        renderScene(nextScene);
        saveGame();
        return;
    }
    takeDamage(enemyDamage);
    updateLog(`[Ennemi] Attaque riposte : ${enemyDamage} PV subis.`);
    if (gameState.manteHP <= 0 && gameState.pilotHP <= 0) {
        gameState.combatState = null;
        updateLog(`[DÉFAITE] La Mante et le Pilote sont neutralisés.`);
        renderScene('GAME_OVER');
        saveGame();
        return;
    } else if (gameState.manteHP <= 0) {
        updateLog(`[CRITIQUE] L'armure Mante est hors service ! Le Pilote est exposé.`);
    }
    renderCombatScreen();
    saveGame();
}

export function takeDamage(amount) {
    if (amount <= 0) return;
    const remainingAfterMante = amount - gameState.manteHP;
    gameState.manteHP = Math.max(0, gameState.manteHP - amount);
    if (remainingAfterMante > 0) {
        gameState.pilotHP = Math.max(0, gameState.pilotHP - remainingAfterMante);
        updateLog(`[Dégâts] L'armure est brisée. Pilote subit ${remainingAfterMante} PV !`);
    }
    if (gameState.pilotHP <= 0) {
        updateLog(`[CRITIQUE] Le Pilote est neutralisé.`);
    }
}

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
        updateLog(`[Erreur] Veuillez distribuer exactement ${POOL_TOTAL} points. Total actuel : ${currentSum}.`);
        return;
    }
    gameState.name = name;
    gameState.manteType = manteType;
    gameState.pilotStats = stats;
    const initialManteHP = stats.Force * 10;
    gameState.manteHP = initialManteHP;
    gameState.pilotHP = 100;
    calculateEffectiveStats();
    const effStats = gameState.effectiveStats;
    gameState.reputation = { CEL: 5, FEU: 5, Aetheria: 0 };
    gameState.log = [
        `[Départ] ${name} a choisi l'ECA Mante ${manteType}.`,
        `[Pilote Base] F:${stats.Force}, A:${stats.Agilité}, V:${stats.Vitesse}, I:${stats.Intelligence}, L:${stats.Lucidité}, QC:${stats.QI_de_Combat}, S:${stats.Synchronisation}.`,
        `[Mante Effective] F:${effStats.Force}, A:${effStats.Agilité}, V:${effStats.Vitesse}. PV Mante: ${initialManteHP}.`
    ];
    gameState.currentScene = "ACT_1_KAIROK_INTRO";
    gameState.progress = 0;
    gameState.gameStatus = "PLAYING";
    gameState.combatState = null;
    gameState.statusFlags = {};
    saveGame();
    renderScene("ACT_1_KAIROK_INTRO");
}

export function resetToCreation() {
    try { localStorage.removeItem(getLocalStorageKey()); } catch (_) { }
    gameState.name = "";
    gameState.manteType = "";
    gameState.pilotStats = {};
    gameState.effectiveStats = {};
    gameState.pilotHP = 100;
    gameState.manteHP = 100;
    gameState.reputation = { CEL: 5, FEU: 5, Aetheria: 0 };
    gameState.log = [];
    gameState.progress = 0;
    gameState.gameStatus = "PLAYING";
    gameState.combatState = null;
    gameState.statusFlags = {};
    renderScene("LORE_INTRO");
}

function getLocalStorageKey() {
    const uid = crypto.randomUUID();
    return `mantle_save_${appId}_${uid}`;
}

export function saveGame() { saveGameLocal(); }

export function saveGameLocal() {
    try {
        const stateToSave = { ...gameState };
        stateToSave.log = stateToSave.log.slice(-50);
        localStorage.setItem(getLocalStorageKey(), JSON.stringify(stateToSave));
        updateLog(`[Système] Partie sauvegardée en local à ${new Date().toLocaleTimeString()}.`);
    } catch (error) {
        console.error('Erreur sauvegarde locale:', error);
    }
}

export function loadGameLocal() {
    try {
        const raw = localStorage.getItem(getLocalStorageKey());
        if (!raw) {
            updateLog('[Système] Aucune sauvegarde locale trouvée. Démarrage de l\'introduction.');
            renderScene('LORE_INTRO');
            return;
        }
        const loaded = JSON.parse(raw);
        Object.assign(gameState, loaded);
        calculateEffectiveStats();

        updateLog(`[Système] Partie locale chargée. Bienvenue, ${gameState.name} (${gameState.manteType}).`);

        if (gameState.combatState) {
            renderCombatScreen();
        } else {
            renderScene(gameState.currentScene);
        }
    } catch (error) {
        console.error('Erreur chargement local:', error);
        renderScene('LORE_INTRO');
    }
}
