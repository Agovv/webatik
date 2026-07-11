import { GlobeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';

import { CustomDomainInstructions } from './custom-domain-instructions';
import { DomainCreateDialog } from '../../domain/components/domain-create-dialog';
import { DomainTable } from '../../domain/components/domain-table';

import type { Domain, Tenant } from '../types';

type TenantDomainsSectionProps = {
    tenant: Tenant;
    domains: Domain[];
    centralDomain: string;
    canCreateDomains: boolean;
};

export function TenantDomainsSection({
    tenant,
    domains,
    centralDomain,
    canCreateDomains,
}: TenantDomainsSectionProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                        {t('tenants.show.domainsSection.title')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {t('tenants.show.domainsSection.description')}
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
                            {t('tenants.show.noDomains.description')}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}
        </div>
    );
}
