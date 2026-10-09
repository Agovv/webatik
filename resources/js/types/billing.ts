export type PlanLimit = {
    id: string;
    key:
        | 'tenants'
        | 'default_domains'
        | 'custom_domains'
        | 'tenant_users'
        | 'tenant_custom_roles';
    value: number;
};

export type PlanPrice = {
    id: string;
    interval: 'month' | 'year';
    amount: number;
    currency: string;
    status: 'draft' | 'published' | 'archived';
    stripe_price_id: string | null;
};

export type PlanFeature = {
    id: string;
    feature_key: string;
};

export type FeatureDefinition = {
    key: string;
    name: string;
    module: string;
    description: string | null;
};

export type Plan = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    rank: number;
    is_featured: boolean;
    is_active: boolean;
    limits: PlanLimit[];
    features?: PlanFeature[];
    prices: PlanPrice[];
};
