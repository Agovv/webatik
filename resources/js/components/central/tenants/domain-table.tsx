import { Form } from '@inertiajs/react';
import {
    GlobeIcon,
    SearchIcon,
    ShieldCheckIcon,
    ShieldIcon,
    StarIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePermissions } from '@/hooks/use-permissions';
import { update as updateDomain } from '@/routes/manage/tenants/domains';
import { DomainDeleteDialog } from './domain-delete-dialog';
import { DomainEditDialog } from './domain-edit-dialog';
import { DomainStatusBadge } from './domain-status-badge';
import type { Domain, Tenant } from './types';

function MakePrimaryButton({
    tenant,
    domain,
}: {
    tenant: Tenant;
    domain: Domain;
}) {
    const { t } = useTranslation();
    const { can } = usePermissions();

    if (!can('update domains') || domain.is_primary) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={false}
                        aria-label={t('domains.table.primaryAria', {
                            domain: domain.domain,
                        })}
                    >
                        <StarIcon className="size-4 fill-yellow-500 text-yellow-500" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {t('domains.table.primaryTooltip')}
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <Form
            {...updateDomain.form({
                tenant: tenant.id,
                domain: domain.id,
            })}
            options={{ preserveScroll: true }}
        >
            {({ processing }) => (
                <>
                    <input type="hidden" name="domain" value={domain.domain} />
                    <input type="hidden" name="type" value={domain.type} />
                    <input type="hidden" name="is_primary" value="1" />
                    <input type="hidden" name="status" value={domain.status} />
                    <input
                        type="hidden"
                        name="dns_status"
                        value={domain.dns_status}
                    />
                    <input
                        type="hidden"
                        name="ssl_status"
                        value={domain.ssl_status}
                    />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={processing}
                                aria-label={t('domains.table.makePrimaryAria', {
                                    domain: domain.domain,
                                })}
                            >
                                <StarIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {t('domains.table.makePrimary')}
                        </TooltipContent>
                    </Tooltip>
                </>
            )}
        </Form>
    );
}

export function DomainTable({
    tenant,
    domains,
    centralDomain,
    showSearch = true,
}: {
    tenant: Tenant;
    domains: Domain[];
    centralDomain: string;
    showSearch?: boolean;
}) {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const filteredDomains = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (term === '') {
            return domains;
        }

        return domains.filter((domain) =>
            [
                domain.domain,
                domain.type,
                domain.status,
                domain.dns_status,
                domain.ssl_status,
            ].some((value) => value.toLowerCase().includes(term)),
        );
    }, [domains, search]);

    return (
        <div className="flex flex-col gap-4">
            {showSearch && (
                <div className="relative max-w-md">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="pl-9"
                        placeholder={t('domains.searchPlaceholder')}
                        aria-label={t('domains.searchAria')}
                    />
                </div>
            )}
            <Card className="overflow-hidden">
                <CardHeader className="-mt-2 flex flex-row items-center justify-between gap-3 border-b pb-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <GlobeIcon className="size-5" />
                        {tenant.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {t('domains.count', { count: domains.length })}
                    </p>
                </CardHeader>
                <CardContent className="px-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    {t('domains.table.hostname')}
                                </TableHead>
                                <TableHead>{t('domains.table.type')}</TableHead>
                                <TableHead>{t('domains.table.dns')}</TableHead>
                                <TableHead>{t('domains.table.ssl')}</TableHead>
                                <TableHead>
                                    {t('domains.table.status')}
                                </TableHead>
                                <TableHead className="text-right">
                                    {t('common.actions')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDomains.map((domain) => (
                                <TableRow key={domain.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span className="truncate">
                                                {domain.domain}
                                            </span>
                                            {domain.is_primary && (
                                                <DomainStatusBadge status="primary" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {t(`domains.form.${domain.type}`)}
                                    </TableCell>
                                    <TableCell>
                                        <DomainStatusBadge
                                            status={domain.dns_status}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {domain.ssl_status ===
                                            'verified' ? (
                                                <ShieldCheckIcon className="size-5 text-success" />
                                            ) : (
                                                <ShieldIcon className="size-5 fill-destructive" />
                                            )}
                                            <DomainStatusBadge
                                                status={domain.ssl_status}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DomainStatusBadge
                                            status={domain.status}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <MakePrimaryButton
                                                tenant={tenant}
                                                domain={domain}
                                            />
                                            <DomainEditDialog
                                                tenant={tenant}
                                                domain={domain}
                                                centralDomain={centralDomain}
                                            />
                                            <DomainDeleteDialog
                                                tenant={tenant}
                                                domain={domain}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredDomains.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        {t('domains.table.noResults')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
