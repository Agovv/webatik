import { Link } from '@inertiajs/react';
import { ChevronRightIcon, MegaphoneIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { show } from '@/actions/App/Http/Controllers/Web/Central/TenantsController';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermissions } from '@/hooks/use-permissions';
import { toInternalUrl } from '@/lib/utils';
import { show as announcementsShow } from '@/routes/manage/tenants/announcements';

import { TenantDeleteDialog } from './tenant-delete-dialog';
import { TenantEditDialog } from './tenant-form-dialog';
import { TenantStatusBadge } from './tenant-status-badge';

import type { Tenant } from '../types';

export function TenantTable({ tenants }: { tenants: Tenant[] }) {
    const { t } = useTranslation();
    const { can } = usePermissions();
    const canReadDomains = can('read domains');
    const canReadAnnouncements = can('read tenant announcements');
    const notSet = t('common.notSet');

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('tenants.table.name')}</TableHead>
                        <TableHead>{t('tenants.table.status')}</TableHead>
                        <TableHead>{t('tenants.table.industry')}</TableHead>
                        <TableHead>{t('tenants.table.region')}</TableHead>
                        {canReadDomains && (
                            <TableHead>{t('tenants.table.domains')}</TableHead>
                        )}
                        <TableHead>{t('tenants.table.contact')}</TableHead>
                        <TableHead className="text-right">
                            {t('common.actions')}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tenants.map((tenant) => (
                        <TableRow key={tenant.id}>
                            <TableCell>
                                <div className="min-w-48">
                                    <p className="font-medium">{tenant.name}</p>
                                    <p className="text-muted-foreground">
                                        @{tenant.slug}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <TenantStatusBadge status={tenant.status} />
                            </TableCell>
                            <TableCell>{tenant.industry || notSet}</TableCell>
                            <TableCell>{tenant.region || notSet}</TableCell>
                            {canReadDomains && (
                                <TableCell>
                                    {tenant.domains_count ??
                                        tenant.domains?.length ??
                                        0}
                                </TableCell>
                            )}
                            <TableCell>
                                {tenant.contact_mail || notSet}
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-1">
                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="icon"
                                        aria-label={t('tenants.show.viewAria', {
                                            name: tenant.name,
                                        })}
                                    >
                                        <Link
                                            href={toInternalUrl(
                                                show(tenant.id),
                                            )}
                                        >
                                            <ChevronRightIcon />
                                        </Link>
                                    </Button>
                                    {canReadAnnouncements && (
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Send announcement to ${tenant.name}`}
                                        >
                                            <Link
                                                href={toInternalUrl(
                                                    announcementsShow(
                                                        tenant.id,
                                                    ),
                                                )}
                                            >
                                                <MegaphoneIcon />
                                            </Link>
                                        </Button>
                                    )}
                                    <TenantEditDialog tenant={tenant} />
                                    <TenantDeleteDialog tenant={tenant} />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
