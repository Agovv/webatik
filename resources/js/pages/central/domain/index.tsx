import { Head, setLayoutProps } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { index } from '@/actions/App/Http/Controllers/Web/Central/DomainsController';
import Heading from '@/components/heading';

import { DomainCreateDialog } from './components/domain-create-dialog';
import { DomainEmptyState } from './components/domain-empty-state';
import { DomainGroupList } from './components/domain-group-list';
import { DomainSearch } from './components/domain-search';

import type { GroupedDomainTenant, Tenant, TenantOption } from './types';

export default function DomainsIndex({
    tenants,
    tenantOptions,
    centralDomain,
}: {
    tenants: Tenant[];
    tenantOptions: TenantOption[];
    centralDomain: string;
}) {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const groupedTenants = useMemo<GroupedDomainTenant[]>(() => {
        const term = search.trim().toLowerCase();

        return tenants
            .map((tenant) => ({
                ...tenant,
                domains:
                    tenant.domains?.filter((domain) => {
                        if (term === '') {
                            return true;
                        }

                        return [
                            tenant.name,
                            tenant.slug,
                            domain.domain,
                            domain.type,
                            domain.status,
                            domain.dns_status,
                            domain.ssl_status,
                        ].some((value) => value.toLowerCase().includes(term));
                    }) ?? [],
            }))
            .filter((tenant) => tenant.domains.length > 0);
    }, [search, tenants]);

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('domains.title'),
                href: index(),
            },
        ],
    });

    return (
        <>
            <Head title={t('domains.title')} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title={t('domains.title')}
                        description={t('domains.description')}
                    />
                    <DomainCreateDialog
                        tenants={tenantOptions}
                        centralDomain={centralDomain}
                    />
                </div>

                <DomainSearch value={search} onChange={setSearch} />

                {groupedTenants.length > 0 ? (
                    <DomainGroupList
                        tenants={groupedTenants}
                        centralDomain={centralDomain}
                    />
                ) : (
                    <DomainEmptyState
                        search={search}
                        tenants={tenantOptions}
                        centralDomain={centralDomain}
                    />
                )}
            </div>
        </>
    );
}
