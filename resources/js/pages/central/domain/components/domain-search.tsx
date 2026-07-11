import { SearchIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type DomainSearchProps = {
    value: string;
    onChange: (value: string) => void;
};

export function DomainSearch({ value, onChange }: DomainSearchProps) {
    const { t } = useTranslation();

    return (
        <div className="relative max-w-md">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="pr-10 pl-9"
                placeholder={t('domains.searchPlaceholder')}
                aria-label={t('domains.searchAria')}
            />
            {value && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                    onClick={() => onChange('')}
                    aria-label={t('common.clear')}
                >
                    <XIcon />
                </Button>
            )}
        </div>
    );
}
