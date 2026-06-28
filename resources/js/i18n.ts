import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';
import en from '../../public/locales/en/translation.json';
import es from '../../public/locales/es/translation.json';

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const LANGUAGE_STORAGE_KEY = 'i18nextLng';

void i18n
    .use(LanguageDetector) // detect user language (browser, then localStorage)
    .use(ICU) // parse ICU plural syntax ({count, plural, ...})
    .use(initReactI18next) // pass i18n instance to react-i18next
    .init({
        fallbackLng: DEFAULT_LANGUAGE,
        supportedLngs: [...SUPPORTED_LANGUAGES],
        debug: import.meta.env.DEV,
        ns: ['translation'],
        defaultNS: 'translation',
        resources: {
            en: { translation: en },
            es: { translation: es },
        },
        interpolation: {
            escapeValue: false, // react already protects from xss
        },
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: LANGUAGE_STORAGE_KEY,
            convertDetectedLanguage: (lng) =>
                SUPPORTED_LANGUAGES.includes(lng as SupportedLanguage)
                    ? lng
                    : lng.split('-')[0],
        },
        react: {
            useSuspense: false, // render with fallback values while loading
        },
    });

export default i18n;
