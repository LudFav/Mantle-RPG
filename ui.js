import { render, h } from 'https://esm.sh/preact@10.19.2';
import { useState, useEffect, useCallback } from 'https://esm.sh/preact@10.19.2/hooks';
import htm from 'https://esm.sh/htm@3.1.1';

import { SCENES, handleChoice, handleCombatChoice, startGame, loadGameLocal, resetToCreation, spendStatPoint, saveGameLocal } from './game_logic.js';
import { MANTES, POOL_TOTAL, DISTRIBUTION_POOL, MANTE_SPECIAL_ATTACKS, ENEMY_TYPES, PILOT_BASE_STATS, PILOT_BASE_MIN } from './models.js';
import { exportRunAsJSON, exportRunAsPDF, markdownTableToHtml } from './utils.js';

const html = htm.bind(h);

// --- COMPOSANTS UTILITAIRES ---
const StatBar = ({ stat, value, color, isEffective = false }) => {
    const displayValue = isEffective ? Math.floor(value / 10) : value;
    const max = isEffective ? 20 : 18;
    const percentage = (displayValue / max) * 100;
    return html`
        <div class="mb-2">
            <div class="flex justify-between text-sm font-semibold">
                <span>${stat.replace(/_/g, ' ')}</span>
                <span>${displayValue} <span class="text-gray-400">(${value})</span></span>
            </div>
            <div class="w-full bg-gray-700 h-2 rounded-full mt-1">
                <div class="${color} h-2 rounded-full" style=${{ width: `${percentage}%` }}></div>
            </div>
        </div>
    `;
};

const ResourceBar = ({ label, current, max, colorClass }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    const displayCurrent = Math.max(0, Math.floor(current));
    return html`
        <div class="mb-3">
            <div class="flex justify-between text-sm font-semibold text-white">
                <span>${label}</span>
                <span class="${current <= max * 0.2 ? 'text-red-400 animate-pulse' : 'text-green-400'}">${displayCurrent} / ${max}</span>
            </div>
            <div class="w-full bg-gray-700 h-3 rounded-full mt-1">
                <div class="h-3 rounded-full ${colorClass}" style=${{ width: `${percentage}%` }}></div>
            </div>
        </div>
    `;
};

const XPBar = ({ current, max, level }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return html`
        <div class="mb-3">
            <div class="flex justify-between text-sm font-semibold text-white">
                <span>Niveau ${level}</span>
                <span class="text-yellow-400">XP: ${current} / ${max}</span>
            </div>
            <div class="w-full bg-gray-700 h-3 rounded-full mt-1">
                <div class="h-3 rounded-full bg-yellow-500" style=${{ width: `${percentage}%` }}></div>
            </div>
        </div>
    `;
}

// --- PANNEAU LATÉRAL ---
const StatPanel = ({ gameState }) => {
    const handleSpendPoint = (stat) => {
        if (gameState.statPoints > 0) {
            spendStatPoint(stat);
        }
    };

    return html`
        <aside class="lg:col-span-1 bg-gray-800 p-4 rounded-lg sticky top-4">
            <h2 class="text-xl font-bold mb-3 text-white">${gameState.name || 'Opérateur'} | Mante ${gameState.manteType}</h2>
            
            <${XPBar} current=${gameState.xp} max=${gameState.xpToNextLevel} level=${gameState.level} />
            <${ResourceBar} label="PV Pilote" current=${gameState.pilotHP} max=${100} colorClass="bg-red-500" />
            <${ResourceBar} label="PV Mante" current=${gameState.manteHP} max=${gameState.manteMaxHP} colorClass="bg-green-500" />
            <${ResourceBar} label="Énergie Mante" current=${gameState.manteEnergy} max=${gameState.manteMaxEnergy} colorClass="bg-blue-500" />

            <div class="border-y border-gray-700 py-3 my-3">
                <h3 class="text-md font-semibold mb-2 text-yellow-400">Aptitudes Pilote</h3>
                ${gameState.statPoints > 0 && html`<p class="text-sm text-green-400 mb-2">Points à distribuer : ${gameState.statPoints}</p>`}
                ${Object.entries(gameState.pilotStats).map(([stat, value]) => html`
                    <div class="flex justify-between items-center text-sm py-1">
                        <span>${stat.replace(/_/g, ' ')}: <span class="font-bold text-white">${value}</span></span>
                        ${gameState.statPoints > 0 && html`
                            <button onClick=${() => handleSpendPoint(stat)} class="bg-green-600 hover:bg-green-500 text-white font-bold w-6 h-6 rounded-full text-xs">+</button>
                        `}
                    </div>
                `).join('')}
            </div>
            
            <h3 class="text-lg font-semibold mt-4 mb-2 text-white">Journal des Opérations</h3>
            <div id="log-display" class="h-40 overflow-y-auto space-y-1 p-2 bg-gray-900 rounded text-xs">
                ${gameState.log.slice(-10).map(msg => html`<p class="text-gray-400">${msg}</p>`).reverse()}
            </div>
            
            <div class="grid grid-cols-2 gap-2 mt-4">
                <button onClick=${() => saveGameLocal()} class="btn-primary p-2 rounded-lg text-sm">Sauvegarde</button>
                <button onClick=${() => loadGameLocal()} class="btn-choice p-2 rounded-lg text-sm">Charger</button>
                <button onClick=${() => exportRunAsJSON(gameState)} class="btn-choice p-2 rounded-lg text-sm">Export JSON</button>
                <button onClick=${() => exportRunAsPDF(gameState)} class="btn-choice p-2 rounded-lg text-sm">Export PDF</button>
                <button onClick=${() => resetToCreation()} class="btn-choice p-2 rounded-lg text-sm col-span-2">Nouvelle Partie</button>
            </div>
        </aside>
    `;
};


// --- ÉCRANS PRINCIPAUX ---

const LoreScreen = () => {
    const loreScene = SCENES.LORE_INTRO;
    const [narrative, tableMarkdown] = loreScene.text.split("TABLE_ECA_START");
    const tableHTML = markdownTableToHtml(tableMarkdown);

    return html`
        <div class="max-w-4xl mx-auto space-y-6">
            <h2 class="text-3xl font-bold text-center text-green-400">DOSSIER MANTLE : LE CYCLE DE PROMÉTHÉE</h2>
            <p class="text-center text-xs uppercase tracking-widest text-gray-500">Confidentiel, Accès Opérateur</p>

            <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <p class="text-base leading-relaxed whitespace-pre-line mb-6">${narrative.trim()}</p>
                
                <h3 class="text-xl font-semibold mb-2 text-white border-b border-gray-700 pb-2">Composition des Escouades ECA (Mantes)</h3>
                <div dangerouslySetInnerHTML=${{ __html: tableHTML }}></div>
            </div>

            <div class="flex justify-center">
                <button onClick=${() => handleChoice('LORE_INTRO', 0)}
                        class="btn-primary p-4 rounded-lg font-bold text-lg hover:ring-2 ring-green-500">
                    Commencer la Création de Personnage
                </button>
            </div>
        </div>
    `;
};

const CreationScreen = () => {
    const [name, setName] = useState('Ghost');
    const [manteType, setManteType] = useState('Phalange');
    const [stats, setStats] = useState(MANTES.Phalange.baseStats);
    const [pool, setPool] = useState(POOL_TOTAL);

    const updateStats = (newStats) => {
        const sum = Object.values(newStats).reduce((acc, val) => acc + val, 0);
        setStats(newStats);
        setPool(sum);
    };

    const handleStatChange = (stat, value) => {
        const numValue = Math.max(PILOT_BASE_MIN, Math.min(18, parseInt(value, 10) || PILOT_BASE_MIN));
        updateStats({ ...stats, [stat]: numValue });
    };

    const applyPreset = (type) => {
        setManteType(type);
        updateStats(MANTES[type].baseStats);
    };
    
    useEffect(() => {
        applyPreset('Phalange');
    }, []);

    const handleStart = () => {
        if (pool === POOL_TOTAL) {
            startGame(manteType, name, stats);
        } else {
            alert(`Veuillez distribuer exactement ${POOL_TOTAL} points. Total actuel : ${pool}.`);
        }
    };

    return html`
         <div class="max-w-3xl mx-auto space-y-6">
            <h2 class="text-2xl font-bold text-center">Création de Personnage</h2>
            <p class="text-center text-xs uppercase tracking-widest text-gray-400">DISTRIBUTION (${POOL_TOTAL} points)</p>
            
            <div class="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p class="text-sm leading-relaxed whitespace-pre-line">${SCENES.CREATION.text}</p>
            </div>
            
            <input type="text" value=${name} onInput=${(e) => setName(e.target.value)} placeholder="Nom de Code"
                   class="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600" />
            
            <h3 class="font-semibold text-lg text-white mt-4 border-b border-gray-700 pb-2">1. Distribution des Points</h3>
            <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 grid grid-cols-2 gap-4">
                 ${Object.keys(PILOT_BASE_STATS).map(stat => html`
                    <div class="flex items-center justify-between p-2">
                        <label class="text-sm font-semibold text-white">${stat.replace(/_/g, ' ')}:</label>
                        <input type="number" value=${stats[stat]} min="${PILOT_BASE_MIN}" max="18"
                               onInput=${(e) => handleStatChange(stat, e.target.value)}
                               class="w-16 p-1 rounded bg-gray-700 text-center" />
                    </div>
                `)}
            </div>
            
             <div class="bg-gray-800 p-4 rounded-lg border ${pool === POOL_TOTAL ? 'border-green-500/50' : 'border-red-500/50'}">
                <h3 class="font-semibold text-lg">Répartition Totale: <span class=${pool === POOL_TOTAL ? 'text-green-400' : 'text-red-400'}>${pool}</span> / ${POOL_TOTAL}</h3>
            </div>

            <h3 class="font-semibold text-lg text-white mt-4 border-b border-gray-700 pb-2">2. Choix du Modèle (Préréglages)</h3>
            <div class="grid grid-cols-2 gap-4">
                ${Object.entries(MANTES).map(([key, mante]) => html`
                    <div class="p-4 bg-gray-800 rounded-lg border ${manteType === key ? 'border-green-500' : 'border-gray-700'} hover:border-green-500 transition cursor-pointer" 
                         onClick=${() => applyPreset(key)}>
                        <h3 class="font-bold text-lg text-green-400">${key}</h3>
                        <p class="text-sm text-gray-400">${mante.description}</p>
                    </div>
                `)}
            </div>
            
            <div class="flex gap-4">
                <button onClick=${handleStart} disabled=${pool !== POOL_TOTAL}
                        class="btn-primary flex-1 p-3 rounded-lg font-bold disabled:opacity-50">
                    Commencer
                </button>
                <button onClick=${() => loadGameLocal()} class="btn-choice flex-1 p-3 rounded-lg font-bold">
                    Charger
                </button>
            </div>
        </div>
    `;
};

const GameScreen = ({ gameState }) => {
    const currentScene = SCENES[gameState.currentScene];
    if (!currentScene) return html`<p>Erreur: Scène non trouvée.</p>`;

    let choices = currentScene[`choices_${gameState.manteType}`] || currentScene.choices || [];

    return html`
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <${StatPanel} gameState=${gameState} />
            <main class="lg:col-span-2">
                <div class="bg-gray-800 p-6 rounded-lg">
                    <p class="text-base leading-relaxed whitespace-pre-line">${currentScene.text}</p>
                </div>

                <div class="mt-6">
                    <h3 class="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-2">Actions</h3>
                    ${choices.map((choice, index) => {
                        return html`
                            <button onClick=${() => handleChoice(gameState.currentScene, index)}
                                    class="btn-choice w-full text-left p-3 rounded-lg mt-3 text-sm">
                                ${choice.text}
                            </button>
                        `;
                    })}
                </div>
            </main>
        </div>
    `;
};

const CombatScreen = ({ gameState }) => {
    const combat = gameState.combatState;
    const enemy = combat ? ENEMY_TYPES[combat.enemyType] : null;
    const specialAttack = MANTE_SPECIAL_ATTACKS[gameState.manteType];
    const canUseSpecial = gameState.manteEnergy >= specialAttack.cost;

    if (!combat || !enemy) return html`<p>Chargement du combat...</p>`;

    return html`
         <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <${StatPanel} gameState=${gameState} />
            <main class="lg:col-span-2">
                 <div class="bg-gray-800 p-6 rounded-lg text-center">
                    <h3 class="text-2xl font-bold text-red-400">${enemy.name}</h3>
                    <p class="text-gray-400 mb-4">${enemy.description}</p>
                    <${ResourceBar} label="PV Ennemi" current=${combat.enemyHP} max=${enemy.maxHP} colorClass="bg-purple-500" />
                    
                    <h4 class="text-xl font-semibold mt-6 mb-3 text-white border-b border-gray-700 pb-2">Actions de Combat</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <button onClick=${() => handleCombatChoice('ATTACK_BASE')} class="btn-primary p-4 rounded-lg font-bold">Attaque Standard</button>
                        <button onClick=${() => handleCombatChoice('ATTACK_SPECIAL')} 
                                class="btn-choice p-4 rounded-lg font-bold bg-yellow-900/40 border-yellow-500 text-yellow-300 disabled:opacity-50"
                                disabled=${!canUseSpecial}>
                            ${specialAttack.name} (${specialAttack.cost} Énergie)
                        </button>
                        <button onClick=${() => handleCombatChoice('DEFEND')} class="btn-choice p-4 rounded-lg">Défense</button>
                        <button onClick=${() => handleCombatChoice('SCAN')} class="btn-choice p-4 rounded-lg">Scan</button>
                    </div>
                </div>
            </main>
        </div>
    `;
};

const GameOverScreen = ({ gameState }) => {
    const finalScene = SCENES[gameState.currentScene] || SCENES.GAME_OVER;
    const color = gameState.gameStatus === "ENDED_SUCCESS" ? "text-green-500" : "text-red-500";

    return html`
        <div class="max-w-xl mx-auto text-center space-y-6 p-8 bg-gray-800 rounded-xl">
            <h2 class="text-3xl font-bold ${color}">MISSION TERMINÉE</h2>
            <p class="text-base leading-relaxed whitespace-pre-line">${finalScene.text}</p>
            <div class="grid grid-cols-2 gap-2 mt-6">
                <button onClick=${() => exportRunAsJSON(gameState)} class="btn-choice p-3 rounded-lg font-bold">Exporter JSON</button>
                <button onClick=${() => exportRunAsPDF(gameState)} class="btn-choice p-3 rounded-lg font-bold">Exporter PDF</button>
            </div>
            <button onClick=${() => resetToCreation()} class="btn-primary w-full p-3 rounded-lg font-bold mt-4">Recommencer</button>
        </div>
    `;
};

const App = ({ gameState }) => {
    if (!gameState || !gameState.currentScene) {
        return html`<p>Chargement...</p>`;
    }
    
    switch (gameState.currentScene) {
        case 'LORE_INTRO':
            return html`<${LoreScreen} />`;
        case 'CREATION':
            return html`<${CreationScreen} />`;
        case 'COMBAT':
            return html`<${CombatScreen} gameState=${gameState} />`;
        default:
            if (gameState.gameStatus !== 'PLAYING') {
                return html`<${GameOverScreen} gameState=${gameState} />`;
            }
            return html`<${GameScreen} gameState=${gameState} />`;
    }
};

// Rendu initial
export function renderApp(state) {
    render(html`<${App} gameState=${state} />`, document.getElementById('game-view'));
}
