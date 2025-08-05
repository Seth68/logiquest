import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en.json';
import translationFR from './locales/fr.json';
import translationDE from './locales/de.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translationEN },
    fr: { translation: translationFR },
    de: { translation: translationDE }
  },
  lng: 'fr', // langue par défaut
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;