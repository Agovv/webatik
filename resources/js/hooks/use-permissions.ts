import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import type { Auth } from '@/types';

export type PermissionName =
    | 'create tenants'
    | 'read tenants'
    | 'update tenants'
    | 'delete tenants'

    | 'create domains'
    | 'read domains'
    | 'update domains'
    | 'delete domains'

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
    ;

type PermissionPageProps = {
    auth: Auth;
};

function normalize(value: PermissionName | PermissionName[]) {
    return Array.isArray(value) ? value : [value];
}

export function usePermissions() {
    const { auth } = usePage<PermissionPageProps>().props;

    const permissions = useMemo(
        () => new Set(auth.permissions ?? []),
        [auth.permissions],
    );
    const roles = useMemo(() => new Set(auth.roles ?? []), [auth.roles]);

    return {
        can: (permission: PermissionName) => permissions.has(permission),
        canAny: (permissionList: PermissionName | PermissionName[]) =>
            normalize(permissionList).some((permission) =>
                permissions.has(permission),
            ),
        canAll: (permissionList: PermissionName | PermissionName[]) =>
            normalize(permissionList).every((permission) =>
                permissions.has(permission),
            ),
        hasRole: (role: string) => roles.has(role),
        permissions,
        roles,
    };
}
