import './i18n'; // initialize i18n before any component renders

import { createInertiaApp } from '@inertiajs/react';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import i18n from '@/i18n';
import AuthLayout from '@/layouts/auth-layout';
import CentralLayout from '@/layouts/central-layout';
import ContextualLayout from '@/layouts/contextual-layout';
import SettingsLayout from '@/layouts/settings/layout';
import TenantLayout from '@/layouts/tenant-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function SyncHtmlLang() {
    useEffect(() => {
        const apply = (lng: string) => {
            document.documentElement.lang = lng;
        };

        apply(i18n.language ?? 'en');

        i18n.on('languageChanged', apply);

        return () => {
            i18n.off('languageChanged', apply);
        };
    }, []);

    return null;
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('central/'):
                return CentralLayout;
            case name.startsWith('settings/'):
                return [ContextualLayout, SettingsLayout];
            case name.startsWith('universal/'):
                return ContextualLayout;
            default:
                return ContextualLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                <SyncHtmlLang />
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
