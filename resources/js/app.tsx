import { createInertiaApp } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import { I18nextProvider } from 'react-i18next';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AuthLayout from '@/layouts/auth-layout';
import CentralLayout from '@/layouts/central-layout';
import ContextualLayout from '@/layouts/contextual-layout';
import SettingsLayout from '@/layouts/settings/layout';

import { createI18nInstance } from './i18n';

import type { SharedPageProps } from './types/inertia';

configureEcho({
    broadcaster: 'pusher',
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
            case name === 'central/welcome':
            case name === 'tenant/welcome':
            case name.startsWith('themes/'): 
                return null;
            case name.startsWith('universal/auth/'):
                return AuthLayout;
            case name.startsWith('central/'):
                return CentralLayout;
            case name.startsWith('universal/settings/'):
                return [ContextualLayout, SettingsLayout];
            case name.startsWith('universal/'):
                return ContextualLayout;
            default:
                return ContextualLayout;
        }
    },
    strictMode: true,
    withApp(app, { page }) {
        const { locale, translations } =
            page.props as unknown as SharedPageProps;
        const i18n = createI18nInstance(locale, translations);

        return (
            <I18nextProvider i18n={i18n}>
                <TooltipProvider delayDuration={0}>
                    {app}
                    <Toaster />
                </TooltipProvider>
            </I18nextProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
