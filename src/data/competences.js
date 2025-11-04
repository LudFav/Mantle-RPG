export const competencesData = {
  "competences": {
    "Phalange": [
      {
        "nom": "Frappe Ciblée",
        "niveau": 1,
        "type": "active",
        "carac_requise": { "Force": 4 },
        "cout_energie": 2,
        "porte": "mélée",
        "cible": [
          "Torse",
          "Bras Gauche",
          "Bras Droit",
          "Jambe Gauche",
          "Jambe Droite"
        ],
        "effet": "Inflige 2D8 dégâts à une partie de l'armure ennemie. Si la partie est un **bras**, l'ennemi ne peut pas utiliser d'arme à une main pendant 1 tour. Si la partie est une **jambe**, réduit la Vitesse de 2 pendant 1 tour.",
        "description": "La Phalange frappe avec une précision brutale, ciblant les faiblesses structurelles de l'ECA ennemi."
      },
      {
        "nom": "Bouclier Balistique",
        "niveau": 1,
        "type": "passive",
        "carac_requise": { "Force": 3 },
        "effet": "+4 à la défense contre les attaques frontales ciblant le **Torse**. Réduit la Vitesse de 1.",
        "description": "Le bouclier de la Phalange protège son torse, mais limite sa mobilité."
      },
      {
        "nom": "Tir de Saturation",
        "niveau": 2,
        "type": "active",
        "carac_requise": { "Force": 5 },
        "cout_energie": 3,
        "porte": "distance (courte)",
        "cible": ["Torse", "Bras Gauche", "Bras Droit"],
        "effet": "Tire une rafale de roquettes (3D6 dégâts, ignore 2 points de blindage) sur une partie de l'armure ennemie. Si la partie est le **Torse**, l'ennemi subit un **étourdissement** (jet de Force difficulté 4 pour éviter).",
        "description": "Idéal pour briser les défenses ennemies et désorienter les cibles."
      },
      {
        "nom": "Résistance Surhumaine",
        "niveau": 3,
        "type": "passive",
        "carac_requise": { "Endurance": 4 },
        "effet": "Réduit tous les dégâts subis par l'**opérateur** de 1D4. Immunisé aux effets d'étourdissement.",
        "description": "L'opérateur encaisse les chocs comme si de rien n'était, même sous les attaques les plus violentes."
      }
    ],

    "Aiguille": [
      {
        "nom": "Tir Précis",
        "niveau": 1,
        "type": "active",
        "carac_requise": { "Vitesse": 4 },
        "cout_energie": 1,
        "porte": "distance (longue)",
        "cible": ["Tête", "Torse", "Bras Gauche", "Bras Droit"],
        "effet": "+2 au jet d'attaque. Si la cible est immobile, inflige 3D6 dégâts à une partie de l'armure (ignore 1 point de blindage). Si la partie est la **Tête**, l'ennemi subit un malus de -2 à son prochain jet d'attaque.",
        "description": "L'Aiguille vise une faille critique avec une précision mortelle."
      },
      {
        "nom": "Camouflage Optique",
        "niveau": 1,
        "type": "passive",
        "carac_requise": { "Agilité": 3 },
        "effet": "Réduit de 50% la chance d'être détecté si immobile. Consomme 1 énergie par tour.",
        "description": "Les modules de furtivité rendent l'Aiguille presque invisible aux capteurs ennemis."
      },
      {
        "nom": "Coup au But",
        "niveau": 2,
        "type": "active",
        "carac_requise": { "Vitesse": 5, "Intelligence": 3 },
        "cout_energie": 2,
        "porte": "distance (extrême)",
        "cible": ["Tête", "Torse"],
        "effet": "Tire sur un point faible (4D6 dégâts, ignore 2 points de blindage). Si la partie est la **Tête**, désactive une compétence active aléatoire de l'ennemi pour 2 tours.",
        "description": "Un tir parfait qui peut neutraliser les capacités ennemies."
      },
      {
        "nom": "Œil de Lynx",
        "niveau": 3,
        "type": "passive",
        "carac_requise": { "Intelligence": 4 },
        "effet": "Détecte automatiquement les parties endommagées des armures ennemies. Ignore toujours 1 point de blindage lors des attaques.",
        "description": "L'Aiguille repère les faiblesses de l'ennemi et les exploite sans pitié."
      }
    ],

    "Eclair": [
      {
        "nom": "Attaque Foudroyante",
        "niveau": 1,
        "type": "active",
        "carac_requise": { "Vitesse": 4 },
        "cout_energie": 1,
        "porte": "mélée",
        "cible": ["Bras Gauche", "Bras Droit", "Jambe Gauche", "Jambe Droite"],
        "effet": "Inflige 2D6 dégâts à une partie de l'armure. Si la partie est une **jambe**, réduit la Vitesse de l'ennemi de 2 pendant 1 tour. Peut enchaîner avec une attaque sur une autre partie (coût +1 énergie).",
        "description": "L'Éclair frappe vite et fort, déséquilibrant l'ennemi."
      },
      {
        "nom": "Piège à Fragmentation",
        "niveau": 1,
        "type": "active",
        "carac_requise": { "Intelligence": 3 },
        "cout_energie": 2,
        "porte": "zone (2 cases)",
        "cible": ["Torse", "Jambe Gauche", "Jambe Droite"],
        "effet": "Pose une mine qui explose au passage d'un ennemi (2D6 dégâts, ignore 1 point de blindage). Si la partie est le **Torse**, l'ennemi est **étourdi** pour 1 tour.",
        "description": "Parfait pour contrôler les déplacements ennemis et semer le chaos."
      },
      {
        "nom": "Rafale Tactique",
        "niveau": 2,
        "type": "active",
        "carac_requise": { "Vitesse": 5 },
        "cout_energie": 3,
        "porte": "distance (courte)",
        "cible": ["Torse", "Bras Gauche", "Bras Droit"],
        "effet": "Tire une rafale avec le SMG (3D4 dégâts, touche jusqu'à 2 parties adjacentes). Si une partie est un **bras**, l'ennemi lâche son arme (jet de Force difficulté 3 pour la retenir).",
        "description": "L'Éclair sature l'ennemi de projectiles, désorganisant sa défense."
      },
      {
        "nom": "Survoltage",
        "niveau": 3,
        "type": "active",
        "carac_requise": { "Vitesse": 4, "Endurance": 3 },
        "cout_energie": 4,
        "porte": "soi-même",
        "effet": "Double la Force et la Vitesse pour 2 tours. À la fin, l'**opérateur** subit 1D6 dégâts de feedback neurologique (contournable avec un jet d'Endurance difficulté 4).",
        "description": "Pousse l'ECA à ses limites, au risque de blesser l'opérateur."
      }
    ],

    "Omni": [
      {
        "nom": "Ordre Tactique",
        "niveau": 1,
        "type": "active",
        "carac_requise": { "Intelligence": 3 },
        "cout_energie": 1,
        "porte": "allié (3 cases)",
        "effet": "Donne +1 au jet d'attaque ou de défense d'un allié pour ce tour. Si l'allié cible le **Torse** ou la **Tête**, le bonus est de +2.",
        "description": "L'Omni coordonne ses coéquipiers pour maximiser leur efficacité."
      },
      {
        "nom": "Drone de Soutien",
        "niveau": 1,
        "type": "active",
        "carac_requise": { "Intelligence": 4 },
        "cout_energie": 2,
        "porte": "zone (2 cases)",
        "cible": [
          "Torse",
          "Bras Gauche",
          "Bras Droit",
          "Jambe Gauche",
          "Jambe Droite"
        ],
        "effet": "Déploie un drone qui répare 1D6 points de blindage à une partie de l'armure d'un allié, ou désactive un effet négatif (ex : étourdissement).",
        "description": "Les drones de Groupe Assault maintiennent les ECA en état de combat."
      },
      {
        "nom": "Réparation Express",
        "niveau": 2,
        "type": "active",
        "carac_requise": { "Intelligence": 3, "Endurance": 3 },
        "cout_energie": 3,
        "porte": "mélée",
        "cible": [
          "opérateur",
          "Torse",
          "Bras Gauche",
          "Bras Droit",
          "Jambe Gauche",
          "Jambe Droite"
        ],
        "effet": "Répare 2D6 points de blindage ou d'énergie à une partie de l'armure, ou soigne 1D6 PV à l'**opérateur**. Peut retirer un effet négatif (ex : immobilisation).",
        "description": "L'Omni répare les dégâts critiques, sauvant souvent des vies."
      },
      {
        "nom": "Stratège",
        "niveau": 3,
        "type": "passive",
        "carac_requise": { "Intelligence": 5 },
        "effet": "Tous les alliés dans un rayon de 3 cases bénéficient de +1 à leur initiative. L'Omni peut utiliser une compétence active supplémentaire par tour.",
        "description": "Un vrai leader inspire et optimise les performances de son escouade."
      },
      {
        "nom": "Polyvalence Tactique",
        "niveau": "Spécial",
        "type": "passive",
        "carac_requise": { "Intelligence": 4 },
        "effet": "L'Omni peut choisir **1 compétence de niveau 1 ou 2** parmi les classes Phalange, Aiguille ou Éclair. Cette compétence est considérée comme une compétence Omni et suit ses règles normales (coût en énergie, etc.).",
        "description": "L'Omni s'adapte à toutes les situations, empruntant les techniques des autres classes pour combler les faiblesses de son escouade."
      }
    ],

    "generiques": [
      {
        "nom": "Coup de Grâce",
        "niveau": 2,
        "type": "active",
        "carac_requise": { "Force": 3 },
        "cout_energie": 2,
        "porte": "mélée",
        "cible": ["Tête", "Torse"],
        "effet": "Si la partie cible a moins de 20% de ses PV, inflige 3D6 dégâts supplémentaires. Si la partie est la **Tête**, l'ennemi est **étourdi** pour 1 tour.",
        "description": "Achève un ennemi affaibli avec une attaque décisive."
      },
      {
        "nom": "Résistance Mentale",
        "niveau": 1,
        "type": "passive",
        "carac_requise": { "Endurance": 3 },
        "effet": "Réduit de moitié les effets des attaques neuro-cortiques (ex : Édolon-Glitch). Si l'opérateur subit un effet mental, il peut faire un jet d'Endurance (difficulté 3) pour le réduire.",
        "description": "Un esprit entraîné résiste aux assauts numériques et aux feedbacks."
      }
    ]
  }
};
