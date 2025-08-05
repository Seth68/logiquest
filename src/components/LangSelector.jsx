import { useTranslation } from 'react-i18next';

export default function LangSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2 justify-center mb-4">
      <button onClick={() => changeLanguage('fr')}>🇫🇷 FR</button>
      <button onClick={() => changeLanguage('en')}>🇬🇧 EN</button>
      <button onClick={() => changeLanguage('de')}>🇩🇪 DE</button>
    </div>
  );
}