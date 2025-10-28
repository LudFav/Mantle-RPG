import { useState, useEffect, useCallback } from "react";
import useGameStore, { SCENES } from "../../store/gameStore.js";
import {
  MANTES,
  POOL_TOTAL,
  PILOT_BASE_STATS,
  PILOT_BASE_MIN,
} from "../../constants/models.js";

const CreationScreen = () => {
  const startGame = useGameStore((state) => state.startGame);
  const loadGame = useGameStore((state) => state.loadGame);

  const [name, setName] = useState("");
  const [manteType, setManteType] = useState("Phalange");
  const [stats, setStats] = useState(MANTES.Phalange.baseStats);
  const [pool, setPool] = useState(POOL_TOTAL);

  const updateStats = useCallback((newStats) => {
    const sum = Object.values(newStats).reduce((acc, val) => acc + val, 0);
    setStats(newStats);
    setPool(sum);
  }, []);

  const handleStatChange = (stat, value) => {
    const restrictions = MANTES[manteType].statRestrictions[stat];
    const minValue = restrictions ? restrictions.min : PILOT_BASE_MIN;
    const maxValue = restrictions ? restrictions.max : 18;

    const numValue = Math.max(
      minValue,
      Math.min(maxValue, parseInt(value, 10) || minValue)
    );
    updateStats({ ...stats, [stat]: numValue });
  };

  const applyPreset = useCallback(
    (type) => {
      setManteType(type);
      // Appliquer les stats par défaut et s'assurer qu'elles respectent les restrictions
      const newStats = { ...MANTES[type].baseStats };
      const restrictions = MANTES[type].statRestrictions;

      // Ajuster chaque stat selon les restrictions
      Object.keys(newStats).forEach((stat) => {
        if (restrictions[stat]) {
          newStats[stat] = Math.max(
            restrictions[stat].min,
            Math.min(restrictions[stat].max, newStats[stat])
          );
        }
      });

      updateStats(newStats);
    },
    [updateStats]
  );

  useEffect(() => {
    applyPreset("Phalange");
  }, [applyPreset]);

  const handleStart = () => {
    if (pool === POOL_TOTAL && name.trim() !== "") {
      startGame(manteType, name, stats);
    } else {
      let message = "";
      if (name.trim() === "") {
        message = "Veuillez entrer un nom.";
      } else {
        message = `Veuillez distribuer exactement ${POOL_TOTAL} points. Total actuel : ${pool}.`;
      }
      alert(message);
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Image de fond fixe qui couvre tout l'écran */}
      <div className="fixed inset-0 w-screen h-screen bg-cover bg-center bg-no-repeat bg-[url(/assets/img/fond_hangar.png)]"></div>

      {/* Overlay semi-transparent pour améliorer la lisibilité */}
      <div className="fixed inset-0 w-screen h-screen bg-black/40"></div>

      {/* Contenu principal */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-6 p-0">
        {/* En-tête */}
        <header className="text-center border-b-2 border-green-500/30 pb-6">
          <h2 className="text-2xl font-bold text-center">
            Création de Personnage
          </h2>
          <p className="text-center text-xs uppercase tracking-widest text-gray-400">
            DISTRIBUTION ({POOL_TOTAL} points)
          </p>
        </header>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {SCENES.CREATION.text}
          </p>
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de Code"
          className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none transition-colors"
        />
        <h3 className="font-semibold text-lg text-white mt-4 border-b border-green-500/30 pb-2">
          1. Choix du Modèle (Préréglages)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(MANTES).map(([key, mante]) => (
            <div
              key={key}
              className={`p-4 bg-gray-800 rounded-lg border ${
                manteType === key ? "border-green-500" : "border-gray-700"
              } hover:border-green-500 transition cursor-pointer`}
              onClick={() => applyPreset(key)}>
              <h3 className="font-bold text-lg text-green-400">{key}</h3>
              <p className="text-sm text-gray-400">{mante.description}</p>
            </div>
          ))}
        </div>
        <h3 className="font-semibold text-lg text-white mt-4 border-b border-green-500/30 pb-2">
          2. Distribution des Points
        </h3>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 grid grid-cols-2 gap-4 opacity-75">
          {Object.keys(PILOT_BASE_STATS).map((stat) => {
            const restrictions = MANTES[manteType].statRestrictions[stat];
            const minValue = restrictions ? restrictions.min : PILOT_BASE_MIN;
            const maxValue = restrictions ? restrictions.max : 18;

            return (
              <div key={stat} className="flex items-center justify-between p-2">
                <label className="text-sm font-semibold text-white">
                  {stat.replace(/_/g, " ")}:
                </label>
                <input
                  type="number"
                  value={stats[stat]}
                  min={minValue}
                  max={maxValue}
                  onChange={(e) => handleStatChange(stat, e.target.value)}
                  className="w-16 p-1 rounded bg-gray-700 text-center border border-gray-600 focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>
            );
          })}
        </div>

        <div
          className={`bg-gray-800 p-4 rounded-lg border ${
            pool === POOL_TOTAL ? "border-green-500/50" : "border-red-500/50"
          } transition-colors`}>
          <h3 className="font-semibold text-lg">
            Répartition Totale:{" "}
            <span
              className={
                pool === POOL_TOTAL ? "text-green-400" : "text-red-400"
              }>
              {pool}
            </span>{" "}
            / {POOL_TOTAL}
          </h3>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleStart}
            disabled={pool !== POOL_TOTAL}
            className="btn-primary flex-1 p-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            Commencer
          </button>
          <button
            onClick={loadGame}
            className="btn-choice flex-1 p-3 rounded-lg font-bold transition-all">
            Charger
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreationScreen;
