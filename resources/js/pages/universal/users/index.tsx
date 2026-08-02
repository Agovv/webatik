import {
    Head,
    router,
    setLayoutProps,
    useForm,
    usePage,
} from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { TenantLimitNotice } from '@/components/tenant-limit-notice';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePermissions } from '@/hooks/use-permissions';
import {
    assignPermissions,
    assignRoles,
    destroy,
    index,
    store,
    update,
} from '@/routes/users';

import { AssignmentDialog } from './components/assignment-dialog';
import { UserDeleteDialog } from './components/user-delete-dialog';
import { UserFormDialog } from './components/user-form-dialog';
import { UserSearch } from './components/user-search';
import { UserTable } from './components/user-table';

import type { User, UsersPageProps } from './types';
import type { FormEvent } from 'react';

const userFormDefaults = {
    name: '',
    username: '',
    password: '',
    password_confirmation: '',
    email: '',
    phone: '',
};

export default function Users() {
    const {
        users,
        roles,
        permissions,
        currentUserId,
        isRoot,
        tenantLimit,
        filters,
        success,
        errors: pageErrors,
    } = usePage<UsersPageProps>().props;
    const { can } = usePermissions();
    const { t } = useTranslation();

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [rolesModalOpen, setRolesModalOpen] = useState(false);
    const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [roleSearchTerm, setRoleSearchTerm] = useState('');
    const [permissionSearchTerm, setPermissionSearchTerm] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const createForm = useForm(userFormDefaults);
    const editForm = useForm(userFormDefaults);
    const deleteForm = useForm({});
    const rolesForm = useForm({ roles: [] as string[] });
    const permissionsForm = useForm({ permissions: [] as string[] });

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('users.title'),
                href: index(),
            },
        ],
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            if (searchTerm === (filters?.search || '')) {
                return;
            }

            router.get(index().url, searchTerm ? { search: searchTerm } : {}, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);

        return () => window.clearTimeout(timeoutId);
    }, [searchTerm, filters?.search]);

    useEffect(() => {
        if (success) {
            toast.success(success);
        }

        if (pageErrors && Object.keys(pageErrors).length > 0) {
            Object.values(pageErrors)
                .flat()
                .forEach((error) => {
                    if (typeof error === 'string') {
                        toast.error(error);
                    }
                });
        }
    }, [success, pageErrors]);

    const handleCreate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        createForm.post(store().url, {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedUser) {
            return;
        }

        editForm.put(update(selectedUser.id).url, {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedUser(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!selectedUser) {
            return;
        }

        deleteForm.delete(destroy(selectedUser.id).url, {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedUser(null);
            },
        });
    };

    const handleAssignRoles = () => {
        if (!selectedUser) {
            return;
        }

        rolesForm.post(assignRoles(selectedUser.id).url, {
            onSuccess: () => {
                setRolesModalOpen(false);
                setSelectedUser(null);
                setRoleSearchTerm('');
            },
        });
    };

    const handleAssignPermissions = () => {
        if (!selectedUser) {
            return;
        }

        permissionsForm.post(assignPermissions(selectedUser.id).url, {
            onSuccess: () => {
                setPermissionsModalOpen(false);
                setSelectedUser(null);
                setPermissionSearchTerm('');
            },
        });
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            username: user.username || '',
            password: '',
            password_confirmation: '',
            email: user.email || '',
            phone: user.phone || '',
        });
        setEditModalOpen(true);
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    const openRolesModal = (user: User) => {
        setSelectedUser(user);
        setRoleSearchTerm('');
        rolesForm.setData('roles', user.roles?.map((role) => role.id) || []);
        setRolesModalOpen(true);
    };

    const openPermissionsModal = (user: User) => {
        setSelectedUser(user);
        setPermissionSearchTerm('');
        permissionsForm.setData(
            'permissions',
            user.permissions?.map((permission) => permission.id) || [],
        );
        setPermissionsModalOpen(true);
    };

    return (
        <>
            <Head title={t('users.title')} />
            <div className="@container flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 @md:flex-row @md:items-center @md:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold" id="users-header">
                            {t('users.heading')}
                        </h1>
                        <TenantLimitNotice
                            used={tenantLimit.used}
                            limit={tenantLimit.limit}
                            resource={t('billing.limits.tenant_users')}
                        />
                    </div>
                    {can('create users') &&
                        (tenantLimit.allowed ? (
                            <UserFormDialog
                                mode="create"
                                open={createModalOpen}
                                form={createForm}
                                onOpenChange={setCreateModalOpen}
                                onSubmit={handleCreate}
                            />
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Button disabled>
                                            {t('users.create.button')}
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {t('tenantLimits.reached', {
                                        used: tenantLimit.used,
                                        limit: tenantLimit.limit ?? 0,
                                        resource: t(
                                            'billing.limits.tenant_users',
                                        ),
                                    })}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                </div>

                <UserSearch
                    value={searchTerm}
                    resultCount={users.length}
                    inputRef={searchInputRef}
                    onChange={setSearchTerm}
                    onClear={() => setSearchTerm('')}
                />

                <UserTable
                    users={users}
                    searchTerm={searchTerm}
                    canUpdate={can('update users')}
                    canDelete={can('delete users')}
                    currentUserId={currentUserId}
                    isRoot={isRoot}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    onAssignRoles={openRolesModal}
                    onAssignPermissions={openPermissionsModal}
                />

                <UserFormDialog
                    mode="edit"
                    open={editModalOpen}
                    form={editForm}
                    usernameLocked={selectedUser?.usernameLocked ?? false}
                    onOpenChange={setEditModalOpen}
                    onSubmit={handleEdit}
                />

                <UserDeleteDialog
                    open={deleteModalOpen}
                    user={selectedUser}
                    processing={deleteForm.processing}
                    onOpenChange={setDeleteModalOpen}
                    onConfirm={handleDelete}
                />

                <AssignmentDialog
                    open={rolesModalOpen}
                    title={t('users.assignRoles.title', {
                        name: selectedUser?.name,
                    })}
                    description={t('users.assignRoles.description')}
                    searchPlaceholder={t('roles.search.basicPlaceholder')}
                    countDefaultKey="roles.count.default"
                    countFoundKey="roles.count.found"
                    emptyAvailableKey="roles.empty.available"
                    emptySearchKey="roles.empty.search"
                    submitLabel={t('users.assignRoles.submit')}
                    processingLabel={t('users.assignRoles.processing')}
                    idPrefix="assign-role"
                    items={roles}
                    selectedIds={rolesForm.data.roles}
                    searchTerm={roleSearchTerm}
                    processing={rolesForm.processing}
                    onSearchChange={setRoleSearchTerm}
                    onSelectionChange={(ids) => rolesForm.setData('roles', ids)}
                    onOpenChange={setRolesModalOpen}
                    onSubmit={handleAssignRoles}
                />

                <AssignmentDialog
                    open={permissionsModalOpen}
                    title={t('users.assignPermissions.title', {
                        name: selectedUser?.name,
                    })}
                    description={t('users.assignPermissions.description')}
                    searchPlaceholder={t('permissions.search.basicPlaceholder')}
                    countDefaultKey="permissions.count.default"
                    countFoundKey="permissions.count.found"
                    emptyAvailableKey="permissions.empty.available"
                    emptySearchKey="permissions.empty.search"
                    submitLabel={t('users.assignPermissions.submit')}
                    processingLabel={t('users.assignPermissions.processing')}
                    idPrefix="assign-permission"
                    items={permissions}
                    selectedIds={permissionsForm.data.permissions}
                    searchTerm={permissionSearchTerm}
                    processing={permissionsForm.processing}
                    onSearchChange={setPermissionSearchTerm}
                    onSelectionChange={(ids) =>
                        permissionsForm.setData('permissions', ids)
                    }
                    onOpenChange={setPermissionsModalOpen}
                    onSubmit={handleAssignPermissions}
                />
            </div>
        </>
    );
}
