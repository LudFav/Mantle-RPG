import { POOL_TOTAL, MANTES } from '../constants/models.js';

export function getInitialGameState() {
    return {
        name: "",
        manteType: "",
        pilotStats: {},
        effectiveStats: {},
        pilotHP: 100,
        manteHP: null,
        manteMaxHP: null,
        manteEnergy: null,
        manteMaxEnergy: null,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        statPoints: 0,
        currentScene: "LORE_INTRO",
        log: [],
        progress: 0,
        gameStatus: "PLAYING",
        combatState: null,
        sceneHistory: [],
        statusFlags: {}
    };
}

export function calculateEffectiveStats(pilotStats) {
    return {
        Intelligence: pilotStats.Intelligence,
        Lucidité: pilotStats.Lucidité,
        QI_de_Combat: pilotStats.QI_de_Combat,
        Synchronisation: pilotStats.Synchronisation,
        Force: pilotStats.Force * 10,
        Agilité: pilotStats.Agilité * 10,
        Vitesse: pilotStats.Vitesse * 10,
    };
}

export function applyConsequence(gameState, consequence, gainXPFn) {
    if (!consequence) return gameState;

    let newState = { ...gameState };

    if (consequence.ManteHP) {
        newState.manteHP = Math.max(0, Math.min(newState.manteMaxHP, newState.manteHP + consequence.ManteHP));
    }
    if (consequence.PilotHP) {
        newState.pilotHP = Math.max(0, Math.min(100, newState.pilotHP + consequence.PilotHP));
    }
    if (consequence.setStatus) {
        newState.statusFlags = { ...newState.statusFlags, ...consequence.setStatus };
    }
    if (consequence.gameStatus) {
        newState.gameStatus = consequence.gameStatus;
    }
    if (consequence.stats) {
        const newStats = { ...newState.pilotStats };
        Object.keys(consequence.stats).forEach(k => {
            if (newStats[k] !== undefined) {
                newStats[k] += consequence.stats[k];
            }
        });
        newState.pilotStats = newStats;
        newState.effectiveStats = calculateEffectiveStats(newStats);
    }
    if (consequence.xp) {
        gainXPFn(consequence.xp);
    }

    return newState;
}

export function filterChoicesByRequirements(sceneChoices, statusFlags) {
    if (!sceneChoices) return [];
    return sceneChoices.filter(choice => {
        if (!choice.requirements) return true;
        for (const req in choice.requirements) {
            const requiredValue = choice.requirements[req];
            if (statusFlags[req] !== requiredValue) {
                return false;
            }
        }
        return true;
    });
}

export function checkSkill(stat, difficulty, pilotStats, updateLog) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + pilotStats[stat];
    updateLog(`[CHECK] ${stat} (D20:${roll} + ${pilotStats[stat]}) vs Diff: ${difficulty}. Total: ${total}.`);
    return total >= difficulty;
}

export function restoreForNewAct(gameState, act) {
    return {
        ...gameState,
        pilotHP: 100,
        manteHP: gameState.manteMaxHP,
        manteEnergy: gameState.manteMaxEnergy
    };
}

export function calculateLevelUp(xp, xpToNextLevel, level) {
    let newXP = xp;
    let newLevel = level;
    let newXPToNext = xpToNextLevel;
    let statPointsGained = 0;

    while (newXP >= newXPToNext) {
        newLevel++;
        newXP -= newXPToNext;
        newXPToNext = Math.floor(newXPToNext * 1.5);
        statPointsGained += 2;
    }

    return { newXP, newLevel, newXPToNext, statPointsGained };
}

export function initializeGame(manteType, name, stats) {
    if (Object.values(stats).reduce((s, v) => s + v, 0) !== POOL_TOTAL) {
        return null; // Invalid stats
    }

    const manteModel = MANTES[manteType];
    const initialState = getInitialGameState();

    return {
        ...initialState,
        name,
        manteType,
        pilotStats: stats,
        effectiveStats: calculateEffectiveStats(stats),
        manteHP: manteModel.maxHP,
        manteMaxHP: manteModel.maxHP,
        manteEnergy: manteModel.maxEnergy,
        manteMaxEnergy: manteModel.maxEnergy,
        currentScene: 'ACT_1_OMEGA7_INTRO',
        log: [`[Départ] ${name} a choisi l'ECA Mante ${manteType}.`]
    };
}

