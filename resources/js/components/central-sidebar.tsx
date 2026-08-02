import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Building2Icon,
    FolderGit2,
    GlobeIcon,
    LayoutGrid,
    Shield,
    User,
    CreditCard,
    Layers3,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { toInternalUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as billingIndex } from '@/routes/billing';
import { index as domainsIndex } from '@/routes/manage/domains';
import { index as plansIndex } from '@/routes/manage/plans';
import { index as tenantsIndex } from '@/routes/manage/tenants/index';
import { index as myTenantsIndex } from '@/routes/my-tenants';
import { index as permissionsIndex } from '@/routes/permissions';
import { index as rolesIndex } from '@/routes/roles';
import { index as usersIndex } from '@/routes/users';
import type { NavItem, PermissionNavItem } from '@/types';

export function CentralSidebar() {
    const { i18n, t } = useTranslation();
    const { can, hasRole } = usePermissions();

    const dashboardItem: PermissionNavItem = {
        title: t('nav.dashboard'),
        href: dashboard(),
        icon: LayoutGrid,
    };
    const managementNavItems: Record<string, PermissionNavItem> = {
        domains: {
            title: t('nav.domains'),
            href: toInternalUrl(domainsIndex()),
            icon: GlobeIcon,
            permission: 'read domains',
        },
        permissions: {
            title: t('nav.permissions'),
            href: permissionsIndex(),
            icon: BookOpen,
            permission: 'read permissions',
        },
        plans: {
            title: t('nav.plans'),
            href: toInternalUrl(plansIndex()),
            icon: Layers3,
            permission: 'read plans',
        },
        roles: {
            title: t('nav.roles'),
            href: rolesIndex(),
            icon: Shield,
            permission: 'read roles',
        },
        tenants: {
            title: t('nav.tenants'),
            href: toInternalUrl(tenantsIndex()),
            icon: Building2Icon,
            permission: 'read tenants',
        },
        users: {
            title: t('nav.users'),
            href: usersIndex(),
            icon: User,
            permission: 'read users',
        },
    };
    const mainNavItems: PermissionNavItem[] = [
        dashboardItem,
        ...(i18n.language.startsWith('es')
            ? ['domains', 'tenants', 'permissions', 'plans', 'roles', 'users']
            : ['domains', 'permissions', 'plans', 'roles', 'tenants', 'users']
        ).map((item) => managementNavItems[item]),
    ];

    const customerNavItems: PermissionNavItem[] = [
        {
            ...dashboardItem,
        },
        {
            title: t('nav.myWorkspaces'),
            href: toInternalUrl(myTenantsIndex()),
            icon: Building2Icon,
        },
        {
            title: t('nav.subscription'),
            href: toInternalUrl(billingIndex()),
            icon: CreditCard,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: t('nav.repository'),
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: t('nav.documentation'),
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    const visibleMainNavItems = (
        hasRole('customer') ? customerNavItems : mainNavItems
    ).filter((item) => !item.permission || can(item.permission));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                    items={visibleMainNavItems}
                    label={t('sidebar.central')}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
