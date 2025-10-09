// --- CONSTANTES DE BASE DU PILOTE ---

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
const BASE_STATS_TOTAL = Object.keys(PILOT_BASE_STATS).length * PILOT_BASE_MIN; 
export const DISTRIBUTION_POOL = POOL_TOTAL - BASE_STATS_TOTAL;


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

export const MANTE_SPECIAL_ATTACKS = {
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
