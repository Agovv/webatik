import {
    Head,
    router,
    setLayoutProps,
    useForm,
    usePage,
} from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { destroy, index, store, update } from '@/routes/permissions';
import type { Permission, PermissionsPageProps } from '../types';

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

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('permissions.title'),
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
    });

    const editForm = useForm({
        name: '',
    });

    const deleteForm = useForm({});

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
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {t('permissions.heading')}
                    </h1>
                    {can('create permissions') && (
                        <Dialog
                            open={createModalOpen}
                            onOpenChange={setCreateModalOpen}
                        >
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4" />
                                    {t('permissions.create.button')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-5xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {t('permissions.create.title')}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t('permissions.create.description')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreate}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="name"
                                                className="text-right"
                                            >
                                                {t('permissions.form.name')}
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
                                                    'permissions.form.placeholder',
                                                )}
                                                required
                                            />
                                            {createForm.errors.name && (
                                                <div className="col-span-4 text-sm text-red-600">
                                                    {createForm.errors.name}
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
                                                ? t(
                                                      'permissions.create.processing',
                                                  )
                                                : t(
                                                      'permissions.create.submit',
                                                  )}
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
                            placeholder={t('permissions.search.placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10 pl-10"
                            aria-label={t('permissions.search.aria')}
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
                            {permissions.length === 0
                                ? t('common.noResults')
                                : t('permissions.search.results', {
                                      count: permissions.length,
                                  })}
                        </div>
                    )}
                </div>

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
                            <TableHead className="w-25">ID</TableHead>
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
                                    {permission.id}
                                </TableCell>
                                <TableCell>{permission.name}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {can('update permissions') && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    openEditModal(permission)
                                                }
                                                className="text-xs"
                                            >
                                                <Edit className="h-4 w-4" />
                                                {t('common.edit')}
                                            </Button>
                                        )}
                                        {can('delete permissions') && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    openDeleteModal(permission)
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
                        {permissions.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    {searchTerm
                                        ? t('permissions.empty.search', {
                                              search: searchTerm,
                                          })
                                        : t('permissions.empty.default')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Edit dialog */}
                <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                    <DialogContent className="sm:max-w-5xl">
                        <DialogHeader>
                            <DialogTitle>
                                {t('permissions.edit.title')}
                            </DialogTitle>
                            <DialogDescription>
                                {t('permissions.edit.description')}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEdit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="edit-name"
                                        className="text-right"
                                    >
                                        {t('permissions.form.name')}
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
                                        required
                                    />
                                    {editForm.errors.name && (
                                        <div className="col-span-4 text-sm text-red-600">
                                            {editForm.errors.name}
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
                                        ? t('permissions.edit.processing')
                                        : t('permissions.edit.submit')}
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
                            <DialogTitle>
                                {t('permissions.delete.title')}
                            </DialogTitle>
                            <DialogDescription>
                                {t('permissions.delete.description', {
                                    name: selectedPermission?.name,
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
                                    ? t('permissions.delete.processing')
                                    : t('common.delete')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
