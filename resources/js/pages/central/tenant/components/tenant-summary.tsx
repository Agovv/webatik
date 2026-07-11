import { GlobeIcon, MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { TenantDetailItem } from './tenant-detail-item';

import type { Domain, Tenant } from '../types';

type TenantSummaryProps = {
    tenant: Tenant;
    domains: Domain[];
    canReadDomains: boolean;
};

export function TenantSummary({
    tenant,
    domains,
    canReadDomains,
}: TenantSummaryProps) {
    const { t } = useTranslation();
    const notSet = t('common.notSet');

    return (
        <>
            <Card>
                <CardContent className="grid gap-4 px-6 py-2 md:grid-cols-2 xl:grid-cols-5">
                    <TenantDetailItem
                        label={t('tenants.show.industry')}
                        value={tenant.industry}
                        fallback={notSet}
                    />
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
                    <MetricCard
                        title={t('domains.count', {
                            count: domains.length,
                        })}
                        description={t('tenants.show.domains')}
                        icon={<GlobeIcon />}
                    />
                )}
                <MetricCard
                    title={tenant.region || notSet}
                    description={t('tenants.show.region')}
                    icon={<MapPinIcon />}
                />
                <MetricCard
                    title={tenant.contact_mail || notSet}
                    description={t('tenants.show.email')}
                    icon={<MailIcon />}
                    compactTitle
                />
                <MetricCard
                    title={tenant.contact_phone || notSet}
                    description={t('tenants.show.phone')}
                    icon={<PhoneIcon />}
                    compactTitle
                />
            </div>
        </>
    );
}

function MetricCard({
    title,
    description,
    icon,
    compactTitle = false,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    compactTitle?: boolean;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-3">
                <CardTitle
                    className={
                        compactTitle
                            ? 'flex-1 truncate text-left text-base'
                            : 'flex-1 text-left'
                    }
                >
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                {description}
            </CardContent>
        </Card>
    );
}
