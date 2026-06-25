import type { Permission } from './permissions';
import type { PageFlashProps, SearchFilters } from './shared';

export type Role = {
    id: string;
    name: string;
    permissions: Permission[];
};

export type RolesPageProps = PageFlashProps & {
    roles: Role[];
    permissions: Permission[];
    filters: SearchFilters;
};
