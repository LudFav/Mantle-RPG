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


// --- MODÈLES DE MANTES ---
// MISE À JOUR : Ajout des statistiques de défense et des HP de base fixes pour chaque type de Mante.
export const MANTES = {
    Phalange: {
        baseStats: { Force: 10, Agilité: 3, Vitesse: 3, Intelligence: 5, Lucidité: 5, QI_de_Combat: 5, Synchronisation: 4 },
        description: "Assaut Lourd. Capacité de résistance et de destruction maximale.",
        defenseStat: 'Force', // La défense est basée sur la robustesse et le blindage.
        maxHP: 300 // La plus résistante
    },
    Aiguille: {
        baseStats: { Force: 4, Agilité: 10, Vitesse: 5, Intelligence: 4, Lucidité: 6, QI_de_Combat: 3, Synchronisation: 3 },
        description: "Reconnaissance et CQC. Maîtrise du mouvement et frappes chirurgicales.",
        defenseStat: 'Agilité', // La défense est basée sur l'esquive.
        maxHP: 200 // Moins blindée, plus agile
    },
    Éclair: {
        baseStats: { Force: 3, Agilité: 5, Vitesse: 10, Intelligence: 3, Lucidité: 6, QI_de_Combat: 5, Synchronisation: 3 },
        description: "Interception Rapide. Idéal pour le flanc et les manœuvres d'évitement extrêmes.",
        defenseStat: 'Vitesse', // La défense est basée sur la vitesse pure pour éviter les tirs.
        maxHP: 200 // Très légère pour maximiser la vitesse
    },
    Omni: {
        baseStats: { Force: 5, Agilité: 5, Vitesse: 5, Intelligence: 6, Lucidité: 5, QI_de_Combat: 5, Synchronisation: 4 },
        description: "Soutien et Commandement. Un équilibre parfait entre toutes les capacités.",
        defenseStat: 'Adaptive', // Le pilote peut choisir quelle stat utiliser pour la défense.
        maxHP: 250 // Polyvalente et bien blindée
    }
};

// --- ATTAQUES SPÉCIALES DES MANTES ---
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


// --- TYPES D'ENNEMIS ---
// MISE À JOUR : Ajout de valeurs d'attaque et de défense pour rendre le combat plus tactique.
export const ENEMY_TYPES = {
    PHALANGE_LOURDE: {
        name: "Phalange Lourde FEU",
        maxHP: 180,
        description: "Lourdement blindée, lente mais dévastatrice. Viser les articulations.",
        attackBonus: 8, // Bonus au jet d'attaque (D20 + 8)
        defenseValue: 16, // Le joueur doit dépasser ce score pour toucher
        damageDice: { num: 2, sides: 10, bonus: 5 } // Dégâts : 2d10 + 5
    },
    SYNTHESE_VOLKOV: {
        name: "Synthèse PXF-Volkov",
        maxHP: 250,
        description: "Rapide, bio-mécanique et cherche à se synchroniser. Très dangereux au contact.",
        attackBonus: 11, // Bonus au jet d'attaque (D20 + 11)
        defenseValue: 18, // Plus difficile à toucher
        damageDice: { num: 3, sides: 8, bonus: 6 } // Dégâts : 3d8 + 6
    }
};
