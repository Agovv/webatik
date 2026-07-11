import { DomainTable } from './domain-table';

import type { GroupedDomainTenant } from '../types';

type DomainGroupListProps = {
    tenants: GroupedDomainTenant[];
    centralDomain: string;
};

export function DomainGroupList({
    tenants,
    centralDomain,
}: DomainGroupListProps) {
    return (
        <div className="flex flex-col gap-5">
            {tenants.map((tenant) => (
                <DomainTable
                    key={tenant.id}
                    tenant={tenant}
                    domains={tenant.domains}
                    centralDomain={centralDomain}
                    showSearch={false}
                />
            ))}
        </div>
    );
}
