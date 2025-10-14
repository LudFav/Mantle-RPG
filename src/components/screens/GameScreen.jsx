import useGameStore, { SCENES } from "../../store/gameStore.js";
import StatPanel from "../ui/StatPanel.jsx";

const GameScreen = () => {
  const gameState = useGameStore((state) => state.gameState);
  const handleChoice = useGameStore((state) => state.handleChoice);

  const currentScene = SCENES[gameState.currentScene];

  if (!currentScene) {
    return <p>Erreur: Scène non trouvée.</p>;
  }

  let choices =
    currentScene[`choices_${gameState.manteType}`] ||
    currentScene.choices ||
    [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <StatPanel />
      <main className="lg:col-span-2">
        {/* Notification de points de stat disponibles */}
        {gameState.statPoints > 0 && (
          <div className="bg-green-900/40 border-2 border-green-500 rounded-lg p-3 mb-4 animate-pulse">
            <p className="text-center font-bold text-green-300">
              🎖️ Niveau {gameState.level} atteint ! {gameState.statPoints} point
              {gameState.statPoints > 1 ? "s" : ""} de stat disponible
              {gameState.statPoints > 1 ? "s" : ""} !
            </p>
            <p className="text-center text-xs text-green-400">
              Utilisez les boutons + dans le panneau latéral pour améliorer vos
              aptitudes
            </p>
          </div>
        )}

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <p className="text-base leading-relaxed whitespace-pre-line">
            {currentScene.text}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-2">
            Actions
          </h3>
          {choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => handleChoice(gameState.currentScene, index)}
              className="btn-choice w-full text-left p-3 rounded-lg mt-3 text-sm hover:bg-gray-700 transition-colors">
              {choice.text}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GameScreen;
