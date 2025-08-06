// src/components/MemoryGame.jsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/* --- Configurations (taille & difficulté) --- */
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

const EMOJI_POOL = [
  "🍎","🍌","🍇","🍉","🍓","🍍","🍒","🍑","🥝","🍋",
  "🍊","🥥","🍐","🍈","🍏","🥭","🍅","🥕","🌽","🥑"
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateDeck(rows, cols) {
  const total = rows * cols;
  const pairs = total / 2;
  const pool = shuffle(EMOJI_POOL).slice(0, pairs);
  return shuffle([...pool, ...pool]);
}

export default function MemoryGame() {
  const { t } = useTranslation();

  const [size, setSize] = useState(SIZE_OPTIONS[0]);
  const [difficulty, setDifficulty] = useState("normal");
  const [cards, setCards] = useState(() => generateDeck(SIZE_OPTIONS[0].rows, SIZE_OPTIONS[0].cols));
  const [flipped, setFlipped] = useState([]); // indices currently flipped
  const [matched, setMatched] = useState([]); // matched indices
  const [disabled, setDisabled] = useState(false);
  const [started, setStarted] = useState(true);
  const timeoutRef = useRef(null);

  // sizes: compute cell size px depending on number of cols
  const cellPx = size.cols >= 5 ? 48 : size.cols === 4 ? 64 : 80;
  const gridTemplate = `repeat(${size.cols}, ${cellPx}px)`;

  useEffect(() => {
    // when size or difficulty changes, reset deck
    startNewGame();
    // cleanup on unmount
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, difficulty]);

  useEffect(() => {
    // when two flipped, compare
    if (flipped.length === 2) {
      setDisabled(true);
      timeoutRef.current = setTimeout(() => {
        const [a, b] = flipped;
        if (cards[a] === cards[b]) {
          setMatched((prev) => [...prev, a, b]);
        }
        setFlipped([]);
        setDisabled(false);
        timeoutRef.current = null;
      }, DIFFICULTY[difficulty].flipDelay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);

  useEffect(() => {
    // win detection
    if (matched.length > 0 && matched.length === cards.length) {
      // all matched
      // (you could add celebration)
    }
  }, [matched, cards.length]);

  function startNewGame() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const deck = generateDeck(size.rows, size.cols);
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setDisabled(false);
    setStarted(true);

    // preview logic
    const previewMs = DIFFICULTY[difficulty].preview;
    if (previewMs > 0) {
      // flip all for preview, then hide
      setFlipped(deck.map((_, i) => i));
      timeoutRef.current = setTimeout(() => {
        setFlipped([]);
        timeoutRef.current = null;
      }, previewMs);
    }
  }

  function handleClick(index) {
    if (!started || disabled) return;
    if (flipped.includes(index) || matched.includes(index)) return;

    if (flipped.length === 0) {
      setFlipped([index]);
      return;
    }
    if (flipped.length === 1) {
      setFlipped((prev) => [...prev, index]);
      return;
    }
  }

  function restartGame() {
    startNewGame();
  }

  // render tile: centered emoji or placeholder
  function renderTile(index) {
    const isRevealed = flipped.includes(index) || matched.includes(index);
    const content = isRevealed ? cards[index] : "❓";
    return (
      <div className="w-full h-full flex items-center justify-center select-none">
        <span className="text-2xl leading-none">{content}</span>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">{t("memory_game")}</h2>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
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

        <div>
          <button
            onClick={restartGame}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
          >
            {t("start")}
          </button>
        </div>
      </div>

      {/* Grid: fixed column widths so tiles touch */}
      <div
        className="mx-auto"
        style={{
          display: "grid",
          gridTemplateColumns: gridTemplate,
          gap: "0.1rem",
        }}
      >
        {cards.map((_, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            className={`flex items-center justify-center box-border border-[0.5px] border-gray-200 ${cellSizeClass(
              size.cols
            )} bg-white cursor-pointer select-none`}
          >
            {renderTile(idx)}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="text-sm text-gray-700">
          {t("pairs_count", { count: cards.length / 2 })}
        </div>
        {matched.length === cards.length && (
          <div className="text-green-500 font-semibold">{t("solved")}</div>
        )}
        <button
          onClick={restartGame}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
        >
          {t("restart")}
        </button>
      </div>
    </div>
  );
}

/* helper to return cell class depending on number of columns */
function cellSizeClass(cols) {
  if (cols >= 5) return "w-12 h-12 text-lg";
  if (cols === 4) return "w-16 h-16 text-xl";
  return "w-20 h-20 text-2xl";
}
