import { Form } from '@inertiajs/react';
import { AlertTriangleIcon, Trash2Icon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { destroy } from '@/actions/App/Http/Controllers/Web/Central/TenantsController';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePermissions } from '@/hooks/use-permissions';
import type { Tenant } from './types';

export function TenantDeleteDialog({ tenant }: { tenant: Tenant }) {
    const { t } = useTranslation();
    const { can } = usePermissions();
    const [open, setOpen] = useState(false);
    const [confirmation, setConfirmation] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const isConfirmed = confirmation === tenant.name;

    const handleOpenChange = (next: boolean) => {
        setOpen(next);

        // Reset the confirmation input whenever the dialog closes so the
        // next open starts with a clean slate.
        if (!next) {
            setConfirmation('');
        }
    };

    if (!can('delete tenants')) {
        return null;
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('tenants.show.deleteAria', {
                        name: tenant.name,
                    })}
                >
                    <Trash2Icon />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive">
                        <AlertTriangleIcon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>
                        {t('tenants.delete.title')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('tenants.delete.description')}{' '}
                        <span className="font-semibold text-foreground">
                            {t('tenants.delete.cannotBeUndone')}
                        </span>
                        . {t('tenants.delete.deleting')}{' '}
                        <span className="font-semibold text-foreground">
                            {tenant.name}
                        </span>{' '}
                        {t('tenants.delete.willErase')}{' '}
                        <span className="font-semibold text-foreground">
                            {t('tenants.delete.cannotBeRecovered')}
                        </span>
                        .
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid gap-2">
                    <Label htmlFor={`tenant-confirm-${tenant.id}`}>
                        {t('tenants.delete.confirmLabel', {
                            name: tenant.name,
                        })}
                    </Label>
                    <Input
                        id={`tenant-confirm-${tenant.id}`}
                        ref={inputRef}
                        value={confirmation}
                        onChange={(event) =>
                            setConfirmation(event.target.value)
                        }
                        autoComplete="off"
                        spellCheck={false}
                        aria-label={t('tenants.delete.ariaLabel', {
                            name: tenant.name,
                        })}
                        placeholder={t('tenants.delete.placeholder')}
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <Form
                        {...destroy.form(tenant.id)}
                        onSuccess={() => handleOpenChange(false)}
                        options={{ preserveScroll: true }}
                    >
                        {({ processing }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="confirmation"
                                    value={confirmation}
                                />
                                <Button
                                    variant="destructive"
                                    disabled={!isConfirmed || processing}
                                    type="submit"
                                >
                                    {t('tenants.delete.submit')}
                                </Button>
                            </>
                        )}
                    </Form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
