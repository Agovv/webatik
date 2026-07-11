import { SearchIcon, XIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';

type AssignmentItem = {
    id: string;
    name: string;
};

type AssignmentDialogProps = {
    open: boolean;
    title: string;
    description: string;
    searchPlaceholder: string;
    countDefaultKey: string;
    countFoundKey: string;
    emptyAvailableKey: string;
    emptySearchKey: string;
    submitLabel: string;
    processingLabel: string;
    idPrefix: string;
    items: AssignmentItem[];
    selectedIds: string[];
    searchTerm: string;
    processing: boolean;
    onSearchChange: (value: string) => void;
    onSelectionChange: (ids: string[]) => void;
    onOpenChange: (open: boolean) => void;
    onSubmit: () => void;
};

export function AssignmentDialog({
    open,
    title,
    description,
    searchPlaceholder,
    countDefaultKey,
    countFoundKey,
    emptyAvailableKey,
    emptySearchKey,
    submitLabel,
    processingLabel,
    idPrefix,
    items,
    selectedIds,
    searchTerm,
    processing,
    onSearchChange,
    onSelectionChange,
    onOpenChange,
    onSubmit,
}: AssignmentDialogProps) {
    const { t } = useTranslation();
    const normalizedSearch = searchTerm.toLowerCase();
    const filteredItems = useMemo(
        () =>
            items.filter((item) =>
                item.name.toLowerCase().includes(normalizedSearch),
            ),
        [items, normalizedSearch],
    );
    const allFilteredSelected =
        filteredItems.length > 0 &&
        filteredItems.every((item) => selectedIds.includes(item.id));

    const toggleItem = (itemId: string) => {
        if (selectedIds.includes(itemId)) {
            onSelectionChange(selectedIds.filter((id) => id !== itemId));

            return;
        }

        onSelectionChange([...selectedIds, itemId]);
    };

    const toggleFilteredItems = () => {
        if (allFilteredSelected) {
            const filteredIds = filteredItems.map((item) => item.id);
            onSelectionChange(
                selectedIds.filter((id) => !filteredIds.includes(id)),
            );

            return;
        }

        onSelectionChange([
            ...new Set([
                ...selectedIds,
                ...filteredItems.map((item) => item.id),
            ]),
        ]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="@container max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(event) =>
                                onSearchChange(event.target.value)
                            }
                            className="pr-10 pl-10"
                        />
                        {searchTerm && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                                onClick={() => onSearchChange('')}
                                aria-label={t('common.clear')}
                            >
                                <XIcon />
                            </Button>
                        )}
                    </div>

                    <div className="rounded-md border">
                        <div className="flex flex-col gap-2 border-b bg-muted/50 p-3 text-sm @md:flex-row @md:items-center @md:justify-between">
                            <span>
                                {t(
                                    searchTerm
                                        ? countFoundKey
                                        : countDefaultKey,
                                    {
                                        count: filteredItems.length,
                                    },
                                )}
                            </span>
                            {filteredItems.length > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleFilteredItems}
                                >
                                    {allFilteredSelected
                                        ? t('common.deselectAll')
                                        : t('common.selectAll')}
                                </Button>
                            )}
                        </div>

                        <ScrollArea className="h-72 p-4">
                            {filteredItems.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4">
                                    {filteredItems.map((item) => (
                                        <label
                                            key={item.id}
                                            htmlFor={`${idPrefix}-${item.id}`}
                                            className="flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors hover:bg-muted/50"
                                        >
                                            <Checkbox
                                                id={`${idPrefix}-${item.id}`}
                                                checked={selectedIds.includes(
                                                    item.id,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleItem(item.id)
                                                }
                                            />
                                            <span className="min-w-0 flex-1 truncate text-sm">
                                                {item.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <SearchIcon />
                                        </EmptyMedia>
                                        <EmptyTitle>
                                            {t('common.noResults')}
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            {searchTerm
                                                ? t(emptySearchKey, {
                                                      search: searchTerm,
                                                  })
                                                : t(emptyAvailableKey)}
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            )}
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={onSubmit} disabled={processing}>
                        {processing && <Spinner data-icon="inline-start" />}
                        {processing ? processingLabel : submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
