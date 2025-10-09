import { startGame, loadGameLocal, resetToCreation, handleChoice, handleCombatChoice } from './game_logic.js';
import { renderScene, exportRunAsJSON, exportRunAsPDF } from './ui_render.js';
import { MANTES, PILOT_BASE_STATS, POOL_TOTAL, DISTRIBUTION_POOL } from './models.js';

window.MANTES = MANTES;
window.PILOT_BASE_STATS = PILOT_BASE_STATS;
window.POOL_TOTAL = POOL_TOTAL;
window.DISTRIBUTION_POOL = DISTRIBUTION_POOL;
window.startGame = startGame;
window.loadGameLocal = loadGameLocal;
window.resetToCreation = resetToCreation;
window.renderScene = renderScene;
window.handleChoiceWrapper = handleChoice;
window.handleCombatChoice = handleCombatChoice; n
window.exportRunAsJSON = exportRunAsJSON;
window.exportRunAsPDF = exportRunAsPDF;

document.addEventListener('DOMContentLoaded', () => {
    loadGameLocal();
});
