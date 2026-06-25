import {
    Head,
    router,
    setLayoutProps,
    useForm,
    usePage,
} from '@inertiajs/react';
import { Edit, Plus, Search, Shield, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermissions } from '@/hooks/use-permissions';
import { destroy, index, store, update } from '@/routes/roles';
import type { Role, RolesPageProps } from '../types';

export default function Roles() {
    const {
        roles,
        permissions,
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
    const [permissionSearchTerm, setPermissionSearchTerm] = useState('');
    const [editPermissionSearchTerm, setEditPermissionSearchTerm] =
        useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('roles.title'),
                href: index(),
            },
        ],
    });

    // Focus the search input with Ctrl/Cmd + K.
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Debounce server-side search requests.
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);

            if (searchTerm) {
                params.set('search', searchTerm);
            } else {
                params.delete('search');
            }

            const newUrl =
                window.location.pathname +
                (params.toString() ? '?' + params.toString() : '');
            window.history.replaceState({}, '', newUrl);

            // Only request fresh data when the search differs from the current filter.
            if (searchTerm !== (filters?.search || '')) {
                router.get(
                    index().url,
                    searchTerm ? { search: searchTerm } : {},
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filters?.search]);

    const clearSearch = () => {
        setSearchTerm('');
    };

    // Filter permissions in the create dialog.
    const filteredPermissionsForCreate = permissions.filter((permission) =>
        permission.name
            .toLowerCase()
            .includes(permissionSearchTerm.toLowerCase()),
    );

    // Filter permissions in the edit dialog.
    const filteredPermissionsForEdit = permissions.filter((permission) =>
        permission.name
            .toLowerCase()
            .includes(editPermissionSearchTerm.toLowerCase()),
    );

    const clearPermissionSearch = () => {
        setPermissionSearchTerm('');
    };

    const clearEditPermissionSearch = () => {
        setEditPermissionSearchTerm('');
    };

    // Toggle every permission currently visible in the dialog filter.
    const toggleAllFilteredPermissions = (isEdit: boolean = false) => {
        const filteredPermissions = isEdit
            ? filteredPermissionsForEdit
            : filteredPermissionsForCreate;
        const currentForm = isEdit ? editForm : createForm;
        const setData = isEdit ? editForm.setData : createForm.setData;

        const allSelected = filteredPermissions.every((p) =>
            currentForm.data.permissions.includes(p.id),
        );

        if (allSelected) {
            // Deselect all filtered permissions.
            const newPermissions = currentForm.data.permissions.filter(
                (id) => !filteredPermissions.some((p) => p.id === id),
            );
            setData('permissions', newPermissions);
        } else {
            // Select all filtered permissions.
            const newPermissions = [
                ...new Set([
                    ...currentForm.data.permissions,
                    ...filteredPermissions.map((p) => p.id),
                ]),
            ];
            setData('permissions', newPermissions);
        }
    };

    // Surface server flash and validation messages as toasts.
    useEffect(() => {
        if (success) {
            toast.success(success);
        }

        if (pageErrors && Object.keys(pageErrors).length > 0) {
            const errorMessages = Object.values(pageErrors).flat();
            errorMessages.forEach((error) => {
                if (typeof error === 'string') {
                    toast.error(error);
                }
            });
        }
    }, [success, pageErrors]);

    const createForm = useForm({
        name: '',
        permissions: [] as string[],
    });

    const editForm = useForm({
        name: '',
        permissions: [] as string[],
    });

    const deleteForm = useForm({});

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        createForm.post(store().url, {
            onSuccess: () => {
                setCreateModalOpen(false);
                setPermissionSearchTerm('');
                createForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRole) {
            return;
        }

        editForm.put(update(selectedRole.id).url, {
            onSuccess: () => {
                setEditModalOpen(false);
                setEditPermissionSearchTerm('');
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
        setEditPermissionSearchTerm('');
        editForm.setData({
            name: role.name,
            permissions: role.permissions.map((p) => p.id),
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

    const handlePermissionToggle = (
        permissionId: string,
        form: typeof createForm | typeof editForm,
    ) => {
        const currentPermissions = form.data.permissions;

        if (currentPermissions.includes(permissionId)) {
            form.setData({
                ...form.data,
                permissions: currentPermissions.filter(
                    (id) => id !== permissionId,
                ),
            });
        } else {
            form.setData({
                ...form.data,
                permissions: [...currentPermissions, permissionId],
            });
        }
    };

    return (
        <>
            <Head title={t('roles.title')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{t('roles.heading')}</h1>
                    {can('create roles') && (
                        <Dialog
                            open={createModalOpen}
                            onOpenChange={setCreateModalOpen}
                        >
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4" />
                                    {t('roles.create.button')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-5xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {t('roles.create.title')}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t('roles.create.description')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form
                                    onSubmit={handleCreate}
                                    className="flex h-full flex-col"
                                >
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="name"
                                                className="text-right"
                                            >
                                                {t('roles.form.name')}
                                            </Label>
                                            <Input
                                                id="name"
                                                value={createForm.data.name}
                                                onChange={(e) =>
                                                    createForm.setData({
                                                        ...createForm.data,
                                                        name: e.target.value,
                                                    })
                                                }
                                                className="col-span-3"
                                                placeholder={t(
                                                    'roles.form.placeholder',
                                                )}
                                                required
                                            />
                                            {createForm.errors.name && (
                                                <div className="col-span-4 text-sm text-red-600">
                                                    {createForm.errors.name}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid flex-1 gap-4">
                                            <Label>
                                                {t('roles.form.permissions')}
                                            </Label>

                                            {/* Permission search */}
                                            <div className="relative">
                                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                                <Input
                                                    placeholder={t(
                                                        'permissions.search.basicPlaceholder',
                                                    )}
                                                    value={permissionSearchTerm}
                                                    onChange={(e) =>
                                                        setPermissionSearchTerm(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="pr-10 pl-10"
                                                />
                                                {permissionSearchTerm && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 transform p-0"
                                                        onClick={
                                                            clearPermissionSearch
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Permission list */}
                                            <div className="rounded-md border">
                                                <div className="border-b bg-muted/50 p-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span>
                                                            {t(
                                                                permissionSearchTerm
                                                                    ? 'permissions.count.found'
                                                                    : 'permissions.count.default',
                                                                {
                                                                    count: filteredPermissionsForCreate.length,
                                                                },
                                                            )}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span>
                                                                {t(
                                                                    'permissions.count.selected',
                                                                    {
                                                                        count: createForm
                                                                            .data
                                                                            .permissions
                                                                            .length,
                                                                    },
                                                                )}
                                                            </span>
                                                            {filteredPermissionsForCreate.length >
                                                                0 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        toggleAllFilteredPermissions(
                                                                            false,
                                                                        )
                                                                    }
                                                                    className="h-7 text-xs"
                                                                >
                                                                    {filteredPermissionsForCreate.every(
                                                                        (p) =>
                                                                            createForm.data.permissions.includes(
                                                                                p.id,
                                                                            ),
                                                                    )
                                                                        ? t(
                                                                              'common.deselectAll',
                                                                          )
                                                                        : t(
                                                                              'common.selectAll',
                                                                          )}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="max-h-52 overflow-y-auto p-4">
                                                    {filteredPermissionsForCreate.length >
                                                    0 ? (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {filteredPermissionsForCreate.map(
                                                                (
                                                                    permission,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            permission.id
                                                                        }
                                                                        className="flex items-center space-x-2 rounded-md p-2 transition-colors hover:bg-muted/50"
                                                                    >
                                                                        <Checkbox
                                                                            id={`create-permission-${permission.id}`}
                                                                            checked={createForm.data.permissions.includes(
                                                                                permission.id,
                                                                            )}
                                                                            onCheckedChange={() =>
                                                                                handlePermissionToggle(
                                                                                    permission.id,
                                                                                    createForm,
                                                                                )
                                                                            }
                                                                        />
                                                                        <Label
                                                                            htmlFor={`create-permission-${permission.id}`}
                                                                            className="flex-1 cursor-pointer text-sm font-normal"
                                                                        >
                                                                            {
                                                                                permission.name
                                                                            }
                                                                        </Label>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="py-8 text-center text-muted-foreground">
                                                            {permissionSearchTerm
                                                                ? t(
                                                                      'permissions.empty.search',
                                                                      {
                                                                          search: permissionSearchTerm,
                                                                      },
                                                                  )
                                                                : t(
                                                                      'permissions.empty.available',
                                                                  )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {createForm.errors.permissions && (
                                                <div className="text-sm text-red-600">
                                                    {
                                                        createForm.errors
                                                            .permissions
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <DialogFooter className="mt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setCreateModalOpen(false);
                                                setPermissionSearchTerm('');
                                            }}
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={createForm.processing}
                                        >
                                            {createForm.processing
                                                ? t('roles.create.processing')
                                                : t('roles.create.submit')}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Search */}
                <div className="flex items-center gap-4">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            placeholder={t('roles.search.placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10 pl-10"
                            aria-label={t('roles.search.aria')}
                        />
                        {searchTerm && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 transform p-0"
                                onClick={clearSearch}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    {searchTerm && (
                        <div className="text-sm text-muted-foreground">
                            {roles.length === 0
                                ? t('common.noResults')
                                : t('roles.search.results', {
                                      count: roles.length,
                                  })}
                        </div>
                    )}
                </div>

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
                            <TableHead className="w-25">ID</TableHead>
                            <TableHead>{t('roles.table.name')}</TableHead>
                            <TableHead>
                                {t('roles.table.permissions')}
                            </TableHead>
                            <TableHead className="text-right">
                                {t('common.actions')}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell className="font-medium">
                                    {role.id}
                                </TableCell>
                                <TableCell>{role.name}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {role.permissions
                                            .slice(0, 3)
                                            .map((permission) => (
                                                <Badge
                                                    key={permission.id}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {permission.name}
                                                </Badge>
                                            ))}
                                        {role.permissions.length > 3 && (
                                            <Badge
                                                variant="outline"
                                                className="cursor-pointer text-xs"
                                                onClick={() =>
                                                    openPermissionsModal(role)
                                                }
                                            >
                                                +{role.permissions.length - 3}{' '}
                                                {t('common.more')}
                                            </Badge>
                                        )}
                                        {role.permissions.length === 0 && (
                                            <span className="text-sm text-muted-foreground">
                                                {t('permissions.empty.none')}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                openPermissionsModal(role)
                                            }
                                            className="text-xs"
                                        >
                                            <Shield className="h-4 w-4" />
                                            {t('roles.permissions.view')}
                                        </Button>
                                        {can('update roles') && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    openEditModal(role)
                                                }
                                                className="text-xs"
                                            >
                                                <Edit className="h-4 w-4" />
                                                {t('common.edit')}
                                            </Button>
                                        )}
                                        {can('delete roles') && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    openDeleteModal(role)
                                                }
                                                className="text-xs"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                {t('common.delete')}
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {roles.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    {searchTerm
                                        ? t('roles.empty.search', {
                                              search: searchTerm,
                                          })
                                        : t('roles.empty.default')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Edit dialog */}
                <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                    <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-5xl">
                        <DialogHeader>
                            <DialogTitle>{t('roles.edit.title')}</DialogTitle>
                            <DialogDescription>
                                {t('roles.edit.description')}
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={handleEdit}
                            className="flex h-full flex-col"
                        >
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="edit-name"
                                        className="text-right"
                                    >
                                        {t('roles.form.name')}
                                    </Label>
                                    <Input
                                        id="edit-name"
                                        value={editForm.data.name}
                                        onChange={(e) =>
                                            editForm.setData({
                                                ...editForm.data,
                                                name: e.target.value,
                                            })
                                        }
                                        className="col-span-3"
                                        required
                                    />
                                    {editForm.errors.name && (
                                        <div className="col-span-4 text-sm text-red-600">
                                            {editForm.errors.name}
                                        </div>
                                    )}
                                </div>

                                <div className="grid flex-1 gap-4">
                                    <Label>{t('roles.form.permissions')}</Label>

                                    {/* Permission search */}
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                        <Input
                                            placeholder={t(
                                                'permissions.search.basicPlaceholder',
                                            )}
                                            value={editPermissionSearchTerm}
                                            onChange={(e) =>
                                                setEditPermissionSearchTerm(
                                                    e.target.value,
                                                )
                                            }
                                            className="pr-10 pl-10"
                                        />
                                        {editPermissionSearchTerm && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 transform p-0"
                                                onClick={
                                                    clearEditPermissionSearch
                                                }
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Permission list */}
                                    <div className="rounded-md border">
                                        <div className="border-b bg-muted/50 p-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>
                                                    {t(
                                                        editPermissionSearchTerm
                                                            ? 'permissions.count.found'
                                                            : 'permissions.count.default',
                                                        {
                                                            count: filteredPermissionsForEdit.length,
                                                        },
                                                    )}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span>
                                                        {t(
                                                            'permissions.count.selected',
                                                            {
                                                                count: editForm
                                                                    .data
                                                                    .permissions
                                                                    .length,
                                                            },
                                                        )}
                                                    </span>
                                                    {filteredPermissionsForEdit.length >
                                                        0 && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                toggleAllFilteredPermissions(
                                                                    true,
                                                                )
                                                            }
                                                            className="h-7 text-xs"
                                                        >
                                                            {filteredPermissionsForEdit.every(
                                                                (p) =>
                                                                    editForm.data.permissions.includes(
                                                                        p.id,
                                                                    ),
                                                            )
                                                                ? t(
                                                                      'common.deselectAll',
                                                                  )
                                                                : t(
                                                                      'common.selectAll',
                                                                  )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="max-h-52 overflow-y-auto p-4">
                                            {filteredPermissionsForEdit.length >
                                            0 ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    {filteredPermissionsForEdit.map(
                                                        (permission) => (
                                                            <div
                                                                key={
                                                                    permission.id
                                                                }
                                                                className="flex items-center space-x-2 rounded-md p-2 transition-colors hover:bg-muted/50"
                                                            >
                                                                <Checkbox
                                                                    id={`edit-permission-${permission.id}`}
                                                                    checked={editForm.data.permissions.includes(
                                                                        permission.id,
                                                                    )}
                                                                    onCheckedChange={() =>
                                                                        handlePermissionToggle(
                                                                            permission.id,
                                                                            editForm,
                                                                        )
                                                                    }
                                                                />
                                                                <Label
                                                                    htmlFor={`edit-permission-${permission.id}`}
                                                                    className="flex-1 cursor-pointer text-sm font-normal"
                                                                >
                                                                    {
                                                                        permission.name
                                                                    }
                                                                </Label>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center text-muted-foreground">
                                                    {editPermissionSearchTerm
                                                        ? t(
                                                              'permissions.empty.search',
                                                              {
                                                                  search: editPermissionSearchTerm,
                                                              },
                                                          )
                                                        : t(
                                                              'permissions.empty.available',
                                                          )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {editForm.errors.permissions && (
                                        <div className="text-sm text-red-600">
                                            {editForm.errors.permissions}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter className="mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditModalOpen(false);
                                        setEditPermissionSearchTerm('');
                                    }}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                >
                                    {editForm.processing
                                        ? t('roles.edit.processing')
                                        : t('roles.edit.submit')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete dialog */}
                <Dialog
                    open={deleteModalOpen}
                    onOpenChange={setDeleteModalOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('roles.delete.title')}</DialogTitle>
                            <DialogDescription>
                                {t('roles.delete.description', {
                                    name: selectedRole?.name,
                                })}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDeleteModalOpen(false)}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleteForm.processing}
                            >
                                {deleteForm.processing
                                    ? t('roles.delete.processing')
                                    : t('common.delete')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Permissions dialog */}
                <Dialog
                    open={permissionsModalOpen}
                    onOpenChange={setPermissionsModalOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {t('roles.permissions.title', {
                                    name: selectedRole?.name,
                                })}
                            </DialogTitle>
                            <DialogDescription>
                                {t('roles.permissions.description')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-64 overflow-y-auto">
                            {selectedRole?.permissions &&
                            selectedRole.permissions.length > 0 ? (
                                <div className="grid gap-2">
                                    {selectedRole.permissions.map(
                                        (permission) => (
                                            <div
                                                key={permission.id}
                                                className="flex items-center gap-2 rounded-md bg-muted/50 p-2"
                                            >
                                                <Shield className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {permission.name}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    {t('roles.permissions.empty')}
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => setPermissionsModalOpen(false)}
                            >
                                {t('common.close')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
