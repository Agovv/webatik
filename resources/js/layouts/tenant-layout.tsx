import { TenantSidebar } from '@/components/tenant-sidebar';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function TenantLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppSidebarLayout
            breadcrumbs={breadcrumbs}
            sidebar={<TenantSidebar />}
            showTrialFooter
        >
            {children}
        </AppSidebarLayout>
    );
}
