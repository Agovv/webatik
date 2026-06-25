import { GlobeIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { usePermissions } from '@/hooks/use-permissions';
import { DomainForm } from './domain-form';
import type { Tenant, TenantOption } from './types';

export function DomainCreateDialog({
    tenant,
    tenants,
    centralDomain,
}: {
    tenant?: Tenant;
    tenants?: TenantOption[];
    centralDomain: string;
}) {
    const { t } = useTranslation();
    const { can } = usePermissions();
    const [open, setOpen] = useState(false);

    if (!can('create domains')) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon data-icon="inline-start" />
                    {t('domains.create.button')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t('domains.create.title')}</DialogTitle>
                    <DialogDescription>
                        {t('domains.create.description')}
                    </DialogDescription>
                </DialogHeader>
                {tenant && (
                    <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
                        <GlobeIcon />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                                {tenant.name}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                                {tenant.slug}
                            </p>
                        </div>
                    </div>
                )}
                <DomainForm
                    tenant={tenant}
                    tenants={tenants}
                    centralDomain={centralDomain}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
