import { loadGameLocal, resetToCreation, handleChoice, handleCombatChoice, startGame, saveGameLocal } from './game_logic.js';
import { renderApp } from './ui.js';
import { exportRunAsJSON, exportRunAsPDF } from './utils.js';

window.game = {
    loadGameLocal,
    resetToCreation,
    handleChoice,
    handleCombatChoice,
    startGame,
    saveGameLocal,
    exportRunAsJSON,
    exportRunAsPDF
};

export function update(gameState) {
    renderUI(gameState);
}

document.addEventListener('DOMContentLoaded', () => {
    loadGameLocal();
});

