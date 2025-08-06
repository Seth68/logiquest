// App.jsx
import { useState } from "react";
import LangSelector from "./components/LangSelector";
import LogicGame from "./components/LogicGame";
import PuzzleGame from "./components/PuzzleGame";
import MemoryGame from "./components/MemoryGame";
import AdventureMap from "./components/adventure/AdventureMap";
import { useTranslation } from "react-i18next";

function App() {
  const [activeTab, setActiveTab] = useState("logic");
  const { t } = useTranslation();
  const renderGame = () => {
    switch (activeTab) {
      case "logic":
        return <LogicGame />;
      case "puzzle":
        return <PuzzleGame />;
      case "memory":
        return <MemoryGame />;
      case "adventure":
        return <AdventureMap />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <div className="w-full max-w-4xl flex items-center justify-between">
        <h1 className="text-3xl font-bold">LogiQuest</h1>
        <LangSelector />
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab("logic")}
          className={`px-4 py-2 rounded ${activeTab === "logic" ? "bg-blue-600 text-white" : "bg-white text-black"}`}
        >
          {t("logic")}
        </button>

        <button
          onClick={() => setActiveTab("puzzle")}
          className={`px-4 py-2 rounded ${activeTab === "puzzle" ? "bg-blue-600 text-white" : "bg-white text-black"}`}
        >
          {t("puzzle")}
        </button>

        <button
          onClick={() => setActiveTab("memory")}
          className={`px-4 py-2 rounded ${activeTab === "memory" ? "bg-blue-600 text-white" : "bg-white text-black"}`}
        >
          {t("memory")}
        </button>

        <button
          onClick={() => setActiveTab("adventure")}
          className={`px-4 py-2 rounded ${activeTab === "adventure" ? "bg-blue-600 text-white" : "bg-white text-black"}`}
        >
          {t("adventure")}
        </button>
      </div>

      <div className="w-full flex justify-center">
        {renderGame()}
      </div>
    </div>
  );
}

export default App;