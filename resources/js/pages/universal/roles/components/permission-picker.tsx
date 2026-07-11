import { SearchIcon, XIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { Permission } from '../../permissions/types';

type PermissionPickerProps = {
    idPrefix: string;
    permissions: Permission[];
    selectedIds: string[];
    searchTerm: string;
    error?: string;
    onSearchChange: (value: string) => void;
    onSelectionChange: (ids: string[]) => void;
};

export function PermissionPicker({
    idPrefix,
    permissions,
    selectedIds,
    searchTerm,
    error,
    onSearchChange,
    onSelectionChange,
}: PermissionPickerProps) {
    const { t } = useTranslation();
    const normalizedSearch = searchTerm.toLowerCase();
    const filteredPermissions = useMemo(
        () =>
            permissions.filter((permission) =>
                permission.name.toLowerCase().includes(normalizedSearch),
            ),
        [permissions, normalizedSearch],
    );
    const allFilteredSelected =
        filteredPermissions.length > 0 &&
        filteredPermissions.every((permission) =>
            selectedIds.includes(permission.id),
        );

    const togglePermission = (permissionId: string) => {
        if (selectedIds.includes(permissionId)) {
            onSelectionChange(selectedIds.filter((id) => id !== permissionId));

            return;
        }

        onSelectionChange([...selectedIds, permissionId]);
    };

    const toggleFilteredPermissions = () => {
        if (allFilteredSelected) {
            const filteredIds = filteredPermissions.map(
                (permission) => permission.id,
            );
            onSelectionChange(
                selectedIds.filter((id) => !filteredIds.includes(id)),
            );

            return;
        }

        onSelectionChange([
            ...new Set([
                ...selectedIds,
                ...filteredPermissions.map((permission) => permission.id),
            ]),
        ]);
    };

    return (
        <Field data-invalid={!!error}>
            <FieldLabel>{t('roles.form.permissions')}</FieldLabel>
            <FieldDescription>
                {t('permissions.count.selected', {
                    count: selectedIds.length,
                })}
            </FieldDescription>
            <div className="flex flex-col gap-3">
                <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchTerm}
                        onChange={(event) => onSearchChange(event.target.value)}
                        className="pr-10 pl-10"
                        placeholder={t('permissions.search.basicPlaceholder')}
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
                                    ? 'permissions.count.found'
                                    : 'permissions.count.default',
                                { count: filteredPermissions.length },
                            )}
                        </span>
                        {filteredPermissions.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={toggleFilteredPermissions}
                            >
                                {allFilteredSelected
                                    ? t('common.deselectAll')
                                    : t('common.selectAll')}
                            </Button>
                        )}
                    </div>
                    <ScrollArea className="h-72 p-4">
                        {filteredPermissions.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4">
                                {filteredPermissions.map((permission) => (
                                    <label
                                        key={permission.id}
                                        htmlFor={`${idPrefix}-${permission.id}`}
                                        className="flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors hover:bg-muted/50"
                                    >
                                        <Checkbox
                                            id={`${idPrefix}-${permission.id}`}
                                            checked={selectedIds.includes(
                                                permission.id,
                                            )}
                                            onCheckedChange={() =>
                                                togglePermission(permission.id)
                                            }
                                        />
                                        <span className="min-w-0 flex-1 truncate text-sm">
                                            {permission.name}
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
                                            ? t('permissions.empty.search', {
                                                  search: searchTerm,
                                              })
                                            : t('permissions.empty.available')}
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </ScrollArea>
                </div>
            </div>
            {error && <FieldError>{error}</FieldError>}
        </Field>
    );
}
