import { PencilIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    store,
    update,
} from '@/actions/App/Http/Controllers/Web/Central/TenantsController';
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

import { TenantForm } from './tenant-form';

import type { Tenant } from '../types';

export function TenantCreateDialog() {
    const { t } = useTranslation();
    const { can } = usePermissions();
    const [open, setOpen] = useState(false);

    if (!can('create tenants')) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon data-icon="inline-start" />
                    {t('tenants.newTenant')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[min(92vh,760px)] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{t('tenants.create.title')}</DialogTitle>
                    <DialogDescription>
                        {t('tenants.create.description')}
                    </DialogDescription>
                </DialogHeader>
                <TenantForm
                    action={store.form()}
                    submitLabel={t('tenants.create.submit')}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}

export function TenantEditDialog({ tenant }: { tenant: Tenant }) {
    const { t } = useTranslation();
    const { can } = usePermissions();
    const [open, setOpen] = useState(false);

    if (!can('update tenants')) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('tenants.show.editAria', {
                        name: tenant.name,
                    })}
                >
                    <PencilIcon />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[min(92vh,760px)] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{t('tenants.edit.title')}</DialogTitle>
                    <DialogDescription>
                        {t('tenants.edit.description')}
                    </DialogDescription>
                </DialogHeader>
                <TenantForm
                    action={update.form(tenant.id)}
                    tenant={tenant}
                    submitLabel={t('tenants.edit.submit')}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
