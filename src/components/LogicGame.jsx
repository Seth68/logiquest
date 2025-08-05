import { useState } from 'react';
import { useTranslation } from "react-i18next";

const suites = [
  { sequence: [2, 4, 6], answer: 8 },
  { sequence: [1, 1, 2, 3], answer: 5 },
  { sequence: [5, 10, 20], answer: 40 },
  { sequence: [9, 7, 5], answer: 3 },
];

export default function LogicGame() {
  const [current, setCurrent] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const { t } = useTranslation(); // ← AJOUT
  const currentGame = suites[current];

  const checkAnswer = () => {
    if (parseInt(userInput) === currentGame.answer) {
      setFeedback(t("solved"));
      setTimeout(() => {
        setFeedback('');
        setUserInput('');
        setCurrent((prev) => (prev + 1) % suites.length);
      }, 1000);
    } else {
      setFeedback(t("retry"));
    }
  };

  return (
    <div className="bg-white text-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">{t("logic_resolve")}</h2>
      <div className="text-xl mb-4">
        {currentGame.sequence.join(', ')}, ?
      </div>
      <input
        type="number"
        className="border p-2 w-full mb-2 rounded"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
      />
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        onClick={checkAnswer}
      >
        {t("validate")}
      </button>
      {feedback && <p className="mt-3">{feedback}</p>}
    </div>
  );
}