import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';

type TenantLimitNoticeProps = {
    used: number;
    limit: number | null;
    resource: string;
};

export function TenantLimitNotice({
    used,
    limit,
    resource,
}: TenantLimitNoticeProps) {
    const { t } = useTranslation();

    if (limit === null) {
        return null;
    }

    return (
        <Badge className="w-fit font-normal" variant="secondary">
            {t('tenantLimits.usage', { used, limit, resource })}
        </Badge>
    );
}
