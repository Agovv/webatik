// resources/js/components/LocaleSwitcher.tsx
import { router } from '@inertiajs/react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Locale } from '@/i18n';

interface LocaleOption {
    value: Locale;
    label: string;
}

const LOCALES: LocaleOption[] = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
];

export default function LocaleSwitcher() {
    const { i18n } = useTranslation();
    const current =
        LOCALES.find((l) => l.value === i18n.language) ?? LOCALES[0];

    function handleSelect(locale: Locale) {
        if (locale === i18n.language) {
            return;
        }

        const previous = i18n.language;

        i18n.changeLanguage(locale);

        router.post(
            '/locale',
            { locale },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    i18n.changeLanguage(previous);
                },
            },
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    aria-label="Cambiar idioma"
                >
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">{current.label}</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
                {LOCALES.map((locale) => (
                    <DropdownMenuItem
                        key={locale.value}
                        onSelect={() => handleSelect(locale.value)}
                        className="justify-between"
                    >
                        <span className="flex items-center gap-2">
                            <span>{locale.label}</span>
                        </span>
                        {locale.value === i18n.language && (
                            <Check className="h-4 w-4 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
