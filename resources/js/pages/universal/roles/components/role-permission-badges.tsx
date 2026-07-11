import { Badge } from '@/components/ui/badge';

import type { Permission } from '../../permissions/types';

type RolePermissionBadgesProps = {
    permissions: Permission[];
    emptyLabel: string;
    moreLabel: string;
    limit?: number;
    onMore?: () => void;
};

export function RolePermissionBadges({
    permissions,
    emptyLabel,
    moreLabel,
    limit = 3,
    onMore,
}: RolePermissionBadgesProps) {
    if (permissions.length === 0) {
        return (
            <span className="text-sm text-muted-foreground">{emptyLabel}</span>
        );
    }

    return (
        <div className="flex flex-wrap gap-1">
            {permissions.slice(0, limit).map((permission) => (
                <Badge key={permission.id} variant="secondary">
                    {permission.name}
                </Badge>
            ))}
            {permissions.length > limit && (
                <Badge
                    variant="outline"
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={onMore}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onMore?.();
                        }
                    }}
                >
                    +{permissions.length - limit} {moreLabel}
                </Badge>
            )}
        </div>
    );
}
