import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SCENES_DATA } from '../data/scenes_index.js';
import {
    getInitialGameState,
    calculateEffectiveStats,
    applyConsequence,
    checkSkill,
    restoreForNewAct,
    calculateLevelUp,
    initializeGame,
    filterChoicesByRequirements
} from '../utils/gameLogic.js';
import { initCombat, executeCombatAction } from '../utils/combat.js';

const SCENES = { ...SCENES_DATA };

const useGameStore = create(
    persist(
        (set, get) => ({
            gameState: getInitialGameState(),
            updateLog: (message) => {
                set((state) => {
                    const newLog = [...state.gameState.log, message];
                    if (newLog.length > 50) {
                        newLog.shift();
                    }
                    return {
                        gameState: {
                            ...state.gameState,
                            log: newLog
                        }
                    };
                });
            },
            startGame: (manteType, name, stats) => {
                const newState = initializeGame(manteType, name, stats);
                if (!newState) {
                    alert('La distribution des points est incorrecte.');
                    return;
                }
                set({ gameState: newState });
            },

            resetToCreation: () => {
                set({ gameState: getInitialGameState() });
            },

            handleChoice: (sceneKey, choiceIndex) => {
                const { gameState, updateLog } = get();
                const currentScene = SCENES[sceneKey];
                // Normalize choices to an array (align with UI logic)
                let choices = [];
                if (Array.isArray(currentScene[`choices_${gameState.manteType}`])) {
                    choices = currentScene[`choices_${gameState.manteType}`];
                } else if (Array.isArray(currentScene.choices)) {
                    choices = currentScene.choices;
                } else if (currentScene.choices && typeof currentScene.choices === 'object') {
                    if (Array.isArray(currentScene.choices[gameState.manteType])) {
                        choices = currentScene.choices[gameState.manteType];
                    } else if (Array.isArray(currentScene.choices.all)) {
                        choices = currentScene.choices.all;
                    } else {
                        choices = Object.values(currentScene.choices).reduce((acc, v) => {
                            if (Array.isArray(v)) acc.push(...v);
                            return acc;
                        }, []);
                    }
                }

                // Apply same requirements filtering as UI to keep indices aligned
                choices = filterChoicesByRequirements(choices, gameState.statusFlags, gameState.pilotStats);

                const choice = choices[choiceIndex];

                if (!choice) return;

                let newState = { ...gameState };

                if (choice.consequence) {
                    newState = applyConsequence(newState, choice.consequence, (xp) => {
                        get().gainXP(xp);
                    });
                }
                const nextSceneKey = choice.next;
                if (nextSceneKey.startsWith('ACT_2_') && newState.currentScene.startsWith('ACT_1_')) {
                    newState = restoreForNewAct(newState, "II");
                    updateLog(`[SYSTÈME] Début de l'Acte II. Systèmes restaurés.`);
                }
                if (nextSceneKey.startsWith('ACT_3_') && newState.currentScene.startsWith('ACT_2_')) {
                    newState = restoreForNewAct(newState, "III");
                    updateLog(`[SYSTÈME] Début de l'Acte III. Systèmes restaurés.`);
                }

                newState.currentScene = nextSceneKey;
                const nextScene = SCENES[nextSceneKey];

                // Clear status flags if scene requires it
                if (nextScene.clearStatusFlags) {
                    newState.statusFlags = {};
                }

                // Handle scene checks (skill checks or combat)
                if (nextScene.check) {
                    if (nextScene.check.type === "COMBAT_INIT") {
                        newState.combatState = initCombat(nextScene.check);
                        newState.currentScene = 'COMBAT';
                        updateLog(`[COMBAT] Contre : ${nextScene.check.enemyType}.`);
                    } else {
                        const success = checkSkill(
                            nextScene.check.stat,
                            nextScene.check.difficulty,
                            newState.pilotStats,
                            updateLog
                        );
                        newState.currentScene = success ? nextScene.check.success : nextScene.check.failure;
                        const resultScene = SCENES[newState.currentScene];
                        if (resultScene.consequence) {
                            newState = applyConsequence(newState, resultScene.consequence, (xp) => {
                                get().gainXP(xp);
                            });
                        }
                    }
                } else {
                    if (nextScene.consequence) {
                        newState = applyConsequence(newState, nextScene.consequence, (xp) => {
                            get().gainXP(xp);
                        });
                    }
                }

                // Check pilot status
                if (newState.pilotHP <= 0) {
                    updateLog(`[CRITIQUE] Pilote neutralisé.`);
                    newState.gameStatus = "ENDED_FAILURE";
                    newState.currentScene = 'GAME_OVER';
                }

                set({ gameState: newState });
            },

            // Handle combat actions
            handleCombatChoice: (action) => {
                const { gameState, updateLog } = get();
                const result = executeCombatAction(action, gameState, updateLog);

                if (result.combatEnded) {
                    let newState = result.gameState;

                    // Récupérer le log à jour après les modifications
                    newState.log = [...get().gameState.log];

                    if (result.victory) {
                        get().gainXP(result.xpReward);

                        // Récupérer XP, niveau et statPoints à jour après gainXP
                        const currentState = get().gameState;
                        newState.xp = currentState.xp;
                        newState.level = currentState.level;
                        newState.xpToNextLevel = currentState.xpToNextLevel;
                        newState.statPoints = currentState.statPoints;

                        newState.currentScene = result.nextScene;
                        const resultScene = SCENES[newState.currentScene];
                        if (resultScene.consequence) {
                            newState = applyConsequence(newState, resultScene.consequence, (xp) => {
                                get().gainXP(xp);
                                // Récupérer à nouveau après le bonus d'XP
                                const updated = get().gameState;
                                newState.xp = updated.xp;
                                newState.level = updated.level;
                                newState.xpToNextLevel = updated.xpToNextLevel;
                                newState.statPoints = updated.statPoints;
                            });
                        }
                    } else {
                        newState.gameStatus = "ENDED_FAILURE";
                        newState.currentScene = result.nextScene || 'GAME_OVER';
                    }

                    newState.combatState = null;
                    // Récupérer le log final à jour
                    newState.log = [...get().gameState.log];
                    set({ gameState: newState });
                } else {
                    // Récupérer le log à jour après les modifications
                    result.gameState.log = [...get().gameState.log];
                    set({ gameState: result.gameState });
                }
            },

            // Gain XP and level up
            gainXP: (amount) => {
                const { updateLog } = get();
                updateLog(`[EXP] +${amount} XP gagnés.`);

                set((state) => {
                    const { newXP, newLevel, newXPToNext, statPointsGained } = calculateLevelUp(
                        state.gameState.xp + amount,
                        state.gameState.xpToNextLevel,
                        state.gameState.level
                    );

                    if (statPointsGained > 0) {
                        updateLog(`[NIVEAU SUPÉRIEUR] Vous êtes maintenant niveau ${newLevel} ! Vous avez ${statPointsGained} points à distribuer.`);
                    }

                    return {
                        gameState: {
                            ...state.gameState,
                            xp: newXP,
                            level: newLevel,
                            xpToNextLevel: newXPToNext,
                            statPoints: state.gameState.statPoints + statPointsGained
                        }
                    };
                });
            },

            // Spend stat point
            spendStatPoint: (stat) => {
                const { updateLog } = get();

                set((state) => {
                    if (state.gameState.statPoints <= 0) return state;

                    const newStats = {
                        ...state.gameState.pilotStats,
                        [stat]: state.gameState.pilotStats[stat] + 1
                    };

                    updateLog(`[STAT] ${stat} augmentée à ${newStats[stat]}.`);

                    return {
                        gameState: {
                            ...state.gameState,
                            pilotStats: newStats,
                            effectiveStats: calculateEffectiveStats(newStats),
                            statPoints: state.gameState.statPoints - 1
                        }
                    };
                });
            },

            // Save game
            saveGame: () => {
                // Zustand persist middleware handles this automatically
                const { updateLog } = get();
                updateLog('[SYSTÈME] Partie sauvegardée.');
            },

            // Load game
            loadGame: () => {
                // Zustand persist middleware handles this automatically
                const { updateLog } = get();
                updateLog('[SYSTÈME] Partie chargée.');
            }
        }),
        {
            name: 'mantle-rpg-storage',
            partialize: (state) => ({
                gameState: {
                    ...state.gameState,
                    log: state.gameState.log.slice(-50) // Only save last 50 log entries
                }
            })
        }
    )
);

export default useGameStore;
export { SCENES };

