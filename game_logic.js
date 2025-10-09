import { SCENES_DATA } from './data/scenes_index.js';
import { MANTES, POOL_TOTAL, ENEMY_TYPES, MANTE_SPECIAL_ATTACKS, PILOT_BASE_MIN } from './models.js';
import { update } from './main.js';

const appId = 'mantle-rpg';

function getInitialGameState() {
    return {
        name: "",
        manteType: "",
        pilotStats: {},
        effectiveStats: {},
        pilotHP: 100,
        manteHP: null,
        manteMaxHP: null,
        reputation: { CEL: 5, FEU: 5, Aetheria: 0 },
        currentScene: "LORE_INTRO",
        log: [],
        progress: 0,
        gameStatus: "PLAYING",
        combatState: null,
        sceneHistory: [],
        statusFlags: {}
    };
}

export let gameState = getInitialGameState();

function render() {
    update(gameState);
}

function updateLog(message) {
    gameState.log.push(message);
    if (gameState.log.length > 50) {
        gameState.log.shift();
    }
}

function buildScenes(data) {
    const scenes = {};
    for (const [key, value] of Object.entries(data)) {
        scenes[key] = {
            ...value,
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
    gameState.effectiveStats = {
        Intelligence: gameState.pilotStats.Intelligence,
        Lucidité: gameState.pilotStats.Lucidité,
        QI_de_Combat: gameState.pilotStats.QI_de_Combat,
        Synchronisation: gameState.pilotStats.Synchronisation,
        Force: gameState.pilotStats.Force * 10,
        Agilité: gameState.pilotStats.Agilité * 10,
        Vitesse: gameState.pilotStats.Vitesse * 10,
    };
}

function applyConsequenceFromData(cons) {
    if (!cons) return;
    if (cons.reputation) {
        Object.keys(cons.reputation).forEach(k => {
            gameState.reputation[k] = Math.max(0, Math.min(10, (gameState.reputation[k] || 0) + cons.reputation[k]));
        });
    }
    if (cons.ManteHP) gameState.manteHP = Math.max(0, Math.min(gameState.manteMaxHP, gameState.manteHP + cons.ManteHP));
    if (cons.PilotHP) gameState.pilotHP = Math.max(0, Math.min(100, gameState.pilotHP + cons.PilotHP));
    if (cons.setStatus) gameState.statusFlags = { ...gameState.statusFlags, ...cons.setStatus };
    if (cons.stats) {
        Object.keys(cons.stats).forEach(k => {
            if (gameState.pilotStats[k] !== undefined) {
                gameState.pilotStats[k] += cons.stats[k];
            }
        });
        calculateEffectiveStats();
    }
}

export function filterChoicesByRequirements(sceneChoices) {
    if (!sceneChoices) return [];
    return sceneChoices.map(choice => {
        let disabled = false;
        let reason = '';
        if (choice.requirements) {
            for (const req in choice.requirements) {
                const required = choice.requirements[req];
                const current = gameState.statusFlags[req] ?? gameState.pilotStats[req];
                if (current < required) {
                    disabled = true;
                    reason = `(Req: ${req} ${required})`;
                    break;
                }
            }
        }
        return { ...choice, disabledReason: disabled ? reason : null };
    });
}

function checkSkill(stat, difficulty) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + gameState.pilotStats[stat];
    updateLog(`[CHECK] ${stat} (D20:${roll} + ${gameState.pilotStats[stat]}) vs Diff: ${difficulty}. Total: ${total}.`);
    return total >= difficulty;
}

function restoreForNewAct(act) {
    updateLog(`[SYSTÈME] Début de l'Acte ${act}. Systèmes restaurés.`);
    gameState.pilotHP = 100;
    gameState.manteHP = gameState.manteMaxHP;
}

export function handleChoice(sceneKey, choiceIndex) {
    const currentScene = SCENES[sceneKey];
    let choices = currentScene[`choices_${gameState.manteType}`] || currentScene.choices;
    const availableChoices = filterChoicesByRequirements(choices);
    const choice = choices[choiceIndex];
    if (!choice) return;
    if (choice.consequence) {
        applyConsequenceFromData(choice.consequence);
    }
    const nextSceneKey = choice.next;
    if (nextSceneKey.startsWith('ACT_2_') && gameState.currentScene.startsWith('ACT_1_')) restoreForNewAct("II");
    if (nextSceneKey.startsWith('ACT_3_') && gameState.currentScene.startsWith('ACT_2_')) restoreForNewAct("III");

    gameState.currentScene = nextSceneKey;
    const nextScene = SCENES[nextSceneKey];

    if (nextScene.clearStatusFlags) gameState.statusFlags = {};

    if (nextScene.check) {
        if (nextScene.check.type === "COMBAT_INIT") {
            initCombat(nextScene.check);
        } else {
            const success = checkSkill(nextScene.check.stat, nextScene.check.difficulty);
            gameState.currentScene = success ? nextScene.check.success : nextScene.check.failure;
            const resultScene = SCENES[gameState.currentScene];
            if (resultScene.consequence) {
                applyConsequenceFromData(resultScene.consequence);
            }
        }
    } else {
        if (nextScene.consequence) {
            applyConsequenceFromData(nextScene.consequence);
        }
    }
    
    checkPilotStatus();
    saveGameLocal();
    render();
}

function initCombat(checkData) {
    const enemy = ENEMY_TYPES[checkData.enemyType];
    gameState.combatState = {
        enemyType: checkData.enemyType,
        enemyHP: enemy.maxHP,
        enemyMaxHP: enemy.maxHP,
        nextSceneSuccess: checkData.success,
        nextSceneFailure: checkData.failure,
        playerBuffs: []
    };
    gameState.currentScene = 'COMBAT';
    updateLog(`[COMBAT] Contre : ${enemy.name}.`);
}

function rollDice(num, sides, bonus) {
    let total = 0;
    for (let i = 0; i < num; i++) total += Math.floor(Math.random() * sides) + 1;
    return total + (bonus || 0);
}

export function handleCombatChoice(action) {
    const combat = gameState.combatState;
    const enemy = ENEMY_TYPES[combat.enemyType];
    const mante = MANTES[gameState.manteType];
    let playerTurnOver = false;

    if (action === 'ATTACK_BASE' || action === 'ATTACK_SPECIAL') {
        const attack = action === 'ATTACK_SPECIAL' ? MANTE_SPECIAL_ATTACKS[gameState.manteType] : { stat: 'QI_de_Combat', damageMult: 1.0 };
        const totalAttack = rollDice(1, 20, gameState.pilotStats[attack.stat]);
        if (totalAttack >= enemy.defenseValue) {
            const damage = Math.round(rollDice(1, 10, gameState.pilotStats[attack.stat]) * attack.damageMult);
            combat.enemyHP = Math.max(0, combat.enemyHP - damage);
            updateLog(`[ATTAQUE] Touche ! Dégâts : ${damage}.`);
        } else {
            updateLog(`[ATTAQUE] Manqué.`);
        }
        playerTurnOver = true;
    } else if (action === 'DEFEND') {
        combat.playerBuffs.push({ type: 'defense', value: 5, turns: 1 });
        updateLog(`[DEFENSE] Position défensive adoptée.`);
        playerTurnOver = true;
    } else if (action === 'SCAN') {
        updateLog(`[SCAN] ${enemy.name} | PV: ${combat.enemyHP}/${enemy.maxHP}`);
    }

    if (combat.enemyHP <= 0) {
        updateLog(`[VICTOIRE] ${enemy.name} détruit !`);
        gameState.currentScene = combat.nextSceneSuccess;
        gameState.combatState = null;
    } else if (playerTurnOver) {
        let playerDefense = 10 + gameState.pilotStats[mante.defenseStat];
        const defenseBuff = combat.playerBuffs.find(b => b.type === 'defense');
        if (defenseBuff) playerDefense += defenseBuff.value;

        const enemyAttack = rollDice(1, 20, enemy.attackBonus);
        if (enemyAttack >= playerDefense) {
            const damage = rollDice(enemy.damageDice.num, enemy.damageDice.sides, enemy.damageDice.bonus);
            updateLog(`[ENNEMI] Touche ! Dégâts : ${damage}.`);
            takeDamage(damage);
        } else {
            updateLog(`[ENNEMI] Manqué.`);
        }
        combat.playerBuffs = combat.playerBuffs.filter(b => b.turns-- > 1);
    }

    checkPilotStatus();
    saveGameLocal();
    render();
}

function takeDamage(amount) {
    const overflow = amount - gameState.manteHP;
    gameState.manteHP = Math.max(0, gameState.manteHP - amount);
    if (overflow > 0) {
        gameState.pilotHP = Math.max(0, gameState.pilotHP - overflow);
    }
}

function checkPilotStatus() {
    if (gameState.pilotHP <= 0) {
        updateLog(`[CRITIQUE] Pilote neutralisé.`);
        gameState.gameStatus = "ENDED_FAILURE";
        gameState.currentScene = gameState.combatState ? gameState.combatState.nextSceneFailure : 'GAME_OVER';
        gameState.combatState = null;
    }
}

export function startGame(manteType, name, stats) {
    if (Object.values(stats).reduce((s, v) => s + v, 0) !== POOL_TOTAL) {
        alert(`La distribution des points est incorrecte.`);
        return;
    }
    gameState = {
        ...getInitialGameState(),
        name,
        manteType,
        pilotStats: stats,
        manteHP: MANTES[manteType].maxHP,
        manteMaxHP: MANTES[manteType].maxHP,
        currentScene: 'ACT_1_KAIROK_INTRO',
        log: [`[Départ] ${name} a choisi l'ECA Mante ${manteType}.`]
    };
    calculateEffectiveStats();
    saveGameLocal();
    render();
}

export function resetToCreation() {
    gameState = getInitialGameState();
    localStorage.removeItem(getLocalStorageKey());
    render();
}

function getLocalStorageKey() {
    return `mantle_save_${appId}`;
}

export function saveGameLocal() {
    try {
        const stateToSave = { ...gameState, log: gameState.log.slice(-50) };
        localStorage.setItem(getLocalStorageKey(), JSON.stringify(stateToSave));
    } catch (e) {
        console.error("Sauvegarde échouée", e);
    }
}

export function loadGameLocal() {
    const saved = localStorage.getItem(getLocalStorageKey());
    if (saved) {
        gameState = JSON.parse(saved);
        calculateEffectiveStats(); // Important après chargement
    } else {
        gameState = getInitialGameState();
    }
    render();
}
