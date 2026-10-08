export type ThemePageSection = {
    id: string;
    section: string;
    variant: string | null;
    component: string;
    props: Record<string, unknown>;
};

export type CorporateSectionProps = {
    section: ThemePageSection;
    tenantData: TenantData;
};

export type TenantData = {
    id: string;
    name: string;
    slug: string;
    domain: string;
    status: string;
    logo: string | null;
    region: string | null;
    industry: string | null;
    createdAt: string | null;
};