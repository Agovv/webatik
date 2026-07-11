import { ShieldIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
} from '@/components/ui/empty';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { Role } from '../types';

type RolePermissionsDialogProps = {
    open: boolean;
    role: Role | null;
    onOpenChange: (open: boolean) => void;
};

export function RolePermissionsDialog({
    open,
    role,
    onOpenChange,
}: RolePermissionsDialogProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {t('roles.permissions.title', { name: role?.name })}
                    </DialogTitle>
                    <DialogDescription>
                        {t('roles.permissions.description')}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-72 pr-3">
                    {role?.permissions && role.permissions.length > 0 ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                            {role.permissions.map((permission) => (
                                <div
                                    key={permission.id}
                                    className="flex items-center gap-2 rounded-md bg-muted/50 p-2"
                                >
                                    <ShieldIcon className="text-muted-foreground" />
                                    <span className="min-w-0 truncate text-sm">
                                        {permission.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <ShieldIcon />
                                </EmptyMedia>
                                <EmptyDescription>
                                    {t('roles.permissions.empty')}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}
                </ScrollArea>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>
                        {t('common.close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
