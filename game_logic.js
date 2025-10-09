import { SCENES_DATA } from './data/scenes_index.js';
import { MANTES, PILOT_BASE_STATS, PILOT_BASE_MIN, POOL_TOTAL, ENEMY_TYPES, MANTE_SPECIAL_ATTACKS } from './models.js';
import { renderScene, updateLog, renderCombatScreen } from './ui_render.js';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

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
        gameStatus: "PLAYING", // PLAYING, ENDED_SUCCESS, ENDED_FAILURE
        combatState: null,
        sceneHistory: [],
        statusFlags: {}
    };
}

// État global du jeu, initialisé via la nouvelle fonction.
export let gameState = getInitialGameState();

// --- Initialisation des Scènes ---

// Construit l'objet SCENES à partir des données brutes pour plus de flexibilité.
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

// NOUVELLE FONCTION : Restaure les PV du joueur au début d'un nouvel acte.
function restoreForNewAct(actNumber) {
    updateLog(`[SYSTÈME] Début de l'Acte ${actNumber}. Mante et Pilote entièrement réparés.`);
    gameState.pilotHP = 100;
    const maxManteHP = MANTES[gameState.manteType].maxHP;
    gameState.manteHP = maxManteHP;
    gameState.manteMaxHP = maxManteHP;
    updateLog(`[RÉPARATION] PV du Pilote restaurés à 100.`);
    updateLog(`[RÉPARATION] PV de la Mante restaurés à ${maxManteHP}.`);
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

    // MISE À JOUR : Restauration entre les actes.
    if (nextSceneKey.startsWith('ACT_2_') && gameState.currentScene.startsWith('ACT_1_')) {
        restoreForNewAct("II");
    } else if (nextSceneKey.startsWith('ACT_3_') && gameState.currentScene.startsWith('ACT_2_')) {
        restoreForNewAct("III");
    }

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
        nextSceneSuccess: checkData.success,
        nextSceneFailure: checkData.failure,
        playerBuffs: [] // Pour les bonus temporaires comme la défense
    };
    updateLog(`[COMBAT ENGAGÉ] Contre : ${enemy.name}.`);
    renderCombatScreen();
}

// NOUVELLE FONCTION : Lance un nombre défini de dés avec un bonus.
function rollDice(num, sides, bonus) {
    let total = 0;
    for (let i = 0; i < num; i++) {
        total += Math.floor(Math.random() * sides) + 1;
    }
    return total + bonus;
}

// MISE À JOUR MAJEURE : La logique de combat utilise maintenant des jets d'attaque et de dégâts.
export function handleCombatChoice(action) {
    if (gameState.gameStatus !== "PLAYING" || !gameState.combatState) return;
    
    const combat = gameState.combatState;
    const enemy = ENEMY_TYPES[combat.enemyType];
    const manteInfo = MANTES[gameState.manteType];
    let playerTurnOver = false;

    updateLog(`--- Tour du Joueur ---`);

    // --- Action du Joueur ---
    switch (action) {
        case 'ATTACK_BASE':
        case 'ATTACK_SPECIAL': {
            const isSpecial = action === 'ATTACK_SPECIAL';
            const attackInfo = isSpecial ? MANTE_SPECIAL_ATTACKS[gameState.manteType] : { stat: 'QI_de_Combat', damageMult: 1.0 };
            const attackStatName = attackInfo.stat;
            const attackStatValue = gameState.pilotStats[attackStatName];
            
            const roll = Math.floor(Math.random() * 20) + 1;
            const totalAttack = roll + attackStatValue;

            updateLog(`[JET D'ATTAQUE] (${attackStatName}) D20(${roll}) + ${attackStatValue} = ${totalAttack} vs Défense Ennemie ${enemy.defenseValue}.`);

            if (totalAttack >= enemy.defenseValue) {
                // L'attaque touche ! Calcul des dégâts.
                const damageRoll = rollDice(1, 10, attackStatValue); // 1d10 + stat en dégâts
                const finalDamage = Math.round(damageRoll * attackInfo.damageMult);
                combat.enemyHP = Math.max(0, combat.enemyHP - finalDamage);
                updateLog(`[SUCCÈS] L'attaque touche ! Dégâts infligés : ${finalDamage} PV.`);
            } else {
                updateLog(`[ÉCHEC] L'attaque rate sa cible.`);
            }
            playerTurnOver = true;
            break;
        }
        case 'DEFEND': {
            updateLog(`[DÉFENSE] Vous vous préparez à encaisser l'attaque ennemie.`);
            combat.playerBuffs.push({ type: 'defense', value: 5, turns: 1 });
            playerTurnOver = true;
            break;
        }
        case 'SCAN': {
            updateLog(`[SCAN] ${enemy.name} | PV: ${combat.enemyHP}/${enemy.maxHP} | Défense: ${enemy.defenseValue} | Dégâts: ~${enemy.damageDice.num * enemy.damageDice.sides + enemy.damageDice.bonus}`);
            // Scanner ne termine pas le tour
            break;
        }
    }

    // --- Vérification de Victoire du Joueur ---
    if (combat.enemyHP <= 0) {
        updateLog(`[VICTOIRE] ${enemy.name} a été détruit !`);
        const nextScene = combat.nextSceneSuccess;
        gameState.combatState = null;
        renderScene(nextScene);
        saveGameLocal();
        return;
    }

    // --- Tour de l'Ennemi ---
    if (playerTurnOver) {
        updateLog(`--- Tour de l'Ennemi ---`);
        const playerDefenseStat = gameState.pilotStats[manteInfo.defenseStat];
        let playerDefenseValue = 10 + playerDefenseStat; // Base de 10 + stat de défense
        const defenseBuff = combat.playerBuffs.find(b => b.type === 'defense');
        if (defenseBuff) {
            playerDefenseValue += defenseBuff.value;
            updateLog(`[BONUS DÉFENSE] Votre défense est augmentée à ${playerDefenseValue} pour ce tour.`);
            defenseBuff.turns--;
        }
        combat.playerBuffs = combat.playerBuffs.filter(b => b.turns > 0); // Nettoyer les buffs expirés
        const enemyRoll = Math.floor(Math.random() * 20) + 1;
        const enemyTotalAttack = enemyRoll + enemy.attackBonus;
        updateLog(`[JET ENNEMI] D20(${enemyRoll}) + ${enemy.attackBonus} = ${enemyTotalAttack} vs Votre Défense ${playerDefenseValue}.`);
        if (enemyTotalAttack >= playerDefenseValue) {
            const enemyDamage = rollDice(enemy.damageDice.num, enemy.damageDice.sides, enemy.damageDice.bonus);
            updateLog(`[SUCCÈS ENNEMI] L'ennemi vous touche et inflige ${enemyDamage} PV.`);
            takeDamage(enemyDamage);
        } else {
            updateLog(`[ÉCHEC ENNEMI] L'attaque ennemie vous manque !`);
        }
    }

    if (gameState.pilotHP <= 0) {
        return;
    }
    renderCombatScreen();
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
        if (gameState.combatState) {
            const nextScene = gameState.combatState.nextSceneFailure;
            gameState.combatState = null;
            renderScene(nextScene);
        } else {
            renderScene('GAME_OVER');
        }
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

    gameState.name = name;
    gameState.manteType = manteType;
    gameState.pilotStats = stats;
    gameState.pilotHP = 100;
    const maxManteHP = MANTES[manteType].maxHP;
    gameState.manteHP = maxManteHP;
    gameState.manteMaxHP = maxManteHP;
    calculateEffectiveStats();
    gameState.reputation = { CEL: 5, FEU: 5, Aetheria: 0 };
    gameState.log = [
        `[Départ] ${name} a choisi l'ECA Mante ${manteType}.`,
        `[Stats Pilote] F:${stats.Force}, A:${stats.Agilité}, V:${stats.Vitesse}, I:${stats.Intelligence}, L:${stats.Lucidité}, QC:${stats.QI_de_Combat}, S:${stats.Synchronisation}.`,
        `[Stats Mante] F:${gameState.effectiveStats.Force}, A:${gameState.effectiveStats.Agilité}, V:${gameState.effectiveStats.Vitesse}. PV Mante: ${gameState.manteHP}/${gameState.manteMaxHP}.`
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
    gameState = getInitialGameState();
    try { 
        localStorage.removeItem(getLocalStorageKey()); 
    } catch (_) {}
    renderScene("LORE_INTRO");
}


// --- Sauvegarde et Chargement ---

function getLocalStorageKey() {
    return `mantle_save_${appId}`;
}

export function saveGameLocal() {
    try {
        const stateToSave = { ...gameState };
        stateToSave.log = stateToSave.log.slice(-50); // Limite la taille du log
        localStorage.setItem(getLocalStorageKey(), JSON.stringify(stateToSave));
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
        calculateEffectiveStats();

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


