import { router } from '@inertiajs/react';
import { Check, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Locale } from '@/i18n';
import { update as updateLocale } from '@/routes/locale';

const supportedLanguages: Locale[] = ['es', 'en'];

const languageLabels: Record<Locale, string> = {
    en: 'language.english',
    es: 'language.spanish',
};

function useCurrentLanguage(): Locale {
    const { i18n: i18nInstance } = useTranslation();
    const currentLanguage =
        i18nInstance.resolvedLanguage ?? i18nInstance.language ?? 'es';

    return supportedLanguages.includes(currentLanguage as Locale)
        ? (currentLanguage as Locale)
        : 'es';
}

function useChangeLanguage() {
    const { i18n } = useTranslation();

    return (locale: Locale) => {
        if (locale === i18n.language) {
            return;
        }

        const previous = i18n.language;

        void i18n.changeLanguage(locale);

        router.post(
            updateLocale.url(),
            { locale },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    void i18n.changeLanguage(previous);
                },
            },
        );
    };
}

/**
 * Standalone dropdown trigger. Useful when the switcher lives outside an
 * existing DropdownMenu (e.g. sidebar footer or settings page).
 */
export function LanguageSwitcher() {
    const { t } = useTranslation();
    const current = useCurrentLanguage();
    const changeLanguage = useChangeLanguage();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors outline-none hover:bg-accent focus:bg-accent"
                data-test="language-switcher"
            >
                <Languages className="mr-2 size-4" />
                <span>{t('language.label')}</span>
                <span className="ml-auto text-xs text-muted-foreground uppercase">
                    {current}
                </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
                {supportedLanguages.map((lng) => (
                    <LanguageItem
                        key={lng}
                        lng={lng}
                        active={lng === current}
                        onSelect={changeLanguage}
                    />
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/**
 * Submenu variant for embedding inside another DropdownMenu (e.g. user menu).
 */
export function LanguageMenuSub() {
    const { t } = useTranslation();
    const current = useCurrentLanguage();
    const changeLanguage = useChangeLanguage();

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger data-test="language-switcher">
                <Languages className="mr-2 size-4" />
                <span>{t('language.label')}</span>
                <span className="ml-auto text-xs text-muted-foreground uppercase">
                    {current}
                </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                {supportedLanguages.map((lng) => (
                    <LanguageItem
                        key={lng}
                        lng={lng}
                        active={lng === current}
                        onSelect={changeLanguage}
                    />
                ))}
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    );
}

function LanguageItem({
    lng,
    active,
    onSelect,
}: {
    lng: Locale;
    active: boolean;
    onSelect: (locale: Locale) => void;
}) {
    const { t } = useTranslation();

    return (
        <DropdownMenuItem
            onSelect={() => onSelect(lng)}
            data-test={`language-option-${lng}`}
        >
            <span className="flex-1">{t(languageLabels[lng])}</span>
            {active && <Check className="size-4" />}
        </DropdownMenuItem>
    );
}

export default LanguageSwitcher;
