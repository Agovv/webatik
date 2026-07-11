import i18next from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';

import type { i18n as I18nInstance } from 'i18next';

export type Locale = 'es' | 'en';
export type TranslationBundle = Record<string, unknown>;
export type TranslationsByLocale = Record<Locale, TranslationBundle>;

export interface TranslationResources {
    [key: string]: unknown;
}

export function createI18nInstance(
    locale: Locale,
    translations: TranslationsByLocale,
): I18nInstance {
    const instance = i18next.createInstance();

    const resources = Object.fromEntries(
        Object.entries(translations).map(([loc, bundle]) => [
            loc,
            { translation: bundle },
        ]),
    );

    instance
        .use(initReactI18next)
        .use(ICU)
        .init({
            lng: locale,
            fallbackLng: 'en',
            resources,
            interpolation: { escapeValue: false },
            react: { useSuspense: false },
        });

    return instance;
}
