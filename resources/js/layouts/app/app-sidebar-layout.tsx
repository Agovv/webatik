import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { TrialFooter } from '@/components/trial-footer';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    sidebar,
    showTrialFooter = false,
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            {sidebar}
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="flex-1">{children}</div>
                {showTrialFooter && <TrialFooter />}
            </AppContent>
        </AppShell>
    );
}
