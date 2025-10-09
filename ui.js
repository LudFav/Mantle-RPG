import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import htm from 'htm';

import { SCENES } from './data/scenes_index.js';
import { MANTES, ENEMY_TYPES, MANTE_SPECIAL_ATTACKS, POOL_TOTAL, PILOT_BASE_MIN } from './models.js';
import { filterChoicesByRequirements } from './game_logic.js';
import { markdownTableToHtml } from './utils.js';


const html = htm.bind(h);

const StatBar = ({ stat, value, color }) => {
    const checkValue = ['Force', 'Agilité', 'Vitesse'].includes(stat) ? value / 10 : value;
    const max = 20;
    const percentage = Math.min(checkValue, max) / max * 100;
    return html`
        <div class="mb-2">
            <div class="flex justify-between text-sm font-semibold">
                <span>${stat}</span>
                <span>${checkValue} <span class="text-gray-400">(${value})</span></span>
            </div>
            <div class="stat-bar-bg h-2 rounded-full mt-1">
                <div class="${color} h-2 rounded-full" style="width: ${percentage}%;"></div>
            </div>
        </div>
    `;
};

const HPBar = ({ label, currentHP, maxHP, colorClass }) => {
    const percentage = (maxHP > 0) ? (currentHP / maxHP) * 100 : 0;
    const displayHP = Math.max(0, Math.round(currentHP));
    const displayMaxHP = Math.round(maxHP);
    const isCritical = displayHP <= (displayMaxHP * 0.2);
    return html`
        <div class="mb-3">
            <div class="flex justify-between text-sm font-semibold text-white">
                <span>${label} (${displayHP}/${displayMaxHP})</span>
                <span class="${isCritical ? 'text-red-400 font-extrabold animate-pulse' : 'text-green-400'}">${displayHP} PV</span>
            </div>
            <div class="stat-bar-bg h-3 rounded-full mt-1">
                <div class="h-3 rounded-full ${colorClass}" style="width: ${percentage}%;"></div>
            </div>
        </div>
    `;
};

const StatsPanel = ({ gameState }) => {
    const statColors = {
        Force: 'bg-red-500', Agilité: 'bg-blue-500', Vitesse: 'bg-yellow-500',
        Intelligence: 'bg-purple-500', Lucidité: 'bg-cyan-500',
        QI_de_Combat: 'bg-green-500', Synchronisation: 'bg-orange-500'
    };
    return html`
        <aside class="lg:col-span-1 bg-gray-800 p-4 rounded-lg sticky top-0">
            <h2 class="text-xl font-bold mb-3 text-white">${gameState.name || 'Opérateur'} | Mante ${gameState.manteType}</h2>
            <${HPBar} label="PV Pilote" currentHP=${gameState.pilotHP} maxHP=${100} colorClass="bg-red-500" />
            <${HPBar} label="PV Mante" currentHP=${gameState.manteHP} maxHP=${gameState.manteMaxHP} colorClass="bg-green-500" />
            <div class="border-b border-gray-700 pb-3 mb-3">
                <h3 class="text-md font-semibold mb-2 text-yellow-400">Aptitudes</h3>
                ${Object.entries(gameState.effectiveStats).map(([stat, value]) => html`
                    <${StatBar} stat=${stat} value=${value} color=${statColors[stat] || 'bg-gray-500'} />
                `)}
            </div>
            <h3 class="text-lg font-semibold mb-2 text-green-400">Réputation</h3>
            <p class="text-sm">CEL: ${gameState.reputation.CEL} / FEU: ${gameState.reputation.FEU} / Aetheria: ${gameState.reputation.Aetheria}</p>
        </aside>
    `;
};

const LogPanel = ({ log }) => {
    return html`
         <div class="lg:col-span-1 bg-gray-800 p-4 rounded-lg mt-6 lg:mt-0">
            <h3 class="text-lg font-semibold mt-4 mb-2 text-white">Journal des Opérations</h3>
            <div id="log-display" class="h-40 overflow-y-auto space-y-1 p-2 bg-gray-900 rounded text-xs">
                ${log.slice(-10).map(msg => html`<p class="text-xs text-gray-400">${msg}</p>`).reverse()}
            </div>
             <div class="grid grid-cols-2 gap-2 mt-4">
                <button onClick=${window.game.saveGameLocal} class="btn-primary p-2 rounded-lg text-sm">Sauvegarde Locale</button>
                <button onClick=${window.game.loadGameLocal} class="btn-choice p-2 rounded-lg text-sm">Charger Local</button>
                <button onClick=${window.game.exportRunAsJSON} class="btn-choice p-2 rounded-lg text-sm">Exporter JSON</button>
                <button onClick=${window.game.exportRunAsPDF} class="btn-choice p-2 rounded-lg text-sm">Exporter PDF</button>
                <button onClick=${window.game.resetToCreation} class="btn-choice p-2 rounded-lg text-sm col-span-2">Nouvelle Partie</button>
            </div>
        </div>
    `;
};

// --- Ecrans de jeu (Screens) ---

const LoreIntroScreen = () => {
    const loreScene = SCENES['LORE_INTRO'];
    const [narrative, tableMarkdown] = (loreScene.text || '').split("TABLE_ECA_START");
    const tableHTML = { __html: markdownTableToHtml(tableMarkdown) };

    return html`
        <div class="max-w-4xl mx-auto space-y-6">
            <h2 class="text-3xl font-bold text-center text-green-400">DOSSIER MANTLE : LE CYCLE DE PROMÉTHÉE</h2>
            <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <p class="text-base leading-relaxed whitespace-pre-line mb-6">${narrative ? narrative.trim() : ''}</p>
                <h3 class="text-xl font-semibold mb-2 text-white border-b border-gray-700 pb-2">Composition des Escouades</h3>
                <div dangerouslySetInnerHTML=${tableHTML}></div>
            </div>
            <div class="flex justify-center">
                <button onClick=${() => window.game.handleChoice('LORE_INTRO', 0)}
                        class="btn-primary p-4 rounded-lg font-bold text-lg">
                    Commencer la Création
                </button>
            </div>
        </div>
    `;
};

const CreationScreen = () => {
    const [stats, setStats] = useState(MANTES.Phalange.baseStats);
    const [name, setName] = useState('');
    const [manteType, setManteType] = useState('Phalange');
    const [remainingPoints, setRemainingPoints] = useState(0);

    useEffect(() => {
        const totalPoints = Object.values(stats).reduce((sum, val) => sum + val, 0);
        setRemainingPoints(POOL_TOTAL - totalPoints);
    }, [stats]);

    const handleStatChange = (stat, value) => {
        const numValue = Math.max(PILOT_BASE_MIN, Math.min(18, parseInt(value, 10) || PILOT_BASE_MIN));
        setStats(prev => ({ ...prev, [stat]: numValue }));
    };

    const applyRecommended = (type) => {
        setManteType(type);
        setStats(MANTES[type].baseStats);
    };

    return html`
        <div class="max-w-3xl mx-auto space-y-6">
            <h2 class="text-2xl font-bold text-center">Création de Personnage</h2>
            <div class="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p class="text-sm leading-relaxed whitespace-pre-line">${SCENES.CREATION.text}</p>
            </div>
            
            <input type="text" value=${name} onInput=${(e) => setName(e.target.value)} placeholder="Nom de Code"
                   class="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-green-500" />
            
            <h3 class="font-semibold text-lg text-white mt-4 border-b border-gray-700 pb-2">1. Distribution des Points</h3>
            <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 grid grid-cols-2 gap-4">
                ${Object.keys(MANTES.Phalange.baseStats).map(stat => html`
                    <div class="flex items-center justify-between p-2">
                        <label class="text-sm font-semibold text-white">${stat.replace(/_/g, ' ')}:</label>
                        <input type="number" value=${stats[stat]} onInput=${(e) => handleStatChange(stat, e.target.value)}
                               class="w-16 p-1 rounded bg-gray-700 text-center" />
                    </div>
                `)}
            </div>
            
            <div class="bg-gray-800 p-4 rounded-lg border ${remainingPoints === 0 ? 'border-green-500/50' : 'border-red-500/50'}">
                <p class="text-sm text-gray-300">Points à distribuer : <span class="font-bold ${remainingPoints === 0 ? 'text-green-400' : 'text-red-400'}">${remainingPoints}</span></p>
            </div>

            <h3 class="font-semibold text-lg text-white mt-4 border-b border-gray-700 pb-2">2. Choix du Modèle (Recommandations)</h3>
            <div class="grid grid-cols-2 gap-4">
                ${Object.entries(MANTES).map(([key, mante]) => html`
                    <div class="p-4 bg-gray-800 rounded-lg border ${manteType === key ? 'border-green-500' : 'border-gray-700'} hover:border-green-500 transition cursor-pointer" 
                         onClick=${() => applyRecommended(key)}>
                        <h3 class="font-bold text-lg text-green-400">${key}</h3>
                        <p class="text-sm text-gray-400">${mante.description}</p>
                    </div>
                `)}
            </div>
            
            <div class="flex gap-4">
                <button onClick=${() => window.game.startGame(manteType, name, stats)}
                        class="btn-primary flex-1 p-3 rounded-lg font-bold disabled:opacity-50"
                        disabled=${remainingPoints !== 0 || !name}>
                    Commencer la Campagne
                </button>
                <button onClick=${window.game.loadGameLocal} class="btn-choice flex-1 p-3 rounded-lg font-bold">
                    Charger la Partie
                </button>
            </div>
        </div>
    `;
};

const GameScreen = ({ gameState }) => {
    const currentScene = SCENES[gameState.currentScene];
    if (!currentScene) return html`<p>Chargement...</p>`;

    let sceneChoices = currentScene[`choices_${gameState.manteType}`] || currentScene.choices;
    const availableChoices = filterChoicesByRequirements(sceneChoices);

    return html`
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <${StatsPanel} gameState=${gameState} />
            <main class="lg:col-span-2">
                <div class="bg-gray-800 p-6 rounded-lg">
                    <p class="text-base leading-relaxed whitespace-pre-line">${currentScene.text}</p>
                </div>
                <div class="mt-6">
                    <h3 class="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-2">Actions</h3>
                    ${availableChoices.map(choice => {
        const originalIndex = sceneChoices.findIndex(c => c.text === choice.text);
        return html`
                            <button onClick=${() => window.game.handleChoice(gameState.currentScene, originalIndex)}
                                    disabled=${!!choice.disabledReason}
                                    class="btn-choice w-full text-left p-3 rounded-lg mt-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                ${choice.text} ${choice.disabledReason || ''}
                            </button>
                        `;
    })}
                </div>
                 <${LogPanel} log=${gameState.log} />
            </main>
        </div>
    `;
};

const CombatScreen = ({ gameState }) => {
    const combat = gameState.combatState;
    if (!combat) return null;

    const enemy = ENEMY_TYPES[combat.enemyType];
    const manteAttack = MANTE_SPECIAL_ATTACKS[gameState.manteType];

    return html`
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <aside class="lg:col-span-1 bg-gray-800 p-4 rounded-lg">
                <h2 class="text-xl font-bold mb-3 text-white">COMBAT</h2>
                <${HPBar} label="PV Pilote" currentHP=${gameState.pilotHP} maxHP=${100} colorClass="bg-red-500" />
                <${HPBar} label="PV Mante" currentHP=${gameState.manteHP} maxHP=${gameState.manteMaxHP} colorClass="bg-green-500" />
                 <${LogPanel} log=${gameState.log} />
            </aside>
            <main class="lg:col-span-2">
                <div class="bg-gray-800 p-6 rounded-lg text-center">
                    <h3 class="text-2xl font-bold text-red-400">${enemy.name}</h3>
                    <p class="text-gray-400 mb-4">${enemy.description}</p>
                    <${HPBar} label="PV ENNEMI" currentHP=${combat.enemyHP} maxHP=${combat.enemyMaxHP} colorClass="bg-purple-500" />
                    
                    <h4 class="text-xl font-semibold mt-6 mb-3 text-white">Actions</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <button onClick=${() => window.game.handleCombatChoice('ATTACK_BASE')} class="btn-primary p-4 rounded-lg font-bold">Attaque Standard</button>
                        <button onClick=${() => window.game.handleCombatChoice('ATTACK_SPECIAL')} class="btn-choice p-4 rounded-lg font-bold">${manteAttack.name}</button>
                        <button onClick=${() => window.game.handleCombatChoice('DEFEND')} class="btn-choice p-4 rounded-lg">Défense</button>
                        <button onClick=${() => window.game.handleCombatChoice('SCAN')} class="btn-choice p-4 rounded-lg">Scan</button>
                    </div>
                </div>
            </main>
        </div>
    `;
};

const GameOverScreen = ({ gameState }) => {
    const finalScene = SCENES[gameState.currentScene];
    let endingText = finalScene ? finalScene.text : "La mission est terminée.";
    const isSuccess = gameState.gameStatus === "ENDED_SUCCESS";

    return html`
        <div class="max-w-xl mx-auto text-center space-y-6 p-8 bg-gray-800 rounded-xl">
            <h2 class="text-3xl font-bold ${isSuccess ? 'text-green-500' : 'text-red-500'}">MISSION TERMINÉE</h2>
            <p class="text-base leading-relaxed whitespace-pre-line">${endingText}</p>
            <div class="flex justify-center mt-6">
                 <button onClick=${window.game.resetToCreation} class="btn-primary w-full p-3 rounded-lg font-bold mt-4">Recommencer</button>
            </div>
        </div>
    `;
};


// --- Composant Principal de l'Application ---

const App = ({ gameState }) => {
    let content;
    const scene = gameState.currentScene;

    if (scene === 'LORE_INTRO') {
        content = html`<${LoreIntroScreen} />`;
    } else if (scene === 'CREATION') {
        content = html`<${CreationScreen} />`;
    } else if (scene.startsWith('ENDING') || scene === 'GAME_OVER') {
        content = html`<${GameOverScreen} gameState=${gameState} />`;
    } else if (scene === 'COMBAT') {
        content = html`<${CombatScreen} gameState=${gameState} />`;
    } else if (gameState.manteType) { // Assure que le jeu a commencé
        content = html`<${GameScreen} gameState=${gameState} />`;
    } else {
        // Fallback si l'état est invalide, renvoie à la création
        content = html`<${LoreIntroScreen} />`;
    }

    return html`
        <div class="p-4 sm:p-8 flex justify-center items-start min-h-screen">
            <div class="w-full max-w-4xl container-bg rounded-xl p-6 sm:p-8">
                <header class="text-center mb-6 border-b border-gray-700 pb-4">
                    <h1 class="text-3xl font-bold text-green-400">MANTLE : LE CYCLE DE PROMÉTHÉE</h1>
                </header>
                <div id="game-view">
                    ${content}
                </div>
            </div>
        </div>
    `;
};

// --- Fonction de Rendu ---

export function renderUI(gameState) {
    const appRoot = document.getElementById('app');
    render(html`<${App} gameState=${gameState} />`, appRoot);
}
