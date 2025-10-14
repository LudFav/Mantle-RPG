// Définition de toutes les actions de combat avec leurs conditions de déblocage

export const COMBAT_ACTIONS = {
    // ATTAQUES - Toujours disponibles de base
    ATTACK_BASE: {
        category: 'attack',
        name: 'Attaque Standard',
        description: 'Attaque de base sans coût',
        energyCost: 0,
        unlockLevel: 1,
        icon: '⚔️'
    },
    ATTACK_SPECIAL: {
        category: 'attack',
        name: 'Attaque Spéciale',
        description: 'Attaque puissante unique à votre Mante',
        energyCost: 'variable', // Dépend de la Mante
        unlockLevel: 1,
        icon: '💫'
    },

    // ATTAQUES AVANCÉES - Niveau 2+
    ATTACK_PRECISE: {
        category: 'attack',
        name: 'Frappe Précise',
        description: '+3 Toucher, -20% Dégâts',
        energyCost: 5,
        unlockLevel: 2,
        icon: '🎯'
    },
    ATTACK_HEAVY: {
        category: 'attack',
        name: 'Frappe Lourde',
        description: '-2 Toucher, +50% Dégâts',
        energyCost: 10,
        unlockLevel: 2,
        icon: '🔨'
    },

    // ATTAQUES EXPERTES - Niveau 3+
    ATTACK_BURST: {
        category: 'attack',
        name: 'Salve Rapide',
        description: '3 attaques rapides à -30% dégâts chacune',
        energyCost: 15,
        unlockLevel: 3,
        icon: '🔫'
    },
    ATTACK_EXECUTE: {
        category: 'attack',
        name: 'Exécution',
        description: 'x3 dégâts si ennemi < 30% PV',
        energyCost: 25,
        unlockLevel: 4,
        icon: '💀'
    },

    // TACTIQUES - Disponibles de base
    DEFEND: {
        category: 'tactical',
        name: 'Défense',
        description: '+5 Défense pour 1 tour',
        energyCost: 0,
        unlockLevel: 1,
        icon: '🛡️'
    },
    SCAN: {
        category: 'tactical',
        name: 'Scan',
        description: 'Analyse l\'ennemi',
        energyCost: 0,
        unlockLevel: 1,
        icon: '📡'
    },

    // TACTIQUES AVANCÉES - Niveau 2+
    EVADE: {
        category: 'tactical',
        name: 'Évasion',
        description: '+3 Esquive pour 1 tour',
        energyCost: 10,
        unlockLevel: 2,
        icon: '💨'
    },
    COUNTER: {
        category: 'tactical',
        name: 'Contre-Attaque',
        description: 'Riposte automatique si touché',
        energyCost: 12,
        unlockLevel: 3,
        icon: '🔄'
    },

    // SPÉCIALES - Niveau 2+
    OVERCHARGE: {
        category: 'special',
        name: 'Surcharge',
        description: '+50% Dégâts pour 2 tours',
        energyCost: 20,
        unlockLevel: 2,
        icon: '⚡'
    },
    REPAIR: {
        category: 'special',
        name: 'Réparation',
        description: 'Soigne la Mante (Int × 5 PV)',
        energyCost: 15,
        unlockLevel: 2,
        icon: '🔧'
    },

    // SPÉCIALES EXPERTES - Niveau 3+
    SHIELD_REGENERATE: {
        category: 'special',
        name: 'Bouclier d\'Urgence',
        description: 'Absorbe 50 dégâts pour 1 tour',
        energyCost: 30,
        unlockLevel: 3,
        icon: '🔰'
    },
    ENERGY_DRAIN: {
        category: 'special',
        name: 'Drain Énergétique',
        description: 'Vol d\'énergie de l\'ennemi',
        energyCost: 10,
        unlockLevel: 4,
        icon: '🌀'
    },

    // ULTIME - Niveau 5
    SYNCHRONIZATION_ULTIMATE: {
        category: 'ultimate',
        name: 'Synchronisation Ultime',
        description: 'x5 dégâts, consomme toute l\'énergie',
        energyCost: 50,
        unlockLevel: 5,
        icon: '✨'
    }
};

// Grouper les actions par catégorie
export const COMBAT_ACTIONS_BY_CATEGORY = {
    attack: ['ATTACK_BASE', 'ATTACK_SPECIAL', 'ATTACK_PRECISE', 'ATTACK_HEAVY', 'ATTACK_BURST', 'ATTACK_EXECUTE'],
    tactical: ['DEFEND', 'SCAN', 'EVADE', 'COUNTER'],
    special: ['OVERCHARGE', 'REPAIR', 'SHIELD_REGENERATE', 'ENERGY_DRAIN'],
    ultimate: ['SYNCHRONIZATION_ULTIMATE']
};

// Fonction pour vérifier si une action est débloquée
export function isActionUnlocked(actionKey, playerLevel) {
    const action = COMBAT_ACTIONS[actionKey];
    return action && playerLevel >= action.unlockLevel;
}

// Fonction pour obtenir toutes les actions débloquées
export function getUnlockedActions(playerLevel) {
    return Object.keys(COMBAT_ACTIONS).filter(key =>
        isActionUnlocked(key, playerLevel)
    );
}

// Fonction pour obtenir les actions par catégorie débloquées
export function getUnlockedActionsByCategory(category, playerLevel) {
    return COMBAT_ACTIONS_BY_CATEGORY[category].filter(key =>
        isActionUnlocked(key, playerLevel)
    );
}


