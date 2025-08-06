// src/components/PuzzleGame.jsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/* --- Configuration --- */
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

function isSolvable(board, gridSize) {
  const inv = inversionCount(board);
  if (gridSize % 2 === 1) {
    return inv % 2 === 0;
  } else {
    const blankIndex = board.indexOf(null);
    const rowFromTop = Math.floor(blankIndex / gridSize) + 1;
    const rowFromBottom = gridSize - (rowFromTop - 1);
    return (
      (rowFromBottom % 2 === 0 && inv % 2 === 1) ||
      (rowFromBottom % 2 === 1 && inv % 2 === 0)
    );
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
  } while (
    (!isSolvable(shuffled, n) ||
      JSON.stringify(shuffled) === JSON.stringify(base)) &&
    attempts < 2000
  );

  if (
    !isSolvable(shuffled, n) ||
    JSON.stringify(shuffled) === JSON.stringify(base)
  ) {
    shuffled = [...base];
    if (n * n >= 3) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
      if (!isSolvable(shuffled, n)) {
        [shuffled[0], shuffled[2]] = [shuffled[2], shuffled[0]];
      }
    }
  }

  return shuffled;
}

export default function PuzzleGame() {
  const { t } = useTranslation();

  const [size, setSize] = useState(SIZE_OPTIONS[0]);
  const [tiles, setTiles] = useState(() =>
    generateShuffledSolvable(SIZE_OPTIONS[0].n)
  );
  const [isComplete, setIsComplete] = useState(false);

  // Timer
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  // Move counter
  const [moves, setMoves] = useState(0);

  // Image mode
  const [imageMode, setImageMode] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageTiles, setImageTiles] = useState(null);

  // Reset board when size changes
  useEffect(() => {
    resetBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  // Stop timer on completion
  useEffect(() => {
    if (isComplete) stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

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
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function resetBoard() {
    const shuffled = generateShuffledSolvable(size.n);
    setTiles(shuffled);
    setIsComplete(false);
    setSeconds(0);
    setMoves(0);
    setRunning(false);

    if (imageSrc) {
      createImageTiles(imageSrc, size.n)
        .then((tilesArr) => setImageTiles(tilesArr))
        .catch(() => setImageTiles(null));
    } else {
      setImageTiles(null);
    }
  }

  function stopTimer() {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function isAdjacent(index, emptyIndex, n) {
    const rowI = Math.floor(index / n);
    const rowE = Math.floor(emptyIndex / n);
    return (
      (rowI === rowE && Math.abs(index - emptyIndex) === 1) ||
      Math.abs(index - emptyIndex) === n
    );
  }

  function moveTile(index) {
    if (isComplete) return;
    const emptyIndex = tiles.indexOf(null);
    if (isAdjacent(index, emptyIndex, size.n)) {
      // start timer on first valid move
      if (!running) setRunning(true);

      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [
        newTiles[emptyIndex],
        newTiles[index],
      ];
      setTiles(newTiles);

      // increment move counter
      setMoves((m) => m + 1);

      // check completion
      const solved = generateSolvedBoard(size.n);
      if (JSON.stringify(newTiles) === JSON.stringify(solved)) {
        setIsComplete(true);
      }
    }
  }

  function formatTime(s) {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }

  async function createImageTiles(dataUrl, n) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const sizePx = Math.min(img.width, img.height);
        const sx = (img.width - sizePx) / 2;
        const sy = (img.height - sizePx) / 2;
        const tilePx = Math.floor(sizePx / n);

        const tilesArr = [];
        const off = document.createElement("canvas");
        off.width = sizePx;
        off.height = sizePx;
        const ctx = off.getContext("2d");
        ctx.drawImage(img, sx, sy, sizePx, sizePx, 0, 0, sizePx, sizePx);

        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            if (r === n - 1 && c === n - 1) {
              tilesArr.push(null);
            } else {
              const x = c * tilePx;
              const y = r * tilePx;
              const tileCanvas = document.createElement("canvas");
              tileCanvas.width = tilePx;
              tileCanvas.height = tilePx;
              const tctx = tileCanvas.getContext("2d");
              tctx.drawImage(
                off,
                x,
                y,
                tilePx,
                tilePx,
                0,
                0,
                tilePx,
                tilePx
              );
              tilesArr.push(tileCanvas.toDataURL());
            }
          }
        }
        resolve(tilesArr);
      };
      img.onerror = () => reject(new Error("Image load error"));
      img.src = dataUrl;
    });
  }

  function onFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setImageSrc(dataUrl);
      createImageTiles(dataUrl, size.n)
        .then((tilesArr) => setImageTiles(tilesArr))
        .catch(() => setImageTiles(null));
    };
    reader.readAsDataURL(file);
  }

  const gridCols = size.n;
  const cellClass =
    size.n <= 3 ? "w-20 h-20" : size.n === 4 ? "w-16 h-16" : "w-12 h-12";

  function renderTileContent(tileValue) {
    if (imageMode && imageTiles && tileValue !== null) {
      const dataUrl = imageTiles[tileValue - 1];
      if (dataUrl) {
        return (
          <img
            src={dataUrl}
            alt={`tile-${tileValue}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
        );
      }
    }
    return (
      <span className="text-xl font-bold">
        {tileValue !== null ? tileValue : ""}
      </span>
    );
  }

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

        <div className="flex items-center gap-3">
          <label className="font-medium">{t("mode_label")}</label>
          <select
            value={imageMode ? "image" : "numbers"}
            onChange={(e) => setImageMode(e.target.value === "image")}
            className="p-2 rounded border bg-white text-black"
          >
            <option value="numbers">{t("numbers")}</option>
            <option value="image">{t("image")}</option>
          </select>
        </div>

        {imageMode && (
          <div className="flex items-center gap-2">
            <label className="font-medium">{t("upload_label")}</label>
            <input type="file" accept="image/*" onChange={onFileChange} />
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="font-medium">
            {t("time")}:{" "}
            <span className="font-mono">{formatTime(seconds)}</span>
          </div>

          <div className="font-medium">
            {t("moves")}: <span className="font-mono">{moves}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                resetBoard();
                setRunning(true);
              }}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
            >
              {t("restart")}
            </button>
            <button
              onClick={() => setRunning((r) => !r)}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded"
            >
              {running ? t("pause") : t("start")}
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        className="mx-auto"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          gap: "0.1rem",
        }}
      >
        {tiles.map((tile, idx) => (
          <div
            key={idx}
            onClick={() => moveTile(idx)}
            className={`flex items-center justify-center border-0 border-gray-200 rounded cursor-pointer select-none transition-all duration-150 bg-white text-black overflow-hidden ${cellClass} ${
              tile === null
                ? "bg-gray-300 cursor-default"
                : "hover:brightness-95"
            }`}
          >
            <div className="w-full h-full flex items-center justify-center">
              {renderTileContent(tile)}
            </div>
          </div>
        ))}
      </div>

      {/* Status */}
      {isComplete && (
        <p className="mt-4 text-green-500 font-semibold">{t("solved")}</p>
      )}
    </div>
  );
}
