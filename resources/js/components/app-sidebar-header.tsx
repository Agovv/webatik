import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationsPanel } from '@/components/notifications-panel';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 px-4 backdrop-blur transition-[width,height] ease-linear supports-[backdrop-filter]:bg-background/80">
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="size-8 rounded-lg" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="ml-auto flex items-center gap-1">
                <NotificationsPanel />
            </div>
        </header>
    );
}
