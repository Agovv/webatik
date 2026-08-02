import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';

import type { LucideIcon } from 'lucide-react';

const appearanceOptions: {
    value: Appearance;
    icon: LucideIcon;
    labelKey: string;
}[] = [
    { value: 'light', icon: Sun, labelKey: 'appearance.light' },
    { value: 'dark', icon: Moon, labelKey: 'appearance.dark' },
    { value: 'system', icon: Monitor, labelKey: 'appearance.system' },
];

export default function AppearanceSelect() {
    const { appearance, updateAppearance } = useAppearance();
    const { t } = useTranslation();

    return (
        <Select
            value={appearance}
            onValueChange={(value) => updateAppearance(value as Appearance)}
        >
            <SelectTrigger
                size="sm"
                aria-label={t('appearance.label')}
                className="min-w-28"
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
                {appearanceOptions.map(({ value, icon: Icon, labelKey }) => (
                    <SelectItem key={value} value={value}>
                        <Icon aria-hidden="true" />
                        <span>{t(labelKey)}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
