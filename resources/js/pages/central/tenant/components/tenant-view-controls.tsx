import { Grid3X3Icon, Table2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { TenantCreateDialog } from './tenant-form-dialog';

import type { ViewMode } from '../types';

type TenantViewControlsProps = {
    viewMode: ViewMode;
    onViewModeChange: (value: string) => void;
};

export function TenantViewControls({
    viewMode,
    onViewModeChange,
}: TenantViewControlsProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={onViewModeChange}
                variant="outline"
                aria-label={t('tenants.viewMode.label')}
            >
                <ToggleGroupItem
                    value="cards"
                    aria-label={t('tenants.viewMode.cards')}
                >
                    <Grid3X3Icon />
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="table"
                    aria-label={t('tenants.viewMode.table')}
                >
                    <Table2Icon />
                </ToggleGroupItem>
            </ToggleGroup>
            <TenantCreateDialog />
        </div>
    );
}
