import { Form } from '@inertiajs/react';
import { Building2Icon, SaveIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import type { Tenant } from '../types';

type FormRoute = {
    action: string;
    method: 'get' | 'post';
};

type TenantFormProps = {
    action: FormRoute;
    tenant?: Tenant;
    submitLabel: string;
    onSuccess?: () => void;
};

const provisioningMessages = [
    'Estamos preparando el espacio de trabajo...',
    'Compilando la arquitectura inicial...',
    'Provisionando la base de datos del tenant...',
    'Sincronizando rutas, permisos y configuración...',
    'Calentando servicios y ensamblando el runtime...',
];

export function TenantForm({
    action,
    tenant,
    submitLabel,
    onSuccess,
}: TenantFormProps) {
    const { t } = useTranslation();
    const [removeIcon, setRemoveIcon] = useState(false);
    const [messageIndex, setMessageIndex] = useState(0);
    const isEditing = Boolean(tenant);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setMessageIndex(
                (current) => (current + 1) % provisioningMessages.length,
            );
        }, 1800);

        return () => window.clearInterval(interval);
    }, []);

    return (
        <Form
            {...action}
            onSuccess={onSuccess}
            options={{
                preserveScroll: true,
            }}
            className="flex flex-col gap-6"
        >
            {({ processing, errors }) => (
                <>
                    <FieldGroup>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field data-invalid={Boolean(errors.name)}>
                                <FieldLabel htmlFor="tenant-name">
                                    {t('tenants.form.name')}
                                </FieldLabel>
                                <Input
                                    id="tenant-name"
                                    name="name"
                                    defaultValue={tenant?.name}
                                    placeholder={t(
                                        'tenants.form.namePlaceholder',
                                    )}
                                    required
                                    aria-invalid={Boolean(errors.name)}
                                />
                                <FieldError>{errors.name}</FieldError>
                            </Field>

                            {isEditing && (
                                <Field data-invalid={Boolean(errors.slug)}>
                                    <FieldLabel htmlFor="tenant-slug">
                                        {t('tenants.form.slug')}
                                    </FieldLabel>
                                    <Input
                                        id="tenant-slug"
                                        name="slug"
                                        defaultValue={tenant?.slug}
                                        placeholder={t(
                                            'tenants.form.slugPlaceholder',
                                        )}
                                        required
                                        aria-invalid={Boolean(errors.slug)}
                                    />
                                    <FieldError>{errors.slug}</FieldError>
                                </Field>
                            )}
                        </div>

                        <div className="grid gap-5 md:grid-cols-3">
                            <Field data-invalid={Boolean(errors.status)}>
                                <FieldLabel>
                                    {t('tenants.form.status')}
                                </FieldLabel>
                                <Select
                                    name="status"
                                    defaultValue={tenant?.status ?? 'trial'}
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        aria-invalid={Boolean(errors.status)}
                                    >
                                        <SelectValue
                                            placeholder={t(
                                                'tenants.form.status',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="active">
                                                {t('tenants.form.active')}
                                            </SelectItem>
                                            <SelectItem value="trial">
                                                {t('tenants.form.trial')}
                                            </SelectItem>
                                            <SelectItem value="suspended">
                                                {t('tenants.form.suspended')}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldError>{errors.status}</FieldError>
                            </Field>

                            <Field data-invalid={Boolean(errors.region)}>
                                <FieldLabel htmlFor="tenant-region">
                                    {t('tenants.form.region')}
                                </FieldLabel>
                                <Input
                                    id="tenant-region"
                                    name="region"
                                    defaultValue={tenant?.region ?? ''}
                                    placeholder={t(
                                        'tenants.form.regionPlaceholder',
                                    )}
                                    aria-invalid={Boolean(errors.region)}
                                />
                                <FieldError>{errors.region}</FieldError>
                            </Field>

                            <Field data-invalid={Boolean(errors.industry)}>
                                <FieldLabel htmlFor="tenant-industry">
                                    {t('tenants.form.industry')}
                                </FieldLabel>
                                <Input
                                    id="tenant-industry"
                                    name="industry"
                                    defaultValue={tenant?.industry ?? ''}
                                    placeholder={t(
                                        'tenants.form.industryPlaceholder',
                                    )}
                                    aria-invalid={Boolean(errors.industry)}
                                />
                                <FieldError>{errors.industry}</FieldError>
                            </Field>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <Field data-invalid={Boolean(errors.contact_mail)}>
                                <FieldLabel htmlFor="tenant-email">
                                    {t('tenants.form.contactEmail')}
                                </FieldLabel>
                                <Input
                                    id="tenant-email"
                                    type="email"
                                    name="contact_mail"
                                    defaultValue={tenant?.contact_mail ?? ''}
                                    placeholder={t(
                                        'tenants.form.emailPlaceholder',
                                    )}
                                    aria-invalid={Boolean(errors.contact_mail)}
                                />
                                <FieldError>{errors.contact_mail}</FieldError>
                            </Field>

                            <Field data-invalid={Boolean(errors.contact_phone)}>
                                <FieldLabel htmlFor="tenant-phone">
                                    {t('tenants.form.contactPhone')}
                                </FieldLabel>
                                <Input
                                    id="tenant-phone"
                                    name="contact_phone"
                                    type="tel"
                                    defaultValue={tenant?.contact_phone ?? ''}
                                    placeholder={t(
                                        'tenants.form.phonePlaceholder',
                                    )}
                                    aria-invalid={Boolean(errors.contact_phone)}
                                />
                                <FieldError>{errors.contact_phone}</FieldError>
                            </Field>
                        </div>

                        <Field data-invalid={Boolean(errors.icon_path)}>
                            <FieldLabel htmlFor="tenant-icon">
                                {t('tenants.form.icon')}
                            </FieldLabel>
                            {tenant?.icon_url && (
                                <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
                                        <img
                                            src={tenant.icon_url}
                                            alt={tenant.name}
                                            className="size-full rounded-md object-cover object-center"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {t('tenants.form.currentIcon')}
                                        </p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {tenant.icon_path}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {!tenant?.icon_url && (
                                <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
                                        <Building2Icon />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('tenants.form.noIcon')}
                                    </p>
                                </div>
                            )}
                            <Input
                                id="tenant-icon"
                                name="icon_path"
                                type="file"
                                accept="image/*"
                                disabled={removeIcon}
                                aria-invalid={Boolean(errors.icon_path)}
                            />
                            {tenant?.icon_url && (
                                <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
                                    <Checkbox
                                        checked={removeIcon}
                                        onCheckedChange={(checked) =>
                                            setRemoveIcon(checked === true)
                                        }
                                        aria-label={t(
                                            'tenants.form.removeIconAria',
                                        )}
                                    />
                                    <span>{t('tenants.form.removeIcon')}</span>
                                </label>
                            )}
                            <input
                                type="hidden"
                                name="remove_icon"
                                value={removeIcon ? '1' : '0'}
                            />
                            <FieldError>{errors.icon_path}</FieldError>
                        </Field>

                        <Field data-invalid={Boolean(errors.notes)}>
                            <FieldLabel htmlFor="tenant-notes">
                                {t('tenants.form.notes')}
                            </FieldLabel>
                            <Textarea
                                id="tenant-notes"
                                name="notes"
                                defaultValue={tenant?.notes ?? ''}
                                placeholder={t('tenants.form.notesPlaceholder')}
                                aria-invalid={Boolean(errors.notes)}
                            />
                            <FieldError>{errors.notes}</FieldError>
                        </Field>
                    </FieldGroup>

                    <div className="flex justify-end">
                        <Button disabled={processing}>
                            {processing && !isEditing ? (
                                <Spinner data-icon="inline-start" />
                            ) : (
                                <SaveIcon data-icon="inline-start" />
                            )}
                            {processing && !isEditing
                                ? provisioningMessages[messageIndex]
                                : submitLabel}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
