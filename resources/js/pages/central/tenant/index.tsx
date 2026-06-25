import { Head, setLayoutProps } from '@inertiajs/react';
import { Building2Icon, Grid3X3Icon, Table2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { index } from '@/actions/App/Http/Controllers/Web/Central/TenantsController';
import { TenantCard } from '@/components/central/tenants/tenant-card';
import { TenantFiltersBar } from '@/components/central/tenants/tenant-filters';
import { TenantCreateDialog } from '@/components/central/tenants/tenant-form-dialog';
import { TenantPagination } from '@/components/central/tenants/tenant-pagination';
import { TenantTable } from '@/components/central/tenants/tenant-table';
import type {
    PaginatedTenants,
    TenantFilterOptions,
    TenantFilters,
} from '@/components/central/tenants/types';
import Heading from '@/components/heading';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { usePermissions } from '@/hooks/use-permissions';

type ViewMode = 'cards' | 'table';

const viewPreferenceKey = 'central.tenants.view';

export default function TenantsIndex({
    tenants,
    filters,
    filterOptions,
}: {
    tenants: PaginatedTenants;
    filters: TenantFilters;
    filterOptions: TenantFilterOptions;
}) {
    const { can } = usePermissions();
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState<ViewMode>('cards');

    useEffect(() => {
        const storedView = window.localStorage.getItem(viewPreferenceKey);

        if (storedView === 'cards' || storedView === 'table') {
            queueMicrotask(() => setViewMode(storedView));
        }
    }, []);

    function changeViewMode(value: string) {
        if (value !== 'cards' && value !== 'table') {
            return;
        }

        setViewMode(value);
        window.localStorage.setItem(viewPreferenceKey, value);
    }

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
            <Head title={t('tenants.title')} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title={t('tenants.title')}
                        description={t('tenants.description')}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <ToggleGroup
                            type="single"
                            value={viewMode}
                            onValueChange={changeViewMode}
                            variant="outline"
                            aria-label={t('tenants.viewMode.label')}
                        >
                            <ToggleGroupItem
                                value="cards"
                                aria-label={t('tenants.viewMode.cards')}
                            >
                                <Grid3X3Icon />
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="table"
                                aria-label={t('tenants.viewMode.table')}
                            >
                                <Table2Icon />
                            </ToggleGroupItem>
                        </ToggleGroup>
                        <TenantCreateDialog />
                    </div>
                </div>

                <TenantFiltersBar filters={filters} options={filterOptions} />

                {tenants.data.length > 0 ? (
                    <>
                        {viewMode === 'cards' ? (
                            <div className="@container grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {tenants.data.map((tenant) => (
                                    <TenantCard
                                        key={tenant.id}
                                        tenant={tenant}
                                    />
                                ))}
                            </div>
                        ) : (
                            <TenantTable tenants={tenants.data} />
                        )}

                        <TenantPagination tenants={tenants} />
                    </>
                ) : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Building2Icon />
                            </EmptyMedia>
                            <EmptyTitle>{t('tenants.empty.title')}</EmptyTitle>
                            <EmptyDescription>
                                {t('tenants.empty.description')}
                            </EmptyDescription>
                        </EmptyHeader>
                        {can('create tenants') && (
                            <EmptyContent>
                                <TenantCreateDialog />
                            </EmptyContent>
                        )}
                    </Empty>
                )}
            </div>
        </>
    );
}
