import { Form } from '@inertiajs/react';
import { SendIcon } from 'lucide-react';
import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/use-permissions';
import { store as storeAnnouncement } from '@/routes/manage/tenants/announcements';

import type { Tenant } from '../types';

type TenantAnnouncementFormProps = {
    tenant: Pick<Tenant, 'id' | 'name' | 'slug'>;
    roleOptions: string[];
};

export function TenantAnnouncementForm({
    tenant,
    roleOptions,
}: TenantAnnouncementFormProps) {
    const { t } = useTranslation();
    const { can } = usePermissions();
    const [audience, setAudience] = useState<'all' | 'roles'>('roles');

    if (!can('create tenant announcements')) {
        return null;
    }

    return (
        <Form
            {...storeAnnouncement.form(tenant.id)}
            options={{ preserveScroll: true }}
            resetOnSuccess
            className="flex flex-col gap-6 rounded-md border p-4"
        >
            {({ processing, errors }) => (
                <>
                    <FieldGroup>
                        <Field data-invalid={Boolean(errors.title)}>
                            <FieldLabel htmlFor="announcement-title">
                                {t('tenantAnnouncements.form.titleLabel')}
                            </FieldLabel>
                            <Input
                                id="announcement-title"
                                name="title"
                                maxLength={255}
                                required
                                aria-invalid={Boolean(errors.title)}
                            />
                            <FieldError>{errors.title}</FieldError>
                        </Field>

                        <Field data-invalid={Boolean(errors.body)}>
                            <FieldLabel htmlFor="announcement-body">
                                {t('tenantAnnouncements.form.bodyLabel')}
                            </FieldLabel>
                            <Textarea
                                id="announcement-body"
                                name="body"
                                rows={5}
                                aria-invalid={Boolean(errors.body)}
                            />
                            <FieldError>{errors.body}</FieldError>
                        </Field>

                        <div className="grid gap-5 md:grid-cols-2">
                            <Field data-invalid={Boolean(errors.url)}>
                                <FieldLabel htmlFor="announcement-url">
                                    {t('tenantAnnouncements.form.urlLabel')}
                                </FieldLabel>
                                <Input
                                    id="announcement-url"
                                    name="url"
                                    placeholder={t(
                                        'tenantAnnouncements.form.urlPlaceholder',
                                    )}
                                    aria-invalid={Boolean(errors.url)}
                                />
                                <FieldError>{errors.url}</FieldError>
                            </Field>

                            <Field data-invalid={Boolean(errors.audience)}>
                                <FieldLabel>
                                    {t(
                                        'tenantAnnouncements.form.audienceLabel',
                                    )}
                                </FieldLabel>
                                <Select
                                    name="audience"
                                    value={audience}
                                    onValueChange={(value) =>
                                        setAudience(value as 'all' | 'roles')
                                    }
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        aria-invalid={Boolean(errors.audience)}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="roles">
                                                {t(
                                                    'tenantAnnouncements.form.audienceRoles',
                                                )}
                                            </SelectItem>
                                            <SelectItem value="all">
                                                {t(
                                                    'tenantAnnouncements.form.audienceAll',
                                                )}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldError>{errors.audience}</FieldError>
                            </Field>
                        </div>

                        {audience === 'roles' && (
                            <Field data-invalid={Boolean(errors.roles)}>
                                <FieldLabel>
                                    {t('tenantAnnouncements.form.rolesLabel')}
                                </FieldLabel>
                                <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
                                    {roleOptions.map((role) => (
                                        <label
                                            key={role}
                                            className="flex items-center gap-3 text-sm"
                                        >
                                            <Checkbox
                                                name="roles[]"
                                                value={role}
                                                defaultChecked={[
                                                    'admin',
                                                    'root',
                                                ].includes(role)}
                                            />
                                            <span>{role}</span>
                                        </label>
                                    ))}
                                </div>
                                <FieldError>{errors.roles}</FieldError>
                            </Field>
                        )}
                    </FieldGroup>

                    <div className="flex justify-end">
                        <Button disabled={processing}>
                            <SendIcon data-icon="inline-start" />
                            {t('tenantAnnouncements.form.submit')}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
