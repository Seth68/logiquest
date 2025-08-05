// App.jsx
import { useState } from "react";
import LangSelector from "./components/LangSelector";
import LogicGame from "./components/LogicGame";
import PuzzleGame from "./components/PuzzleGame";
import MemoryGame from './components/MemoryGame';

function App() {
  const [activeTab, setActiveTab] = useState("logic");

  const renderGame = () => {
    switch (activeTab) {
      case "logic":
        return <LogicGame />;
      case "puzzle":
        return <PuzzleGame />;
      case "memory":
        return <MemoryGame />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <LangSelector />
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab("logic")}
          className={`px-4 py-2 rounded ${
            activeTab === "logic" ? "bg-blue-600 text-white" : "bg-white text-black"
          }`}
        >
          Logique
        </button>
        <button
          onClick={() => setActiveTab("puzzle")}
          className={`px-4 py-2 rounded ${
            activeTab === "puzzle" ? "bg-blue-600 text-white" : "bg-white text-black"
          }`}
        >
          Puzzle
        </button>
        <button
          onClick={() => setActiveTab("memory")}
          className={`px-4 py-2 rounded ${
            activeTab === "memory" ? "bg-blue-600 text-white" : "bg-white text-black"
          }`}
        >
          Mémoire
        </button>
      </div>
      {renderGame()}
    </div>
  );
}

export default App;
