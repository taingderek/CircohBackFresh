import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';

// the translations
const resources = {
  en: {
    translation: en
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    }
  });

export default i18n; 