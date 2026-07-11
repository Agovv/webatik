import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { MegaphoneIcon, PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { index as tenantsIndex } from '@/actions/App/Http/Controllers/Web/Central/TenantsController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePermissions } from '@/hooks/use-permissions';
import { toInternalUrl } from '@/lib/utils';
import {
    index as announcementsIndex,
    show as announcementsShow,
} from '@/routes/manage/tenants/announcements';

import { TenantAnnouncementForm } from './components/tenant-announcement-form';

import type { Tenant } from './types';

type TenantOption = Pick<Tenant, 'id' | 'name' | 'slug'>;

type Announcement = {
    id: string;
    title: string;
    body: string | null;
    audience: 'all' | 'roles';
    roles: string[] | null;
    created_at: string | null;
    expires_at: string | null;
};

type TenantAnnouncementsProps = {
    tenants: TenantOption[];
    selectedTenant: TenantOption | null;
    roleOptions: string[];
    announcements: Announcement[];
};

function formatDate(value: string | null, noDateLabel: string): string {
    if (!value) {
        return noDateLabel;
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
}

export default function TenantAnnouncements({
    tenants,
    selectedTenant,
    roleOptions,
    announcements,
}: TenantAnnouncementsProps) {
    const { t } = useTranslation();
    const { can } = usePermissions();
    const canCreateAnnouncements = can('create tenant announcements');

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('tenants.title'),
                href: tenantsIndex(),
            },
            {
                title: t('tenantAnnouncements.breadcrumb'),
                href: announcementsIndex(),
            },
        ],
    });

    return (
        <>
            <Head title={t('tenantAnnouncements.title')} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Heading
                        title={t('tenantAnnouncements.title')}
                        description={t('tenantAnnouncements.description')}
                    />
                    <Button asChild variant="outline">
                        <Link href={toInternalUrl(tenantsIndex())}>
                            {t('tenantAnnouncements.back')}
                        </Link>
                    </Button>
                </div>

                {tenants.length > 0 ? (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
                        <div className="flex flex-col gap-4">
                            <div className="rounded-md border p-4">
                                <label
                                    htmlFor="announcement-tenant"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    {t('tenantAnnouncements.tenant')}
                                </label>
                                <Select
                                    value={selectedTenant?.id}
                                    onValueChange={(tenantId) =>
                                        router.visit(
                                            toInternalUrl(
                                                announcementsIndex({
                                                    query: {
                                                        tenant_id: tenantId,
                                                    },
                                                }),
                                            ),
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        id="announcement-tenant"
                                        className="w-full"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {tenants.map((tenant) => (
                                                <SelectItem
                                                    key={tenant.id}
                                                    value={tenant.id}
                                                >
                                                    {tenant.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedTenant && canCreateAnnouncements && (
                                <TenantAnnouncementForm
                                    tenant={selectedTenant}
                                    roleOptions={roleOptions}
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold">
                                    {t('tenantAnnouncements.recent')}
                                </h2>
                                {selectedTenant && (
                                    <Button asChild variant="ghost" size="sm">
                                        <Link
                                            href={toInternalUrl(
                                                announcementsShow(
                                                    selectedTenant.id,
                                                ),
                                            )}
                                        >
                                            {t(
                                                'tenantAnnouncements.openTenantView',
                                            )}
                                        </Link>
                                    </Button>
                                )}
                            </div>

                            {announcements.length > 0 ? (
                                <div className="flex flex-col rounded-md border">
                                    {announcements.map((announcement) => (
                                        <div
                                            key={announcement.id}
                                            className="flex flex-col gap-2 border-b p-4 last:border-b-0"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="font-medium">
                                                    {announcement.title}
                                                </h3>
                                                <Badge variant="secondary">
                                                    {announcement.audience ===
                                                    'all'
                                                        ? t(
                                                              'tenantAnnouncements.audienceAll',
                                                          )
                                                        : t(
                                                              'tenantAnnouncements.audienceRoles',
                                                          )}
                                                </Badge>
                                            </div>
                                            {announcement.body && (
                                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                                    {announcement.body}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {t(
                                                    'tenantAnnouncements.sentOn',
                                                    {
                                                        date: formatDate(
                                                            announcement.created_at,
                                                            t(
                                                                'tenantAnnouncements.noDate',
                                                            ),
                                                        ),
                                                    },
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Empty className="min-h-72">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <MegaphoneIcon />
                                        </EmptyMedia>
                                        <EmptyTitle>
                                            {t(
                                                'tenantAnnouncements.emptyTitle',
                                            )}
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            {t(
                                                'tenantAnnouncements.emptyDescription',
                                            )}
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            )}
                        </div>
                    </div>
                ) : (
                    <Empty className="min-h-96">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <PlusIcon />
                            </EmptyMedia>
                            <EmptyTitle>
                                {t('tenantAnnouncements.noTenantsTitle')}
                            </EmptyTitle>
                            <EmptyDescription>
                                {t('tenantAnnouncements.noTenantsDescription')}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
            </div>
        </>
    );
}
