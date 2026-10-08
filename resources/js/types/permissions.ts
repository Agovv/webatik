import type { Auth } from '@/types';
import type { SharedPageProps } from './inertia';

export type PermissionPageProps = SharedPageProps & {
    auth: Auth;
    [key: string]: unknown;
};

export type PermissionName =
    | 'create tenants'
    | 'read tenants'
    | 'update tenants'
    | 'delete tenants'
    | 'create tenant announcements'
    | 'read tenant announcements'
    | 'update tenant announcements'
    | 'delete tenant announcements'
    | 'create domains'
    | 'read domains'
    | 'update domains'
    | 'delete domains'
    | 'create plans'
    | 'read plans'
    | 'update plans'
    | 'delete plans'
    | 'create permissions'
    | 'read permissions'
    | 'update permissions'
    | 'delete permissions'
    | 'create roles'
    | 'read roles'
    | 'update roles'
    | 'delete roles'
    | 'create users'
    | 'read users'
    | 'update users'
    | 'delete users'
    | 'create tickets'
    | 'read tickets'
    | 'update tickets'
    | 'delete tickets'
    | 'reply tickets'
    | 'assign tickets' | 'read pages';
