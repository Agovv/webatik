import type { SharedPageProps } from '@/types/inertia';
import type { Permission } from '../../permissions/types';

export type SearchFilters = {
    search?: string;
};

export type PageFlashProps = {
    success?: string;
    errors?: Record<string, string[]>;
};

export type Role = {
    id: string;
    name: string;
    permissions: Permission[];
};

export type RoleFormData = {
    name: string;
    permissions: string[];
};

export type TenantLimit = {
    used: number;
    limit: number | null;
    remaining: number | null;
    allowed: boolean;
};

export type RolesPageProps = PageFlashProps &
    SharedPageProps & {
        roles: Role[];
        permissions: Permission[];
        tenantLimit: TenantLimit;
        filters: SearchFilters;
        [key: string]: any;
    };
