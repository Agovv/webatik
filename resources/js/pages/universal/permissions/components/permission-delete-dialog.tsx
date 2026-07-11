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
} from '@/components/ui/alert-dialog';

import type { Permission } from '../types';

type PermissionDeleteDialogProps = {
    open: boolean;
    permission: Permission | null;
    processing: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export function PermissionDeleteDialog({
    open,
    permission,
    processing,
    onOpenChange,
    onConfirm,
}: PermissionDeleteDialogProps) {
    const { t } = useTranslation();

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t('permissions.delete.title')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('permissions.delete.description', {
                            name: permission?.name,
                        })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={processing}
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                    >
                        {processing
                            ? t('permissions.delete.processing')
                            : t('common.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
