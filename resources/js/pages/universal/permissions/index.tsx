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

import { usePermissions } from '@/hooks/use-permissions';
import { destroy, index, store, update } from '@/routes/permissions';

import { PermissionDeleteDialog } from './components/permission-delete-dialog';
import { PermissionFormDialog } from './components/permission-form-dialog';
import { PermissionSearch } from './components/permission-search';
import { PermissionTable } from './components/permission-table';

import type { Permission, PermissionsPageProps } from './types';
import type { FormEvent } from 'react';

export default function Permissions() {
    const {
        permissions,
        filters,
        success,
        errors: pageErrors,
    } = usePage<PermissionsPageProps>().props;
    const { can } = usePermissions();
    const { t } = useTranslation();

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] =
        useState<Permission | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const createForm = useForm({ name: '' });
    const editForm = useForm({ name: '' });
    const deleteForm = useForm({});

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('permissions.title'),
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

        if (!selectedPermission) {
            return;
        }

        editForm.put(update(selectedPermission.id).url, {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedPermission(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!selectedPermission) {
            return;
        }

        deleteForm.delete(destroy(selectedPermission.id).url, {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedPermission(null);
            },
        });
    };

    const openEditModal = (permission: Permission) => {
        setSelectedPermission(permission);
        editForm.setData('name', permission.name);
        setEditModalOpen(true);
    };

    const openDeleteModal = (permission: Permission) => {
        setSelectedPermission(permission);
        setDeleteModalOpen(true);
    };

    return (
        <>
            <Head title={t('permissions.title')} />
            <div className="@container flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 @md:flex-row @md:items-center @md:justify-between">
                    <h1 className="text-2xl font-bold">
                        {t('permissions.heading')}
                    </h1>
                    {can('create permissions') && (
                        <PermissionFormDialog
                            mode="create"
                            open={createModalOpen}
                            form={createForm}
                            onOpenChange={setCreateModalOpen}
                            onSubmit={handleCreate}
                        />
                    )}
                </div>

                <PermissionSearch
                    value={searchTerm}
                    resultCount={permissions.length}
                    inputRef={searchInputRef}
                    onChange={setSearchTerm}
                    onClear={() => setSearchTerm('')}
                />

                <PermissionTable
                    permissions={permissions}
                    searchTerm={searchTerm}
                    canUpdate={can('update permissions')}
                    canDelete={can('delete permissions')}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                />

                <PermissionFormDialog
                    mode="edit"
                    open={editModalOpen}
                    form={editForm}
                    onOpenChange={setEditModalOpen}
                    onSubmit={handleEdit}
                />

                <PermissionDeleteDialog
                    open={deleteModalOpen}
                    permission={selectedPermission}
                    processing={deleteForm.processing}
                    onOpenChange={setDeleteModalOpen}
                    onConfirm={handleDelete}
                />
            </div>
        </>
    );
}
