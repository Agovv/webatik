import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { InfoIcon, MegaphoneIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { index } from '@/actions/App/Http/Controllers/Web/Central/TenantsController';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { toInternalUrl } from '@/lib/utils';
import { show as announcementsShow } from '@/routes/manage/tenants/announcements';

import { TenantDomainsSection } from './components/tenant-domains-section';
import { TenantShowHeader } from './components/tenant-show-header';
import { TenantSummary } from './components/tenant-summary';

import type { Tenant } from './types';

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
    const canReadAnnouncements = can('read tenant announcements');
    const isSuspended = tenant.status === 'suspended';
    const domains = tenant.domains ?? [];

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
                <TenantShowHeader tenant={tenant} />

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

                <TenantSummary
                    tenant={tenant}
                    domains={domains}
                    canReadDomains={canReadDomains}
                />

                {canReadAnnouncements && (
                    <div className="flex flex-col gap-3 border-y py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight">
                                {t('tenants.show.announcements.title')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {t('tenants.show.announcements.description')}
                            </p>
                        </div>
                        <Button asChild variant="outline">
                            <Link
                                href={toInternalUrl(
                                    announcementsShow(tenant.id),
                                )}
                            >
                                <MegaphoneIcon data-icon="inline-start" />
                                {t('tenants.show.announcements.send')}
                            </Link>
                        </Button>
                    </div>
                )}

                {canReadDomains && !isSuspended && (
                    <TenantDomainsSection
                        tenant={tenant}
                        domains={domains}
                        centralDomain={centralDomain}
                        canCreateDomains={canCreateDomains}
                    />
                )}
            </div>
        </>
    );
}
