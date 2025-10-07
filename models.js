// --- CONSTANTES STATISTIQUES ---

// Statistiques de base du Pilote (utilisées pour les checks D20)
export const BASE_STATS = ['Force', 'Agilité', 'Vitesse', 'Intelligence', 'Lucidité', 'QI_de_Combat', 'Synchronisation'];
export const PILOT_BASE_MIN = 1; // Minimum pour chaque stat
export const POOL_TOTAL = 35;    // Total des points à distribuer (Augmenté de 25 à 35)

// --- DÉFINITIONS DES MANTES (Types et Distributions Recommandées) ---
// La somme de chaque distribution doit être égale à POOL_TOTAL (35)
export const MANTE_TYPES = {
    Phalange: {
        // Nouvelle somme: 35. Fort en Force et QI_de_Combat.
        pilotDistribution: { Force: 10, Agilité: 2, Vitesse: 2, Intelligence: 6, Lucidité: 3, QI_de_Combat: 7, Synchronisation: 5 },
        description: "Assaut Lourd. Haute résistance. Optimisée pour l'impact et la tactique."
    },
    Aiguille: {
        // Nouvelle somme: 35. Fort en Agilité et Intelligence.
        pilotDistribution: { Force: 2, Agilité: 10, Vitesse: 5, Intelligence: 8, Lucidité: 6, QI_de_Combat: 3, Synchronisation: 1 },
        description: "Reconnaissance et CQC. Maîtrise du mouvement et analyse chirurgicale."
    },
    Éclair: {
        // Nouvelle somme: 35. Fort en Vitesse et Synchronisation.
        pilotDistribution: { Force: 2, Agilité: 5, Vitesse: 10, Intelligence: 6, Lucidité: 3, QI_de_Combat: 3, Synchronisation: 6 },
        description: "Interception Rapide. Évitement extrême. Optimisée pour les manœuvres à grande vitesse."
    },
    Omni: {
        // Nouvelle somme: 35. Profil équilibré avec de bonnes stats mentales.
        pilotDistribution: { Force: 5, Agilité: 5, Vitesse: 4, Intelligence: 8, Lucidité: 5, QI_de_Combat: 5, Synchronisation: 3 },
        description: "Soutien et Commandement. Profil équilibré, excellente adaptabilité et polyvalence."
    }
};


// --- CLASSE PILOT (Gère les stats du Pilote et ses PV) ---
export class Pilot {
    constructor(name, manteType, initialStats) {
        this.name = name;
        this.manteType = manteType;
        this.stats = initialStats; // Valeurs de 1 à 18

        // PV du Pilote (PV Humains sont bas, la Mante absorbe le plus gros)
        this.maxHP = 150;
        this.currentHP = this.maxHP;
    }

    applyStatChange(stat, delta) {
        if (this.stats[stat] !== undefined) {
            this.stats[stat] = Math.max(PILOT_BASE_MIN, this.stats[stat] + delta);
        }
    }
}

// --- CLASSE MANTE (Gère l'armure et l'amplification) ---
export class Mante {
    constructor(pilot) {
        this.pilot = pilot;

        // PV de la Mante sont initialisés dans Game.initPilotAndMante (basé sur Force x 100)
        this.maxHP = 0;
        this.currentHP = 0;
    }

    // Retourne l'ensemble des stats effectives (Pilote x 10 pour le physique, direct pour le mental)
    getEffectiveStats() {
        const stats = {};
        BASE_STATS.forEach(stat => {
            const pilotValue = this.pilot.stats[stat];
            if (['Force', 'Agilité', 'Vitesse'].includes(stat)) {
                // Stats physiques multipliées par 10 par l'armure
                stats[stat] = pilotValue * 10;
            } else {
                // Stats mentales (Check Value = Effective Value)
                stats[stat] = pilotValue;
            }
        });
        return stats;
    }

    // Retourne la valeur de base du Pilote pour le jet de D20 (non multipliée)
    getCheckValue(stat) {
        return this.pilot.stats[stat] || PILOT_BASE_MIN;
    }
}
