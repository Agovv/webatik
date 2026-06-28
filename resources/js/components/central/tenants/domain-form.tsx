import { Form } from '@inertiajs/react';
import { PlusIcon, SaveIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
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
import { store as storeGlobalDomain } from '@/routes/manage/domains';
import {
    store as storeDomain,
    update as updateDomain,
} from '@/routes/manage/tenants/domains';
import type { Domain, DomainType, Tenant, TenantOption } from './types';

function randomSubdomain(slug?: string) {
    const suffix = Math.random().toString(36).slice(2, 7);

    return `${slug || 'tenant'}-${suffix}`;
}

function subdomainFromDomain(
    domain: string | undefined,
    centralDomain: string,
) {
    const suffix = `.${centralDomain}`;

    if (domain?.endsWith(suffix)) {
        return domain.slice(0, -suffix.length);
    }

    return '';
}

function domainCountForTenant(tenant?: Tenant | TenantOption) {
    if (!tenant) {
        return 0;
    }

    if ('domains_count' in tenant && typeof tenant.domains_count === 'number') {
        return tenant.domains_count;
    }

    if ('domains' in tenant && Array.isArray(tenant.domains)) {
        return tenant.domains.length;
    }

    return 0;
}

export function DomainForm({
    tenant,
    tenants = [],
    centralDomain,
    domain,
    onSuccess,
}: {
    tenant?: Tenant;
    tenants?: TenantOption[];
    centralDomain: string;
    domain?: Domain;
    onSuccess?: () => void;
}) {
    const { t } = useTranslation();
    const [type, setType] = useState<DomainType>(domain?.type ?? 'auto');
    const [selectedTenantId, setSelectedTenantId] = useState(
        tenant?.id ?? tenants[0]?.id ?? '',
    );
    const selectedTenant = useMemo(
        () =>
            tenant ??
            tenants.find(
                (tenantOption) => tenantOption.id === selectedTenantId,
            ),
        [selectedTenantId, tenant, tenants],
    );
    const selectedTenantDomainCount = domainCountForTenant(selectedTenant);
    const suggestedPrimaryValue =
        !domain && selectedTenantDomainCount === 0 ? '1' : '0';
    const [isPrimary, setIsPrimary] = useState(
        domain?.is_primary ? '1' : suggestedPrimaryValue,
    );
    const [subdomain, setSubdomain] = useState(
        subdomainFromDomain(domain?.domain, centralDomain) ||
            randomSubdomain(selectedTenant?.slug),
    );
    const [customDomain, setCustomDomain] = useState(domain?.domain ?? '');
    const autoDomain = `${subdomain}.${centralDomain}`.toLowerCase();
    const action = domain
        ? updateDomain.form({
              tenant: tenant?.id ?? domain.tenant_id,
              domain: domain.id,
          })
        : tenant
          ? storeDomain.form(tenant.id)
          : storeGlobalDomain.form();

    useEffect(() => {
        if (!domain) {
            setIsPrimary(suggestedPrimaryValue);
        }
    }, [domain, suggestedPrimaryValue]);

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
                        {!tenant && !domain && (
                            <Field data-invalid={Boolean(errors.tenant_id)}>
                                <FieldLabel>
                                    {t('domains.form.tenant')}
                                </FieldLabel>
                                <Select
                                    name="tenant_id"
                                    value={selectedTenantId}
                                    onValueChange={(value) => {
                                        const nextTenant = tenants.find(
                                            (tenantOption) =>
                                                tenantOption.id === value,
                                        );

                                        setSelectedTenantId(value);

                                        if (type === 'auto') {
                                            setSubdomain(
                                                randomSubdomain(
                                                    nextTenant?.slug,
                                                ),
                                            );
                                        }
                                    }}
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        aria-invalid={Boolean(errors.tenant_id)}
                                    >
                                        <SelectValue
                                            placeholder={t(
                                                'domains.form.selectTenant',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {tenants.map((tenantOption) => (
                                                <SelectItem
                                                    key={tenantOption.id}
                                                    value={tenantOption.id}
                                                >
                                                    {tenantOption.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldError>{errors.tenant_id}</FieldError>
                            </Field>
                        )}

                        <Field data-invalid={Boolean(errors.domain)}>
                            <FieldLabel htmlFor="domain-name">
                                {t('domains.form.hostname')}
                            </FieldLabel>
                            {type === 'auto' ? (
                                <>
                                    <div className="flex rounded-md border shadow-xs">
                                        <Input
                                            id="domain-name"
                                            value={subdomain}
                                            onChange={(event) =>
                                                setSubdomain(
                                                    event.target.value
                                                        .toLowerCase()
                                                        .replace(
                                                            /[^a-z0-9-]/g,
                                                            '',
                                                        ),
                                                )
                                            }
                                            className="rounded-r-none border-0 shadow-none focus-visible:ring-0"
                                            placeholder={randomSubdomain(
                                                selectedTenant?.slug,
                                            )}
                                            required
                                            aria-invalid={Boolean(
                                                errors.domain,
                                            )}
                                        />
                                        <span className="flex items-center rounded-r-md border-l bg-muted px-3 text-sm text-muted-foreground">
                                            .{centralDomain}
                                        </span>
                                    </div>
                                    <input
                                        type="hidden"
                                        name="domain"
                                        value={autoDomain}
                                    />
                                </>
                            ) : (
                                <Input
                                    id="domain-name"
                                    name="domain"
                                    value={customDomain}
                                    onChange={(event) =>
                                        setCustomDomain(event.target.value)
                                    }
                                    placeholder={t(
                                        'domains.form.customPlaceholder',
                                    )}
                                    required
                                    aria-invalid={Boolean(errors.domain)}
                                />
                            )}
                            <FieldError>{errors.domain}</FieldError>
                        </Field>

                        <div className="grid gap-5 md:grid-cols-2">
                            <Field data-invalid={Boolean(errors.type)}>
                                <FieldLabel>
                                    {t('domains.form.type')}
                                </FieldLabel>
                                <Select
                                    name="type"
                                    value={type}
                                    onValueChange={(value) =>
                                        setType(value as DomainType)
                                    }
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        aria-invalid={Boolean(errors.type)}
                                    >
                                        <SelectValue
                                            placeholder={t('domains.form.type')}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="auto">
                                                {t('domains.form.auto')}
                                            </SelectItem>
                                            <SelectItem value="custom">
                                                {t('domains.form.custom')}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldError>{errors.type}</FieldError>
                            </Field>

                            <Field data-invalid={Boolean(errors.is_primary)}>
                                <FieldLabel>
                                    {t('domains.form.primary')}
                                </FieldLabel>
                                <Select
                                    name="is_primary"
                                    value={isPrimary}
                                    onValueChange={setIsPrimary}
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        aria-invalid={Boolean(
                                            errors.is_primary,
                                        )}
                                    >
                                        <SelectValue
                                            placeholder={t(
                                                'domains.form.primary',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="1">
                                                {t('common.yes')}
                                            </SelectItem>
                                            <SelectItem value="0">
                                                {t('common.no')}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldError>{errors.is_primary}</FieldError>
                            </Field>
                        </div>

                        <div className="grid gap-5 md:grid-cols-3">
                            <Field data-invalid={Boolean(errors.status)}>
                                <FieldLabel>
                                    {t('domains.form.status')}
                                </FieldLabel>
                                <Select
                                    name="status"
                                    defaultValue={domain?.status ?? 'active'}
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        aria-invalid={Boolean(errors.status)}
                                    >
                                        <SelectValue
                                            placeholder={t(
                                                'domains.form.status',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="pending">
                                                {t('domains.form.pending')}
                                            </SelectItem>
                                            <SelectItem value="active">
                                                {t('domains.form.active')}
                                            </SelectItem>
                                            <SelectItem value="disabled">
                                                {t('domains.form.disabled')}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldError>{errors.status}</FieldError>
                            </Field>

                            <Field data-invalid={Boolean(errors.dns_status)}>
                                <FieldLabel>{t('domains.form.dns')}</FieldLabel>
                                <Select
                                    name="dns_status"
                                    defaultValue={
                                        domain?.dns_status ?? 'verified'
                                    }
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        aria-invalid={Boolean(
                                            errors.dns_status,
                                        )}
                                    >
                                        <SelectValue
                                            placeholder={t('domains.form.dns')}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="pending">
                                                {t('domains.form.pending')}
                                            </SelectItem>
                                            <SelectItem value="verified">
                                                {t('domains.form.verified')}
                                            </SelectItem>
                                            <SelectItem value="failed">
                                                {t('domains.form.failed')}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldError>{errors.dns_status}</FieldError>
                            </Field>

                            <Field data-invalid={Boolean(errors.ssl_status)}>
                                <FieldLabel>{t('domains.form.ssl')}</FieldLabel>
                                <Select
                                    name="ssl_status"
                                    defaultValue={
                                        domain?.ssl_status ?? 'verified'
                                    }
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        aria-invalid={Boolean(
                                            errors.ssl_status,
                                        )}
                                    >
                                        <SelectValue
                                            placeholder={t('domains.form.ssl')}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="pending">
                                                {t('domains.form.pending')}
                                            </SelectItem>
                                            <SelectItem value="verified">
                                                {t('domains.form.verified')}
                                            </SelectItem>
                                            <SelectItem value="failed">
                                                {t('domains.form.failed')}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldError>{errors.ssl_status}</FieldError>
                            </Field>
                        </div>
                    </FieldGroup>

                    <div className="flex justify-end">
                        <Button disabled={processing}>
                            {domain ? (
                                <SaveIcon data-icon="inline-start" />
                            ) : (
                                <PlusIcon data-icon="inline-start" />
                            )}
                            {domain
                                ? t('tenants.edit.submit')
                                : t('domains.create.submit')}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
