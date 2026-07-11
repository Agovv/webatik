import { EditIcon, KeyRoundIcon, Trash2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import type { Permission } from '../types';

type PermissionTableProps = {
    permissions: Permission[];
    searchTerm: string;
    canUpdate: boolean;
    canDelete: boolean;
    onEdit: (permission: Permission) => void;
    onDelete: (permission: Permission) => void;
};

export function PermissionTable({
    permissions,
    searchTerm,
    canUpdate,
    canDelete,
    onEdit,
    onDelete,
}: PermissionTableProps) {
    const { t } = useTranslation();

    return (
        <div className="rounded-md border">
            <Table>
                <TableCaption>
                    {searchTerm
                        ? t('permissions.table.searchCaption', {
                              search: searchTerm,
                          })
                        : t('permissions.table.caption')}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-28">ID</TableHead>
                        <TableHead>{t('permissions.table.name')}</TableHead>
                        <TableHead className="text-right">
                            {t('common.actions')}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {permissions.map((permission) => (
                        <TableRow key={permission.id}>
                            <TableCell className="font-medium">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="block w-24 truncate">
                                            {permission.id}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{permission.id}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TableCell>
                            <TableCell>{permission.name}</TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-1">
                                    {canUpdate && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(permission)}
                                        >
                                            <EditIcon data-icon="inline-start" />
                                            {t('common.edit')}
                                        </Button>
                                    )}
                                    {canDelete && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => onDelete(permission)}
                                        >
                                            <Trash2Icon data-icon="inline-start" />
                                            {t('common.delete')}
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {permissions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="py-10">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <KeyRoundIcon />
                                        </EmptyMedia>
                                        <EmptyTitle>
                                            {t('common.noResults')}
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            {searchTerm
                                                ? t(
                                                      'permissions.empty.search',
                                                      {
                                                          search: searchTerm,
                                                      },
                                                  )
                                                : t(
                                                      'permissions.empty.default',
                                                  )}
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
