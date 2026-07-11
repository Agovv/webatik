import { Building2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { usePermissions } from '@/hooks/use-permissions';

import { TenantCreateDialog } from './tenant-form-dialog';

export function TenantEmptyState() {
    const { t } = useTranslation();
    const { can } = usePermissions();

    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Building2Icon />
                </EmptyMedia>
                <EmptyTitle>{t('tenants.empty.title')}</EmptyTitle>
                <EmptyDescription>
                    {t('tenants.empty.description')}
                </EmptyDescription>
            </EmptyHeader>
            {can('create tenants') && (
                <EmptyContent>
                    <TenantCreateDialog />
                </EmptyContent>
            )}
        </Empty>
    );
}
