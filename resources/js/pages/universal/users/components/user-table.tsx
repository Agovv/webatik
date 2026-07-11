import {
    EditIcon,
    ShieldIcon,
    Trash2Icon,
    UserCheckIcon,
    UsersIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
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
import type { User } from '../types';

type UserTableProps = {
    users: User[];
    searchTerm: string;
    canUpdate: boolean;
    canDelete: boolean;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    onAssignRoles: (user: User) => void;
    onAssignPermissions: (user: User) => void;
};

export function UserTable({
    users,
    searchTerm,
    canUpdate,
    canDelete,
    onEdit,
    onDelete,
    onAssignRoles,
    onAssignPermissions,
}: UserTableProps) {
    const { t } = useTranslation();

    return (
        <div className="rounded-md border">
            <Table id="users-table">
                <TableCaption>
                    {searchTerm
                        ? t('users.table.searchCaption', {
                              search: searchTerm,
                          })
                        : t('users.table.caption')}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-28">ID</TableHead>
                        <TableHead>{t('users.table.name')}</TableHead>
                        <TableHead>{t('users.table.roles')}</TableHead>
                        <TableHead>{t('users.table.permissions')}</TableHead>
                        <TableHead className="text-right">
                            {t('common.actions')}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="block w-24 truncate">
                                            {user.id}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{user.id}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TableCell>
                            <TableCell>
                                <div className="min-w-40">
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        @{user.username}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <CompactBadges
                                    items={user.roles ?? []}
                                    emptyLabel={t('roles.empty.none')}
                                    moreLabel={t('common.more')}
                                    onMore={() => onAssignRoles(user)}
                                />
                            </TableCell>
                            <TableCell>
                                <CompactBadges
                                    items={user.permissions ?? []}
                                    emptyLabel={t('permissions.empty.none')}
                                    moreLabel={t('common.more')}
                                    onMore={() => onAssignPermissions(user)}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-1">
                                    {canUpdate && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    onAssignRoles(user)
                                                }
                                                title={t(
                                                    'users.assignRoles.button',
                                                )}
                                            >
                                                <UserCheckIcon data-icon="inline-start" />
                                                {t('users.assignRoles.button')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    onAssignPermissions(user)
                                                }
                                                title={t(
                                                    'users.assignPermissions.button',
                                                )}
                                            >
                                                <ShieldIcon data-icon="inline-start" />
                                                {t(
                                                    'users.assignPermissions.button',
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onEdit(user)}
                                            >
                                                <EditIcon data-icon="inline-start" />
                                                {t('common.edit')}
                                            </Button>
                                        </>
                                    )}
                                    {canDelete && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => onDelete(user)}
                                        >
                                            <Trash2Icon data-icon="inline-start" />
                                            {t('common.delete')}
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {users.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="py-10">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <UsersIcon />
                                        </EmptyMedia>
                                        <EmptyTitle>
                                            {t('common.noResults')}
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            {searchTerm
                                                ? t('users.empty.search', {
                                                      search: searchTerm,
                                                  })
                                                : t('users.empty.default')}
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

function CompactBadges({
    items,
    emptyLabel,
    moreLabel,
    onMore,
}: {
    items: Array<{ id: string; name: string }>;
    emptyLabel: string;
    moreLabel: string;
    onMore: () => void;
}) {
    if (items.length === 0) {
        return (
            <span className="text-sm text-muted-foreground">{emptyLabel}</span>
        );
    }

    return (
        <div className="flex flex-wrap gap-1">
            {items.slice(0, 2).map((item) => (
                <Badge key={item.id} variant="secondary">
                    {item.name}
                </Badge>
            ))}
            {items.length > 2 && (
                <Badge
                    variant="outline"
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={onMore}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onMore();
                        }
                    }}
                >
                    +{items.length - 2} {moreLabel}
                </Badge>
            )}
        </div>
    );
}
