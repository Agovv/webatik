export type TenantStatus = 'active' | 'trial' | 'suspended';
export type DomainType = 'auto' | 'custom';
export type DomainStatus = 'pending' | 'active' | 'disabled';
export type VerificationStatus = 'pending' | 'verified' | 'failed';

export type Domain = {
    id: string;
    domain: string;
    tenant_id: string;
    type: DomainType;
    is_primary: boolean;
    status: DomainStatus;
    dns_status: VerificationStatus;
    ssl_status: VerificationStatus;
    created_at: string | null;
    updated_at: string | null;
};

export type Tenant = {
    id: string;
    name: string;
    slug: string;
    status: TenantStatus;
    contact_mail: string | null;
    contact_phone: string | null;
    icon_path: string | null;
    icon_url: string | null;
    region: string | null;
    industry: string | null;
    notes: string | null;
    created_at: string | null;
    updated_at: string | null;
    domains?: Domain[];
    domains_count?: number;
};

export type TenantOption = Pick<Tenant, 'id' | 'name' | 'slug'> & {
    domains_count?: number;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedTenants = {
    data: Tenant[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
};

export type TenantFilters = {
    search: string;
    status: string;
    region: string;
    industry: string;
    domain_type: string;
    per_page: number;
};

export type TenantFilterOptions = {
    statuses: string[];
    regions: string[];
    industries: string[];
    domainTypes: string[];
};
