import { usePage } from '@inertiajs/react';

import CentralLayout from '@/layouts/central-layout';
import TenantLayout from '@/layouts/tenant-layout';
import type { BreadcrumbItem } from '@/types';

export default function ContextualLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { currentTenant } = usePage().props;
    const Layout = currentTenant ? TenantLayout : CentralLayout;

    return <Layout breadcrumbs={breadcrumbs}>{children}</Layout>;
}
