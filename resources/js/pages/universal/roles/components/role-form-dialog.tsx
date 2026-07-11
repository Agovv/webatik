import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

import { PermissionPicker } from './permission-picker';

import type { Permission } from '../../permissions/types';
import type { RoleFormData } from '../types';
import type { InertiaFormProps } from '@inertiajs/react';
import type { FormEvent } from 'react';

type RoleFormDialogProps = {
    mode: 'create' | 'edit';
    open: boolean;
    form: InertiaFormProps<RoleFormData>;
    permissions: Permission[];
    permissionSearchTerm: string;
    onPermissionSearchChange: (value: string) => void;
    onOpenChange: (open: boolean) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function RoleFormDialog({
    mode,
    open,
    form,
    permissions,
    permissionSearchTerm,
    onPermissionSearchChange,
    onOpenChange,
    onSubmit,
}: RoleFormDialogProps) {
    const { t } = useTranslation();
    const isCreate = mode === 'create';
    const fieldId = isCreate ? 'role-name' : 'edit-role-name';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {isCreate && (
                <DialogTrigger asChild>
                    <Button>
                        <PlusIcon data-icon="inline-start" />
                        {t('roles.create.button')}
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="@container max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>
                        {t(
                            isCreate
                                ? 'roles.create.title'
                                : 'roles.edit.title',
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            isCreate
                                ? 'roles.create.description'
                                : 'roles.edit.description',
                        )}
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={onSubmit}
                    className="flex flex-col gap-6 inert:pointer-events-none inert:opacity-50"
                >
                    <FieldGroup>
                        <Field data-invalid={!!form.errors.name}>
                            <FieldLabel htmlFor={fieldId}>
                                {t('roles.form.name')}
                            </FieldLabel>
                            <Input
                                id={fieldId}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                placeholder={t('roles.form.placeholder')}
                                required
                                aria-invalid={!!form.errors.name}
                            />
                            {form.errors.name && (
                                <FieldError>{form.errors.name}</FieldError>
                            )}
                        </Field>
                        <PermissionPicker
                            idPrefix={
                                isCreate
                                    ? 'create-role-permission'
                                    : 'edit-role-permission'
                            }
                            permissions={permissions}
                            selectedIds={form.data.permissions}
                            searchTerm={permissionSearchTerm}
                            error={form.errors.permissions}
                            onSearchChange={onPermissionSearchChange}
                            onSelectionChange={(ids) =>
                                form.setData('permissions', ids)
                            }
                        />
                    </FieldGroup>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && (
                                <Spinner data-icon="inline-start" />
                            )}
                            {form.processing
                                ? t(
                                      isCreate
                                          ? 'roles.create.processing'
                                          : 'roles.edit.processing',
                                  )
                                : t(
                                      isCreate
                                          ? 'roles.create.submit'
                                          : 'roles.edit.submit',
                                  )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
