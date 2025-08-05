// src/components/MemoryGame.jsx
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

const EMOJI_POOL = [
  "🍎","🍌","🍇","🍉","🍓","🍍","🍒","🍑","🥝","🍋",
  "🍊","🥥","🍐","🍈","🍏","🥭","🍅","🥕","🌽","🥑"
];

const SIZE_OPTIONS = [
  { id: "3x4", rows: 3, cols: 4 },
  { id: "4x4", rows: 4, cols: 4 },
  { id: "5x4", rows: 5, cols: 4 },
];

const DIFFICULTY = {
  easy: { flipDelay: 1000, preview: 2000 },
  normal: { flipDelay: 700, preview: 1000 },
  hard: { flipDelay: 350, preview: 0 },
};

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateDeck(rows, cols) {
  const total = rows * cols;
  if (total % 2 !== 0) throw new Error("Total cards must be even");
  const pairs = total / 2;
  const pool = shuffle(EMOJI_POOL).slice(0, pairs);
  const deck = shuffle([...pool, ...pool]);
  return deck;
}

export default function MemoryGame() {
  const { t } = useTranslation();

  const [size, setSize] = useState(SIZE_OPTIONS[0]); // default 3x4
  const [difficulty, setDifficulty] = useState("normal");
  const [cards, setCards] = useState(() =>
    generateDeck(SIZE_OPTIONS[0].rows, SIZE_OPTIONS[0].cols)
  );
  const [flipped, setFlipped] = useState([]); // indices
  const [matched, setMatched] = useState([]); // indices
  const [disabled, setDisabled] = useState(false);
  const [started, setStarted] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // start or restart game according to current size/difficulty
  function startGame() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const deck = generateDeck(size.rows, size.cols);
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setDisabled(false);
    setStarted(true);

    // initial preview based on difficulty
    const previewMs = DIFFICULTY[difficulty].preview;
    if (previewMs > 0) {
      // show all cards for previewMs ms, then hide them
      setFlipped(cards.map((_, i) => i)); // temporarily flip all
      timeoutRef.current = setTimeout(() => {
        setFlipped([]);
        timeoutRef.current = null;
      }, previewMs);
    }
  }

  // when user clicks card
  function handleClick(index) {
    if (!started) return;
    if (disabled) return;
    if (flipped.includes(index) || matched.includes(index)) return;

    if (flipped.length === 0) {
      setFlipped([index]);
      return;
    }

    if (flipped.length === 1) {
      const firstIndex = flipped[0];
      const secondIndex = index;
      // flip second
      setFlipped([firstIndex, secondIndex]);
      setDisabled(true);

      const flipDelay = DIFFICULTY[difficulty].flipDelay;
      timeoutRef.current = setTimeout(() => {
        // compare
        if (cards[firstIndex] === cards[secondIndex]) {
          setMatched((prev) => [...prev, firstIndex, secondIndex]);
        }
        setFlipped([]);
        setDisabled(false);
        timeoutRef.current = null;
      }, flipDelay);
    }
  }

  // dynamic grid style
  const gridStyle = {
    gridTemplateColumns: `repeat(${size.cols}, minmax(0, 1fr))`,
    gap: "0.5rem",
  };

  const cellSizeClass = size.cols >= 5 ? "w-12 h-12 text-xl" : "w-16 h-16 text-2xl";

  const hasWon = matched.length === cards.length && cards.length > 0;

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">{t("memory_game")}</h2>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
        {/* Size selector */}
        <div className="flex items-center gap-2">
          <label className="font-medium">{t("size_label")}:</label>
          <select
            value={size.id}
            onChange={(e) => {
              const sel = SIZE_OPTIONS.find((s) => s.id === e.target.value);
              setSize(sel);
            }}
            className="p-2 rounded border bg-white text-black"
          >
            {SIZE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.id} ({opt.rows}×{opt.cols})
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty selector (beside the size) */}
        <div className="flex items-center gap-3">
          <label className="font-medium">{t("difficulty_label")}:</label>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="difficulty"
                value="easy"
                checked={difficulty === "easy"}
                onChange={() => setDifficulty("easy")}
                className="accent-indigo-600"
              />
              <span className="ml-1">{t("easy")}</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="difficulty"
                value="normal"
                checked={difficulty === "normal"}
                onChange={() => setDifficulty("normal")}
                className="accent-indigo-600"
              />
              <span className="ml-1">{t("normal")}</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="difficulty"
                value="hard"
                checked={difficulty === "hard"}
                onChange={() => setDifficulty("hard")}
                className="accent-indigo-600"
              />
              <span className="ml-1">{t("hard")}</span>
            </label>
          </div>
        </div>

        {/* Start / Restart */}
        <div>
          <button
            onClick={() => startGame()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
          >
            {t("start")}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div
        className="mx-auto bg-transparent"
        style={{ display: "grid", ...gridStyle, width: "auto" }}
      >
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index) || (DIFFICULTY[difficulty].preview > 0 && flipped.length === cards.length);
          return (
            <div
              key={index}
              onClick={() => handleClick(index)}
              className={`flex items-center justify-center border rounded cursor-pointer select-none transition-all duration-200 bg-white text-black ${cellSizeClass} ${
                matched.includes(index) ? "opacity-70" : ""
              }`}
            >
              <div>{isFlipped ? card : "❓"}</div>
            </div>
          );
        })}
      </div>

      {/* Status & Controls */}
      {hasWon && (
        <p className="mt-4 text-green-400 font-medium">{t("solved")}</p>
      )}

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => startGame()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
        >
          {t("restart")}
        </button>
        <div className="text-sm text-gray-300">{t("pairs_count", { count: cards.length / 2 })}</div>
      </div>
    </div>
  );
}