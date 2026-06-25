import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { PaginatedTenants } from './types';

export function TenantPagination({ tenants }: { tenants: PaginatedTenants }) {
    const { t } = useTranslation();

    if (tenants.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                {t('tenants.pagination.showing', {
                    from: tenants.from ?? 0,
                    to: tenants.to ?? 0,
                    total: tenants.total,
                })}
            </p>
            <div className="flex flex-wrap gap-2">
                {tenants.links.map((link) => (
                    <Button
                        key={`${link.label}-${link.url}`}
                        asChild={Boolean(link.url)}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        disabled={!link.url}
                    >
                        {link.url ? (
                            <Link
                                href={link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )}
                    </Button>
                ))}
            </div>
        </div>
    );
}
