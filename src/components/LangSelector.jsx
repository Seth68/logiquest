// LangSelector.jsx
import { useState } from "react";

const translations = {
  en: {
    welcome: "Welcome to LogiQuest!",
  },
  fr: {
    welcome: "Bienvenue sur LogiQuest !",
  },
  de: {
    welcome: "Willkommen bei LogiQuest!",
  },
};

export default function LangSelector() {
  const [lang, setLang] = useState("fr");

  return (
    <div className="text-center space-y-4">
      <select
        className="p-2 rounded border"
        value={lang}
        onChange={(e) => setLang(e.target.value)}
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
        <option value="de">Deutsch</option>
      </select>

      <h1 className="text-3xl font-bold">{translations[lang].welcome}</h1>
    </div>
  );
}