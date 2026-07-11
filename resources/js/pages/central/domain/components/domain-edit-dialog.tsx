import { PencilIcon } from 'lucide-react';
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

import type { Domain, Tenant } from '../types';

export function DomainEditDialog({
    tenant,
    domain,
    centralDomain,
}: {
    tenant: Tenant;
    domain: Domain;
    centralDomain: string;
}) {
    const { t } = useTranslation();
    const { can } = usePermissions();
    const [open, setOpen] = useState(false);

    if (!can('update domains')) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('domains.edit.ariaLabel', {
                        domain: domain.domain,
                    })}
                >
                    <PencilIcon />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t('domains.edit.title')}</DialogTitle>
                    <DialogDescription>
                        {t('domains.edit.description')}
                    </DialogDescription>
                </DialogHeader>
                <DomainForm
                    tenant={tenant}
                    domain={domain}
                    centralDomain={centralDomain}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
