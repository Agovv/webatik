import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Building2Icon,
    FolderGit2,
    GlobeIcon,
    LayoutGrid,
    Shield,
    User,
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
import type { PermissionName } from '@/hooks/use-permissions';
import { dashboard } from '@/routes';
import { index as domainsIndex } from '@/routes/manage/domains';
import { index as tenantsIndex } from '@/routes/manage/tenants/index';
import type { NavItem } from '@/types';
import { index as permissionsIndex } from '@/routes/permissions';
import { index as rolesIndex } from '@/routes/roles';
import { index as usersIndex } from '@/routes/users';


type PermissionNavItem = NavItem & {
    permission?: PermissionName;
};

export function CentralSidebar() {
    const { t } = useTranslation();
    const { can } = usePermissions();

    const mainNavItems: PermissionNavItem[] = [
        {
            title: t('nav.dashboard'),
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: t('nav.tenants'),
            href: tenantsIndex(),
            icon: Building2Icon,
            permission: 'read tenants',
        },
        {
            title: t('nav.domains'),
            href: domainsIndex(),
            icon: GlobeIcon,
            permission: 'read domains',
        },
        {
            title: t('nav.users'),
            href: usersIndex(),
            icon: User,
            permission: 'read users',
        },
        {
            title: t('nav.roles'),
            href: rolesIndex(),
            icon: Shield,
            permission: 'read roles',
        },
        {
            title: t('nav.permissions'),
            href: permissionsIndex(),
            icon: BookOpen,
            permission: 'read permissions',
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

    const visibleMainNavItems = mainNavItems.filter(
        (item) => !item.permission || can(item.permission),
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={tenantsIndex()} prefetch>
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
