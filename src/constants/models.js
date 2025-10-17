export const PILOT_BASE_MIN = 1;

export const PILOT_BASE_STATS = {
    Force: PILOT_BASE_MIN,
    Agilité: PILOT_BASE_MIN,
    Vitesse: PILOT_BASE_MIN,
    Intelligence: PILOT_BASE_MIN,
    Lucidité: PILOT_BASE_MIN,
    QI_de_Combat: PILOT_BASE_MIN,
    Synchronisation: PILOT_BASE_MIN
};

export const POOL_TOTAL = 35;
export const DISTRIBUTION_POOL = POOL_TOTAL - (Object.keys(PILOT_BASE_STATS).length * PILOT_BASE_MIN);

export const MANTES = {
    Phalange: {
        baseStats: { Force: 7, Agilité: 4, Vitesse: 5, Intelligence: 6, Lucidité: 6, QI_de_Combat: 4, Synchronisation: 3 },
        description: "Assaut Lourd. Capacité de résistance et de destruction maximale.",
        maxHP: 300,
        maxEnergy: 80, // Moins d'énergie, plus de PV
        defenseStat: 'Force',
        statRestrictions: {
            Force: { min: 7, max: 18 },
            Agilité: { min: 1, max: 4 },
            Vitesse: { min: 1, max: 5 },
            Intelligence: { min: 1, max: 18 },
            Lucidité: { min: 1, max: 18 },
            QI_de_Combat: { min: 1, max: 18 },
            Synchronisation: { min: 1, max: 18 }
        }
    },
    Aiguille: {
        baseStats: { Force: 3, Agilité: 7, Vitesse: 6, Intelligence: 5, Lucidité: 5, QI_de_Combat: 4, Synchronisation: 5 },
        description: "Reconnaissance et CQC. Maîtrise du mouvement et frappes chirurgicales.",
        maxHP: 200,
        maxEnergy: 120, // Plus d'énergie, moins de PV
        defenseStat: 'Agilité',
        statRestrictions: {
            Force: { min: 1, max: 3 },
            Agilité: { min: 7, max: 18 },
            Vitesse: { min: 1, max: 6 },
            Intelligence: { min: 1, max: 18 },
            Lucidité: { min: 1, max: 18 },
            QI_de_Combat: { min: 1, max: 18 },
            Synchronisation: { min: 1, max: 18 }
        }
    },
    Éclair: {
        baseStats: { Force: 6, Agilité: 4, Vitesse: 7, Intelligence: 4, Lucidité: 5, QI_de_Combat: 4, Synchronisation: 5 },
        description: "Interception Rapide. Idéal pour le flanc et les manœuvres d'évitement extrêmes.",
        maxHP: 200,
        maxEnergy: 110,
        defenseStat: 'Vitesse',
        statRestrictions: {
            Force: { min: 1, max: 6 },
            Agilité: { min: 1, max: 4 },
            Vitesse: { min: 7, max: 18 },
            Intelligence: { min: 1, max: 18 },
            Lucidité: { min: 1, max: 18 },
            QI_de_Combat: { min: 1, max: 18 },
            Synchronisation: { min: 1, max: 18 }
        }
    },
    Omni: {
        baseStats: { Force: 5, Agilité: 5, Vitesse: 5, Intelligence: 6, Lucidité: 5, QI_de_Combat: 5, Synchronisation: 4 },
        description: "Soutien et Commandement. Un équilibre parfait entre toutes les capacités.",
        maxHP: 250,
        maxEnergy: 100,
        defenseStat: 'Adaptive',
        statRestrictions: {
            Force: { min: 1, max: 18 },
            Agilité: { min: 1, max: 18 },
            Vitesse: { min: 1, max: 18 },
            Intelligence: { min: 1, max: 18 },
            Lucidité: { min: 1, max: 18 },
            QI_de_Combat: { min: 1, max: 18 },
            Synchronisation: { min: 1, max: 18 }
        }
    }
};

export const MANTE_SPECIAL_ATTACKS = {
    Phalange: { name: "Écrasement d'Assaut", stat: "Force", damageMult: 2.0, cost: 30 },
    Aiguille: { name: "Frappe Chirurgicale", stat: "Agilité", damageMult: 1.5, cost: 20 },
    Éclair: { name: "Surcharge de Vitesse", stat: "Vitesse", damageMult: 1.5, cost: 25 },
    Omni: { name: "Défaillance Systémique", stat: "Synchronisation", damageMult: 1.2, cost: 15 }
};

export const ENEMY_TYPES = {
    PHALANGE_LOURDE: {
        name: "Phalange Lourde FEU (Vague 2)",
        maxHP: 180,
        attackBonus: 4,
        defenseValue: 14,
        damageDice: { num: 2, sides: 8, bonus: 2 }, // 2d8+2
        xpReward: 75,
        description: "Lourdement blindée, lente mais dévastatrice."
    },
    MERCENAIRE_AETHERIA: {
        name: "Mercenaire Aetheria 'Spectre'",
        maxHP: 120,
        attackBonus: 6,
        defenseValue: 16,
        damageDice: { num: 3, sides: 6, bonus: 3 }, // 3d6+3
        xpReward: 60,
        description: "Unité rapide et précise, équipée de prototypes Aetheria."
    },
    SYNTHESE_VOLKOV: {
        name: "Synthèse PXF-Volkov (Boss)",
        maxHP: 250,
        attackBonus: 8,
        defenseValue: 18,
        damageDice: { num: 4, sides: 8, bonus: 5 }, // 4d8+5
        xpReward: 200,
        description: "Rapide, bio-mécanique et cherche à se synchroniser avec le pilote."
    }
};

