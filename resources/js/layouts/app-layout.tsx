import ContextualLayout from '@/layouts/contextual-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <ContextualLayout breadcrumbs={breadcrumbs}>
            {children}
        </ContextualLayout>
    );
}
