import { ENEMY_TYPES, MANTES, MANTE_SPECIAL_ATTACKS } from '../constants/models.js';
import { rollDice } from './helpers.js';

// Messages variés pour les attaques
const ATTACK_MESSAGES = {
    criticalSuccess: [
        "Point faible identifié ! Frappe dévastatrice !",
        "Synchronisation parfaite ! Coup critique !",
        "Trajectoire optimale atteinte ! Impact maximal !",
        "Les systèmes s'alignent ! Frappe létale !"
    ],
    majorSuccess: [
        "Impact solide ! Les servomoteurs résonnent !",
        "Touché direct ! Les capteurs confirment les dégâts !",
        "Frappe précise ! L'ennemi vacille !",
        "Connexion parfaite ! La cible est atteinte !"
    ],
    minorSuccess: [
        "L'attaque érafle à peine la cible...",
        "Impact superficiel détecté.",
        "Touche, mais les dégâts sont minimes.",
        "Frappe glissante, peu de dommages infligés."
    ],
    miss: [
        "Raté ! L'ennemi esquive avec agilité.",
        "Manqué ! Les servos se désynchronisent momentanément.",
        "Échec ! La cible anticipe le mouvement.",
        "Aucun impact ! L'ennemi dévie l'attaque."
    ],
    criticalFailure: [
        "ERREUR SYSTÈME ! Surcharge détectée !",
        "DÉFAILLANCE ! Feedback négatif dans les circuits !",
        "ALERTE ! Surchauffe des servomoteurs !",
        "CRITIQUE ! Déséquilibre du système de combat !"
    ]
};

const ENEMY_ATTACK_MESSAGES = {
    criticalSuccess: [
        "ALERTE ROUGE ! Impact critique détecté !",
        "DANGER ! Frappe dévastatrice ennemie !",
        "SYSTÈME EN PÉRIL ! Coup critique reçu !",
        "URGENCE ! Dommages massifs détectés !"
    ],
    majorSuccess: [
        "Impact ennemi confirmé ! Dégâts modérés.",
        "Touché ! Les blindages absorbent partiellement.",
        "Frappe ennemie efficace ! Systèmes endommagés.",
        "Attaque reçue ! Intégrité structurelle affectée."
    ],
    minorSuccess: [
        "Impact mineur. Les boucliers tiennent bon.",
        "Éraflure détectée. Dégâts négligeables.",
        "Touche superficielle. Systèmes intacts.",
        "Frappe faible absorbée par l'armure."
    ],
    miss: [
        "Esquive réussie ! L'attaque passe à côté.",
        "Évité ! Les contre-mesures fonctionnent.",
        "Manqué ! Trajectoire prédite et évitée.",
        "Raté ! L'ennemi n'a pas anticipé le mouvement."
    ]
};

const DEFENSE_MESSAGES = [
    "Position défensive adoptée. Boucliers à pleine puissance.",
    "Systèmes de défense activés. Prêt à encaisser.",
    "Mode protection engagé. Capteurs en alerte maximale.",
    "Formation défensive. Les servos se verrouillent."
];

const SCAN_MESSAGES = [
    "Analyse en cours... Données ennemies extraites.",
    "Scan tactique complet. Vulnérabilités identifiées.",
    "Balayage des systèmes adverses terminé.",
    "Reconnaissance achevée. Profil ennemi mis à jour."
];

function getRandomMessage(messageArray) {
    return messageArray[Math.floor(Math.random() * messageArray.length)];
}

function getDamageLevel(damage, maxHP) {
    const ratio = damage / maxHP;
    if (ratio >= 0.25) return 'major';
    if (ratio >= 0.1) return 'moderate';
    return 'minor';
}

export function initCombat(checkData) {
    const enemy = ENEMY_TYPES[checkData.enemyType];
    return {
        enemyType: checkData.enemyType,
        enemyHP: enemy.maxHP,
        enemyMaxHP: enemy.maxHP,
        nextSceneSuccess: checkData.success,
        nextSceneFailure: checkData.failure,
        playerBuffs: [],
        enemyBuffs: []
    };
}

export function executeCombatAction(action, gameState, updateLog) {
    const combat = gameState.combatState;
    if (!combat) return { gameState, combatEnded: false };

    const enemy = ENEMY_TYPES[combat.enemyType];
    const mante = MANTES[gameState.manteType];
    let playerTurnOver = false;
    let newState = { ...gameState };

    // TOUR DU JOUEUR
    if (action === 'ATTACK_BASE' || action === 'ATTACK_SPECIAL' || action === 'ATTACK_PRECISE' ||
        action === 'ATTACK_HEAVY' || action === 'ATTACK_BURST' || action === 'ATTACK_EXECUTE') {
        const result = executePlayerAttack(action, newState, enemy, updateLog);
        newState = result.newState;
        playerTurnOver = true;
    } else if (action === 'DEFEND') {
        newState.combatState.playerBuffs.push({ type: 'defense', value: 5, turns: 1 });
        updateLog(`[DEFENSE] ${getRandomMessage(DEFENSE_MESSAGES)}`);
        playerTurnOver = true;
    } else if (action === 'EVADE') {
        newState.combatState.playerBuffs.push({ type: 'evasion', value: 3, turns: 1 });
        newState.manteEnergy = Math.max(0, newState.manteEnergy - 10);
        updateLog(`[ÉVASION] Manœuvre évasive engagée ! Chance d'esquive augmentée. (-10 Énergie)`);
        playerTurnOver = true;
    } else if (action === 'OVERCHARGE') {
        if (newState.manteEnergy >= 20) {
            newState.combatState.playerBuffs.push({ type: 'overcharge', value: 1.5, turns: 2 });
            newState.manteEnergy -= 20;
            updateLog(`[SURCHARGE] Systèmes de combat en surpuissance ! Dégâts augmentés pour 2 tours. (-20 Énergie)`);
            playerTurnOver = true;
        } else {
            updateLog(`[ÉNERGIE] Énergie insuffisante pour la surcharge (20 requis).`);
            return { gameState: newState, combatEnded: false };
        }
    } else if (action === 'SCAN') {
        updateLog(`[SCAN] ${getRandomMessage(SCAN_MESSAGES)}`);
        updateLog(`[SCAN] ${enemy.name} | PV: ${newState.combatState.enemyHP}/${enemy.maxHP} | Défense: ${enemy.defenseValue}`);
    } else if (action === 'REPAIR') {
        const healAmount = Math.floor(gameState.pilotStats.Intelligence * 5);
        newState.manteHP = Math.min(newState.manteMaxHP, newState.manteHP + healAmount);
        newState.manteEnergy = Math.max(0, newState.manteEnergy - 15);
        updateLog(`[RÉPARATION] Nano-réparateurs activés ! +${healAmount} PV Mante. (-15 Énergie)`);
        playerTurnOver = true;
    } else if (action === 'COUNTER') {
        if (newState.manteEnergy >= 12) {
            newState.combatState.playerBuffs.push({ type: 'counter', value: 1, turns: 1 });
            newState.manteEnergy -= 12;
            updateLog(`[CONTRE] Posture de contre-attaque adoptée ! Riposte automatique si touché. (-12 Énergie)`);
            playerTurnOver = true;
        } else {
            updateLog(`[ÉNERGIE] Énergie insuffisante pour la contre-attaque (12 requis).`);
            return { gameState: newState, combatEnded: false };
        }
    } else if (action === 'SHIELD_REGENERATE') {
        if (newState.manteEnergy >= 30) {
            newState.combatState.playerBuffs.push({ type: 'shield', value: 50, turns: 1 });
            newState.manteEnergy -= 30;
            updateLog(`[BOUCLIER] 🔰 Bouclier d'urgence activé ! Absorbe 50 dégâts au prochain tour. (-30 Énergie)`);
            playerTurnOver = true;
        } else {
            updateLog(`[ÉNERGIE] Énergie insuffisante pour le bouclier (30 requis).`);
            return { gameState: newState, combatEnded: false };
        }
    } else if (action === 'ENERGY_DRAIN') {
        if (newState.manteEnergy >= 10) {
            const drainAmount = rollDice(2, 6, gameState.pilotStats.Intelligence);
            newState.manteEnergy = Math.min(newState.manteMaxEnergy, newState.manteEnergy - 10 + drainAmount);
            updateLog(`[DRAIN] 🌀 Siphon énergétique ! +${drainAmount - 10} Énergie nette récupérée.`);
            playerTurnOver = true;
        } else {
            updateLog(`[ÉNERGIE] Énergie insuffisante pour le drain (10 requis).`);
            return { gameState: newState, combatEnded: false };
        }
    } else if (action === 'SYNCHRONIZATION_ULTIMATE') {
        if (newState.manteEnergy >= 50) {
            const ultimateDamage = Math.round(rollDice(3, 20, gameState.pilotStats.Synchronisation) * 5);
            newState.combatState.enemyHP = Math.max(0, newState.combatState.enemyHP - ultimateDamage);
            newState.manteEnergy = 0; // Consomme toute l'énergie
            updateLog(`[ULTIME] ✨ SYNCHRONISATION ULTIME ! Le pilote et la Mante ne font qu'un !`);
            updateLog(`[ULTIME] 💥 Dégâts dévastateurs : ${ultimateDamage} ! (Toute l'énergie consommée)`);
            playerTurnOver = true;
        } else {
            updateLog(`[ÉNERGIE] Énergie insuffisante pour l'ultime (50 requis).`);
            return { gameState: newState, combatEnded: false };
        }
    }

    // Vérifier si l'ennemi est vaincu
    if (newState.combatState.enemyHP <= 0) {
        updateLog(`[VICTOIRE] ⚡ ${enemy.name} neutralisé ! Systèmes ennemis hors ligne.`);
        return {
            gameState: newState,
            combatEnded: true,
            victory: true,
            xpReward: enemy.xpReward,
            nextScene: combat.nextSceneSuccess
        };
    }

    // TOUR DE L'ENNEMI
    if (playerTurnOver) {
        newState = executeEnemyTurn(newState, enemy, mante, updateLog);

        // Régénération d'énergie
        const energyRegen = 5 + Math.floor(gameState.pilotStats.Synchronisation / 2);
        newState.manteEnergy = Math.min(newState.manteMaxEnergy, newState.manteEnergy + energyRegen);
        updateLog(`[ÉNERGIE] +${energyRegen} Énergie récupérée.`);

        // Mise à jour des buffs
        newState.combatState.playerBuffs = newState.combatState.playerBuffs
            .map(b => ({ ...b, turns: b.turns - 1 }))
            .filter(b => b.turns > 0);
        newState.combatState.enemyBuffs = (newState.combatState.enemyBuffs || [])
            .map(b => ({ ...b, turns: b.turns - 1 }))
            .filter(b => b.turns > 0);
    }

    // Vérifier si le pilote est vaincu
    if (newState.pilotHP <= 0 || newState.manteHP <= 0) {
        updateLog(`[CRITIQUE] 💀 Systèmes critiques ! Mission compromise !`);
        return {
            gameState: newState,
            combatEnded: true,
            victory: false,
            nextScene: combat.nextSceneFailure
        };
    }

    return { gameState: newState, combatEnded: false };
}

function executePlayerAttack(action, gameState, enemy, updateLog) {
    let newState = { ...gameState };
    const specialAttack = MANTE_SPECIAL_ATTACKS[gameState.manteType];

    // Définir les paramètres d'attaque selon le type
    let attack, attackName;
    switch (action) {
        case 'ATTACK_SPECIAL':
            attack = { ...specialAttack, damageMult: specialAttack.damageMult };
            attackName = specialAttack.name;
            break;
        case 'ATTACK_PRECISE':
            attack = { stat: 'Agilité', damageMult: 0.8, cost: 5, bonus: 3 };
            attackName = "Frappe Précise";
            break;
        case 'ATTACK_HEAVY':
            attack = { stat: 'Force', damageMult: 1.5, cost: 10, bonus: -2 };
            attackName = "Frappe Lourde";
            break;
        default: // ATTACK_BASE
            attack = { stat: 'QI_de_Combat', damageMult: 1.0, cost: 0, bonus: 0 };
            attackName = "Attaque Standard";
    }

    // Vérifier l'énergie
    if (newState.manteEnergy < attack.cost) {
        updateLog(`[ÉNERGIE] Pas assez d'énergie pour ${attackName} (${attack.cost} requis).`);
        return { newState };
    }

    newState.manteEnergy -= attack.cost;

    // Gestion spéciale pour Exécution
    if (attack.executeThreshold) {
        const enemyHPRatio = newState.combatState.enemyHP / enemy.maxHP;
        if (enemyHPRatio > attack.executeThreshold) {
            updateLog(`[ATTAQUE] ✗ ${attackName} - Échec ! Cible au-dessus de 30% PV (${Math.floor(enemyHPRatio * 100)}%).`);
            updateLog(`[ÉNERGIE] Énergie gaspillée : ${attack.cost}.`);
            return { newState };
        }
    }

    // Gestion spéciale pour Salve Rapide (3 attaques)
    if (attack.burst) {
        let totalDamage = 0;
        let hits = 0;
        updateLog(`[ATTAQUE] 🔫 ${attackName} - Tir en rafale initié !`);

        for (let i = 0; i < attack.burst; i++) {
            const diceRoll = rollDice(1, 20, 0);
            const attackBonus = gameState.pilotStats[attack.stat];
            const totalAttack = diceRoll + attackBonus;

            if (totalAttack >= enemy.defenseValue) {
                const damage = Math.round(rollDice(1, 10, gameState.pilotStats[attack.stat]) * attack.damageMult);
                totalDamage += damage;
                hits++;
            }
        }

        if (hits > 0) {
            newState.combatState.enemyHP = Math.max(0, newState.combatState.enemyHP - totalDamage);
            updateLog(`[ATTAQUE] ✓ ${hits}/${attack.burst} tirs touchés ! Dégâts totaux : ${totalDamage}.`);
        } else {
            updateLog(`[ATTAQUE] ✗ Toutes les salves manquées ! Aucun impact.`);
        }
        updateLog(`[ÉNERGIE] Coût : ${attack.cost} énergie.`);
        return { newState };
    }

    // Jet d'attaque avec bonus/malus
    const diceRoll = rollDice(1, 20, 0);
    const attackBonus = gameState.pilotStats[attack.stat] + (attack.bonus || 0);
    const totalAttack = diceRoll + attackBonus;

    // Gestion des critiques
    const isCriticalSuccess = diceRoll === 20;
    const isCriticalFailure = diceRoll === 1;

    if (isCriticalFailure) {
        // Échec critique : dégâts auto-infligés
        const selfDamage = Math.floor(gameState.pilotStats.Force * 5);
        newState = takeDamage(newState, selfDamage);
        updateLog(`[ATTAQUE] ❌ ${attackName} - ${getRandomMessage(ATTACK_MESSAGES.criticalFailure)}`);
        updateLog(`[CRITIQUE] 💥 Auto-dommages : ${selfDamage} PV ! (Jet: ${diceRoll})`);
    } else if (totalAttack >= enemy.defenseValue || isCriticalSuccess) {
        // Calcul des dégâts de base
        let baseDamage = rollDice(1, 10, gameState.pilotStats[attack.stat]);

        // Appliquer multiplicateur d'attaque
        let damage = Math.round(baseDamage * attack.damageMult);

        // Appliquer buff de surcharge
        const overchargeBuff = newState.combatState.playerBuffs.find(b => b.type === 'overcharge');
        if (overchargeBuff) {
            damage = Math.round(damage * overchargeBuff.value);
        }

        // Critique : x2 dégâts
        if (isCriticalSuccess) {
            damage *= 2;
        }

        newState.combatState.enemyHP = Math.max(0, newState.combatState.enemyHP - damage);

        // Message selon le type de succès et les dégâts
        if (isCriticalSuccess) {
            updateLog(`[ATTAQUE] ⚡ ${attackName} - ${getRandomMessage(ATTACK_MESSAGES.criticalSuccess)}`);
            updateLog(`[CRITIQUE] 💥 SUCCÈS CRITIQUE ! Dégâts : ${damage} (x2) ! (Jet: 20 naturel)`);
        } else {
            const damageLevel = getDamageLevel(damage, enemy.maxHP);
            const message = damageLevel === 'major' ? getRandomMessage(ATTACK_MESSAGES.majorSuccess) :
                damageLevel === 'moderate' ? getRandomMessage(ATTACK_MESSAGES.majorSuccess) :
                    getRandomMessage(ATTACK_MESSAGES.minorSuccess);
            updateLog(`[ATTAQUE] ✓ ${attackName} - ${message}`);
            updateLog(`[ATTAQUE] Dégâts infligés : ${damage}. (Jet: ${diceRoll}+${attackBonus}=${totalAttack})`);
        }

        if (attack.cost > 0) {
            updateLog(`[ÉNERGIE] Coût : ${attack.cost} énergie.`);
        }
    } else {
        // Attaque manquée
        updateLog(`[ATTAQUE] ✗ ${attackName} - ${getRandomMessage(ATTACK_MESSAGES.miss)}`);
        updateLog(`[ATTAQUE] Échec. (Jet: ${diceRoll}+${attackBonus}=${totalAttack} vs Défense: ${enemy.defenseValue})`);
        if (attack.cost > 0) {
            updateLog(`[ÉNERGIE] Énergie gaspillée : ${attack.cost}.`);
        }
    }

    return { newState };
}

function executeEnemyTurn(gameState, enemy, mante, updateLog) {
    let newState = { ...gameState };

    // Calculer la défense du joueur
    let playerDefense = 10 + gameState.pilotStats[mante.defenseStat];
    const defenseBuff = newState.combatState.playerBuffs.find(b => b.type === 'defense');
    if (defenseBuff) playerDefense += defenseBuff.value;

    const evasionBuff = newState.combatState.playerBuffs.find(b => b.type === 'evasion');
    if (evasionBuff) playerDefense += evasionBuff.value;

    // Jet d'attaque ennemi
    const diceRoll = rollDice(1, 20, 0);
    const enemyAttack = diceRoll + enemy.attackBonus;

    const isCriticalSuccess = diceRoll === 20;
    const isCriticalFailure = diceRoll === 1;

    if (isCriticalFailure) {
        updateLog(`[ENNEMI] ✓ ${getRandomMessage(ENEMY_ATTACK_MESSAGES.miss)}`);
        updateLog(`[ENNEMI] L'attaque ennemie échoue complètement ! (Jet: 1 naturel)`);
    } else if (enemyAttack >= playerDefense || isCriticalSuccess) {
        let damage = rollDice(enemy.damageDice.num, enemy.damageDice.sides, enemy.damageDice.bonus);

        // Critique : x2 dégâts
        if (isCriticalSuccess) {
            damage *= 2;
        }

        // Vérifier le bouclier
        const shieldBuff = newState.combatState.playerBuffs.find(b => b.type === 'shield');
        if (shieldBuff) {
            const absorbed = Math.min(damage, shieldBuff.value);
            damage = Math.max(0, damage - absorbed);
            updateLog(`[BOUCLIER] 🔰 Bouclier absorbe ${absorbed} dégâts ! Dégâts restants : ${damage}.`);
        }

        newState = takeDamage(newState, damage, updateLog);

        // Contre-attaque si le buff est actif
        const counterBuff = newState.combatState.playerBuffs.find(b => b.type === 'counter');
        if (counterBuff && damage > 0) {
            const counterDamage = Math.round(rollDice(1, 8, gameState.pilotStats.QI_de_Combat));
            newState.combatState.enemyHP = Math.max(0, newState.combatState.enemyHP - counterDamage);
            updateLog(`[CONTRE] 🔄 Riposte automatique ! ${counterDamage} dégâts infligés à l'ennemi !`);
        }

        if (isCriticalSuccess) {
            updateLog(`[ENNEMI] 💀 ${getRandomMessage(ENEMY_ATTACK_MESSAGES.criticalSuccess)}`);
            updateLog(`[CRITIQUE] 🔴 CRITIQUE ENNEMI ! Dégâts : ${damage} (x2) ! (Jet: 20 naturel)`);
        } else {
            const damageLevel = getDamageLevel(damage, gameState.manteMaxHP);
            const message = damageLevel === 'major' ? getRandomMessage(ENEMY_ATTACK_MESSAGES.majorSuccess) :
                damageLevel === 'moderate' ? getRandomMessage(ENEMY_ATTACK_MESSAGES.majorSuccess) :
                    getRandomMessage(ENEMY_ATTACK_MESSAGES.minorSuccess);
            updateLog(`[ENNEMI] ⚠ ${message}`);
            updateLog(`[ENNEMI] Dégâts subis : ${damage}. (Jet: ${diceRoll}+${enemy.attackBonus}=${enemyAttack})`);
        }
    } else {
        updateLog(`[ENNEMI] ✓ ${getRandomMessage(ENEMY_ATTACK_MESSAGES.miss)}`);
        updateLog(`[ENNEMI] Attaque évitée ! (Jet: ${diceRoll}+${enemy.attackBonus}=${enemyAttack} vs Défense: ${playerDefense})`);
    }

    return newState;
}

function takeDamage(gameState, amount, updateLog) {
    const newState = { ...gameState };
    const overflow = amount - newState.manteHP;
    newState.manteHP = Math.max(0, newState.manteHP - amount);
    if (overflow > 0) {
        newState.pilotHP = Math.max(0, newState.pilotHP - overflow);
        if (updateLog) {
            updateLog(`[ALERTE] 🚨 Dégâts transférés au pilote : ${overflow} PV !`);
        }
    }
    return newState;
}
