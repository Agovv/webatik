import { Form, Head, Link } from '@inertiajs/react';
import {
    Building2,
    ExternalLink,
    Globe2,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { toInternalUrl } from '@/lib/utils';
import {
    destroy as destroyDomain,
    store as storeDomain,
    update as updateDomain,
} from '@/routes/my-tenants/domains';
import { create as onboardingCreate } from '@/routes/onboarding';
import type { Plan } from '@/types';

type CustomerDomain = {
    id: string;
    domain: string;
    type: 'auto' | 'custom';
    status: string;
    dns_status: string;
    ssl_status: string;
};

type Tenant = {
    id: string;
    name: string;
    billing_access: 'full' | 'read_only' | 'suspended';
    domains: CustomerDomain[];
    domain_limits?: Record<
        string,
        {
            used: number;
            limit: number | null;
            remaining: number | null;
            allowed: boolean;
        }
    >;
};

export default function CustomerTenants({
    tenants,
    plan,
    usage,
    limits,
    canCreateTenant,
}: {
    tenants: Tenant[];
    plan: Plan | null;
    usage: Record<string, number>;
    limits: Record<
        string,
        {
            used: number;
            limit: number | null;
            remaining: number | null;
            allowed: boolean;
        }
    >;
    canCreateTenant: boolean;
}) {
    const { t } = useTranslation();
    const tenantLimit = limits.tenants;
    const tenantLimitMessage = t('billing.limits.reached', {
        resource: t('billing.limits.workspaces'),
        used: tenantLimit?.used ?? usage.tenants ?? 0,
        limit: tenantLimit?.limit ?? 0,
    });

    return (
        <>
            <Head title={t('customerTenants.title')} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {t('customerTenants.heading')}
                        </h1>
                        <p className="text-muted-foreground">
                            {usage.tenants ?? 0} {t('customerTenants.of')}{' '}
                            {plan?.limits.find(
                                (limit) => limit.key === 'tenants',
                            )?.value ?? 0}{' '}
                            {t('billing.limits.used')}
                        </p>
                    </div>
                    {canCreateTenant ? (
                        <Button asChild>
                            <Link href={toInternalUrl(onboardingCreate())}>
                                <Plus />
                                {t('customerTenants.newWorkspace')}
                            </Link>
                        </Button>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button disabled>
                                        <Plus />
                                        {t('customerTenants.newWorkspace')}
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                {tenantLimitMessage}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                    {tenants.map((tenant) => (
                        <CustomerTenantCard
                            key={tenant.id}
                            tenant={tenant}
                            plan={plan}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

function CustomerTenantCard({
    tenant,
    plan,
}: {
    tenant: Tenant;
    plan: Plan | null;
}) {
    const { t } = useTranslation();
    const customDomainPlanLimit =
        plan?.limits.find((limit) => limit.key === 'custom_domains')?.value ??
        0;
    const customDomainUsage = tenant.domains.filter(
        (domain) => domain.type === 'custom',
    ).length;
    const customDomainLimit = tenant.domain_limits?.custom_domains ?? {
        used: customDomainUsage,
        limit: customDomainPlanLimit,
        remaining: Math.max(customDomainPlanLimit - customDomainUsage, 0),
        allowed: customDomainUsage < customDomainPlanLimit,
    };

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="size-5" />
                    {tenant.name}
                </CardTitle>
                <Badge variant="outline">
                    {t(`billing.access.${tenant.billing_access}`)}
                </Badge>
            </CardHeader>
            <CardContent className="grid gap-4">
                {tenant.domains.map((domain) => {
                    const isCustomDomain = domain.type === 'custom';

                    return (
                        <div
                            key={domain.id}
                            className="grid gap-3 rounded-md border p-3 text-sm"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="flex min-w-0 items-center gap-2 font-medium">
                                    <Globe2 className="size-4 shrink-0" />
                                    <span className="truncate">
                                        {domain.domain}
                                    </span>
                                </span>
                                <div className="flex items-center gap-1">
                                    <Badge variant="outline">
                                        {t(
                                            isCustomDomain
                                                ? 'customerTenants.customDomain'
                                                : 'customerTenants.defaultDomain',
                                        )}
                                    </Badge>
                                    <Button asChild variant="ghost" size="icon">
                                        <a
                                            href={`https://${domain.domain}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <ExternalLink />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <DomainState
                                    label={t('customerTenants.dns')}
                                    value={domain.dns_status}
                                />
                                <DomainState
                                    label={t('customerTenants.ssl')}
                                    value={domain.ssl_status}
                                />
                                <DomainState
                                    label={t('customerTenants.status')}
                                    value={domain.status}
                                />
                            </div>
                            {isCustomDomain && (
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Form
                                        {...updateDomain.form({
                                            tenant: tenant.id,
                                            domain: domain.id,
                                        })}
                                        className="flex flex-1 items-start gap-2"
                                        options={{
                                            preserveScroll: true,
                                        }}
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                <Field className="flex-1 gap-1">
                                                    <FieldLabel className="sr-only">
                                                        {t(
                                                            'customerTenants.editDomain',
                                                        )}
                                                    </FieldLabel>
                                                    <Input
                                                        name="domain"
                                                        defaultValue={
                                                            domain.domain
                                                        }
                                                        aria-invalid={Boolean(
                                                            errors.domain,
                                                        )}
                                                    />
                                                    <InputError
                                                        message={errors.domain}
                                                    />
                                                </Field>
                                                <Button
                                                    type="submit"
                                                    variant="outline"
                                                    size="icon"
                                                    disabled={processing}
                                                    aria-label={t(
                                                        'customerTenants.editDomain',
                                                    )}
                                                >
                                                    <Pencil />
                                                </Button>
                                            </>
                                        )}
                                    </Form>
                                    <CustomerDomainDeleteDialog
                                        tenant={tenant}
                                        domain={domain}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
                <Form
                    {...storeDomain.form(tenant.id)}
                    className="flex items-end gap-2"
                >
                    {({ processing, errors }) => (
                        <>
                            <Field className="flex-1">
                                <FieldLabel htmlFor={`domain-${tenant.id}`}>
                                    {t('customerTenants.addCustomDomain')}
                                </FieldLabel>
                                <Input
                                    id={`domain-${tenant.id}`}
                                    name="domain"
                                    placeholder="app.example.com"
                                    aria-invalid={Boolean(errors.domain)}
                                />
                                <InputError message={errors.domain} />
                            </Field>
                            {customDomainLimit.allowed ? (
                                <Button
                                    type="submit"
                                    variant="outline"
                                    disabled={processing}
                                >
                                    {t('customerTenants.add')}
                                </Button>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled
                                            >
                                                {t('customerTenants.add')}
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {t('billing.limits.reached', {
                                            resource: t(
                                                'billing.limits.customDomains',
                                            ),
                                            used: customDomainLimit.used,
                                            limit: customDomainLimit.limit,
                                        })}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}

function DomainState({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid gap-1">
            <span className="text-muted-foreground">{label}</span>
            <Badge className="w-fit capitalize" variant="secondary">
                {value}
            </Badge>
        </div>
    );
}

function CustomerDomainDeleteDialog({
    tenant,
    domain,
}: {
    tenant: Tenant;
    domain: CustomerDomain;
}) {
    const { t } = useTranslation();

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    aria-label={t('customerTenants.deleteDomain')}
                >
                    <Trash2 className="text-destructive" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t('customerTenants.deleteDomain')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('customerTenants.deleteDescription', {
                            domain: domain.domain,
                        })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <Form
                        {...destroyDomain.form({
                            tenant: tenant.id,
                            domain: domain.id,
                        })}
                        options={{ preserveScroll: true }}
                    >
                        {({ processing }) => (
                            <AlertDialogAction
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                            >
                                {t('common.delete')}
                            </AlertDialogAction>
                        )}
                    </Form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
