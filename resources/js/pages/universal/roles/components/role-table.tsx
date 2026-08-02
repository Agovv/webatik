import { EditIcon, ShieldIcon, Trash2Icon } from 'lucide-react';
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

import { RolePermissionBadges } from './role-permission-badges';

import type { Role } from '../types';

type RoleTableProps = {
    roles: Role[];
    searchTerm: string;
    canUpdate: boolean;
    canDelete: boolean;
    onEdit: (role: Role) => void;
    onDelete: (role: Role) => void;
    onViewPermissions: (role: Role) => void;
};

export function RoleTable({
    roles,
    searchTerm,
    canUpdate,
    canDelete,
    onEdit,
    onDelete,
    onViewPermissions,
}: RoleTableProps) {
    const { t } = useTranslation();

    return (
        <div className="rounded-md border">
            <Table>
                <TableCaption>
                    {searchTerm
                        ? t('roles.table.searchCaption', {
                              search: searchTerm,
                          })
                        : t('roles.table.caption')}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-28">ID</TableHead>
                        <TableHead>{t('roles.table.name')}</TableHead>
                        <TableHead>{t('roles.table.permissions')}</TableHead>
                        <TableHead className="text-right">
                            {t('common.actions')}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {roles.map((role) => (
                        <TableRow key={role.id}>
                            <TableCell className="font-medium">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="block w-24 truncate">
                                            {role.id}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{role.id}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TableCell>
                            <TableCell>{role.name}</TableCell>
                            <TableCell>
                                <RolePermissionBadges
                                    permissions={role.permissions}
                                    emptyLabel={t('permissions.empty.none')}
                                    moreLabel={t('common.more')}
                                    onMore={() => onViewPermissions(role)}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onViewPermissions(role)}
                                    >
                                        <ShieldIcon data-icon="inline-start" />
                                        {t('roles.permissions.view')}
                                    </Button>
                                    {canUpdate && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(role)}
                                        >
                                            <EditIcon data-icon="inline-start" />
                                            {t('common.edit')}
                                        </Button>
                                    )}
                                    {canDelete &&
                                        !['root', 'admin'].includes(
                                            role.name,
                                        ) && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => onDelete(role)}
                                            >
                                                <Trash2Icon data-icon="inline-start" />
                                                {t('common.delete')}
                                            </Button>
                                        )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {roles.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="py-10">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <ShieldIcon />
                                        </EmptyMedia>
                                        <EmptyTitle>
                                            {t('common.noResults')}
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            {searchTerm
                                                ? t('roles.empty.search', {
                                                      search: searchTerm,
                                                  })
                                                : t('roles.empty.default')}
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
