import useGameStore from "../../store/gameStore.js";
import { ENEMY_TYPES, MANTE_SPECIAL_ATTACKS } from "../../constants/models.js";
import {
  COMBAT_ACTIONS,
  isActionUnlocked,
} from "../../constants/combatActions.js";
import StatPanel from "../ui/StatPanel.jsx";
import ResourceBar from "../ui/ResourceBar.jsx";

const CombatScreen = () => {
  const gameState = useGameStore((state) => state.gameState);
  const handleCombatChoice = useGameStore((state) => state.handleCombatChoice);

  const combat = gameState.combatState;
  const enemy = combat ? ENEMY_TYPES[combat.enemyType] : null;
  const specialAttack = MANTE_SPECIAL_ATTACKS[gameState.manteType];
  const playerLevel = gameState.level;

  // Fonction helper pour vérifier si une action est utilisable
  const canUseAction = (actionKey, energyCost) => {
    const unlocked = isActionUnlocked(actionKey, playerLevel);
    const hasEnergy = gameState.manteEnergy >= energyCost;
    return { unlocked, hasEnergy, canUse: unlocked && hasEnergy };
  };

  if (!combat || !enemy) {
    return <p>Chargement du combat...</p>;
  }

  // Filtrer tous les messages de combat et garder les 12 derniers
  const combatLog = gameState.log
    .filter(
      (msg) =>
        msg.includes("[ATTAQUE]") ||
        msg.includes("[ENNEMI]") ||
        msg.includes("[DEFENSE]") ||
        msg.includes("[ÉVASION]") ||
        msg.includes("[SURCHARGE]") ||
        msg.includes("[RÉPARATION]") ||
        msg.includes("[CONTRE]") ||
        msg.includes("[BOUCLIER]") ||
        msg.includes("[DRAIN]") ||
        msg.includes("[ULTIME]") ||
        msg.includes("[SCAN]") ||
        msg.includes("[ÉNERGIE]") ||
        msg.includes("[VICTOIRE]") ||
        msg.includes("[CRITIQUE]") ||
        msg.includes("[COMBAT]") ||
        msg.includes("[ALERTE]") ||
        msg.includes("[EXP]") ||
        msg.includes("[NIVEAU")
    )
    .slice(-12);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <StatPanel />
      <main className="lg:col-span-2">
        <div className="bg-gray-800 p-6 rounded-lg text-center border border-gray-700">
          <h3 className="text-2xl font-bold text-red-400">{enemy.name}</h3>
          <p className="text-gray-400 mb-4">{enemy.description}</p>
          <ResourceBar
            label="PV Ennemi"
            current={combat.enemyHP}
            max={enemy.maxHP}
            colorClass="bg-purple-500"
          />

          <h4 className="text-xl font-semibold mt-6 mb-3 text-white border-b border-gray-700 pb-2">
            Actions de Combat
          </h4>

          {/* Attaques */}
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-green-400 mb-2">
              ⚔️ Attaques
            </h5>
            <div className="grid grid-cols-2 gap-2">
              {/* Attaque Standard - Toujours disponible */}
              <button
                onClick={() => handleCombatChoice("ATTACK_BASE")}
                className="btn-primary p-3 rounded-lg font-bold transition-all hover:scale-105 text-sm">
                Attaque Standard
                <span className="block text-xs opacity-70">
                  Toujours disponible
                </span>
              </button>

              {/* Attaque Spéciale - Toujours disponible */}
              <button
                onClick={() => handleCombatChoice("ATTACK_SPECIAL")}
                className="btn-choice p-3 rounded-lg font-bold bg-yellow-900/40 border-yellow-500 text-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 disabled:hover:scale-100 text-sm"
                disabled={gameState.manteEnergy < specialAttack.cost}>
                💫 {specialAttack.name}
                <span className="block text-xs">
                  ({specialAttack.cost} Énergie)
                </span>
              </button>

              {/* Frappe Précise - Niveau 2 */}
              {canUseAction("ATTACK_PRECISE", 5).unlocked ? (
                <button
                  onClick={() => handleCombatChoice("ATTACK_PRECISE")}
                  className="btn-choice p-3 rounded-lg font-bold transition-all hover:scale-105 text-sm disabled:opacity-50"
                  disabled={!canUseAction("ATTACK_PRECISE", 5).hasEnergy}>
                  🎯 Frappe Précise
                  <span className="block text-xs">(+3 Toucher, 5 Énergie)</span>
                </button>
              ) : (
                <div className="p-3 rounded-lg text-sm bg-gray-900/50 border border-gray-700 text-gray-600 text-center">
                  <div className="font-bold">🔒 Frappe Précise</div>
                  <span className="block text-xs">Niveau 2 requis</span>
                </div>
              )}

              {/* Frappe Lourde - Niveau 2 */}
              {canUseAction("ATTACK_HEAVY", 10).unlocked ? (
                <button
                  onClick={() => handleCombatChoice("ATTACK_HEAVY")}
                  className="btn-choice p-3 rounded-lg font-bold transition-all hover:scale-105 text-sm disabled:opacity-50"
                  disabled={!canUseAction("ATTACK_HEAVY", 10).hasEnergy}>
                  🔨 Frappe Lourde
                  <span className="block text-xs">
                    (+50% Dégâts, 10 Énergie)
                  </span>
                </button>
              ) : (
                <div className="p-3 rounded-lg text-sm bg-gray-900/50 border border-gray-700 text-gray-600 text-center">
                  <div className="font-bold">🔒 Frappe Lourde</div>
                  <span className="block text-xs">Niveau 2 requis</span>
                </div>
              )}

              {/* Salve Rapide - Niveau 3 */}
              {canUseAction("ATTACK_BURST", 15).unlocked ? (
                <button
                  onClick={() => handleCombatChoice("ATTACK_BURST")}
                  className="btn-choice p-3 rounded-lg font-bold transition-all hover:scale-105 text-sm disabled:opacity-50"
                  disabled={!canUseAction("ATTACK_BURST", 15).hasEnergy}>
                  🔫 Salve Rapide
                  <span className="block text-xs">(3 tirs, 15 Énergie)</span>
                </button>
              ) : (
                <div className="p-3 rounded-lg text-sm bg-gray-900/50 border border-gray-700 text-gray-600 text-center">
                  <div className="font-bold">🔒 Salve Rapide</div>
                  <span className="block text-xs">Niveau 3 requis</span>
                </div>
              )}

              {/* Exécution - Niveau 4 */}
              {canUseAction("ATTACK_EXECUTE", 25).unlocked ? (
                <button
                  onClick={() => handleCombatChoice("ATTACK_EXECUTE")}
                  className="btn-choice p-3 rounded-lg font-bold bg-red-900/40 border-red-500 text-red-300 transition-all hover:scale-105 text-sm disabled:opacity-50"
                  disabled={!canUseAction("ATTACK_EXECUTE", 25).hasEnergy}>
                  💀 Exécution
                  <span className="block text-xs">
                    (x3 si ennemi &lt;30%, 25 Énergie)
                  </span>
                </button>
              ) : (
                <div className="p-3 rounded-lg text-sm bg-gray-900/50 border border-gray-700 text-gray-600 text-center">
                  <div className="font-bold">🔒 Exécution</div>
                  <span className="block text-xs">Niveau 4 requis</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions Tactiques */}
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-blue-400 mb-2">
              🛡️ Actions Tactiques
            </h5>
            <div className="grid grid-cols-2 gap-2">
              {/* Défense - Toujours disponible */}
              <button
                onClick={() => handleCombatChoice("DEFEND")}
                className="btn-choice p-3 rounded-lg transition-all hover:scale-105 text-sm">
                🛡️ Défense
                <span className="block text-xs">(+5 Défense, 1 tour)</span>
              </button>

              {/* Scan - Toujours disponible */}
              <button
                onClick={() => handleCombatChoice("SCAN")}
                className="btn-choice p-3 rounded-lg transition-all hover:scale-105 text-sm">
                📡 Scan
                <span className="block text-xs">(Info ennemi)</span>
              </button>

              {/* Évasion - Niveau 2 */}
              {canUseAction("EVADE", 10).unlocked ? (
                <button
                  onClick={() => handleCombatChoice("EVADE")}
                  className="btn-choice p-3 rounded-lg transition-all hover:scale-105 text-sm disabled:opacity-50"
                  disabled={!canUseAction("EVADE", 10).hasEnergy}>
                  💨 Évasion
                  <span className="block text-xs">
                    (+3 Esquive, 10 Énergie)
                  </span>
                </button>
              ) : (
                <div className="p-3 rounded-lg text-sm bg-gray-900/50 border border-gray-700 text-gray-600 text-center">
                  <div className="font-bold">🔒 Évasion</div>
                  <span className="block text-xs">Niveau 2 requis</span>
                </div>
              )}

              {/* Contre-Attaque - Niveau 3 */}
              {canUseAction("COUNTER", 12).unlocked ? (
                <button
                  onClick={() => handleCombatChoice("COUNTER")}
                  className="btn-choice p-3 rounded-lg transition-all hover:scale-105 text-sm disabled:opacity-50"
                  disabled={!canUseAction("COUNTER", 12).hasEnergy}>
                  🔄 Contre-Attaque
                  <span className="block text-xs">
                    (Riposte auto, 12 Énergie)
                  </span>
                </button>
              ) : (
                <div className="p-3 rounded-lg text-sm bg-gray-900/50 border border-gray-700 text-gray-600 text-center">
                  <div className="font-bold">🔒 Contre-Attaque</div>
                  <span className="block text-xs">Niveau 3 requis</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions Spéciales */}
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-purple-400 mb-2">
              ⚡ Actions Spéciales
            </h5>
            <div className="grid grid-cols-2 gap-2">
              {/* Surcharge - Niveau 2 */}
              {canUseAction("OVERCHARGE", 20).unlocked ? (
                <button
                  onClick={() => handleCombatChoice("OVERCHARGE")}
                  className="btn-choice p-3 rounded-lg font-bold bg-purple-900/40 border-purple-500 text-purple-300 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  disabled={!canUseAction("OVERCHARGE", 20).hasEnergy}>
                  ⚡ Surcharge
                  <span className="block text-xs">
                    (+50% Dégâts, 2 tours, 20 Énergie)
                  </span>
                </button>
              ) : (
                <div className="p-3 rounded-lg text-sm bg-gray-900/50 border border-gray-700 text-gray-600 text-center">
                  <div className="font-bold">🔒 Surcharge</div>
                  <span className="block text-xs">Niveau 2 requis</span>
                </div>
              )}

              {/* Réparation - Niveau 2 */}
              {canUseAction("REPAIR", 15).unlocked ? (
                <button
                  onClick={() => handleCombatChoice("REPAIR")}
                  className="btn-choice p-3 rounded-lg font-bold bg-green-900/40 border-green-500 text-green-300 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  disabled={!canUseAction("REPAIR", 15).hasEnergy}>
                  🔧 Réparation
                  <span className="block text-xs">
                    (Soigne Mante, 15 Énergie)
                  </span>
                </button>
              ) : (
                <div className="p-3 rounded-lg text-sm bg-gray-900/50 border border-gray-700 text-gray-600 text-center">
                  <div className="font-bold">🔒 Réparation</div>
                  <span className="block text-xs">Niveau 2 requis</span>
                </div>
              )}

              {/* Bouclier d'Urgence - Niveau 3 */}
              {canUseAction("SHIELD_REGENERATE", 30).unlocked ? (
                <button
                  onClick={() => handleCombatChoice("SHIELD_REGENERATE")}
                  className="btn-choice p-3 rounded-lg font-bold bg-blue-900/40 border-blue-500 text-blue-300 transition-all hover:scale-105 disabled:opacity-50 text-sm"
                  disabled={!canUseAction("SHIELD_REGENERATE", 30).hasEnergy}>
                  🔰 Bouclier
                  <span className="block text-xs">
                    (50 PV absorbés, 30 Énergie)
                  </span>
                </button>
              ) : (
                <div className="p-3 rounded-lg text-sm bg-gray-900/50 border border-gray-700 text-gray-600 text-center">
                  <div className="font-bold">🔒 Bouclier</div>
                  <span className="block text-xs">Niveau 3 requis</span>
                </div>
              )}

              {/* Drain Énergétique - Niveau 4 */}
              {canUseAction("ENERGY_DRAIN", 10).unlocked ? (
                <button
                  onClick={() => handleCombatChoice("ENERGY_DRAIN")}
                  className="btn-choice p-3 rounded-lg font-bold bg-cyan-900/40 border-cyan-500 text-cyan-300 transition-all hover:scale-105 disabled:opacity-50 text-sm"
                  disabled={!canUseAction("ENERGY_DRAIN", 10).hasEnergy}>
                  🌀 Drain
                  <span className="block text-xs">
                    (Vol d'énergie, 10 Énergie)
                  </span>
                </button>
              ) : (
                <div className="p-3 rounded-lg text-sm bg-gray-900/50 border border-gray-700 text-gray-600 text-center">
                  <div className="font-bold">🔒 Drain</div>
                  <span className="block text-xs">Niveau 4 requis</span>
                </div>
              )}
            </div>
          </div>

          {/* Ultime - Niveau 5 */}
          {canUseAction("SYNCHRONIZATION_ULTIMATE", 50).unlocked && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-yellow-400 mb-2">
                ✨ Technique Ultime
              </h5>
              <button
                onClick={() => handleCombatChoice("SYNCHRONIZATION_ULTIMATE")}
                className="btn-choice w-full p-4 rounded-lg font-bold bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500 text-yellow-200 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  !canUseAction("SYNCHRONIZATION_ULTIMATE", 50).hasEnergy
                }>
                ✨ SYNCHRONISATION ULTIME
                <span className="block text-xs mt-1">
                  (x5 Dégâts dévastateurs, Consomme TOUTE l'énergie - 50 min)
                </span>
              </button>
            </div>
          )}

          {/* Journal de combat */}
          <div className="mt-6 bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h5 className="text-sm font-semibold text-yellow-400 mb-2 text-left">
              Rapport de Combat
            </h5>
            <div className="space-y-1 text-left max-h-64 overflow-y-auto">
              {combatLog.length > 0 ? (
                combatLog.map((msg, idx) => (
                  <p
                    key={idx}
                    className={`text-xs ${
                      msg.includes("⚡") || msg.includes("💥")
                        ? "text-yellow-400 font-bold"
                        : msg.includes("❌") || msg.includes("💀")
                        ? "text-red-500 font-bold"
                        : msg.includes("[ATTAQUE]") && msg.includes("✓")
                        ? "text-green-400"
                        : msg.includes("[ATTAQUE]") && msg.includes("✗")
                        ? "text-gray-500"
                        : msg.includes("[ENNEMI]") && msg.includes("⚠")
                        ? "text-red-400"
                        : msg.includes("[ENNEMI]") && msg.includes("✓")
                        ? "text-gray-400"
                        : msg.includes("[DEFENSE]") || msg.includes("[ÉVASION]")
                        ? "text-blue-400"
                        : msg.includes("[CONTRE]")
                        ? "text-orange-400"
                        : msg.includes("[BOUCLIER]")
                        ? "text-blue-300"
                        : msg.includes("[SURCHARGE]")
                        ? "text-purple-400"
                        : msg.includes("[RÉPARATION]")
                        ? "text-green-400"
                        : msg.includes("[DRAIN]")
                        ? "text-cyan-300"
                        : msg.includes("[ULTIME]")
                        ? "text-yellow-300 font-bold"
                        : msg.includes("[ÉNERGIE]")
                        ? "text-cyan-400"
                        : msg.includes("[VICTOIRE]")
                        ? "text-green-500 font-bold"
                        : msg.includes("[CRITIQUE]")
                        ? "text-orange-500 font-bold"
                        : msg.includes("[ALERTE]") || msg.includes("🚨")
                        ? "text-red-400 font-semibold"
                        : "text-gray-400"
                    }`}>
                    {msg}
                  </p>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">
                  En attente d'action...
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CombatScreen;
