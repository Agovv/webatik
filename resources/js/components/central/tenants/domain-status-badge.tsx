import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { DomainStatus, VerificationStatus } from './types';

export type DomainBadgeStatus =
    | DomainStatus
    | VerificationStatus
    | 'primary'
    | 'secondary';

const statusVariants: Record<
    DomainBadgeStatus,
    'success' | 'warning' | 'destructive' | 'secondary'
> = {
    active: 'success',
    verified: 'success',
    primary: 'success',
    pending: 'warning',
    disabled: 'destructive',
    failed: 'destructive',
    secondary: 'secondary',
};

const statusTranslationKeys: Record<DomainBadgeStatus, string> = {
    active: 'domains.form.active',
    pending: 'domains.form.pending',
    disabled: 'domains.form.disabled',
    verified: 'domains.form.verified',
    failed: 'domains.form.failed',
    primary: 'domains.table.primary',
    secondary: 'domains.form.disabled',
};

export function DomainStatusBadge({ status }: { status: DomainBadgeStatus }) {
    const { t } = useTranslation();

    return (
        <Badge variant={statusVariants[status]}>
            {t(statusTranslationKeys[status])}
        </Badge>
    );
}
