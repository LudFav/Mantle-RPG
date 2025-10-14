import useGameStore from "../../store/gameStore.js";
import XPBar from "./XPBar.jsx";
import ResourceBar from "./ResourceBar.jsx";
import { exportRunAsJSON, exportRunAsPDF } from "../../utils/export.js";

const StatPanel = () => {
  const gameState = useGameStore((state) => state.gameState);
  const spendStatPoint = useGameStore((state) => state.spendStatPoint);
  const saveGame = useGameStore((state) => state.saveGame);
  const loadGame = useGameStore((state) => state.loadGame);
  const resetToCreation = useGameStore((state) => state.resetToCreation);

  const handleSpendPoint = (stat) => {
    if (gameState.statPoints > 0) {
      spendStatPoint(stat);
    }
  };

  return (
    <aside className="lg:col-span-1 bg-gray-800 p-4 rounded-lg sticky top-4">
      <h2 className="text-xl font-bold mb-3 text-white">
        {gameState.name || "Opérateur"} | Mante {gameState.manteType}
      </h2>

      <XPBar
        current={gameState.xp}
        max={gameState.xpToNextLevel}
        level={gameState.level}
      />

      <ResourceBar
        label="PV Pilote"
        current={gameState.pilotHP}
        max={100}
        colorClass="bg-red-500"
      />

      <ResourceBar
        label="PV Mante"
        current={gameState.manteHP}
        max={gameState.manteMaxHP}
        colorClass="bg-green-500"
      />

      <ResourceBar
        label="Énergie Mante"
        current={gameState.manteEnergy}
        max={gameState.manteMaxEnergy}
        colorClass="bg-blue-500"
      />

      <div className="border-y border-gray-700 py-3 my-3">
        <h3 className="text-md font-semibold mb-2 text-yellow-400">
          Aptitudes Pilote
        </h3>
        {gameState.statPoints > 0 && (
          <div className="bg-green-900/30 border border-green-500 rounded-lg p-2 mb-3 animate-pulse">
            <p className="text-sm text-green-300 font-bold text-center">
              ⭐ {gameState.statPoints} Point
              {gameState.statPoints > 1 ? "s" : ""} à Distribuer ⭐
            </p>
            <p className="text-xs text-green-400 text-center">
              Cliquez sur les boutons + ci-dessous
            </p>
          </div>
        )}
        {Object.entries(gameState.pilotStats).map(([stat, value]) => (
          <div
            key={stat}
            className="flex justify-between items-center text-sm py-1">
            <span>
              {stat.replace(/_/g, " ")}:{" "}
              <span className="font-bold text-white">{value}</span>
            </span>
            {gameState.statPoints > 0 && (
              <button
                onClick={() => handleSpendPoint(stat)}
                className="bg-green-600 hover:bg-green-500 text-white font-bold w-6 h-6 rounded-full text-xs transition-colors">
                +
              </button>
            )}
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
        Journal des Opérations
      </h3>
      <div className="h-40 overflow-y-auto space-y-1 p-2 bg-gray-900 rounded text-xs">
        {[...gameState.log]
          .slice(-10)
          .reverse()
          .map((msg, idx) => (
            <p
              key={idx}
              className={`${
                msg.includes("[EXP]") || msg.includes("[NIVEAU")
                  ? "text-yellow-300 font-semibold"
                  : msg.includes("[STAT]")
                  ? "text-green-400"
                  : msg.includes("[VICTOIRE]")
                  ? "text-green-500 font-bold"
                  : msg.includes("[CRITIQUE]")
                  ? "text-red-400 font-bold"
                  : "text-gray-400"
              }`}>
              {msg}
            </p>
          ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          onClick={saveGame}
          className="btn-primary p-2 rounded-lg text-sm transition-colors">
          Sauvegarde
        </button>
        <button
          onClick={loadGame}
          className="btn-choice p-2 rounded-lg text-sm transition-colors">
          Charger
        </button>
        <button
          onClick={() => exportRunAsJSON(gameState)}
          className="btn-choice p-2 rounded-lg text-sm transition-colors">
          Export JSON
        </button>
        <button
          onClick={() => exportRunAsPDF(gameState)}
          className="btn-choice p-2 rounded-lg text-sm transition-colors">
          Export PDF
        </button>
        <button
          onClick={resetToCreation}
          className="btn-choice p-2 rounded-lg text-sm col-span-2 transition-colors">
          Nouvelle Partie
        </button>
      </div>
    </aside>
  );
};

export default StatPanel;
