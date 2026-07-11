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

import type { PermissionFormData } from '../types';
import type { InertiaFormProps } from '@inertiajs/react';
import type { FormEvent } from 'react';

type PermissionFormDialogProps = {
    mode: 'create' | 'edit';
    open: boolean;
    form: InertiaFormProps<PermissionFormData>;
    onOpenChange: (open: boolean) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function PermissionFormDialog({
    mode,
    open,
    form,
    onOpenChange,
    onSubmit,
}: PermissionFormDialogProps) {
    const { t } = useTranslation();
    const isCreate = mode === 'create';
    const fieldId = isCreate ? 'permission-name' : 'edit-permission-name';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {isCreate && (
                <DialogTrigger asChild>
                    <Button>
                        <PlusIcon data-icon="inline-start" />
                        {t('permissions.create.button')}
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {t(
                            isCreate
                                ? 'permissions.create.title'
                                : 'permissions.edit.title',
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            isCreate
                                ? 'permissions.create.description'
                                : 'permissions.edit.description',
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
                                {t('permissions.form.name')}
                            </FieldLabel>
                            <Input
                                id={fieldId}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                placeholder={t('permissions.form.placeholder')}
                                required
                                aria-invalid={!!form.errors.name}
                            />
                            {form.errors.name && (
                                <FieldError>{form.errors.name}</FieldError>
                            )}
                        </Field>
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
                                          ? 'permissions.create.processing'
                                          : 'permissions.edit.processing',
                                  )
                                : t(
                                      isCreate
                                          ? 'permissions.create.submit'
                                          : 'permissions.edit.submit',
                                  )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
