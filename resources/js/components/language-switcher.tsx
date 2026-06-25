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
import i18n, { SUPPORTED_LANGUAGES } from '@/i18n';
import type { SupportedLanguage } from '@/i18n';

const languageLabels: Record<SupportedLanguage, string> = {
    en: 'language.english',
    es: 'language.spanish',
};

function useCurrentLanguage(): SupportedLanguage {
    const { i18n: i18nInstance } = useTranslation();

    return (i18nInstance.resolvedLanguage ??
        i18nInstance.language ??
        'en') as SupportedLanguage;
}

function changeLanguage(lng: SupportedLanguage) {
    void i18n.changeLanguage(lng);
}

/**
 * Standalone dropdown trigger. Useful when the switcher lives outside an
 * existing DropdownMenu (e.g. sidebar footer or settings page).
 */
export function LanguageSwitcher() {
    const { t } = useTranslation();
    const current = useCurrentLanguage();

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
                {SUPPORTED_LANGUAGES.map((lng) => (
                    <LanguageItem
                        key={lng}
                        lng={lng}
                        active={lng === current}
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
                {SUPPORTED_LANGUAGES.map((lng) => (
                    <LanguageItem
                        key={lng}
                        lng={lng}
                        active={lng === current}
                    />
                ))}
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    );
}

function LanguageItem({
    lng,
    active,
}: {
    lng: SupportedLanguage;
    active: boolean;
}) {
    const { t } = useTranslation();

    return (
        <DropdownMenuItem
            onSelect={(event) => {
                event.preventDefault();
                changeLanguage(lng);
            }}
            data-test={`language-option-${lng}`}
        >
            <span className="flex-1">{t(languageLabels[lng])}</span>
            {active && <Check className="size-4" />}
        </DropdownMenuItem>
    );
}

export default LanguageSwitcher;
