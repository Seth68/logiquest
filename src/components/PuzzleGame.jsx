// src/components/PuzzleGame.jsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Puzzle (taquin) interactif avec :
 * - sélecteur de taille (3x3, 4x4, 5x5)
 * - shuffle garanti solvable
 * - chrono (mm:ss)
 */

const SIZE_OPTIONS = [
  { id: "3x3", n: 3 },
  { id: "4x4", n: 4 },
  { id: "5x5", n: 5 },
];

function shuffleArray(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Count inversions (ignoring null)
function inversionCount(arr) {
  const a = arr.filter((v) => v !== null);
  let inv = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      if (a[i] > a[j]) inv++;
    }
  }
  return inv;
}

// Check solvability for sliding puzzle
function isSolvable(board, gridSize) {
  const inv = inversionCount(board);
  // if grid width is odd, puzzle solvable if inversions even
  if (gridSize % 2 === 1) {
    return inv % 2 === 0;
  } else {
    // grid width even: blank row counting from bottom (1-based)
    const blankIndex = board.indexOf(null);
    const rowFromTop = Math.floor(blankIndex / gridSize) + 1;
    const rowFromBottom = gridSize - (rowFromTop - 1);
    // solvable if:
    // - blank on even row from bottom and inversions odd
    // - blank on odd row from bottom and inversions even
    if ((rowFromBottom % 2 === 0 && inv % 2 === 1) || (rowFromBottom % 2 === 1 && inv % 2 === 0)) {
      return true;
    }
    return false;
  }
}

function generateSolvedBoard(n) {
  const total = n * n;
  const arr = [];
  for (let i = 1; i < total; i++) arr.push(i);
  arr.push(null);
  return arr;
}

function generateShuffledSolvable(n) {
  const total = n * n;
  const base = [];
  for (let i = 1; i < total; i++) base.push(i);
  base.push(null);

  let shuffled;
  let attempts = 0;
  do {
    shuffled = shuffleArray(base);
    attempts++;
    // avoid accidentally returning solved board immediately
  } while ((!isSolvable(shuffled, n) || JSON.stringify(shuffled) === JSON.stringify(base)) && attempts < 2000);

  // Fallback: if we didn't find after many attempts, generate via simple swaps (guarantee solvable)
  if (!isSolvable(shuffled, n) || JSON.stringify(shuffled) === JSON.stringify(base)) {
    // do a simple 1-step swap away from solved board that keeps solvability
    shuffled = [...base];
    // swap two non-null tiles
    if (n * n >= 3) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
      if (!isSolvable(shuffled, n)) {
        // swap other pair
        [shuffled[0], shuffled[2]] = [shuffled[2], shuffled[0]];
      }
    }
  }

  return shuffled;
}

export default function PuzzleGame() {
  const { t } = useTranslation();

  const [size, setSize] = useState(SIZE_OPTIONS[0]); // default 3x3
  const [tiles, setTiles] = useState(() => generateShuffledSolvable(SIZE_OPTIONS[0].n));
  const [isComplete, setIsComplete] = useState(false);

  // Timer state
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  // Start/restart game for current size
  function restartGame() {
    const shuffled = generateShuffledSolvable(size.n);
    setTiles(shuffled);
    setIsComplete(false);
    setSeconds(0);
    setRunning(true);
  }

  // Stop timer
  function stopTimer() {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  // Timer effect
  useEffect(() => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  // When size changes, generate new board and reset timer
  useEffect(() => {
    const shuffled = generateShuffledSolvable(size.n);
    setTiles(shuffled);
    setIsComplete(false);
    setSeconds(0);
    setRunning(false);
  }, [size]);

  // Move tile if adjacent
  function isAdjacent(index, emptyIndex, n) {
    // same row adjacency
    const rowI = Math.floor(index / n);
    const rowE = Math.floor(emptyIndex / n);
    // left/right adjacency only if same row
    if (rowI === rowE && Math.abs(index - emptyIndex) === 1) return true;
    // up/down adjacency
    if (Math.abs(index - emptyIndex) === n) return true;
    return false;
  }

  function moveTile(index) {
    if (isComplete) return;
    const emptyIndex = tiles.indexOf(null);
    if (isAdjacent(index, emptyIndex, size.n)) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
    }
  }

  // Check completion
  useEffect(() => {
    const solved = generateSolvedBoard(size.n);
    if (JSON.stringify(tiles) === JSON.stringify(solved)) {
      setIsComplete(true);
      stopTimer();
    }
  }, [tiles, size.n]);

  // Format time mm:ss
  function formatTime(s) {
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }

  // Compute gridTemplateColumns style and cell size classes
  const gridCols = size.n;
  const cellClass =
    size.n <= 3 ? "w-20 h-20 text-2xl" : size.n === 4 ? "w-16 h-16 text-xl" : "w-12 h-12 text-lg";

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">{t("puzzle_game")}</h2>

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
                {opt.id}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-medium">
            {t("time")}: <span className="font-mono">{formatTime(seconds)}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                restartGame();
              }}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
            >
              {t("restart")}
            </button>
            <button
              onClick={() => {
                setRunning((r) => !r);
              }}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded"
            >
              {running ? t("pause") : t("start")}
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        className="mx-auto bg-transparent"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          gap: "0.5rem",
          width: "auto",
        }}
      >
        {tiles.map((tile, idx) => (
          <div
            key={idx}
            onClick={() => moveTile(idx)}
            className={`flex items-center justify-center border rounded cursor-pointer select-none transition-all duration-150 bg-white text-black ${cellClass} ${
              tile === null ? "bg-gray-300 cursor-default" : "hover:bg-blue-100"
            }`}
          >
            <div>{tile !== null ? tile : ""}</div>
          </div>
        ))}
      </div>

      {/* Status */}
      {isComplete && <p className="mt-4 text-green-500 font-semibold">{t("solved")}</p>}
    </div>
  );
}