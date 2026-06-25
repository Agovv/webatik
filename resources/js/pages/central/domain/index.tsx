import { Head, setLayoutProps } from '@inertiajs/react';
import { Building2Icon, GlobeIcon, SearchIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { index } from '@/actions/App/Http/Controllers/Web/Central/DomainsController';
import { DomainCreateDialog } from '@/components/central/tenants/domain-create-dialog';
import { DomainTable } from '@/components/central/tenants/domain-table';
import type { Tenant, TenantOption } from '@/components/central/tenants/types';
import Heading from '@/components/heading';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { usePermissions } from '@/hooks/use-permissions';

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
    const { can } = usePermissions();
    const [search, setSearch] = useState('');
    const groupedTenants = useMemo(() => {
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

                <div className="relative max-w-md">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="pl-9"
                        placeholder={t('domains.searchPlaceholder')}
                        aria-label={t('domains.searchAria')}
                    />
                </div>

                {groupedTenants.length > 0 ? (
                    <div className="flex flex-col gap-5">
                        {groupedTenants.map((tenant) => (
                            <DomainTable
                                key={tenant.id}
                                tenant={tenant}
                                domains={tenant.domains ?? []}
                                centralDomain={centralDomain}
                                showSearch={false}
                            />
                        ))}
                    </div>
                ) : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                {search ? <GlobeIcon /> : <Building2Icon />}
                            </EmptyMedia>
                            <EmptyTitle>{t('domains.empty.title')}</EmptyTitle>
                            <EmptyDescription>
                                {search
                                    ? t('domains.empty.searchDescription')
                                    : t('domains.empty.noDataDescription')}
                            </EmptyDescription>
                        </EmptyHeader>
                        {!search && can('create domains') && (
                            <EmptyContent>
                                <DomainCreateDialog
                                    tenants={tenantOptions}
                                    centralDomain={centralDomain}
                                />
                            </EmptyContent>
                        )}
                    </Empty>
                )}
            </div>
        </>
    );
}
