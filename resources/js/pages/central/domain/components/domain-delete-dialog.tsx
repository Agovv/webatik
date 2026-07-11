import { Form } from '@inertiajs/react';
import { Trash2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { destroy as destroyDomain } from '@/routes/manage/tenants/domains';

import type { Domain, Tenant } from '../types';

export function DomainDeleteDialog({
    tenant,
    domain,
}: {
    tenant: Tenant;
    domain: Domain;
}) {
    const { t } = useTranslation();
    const { can } = usePermissions();

    if (!can('delete domains')) {
        return null;
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('domains.delete.ariaLabel', {
                        domain: domain.domain,
                    })}
                >
                    <Trash2Icon />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t('domains.delete.title')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('domains.delete.description', {
                            domain: domain.domain,
                            tenant: tenant.name,
                        })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>

                    <Form
                        {...destroyDomain.form({
                            tenant: tenant.id,
                            domain: domain.id,
                        })}
                        options={{ preserveScroll: true }}
                    >
                        {({ processing }) => (
                            <AlertDialogAction
                                variant="destructive"
                                disabled={processing}
                                type="submit"
                            >
                                {t('domains.delete.submit')}
                            </AlertDialogAction>
                        )}
                    </Form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
