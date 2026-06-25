import {
    Head,
    router,
    setLayoutProps,
    useForm,
    usePage,
} from '@inertiajs/react';
import { Edit, Plus, Search, Shield, Trash2, UserCheck, X } from 'lucide-react';
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
import {
    assignPermissions,
    assignRoles,
    destroy,
    index,
    store,
    update,
} from '@/routes/users';
import type { User, UsersPageProps } from '../types';

export default function Users() {
    const {
        users,
        roles,
        permissions,
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

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('users.title'),
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

    const clearRoleSearch = () => {
        setRoleSearchTerm('');
    };

    const clearPermissionSearch = () => {
        setPermissionSearchTerm('');
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
        username: '',
        password: '',
        password_confirmation: '',
        email: '',
        phone: '',
    });

    const editForm = useForm({
        name: '',
        username: '',
        password: '',
        password_confirmation: '',
        email: '',
        phone: '',
    });

    const deleteForm = useForm({});

    const rolesForm = useForm({
        roles: [] as string[],
    });

    const permissionsForm = useForm({
        permissions: [] as string[],
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        createForm.post(store().url, {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();

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

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            username: user.username || '',
            password: user.password || '',
            password_confirmation: user.password || '',
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
        rolesForm.setData('roles', user.roles?.map((r) => r.id) || []);
        setRolesModalOpen(true);
    };

    const openPermissionsModal = (user: User) => {
        setSelectedUser(user);
        setPermissionSearchTerm('');
        permissionsForm.setData(
            'permissions',
            user.permissions?.map((p) => p.id) || [],
        );
        setPermissionsModalOpen(true);
    };

    const handleRoleToggle = (roleId: string) => {
        const currentRoles = rolesForm.data.roles;

        if (currentRoles.includes(roleId)) {
            rolesForm.setData(
                'roles',
                currentRoles.filter((id) => id !== roleId),
            );
        } else {
            rolesForm.setData('roles', [...currentRoles, roleId]);
        }
    };

    const handlePermissionToggle = (permissionId: string) => {
        const currentPermissions = permissionsForm.data.permissions;

        if (currentPermissions.includes(permissionId)) {
            permissionsForm.setData(
                'permissions',
                currentPermissions.filter((id) => id !== permissionId),
            );
        } else {
            permissionsForm.setData('permissions', [
                ...currentPermissions,
                permissionId,
            ]);
        }
    };

    const handleAssignRoles = () => {
        if (!selectedUser) {
            return;
        }

        rolesForm.post(assignRoles(selectedUser.id).url, {
            onSuccess: () => {
                setRolesModalOpen(false);
                setSelectedUser(null);
                clearRoleSearch();
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
                clearPermissionSearch();
            },
        });
    };

    // Filter assignable roles and permissions by the dialog search term.
    const filteredRoles = roles.filter((role) =>
        role.name.toLowerCase().includes(roleSearchTerm.toLowerCase()),
    );

    const filteredPermissions = permissions.filter((permission) =>
        permission.name
            .toLowerCase()
            .includes(permissionSearchTerm.toLowerCase()),
    );

    // Toggle every item currently visible in the dialog filter.
    const toggleAllFilteredRoles = () => {
        const allSelected = filteredRoles.every((role) =>
            rolesForm.data.roles.includes(role.id),
        );

        if (allSelected) {
            // Deselect all filtered roles.
            const filteredRoleIds = filteredRoles.map((role) => role.id);
            rolesForm.setData(
                'roles',
                rolesForm.data.roles.filter(
                    (id) => !filteredRoleIds.includes(id),
                ),
            );
        } else {
            // Select all filtered roles not already selected.
            const newRoleIds = filteredRoles.map((role) => role.id);
            const currentRoles = rolesForm.data.roles;
            const uniqueRoles = [...new Set([...currentRoles, ...newRoleIds])];
            rolesForm.setData('roles', uniqueRoles);
        }
    };

    const toggleAllFilteredPermissions = () => {
        const allSelected = filteredPermissions.every((permission) =>
            permissionsForm.data.permissions.includes(permission.id),
        );

        if (allSelected) {
            // Deselect all filtered permissions.
            const filteredPermissionIds = filteredPermissions.map(
                (permission) => permission.id,
            );
            permissionsForm.setData(
                'permissions',
                permissionsForm.data.permissions.filter(
                    (id) => !filteredPermissionIds.includes(id),
                ),
            );
        } else {
            // Select all filtered permissions not already selected.
            const newPermissionIds = filteredPermissions.map(
                (permission) => permission.id,
            );
            const currentPermissions = permissionsForm.data.permissions;
            const uniquePermissions = [
                ...new Set([...currentPermissions, ...newPermissionIds]),
            ];
            permissionsForm.setData('permissions', uniquePermissions);
        }
    };

    return (
        <>
            <Head title={t('users.title')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold" id="users-header">
                        {t('users.heading')}
                    </h1>
                    {can('create users') && (
                        <Dialog
                            open={createModalOpen}
                            onOpenChange={setCreateModalOpen}
                        >
                            <DialogTrigger asChild>
                                <Button id="users-create-btn">
                                    <Plus className="h-4 w-4" />
                                    {t('users.create.button')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {t('users.create.title')}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t('users.create.description')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreate}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="name"
                                                className="text-right"
                                            >
                                                {t('users.form.nameRequired')}
                                            </Label>
                                            <Input
                                                id="name"
                                                value={createForm.data.name}
                                                onChange={(e) =>
                                                    createForm.setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                className="col-span-3"
                                                placeholder={t(
                                                    'users.form.namePlaceholder',
                                                )}
                                                required
                                            />
                                            {createForm.errors.name && (
                                                <div className="col-span-4 text-sm text-red-600">
                                                    {createForm.errors.name}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="email"
                                                className="text-right"
                                            >
                                                {t(
                                                    'users.form.usernameRequired',
                                                )}
                                            </Label>
                                            <Input
                                                id="username"
                                                value={createForm.data.username}
                                                onChange={(e) =>
                                                    createForm.setData(
                                                        'username',
                                                        e.target.value,
                                                    )
                                                }
                                                className="col-span-3"
                                                placeholder={t(
                                                    'users.form.usernamePlaceholder',
                                                )}
                                                required
                                            />
                                            {createForm.errors.username && (
                                                <div className="col-span-4 text-sm text-red-600">
                                                    {createForm.errors.username}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="email"
                                                className="text-right"
                                            >
                                                {t('users.form.email')}
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={createForm.data.email}
                                                onChange={(e) =>
                                                    createForm.setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                className="col-span-3"
                                                placeholder={t(
                                                    'users.form.emailPlaceholder',
                                                )}
                                            />
                                            {createForm.errors.email && (
                                                <div className="col-span-4 text-sm text-red-600">
                                                    {createForm.errors.email}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="phone"
                                                className="text-right"
                                            >
                                                {t('users.form.phone')}
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={createForm.data.phone}
                                                onChange={(e) =>
                                                    createForm.setData(
                                                        'phone',
                                                        e.target.value,
                                                    )
                                                }
                                                className="col-span-3"
                                                placeholder={t(
                                                    'users.form.phonePlaceholder',
                                                )}
                                            />
                                            {createForm.errors.phone && (
                                                <div className="col-span-4 text-sm text-red-600">
                                                    {createForm.errors.phone}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="password"
                                                className="text-right"
                                            >
                                                {t(
                                                    'users.form.passwordRequired',
                                                )}
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={createForm.data.password}
                                                onChange={(e) =>
                                                    createForm.setData(
                                                        'password',
                                                        e.target.value,
                                                    )
                                                }
                                                className="col-span-3"
                                                placeholder="*********"
                                            />
                                            {createForm.errors.password && (
                                                <div className="col-span-4 text-sm text-red-600">
                                                    {createForm.errors.password}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="password_confirmation"
                                                className="text-right"
                                            >
                                                {t(
                                                    'users.form.confirmPasswordRequired',
                                                )}
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={
                                                    createForm.data
                                                        .password_confirmation
                                                }
                                                onChange={(e) =>
                                                    createForm.setData(
                                                        'password_confirmation',
                                                        e.target.value,
                                                    )
                                                }
                                                className="col-span-3"
                                                placeholder="*********"
                                            />
                                            {createForm.errors
                                                .password_confirmation && (
                                                <div className="col-span-4 text-sm text-red-600">
                                                    {
                                                        createForm.errors
                                                            .password_confirmation
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setCreateModalOpen(false)
                                            }
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={createForm.processing}
                                        >
                                            {createForm.processing
                                                ? t('users.create.processing')
                                                : t('users.create.submit')}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Search */}
                <div className="flex items-center gap-4" id="users-search">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            placeholder={t('users.search.placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10 pl-10"
                            aria-label={t('users.search.aria')}
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
                            {users.length === 0
                                ? t('common.noResults')
                                : t('users.search.results', {
                                      count: users.length,
                                  })}
                        </div>
                    )}
                </div>

                <div className="w-full">
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
                                <TableHead className="w-25">ID</TableHead>
                                <TableHead>{t('users.table.name')}</TableHead>
                                <TableHead>{t('users.table.roles')}</TableHead>
                                <TableHead>
                                    {t('users.table.permissions')}
                                </TableHead>
                                <TableHead className="text-right">
                                    {t('common.actions')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.id}
                                    </TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles
                                                ?.slice(0, 2)
                                                .map((role) => (
                                                    <Badge
                                                        key={role.id}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            {user.roles &&
                                                user.roles.length > 2 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="cursor-pointer text-xs"
                                                        onClick={() =>
                                                            openRolesModal(user)
                                                        }
                                                    >
                                                        +{user.roles.length - 2}{' '}
                                                        {t('common.more')}
                                                    </Badge>
                                                )}
                                            {(!user.roles ||
                                                user.roles.length === 0) && (
                                                <span className="text-sm text-muted-foreground">
                                                    {t('roles.empty.none')}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.permissions
                                                ?.slice(0, 2)
                                                .map((permission) => (
                                                    <Badge
                                                        key={permission.id}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {permission.name}
                                                    </Badge>
                                                ))}
                                            {user.permissions &&
                                                user.permissions.length > 2 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="cursor-pointer text-xs"
                                                        onClick={() =>
                                                            openPermissionsModal(
                                                                user,
                                                            )
                                                        }
                                                    >
                                                        +
                                                        {user.permissions
                                                            .length - 2}{' '}
                                                        {t('common.more')}
                                                    </Badge>
                                                )}
                                            {(!user.permissions ||
                                                user.permissions.length ===
                                                    0) && (
                                                <span className="text-sm text-muted-foreground">
                                                    {t(
                                                        'permissions.empty.none',
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {can('update users') && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            openRolesModal(user)
                                                        }
                                                        title={t(
                                                            'users.assignRoles.button',
                                                        )}
                                                        className="text-xs"
                                                    >
                                                        <UserCheck className="h-4 w-4" />
                                                        {t(
                                                            'users.assignRoles.button',
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            openPermissionsModal(
                                                                user,
                                                            )
                                                        }
                                                        title={t(
                                                            'users.assignPermissions.button',
                                                        )}
                                                        className="text-xs"
                                                    >
                                                        <Shield className="h-4 w-4" />
                                                        {t(
                                                            'users.assignPermissions.button',
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            openEditModal(user)
                                                        }
                                                        className="text-xs"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        {t('common.edit')}
                                                    </Button>
                                                </>
                                            )}
                                            {can('delete users') && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        openDeleteModal(user)
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
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        {searchTerm
                                            ? t('users.empty.search', {
                                                  search: searchTerm,
                                              })
                                            : t('users.empty.default')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Edit dialog */}
                <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                        <DialogHeader>
                            <DialogTitle>{t('users.edit.title')}</DialogTitle>
                            <DialogDescription>
                                {t('users.edit.description')}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEdit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="edit-name"
                                        className="text-right"
                                    >
                                        {t('users.form.nameRequired')}
                                    </Label>
                                    <Input
                                        id="edit-name"
                                        value={editForm.data.name}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        className="col-span-3"
                                        placeholder={t(
                                            'users.form.namePlaceholder',
                                        )}
                                        required
                                    />
                                    {editForm.errors.name && (
                                        <div className="col-span-4 text-sm text-red-600">
                                            {editForm.errors.name}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="edit-username"
                                        className="text-right"
                                    >
                                        {t('users.form.usernameRequired')}
                                    </Label>
                                    <Input
                                        id="edit-username"
                                        value={editForm.data.username}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'username',
                                                e.target.value,
                                            )
                                        }
                                        className="col-span-3"
                                        placeholder={t(
                                            'users.form.usernamePlaceholder',
                                        )}
                                        required
                                    />
                                    {editForm.errors.username && (
                                        <div className="col-span-4 text-sm text-red-600">
                                            {editForm.errors.username}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="edit-email"
                                        className="text-right"
                                    >
                                        {t('users.form.email')}
                                    </Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        className="col-span-3"
                                        placeholder={t(
                                            'users.form.emailPlaceholder',
                                        )}
                                    />
                                    {editForm.errors.email && (
                                        <div className="col-span-4 text-sm text-red-600">
                                            {editForm.errors.email}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="edit-phone"
                                        className="text-right"
                                    >
                                        {t('users.form.phone')}
                                    </Label>
                                    <Input
                                        id="edit-phone"
                                        value={editForm.data.phone}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'phone',
                                                e.target.value,
                                            )
                                        }
                                        className="col-span-3"
                                        placeholder={t(
                                            'users.form.phonePlaceholder',
                                        )}
                                    />
                                    {editForm.errors.phone && (
                                        <div className="col-span-4 text-sm text-red-600">
                                            {editForm.errors.phone}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="edit-password"
                                        className="text-right"
                                    >
                                        {t('users.form.passwordRequired')}
                                    </Label>
                                    <Input
                                        id="edit-password"
                                        type="password"
                                        value={editForm.data.password}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        className="col-span-3"
                                        placeholder="*********"
                                    />
                                    {editForm.errors.password && (
                                        <div className="col-span-4 text-sm text-red-600">
                                            {editForm.errors.password}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="edit-password_confirmation"
                                        className="text-right"
                                    >
                                        {t(
                                            'users.form.confirmPasswordRequired',
                                        )}
                                    </Label>
                                    <Input
                                        id="edit-password_confirmation"
                                        type="password"
                                        value={
                                            editForm.data.password_confirmation
                                        }
                                        onChange={(e) =>
                                            editForm.setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        className="col-span-3"
                                        placeholder="*********"
                                    />
                                    {editForm.errors.password_confirmation && (
                                        <div className="col-span-4 text-sm text-red-600">
                                            {
                                                editForm.errors
                                                    .password_confirmation
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditModalOpen(false)}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                >
                                    {editForm.processing
                                        ? t('users.edit.processing')
                                        : t('users.edit.submit')}
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
                            <DialogTitle>{t('users.delete.title')}</DialogTitle>
                            <DialogDescription>
                                {t('users.delete.description', {
                                    name: selectedUser?.name,
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
                                    ? t('users.delete.processing')
                                    : t('common.delete')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Role assignment dialog */}
                <Dialog open={rolesModalOpen} onOpenChange={setRolesModalOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                        <DialogHeader>
                            <DialogTitle>
                                {t('users.assignRoles.title', {
                                    name: selectedUser?.name,
                                })}
                            </DialogTitle>
                            <DialogDescription>
                                {t('users.assignRoles.description')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Role search */}
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                <Input
                                    placeholder={t(
                                        'roles.search.basicPlaceholder',
                                    )}
                                    value={roleSearchTerm}
                                    onChange={(e) =>
                                        setRoleSearchTerm(e.target.value)
                                    }
                                    className="pr-10 pl-10"
                                />
                                {roleSearchTerm && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 transform p-0"
                                        onClick={clearRoleSearch}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {/* Role list */}
                            <div className="rounded-md border">
                                <div className="border-b bg-muted/50 p-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>
                                            {t(
                                                roleSearchTerm
                                                    ? 'roles.count.found'
                                                    : 'roles.count.default',
                                                {
                                                    count: filteredRoles.length,
                                                },
                                            )}
                                        </span>
                                        {filteredRoles.length > 0 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={toggleAllFilteredRoles}
                                                className="h-7 text-xs"
                                            >
                                                {filteredRoles.every((role) =>
                                                    rolesForm.data.roles.includes(
                                                        role.id,
                                                    ),
                                                )
                                                    ? t('common.deselectAll')
                                                    : t('common.selectAll')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="max-h-80 overflow-y-auto p-4">
                                    {filteredRoles.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {filteredRoles.map((role) => (
                                                <div
                                                    key={role.id}
                                                    className="flex items-center space-x-2 rounded-md p-2 transition-colors hover:bg-muted/50"
                                                >
                                                    <Checkbox
                                                        id={`role-${role.id}`}
                                                        checked={rolesForm.data.roles.includes(
                                                            role.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            handleRoleToggle(
                                                                role.id,
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`role-${role.id}`}
                                                        className="flex-1 cursor-pointer text-sm font-normal"
                                                    >
                                                        {role.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-muted-foreground">
                                            {roleSearchTerm
                                                ? t('roles.empty.search', {
                                                      search: roleSearchTerm,
                                                  })
                                                : t('roles.empty.available')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setRolesModalOpen(false);
                                    clearRoleSearch();
                                }}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                onClick={handleAssignRoles}
                                disabled={rolesForm.processing}
                            >
                                {rolesForm.processing
                                    ? t('users.assignRoles.processing')
                                    : t('users.assignRoles.submit')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Permission assignment dialog */}
                <Dialog
                    open={permissionsModalOpen}
                    onOpenChange={setPermissionsModalOpen}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                        <DialogHeader>
                            <DialogTitle>
                                {t('users.assignPermissions.title', {
                                    name: selectedUser?.name,
                                })}
                            </DialogTitle>
                            <DialogDescription>
                                {t('users.assignPermissions.description')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Permission search */}
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                <Input
                                    placeholder={t(
                                        'permissions.search.basicPlaceholder',
                                    )}
                                    value={permissionSearchTerm}
                                    onChange={(e) =>
                                        setPermissionSearchTerm(e.target.value)
                                    }
                                    className="pr-10 pl-10"
                                />
                                {permissionSearchTerm && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 transform p-0"
                                        onClick={clearPermissionSearch}
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
                                                    count: filteredPermissions.length,
                                                },
                                            )}
                                        </span>
                                        {filteredPermissions.length > 0 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={
                                                    toggleAllFilteredPermissions
                                                }
                                                className="h-7 text-xs"
                                            >
                                                {filteredPermissions.every(
                                                    (permission) =>
                                                        permissionsForm.data.permissions.includes(
                                                            permission.id,
                                                        ),
                                                )
                                                    ? t('common.deselectAll')
                                                    : t('common.selectAll')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="max-h-80 overflow-y-auto p-4">
                                    {filteredPermissions.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {filteredPermissions.map(
                                                (permission) => (
                                                    <div
                                                        key={permission.id}
                                                        className="flex items-center space-x-2 rounded-md p-2 transition-colors hover:bg-muted/50"
                                                    >
                                                        <Checkbox
                                                            id={`permission-${permission.id}`}
                                                            checked={permissionsForm.data.permissions.includes(
                                                                permission.id,
                                                            )}
                                                            onCheckedChange={() =>
                                                                handlePermissionToggle(
                                                                    permission.id,
                                                                )
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor={`permission-${permission.id}`}
                                                            className="flex-1 cursor-pointer text-sm font-normal"
                                                        >
                                                            {permission.name}
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
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setPermissionsModalOpen(false);
                                    clearPermissionSearch();
                                }}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                onClick={handleAssignPermissions}
                                disabled={permissionsForm.processing}
                            >
                                {permissionsForm.processing
                                    ? t('users.assignPermissions.processing')
                                    : t('users.assignPermissions.submit')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
