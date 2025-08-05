// components/PuzzleGame.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function PuzzleGame() {
  const initial = [1, 2, 3, 4, 5, 6, 7, 8, null];
  const [tiles, setTiles] = useState(shuffle(initial));
  const [isComplete, setIsComplete] = useState(false);
  const { t } = useTranslation(); // ← AJOUT

  function shuffle(array) {
    let shuffled = [...array];
    do {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    } while (JSON.stringify(shuffled) === JSON.stringify(initial));
    return shuffled;
  }

  function moveTile(index) {
    if (isComplete) return;
    const emptyIndex = tiles.indexOf(null);
    const adjacent = [
      index - 1,
      index + 1,
      index - 3,
      index + 3
    ];
    if (adjacent.includes(emptyIndex)) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
    }
  }

  function restartGame() {
    setTiles(shuffle(initial));
    setIsComplete(false);
  }

  useEffect(() => {
    if (JSON.stringify(tiles) === JSON.stringify(initial)) {
      setIsComplete(true);
    }
  }, [tiles]);

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">{t("puzzle_game")}</h2>
      <div className="grid grid-cols-3 gap-2 mx-auto w-fit">
        {tiles.map((tile, i) => (
          <div
            key={i}
            onClick={() => moveTile(i)}
            className={`w-16 h-16 flex items-center justify-center border text-xl font-bold cursor-pointer transition-all duration-200 bg-white text-black ${
              tile === null ? "bg-gray-300 cursor-default" : "hover:bg-blue-200"
            }`}
          >
            {tile !== null ? tile : ""}
          </div>
        ))}
      </div>
      {isComplete && (
        <p className="mt-4 text-green-500 font-semibold">{t("solved")}</p>
      )}
      <button
        onClick={restartGame}
        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
      >
        {t("restart")}
      </button>
    </div>
  );
}