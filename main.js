import { startGame, loadGameLocal, resetToCreation, handleChoice, handleCombatChoice, saveGameLocal } from './game_logic.js';
import { renderScene, exportRunAsJSON, exportRunAsPDF } from './ui_render.js';
import { MANTES, PILOT_BASE_STATS, POOL_TOTAL, DISTRIBUTION_POOL } from './models.js';

// Données du jeu pour l'écran de création
window.MANTES = MANTES;
window.PILOT_BASE_STATS = PILOT_BASE_STATS;
window.POOL_TOTAL = POOL_TOTAL;
window.DISTRIBUTION_POOL = DISTRIBUTION_POOL;

// Fonctions de gestion de la partie
window.startGame = startGame;
window.loadGameLocal = loadGameLocal;
window.resetToCreation = resetToCreation;
window.saveGameLocal = saveGameLocal; 

// Fonctions d'interaction
window.renderScene = renderScene;
window.handleChoice = handleChoice; 
window.handleCombatChoice = handleCombatChoice;
window.exportRunAsJSON = exportRunAsJSON;
window.exportRunAsPDF = exportRunAsPDF;


// --- Initialisation du jeu ---
document.addEventListener('DOMContentLoaded', () => {
    loadGameLocal();
});

