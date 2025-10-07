export const SCENES_DATA = {
    CREATION: {
        text: "Bienvenue, Opérateur. Vous êtes sur le point de vous synchroniser avec votre Mante. Vos choix définiront non seulement les capacités de votre armure, mais aussi vos limites en tant que pilote. Distribuez les 35 points de base entre vos 7 statistiques humaines (min 1, max 18). Ce sont vos aptitudes réelles : l'armure Mante ne fait que décupler les physiques (Force, Agilité, Vitesse). Choisissez sagement votre profil : l'Archipel ne pardonne pas les erreurs.",
    },

    // --- ACTE I : GUERRE DES ARCHIPELS (KAIROK) ---

    ACT_1_KAIROK_INTRO: {
        text: "ACTE I : L'ARCHIPEL DES CENDRES. ALERTE ROUGE, ALERTE ROUGE : Nos rapports signalent que des armures FEU d'un nouveau type sont en approche pour attaquer nos positions. Nous essuyons déjà des tirs d'artillerie ennemie. Votre escouade est la plus proche du goulot d'étranglement qui mène à nos dépôts de munitions. Vous devez tenir cette ligne coûte que coûte, en attendant les renforts qui n'arriveront que dans 10 minutes. Vous atteignez la zone : l'acier fond autour de vous, l'air est saturé de poudre et d'ozone.",
        choices_Phalange: [
            { text: "Option A (Assaut Brutal) : Vous placez en tête de pont pour absorber la première salve. Votre seule présence dicte l'engagement. (Jet de Force Pilote)", next: "ACT_1_KAIROK_ASSAULT_FORCE" },
            { text: "Option B (Ordre Stratégique) : Vous coordonez vos unités pour flanquer, utilisant les ruines comme couverture et piège. (Jet de QI_de_Combat)", next: "ACT_1_KAIROK_STRAT_QC" }
        ],
        choices_Aiguille: [
            { text: "Option A (Infiltration Active) : Vous utilisez la fumée et les débris pour glisser derrière la ligne ennemie et saboter leurs systèmes. (Jet d'Agilité Pilote)", next: "ACT_1_KAIROK_FLANK_AGI" },
            { text: "Option B (Analyse des menaces) : Vous ignorez la ligne de front et vous concentrez sur l'identification des nouvelles armures inconnus et de leur point faible. (Jet d'Intelligence)", next: "ACT_1_KAIROK_ANALYSE_INTEL" }
        ],
        choices_Éclair: [
            { text: "Option A (Poussée de Vitesse) : Vous foncez dans le goulot d'étranglement, utilisant une vitesse extrême pour créer la confusion et disperser l'assaut. (Jet de Vitesse Pilote)", next: "ACT_1_KAIROK_RUSH_VITESSE" },
            { text: "Option B (Manœuvre d'Évasion) : Vous vous positionnez sur un flanc éloigné, prêt à intercepter les renforts ennemis ou à contourner la zone. (Jet de Lucidité)", next: "ACT_1_KAIROK_COUNTER_PIVOT" }
        ],
        choices_Omni: [
            { text: "Option A (Soutien Coordonné) : Vous utilisez vos capacités équilibrées pour créer une zone de feu suppressif, couvrant la retraite du personnel de base. (Jet de QI_de_Combat)", next: "ACT_1_KAIROK_STRAT_QC" },
            { text: "Option B (Contre-Cyber) : Vous vous synchronisez avec le réseau tactique pour tenter de surcharger les communications ennemies. (Jet de Synchronisation)", next: "ACT_1_KAIROK_ANALYSE_INTEL" }
        ],
    },

    // --- RÉSULTATS KAIROK : BRANCHES TACTIQUES (Chaque succès/échec applique des conséquences et mène au préparatif) ---

    ACT_1_KAIROK_ASSAULT_FORCE: {
        text: "Charger la ligne de front est un pari sur la puissance brute de votre Mante. L'onde de choc de l'impact est violente. Tentez-vous d'écraser la ligne ennemie ou est-ce une feinte pour donner le temps à vos coéquipiers de se repositionner?",
        check: { stat: "Force", difficulty: 8, success: "ACT_1_KAIROK_ASSAULT_FORCE_SUCCESS", failure: "ACT_1_KAIROK_ASSAULT_FORCE_FAILURE" }
    },

    ACT_1_KAIROK_ASSAULT_FORCE_SUCCESS: {
        text: "SUCCÈS DE L'IMPACT. La force brute de votre Mante est inégalée. Vous écrasez deux unités ennemies sous vos pieds, brisant leur élan. Leurs tirs de suppression lourds vous atteignent, mais l'armure encaisse le coup. Vous avez sécurisé la ligne pour l'instant. (Dégâts Mante légers subis, avantage tactique acquis)",
        consequence: { ManteHP: -200, successStatus: true },
        choices: [{ text: "Continuer l'opération (Préparation Vague 2)", next: "ACT_1_KAIROK_WAVE2_PREP" }]
    },

    ACT_1_KAIROK_ASSAULT_FORCE_FAILURE: {
        text: "ÉCHEC DE L'IMPACT. La manœuvre est interceptée par un tir de plasma. Votre charge est stoppée net. L'armure de votre jambe gauche est percée, le feedback est brutal. Vous reculez, blessé, mais vous tenez toujours la ligne. (Dégâts Mante lourds subis, dégâts Pilote, désavantage tactique)",
        consequence: { ManteHP: -400, PilotHP: -50, failureStatus: true },
        choices: [{ text: "Continuer l'opération (Préparation Vague 2)", next: "ACT_1_KAIROK_WAVE2_PREP" }]
    },

    ACT_1_KAIROK_STRAT_QC: {
        text: "Votre **QI_de_Combat** vous permet de voir l'échiquier. Vous ordonnez à votre escouade de se positionner de manière optimale, transformant les ruines en forteresse. Les tirs ennemis sont canalisés. Cela requiert une exécution parfaite de votre commandement.",
        check: { stat: "QI_de_Combat", difficulty: 9, success: "ACT_1_KAIROK_STRAT_QC_SUCCESS", failure: "ACT_1_KAIROK_STRAT_QC_FAILURE" }
    },

    ACT_1_KAIROK_STRAT_QC_SUCCESS: {
        text: "SUCCÈS TACTIQUE. Vos ordres sont exécutés à la perfection. Les Phalanges ennemies tombent dans votre piège. Vous infligez des dégâts ciblés et précis qui forcent leur repli immédiat. Vous avez gagné du temps. (Avantage tactique acquis)",
        consequence: { ManteHP: -100, successStatus: true },
        choices: [{ text: "Continuer l'opération (Préparation Vague 2)", next: "ACT_1_KAIROK_WAVE2_PREP" }]
    },

    ACT_1_KAIROK_STRAT_QC_FAILURE: {
        text: "ÉCHEC TACTIQUE. Les armures enemies ont anticipé votre manœuvre de flanc. Votre escouade est prise sous le feu croisé. Votre Mante subit des tirs de riposte violents alors que vous tentez de rétablir la position. (Dégâts Mante lourds subis, désavantage tactique)",
        consequence: { ManteHP: -300, failureStatus: true },
        choices: [{ text: "Continuer l'opération (Préparation Vague 2)", next: "ACT_1_KAIROK_WAVE2_PREP" }]
    },

    ACT_1_KAIROK_FLANK_AGI: {
        text: "Vous utilisez l'Agilité de votre Mante pour vous déplacer là où l'armure ennemie n'attend personne. Un virage serré, un saut sur un mur effondré. Si vous réussissez à vous faufiler, vous frappez directement leur alimentation énergétique. Si vous échouez, vous êtes exposé.",
        check: { stat: "Agilité", difficulty: 10, success: "ACT_1_KAIROK_FLANK_AGI_SUCCESS", failure: "ACT_1_KAIROK_FLANK_AGI_FAILURE" }
    },

    ACT_1_KAIROK_FLANK_AGI_SUCCESS: {
        text: "SUCCÈS D'AGILITÉ. Vous avez l'élégance d'un chat dans la fumée. Un tir bien placé sur un nexus énergétique ennemi provoque une réaction en chaîne. L'assaut s'arrête, forçant le retrait. (Avantage stratégique acquis)",
        consequence: { ManteHP: -50, successStatus: true },
        choices: [{ text: "Continuer l'opération (Préparation Vague 2)", next: "ACT_1_KAIROK_WAVE2_PREP" }]
    },

    ACT_1_KAIROK_FLANK_AGI_FAILURE: {
        text: "ÉCHEC D'AGILITÉ. Votre Mante est ralentie par des débris dissimulés. Un capteur vous trahit. Un sniper ennemi vous vise et vous touche au bras. La douleur est vive. Vous devez battre en retraite immédiatement. (Dégâts Mante et Pilote subis, désavantage stratégique)",
        consequence: { ManteHP: -350, PilotHP: -80, failureStatus: true },
        choices: [{ text: "Continuer l'opération (Préparation Vague 2)", next: "ACT_1_KAIROK_WAVE2_PREP" }]
    },

    ACT_1_KAIROK_RUSH_VITESSE: {
        text: "La **Vitesse** est votre bouclier. Vous vous transformez en un flou d'acier, brisant la formation ennemie avant qu'elle ne puisse verrouiller votre position. C'est le chaos pur. Maintenir cette vitesse dans un environnement encombré est un défi pour votre Pilote.",
        check: { stat: "Vitesse", difficulty: 9, success: "ACT_1_KAIROK_RUSH_VITESSE_SUCCESS", failure: "ACT_1_KAIROK_RUSH_VITESSE_FAILURE" }
    },

    ACT_1_KAIROK_RUSH_VITESSE_SUCCESS: {
        text: "SUCCÈS DE VITESSE. Votre Mante est un missile. Vous franchissez la ligne de front et créez un point de rupture dans leurs défenses. La désorientation ennemie est totale. La voie est libre pour vos renforts. (Avantage tactique acquis)",
        consequence: { ManteHP: -75, successStatus: true },
        choices: [{ text: "Continuer l'opération (Préparation Vague 2)", next: "ACT_1_KAIROK_WAVE2_PREP" }]
    },

    ACT_1_KAIROK_RUSH_VITESSE_FAILURE: {
        text: "ÉCHEC DE VITESSE. La surcharge d'énergie est trop forte. Votre Mante subit un flash de désynchronisation. Vous perdez le contrôle et vous heurtez une ruine. L'ennemi concentre son feu. (Dégâts Mante lourds subis, dégâts Pilote, désavantage tactique)",
        consequence: { ManteHP: -300, PilotHP: -100, failureStatus: true },
        choices: [{ text: "Continuer l'opération (Préparation Vague 2)", next: "ACT_1_KAIROK_WAVE2_PREP" }]
    },

    ACT_1_KAIROK_ANALYSE_INTEL: {
        text: "Ignorer le chaos pour chercher le motif. Votre **Intelligence** est mise à l'épreuve et vous analysez tout les mouvements d'attaque de défense de ces armures inconnues afin d'y trouver une faille. Si vous réussissez, vous obtenez un avantage tactique majeur et une information cruciale.",
        check: { stat: "Intelligence", difficulty: 8, success: "ACT_1_KAIROK_ANALYSE_INTEL_SUCCESS", failure: "ACT_1_KAIROK_ANALYSE_INTEL_FAILURE" }
    },

    ACT_1_KAIROK_ANALYSE_INTEL_SUCCESS: {
        text: "SUCCÈS D'ANALYSE. Vous êtes frappé par la surprise : ces nouvelles armures sont quasi identiques à la vôtre, à l'exception de quelques différences esthétiques mineures. Cependant, comme vous connaissez votre propre armure sur le bout des doigts, vous en maîtrisez aussi ses failles principales. Vous allez pouvoir exploiter cette information. (Avantage tactique acquis)",
        consequence: { reputation: { Aetheria: -2 }, ManteHP: -100, successStatus: true },
        choices: [{ text: "Continuer l'opération (Préparation Vague 2)", next: "ACT_1_KAIROK_WAVE2_PREP" }]
    },

    ACT_1_KAIROK_ANALYSE_INTEL_FAILURE: {
        text: "ÉCHEC D'ANALYSE. Le champs de bataille est trop chaotique. Vous perdez un temps précieux à l'analyser, tandis que l'ennemi gagne du terrain. Trop statique, vous manquez de vous faire exploser par un tir d'artillerie. Vous devez vous concentrer sur la survie. (Dégâts Mante subis, désavantage tactique)",
        consequence: { ManteHP: -300, failureStatus: true },
        choices: [{ text: "Continuer l'opération (Préparation Vague 2)", next: "ACT_1_KAIROK_WAVE2_PREP" }]
    },

    ACT_1_KAIROK_COUNTER_PIVOT: {
        text: "Votre **Lucidité** vous a alerté sur un piège de flanc camouflé. Vous n'attaquez pas la ligne de front, mais vous contre-attaquez la menace cachée. C'est une manœuvre risquée, mais qui pourrait garantir la survie des renforts.",
        check: { stat: "Lucidité", difficulty: 7, success: "ACT_1_KAIROK_COUNTER_PIVOT_SUCCESS", failure: "ACT_1_KAIROK_COUNTER_PIVOT_FAILURE" }
    },

    ACT_1_KAIROK_COUNTER_PIVOT_SUCCESS: {
        text: "SUCCÈS DE LUCIDITÉ. Vous neutralisez la menace cachée en un éclair. L'ennemi est déconcerté, forcé de se réorganiser. Vous avez gagné l'initiative. (Avantage stratégique acquis)",
        consequence: { ManteHP: -10, successStatus: true },
        choices: [{ text: "Continuer l'opération (Préparation Vague 2)", next: "ACT_1_KAIROK_WAVE2_PREP" }]
    },

    ACT_1_KAIROK_COUNTER_PIVOT_FAILURE: {
        text: "ÉCHEC DE LUCIDITÉ. Le piège était une diversion. Vous vous exposez inutilement à la ligne de front et subissez des tirs de suppression. (Dégâts Mante subis, désavantage stratégique)",
        consequence: { ManteHP: -35, failureStatus: true },
        choices: [{ text: "Continuer l'opération (Préparation Vague 2)", next: "ACT_1_KAIROK_WAVE2_PREP" }]
    },

    // --- PRÉPARATION VAGUE 2 ---

    ACT_1_KAIROK_WAVE2_PREP: {
        text: "Le champ de bataille est jonché d'épaves. Les renforts sont encore à 5 minutes. Votre Mante est endommagée. Vous avez le temps de tenter une réparation ou une manœuvre de reconnaissance. La survie de l'escouade dépend de cette décision. (Les options en bleu/rouge dépendent de votre performance initiale.)",
        choices: [
            { text: "Tenter une réparation d'urgence sur le blindage pour récupérer 20 PV (Jet de QI_de_Combat - Diff 8)", next: "ACT_1_KAIROK_REPAIR_QC" },
            { text: "Utiliser le temps pour scanner l'horizon à la recherche d'une position d'embuscade (Jet de Lucidité - Diff 7)", next: "ACT_1_KAIROK_AMBUSH_LUCIDITE" },
        ],

        // Choix DETERMINANTS (succès initial nécessaire)
        requirements_success: [
            {
                text: "[AVANTAGE/DETERMINANT] **Prendre l'Ascendant :** Utiliser votre succès pour sécuriser une position de tir dominante pour la seconde vague (+1 QI_de_Combat temporaire).",
                consequence: { stats: { "QI_de_Combat": 1 } }, next: "ACT_1_KAIROK_WAVE2_ADVANTAGE"
            }
        ],
        // Choix CRITIQUES (échec initial nécessaire)
        requirements_failure: [
            {
                text: "[DIFFICILE/CRITIQUE] **Sacrifice de Puissance :** Désactiver le système d'amplification de la Mante pour un boost de Synchronisation. (-20 ManteHP, +1 Synchronisation temporaire)",
                consequence: { ManteHP: -20, stats: { Synchronisation: 1 } }, next: "ACT_1_KAIROK_WAVE2_CRITIQUE"
            }
        ]
    },

    // --- RÉSULTATS DES CHOIX DE PRÉPARATION ---

    ACT_1_KAIROK_WAVE2_ADVANTAGE: {
        text: "Vous avez utilisé votre avantage pour sécuriser le réservoir cryogénique B comme bastion. La seconde vague de la FEU aura un champ de tir très restreint. Votre équipe est en position, bénéficiant d'un avantage de ciblage et de tir. Préparez-vous au combat final.",
        next: "ACT_1_KAIROK_WAVE2_FIGHT"
    },
    ACT_1_KAIROK_WAVE2_CRITIQUE: {
        text: "L'amplification est coupée, vous êtes plus vulnérable, mais la Mante est stable et votre neuro-lien est au maximum. Vous combattez avec votre Mante affaiblie mais avec un esprit plus vif. Préparez-vous au combat final.",
        next: "ACT_1_KAIROK_WAVE2_FIGHT"
    },

    // Checks de préparation
    ACT_1_KAIROK_REPAIR_QC: {
        text: "Vous accédez aux diagnostics de votre Mante. La rapidité et la précision de la réparation dépendent de votre **QI_de_Combat**. Réussir vous donnera un avantage vital pour la prochaine vague.",
        check: { stat: "QI_de_Combat", difficulty: 8, success: "ACT_1_KAIROK_WAVE2_QC_SUCCESS", failure: "ACT_1_KAIROK_WAVE2_QC_FAILURE" }
    },

    ACT_1_KAIROK_WAVE2_QC_SUCCESS: {
        text: "RÉPARATION RÉUSSIE. Votre Mante regagne **20 PV**. L'interface est stabilisée, les systèmes secondaires sont rétablis. La seconde vague arrive. Le combat reprend, mais vous êtes prêt.",
        consequence: { ManteHP: 20 },
        choices: [{ text: "Avancer vers la Faille Géothermique (Vague 2)", next: "ACT_1_KAIROK_WAVE2_FIGHT" }]
    },

    ACT_1_KAIROK_WAVE2_QC_FAILURE: {
        text: "RÉPARATION ÉCHOUÉE. La tentative rapide a endommagé un système secondaire, sans réparer les dégâts principaux. La seconde vague arrive, et votre Mante est à la limite. Vous subissez des dégâts mineurs supplémentaires dû à la surcharge. (-5 PV Mante)",
        consequence: { ManteHP: -5 },
        choices: [{ text: "Avancer vers la Faille Géothermique (Vague 2)", next: "ACT_1_KAIROK_WAVE2_FIGHT" }]
    },

    ACT_1_KAIROK_AMBUSH_LUCIDITE: {
        text: "Votre **Lucidité** est mise à contribution pour anticiper la trajectoire de la seconde vague. Un succès révèle un point faible dans la couverture ennemie. Vous positionnez un tir d'artillerie préventif.",
        check: { stat: "Lucidité", difficulty: 7, success: "ACT_1_KAIROK_AMBUSH_SUCCESS", failure: "ACT_1_KAIROK_AMBUSH_FAILURE" }
    },

    ACT_1_KAIROK_AMBUSH_SUCCESS: {
        text: "EMBUSCADE RÉUSSIE. Votre tir d'artillerie préventif frappe la colonne ennemie. La seconde vague est désorganisée et affaiblie. Vous avancez avec un avantage majeur.",
        choices: [{ text: "Avancer vers la Faille Géothermique (Vague 2)", next: "ACT_1_KAIROK_WAVE2_FIGHT" }]
    },

    ACT_1_KAIROK_AMBUSH_FAILURE: {
        text: "ÉCHEC D'EMBUSCADE. Votre tir d'artillerie est intercepté. L'ennemi est alerté de votre position et se déploie plus prudemment. La prochaine bataille s'annonce plus difficile.",
        choices: [{ text: "Avancer vers la Faille Géothermique (Vague 2)", next: "ACT_1_KAIROK_WAVE2_FIGHT" }]
    },

    // --- VAGUE 2 : COMBAT FINAL ACTE I ---

    ACT_1_KAIROK_WAVE2_FIGHT: {
        text: "La seconde vague arrive, plus nombreuse et mieux coordonnée. La Phalange de tête est un monstre blindé. Vous devez la neutraliser pour tenir la ligne. Vous devez faire un choix tactique pour le combat final. **(Jet de QI_de_Combat - Diff 10)**",
        check: { stat: "QI_de_Combat", difficulty: 10, success: "ACT_1_KAIROK_WAVE2_FIGHT_SUCCESS", failure: "ACT_1_KAIROK_WAVE2_FIGHT_FAILURE" }
    },

    ACT_1_KAIROK_WAVE2_FIGHT_SUCCESS: {
        text: "VICTOIRE TACTIQUE. Votre **QI_de_Combat** est supérieur. Vous exploitez les faiblesses du blindage de la Phalange ennemie, neutralisant la menace avec une précision chirurgicale. La ligne est tenue. Kairok est sécurisée. Les dégâts sont minimes, mais la Mante est fatiguée.",
        consequence: { ManteHP: -25, progress: 20, reputation: { CEL: 1 } },
        choices: [{ text: "Déployer pour la prochaine mission (Géothermia)", next: "ACT_1_GEOTHERMIA_INTRO" }]
    },

    ACT_1_KAIROK_WAVE2_FIGHT_FAILURE: {
        text: "ÉCHEC TACTIQUE. La Phalange ennemie perce la ligne. Votre Mante subit un barrage de tirs et est forcée de battre en retraite pour éviter l'anéantissement. Kairok tombe, mais vous survivez. Cet échec pèsera sur votre dossier. La CEL est furieuse.",
        consequence: { ManteHP: -50, PilotHP: -5, progress: 10, reputation: { CEL: -2 } },
        choices: [{ text: "Poursuivre la campagne (Géothermia)", next: "ACT_1_GEOTHERMIA_INTRO" }]
    },

    // --- BATAILLE 2 : LA FAILLE GÉOTHERMIQUE ---

    ACT_1_GEOTHERMIA_INTRO: {
        text: "Le champ de bataille se déplace vers les puits géothermiques de l'Archipel, là où l'énergie de l'île est concentrée. L'objectif est de sécuriser le 'Noyau Géo'. L'environnement est instable : vapeur, geysers explosifs, et terrain glissant. Le combat sera chaotique. L'ennemi s'est retranché au centre de la Faille. Vous devez le déloger ou sécuriser le Noyau par une manœuvre risquée. La menace d'Aetheria plane toujours.",
        consequence: { progress: 30 },
        choices: [
            { text: "Manœuvre : Utiliser la vapeur et le terrain instable à votre avantage pour piéger l'ennemi. (Jet de Synchronisation - Diff 10)", next: "ACT_1_GEOTHERMIA_SYNCHRO" },
            { text: "Manœuvre : Assurer la protection du Noyau Géo, vous préparez une ligne de défense statique et puissante. (Jet de Force - Diff 7)", next: "ACT_1_GEOTHERMIA_FORCE_CHECK" },
            { text: "Manœuvre : Tenter de forcer la Mante à surcharger ses circuits pour gagner une accélération massive, contournant la zone de danger. (Jet de Vitesse - Diff 11)", next: "ACT_1_GEOTHERMIA_VITESSE_CHECK" },
        ],
    },

    ACT_1_GEOTHERMIA_SYNCHRO: {
        text: "Vous plongez votre Mante au cœur de la Faille. Utiliser les changements de pression et la chaleur pour déclencher des geysers au bon moment exige une **Synchronisation** parfaite entre votre pilote et l'armure. Le moindre décalage et c'est votre Mante qui subit l'explosion.",
        check: { stat: "Synchronisation", difficulty: 10, success: "ACT_1_GEOTHERMIA_SYNCHRO_SUCCESS", failure: "ACT_1_GEOTHERMIA_SYNCHRO_FAILURE" }
    },

    ACT_1_GEOTHERMIA_SYNCHRO_SUCCESS: {
        text: "SUCCÈS DE SYNCHRONISATION. Vous êtes en phase avec l'environnement. La vapeur monte, la pression est relâchée au moment critique. L'ennemi est englouti par les geysers. Victoire tactique majeure. (Dégâts Mante minimes subis, Noyau sécurisé)",
        consequence: { ManteHP: -5 },
        choices: [{ text: "Continuer l'opération (Phase de Débriefing)", next: "ACT_1_GEOTHERMIA_OUTRO" }]
    },

    ACT_1_GEOTHERMIA_SYNCHRO_FAILURE: {
        text: "ÉCHEC DE SYNCHRONISATION. La Mante a un léger retard. Un geyser explose prématurément, vous frappant de plein fouet. La Mante est gravement endommagée, mais vous survivez. (Dégâts Mante et Pilote subis)",
        consequence: { ManteHP: -80, PilotHP: -10 },
        choices: [{ text: "Continuer l'opération (Phase de Débriefing)", next: "ACT_1_GEOTHERMIA_OUTRO" }]
    },

    ACT_1_GEOTHERMIA_FORCE_CHECK: {
        text: "La puissance de votre Mante est essentielle pour ancrer la défense contre la vapeur et les explosions. Le défi n'est pas tant de frapper, mais de *tenir* la position dans un environnement en mouvement.",
        check: { stat: "Force", difficulty: 7, success: "ACT_1_GEOTHERMIA_FORCE_SUCCESS", failure: "ACT_1_GEOTHERMIA_FORCE_FAILURE" }
    },

    ACT_1_GEOTHERMIA_FORCE_SUCCESS: {
        text: "SUCCÈS DE FORCE. Vous ancrez votre Mante dans le sol volcanique, créant un mur impénétrable. L'ennemi se brise contre votre ligne. Le Noyau Géo est sécurisé. (Dégâts Mante minimes subis)",
        consequence: { ManteHP: -10 },
        choices: [{ text: "Continuer l'opération (Phase de Débriefing)", next: "ACT_1_GEOTHERMIA_OUTRO_SUCCESS" }]
    },

    ACT_1_GEOTHERMIA_FORCE_FAILURE: {
        text: "ÉCHEC DE FORCE. La puissance d'une explosion géothermique est trop forte. Votre ancre lâche. Vous êtes projeté. Votre Mante subit de graves dégâts structurels. (Dégâts Mante lourds subis, Pilote exposé)",
        consequence: { ManteHP: -70, PilotHP: -5 },
        choices: [{ text: "Continuer l'opération (Phase de Débriefing)", next: "ACT_1_GEOTHERMIA_OUTRO" }]
    },

    ACT_1_GEOTHERMIA_VITESSE_CHECK: {
        text: "Tenter une accélération maximale dans la zone instable. Cela nécessite une **Vitesse** incroyable pour naviguer entre les dangers, mais réussir permet de prendre l'ennemi à revers.",
        check: { stat: "Vitesse", difficulty: 11, success: "ACT_1_GEOTHERMIA_VITESSE_SUCCESS", failure: "ACT_1_GEOTHERMIA_VITESSE_FAILURE" }
    },

    ACT_1_GEOTHERMIA_VITESSE_SUCCESS: {
        text: "SUCCÈS DE VITESSE. Vous êtes une ombre dans la vapeur. Vous contournez les unités ennemies et détruisez leur poste de commandement. La bataille s'effondre en votre faveur. (Victoire rapide)",
        consequence: { ManteHP: -5 },
        choices: [{ text: "Continuer l'opération (Phase de Débriefing)", next: "ACT_1_GEOTHERMIA_OUTRO_SUCCESS" }]
    },

    ACT_1_GEOTHERMIA_VITESSE_FAILURE: {
        text: "ÉCHEC DE VITESSE. Une erreur de calcul et votre Mante glisse sur le terrain humide. Vous vous retrouvez pris au piège par l'ennemi qui concentre son feu. Vous forcez le retrait. (Dégâts Mante lourds subis)",
        consequence: { ManteHP: -60 },
        choices: [{ text: "Continuer l'opération (Phase de Débriefing)", next: "ACT_1_GEOTHERMIA_OUTRO" }]
    },

    ACT_1_GEOTHERMIA_OUTRO_SUCCESS: {
        text: "La bataille de l'Archipel s'achève sur une victoire. Alors les unités de FEU se retirent pour panser leurs plaies, un message ultra-prioritaire arrive : un signal complexe et non-humain a été détecté dans l'espace. Toutes les forces d'élite sont redéployées immédiatement. Le sort de la guerre est mis en pause par une question existentielle.",
        consequence: { progress: 50 },
        choices: [{ text: "Accepter la nouvelle mission (Direction : Station Léviathan)", next: "ACT_2_MONOLITHE_INTRO" }]
    },

    ACT_1_GEOTHERMIA_OUTRO: {
        text: "La bataille de l'Archipel s'achève sur une victoire amère. Votre Mante est gravement endommagée. Alors que la CEL et la FEU se retirent pour panser leurs plaies, un message ultra-prioritaire arrive : un signal complexe et non-humain a été détecté dans l'espace. Toutes les forces d'élite sont redéployées immédiatement. Le sort de la guerre est mis en pause par une question existentielle.",
        consequence: { progress: 50 },
        choices: [{ text: "Accepter la nouvelle mission (Direction : Station Léviathan)", next: "ACT_2_MONOLITHE_INTRO" }]
    },

    // --- ACTE II : PREMIER CONTACT (LE MONOLITHE) ---

    ACT_2_MONOLITHE_INTRO: {
        text: "ACTE II : LE MIROIR. L'objet emettant le signal a été recupéré et placé sur la base neutre de Leviathan, une vieille carcasse de station spatiale de la seconde Guerre Froide decomissionnée. La tension est palpable. L'objet est massif, noir, parfaitement lisse, surnommé le 'Monolithe'. Il émet une onde répétitive, sans aucune structure connue. Votre escouade Mante, est propulsée sur place afin d'escorter un VIP, le Dr. Volkov, linguiste et scientifique de la CEL, mènant les opérations scientifques. Il vous demande de l'accompagner afin d'effectuer une analyse de résonance. Vous êtes maintenant dans l'espace, la Terre est une bille bleue bien loin derrière vous.",
        choices: [
            { text: "Manœuvre : Le docteur adapte un outil brancher a votre Mante afin de lancer une série d'échos haute fréquence pour cartographier la structure interne du Monolithe. (Jet d'Intelligence - Diff 8)", next: "ACT_2_MONOLITHE_ECHO_INTEL" },
            { text: "Manœuvre : Une pulsion vous envahis et vous tentez de vous synchroniser neuro-mécaniquement avec le Monolithe, en utilisant votre propre Mante comme traducteur. (Jet de Synchronisation - Diff 10)", next: "ACT_2_MONOLITHE_SYNCHRO_S" },
            { text: "Manœuvre : Vous assistez Volkov en vous concentrant sur les ressources et les communications passives, l'observation, en évitant toute interaction. (Jet de Lucidité - Diff 6)", next: "ACT_2_MONOLITHE_PASSIVE_LUCIDITE" }
        ],
    },

    ACT_2_MONOLITHE_ECHO_INTEL: {
        text: "Etonnement, et instinctivement vous arrivez a moduler les fréquences de la Mante au-delà de leurs limites habituelles. Réussir pourrait vous donner un plan 3D de l'intérieur du Monolithe, révélant ses mécanismes cachés. Échouer pourrait provoquer une réaction non désirée.",
        check: { stat: "Intelligence", difficulty: 8, success: "ACT_2_MONOLITHE_CHECK_SUCCESS", failure: "ACT_2_MONOLITHE_CHECK_FAILURE" }
    },

    ACT_2_MONOLITHE_SYNCHRO_S: {
        text: "C'est la voie la plus risquée. Vous essayez de fusionner la résonance du Monolithe avec les circuits de votre Mante, utilisant votre **Synchronisation** comme un pont. Si cela fonctionne, vous pourriez décrypter le langage. Si cela échoue, le feedback pourrait être fatal.",
        check: { stat: "Synchronisation", difficulty: 10, success: "ACT_2_MONOLITHE_CHECK_SUCCESS", failure: "ACT_2_MONOLITHE_SYNCHRO_FAILURE" }
    },

    ACT_2_MONOLITHE_PASSIVE_LUCIDITE: {
        text: "La **Lucidité** suggère qu'une action est une erreur. Vous proposez à Volkov d'utiliser la puissance de la Mante pour stabiliser l'environnement autour de l'objet, se contentant d'enregistrer. Cela évite le danger, mais limite l'information.",
        check: { stat: "Lucidité", difficulty: 6, success: "ACT_2_MONOLITHE_CHECK_SUCCESS_LUCID", failure: "ACT_2_MONOLITHE_CHECK_FAILURE" }
    },

    ACT_2_MONOLITHE_CHECK_SUCCESS: {
        text: "SUCCÈS. Les données révèlent que le Monolithe ne communique pas, il *enseigne*. Il diffuse des concepts de mécanique quantique et de linguistique encore inconnu par nos scientifiques. Le Dr. Volkov est surexcité : nous pouvons apprendre à parler le langage des Architectes. Mais Volkov est également de plus en plus secret, sous l'influence de l'information.",
        consequence: { reputation: { Aetheria: 1 } },
        choices: [{ text: "Poursuivre la mission (Traversée vers la trahison)", next: "ACT_2_VOLKOV_BETRAYAL" }]
    },

    ACT_2_MONOLITHE_CHECK_SUCCESS_LUCID: {
        text: "SUCCÈS D'OBSERVATION. En évitant l'interaction, vous réalisez que les transmissions sont cryptées mais basées sur des concepts universels. Volkov est frustré par la lenteur, mais le danger est évité. Il vous ordonne de rester en alerte pour une nouvelle tentative d'analyse.",
        choices: [{ text: "Poursuivre la mission (Traversée vers la trahison)", next: "ACT_2_VOLKOV_BETRAYAL" }]
    },

    ACT_2_MONOLITHE_SYNCHRO_FAILURE: {
        text: "ÉCHEC CRITIQUE. Le feedback est brutal. Le langage des Architectes inonde votre conscience, provoquant une surcharge neurologique dans la Mante. Vous avez subi des dégâts temporaires à votre Synchronisation, mais vous avez également entrevu quelque chose : une *peur* primale, non-humaine. Le danger est réel.",
        consequence: { Synchronisation: -1, PilotHP: -70 },
        choices: [{ text: "Poursuivre la mission (Traversée vers la trahison)", next: "ACT_2_VOLKOV_BETRAYAL" }]
    },

    ACT_2_MONOLITHE_CHECK_FAILURE: {
        text: "ÉCHEC. Le Monolithe ne réagit pas bien. Il émet une onde de résonance qui secoue violemment votre Mante. Vous reculez, les dégâts sont physiques. Vous avez échoué à obtenir l'information et vous avez potentiellement attiré son attention.",
        consequence: { ManteHP: -300 },
        choices: [{ text: "Poursuivre la mission (Traversée vers la trahison)", next: "ACT_2_VOLKOV_BETRAYAL" }]
    },

    ACT_2_VOLKOV_BETRAYAL: {
        text: "Les jours s'écoulent. Le Docteur Volkov a finalement établi la « communication ». Il vit désormais retranché dans le laboratoire principal, refusant toute interaction ou sortie, même pour sa subsistance. Silencieusement, vous lui déposez des rations devant la porte blindée. L'inertie est rompue à la nuit tombée. Une vibration stridente de votre terminal vous arrache au sommeil. C'est un ordre codé, priorité maximale, émanant d'un opérateur du CEL : « ALERTE ROUGE. Neutralisez Volkov. Le sujet est compromis. L'artefact infecte le scientifique. Évacuez. Si l'installation n'est pas détruite d'ici dix minutes, vous serez considérés comme perdus et nous procèderons à la frappe balistique. » Votre Mante est votre seul atout. L'instant d'après, l'appareil vibre à nouveau. Un second message, crypté et d'origine inconnue, apparaît : « Ne neutralisez pas Volkov. Laissez le processus s'accomplir. »",
        consequence: { progress: 75, reputation: { CEL: -1 } },
        choices: [
            { text: "Neutralisation : Forcer la porte blindée du laboratoire pour une confrontation directe. (Jet de Force - Diff 15)", next: "ACT_3_LEVIATHAN_BREACH_FORCE" },
            { text: "Tactique : Utiliser le réseau de ventilation pour injecter un agent neutralisant. (Jet d'Agilité - Diff 12)", next: "ACT_3_LEVIATHAN_BREACH_AGI", requirements: { Agilité: 8 } },
            { text: "Analyse : Tenter de désactiver le confinement à distance en piratant le système de la station. (Jet d'Intelligence - Diff 10)", next: "ACT_3_LEVIATHAN_BREACH_INTEL", requirements: { Intelligence: 9 } }
        ],
    },

    // --- ACTE III : HORREUR CORPORATIVE (LEVIATHAN) ---

    ACT_3_LEVIATHAN_BREACH_FORCE: {
        text: "Vous utilisez la pleine puissance de votre Mante pour démolir la porte blindée. L'impact est brutal, mais réussi. Vous entrez. Volkov, ou ce qu'il est devenu, est là. Un combat rapproché, sans retenue, commence.",
        choices: [{ text: "Confronter la Synthèse (Combat final)", next: "ACT_3_LEVIATHAN_SYNTHESE" }]
    },

    ACT_3_LEVIATHAN_BREACH_AGI: {
        text: "L'Agilité de votre Mante vous permet de naviguer dans les conduits de ventilation étroits pour atteindre la salle de confinement. Le risque de vous coincer est réel, mais vous évitez l'alarme. L'agent est injecté. Il réagit.",
        check: { stat: "Agilité", difficulty: 12, success: "ACT_3_LEVIATHAN_SYNTHESE_AGI_SUCCESS", failure: "ACT_3_LEVIATHAN_SYNTHESE" }
    },

    ACT_3_LEVIATHAN_SYNTHESE_AGI_SUCCESS: {
        text: "L'agent neutralisant a partiellement ralenti Volkov. Le combat est facilité, mais l'horreur demeure. Le scientifique est une masse de chair et de métal étranger. Vous devez l'achever.",
        consequence: { ManteHP: -0, PilotHP: -0 }, // Pas de dégâts, mais la scène mène au combat
        choices: [{ text: "Confronter la Synthèse (Combat facilité)", next: "ACT_3_LEVIATHAN_SYNTHESE" }]
    },

    ACT_3_LEVIATHAN_BREACH_INTEL: {
        text: "Le piratage du système de confinement nécessite une **Intelligence** hors norme. Si vous réussissez, vous pouvez déclencher le protocole d'autodestruction. Si vous échouez, vous alarmez Volkov.",
        check: { stat: "Intelligence", difficulty: 10, success: "ACT_3_LEVIATHAN_SYNTHESE_INTEL_SUCCESS", failure: "ACT_3_LEVIATHAN_SYNTHESE" }
    },

    ACT_3_LEVIATHAN_SYNTHESE_INTEL_SUCCESS: {
        text: "Piratage réussi. La séquence d'autodestruction est lancée. Volkov est piégé, mais vous devez fuir immédiatement avant que le réacteur de la station n'explose. Vous avez 3 minutes.",
        choices: [{ text: "Fuir immédiatement (Jet de Vitesse)", next: "ACT_3_LEVIATHAN_ESCAPE_VITESSE" }]
    },

    // Le combat réel contre la créature synthétisée (Volkov)
    ACT_3_LEVIATHAN_SYNTHESE: {
        text: "La créature PXF-Volkov est incroyablement rapide et utilise la science des Architectes. Il ne vous attaque pas, il tente de se connecter à votre Mante, de *vous* synthétiser. Vous devez la détruire ou la déconnecter. Le risque de contamination est maximal.",
        choices: [
            { text: "Stratégie : Viser les points faibles neurologiques du Monolithe dans la créature. (Jet de Synchronisation - Diff 11)", next: "ACT_3_LEVIATHAN_SYNTHESE_SYNCHRO" },
            { text: "Stratégie : Éviter l'engagement et vider la salle dans l'espace. (Jet de Vitesse - Diff 10)", next: "ACT_3_LEVIATHAN_ESCAPE_VITESSE" },
            { text: "Stratégie : Engagement total, utiliser toute la puissance pour la détruire en un seul coup. (Jet de Force - Diff 13)", next: "ACT_3_LEVIATHAN_SYNTHESE_FORCE" }
        ],
    },

    ACT_3_LEVIATHAN_SYNTHESE_SYNCHRO: {
        text: "Votre **Synchronisation** est mise à l'épreuve. Si vous réussissez, vous rompez la connexion de la créature au Monolithe, la laissant sans défense. Si vous échouez, l'horreur s'installe dans votre propre esprit.",
        check: { stat: "Synchronisation", difficulty: 11, success: "ACT_3_LEVIATHAN_SYNTHESE_SUCCESS", failure: "ACT_3_LEVIATHAN_SYNTHESE_FAILURE" }
    },

    ACT_3_LEVIATHAN_SYNTHESE_FORCE: {
        text: "La Force est la seule réponse à l'horreur. Un coup puissant dans la masse informe de Volkov. Mais si le blindage échoue, la contamination sera immédiate.",
        check: { stat: "Force", difficulty: 13, success: "ACT_3_LEVIATHAN_SYNTHESE_SUCCESS", failure: "ACT_3_LEVIATHAN_SYNTHESE_FAILURE" }
    },

    // --- RÉSULTATS COMBAT FINAL ---

    ACT_3_LEVIATHAN_SYNTHESE_SUCCESS: {
        text: "VICTOIRE EXTREME. La créature PXF-Volkov est enfin réduite au silence. Vous avez tenu tête à l'indicible. Immédiatement, les transmissions de l'opérateur inconnu s'intensifient : il veut que vous deroutiez l'épave de la station et il veut toutes les données récupérées. En guise de gage de bonne foi, il accepte de dévoiler son identité : il travaille pour la mégacorporation 'Aetheria', ce nom ne vous est pas inconnu c'est une corporation qui collabore avec CEL dans la conception d'armement et d'armure, d'ailleurs votre armure en est issue. Il révèle qu'il surveille la situation depuis le début car l'épave du Léviathan appartient en réalité à la corporation. « Il y a de l'argent à la clef, plus que vous ne sauriez imaginer », ajoute-t-il froidement. « Nous vous garantissons une extraction immédiate ainsi qu'une place au sein de nos équipes. » Le choix est désormais vôtre.",
        consequence: { progress: 99 },
        choices: [{ text: "Écouter les transmissions Aetheria (Choix final)", next: "ACT_3_LEVIATHAN_OUTRO_CHOICE" }]
    },

    ACT_3_LEVIATHAN_SYNTHESE_FAILURE: {
        text: "DÉFAITE. Vous êtes submergé. La créature parvient à se connecter un instant à votre Mante, le flux d'horreur est trop intense. Votre Pilote est blessé, votre Mante est hors service. Votre seule option est de couper tous les systèmes et de tenter une évasion de dernière minute. La mission est un échec critique. Volkov/PXF est libre.",
        consequence: { ManteHP: -100, PilotHP: -20 },
        choices: [{ text: "Tenter l'évasion d'urgence (Jet de Vitesse)", next: "ACT_3_LEVIATHAN_ESCAPE_VITESSE" }]
    },

    ACT_3_LEVIATHAN_ESCAPE_VITESSE: {
        text: "Vous devez rejoindre la capsule de sauvetage à temps. La **Vitesse** est votre seule chance. La station explose dans 60 secondes. C'est une course contre la montre. Échouer signifie la fin. Réussir signifie l'évasion, mais le destin de l'humanité reste incertain.",
        check: { stat: "Vitesse", difficulty: 14, success: "ENDING_FAILURE_ESCAPE", failure: "ENDING_FAILURE_DESTRUCTION" }
    },

    ACT_3_LEVIATHAN_OUTRO_CHOICE: {
        text: "La station Léviathan est sur le point d'être détruite. Aetheria vous offre une extraction et de l'argent en échange de toutes les données du Monolithe. La CEL vous ordonne d'utiliser l'autodestruction pour purifier la zone.",
        choices: [
            { text: "Accepter l'offre d'Aetheria. La survie avant l'idéologie. Vous acceptez de rallumer les moteurs de la station afin d'eviter les missiles envoyé par la CEL et vous enfermez les reste de Volkov dans un caisson que vous envoyez vers un point GPS donné. (Augmente Réputation Aetheria)", next: "ENDING_SUCCESS_CORPO", consequence: { reputation: { CEL: -5, Aetheria: 5 } } },
            { text: "Obéir à la CEL : Détruire toutes les preuves et fuir. (Augmente Réputation CEL)", next: "ACT_3_LEVIATHAN_ESCAPE_VITESSE", consequence: { reputation: { CEL: 5, Aetheria: -2 } } },
            { text: "Obéir partiellement à la CEL : Détruire l'épave mais envoyer les données recueillies au haut commandement CEL. (Augmente Réputation CEL)", next: "ENDING_SUCCESS_CEL", consequence: { reputation: { CEL: 4, Aetheria: -2 } } },
            { text: "Détruire l'épave et envoyer les données à une faction de la FEU, contre extraction et protection. (Diminue Réputation CEL/Aetheria)", next: "ENDING_SUCCESS_FEU", consequence: { reputation: { CEL: -5, Aetheria: -2, FEU: 5 } } },
            { text: "Détruire l'épave et envoyer les données aux 2 camps. (Diminue Réputation CEL/Aetheria)", next: "ENDING_SUCCESS_REBEL", consequence: { reputation: { CEL: -2, Aetheria: -2, FEU: 2 } } }
        ],
    },

    // --- FINS DU JEU ---

    ENDING_SUCCESS_CORPO: {
        text: "Volko enfin ce qu'il est devenu est 'sauvé'. Vous êtes riche, mais vous savez que la menace qu'il represente est maintenant entre les mains d'Aetheria, qui rêve de l'etudier et surtout de s'approprier sa force destructrice et assimilatrice. Le salut du monde est désormais monnayable. Vous avez survécu à la guerre, mais pas à la cupidité. Paria dans votre propre pays, vous vous installez dans une republique fantoche controlée par Aetheria, où elle détient ses principaux laboratoires, vous y occupez desormais le role de consultant. (Fin du Cycle de Prométhée: Voie Corporative)",
        gameStatus: "ENDED_SUCCESS",
    },

    ENDING_SUCCESS_CEL: {
        text: "Vous vous échappez de justesse, votre Mante est à peine fonctionnelle. Les données ont été transmises au haut commandement.Désormais accessible à la communauté scientifique de votre pays, le savoir du monolithe permet des avancées technologiques magistrales. La guerre vient de prendre un tournant décisif à l'avantage du CEL, qui va manifestement l'emporter. Le CEL vous propulse au rang de « Héros des Cendres », mais étrangement, certains hauts gradés ont désormais une dent contre vous. (Fin du Cycle de Prométhée: Voie CEL)",
        gameStatus: "ENDED_SUCCESS",
    },

    ENDING_SUCCESS_REBEL: {
        text: "Vous vous échappez de justesse, votre Mante est à peine fonctionnelle. Les données ont été transmises aux deux camps. La connaissance des Architectes est désormais dispersée, empêchant tout monopole. La guerre se poursuit, mais les enjeux sont plus clairs que jamais. CEL vous célèbre publiquement, mais en coulisses, le haut commandement et les autorités responsables vous renient. Parmi la population, de nombreuses voix s'indignent de cette guerre sans sens aux vues de la menace qui plane. Néanmoins, des rumeurs de rencontres secrètes entre les deux partis, en vue de pourparlers, laissent espérer une avancée vers la résolution du conflit, ou du moins d'une trêve exceptionnelle. (Fin du Cycle de Prométhée: Voie Rebelle)",
        gameStatus: "ENDED_SUCCESS",
    },

    ENDING_SUCCESS_FEU: {
        text: "Vous vous échappez de justesse, votre Mante est à peine fonctionnelle. Le commandement du FEU prend connaissance avec surprise des données que vous leur avez transmises. D'abord méfiant, le FEU vous met rapidement en avant comme réfugié politique via sa propagande étatique. Cette stratégie s'intensifie lorsque les premiers rapports scientifiques tombent et confirment une percée technologique colossale. La guerre vient de prendre un tournant décisif et le FEU va manifestement l'emporter. Vous êtes inquiet quant à la menace du PXF. Selon vous, le parti n'a pas pris conscience du danger réel qui pèse sur l'humanité, relayant ces informations au second plan. Leur priorité actuelle se limite à mettre un point final à cette guerre et à faire payer le prix à CEL. Désormais considéré comme un traître par toute la population CEL, vous vous installez dans la capitale, New Chongqing. La population FEU vous traite majoritairement avec respect, même si vous êtes parfois victime d'animosité de la part de personnes vous considérant comme peu fiable, voire sans honneur. (Fin du Cycle de Prométhée: Voie FEU)",
        gameStatus: "ENDED_SUCCESS",
    },

    ENDING_FAILURE_ESCAPE: {
        text: "Vous avez réussi à vous éjecter avant l'explosion de Léviathan. La créature PXF est libre, quelque part. La guerre politique reprend sans que personne ne comprenne ou même n'ait conscience la nouvelle menace. Votre échec pourrait coûter cher à l'humanité. Vous regagnez votre base, et recevez un appel vous demandant de venir faire votre rapport. (Fin du Cycle de Prométhée: Échec Ténu)",
        gameStatus: "ENDED_FAILURE",
    },

    ENDING_FAILURE_DESTRUCTION: {
        text: "L'explosion vous rattrape. La Mante, votre Pilote, et la station Léviathan sont réduits en poussière. La menace PXF, le Monolithe, et les trahisons corporatives sont anéantis dans le vide. La Terre ne sait pas quelles monstrosités s'apprete à rencontrer. (Fin du Cycle de Prométhée: Destruction Totale)",
        gameStatus: "ENDED_FAILURE",
    },

    GAME_OVER: {
        text: "La mission s'est terminée prématurément. Votre Mante a été détruite, ou votre Pilote n'a pas survécu à la surcharge. C'est une perte critique pour l'escouade. Fin de la partie.",
        gameStatus: "ENDED_FAILURE",
    }
};