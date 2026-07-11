import { Building2Icon, GlobeIcon } from 'lucide-react';
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

import { DomainCreateDialog } from './domain-create-dialog';

import type { TenantOption } from '../types';

type DomainEmptyStateProps = {
    search: string;
    tenants: TenantOption[];
    centralDomain: string;
};

export function DomainEmptyState({
    search,
    tenants,
    centralDomain,
}: DomainEmptyStateProps) {
    const { t } = useTranslation();
    const { can } = usePermissions();

    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    {search ? <GlobeIcon /> : <Building2Icon />}
                </EmptyMedia>
                <EmptyTitle>{t('domains.empty.title')}</EmptyTitle>
                <EmptyDescription>
                    {search
                        ? t('domains.empty.searchDescription')
                        : t('domains.empty.noDataDescription')}
                </EmptyDescription>
            </EmptyHeader>
            {!search && can('create domains') && (
                <EmptyContent>
                    <DomainCreateDialog
                        tenants={tenants}
                        centralDomain={centralDomain}
                    />
                </EmptyContent>
            )}
        </Empty>
    );
}
