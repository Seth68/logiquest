// src/components/MemoryGame.jsx
import { useEffect, useState } from "react";

const initialCards = ["🍎", "🍌", "🍇", "🍉", "🍓", "🍍"];
const shuffledCards = [...initialCards, ...initialCards].sort(() => Math.random() - 0.5);

export default function MemoryGame() {
  const [cards, setCards] = useState(shuffledCards);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (flipped.length === 2) {
      setDisabled(true);
      setTimeout(() => {
        const [first, second] = flipped;
        if (cards[first] === cards[second]) {
          setMatched((prev) => [...prev, ...flipped]);
        }
        setFlipped([]);
        setDisabled(false);
      }, 1000);
    }
  }, [flipped]);

  function handleClick(index) {
    if (disabled || flipped.includes(index) || matched.includes(index)) return;
    setFlipped((prev) => [...prev, index]);
  }

  function restartGame() {
    const shuffled = [...initialCards, ...initialCards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">Jeu de mémoire 🧠</h2>
      <div className="grid grid-cols-4 gap-3 w-fit mx-auto">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          return (
            <div
              key={index}
              onClick={() => handleClick(index)}
              className={`w-16 h-16 flex items-center justify-center text-2xl font-bold cursor-pointer border rounded ${
                isFlipped ? "bg-white text-black" : "bg-gray-400"
              }`}
            >
              {isFlipped ? card : "❓"}
            </div>
          );
        })}
      </div>
      {matched.length === cards.length && (
        <p className="mt-4 text-green-400 font-medium">🎉 Bravo ! Vous avez gagné !</p>
      )}
      <button
        onClick={restartGame}
        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
      >
        Recommencer
      </button>
    </div>
  );
}