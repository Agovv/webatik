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

import type { User } from '../types';

type UserDeleteDialogProps = {
    open: boolean;
    user: User | null;
    processing: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export function UserDeleteDialog({
    open,
    user,
    processing,
    onOpenChange,
    onConfirm,
}: UserDeleteDialogProps) {
    const { t } = useTranslation();

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t('users.delete.title')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('users.delete.description', { name: user?.name })}
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
                            ? t('users.delete.processing')
                            : t('common.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
