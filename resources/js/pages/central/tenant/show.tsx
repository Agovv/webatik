import { Head, Link, setLayoutProps } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    Building2Icon,
    GlobeIcon,
    InfoIcon,
    MailIcon,
    MapPinIcon,
    PhoneIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { index } from '@/actions/App/Http/Controllers/Web/Central/TenantsController';
import { DomainCreateDialog } from '@/components/central/tenants/domain-create-dialog';
import { DomainTable } from '@/components/central/tenants/domain-table';
import { TenantEditDialog } from '@/components/central/tenants/tenant-form-dialog';
import { TenantStatusBadge } from '@/components/central/tenants/tenant-status-badge';
import type { Domain, Tenant } from '@/components/central/tenants/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { usePermissions } from '@/hooks/use-permissions';

function DetailItem({
    label,
    value,
    fallback,
}: {
    label: string;
    value: string | number | null;
    fallback: string;
}) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value || fallback}</p>
        </div>
    );
}

function centralPrimaryDomain(domains: Domain[], centralDomain: string) {
    const centralSuffix = `.${centralDomain}`;

    return (
        domains.find(
            (domain) =>
                domain.is_primary &&
                domain.type === 'auto' &&
                domain.domain.endsWith(centralSuffix),
        ) ??
        domains.find(
            (domain) =>
                domain.type === 'auto' && domain.domain.endsWith(centralSuffix),
        ) ??
        null
    );
}

function CustomDomainInstructions({
    domains,
    centralDomain,
}: {
    domains: Domain[];
    centralDomain: string;
}) {
    const { t } = useTranslation();
    const targetDomain = centralPrimaryDomain(domains, centralDomain);

    return (
        <Alert>
            <InfoIcon />
            <AlertTitle>{t('tenants.show.dns.title')}</AlertTitle>
            <AlertDescription>
                <div className="flex w-full flex-col gap-3">
                    <p>{t('tenants.show.dns.intro')}</p>
                    <div className="grid w-full gap-2 rounded-md border bg-muted/40 p-3 text-sm md:grid-cols-4">
                        <div>
                            <p className="font-medium text-foreground">
                                {t('tenants.show.dns.type')}
                            </p>
                            <p>{t('tenants.show.dns.typeValue')}</p>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">
                                {t('tenants.show.dns.name')}
                            </p>
                            <p>{t('tenants.show.dns.nameValue')}</p>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">
                                {t('tenants.show.dns.target')}
                            </p>
                            <p className="break-all">
                                {targetDomain?.domain ??
                                    t('tenants.show.dns.targetFallback', {
                                        centralDomain,
                                    })}
                            </p>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">
                                {t('tenants.show.dns.ttl')}
                            </p>
                            <p>{t('tenants.show.dns.ttlValue')}</p>
                        </div>
                    </div>
                    <p>{t('tenants.show.dns.outro')}</p>
                </div>
            </AlertDescription>
        </Alert>
    );
}

export default function TenantShow({
    tenant,
    centralDomain,
}: {
    tenant: Tenant;
    centralDomain: string;
}) {
    const { t } = useTranslation();
    const { can } = usePermissions();
    const canReadDomains = can('read domains');
    const canCreateDomains = can('create domains');
    const isSuspended = tenant.status === 'suspended';
    const domains = tenant.domains ?? [];
    const notSet = t('common.notSet');

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('tenants.title'),
                href: index(),
            },
        ],
    });

    return (
        <>
            <Head title={tenant.name} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-muted">
                            {tenant.icon_url ? (
                                <img
                                    src={tenant.icon_url}
                                    alt={tenant.name}
                                    className="size-full rounded-md object-cover object-center"
                                />
                            ) : (
                                <Building2Icon />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="truncate text-2xl font-semibold tracking-tight">
                                    {tenant.name}
                                </h1>
                                <TenantStatusBadge status={tenant.status} />
                            </div>
                            <p className="text-muted-foreground">
                                @{tenant.slug}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href={index()}>
                                <ArrowLeftIcon data-icon="inline-start" />
                                {t('tenants.show.back')}
                            </Link>
                        </Button>
                        <TenantEditDialog tenant={tenant} />
                    </div>
                </div>

                {isSuspended && (
                    <Alert variant="destructive">
                        <InfoIcon />
                        <AlertTitle>
                            {t('tenants.show.suspended.title')}
                        </AlertTitle>
                        <AlertDescription>
                            {t('tenants.show.suspended.description')}
                        </AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardContent className="grid gap-4 px-6 py-2 md:grid-cols-2 xl:grid-cols-5">
                        <DetailItem
                            label={t('tenants.show.industry')}
                            value={tenant.industry}
                            fallback={notSet}
                        />
                        {/* <DetailItem label="Region" value={tenant.region} />
                        <DetailItem
                            label="Created"
                            value={formatDate(tenant.created_at)}
                        />
                        <DetailItem
                            label="Contact"
                            value={tenant.contact_mail}
                        />
                        <DetailItem
                            label="Phone"
                            value={tenant.contact_phone}
                        /> */}
                    </CardContent>
                    {tenant.notes && (
                        <>
                            <Separator />
                            <CardContent className="px-6 py-2 text-sm text-muted-foreground">
                                {tenant.notes}
                            </CardContent>
                        </>
                    )}
                </Card>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {canReadDomains && (
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-3">
                                <CardTitle className="flex-1 text-left text-2xl">
                                    {t('domains.count', {
                                        count: domains.length,
                                    })}
                                </CardTitle>
                                <GlobeIcon />
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                {t('tenants.show.domains')}
                            </CardContent>
                        </Card>
                    )}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3">
                            <CardTitle className="flex-1 text-left">
                                {tenant.region || notSet}
                            </CardTitle>
                            <MapPinIcon />
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            {t('tenants.show.region')}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3">
                            <CardTitle className="flex-1 truncate text-left text-base">
                                {tenant.contact_mail || notSet}
                            </CardTitle>
                            <MailIcon />
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            {t('tenants.show.email')}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3">
                            <CardTitle className="flex-1 truncate text-left text-base">
                                {tenant.contact_phone || notSet}
                            </CardTitle>
                            <PhoneIcon />
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            {t('tenants.show.phone')}
                        </CardContent>
                    </Card>
                </div>

                {canReadDomains && !isSuspended && (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight">
                                    {t('tenants.show.domainsSection.title')}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'tenants.show.domainsSection.description',
                                    )}
                                </p>
                            </div>
                            {canCreateDomains && (
                                <DomainCreateDialog
                                    tenant={tenant}
                                    centralDomain={centralDomain}
                                />
                            )}
                        </div>
                        <CustomDomainInstructions
                            domains={domains}
                            centralDomain={centralDomain}
                        />
                        {domains.length > 0 ? (
                            <DomainTable
                                tenant={tenant}
                                domains={domains}
                                centralDomain={centralDomain}
                            />
                        ) : (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <GlobeIcon />
                                    </EmptyMedia>
                                    <EmptyTitle>
                                        {t('tenants.show.noDomains.title')}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {t(
                                            'tenants.show.noDomains.description',
                                        )}
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
