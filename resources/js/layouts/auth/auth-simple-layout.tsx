import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import AppLogoIcon from '@/components/app-logo-icon';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

function Logo() {
    const { currentTenant } = usePage().props;

    if (!currentTenant || currentTenant.logo === null) {
        return (
            <AppLogoIcon className="size-9 fill-current text-(--foreground) md:size-12 dark:text-white" />
        );
    }

    return (
        <img
            src={currentTenant.logo}
            alt={currentTenant.name}
            className="size-9 rounded-md md:size-12"
        />
    );
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { t } = useTranslation();

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="absolute top-4 right-4 left-4 flex flex-wrap items-center justify-between gap-4 md:top-6 md:right-6 md:left-6">
                <Button size={'sm'} variant="link">
                    <Link
                        href={home()}
                        className="flex flex-col items-center gap-2 font-medium"
                    >
                        {t('auth.home')}
                    </Link>
                </Button>
                <LocaleSwitcher />
            </div>

            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex size-12 items-center justify-center rounded-md">
                                <Logo />
                                {/* <AppLogoIcon className="size-9 fill-current text-(--foreground) dark:text-white" /> */}
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
