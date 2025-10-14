import useGameStore from "../store/gameStore.js";
import LoreScreen from "./screens/LoreScreen.jsx";
import CreationScreen from "./screens/CreationScreen.jsx";
import GameScreen from "./screens/GameScreen.jsx";
import CombatScreen from "./screens/CombatScreen.jsx";
import GameOverScreen from "./screens/GameOverScreen.jsx";

const App = () => {
  const gameState = useGameStore((state) => state.gameState);

  if (!gameState || !gameState.currentScene) {
    return <p>Chargement...</p>;
  }

  switch (gameState.currentScene) {
    case "LORE_INTRO":
      return <LoreScreen />;
    case "CREATION":
      return <CreationScreen />;
    case "COMBAT":
      return <CombatScreen />;
    default:
      if (gameState.gameStatus !== "PLAYING") {
        return <GameOverScreen />;
      }
      return <GameScreen />;
  }
};

export default App;
