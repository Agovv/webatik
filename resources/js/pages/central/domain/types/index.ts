export type {
    Domain,
    DomainStatus,
    DomainType,
    Tenant,
    TenantOption,
    VerificationStatus,
} from '../../tenant/types';

import type { Domain, Tenant } from '../../tenant/types';

export type GroupedDomainTenant = Omit<Tenant, 'domains'> & {
    domains: Domain[];
};
