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
const BASE_STATS_TOTAL = Object.keys(PILOT_BASE_STATS).length * PILOT_BASE_MIN; // 7 * 1 = 7
export const DISTRIBUTION_POOL = POOL_TOTAL - BASE_STATS_TOTAL; // 35 - 7 = 28 points à répartir
export const MANTES = {
    Phalange: {
        baseStats: { Force: 10, Agilité: 3, Vitesse: 3, Intelligence: 5, Lucidité: 5, QI_de_Combat: 5, Synchronisation: 4 },
        description: "Assaut Lourd. Capacité de résistance et de destruction maximale."
    },
    Aiguille: {
        baseStats: { Force: 4, Agilité: 10, Vitesse: 5, Intelligence: 4, Lucidité: 6, QI_de_Combat: 3, Synchronisation: 3 },
        description: "Reconnaissance et CQC. Maîtrise du mouvement et frappes chirurgicales."
    },
    Éclair: {
        baseStats: { Force: 3, Agilité: 5, Vitesse: 10, Intelligence: 3, Lucidité: 6, QI_de_Combat: 5, Synchronisation: 3 },
        description: "Interception Rapide. Idéal pour le flanc et les manœuvres d'évitement extrêmes."
    },
    Omni: {
        baseStats: { Force: 5, Agilité: 5, Vitesse: 5, Intelligence: 6, Lucidité: 5, QI_de_Combat: 5, Synchronisation: 4 },
        description: "Soutien et Commandement. Un équilibre parfait entre toutes les capacités."
    }
};

export const ENEMY_TYPES = {
    PHALANGE_LOURDE: {
        name: "Phalange Lourde FEU (Vague 2)",
        maxHP: 180,
        damageBase: 35,
        description: "Lourdement blindée, lente mais dévastatrice. Viser les articulations."
    },
    SYNTHESE_VOLKOV: {
        name: "Synthèse PXF-Volkov (Laboratoire Léviathan)",
        maxHP: 250,
        damageBase: 50,
        description: "Rapide, bio-mécanique et cherche à se synchroniser avec le pilote. Très dangereux au contact."
    }
};

// --- CLASSES DE DONNÉES (Pilot & Mante) ---
// Note: Les classes Pilot et Mante ne sont plus strictement nécessaires car l'état est géré dans gameState/game_logic.
// Elles sont ici pour la clarté des types si nécessaire, mais l'état est stocké dans gameState.
/*
export class Pilot {
    constructor(name, pilotStats) {
        this.name = name;
        this.stats = pilotStats;
        this.HP = 100; 
    }
}

export class Mante {
    constructor(type, pilotStats) {
        this.type = type;
        this.maxHP = pilotStats.Force * 10;
        this.HP = this.maxHP;
        this.effectiveStats = {};
        calculateEffectiveStats(pilotStats, this.effectiveStats);
    }
}
*/
