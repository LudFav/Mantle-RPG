import useGameStore, { SCENES } from "../../store/gameStore.js";
import { exportRunAsJSON, exportRunAsPDF } from "../../utils/export.js";

const GameOverScreen = () => {
  const gameState = useGameStore((state) => state.gameState);
  const resetToCreation = useGameStore((state) => state.resetToCreation);

  const finalScene = SCENES[gameState.currentScene] || SCENES.GAME_OVER;
  const isSuccess = gameState.gameStatus === "ENDED_SUCCESS";

  // Déterminer la voie choisie selon la scène finale
  const determineVoie = () => {
    const sceneKey = gameState.currentScene;

    if (sceneKey.includes("CEL")) {
      return "Voie de la Confédération";
    } else if (sceneKey.includes("FEU")) {
      return "Voie de la Fédération";
    } else if (
      sceneKey.includes("AETHERIA") ||
      sceneKey.includes("INDEPENDANT")
    ) {
      return "Voie Indépendante";
    } else if (sceneKey.includes("VOLKOV")) {
      return "Voie de la Synthèse";
    } else if (sceneKey === "GAME_OVER") {
      return "Voie Interrompue";
    }

    // Par défaut, essayer d'extraire des informations du texte de la scène
    const text = finalScene.text || "";
    if (text.toLowerCase().includes("confédération"))
      return "Voie de la Confédération";
    if (text.toLowerCase().includes("fédération"))
      return "Voie de la Fédération";
    if (text.toLowerCase().includes("aetheria")) return "Voie Indépendante";
    if (text.toLowerCase().includes("indépendant")) return "Voie Indépendante";

    return "Voie du Destin";
  };

  const voie = determineVoie();
  const titleColor = isSuccess ? "text-green-400" : "text-red-400";
  const accentColor = isSuccess ? "border-green-500/50" : "border-red-500/50";

  return (
    <div className="max-w-3xl mx-auto text-center space-y-6 p-8">
      {/* En-tête dramatique */}
      <div
        className={`bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-xl border-2 ${accentColor} shadow-2xl`}>
        <div className="mb-4">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            Cycle de Prométhée - Transmission Finale
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
            Fin du Cycle de Prométhée
          </h1>
          <h2 className={`text-2xl md:text-3xl font-semibold ${titleColor}`}>
            {voie}
          </h2>
        </div>

        {/* Séparateur décoratif */}
        <div className="flex items-center justify-center my-6">
          <div className="h-px bg-gray-600 flex-1"></div>
          <div className="px-4">
            <div
              className={`w-3 h-3 rounded-full ${
                isSuccess ? "bg-green-500" : "bg-red-500"
              }`}></div>
          </div>
          <div className="h-px bg-gray-600 flex-1"></div>
        </div>

        {/* Informations du pilote */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-left">
              <span className="text-gray-500">Opérateur:</span>{" "}
              <span className="text-white font-semibold">
                {gameState.name || "Inconnu"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-gray-500">Mante:</span>{" "}
              <span className="text-green-400 font-semibold">
                {gameState.manteType}
              </span>
            </div>
            <div className="text-left">
              <span className="text-gray-500">Niveau:</span>{" "}
              <span className="text-yellow-400 font-semibold">
                {gameState.level}
              </span>
            </div>
            <div className="text-right">
              <span className="text-gray-500">Statut:</span>{" "}
              <span
                className={`font-semibold ${
                  isSuccess ? "text-green-400" : "text-red-400"
                }`}>
                {isSuccess ? "Mission Accomplie" : "Mission Échouée"}
              </span>
            </div>
          </div>
        </div>

        {/* Texte de la scène finale */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <p className="text-base leading-relaxed whitespace-pre-line text-gray-300">
            {finalScene.text}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Rapport de Mission
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => exportRunAsJSON(gameState)}
            className="btn-choice p-3 rounded-lg font-bold transition-all hover:scale-105">
            📄 Exporter JSON
          </button>
          <button
            onClick={() => exportRunAsPDF(gameState)}
            className="btn-choice p-3 rounded-lg font-bold transition-all hover:scale-105">
            📑 Exporter PDF
          </button>
        </div>
        <button
          onClick={resetToCreation}
          className="btn-primary w-full p-4 rounded-lg font-bold mt-4 transition-all hover:scale-105 text-lg">
          ↻ Nouveau Cycle
        </button>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-600 italic">
        "Le cycle se termine, mais Prométhée veille toujours..."
      </div>
    </div>
  );
};

export default GameOverScreen;
