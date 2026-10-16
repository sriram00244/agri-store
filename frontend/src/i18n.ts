import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ta from './locales/ta.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import mr from './locales/mr.json';
import pa from './locales/pa.json';
import gu from './locales/gu.json';
import bn from './locales/bn.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';

const STORAGE_KEY = 'agronix_language';
const savedLanguage = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta },
      hi: { translation: hi },
      te: { translation: te },
      mr: { translation: mr },
      pa: { translation: pa },
      gu: { translation: gu },
      bn: { translation: bn },
      kn: { translation: kn },
      ml: { translation: ml }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Keep localStorage in sync whenever the language changes anywhere in the app,
// so a page refresh restores the user's last choice instead of resetting to English.
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lng);
    document.documentElement.lang = lng;
  }
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language;
}

export default i18n;
