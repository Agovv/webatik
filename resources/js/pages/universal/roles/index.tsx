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
import { destroy, index, store, update } from '@/routes/roles';

import { RoleDeleteDialog } from './components/role-delete-dialog';
import { RoleFormDialog } from './components/role-form-dialog';
import { RolePermissionsDialog } from './components/role-permissions-dialog';
import { RoleSearch } from './components/role-search';
import { RoleTable } from './components/role-table';

import type { Role, RolesPageProps } from './types';
import type { FormEvent } from 'react';

export default function Roles() {
    const {
        roles,
        permissions,
        tenantLimit,
        filters,
        success,
        errors: pageErrors,
    } = usePage<RolesPageProps>().props;
    const { can } = usePermissions();
    const { t } = useTranslation();

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [createPermissionSearch, setCreatePermissionSearch] = useState('');
    const [editPermissionSearch, setEditPermissionSearch] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const createForm = useForm({
        name: '',
        permissions: [] as string[],
    });
    const editForm = useForm({
        name: '',
        permissions: [] as string[],
    });
    const deleteForm = useForm({});

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('roles.title'),
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
                setCreatePermissionSearch('');
                createForm.reset();
            },
        });
    };

    const handleEdit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedRole) {
            return;
        }

        editForm.put(update(selectedRole.id).url, {
            onSuccess: () => {
                setEditModalOpen(false);
                setEditPermissionSearch('');
                setSelectedRole(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!selectedRole) {
            return;
        }

        deleteForm.delete(destroy(selectedRole.id).url, {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedRole(null);
            },
        });
    };

    const openEditModal = (role: Role) => {
        setSelectedRole(role);
        setEditPermissionSearch('');
        editForm.setData({
            name: role.name,
            permissions: role.permissions.map((permission) => permission.id),
        });
        setEditModalOpen(true);
    };

    const openDeleteModal = (role: Role) => {
        setSelectedRole(role);
        setDeleteModalOpen(true);
    };

    const openPermissionsModal = (role: Role) => {
        setSelectedRole(role);
        setPermissionsModalOpen(true);
    };

    return (
        <>
            <Head title={t('roles.title')} />
            <div className="@container flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 @md:flex-row @md:items-center @md:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold">
                            {t('roles.heading')}
                        </h1>
                        <TenantLimitNotice
                            used={tenantLimit.used}
                            limit={tenantLimit.limit}
                            resource={t('billing.limits.tenant_custom_roles')}
                        />
                    </div>
                    {can('create roles') &&
                        (tenantLimit.allowed ? (
                            <RoleFormDialog
                                mode="create"
                                open={createModalOpen}
                                form={createForm}
                                permissions={permissions}
                                permissionSearchTerm={createPermissionSearch}
                                onPermissionSearchChange={
                                    setCreatePermissionSearch
                                }
                                onOpenChange={setCreateModalOpen}
                                onSubmit={handleCreate}
                            />
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Button disabled>
                                            {t('roles.create.button')}
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {t('tenantLimits.reached', {
                                        used: tenantLimit.used,
                                        limit: tenantLimit.limit ?? 0,
                                        resource: t(
                                            'billing.limits.tenant_custom_roles',
                                        ),
                                    })}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                </div>

                <RoleSearch
                    value={searchTerm}
                    resultCount={roles.length}
                    inputRef={searchInputRef}
                    onChange={setSearchTerm}
                    onClear={() => setSearchTerm('')}
                />

                <RoleTable
                    roles={roles}
                    searchTerm={searchTerm}
                    canUpdate={can('update roles')}
                    canDelete={can('delete roles')}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    onViewPermissions={openPermissionsModal}
                />

                <RoleFormDialog
                    mode="edit"
                    open={editModalOpen}
                    form={editForm}
                    permissions={permissions}
                    permissionSearchTerm={editPermissionSearch}
                    onPermissionSearchChange={setEditPermissionSearch}
                    onOpenChange={setEditModalOpen}
                    onSubmit={handleEdit}
                />

                <RoleDeleteDialog
                    open={deleteModalOpen}
                    role={selectedRole}
                    processing={deleteForm.processing}
                    onOpenChange={setDeleteModalOpen}
                    onConfirm={handleDelete}
                />

                <RolePermissionsDialog
                    open={permissionsModalOpen}
                    role={selectedRole}
                    onOpenChange={setPermissionsModalOpen}
                />
            </div>
        </>
    );
}
