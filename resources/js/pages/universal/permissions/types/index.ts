import type { SharedPageProps } from '@/types/inertia';

export type SearchFilters = {
    search?: string;
};

export type PageFlashProps = {
    success?: string;
    errors?: Record<string, string[]>;
};

export type Permission = {
    id: string;
    name: string;
};

export type PermissionFormData = {
    name: string;
};

export type PermissionsPageProps = PageFlashProps &
    SharedPageProps & {
        permissions: Permission[];
        filters: SearchFilters;
        [key: string]: any;
    };
