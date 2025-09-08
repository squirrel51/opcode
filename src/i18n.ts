import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from './locales/en/translation.json';
import translationZH from './locales/zh/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  zh: {
    translation: translationZH
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    // Read language from localStorage or default to 'en'
    // This allows the language choice to persist across sessions
    lng: localStorage.getItem('i18nextLng') || "en", 
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;