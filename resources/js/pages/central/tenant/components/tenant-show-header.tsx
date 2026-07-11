import { Link } from '@inertiajs/react';
import { ArrowLeftIcon, Building2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { index } from '@/actions/App/Http/Controllers/Web/Central/TenantsController';
import { Button } from '@/components/ui/button';
import { toInternalUrl } from '@/lib/utils';

import { TenantEditDialog } from './tenant-form-dialog';
import { TenantStatusBadge } from './tenant-status-badge';

import type { Tenant } from '../types';

export function TenantShowHeader({ tenant }: { tenant: Tenant }) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-muted">
                    {tenant.icon_url ? (
                        <img
                            src={tenant.icon_url}
                            alt={tenant.name}
                            className="size-full rounded-md object-cover object-center"
                        />
                    ) : (
                        <Building2Icon />
                    )}
                </div>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="truncate text-2xl font-semibold tracking-tight">
                            {tenant.name}
                        </h1>
                        <TenantStatusBadge status={tenant.status} />
                    </div>
                    <p className="text-muted-foreground">@{tenant.slug}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                    <Link href={toInternalUrl(index())}>
                        <ArrowLeftIcon data-icon="inline-start" />
                        {t('tenants.show.back')}
                    </Link>
                </Button>
                <TenantEditDialog tenant={tenant} />
            </div>
        </div>
    );
}
