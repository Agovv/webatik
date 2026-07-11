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

import type { Role } from '../types';

type RoleDeleteDialogProps = {
    open: boolean;
    role: Role | null;
    processing: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export function RoleDeleteDialog({
    open,
    role,
    processing,
    onOpenChange,
    onConfirm,
}: RoleDeleteDialogProps) {
    const { t } = useTranslation();

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t('roles.delete.title')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('roles.delete.description', { name: role?.name })}
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
                            ? t('roles.delete.processing')
                            : t('common.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
