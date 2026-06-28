import './i18n'; // initialize i18n before any component renders

import { createInertiaApp } from '@inertiajs/react';
import { StrictMode, useEffect } from 'react';
import type { ReactElement } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import i18n from '@/i18n';
import AuthLayout from '@/layouts/auth-layout';
import CentralLayout from '@/layouts/central-layout';
import ContextualLayout from '@/layouts/contextual-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

declare global {
    interface Window {
        maestroRoot?: Root;
        maestroRootHydrating?: boolean;
    }
}

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

function wrapApp(app: ReactElement): ReactElement {
    return (
        <StrictMode>
            <TooltipProvider delayDuration={0}>
                <SyncHtmlLang />
                {app}
                <Toaster />
            </TooltipProvider>
        </StrictMode>
    );
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
            case name === 'central/welcome':
            case name === 'tenant/welcome':
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
    setup({ el, App, props }) {
        const app = wrapApp(<App {...props} />);

        if (!el) {
            return app;
        }

        if (window.maestroRoot) {
            if (!window.maestroRootHydrating) {
                window.maestroRoot.render(app);
            }

            return;
        }

        if (el.dataset.serverRendered === 'true') {
            window.maestroRootHydrating = true;
            window.maestroRoot = hydrateRoot(el, app);

            window.requestAnimationFrame(() => {
                window.maestroRootHydrating = false;
            });

            return;
        }

        window.maestroRoot = createRoot(el);
        window.maestroRoot.render(app);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
