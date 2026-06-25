import { CentralSidebar } from '@/components/central-sidebar';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function CentralLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppSidebarLayout
            breadcrumbs={breadcrumbs}
            sidebar={<CentralSidebar />}
        >
            {children}
        </AppSidebarLayout>
    );
}
