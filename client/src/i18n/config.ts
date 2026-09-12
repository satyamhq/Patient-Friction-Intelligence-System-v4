import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';
import bn from './locales/bn.json';
import mr from './locales/mr.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import gu from './locales/gu.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import ur from './locales/ur.json';

export const RTL_LANGUAGES = ['ur'];

export const isRTL = (langCode: string): boolean => {
  return RTL_LANGUAGES.includes(langCode);
};

export const updateDocumentDirection = (langCode: string) => {
  const rtl = isRTL(langCode);
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  document.documentElement.lang = langCode;
};

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  pa: { translation: pa },
  bn: { translation: bn },
  mr: { translation: mr },
  ta: { translation: ta },
  te: { translation: te },
  gu: { translation: gu },
  kn: { translation: kn },
  ml: { translation: ml },
  ur: { translation: ur },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'pa', 'bn', 'mr', 'ta', 'te', 'gu', 'kn', 'ml', 'ur'],
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'pfis_preferred_language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

// Update DOM direction upon initialization and language change
updateDocumentDirection(i18n.language || 'en');

i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
  localStorage.setItem('pfis_preferred_language', lng);
});

export default i18n;
