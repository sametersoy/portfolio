import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import tr from './locales/tr.json'

i18n
  // Detects browser language first, then ?lang= query / localStorage override
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      tr: { translation: tr },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'tr'],
    nonExplicitSupportedLngs: true, // tr-TR -> tr, en-US -> en
    load: 'languageOnly',
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'se_lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  })

// Keep <html lang> in sync for SEO / accessibility
const applyLang = (lng) => {
  document.documentElement.lang = (lng || 'en').split('-')[0]
}
applyLang(i18n.language)
i18n.on('languageChanged', applyLang)

export default i18n
