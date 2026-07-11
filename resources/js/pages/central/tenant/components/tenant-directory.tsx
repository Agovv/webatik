import { TenantCard } from './tenant-card';
import { TenantPagination } from './tenant-pagination';
import { TenantTable } from './tenant-table';

import type { PaginatedTenants, ViewMode } from '../types';

type TenantDirectoryProps = {
    tenants: PaginatedTenants;
    viewMode: ViewMode;
};

export function TenantDirectory({ tenants, viewMode }: TenantDirectoryProps) {
    return (
        <>
            {viewMode === 'cards' ? (
                <div className="@container grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {tenants.data.map((tenant) => (
                        <TenantCard key={tenant.id} tenant={tenant} />
                    ))}
                </div>
            ) : (
                <TenantTable tenants={tenants.data} />
            )}

            <TenantPagination tenants={tenants} />
        </>
    );
}
