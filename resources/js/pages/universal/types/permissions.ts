import type { PageFlashProps, SearchFilters } from './shared';

export type Permission = {
    id: string;
    name: string;
};

export type PermissionsPageProps = PageFlashProps & {
    permissions: Permission[];
    filters: SearchFilters;
};
