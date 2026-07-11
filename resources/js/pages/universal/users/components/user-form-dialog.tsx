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

import type { UserFormData } from '../types';
import type { InertiaFormProps } from '@inertiajs/react';
import type { FormEvent } from 'react';

type UserField = {
    name: keyof UserFormData;
    type?: string;
    labelKey: string;
    placeholderKey?: string;
    required?: boolean;
};

const fields: UserField[] = [
    {
        name: 'name',
        labelKey: 'users.form.nameRequired',
        placeholderKey: 'users.form.namePlaceholder',
        required: true,
    },
    {
        name: 'username',
        labelKey: 'users.form.usernameRequired',
        placeholderKey: 'users.form.usernamePlaceholder',
        required: true,
    },
    {
        name: 'email',
        type: 'email',
        labelKey: 'users.form.email',
        placeholderKey: 'users.form.emailPlaceholder',
        required: true,
    },
    {
        name: 'phone',
        type: 'tel',
        labelKey: 'users.form.phone',
        placeholderKey: 'users.form.phonePlaceholder',
    },
    {
        name: 'password',
        type: 'password',
        labelKey: 'users.form.passwordRequired',
        placeholderKey: '*********',
    },
    {
        name: 'password_confirmation',
        type: 'password',
        labelKey: 'users.form.confirmPasswordRequired',
        placeholderKey: '*********',
    },
];

type UserFormDialogProps = {
    mode: 'create' | 'edit';
    open: boolean;
    form: InertiaFormProps<UserFormData>;
    onOpenChange: (open: boolean) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function UserFormDialog({
    mode,
    open,
    form,
    onOpenChange,
    onSubmit,
}: UserFormDialogProps) {
    const { t } = useTranslation();
    const isCreate = mode === 'create';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {isCreate && (
                <DialogTrigger asChild>
                    <Button id="users-create-btn">
                        <PlusIcon data-icon="inline-start" />
                        {t('users.create.button')}
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="@container max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>
                        {t(
                            isCreate
                                ? 'users.create.title'
                                : 'users.edit.title',
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            isCreate
                                ? 'users.create.description'
                                : 'users.edit.description',
                        )}
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={onSubmit}
                    className="flex flex-col gap-6 inert:pointer-events-none inert:opacity-50"
                >
                    <FieldGroup className="@3xl:grid @3xl:grid-cols-2">
                        {fields.map((field) => {
                            const inputId = `${mode}-user-${field.name}`;
                            const error = form.errors[field.name];
                            const placeholder =
                                field.placeholderKey?.startsWith('users.')
                                    ? t(field.placeholderKey)
                                    : field.placeholderKey;

                            return (
                                <Field key={field.name} data-invalid={!!error}>
                                    <FieldLabel htmlFor={inputId}>
                                        {t(field.labelKey)}
                                    </FieldLabel>
                                    <Input
                                        id={inputId}
                                        type={field.type}
                                        value={form.data[field.name]}
                                        onChange={(event) =>
                                            form.setData(
                                                field.name,
                                                event.target.value,
                                            )
                                        }
                                        placeholder={placeholder}
                                        required={field.required}
                                        aria-invalid={!!error}
                                    />
                                    {error && <FieldError>{error}</FieldError>}
                                </Field>
                            );
                        })}
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
                                          ? 'users.create.processing'
                                          : 'users.edit.processing',
                                  )
                                : t(
                                      isCreate
                                          ? 'users.create.submit'
                                          : 'users.edit.submit',
                                  )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
