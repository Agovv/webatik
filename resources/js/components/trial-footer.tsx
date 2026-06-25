import { usePage } from '@inertiajs/react';
import { FlaskConicalIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TrialFooter() {
    const { t } = useTranslation();
    const { currentTenant } = usePage().props;

    if (currentTenant?.status !== 'trial') {
        return null;
    }

    return (
        <footer className="border-t bg-destructive/50">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-1.5 px-4 py-1.5 text-[10px] text-primary">
                <FlaskConicalIcon className="size-3" />
                <span>
                    {t('footer.trial')} ·{' '}
                    {t('footer.poweredBy', {
                        name: import.meta.env.VITE_APP_NAME || 'Laravel',
                    })}
                </span>
            </div>
        </footer>
    );
}
