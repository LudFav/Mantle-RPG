import { SCENES_DATA } from './data/scenes_index.js';

// Variables globales (fournies par l'environnement Canvas)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
let userId = null;
let authReady = false;

// --- DÉFINITIONS DU JEU ---

// Statistiques de base minimales du Pilote (7 stats, base 1)
const PILOT_BASE_MIN = 1;
// Correction de la clé de la stat QI de Combat pour éviter les problèmes d'espace
const PILOT_BASE_STATS = { Force: PILOT_BASE_MIN, Agilité: PILOT_BASE_MIN, Vitesse: PILOT_BASE_MIN, Intelligence: PILOT_BASE_MIN, Lucidité: PILOT_BASE_MIN, "QI_de_Combat": PILOT_BASE_MIN, Synchronisation: PILOT_BASE_MIN };

// Total de points à distribuer (Total de toutes les stats doit être 35)
const POOL_TOTAL = 35;
const BASE_STATS_TOTAL = Object.keys(PILOT_BASE_STATS).length * PILOT_BASE_MIN; // 7
const DISTRIBUTION_POOL = POOL_TOTAL - BASE_STATS_TOTAL; // 35 - 7 = 28 points à répartir

// MANTES : Définissent la distribution recommandée des 35 points (F, A, V, I, L, QC, S)
// La somme de ces valeurs doit être égale à POOL_TOTAL (35)
const MANTES = {
    Phalange: {
        pilotDistribution: { Force: 9, Agilité: 3, Vitesse: 3, Intelligence: 6, Lucidité: 5, QI_de_Combat: 7, Synchronisation: 2 }, // Somme = 35
        description: "Assaut Lourd. Haute résistance. Mante optimisée pour l'impact et la tactique."
    },
    Aiguille: {
        pilotDistribution: { Force: 3, Agilité: 9, Vitesse: 4, Intelligence: 7, Lucidité: 6, QI_de_Combat: 5, Synchronisation: 1 }, // Somme = 35
        description: "Reconnaissance et CQC. Maîtrise du mouvement et analyse. Mante agile."
    },
    Éclair: {
        pilotDistribution: { Force: 4, Agilité: 5, Vitesse: 9, Intelligence: 5, Lucidité: 4, QI_de_Combat: 5, Synchronisation: 3 }, // Somme = 35
        description: "Interception Rapide. Évitement extrême. Mante optimisée pour la vitesse."
    },
    Omni: {
        pilotDistribution: { Force: 5, Agilité: 5, Vitesse: 5, Intelligence: 6, Lucidité: 6, QI_de_Combat: 5, Synchronisation: 3 }, // Somme = 35
        description: "Soutien et Commandement. Profil équilibré, excellente adaptabilité. Mante Polyvalente."
    }
};

let gameState = {
    name: "",
    manteType: "",
    pilotStats: {}, // F, A, V, I, L, QC, S (valeurs de 1 à 18)
    effectiveStats: {}, // F, A, V (*10), I, L, QC, S (directe) - utilisé pour les checks et l'affichage
    reputation: { CEL: 5, FEU: 5, Aetheria: 0 },
    currentScene: "LORE_INTRO", // COMMENCE PAR L'INTRO DU LORE
    log: [],
    progress: 0,
    gameStatus: "PLAYING",
    successStatus: false, // Ajout pour les conséquences de choix critiques
    failureStatus: false  // Ajout pour les conséquences de choix critiques
};

// --- Initialisation et Construction des Scènes ---

// Applique les conséquences d'un objet de données au gameState
function applyConsequenceFromData(cons) {
    if (!cons) return;
    if (cons.reputation) {
        for (const k of Object.keys(cons.reputation)) {
            const delta = cons.reputation[k];
            gameState.reputation[k] = Math.min(10, Math.max(0, (gameState.reputation[k] || 0) + delta)); // Limite de 0 à 10
        }
    }
    if (cons.ManteHP !== undefined) {
        // Gère les PV de la Mante
        gameState.effectiveStats.ManteHP = Math.max(0, (gameState.effectiveStats.ManteHP || 0) + cons.ManteHP);
        if (cons.ManteHP < 0) {
            updateLog(`[Dégâts] Mante subit ${Math.abs(cons.ManteHP)} PV. Reste: ${gameState.effectiveStats.ManteHP}.`);
        } else if (cons.ManteHP > 0) {
            // Limite les PV Mante au maximum (dynamique)
            const manteMaxHP = (gameState.pilotStats.Force * 10) + 50;
            gameState.effectiveStats.ManteHP = Math.min(manteMaxHP, gameState.effectiveStats.ManteHP);
            updateLog(`[Réparation] Mante regagne ${cons.ManteHP} PV. Total: ${gameState.effectiveStats.ManteHP}.`);
        }
    }
    if (cons.PilotHP !== undefined) {
        // Gère les PV du Pilote
        gameState.effectiveStats.PilotHP = Math.max(0, (gameState.effectiveStats.PilotHP || 0) + cons.PilotHP);
        if (cons.PilotHP < 0) {
            updateLog(`[Dégâts] Pilote subit ${Math.abs(cons.PilotHP)} PV. Reste: ${gameState.effectiveStats.PilotHP}.`);
        } else if (cons.PilotHP > 0) {
            // Limite les PV Pilote au maximum (100)
            gameState.effectiveStats.PilotHP = Math.min(100, gameState.effectiveStats.PilotHP);
            updateLog(`[Soins] Pilote regagne ${cons.PilotHP} PV.`);
        }
    }
    if (cons.stats) {
        // Applique la conséquence sur les 7 stats du pilote
        for (const k of Object.keys(cons.stats)) {
            const delta = cons.stats[k];
            if (gameState.pilotStats[k] !== undefined) {
                gameState.pilotStats[k] = Math.min(18, Math.max(PILOT_BASE_MIN, gameState.pilotStats[k] + delta));
                updateLog(`[Stat Bonus] ${k.replace('_', ' ')} modifié de ${delta}. Nouvelle valeur: ${gameState.pilotStats[k]}.`);
            }
        }
    }
    if (typeof cons.progress === 'number') {
        gameState.progress = cons.progress;
    }
    if (typeof cons.gameStatus === 'string') {
        gameState.gameStatus = cons.gameStatus;
    }
    // Gère les statuts de succès/échec pour débloquer les choix suivants
    if (cons.successStatus !== undefined) {
        gameState.successStatus = cons.successStatus;
        gameState.failureStatus = !cons.successStatus;
    }
    if (cons.failureStatus !== undefined) {
        gameState.failureStatus = cons.failureStatus;
        gameState.successStatus = !cons.failureStatus;
    }

    // Check GAME OVER condition
    if (gameState.effectiveStats.PilotHP <= 0 || gameState.effectiveStats.ManteHP <= 0 && gameState.currentScene.startsWith('ACT_3')) {
        updateLog('[CRITIQUE] PV Pilote épuisés ou Mante détruite en Acte III. Échec de la mission.');
        renderScene('GAME_OVER');
        return;
    }
}

// Transforme les données brutes des scènes en objets avec fonctions de conséquence
function buildScenes(data) {
    const scenes = {};
    for (const [key, value] of Object.entries(data)) {
        scenes[key] = {
            text: value.text || '',
            choices: value.choices || [],
            choices_Phalange: value.choices_Phalange,
            choices_Aiguille: value.choices_Aiguille,
            choices_Éclair: value.choices_Éclair,
            choices_Omni: value.choices_Omni,
            check: value.check,
            renderFn: value.renderFn,
            consequence: value.consequence
                ? () => applyConsequenceFromData(value.consequence)
                : undefined
        };
    }
    if (scenes.CREATION) scenes.CREATION.renderFn = renderCreationScreen;
    if (scenes.GAME_OVER) scenes.GAME_OVER.renderFn = renderGameOver;
    if (scenes.LORE_INTRO) scenes.LORE_INTRO.renderFn = renderGameUI; // L'intro est affichée via l'UI normale
    return scenes;
}

const SCENES = buildScenes(SCENES_DATA);

// --- Sauvegarde Locale (LocalStorage) ---

function getLocalStorageKey() {
    const uid = userId || 'local';
    return `mantle_save_${appId}_${uid}`;
}

function saveGameLocal() {
    try {
        localStorage.setItem(getLocalStorageKey(), JSON.stringify(gameState));
        updateLog(`[Système] Partie sauvegardée en local à ${new Date().toLocaleTimeString()}.`);
    } catch (error) {
        console.error('Erreur sauvegarde locale:', error);
    }
}

function loadGameLocal() {
    try {
        const raw = localStorage.getItem(getLocalStorageKey());
        if (!raw) {
            updateLog('[Système] Aucune sauvegarde locale trouvée. Affichage du Dossier Confidentiel.');
            // Démarrer par l'écran de LORE_INTRO si aucune sauvegarde n'existe
            renderScene('LORE_INTRO');
            return;
        }
        const loaded = JSON.parse(raw);
        Object.assign(gameState, loaded);

        // Recalcul des stats effectives après chargement
        calculateEffectiveStats();

        updateLog(`[Système] Partie locale chargée. Bienvenue, ${gameState.name} (${gameState.manteType}).`);
        renderScene(gameState.currentScene);
    } catch (error) {
        console.error('Erreur chargement local:', error);
        // Fallback: démarrer par l'écran de LORE_INTRO
        renderScene('LORE_INTRO');
    }
}

function saveGame() { saveGameLocal(); }
function loadGame() { loadGameLocal(); }

function resetToCreation() {
    try { localStorage.removeItem(getLocalStorageKey()); } catch (_) { }
    gameState.name = "";
    gameState.manteType = "";
    gameState.pilotStats = {};
    gameState.effectiveStats = {};
    gameState.reputation = { CEL: 5, FEU: 5, Aetheria: 0 };
    gameState.log = [];
    gameState.progress = 0;
    gameState.gameStatus = "PLAYING";
    gameState.successStatus = false;
    gameState.failureStatus = false;
    // Rediriger vers le lore pour recommencer
    renderScene('LORE_INTRO');
}

// --- Logique du Jeu ---

// Calcule les 7 stats effectives (Physiques x10, Mentales x1)
function calculateEffectiveStats() {
    if (Object.keys(gameState.pilotStats).length === 0) return;

    // Stats mentales (I, L, QC, S)
    gameState.effectiveStats.Intelligence = gameState.pilotStats.Intelligence;
    gameState.effectiveStats.Lucidité = gameState.pilotStats.Lucidité;
    gameState.effectiveStats["QI_de_Combat"] = gameState.pilotStats["QI_de_Combat"];
    gameState.effectiveStats.Synchronisation = gameState.pilotStats.Synchronisation;

    // Stats physiques (F, A, V) multipliées par 10
    gameState.effectiveStats.Force = gameState.pilotStats.Force * 10;
    gameState.effectiveStats.Agilité = gameState.pilotStats.Agilité * 10;
    gameState.effectiveStats.Vitesse = gameState.pilotStats.Vitesse * 10;

    // Initialisation des PV si nécessaire
    if (gameState.effectiveStats.ManteHP === undefined) {
        // PV Mante = Force brute du pilote * 10 + 50 (Base d'armure)
        gameState.effectiveStats.ManteHP = (gameState.pilotStats.Force * 10) + 50;
    }
    if (gameState.effectiveStats.PilotHP === undefined) {
        // PV Pilote = 100 (fixe)
        gameState.effectiveStats.PilotHP = 100;
    }
}


function newGame(manteType, name) {
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
        updateLog(`[Erreur] Veuillez distribuer exactement ${POOL_TOTAL} points. Total actuel : ${currentSum}.`);
        return;
    }

    gameState.name = name || "Inconnu";
    gameState.manteType = manteType;

    gameState.pilotStats = stats;

    // Initialisation des PV et des stats effectives
    gameState.effectiveStats = {}; // Réinitialise avant de calculer
    calculateEffectiveStats();

    const effStats = gameState.effectiveStats;

    gameState.reputation = { CEL: 5, FEU: 5, Aetheria: 0 };
    gameState.log = [
        `[Départ] ${name} a choisi l'ECA Mante ${manteType}.`,
        `[Pilote Base] F:${stats.Force}, A:${stats.Agilité}, V:${stats.Vitesse}, I:${stats.Intelligence}, L:${stats.Lucidité}, QC:${stats.QI_de_Combat}, S:${stats.Synchronisation}.`,
        `[Mante Effective] F:${effStats.Force}, A:${effStats.Agilité}, V:${effStats.Vitesse}. PV Mante: ${effStats.ManteHP}, PV Pilote: ${effStats.PilotHP}.`
    ];
    gameState.currentScene = "ACT_1_KAIROK_INTRO";
    gameState.progress = 0;
    gameState.gameStatus = "PLAYING";
    gameState.successStatus = false;
    gameState.failureStatus = false;

    saveGame();
    renderScene("ACT_1_KAIROK_INTRO");
}

function updateLog(message) {
    gameState.log.push(message);
    if (gameState.log.length > 10) {
        gameState.log.shift();
    }
    // Mise à jour de l'UI du log est incluse dans renderGameUI
}

function filterChoicesByRequirements(choices) {
    return choices.filter(choice => {
        if (!choice.requirements) return true;

        // Vérification des exigences de statut (Avantage/Critique)
        if (choice.requirements.successStatus !== undefined && choice.requirements.successStatus !== gameState.successStatus) {
            return false;
        }
        if (choice.requirements.failureStatus !== undefined && choice.requirements.failureStatus !== gameState.failureStatus) {
            return false;
        }

        // Vérification des exigences de statistiques minimales
        for (const stat in choice.requirements) {
            if (stat !== 'successStatus' && stat !== 'failureStatus') {
                // Utilise les stats du Pilote (non x10) pour les checks d'exigence
                const required = choice.requirements[stat];
                const actual = gameState.pilotStats[stat] || 0;
                if (actual < required) {
                    return false;
                }
            }
        }
        return true;
    });
}

// Gère l'affichage des choix indisponibles
function getChoiceUnavailableReason(choice) {
    if (!choice.requirements) return null;

    const requiredStats = [];

    for (const stat in choice.requirements) {
        if (stat !== 'successStatus' && stat !== 'failureStatus') {
            const required = choice.requirements[stat];
            const actual = gameState.pilotStats[stat] || 0;
            if (actual < required) {
                requiredStats.push(`${stat.replace('_', ' ')}: ${required} (Actuel: ${actual})`);
            }
        }
    }

    if (requiredStats.length > 0) {
        return `[Verrouillé] Requis: ${requiredStats.join(', ')}`;
    }

    if (choice.requirements.successStatus === true && !gameState.successStatus) {
        return "[Verrouillé] Nécessite un SUCCÈS lors de la manœuvre précédente.";
    }
    if (choice.requirements.failureStatus === true && !gameState.failureStatus) {
        return "[Verrouillé] Nécessite un ÉCHEC lors de la manœuvre précédente.";
    }
    return null;
}

function checkSkill(stat, difficulty) {
    // Statistique pour le jet (valeur de base du Pilote)
    const checkValue = gameState.pilotStats[stat];

    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + checkValue;

    const message = `[CHECK] ${stat.replace('_', ' ')} (Valeur: ${checkValue} + D20 Jet: ${roll}) vs Diff: ${difficulty}. Total: ${total}.`;
    updateLog(message);

    return total >= difficulty;
}

function handleChoice(sceneKey, choiceIndex) {
    const currentScene = SCENES[sceneKey];

    // 1. Déterminer les choix disponibles (selon le type de Mante)
    let sceneChoices = currentScene.choices;
    if (gameState.manteType) {
        sceneChoices = currentScene[`choices_${gameState.manteType}`] || currentScene.choices;
    }

    // 2. Filtrer les choix par les exigences (statuts et stats)
    const availableChoices = filterChoicesByRequirements(sceneChoices);

    // 3. Obtenir le choix sélectionné (doit être dans la liste des choix filtrés)
    const choice = availableChoices[choiceIndex];

    if (!choice) {
        updateLog("[Erreur] Choix sélectionné non valide ou non disponible.");
        return;
    }

    const nextSceneKey = choice.next;

    // 4. Appliquer les conséquences du choix
    if (choice.consequence) {
        choice.consequence();
        calculateEffectiveStats();
    }

    const scene = SCENES[nextSceneKey];

    // 5. Résoudre un Check (Jet de Dés)
    if (scene && scene.check) {
        const success = checkSkill(scene.check.stat, scene.check.difficulty);

        // Application des conséquences spécifiques au combat
        if (scene.check.type === "COMBAT_CHECK") {
            const damageMante = scene.check.damageMante;
            const damagePilot = scene.check.damagePilot;

            if (success) {
                // Dégâts réduits/mitigés en cas de succès au combat
                applyConsequenceFromData({
                    ManteHP: -Math.floor(damageMante * 0.5),
                    PilotHP: -Math.floor(damagePilot * 0.5),
                    successStatus: true // Marque le succès pour la scène suivante
                });
            } else {
                // Dégâts pleins en cas d'échec
                applyConsequenceFromData({
                    ManteHP: -damageMante,
                    PilotHP: -damagePilot,
                    failureStatus: true // Marque l'échec pour la scène suivante
                });
            }
        }

        if (success) {
            updateLog(`[Résultat] Succès du jet de ${scene.check.stat.replace('_', ' ')} !`);
            renderScene(scene.check.success);
        } else {
            updateLog(`[Résultat] Échec du jet de ${scene.check.stat.replace('_', ' ')}.`);
            renderScene(scene.check.failure);
        }
        return;
    }

    // 6. Gérer les conséquences d'une scène simple (sans jet de dés)
    if (scene && scene.consequence) {
        scene.consequence();
        calculateEffectiveStats();
    }

    // 7. Navigation
    renderScene(nextSceneKey);
    saveGame();
}

// --- Fonctions de Rendu (UI) ---

const gameView = document.getElementById('game-view');

/**
 * Convertit une table Markdown simple en structure HTML avec classes Tailwind.
 * Utilisé uniquement pour la scène LORE_INTRO.
 */
function markdownTableToHtml(markdown) {
    const lines = markdown.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 3) return `<p>Erreur: Tableau incomplet.</p>`;

    // Lignes 0: Entêtes, Ligne 1: Séparateur (|:---|:---|), Ligne 2+: Contenu
    const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
    const bodyRows = lines.slice(2);

    let html = '<table class="w-full text-sm text-left table-auto border-collapse">';

    // Header
    html += '<thead class="text-xs text-gray-200 uppercase bg-gray-700">';
    html += '<tr>';
    headers.forEach(h => {
        html += `<th scope="col" class="px-3 py-2 border-b border-gray-600">${h}</th>`;
    });
    html += '</tr></thead>';

    // Body
    html += '<tbody>';
    bodyRows.forEach(row => {
        const cells = row.split('|').map(c => c.trim()).filter(c => c);
        html += '<tr class="bg-gray-800 border-b border-gray-700 hover:bg-gray-700 transition-colors">';
        cells.forEach((cell, index) => {
            const content = cell.replace(/\*\*/g, '<strong>').replace(/\$/g, ''); // Convertir **gras** et supprimer $ pour LaTeX
            if (index === 0) {
                html += `<th scope="row" class="px-3 py-2 font-medium text-white">${content}</th>`;
            } else {
                html += `<td class="px-3 py-2">${content}</td>`;
            }
        });
        html += '</tr>';
    });
    html += '</tbody></table>';

    return html;
}


function renderStatBar(stat, value) {
    // Stat non multipliée du pilote (pour la barre visuelle)
    const pilotValue = gameState.pilotStats[stat] || value;

    // Valeur affichée (non multipliée)
    const checkValue = pilotValue;
    const effectiveValue = ['Force', 'Agilité', 'Vitesse'].includes(stat) ? value : pilotValue;

    // Valeur pour la barre visuelle (base sur la stat du pilote, max 18)
    const max = 18;
    const percentage = Math.min(checkValue, max) / max * 100;

    let color;
    switch (stat) {
        case 'Force': color = 'bg-red-500'; break;
        case 'Agilité': color = 'bg-blue-500'; break;
        case 'Vitesse': color = 'bg-yellow-500'; break;
        case 'Intelligence': color = 'bg-purple-500'; break;
        case 'Lucidité': color = 'bg-cyan-500'; break;
        case 'QI_de_Combat': color = 'bg-green-500'; break;
        case 'Synchronisation': color = 'bg-orange-500'; break;
        default: color = 'bg-gray-500';
    }

    // Affichage : (Valeur Pilote) (Valeur Effective)
    const displayValue = ['Force', 'Agilité', 'Vitesse'].includes(stat)
        ? `${checkValue} <span class="text-gray-400">(${effectiveValue})</span>`
        : `${checkValue}`;

    const tooltip = ['Force', 'Agilité', 'Vitesse'].includes(stat) ? "Valeur Pilote (Valeur Mante)" : "Valeur Pilote/Effective";


    return `
        <div class="mb-2" title="${tooltip}">
            <div class="flex justify-between text-sm font-semibold">
                <span>${stat.replace('_', ' ')}</span>
                <span>${displayValue}</span>
            </div>
            <div class="stat-bar-bg h-2 rounded-full mt-1">
                <div class="${color} h-2 rounded-full" style="width: ${percentage}%;"></div>
            </div>
        </div>
    `;
}

function renderHealthBar(label, currentHP, maxHP, color) {
    const percentage = (currentHP / maxHP) * 100;
    const isCritical = percentage <= 25;
    const barColor = isCritical ? 'bg-red-700' : color;
    const tooltip = label === "PV Mante (Armure)" ? "Les PV Mante sont calculés par votre Force Pilote x 10" : "PV Pilote = 100 (GameOver à 0)";

    return `
        <div class="mb-2" title="${tooltip}">
            <div class="flex justify-between text-sm font-semibold">
                <span class="text-white">${label}</span>
                <span class="${isCritical ? 'text-red-400' : 'text-white'}">${Math.max(0, currentHP)} / ${maxHP}</span>
            </div>
            <div class="stat-bar-bg h-2 rounded-full mt-1">
                <div class="${barColor} h-2 rounded-full transition-all duration-500" style="width: ${percentage}%;"></div>
            </div>
        </div>
    `;
}


function renderGameUI() {
    calculateEffectiveStats(); // Assurer que les PV sont à jour

    // Affichage des pilotStats pour les barres (et effectiveStats pour les PV)
    const statsHTML = Object.entries(gameState.pilotStats).map(([stat]) =>
        renderStatBar(stat, gameState.effectiveStats[stat] || gameState.pilotStats[stat])
    ).join('');

    const manteMaxHP = (gameState.pilotStats.Force * 10) + 50; // Calcul dynamique du max PV Mante
    const hpManteHTML = renderHealthBar("PV Mante (Armure)", gameState.effectiveStats.ManteHP, manteMaxHP, 'bg-gray-500');
    const hpPilotHTML = renderHealthBar("PV Pilote (Vitals)", gameState.effectiveStats.PilotHP, 100, 'bg-red-400');

    const logHTML = gameState.log.map(msg => `<p class="text-xs text-gray-400">${msg}</p>`).reverse().join('');

    const currentScene = SCENES[gameState.currentScene];

    let sceneChoices = currentScene.choices;
    if (gameState.manteType) {
        sceneChoices = currentScene[`choices_${gameState.manteType}`] || currentScene.choices;
    }

    const allChoices = sceneChoices || [];
    const choicesHTML = allChoices.map((choice, index) => {
        const isAvailable = filterChoicesByRequirements([choice]).length > 0;
        const reason = getChoiceUnavailableReason(choice);

        let buttonClass = 'btn-choice';
        let buttonText = choice.text;
        let isDisabled = !isAvailable;

        // Remplacement du Markdown pour le gras dans le texte du bouton
        buttonText = buttonText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        if (isDisabled) {
            buttonClass = 'bg-gray-700 text-gray-400 cursor-not-allowed border-gray-600';
            buttonText += ` <span class="text-red-400 ml-2">(${reason})</span>`;
        } else if (choice.text.includes("[AVANTAGE/DÉTERMINANT]")) {
            buttonClass = 'bg-blue-800/50 text-blue-300 border-blue-500 hover:bg-blue-800 hover:ring-blue-500';
        } else if (choice.text.includes("[DIFFICILE/CRITIQUE]")) {
            buttonClass = 'bg-red-800/50 text-red-300 border-red-500 hover:bg-red-800 hover:ring-red-500';
        }

        return `
            <button onclick="${isAvailable ? `handleChoiceWrapper('${gameState.currentScene}', ${index})` : ''}"
                    class="${buttonClass} w-full text-left p-3 rounded-lg mt-3 text-sm hover:ring-2"
                    ${isDisabled ? 'disabled' : ''}>
                ${buttonText.replace(/\[AVANTAGE\/DÉTERMINANT\]|\[DIFFICILE\/CRITIQUE\]/g, '').trim()}
            </button>
        `;
    }).join('');

    // --- Rendu de LORE_INTRO ---
    if (gameState.currentScene === 'LORE_INTRO') {
        const textParts = currentScene.text.split("Composition des Escouades ECA (Mantes)");
        const loreText = textParts[0].trim();
        const markdownTable = textParts.length > 1 ? textParts[1].trim() : '';

        const tableHTML = markdownTableToHtml(markdownTable);

        const loreChoices = [{ text: "Commencer la Création de Personnage", next: "CREATION" }];
        const loreButton = loreChoices.map((choice, index) => `
            <button onclick="handleChoiceWrapper('${gameState.currentScene}', ${index})"
                    class="btn-primary w-full p-3 rounded-lg mt-6 font-bold text-lg">
                ${choice.text}
            </button>
        `).join('');

        gameView.innerHTML = `
             <div class="max-w-4xl mx-auto space-y-6">
                <h2 class="text-2xl font-bold text-center text-green-400">Dossier Confidentiel</h2>
                <div class="bg-gray-800 p-6 rounded-lg whitespace-pre-line text-sm leading-relaxed">
                    ${loreText}
                    <h3 class="font-semibold text-lg mt-4 mb-2 text-yellow-400">Composition des Escouades ECA (Mantes)</h3>
                    ${tableHTML}
                </div>
                ${loreButton}
            </div>
        `;
        return;
    }

    // --- Rendu du JEU NORMAL ---
    gameView.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Panneau de Statistiques et Log -->
            <aside class="lg:col-span-1 bg-gray-800 p-4 rounded-lg">
                <h2 class="text-xl font-bold mb-3 text-white">${gameState.name} | Mante ${gameState.manteType}</h2>
                
                <h3 class="text-md font-semibold mb-2 text-red-400">État du Combat</h3>
                ${hpManteHTML}
                ${hpPilotHTML}

                <div class="border-b border-gray-700 pt-3 pb-3 mb-3">
                    <h3 class="text-md font-semibold mb-2 text-yellow-400">Statistiques Pilote (x10 pour Physique)</h3>
                    ${statsHTML}
                </div>
                
                <h3 class="text-lg font-semibold mb-2 text-green-400">Réputation (Max 10)</h3>
                <p class="text-sm">CEL: ${gameState.reputation.CEL} / FEU: ${gameState.reputation.FEU} / Aetheria: ${gameState.reputation.Aetheria}</p>
                
                <h3 class="text-lg font-semibold mt-4 mb-2 text-white">Journal des Opérations</h3>
                <div class="h-40 overflow-y-auto space-y-1 p-2 bg-gray-900 rounded text-xs">
                    ${logHTML}
                </div>
                <div class="grid grid-cols-2 gap-2 mt-4">
                    <button onclick="saveGameLocal()" class="btn-primary p-2 rounded-lg text-sm">Sauvegarde Locale</button>
                    <button onclick="loadGameLocal()" class="btn-choice p-2 rounded-lg text-sm">Charger Local</button>
                    <button onclick="exportRunAsJSON()" class="btn-choice p-2 rounded-lg text-sm">Exporter JSON</button>
                    <button onclick="exportRunAsPDF()" class="btn-choice p-2 rounded-lg text-sm">Exporter PDF</button>
                    <button onclick="resetToCreation()" class="btn-choice p-2 rounded-lg text-sm col-span-2">Nouvelle Partie</button>
                </div>
            </aside>

            <!-- Zone Narrative et Choix -->
            <main class="lg:col-span-2">
                <div class="bg-gray-800 p-6 rounded-lg">
                    <p class="text-base leading-relaxed whitespace-pre-line">${currentScene.text}</p>
                </div>

                <div class="mt-6">
                    <h3 class="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-2">Actions</h3>
                    ${choicesHTML || '<p class="text-gray-400">Fin de la scène. Veuillez recharger la partie si le jeu n\'a pas pris fin.</p>'}
                </div>
            </main>
        </div>
    `;

    // Mettre à jour la zone de log après le rendu complet de l'UI
    const logArea = document.querySelector('.overflow-y-auto');
    if (logArea) {
        logArea.scrollTop = logArea.scrollHeight;
    }
}

function renderCreationScreen() {
    let optionsHTML = '';
    const statKeys = Object.keys(PILOT_BASE_STATS);

    for (const [key, mante] of Object.entries(MANTES)) {
        optionsHTML += `
            <div class="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-500 transition cursor-pointer" 
                 onclick="applyRecommendedDistribution('${key}')">
                <h3 class="font-bold text-lg text-green-400">${key}</h3>
                <p class="text-sm text-gray-400">${mante.description}</p>
            </div>
        `;
    }

    // HTML pour la distribution des points
    let distributionHTML = statKeys.map(stat => `
        <div class="flex items-center justify-between p-2 border-b border-gray-700 last:border-b-0">
            <label class="text-sm font-semibold text-white">${stat.replace('_', ' ')}</label>
            <input type="number" data-stat="${stat}" min="1" max="18" value="1"
                   oninput="updatePoolDisplay()"
                   class="w-16 p-1 rounded bg-gray-700 text-center border-none focus:ring-green-500 focus:border-green-500" />
        </div>
    `).join('');


    gameView.innerHTML = `
        <div class="max-w-xl mx-auto space-y-6">
            <h2 class="text-2xl font-bold text-center">Création de Personnage</h2>
            <div class="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p class="text-sm leading-relaxed whitespace-pre-line">${SCENES.CREATION.text}</p>
            </div>
            
            <input type="text" id="player_name" placeholder="Nom de Code / Surnom (Ex: 'Ghost')"
                   class="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-green-500 focus:border-green-500" />
            
            <input type="hidden" id="mante_type" value="Phalange" />
            
            <h3 class="font-semibold text-lg text-white mt-4 border-b border-gray-700 pb-2">1. Distribution des Points (${POOL_TOTAL} Total)</h3>
            <div id="stat_distribution" class="bg-gray-800 p-4 rounded-lg border border-green-500/50">
                <p class="text-center font-bold mb-3">Points Restants : <span id="pool_remaining" class="text-green-400">${DISTRIBUTION_POOL}</span></p>
                ${distributionHTML}
            </div>

            <h3 class="font-semibold text-lg text-white mt-4 border-b border-gray-700 pb-2">2. Choisissez le Modèle Mante (Recommandations)</h3>
            <div class="grid grid-cols-2 gap-4">
                ${optionsHTML}
            </div>
            
            <div class="flex gap-4">
                <button onclick="newGame(document.getElementById('mante_type').value || 'Phalange', document.getElementById('player_name').value || 'Inconnu')"
                        class="btn-primary flex-1 p-3 rounded-lg font-bold">
                    Commencer la Campagne
                </button>
                <button onclick="loadGame()" class="btn-choice flex-1 p-3 rounded-lg font-bold">
                    Charger la Dernière Partie
                </button>
            </div>
        </div>
    `;

    // Initialise l'affichage et les valeurs par défaut (Phalange)
    const initialManteType = 'Phalange';

    window.applyRecommendedDistribution = (type) => {
        const distribution = MANTES[type].pilotDistribution;
        document.getElementById('mante_type').value = type;

        Object.keys(distribution).forEach(stat => {
            const input = document.querySelector(`input[data-stat="${stat}"]`);
            if (input) {
                input.value = distribution[stat];
            }
        });
        updatePoolDisplay();
    };

    window.updatePoolDisplay = () => {
        let currentSum = 0;
        const inputs = document.querySelectorAll('#stat_distribution input[data-stat]');

        inputs.forEach(input => {
            currentSum += parseInt(input.value) || PILOT_BASE_MIN;
            // Assurer que la valeur reste dans les bornes (min 1, max 18)
            input.value = Math.max(PILOT_BASE_MIN, Math.min(18, parseInt(input.value) || PILOT_BASE_MIN));
        });

        const remaining = POOL_TOTAL - currentSum;
        const remainingEl = document.getElementById('pool_remaining');

        remainingEl.textContent = remaining;

        if (currentSum > POOL_TOTAL) {
            remainingEl.classList.remove('text-green-400', 'text-yellow-500');
            remainingEl.classList.add('text-red-500');
        } else if (currentSum < POOL_TOTAL) {
            remainingEl.classList.remove('text-red-500', 'text-green-400');
            remainingEl.classList.add('text-yellow-500');
        } else {
            remainingEl.classList.remove('text-red-500', 'text-yellow-500');
            remainingEl.classList.add('text-green-400');
        }
    };

    // Appliquer la distribution par défaut (Phalange) au chargement
    window.applyRecommendedDistribution(initialManteType);
    window.updatePoolDisplay();
}

function renderGameOver() {
    let endingText = "";
    let color = "text-green-500";
    if (gameState.gameStatus === "ENDED_SUCCESS") {
        endingText = `Fin de Partie (Succès) : ${SCENES[gameState.currentScene].text}`;
        color = "text-green-500";
    } else {
        endingText = `Fin de Partie (Mise en Danger) : ${SCENES[gameState.currentScene].text}`;
        color = "text-yellow-500";
    }

    const finalQC = gameState.pilotStats.QI_de_Combat || 'N/A';

    gameView.innerHTML = `
        <div class="max-w-xl mx-auto text-center space-y-6 p-8 bg-gray-800 rounded-xl">
            <h2 class="text-3xl font-bold ${color}">FIN DE MISSION</h2>
            <p class="text-base leading-relaxed whitespace-pre-line">${endingText}</p>
            <p class="text-lg font-semibold mt-4">Statut Final de l'Escouade ${gameState.name} (${gameState.manteType}) :</p>
            <p class="text-sm">Progression : ${gameState.progress}%</p>
            <p class="text-sm">QI de Combat Final : ${finalQC}</p>
            <div class="grid grid-cols-2 gap-2 mt-6">
                <button onclick="saveGameLocal()" class="btn-primary p-3 rounded-lg font-bold">Sauvegarde Locale</button>
                <button onclick="exportRunAsJSON()" class="btn-choice p-3 rounded-lg font-bold">Exporter JSON</button>
                <button onclick="exportRunAsPDF()" class="btn-choice p-3 rounded-lg font-bold col-span-2">Exporter PDF</button>
            </div>
            <button onclick="resetToCreation()" class="btn-primary w-full p-3 rounded-lg font-bold mt-4">Recommencer une Nouvelle Partie</button>
        </div>
    `;
}

function renderScene(sceneKey) {
    gameState.currentScene = sceneKey;

    if (sceneKey === "CREATION") {
        renderCreationScreen();
    } else if (sceneKey.startsWith("ENDING") || sceneKey === "GAME_OVER") {
        renderGameOver();
        saveGame();
    } else {
        renderGameUI();
    }
}

// --- Fonctions d'Export ---
function buildRunSummary() {
    const lines = [];
    lines.push(`Joueur: ${gameState.name}`);
    lines.push(`Mante: ${gameState.manteType}`);
    lines.push(`PV Mante: ${gameState.effectiveStats.ManteHP}, PV Pilote: ${gameState.effectiveStats.PilotHP}`);
    lines.push('--- Statistiques de Base du Pilote ---');
    lines.push(`Force: ${gameState.pilotStats.Force}, Agilité: ${gameState.pilotStats.Agilité}, Vitesse: ${gameState.pilotStats.Vitesse}`);
    lines.push(`Intelligence: ${gameState.pilotStats.Intelligence}, Lucidité: ${gameState.pilotStats.Lucidité}, QI_de_Combat: ${gameState.pilotStats.QI_de_Combat}, Synchronisation: ${gameState.pilotStats.Synchronisation}`);
    lines.push('--- Statistiques Effectives ---');
    lines.push(`Force: ${gameState.effectiveStats.Force}, Agilité: ${gameState.effectiveStats.Agilité}, Vitesse: ${gameState.effectiveStats.Vitesse} (x10)`);
    lines.push(`Intelligence: ${gameState.effectiveStats.Intelligence}, Lucidité: ${gameState.effectiveStats.Lucidité}, QI_de_Combat: ${gameState.effectiveStats.QI_de_Combat}, Synchronisation: ${gameState.effectiveStats.Synchronisation}`);
    lines.push(`Réputation: CEL ${gameState.reputation.CEL}, FEU ${gameState.reputation.FEU}, Aetheria ${gameState.reputation.Aetheria}`);
    lines.push(`Progression: ${gameState.progress}%`);
    lines.push(`Scène Courante: ${gameState.currentScene}`);
    lines.push('--- Journal (du plus récent au plus ancien) ---');
    const logLines = [...gameState.log].slice(-50).reverse();
    lines.push(...logLines);
    return lines.join('\n');
}

function exportRunAsJSON() {
    const data = {
        timestamp: new Date().toISOString(),
        gameState
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mantle_run_${gameState.name || 'inconnu'}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

async function exportRunAsPDF() {
    try {
        const { jsPDF } = await import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
        const doc = new jsPDF();
        const text = buildRunSummary();
        const margin = 10;
        const maxWidth = 190;
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, margin, margin);
        doc.save(`mantle_run_${gameState.name || 'inconnu'}.pdf`);
    } catch (error) {
        console.error('Erreur export PDF:', error);
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(`<pre>${buildRunSummary().replace(/</g, '&lt;')}</pre>`);
            w.document.close();
            w.focus();
            w.print();
        }
    }
}

// --- Initialisation ---

window.handleChoiceWrapper = handleChoice;
window.newGame = newGame;
window.loadGame = loadGame;
window.saveGameLocal = saveGameLocal;
window.loadGameLocal = loadGameLocal;
window.exportRunAsJSON = exportRunAsJSON;
window.exportRunAsPDF = exportRunAsPDF;
window.renderScene = renderScene;
window.resetToCreation = resetToCreation;

authReady = true;
userId = crypto.randomUUID();
// Démarrer l'application en essayant de charger la sauvegarde locale
loadGameLocal();
