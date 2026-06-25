import type { Permission } from './permissions';
import type { Role } from './roles';
import type { PageFlashProps, SearchFilters } from './shared';

export type User = {
    id: string;
    name: string;
    username: string;
    password: string;
    password_confirmation: string;
    email: string;
    phone: string;
    roles: Role[];
    permissions: Permission[];
};

export type UsersPageProps = PageFlashProps & {
    users: User[];
    roles: Role[];
    permissions: Permission[];
    filters: SearchFilters;
};
