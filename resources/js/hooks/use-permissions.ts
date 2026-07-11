import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

import type { PermissionName, PermissionPageProps } from '@/types/permissions';

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
