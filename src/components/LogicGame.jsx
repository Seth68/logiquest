// src/components/LogicGame.jsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "logiquest_logic_best_v2";

/**
 * Chaque objet contient :
 *  - sequence: array
 *  - answer: number
 *  - hintKey: clé i18n pour l'indice
 *  - explainKey: clé i18n pour l'explication pédagogique
 */
const suites = [
  { sequence: [2, 4, 6], answer: 8, hintKey: "hint_add2", explainKey: "explain_add2" },
  { sequence: [1, 1, 2, 3], answer: 5, hintKey: "hint_fibo", explainKey: "explain_fibo_short" },
  { sequence: [5, 10, 20], answer: 40, hintKey: "hint_mul2", explainKey: "explain_mul2" },
  { sequence: [9, 7, 5], answer: 3, hintKey: "hint_sub2", explainKey: "explain_sub2" },

  { sequence: [1, 4, 9, 16, 25], answer: 36, hintKey: "hint_squares", explainKey: "explain_squares" },
  { sequence: [2, 4, 8, 16, 32, 64], answer: 128, hintKey: "hint_pow2", explainKey: "explain_pow2" },
  { sequence: [1, 3, 6, 10, 15, 21], answer: 28, hintKey: "hint_triangular", explainKey: "explain_triangular" },
  { sequence: [2, 3, 5, 7, 11, 13], answer: 17, hintKey: "hint_primes", explainKey: "explain_primes" },
  { sequence: [10, 20, 10, 20, 10], answer: 20, hintKey: "hint_alternate", explainKey: "explain_alternate" },
  { sequence: [1, 2, 4, 8, 16, 32, 64], answer: 128, hintKey: "hint_powers2", explainKey: "explain_pow2" },
  { sequence: [1, 1, 2, 3, 5, 8, 13], answer: 21, hintKey: "hint_fibonacci", explainKey: "explain_fibonacci" },
  { sequence: [3, 6, 18, 108], answer: 972, hintKey: "hint_multiply_seq", explainKey: "explain_multiply_seq" },
  { sequence: [1, 8, 27, 64], answer: 125, hintKey: "hint_cubes", explainKey: "explain_cubes" },
  { sequence: [2, 6, 12, 20, 30], answer: 42, hintKey: "hint_polygonal", explainKey: "explain_polygonal" },
  { sequence: [4, 6, 9, 6, 11, 6], answer: 14, hintKey: "hint_interleave", explainKey: "explain_interleave" },
  { sequence: [1, 10, 3, 9, 5, 8, 7], answer: 7, hintKey: "hint_intertwined", explainKey: "explain_intertwined" },
  { sequence: [1, 4, 7, 10, 13, 16, 19], answer: 22, hintKey: "hint_arith_add3", explainKey: "explain_arith_add3" },
  { sequence: [1, 2, 6, 24, 120], answer: 720, hintKey: "hint_factorial", explainKey: "explain_factorial" },
  // tu peux ajouter d'autres suites ici...
];

export default function LogicGame({ onComplete, difficulty = "normal" }) {
  const { t } = useTranslation();

  // NOTE: pour plus tard on pourra filtrer "suites" selon difficulty.
  const [current, setCurrent] = useState(() => Math.floor(Math.random() * suites.length));
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [started, setStarted] = useState(false);

  // timer
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  // bests loaded from localStorage
  const [bests, setBests] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // hint toggle + shake state + pedagogy visible
  const [showHint, setShowHint] = useState(false);
  const [shake, setShake] = useState(false);
  const [pedagogy, setPedagogy] = useState(""); // texte pédagogique affiché après bonne réponse

  const currentGame = suites[current];

  // timer effect
  useEffect(() => {
    if (started) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
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
  }, [started]);

  // reset when changing question
  useEffect(() => {
    setUserInput("");
    setFeedback("");
    setAttempts(0);
    setSeconds(0);
    setStarted(false);
    setShowHint(false);
    setShake(false);
    setPedagogy("");
  }, [current]);

  function saveBest(index, timeSec, attemptsCount) {
    setBests((prev) => {
      const next = { ...prev };
      const old = prev[index];
      const isBetter =
        !old ||
        timeSec < old.time ||
        (timeSec === old.time && attemptsCount < old.attempts);
      if (isBetter) {
        next[index] = { time: timeSec, attempts: attemptsCount };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          // ignore
        }
      }
      return next;
    });
  }

  function startTimerIfNeeded() {
    if (!started) setStarted(true);
  }

  // retourne un index aléatoire différent de excludeIndex
  function randomIndexDifferent(excludeIndex) {
    if (suites.length <= 1) return 0;
    let idx;
    do {
      idx = Math.floor(Math.random() * suites.length);
    } while (idx === excludeIndex);
    return idx;
  }

  function nextQuestionRandom() {
    const next = randomIndexDifferent(current);
    setCurrent(next);
  }

  function checkAnswer() {
    startTimerIfNeeded();
    setAttempts((a) => a + 1);

    const parsed = parseInt(userInput, 10);
    if (!Number.isFinite(parsed)) {
      setFeedback(t("enter_number"));
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setTimeout(() => setFeedback(""), 1200);
      return;
    }

    if (parsed === currentGame.answer) {
      setFeedback(t("solved"));
      setStarted(false); // stop timer
      // show pedagogical explanation
      const explain = t(currentGame.explainKey);
      setPedagogy(explain);

      // save best for this question
      saveBest(current, seconds, attempts + 1);

      // **notifier le parent (mode aventure)**
      if (typeof onComplete === "function") {
        try {
          onComplete(true, { time: seconds, attempts: attempts + 1, questionIndex: current });
        } catch (e) {
          // ignore
        }
      }

      // after a short delay show pedagogy long enough, then go to next random question
      setTimeout(() => {
        setPedagogy("");
        setFeedback("");
        // choose next random question
        nextQuestionRandom();
      }, 2200);
    } else {
      setFeedback(t("retry"));
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setTimeout(() => setFeedback(""), 900);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") checkAnswer();
  }

  function skipQuestion() {
    // Optionally notify parent that user skipped (not considered success)
    if (typeof onComplete === "function") {
      try {
        onComplete(false, { skipped: true, questionIndex: current });
      } catch {}
    }
    nextQuestionRandom();
  }

  const bestForCurrent = bests[current];

  function formatTime(s) {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }

  // animation variants
  const questionVariants = {
    initial: { opacity: 0, y: 8 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.28 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
  };

  return (
    <div className="bg-white text-gray-800 p-6 rounded-xl shadow-lg w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">{t("logic_resolve")}</h2>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          variants={questionVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="text-xl mb-3"
        >
          {currentGame.sequence.join(", ")}, ?
        </motion.div>
      </AnimatePresence>

      <div className="mb-3 flex gap-2 items-start">
        <motion.input
          type="number"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={startTimerIfNeeded}
          aria-label={t("answer_input")}
          className="border p-2 flex-1 rounded"
          animate={shake ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
        />
        <button
          onClick={checkAnswer}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {t("validate")}
        </button>
      </div>

      {/* info row */}
      <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
        <div>{t("time")}: <span className="font-mono">{formatTime(seconds)}</span></div>
        <div>{t("attempts")}: <span className="font-mono">{attempts}</span></div>
      </div>

      {/* best / pedagogy */}
      {bestForCurrent ? (
        <div className="mb-3 text-sm text-gray-700">
          {t("best_time")}: {formatTime(bestForCurrent.time)} • {t("best_attempts")}: {bestForCurrent.attempts}
        </div>
      ) : (
        <div className="mb-3 text-sm text-gray-500">{t("no_record")}</div>
      )}

      {pedagogy && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 text-sm text-blue-700">
          {pedagogy}
        </motion.div>
      )}

      <div className="flex gap-2 mb-3">
        <button onClick={() => setShowHint((s) => !s)} className="px-3 py-2 border rounded text-sm">
          {t("hint")}
        </button>
        <button onClick={skipQuestion} className="px-3 py-2 border rounded text-sm">{t("skip")}</button>
        <button
          onClick={() => {
            setUserInput("");
            setFeedback("");
            setAttempts(0);
            setSeconds(0);
            setStarted(false);
            setPedagogy("");
          }}
          className="px-3 py-2 border rounded text-sm ml-auto"
        >
          {t("restart")}
        </button>
      </div>

      {showHint && currentGame.hintKey && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1 }} className="mb-3 text-sm italic text-gray-700">
          {t(currentGame.hintKey)}
        </motion.div>
      )}

      <AnimatePresence>
        {feedback && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 font-medium">
            {feedback}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
