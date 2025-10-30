import useGameStore, { SCENES } from "../../store/gameStore.js";
import StatPanel from "../ui/StatPanel.jsx";
import { filterChoicesByRequirements } from "../../utils/gameLogic.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const GameScreen = () => {
  const gameState = useGameStore((state) => state.gameState);
  const handleChoice = useGameStore((state) => state.handleChoice);

  const currentScene = SCENES[gameState.currentScene];

  if (!currentScene) {
    return <p>Erreur: Scène non trouvée.</p>;
  }

  let choices = [];
  if (Array.isArray(currentScene[`choices_${gameState.manteType}`])) {
    choices = currentScene[`choices_${gameState.manteType}`];
  } else if (Array.isArray(currentScene.choices)) {
    choices = currentScene.choices;
  } else if (currentScene.choices && typeof currentScene.choices === "object") {
    if (Array.isArray(currentScene.choices[gameState.manteType])) {
      choices = currentScene.choices[gameState.manteType];
    } else if (Array.isArray(currentScene.choices.all)) {
      choices = currentScene.choices.all;
    } else {
      choices = Object.values(currentScene.choices).reduce((acc, v) => {
        if (Array.isArray(v)) acc.push(...v);
        return acc;
      }, []);
    }
  }

  choices = filterChoicesByRequirements(
    choices,
    gameState.statusFlags,
    gameState.pilotStats
  );

  const sceneText = Array.isArray(currentScene.text)
    ? currentScene.text.join("\n\n")
    : String(currentScene.text || "");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <StatPanel />
      <main className="lg:col-span-2">
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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: (p) => (
                <h1 className="text-2xl font-bold text-white mb-3" {...p} />
              ),
              h2: (p) => (
                <h2 className="text-xl font-semibold text-white mb-2" {...p} />
              ),
              h3: (p) => (
                <h3 className="text-lg font-semibold text-white mb-2" {...p} />
              ),
              p: (p) => (
                <p
                  className="text-base leading-relaxed text-gray-200 mb-3"
                  {...p}
                />
              ),
              strong: (p) => <strong className="text-amber-300" {...p} />,
              em: (p) => <em className="text-gray-300 italic" {...p} />,
              ul: (p) => (
                <ul className="list-disc pl-6 space-y-1 text-gray-200" {...p} />
              ),
              ol: (p) => (
                <ol
                  className="list-decimal pl-6 space-y-1 text-gray-200"
                  {...p}
                />
              ),
              li: (p) => <li className="text-gray-200" {...p} />,
              code: (p) => (
                <code
                  className="bg-gray-700 px-1 py-0.5 rounded text-gray-100"
                  {...p}
                />
              ),
            }}>
            {sceneText}
          </ReactMarkdown>
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
