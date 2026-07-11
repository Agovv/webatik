import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';

import type { TenantStatus } from '../types';

const statusVariants: Record<
    TenantStatus,
    'success' | 'warning' | 'destructive'
> = {
    active: 'success',
    trial: 'warning',
    suspended: 'destructive',
};

export function TenantStatusBadge({ status }: { status: TenantStatus }) {
    const { t } = useTranslation();

    return (
        <Badge variant={statusVariants[status]}>
            {t(`tenants.form.${status}`)}
        </Badge>
    );
}
