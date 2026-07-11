import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'Maestro';

export default function AppLogo() {
    const tenant = usePage().props.currentTenant;

    return (
        <>
            <div
                className={`flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground ${tenant?.logo ? 'bg-transparent' : 'bg-sidebar-primary'}`}
            >
                {tenant?.logo ? (
                    <img
                        src={tenant.logo}
                        alt={tenant.name}
                        className="size-full rounded-md object-cover"
                    />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {tenant && tenant?.name ? tenant.name : APP_NAME}
                </span>
            </div>
        </>
    );
}
