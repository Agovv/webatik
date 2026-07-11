import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { MegaphoneIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { index } from '@/actions/App/Http/Controllers/Web/Central/TenantsController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { toInternalUrl } from '@/lib/utils';
import { index as announcementsIndex } from '@/routes/manage/tenants/announcements';

import { TenantDirectory } from './components/tenant-directory';
import { TenantEmptyState } from './components/tenant-empty-state';
import { TenantFiltersBar } from './components/tenant-filters';
import { TenantViewControls } from './components/tenant-view-controls';

import type {
    PaginatedTenants,
    TenantFilterOptions,
    TenantFilters,
    ViewMode,
} from './types';

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
    const { t } = useTranslation();
    const { can } = usePermissions();
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
                    <TenantViewControls
                        viewMode={viewMode}
                        onViewModeChange={changeViewMode}
                    />
                    {can('read tenant announcements') && (
                        <Button asChild variant="outline">
                            <Link href={toInternalUrl(announcementsIndex())}>
                                <MegaphoneIcon data-icon="inline-start" />
                                Announcements
                            </Link>
                        </Button>
                    )}
                </div>

                <TenantFiltersBar filters={filters} options={filterOptions} />

                {tenants.data.length > 0 ? (
                    <TenantDirectory tenants={tenants} viewMode={viewMode} />
                ) : (
                    <TenantEmptyState />
                )}
            </div>
        </>
    );
}
