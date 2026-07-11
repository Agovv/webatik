import { SearchIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type UserSearchProps = {
    value: string;
    resultCount: number;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (value: string) => void;
    onClear: () => void;
};

export function UserSearch({
    value,
    resultCount,
    inputRef,
    onChange,
    onClear,
}: UserSearchProps) {
    const { t } = useTranslation();

    return (
        <div className="@container" id="users-search">
            <div className="flex flex-col gap-2 @md:flex-row @md:items-center">
                <div className="relative w-full @md:max-w-sm">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        placeholder={t('users.search.placeholder')}
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        className="pr-10 pl-10"
                        aria-label={t('users.search.aria')}
                    />
                    {value && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                            onClick={onClear}
                            aria-label={t('common.clear')}
                        >
                            <XIcon />
                        </Button>
                    )}
                </div>
                {value && (
                    <p className="text-sm text-muted-foreground">
                        {resultCount === 0
                            ? t('common.noResults')
                            : t('users.search.results', {
                                  count: resultCount,
                              })}
                    </p>
                )}
            </div>
        </div>
    );
}
