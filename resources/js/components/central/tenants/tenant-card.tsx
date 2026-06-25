import { Link } from '@inertiajs/react';
import {
    Building2Icon,
    ChevronDownIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    EyeIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { show } from '@/actions/App/Http/Controllers/Web/Central/TenantsController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { usePermissions } from '@/hooks/use-permissions';
import { TenantDeleteDialog } from './tenant-delete-dialog';
import { TenantEditDialog } from './tenant-form-dialog';
import { TenantStatusBadge } from './tenant-status-badge';
import type { Tenant } from './types';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

function formatDate(value: string | null, fallback: string) {
    return value ? dateFormatter.format(new Date(value)) : fallback;
}

export function TenantCard({ tenant }: { tenant: Tenant }) {
    const { t } = useTranslation();
    const { can } = usePermissions();
    const canReadDomains = can('read domains');
    const [open, setOpen] = useState(false);
    const domainsCount = tenant.domains_count ?? tenant.domains?.length ?? 0;
    const notSet = t('common.notSet');

    return (
        <Collapsible open={open} onOpenChange={setOpen} asChild>
            <Card className="overflow-hidden pt-3 pb-2">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
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
                            <CardTitle className="truncate text-base">
                                {tenant.name}
                            </CardTitle>
                            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                <span className="truncate">@{tenant.slug}</span>
                                {canReadDomains && (
                                    <span>
                                        {t('domains.count', {
                                            count: domainsCount,
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <TenantStatusBadge status={tenant.status} />
                    </div>
                </CardHeader>
                <CardFooter className="flex gap-2 py-0">
                    <CollapsibleTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            aria-label={`${open ? t('tenants.card.collapseAria') : t('tenants.card.expandAria')} ${tenant.name}`}
                            className="flex-1"
                        >
                            {open ? (
                                <ChevronUpIcon data-icon="inline-start" />
                            ) : (
                                <ChevronDownIcon data-icon="inline-start" />
                            )}
                            {open
                                ? t('tenants.card.collapse')
                                : t('tenants.card.expand')}
                        </Button>
                    </CollapsibleTrigger>
                    <Button asChild variant="secondary" className="flex-1">
                        <Link href={show(tenant.id)}>
                            <EyeIcon data-icon="inline-start" />
                            {t('tenants.card.details')}
                            <ChevronRightIcon data-icon="inline-end" />
                        </Link>
                    </Button>

                    <TenantEditDialog tenant={tenant} />
                    <TenantDeleteDialog tenant={tenant} />
                </CardFooter>
                <CollapsibleContent>
                    <Separator />
                    <CardContent className="grid grid-cols-2 gap-4 py-2 text-sm">
                        <div>
                            <p className="text-muted-foreground">
                                {t('tenants.card.industry')}
                            </p>
                            <p className="font-medium">
                                {tenant.industry || notSet}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">
                                {t('tenants.card.region')}
                            </p>
                            <p className="font-medium">
                                {tenant.region || notSet}
                            </p>
                        </div>
                        {canReadDomains && (
                            <div>
                                <p className="text-muted-foreground">
                                    {t('tenants.card.domains')}
                                </p>
                                <p className="font-medium">{domainsCount}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-muted-foreground">
                                {t('tenants.card.created')}
                            </p>
                            <p className="font-medium">
                                {formatDate(tenant.created_at, notSet)}
                            </p>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
