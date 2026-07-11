import { InfoIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import type { Domain } from '../types';

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

type CustomDomainInstructionsProps = {
    domains: Domain[];
    centralDomain: string;
};

export function CustomDomainInstructions({
    domains,
    centralDomain,
}: CustomDomainInstructionsProps) {
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
                        <DnsItem
                            label={t('tenants.show.dns.type')}
                            value={t('tenants.show.dns.typeValue')}
                        />
                        <DnsItem
                            label={t('tenants.show.dns.name')}
                            value={t('tenants.show.dns.nameValue')}
                        />
                        <DnsItem
                            label={t('tenants.show.dns.target')}
                            value={
                                targetDomain?.domain ??
                                t('tenants.show.dns.targetFallback', {
                                    centralDomain,
                                })
                            }
                            breakAll
                        />
                        <DnsItem
                            label={t('tenants.show.dns.ttl')}
                            value={t('tenants.show.dns.ttlValue')}
                        />
                    </div>
                    <p>{t('tenants.show.dns.outro')}</p>
                </div>
            </AlertDescription>
        </Alert>
    );
}

function DnsItem({
    label,
    value,
    breakAll = false,
}: {
    label: string;
    value: string;
    breakAll?: boolean;
}) {
    return (
        <div>
            <p className="font-medium text-foreground">{label}</p>
            <p className={breakAll ? 'break-all' : undefined}>{value}</p>
        </div>
    );
}
