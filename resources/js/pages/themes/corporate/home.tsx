import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppearanceSelect from '@/components/appearance-select';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { dashboard, login } from '@/routes';
import { CorporateSectionRenderer } from './sections/registry';
import type { TenantData, ThemePageSection } from './sections/types';

export default function CorporateHome() {
    const { t } = useTranslation();
    const { auth, canLogin, pageSections, tenantData, theme } = usePage()
        .props as unknown as {
        auth: { user: { name: string } | null };
        canLogin: boolean;
        pageSections: ThemePageSection[];
        tenantData: TenantData;
        theme: {
            key: string;
            name: string;
            version: string;
        };
    };

    return (
        <>
            <Head title={`${tenantData.name} — ${theme.name}`}>
                <meta
                    name="description"
                    content={`${tenantData.name} corporate website`}
                />
            </Head>

            <div className="min-h-screen bg-background text-foreground">
                <header className="border-b bg-background/95 backdrop-blur">
                    <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-3">
                            <span className="flex size-9 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                                {tenantData.logo ? (
                                    <img
                                        src={tenantData.logo}
                                        alt={tenantData.name}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold">
                                        {tenantData.name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </span>
                                )}
                            </span>
                            <span className="font-medium">{tenantData.name}</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <AppearanceSelect />
                            <LocaleSwitcher />
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="text-sm font-medium"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                canLogin && (
                                    <Link
                                        href={login()}
                                        className="text-sm font-medium"
                                    >
                                        {t('auth.login')}
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </header>

                <main>
                    <CorporateSectionRenderer
                        sections={pageSections}
                        tenantData={tenantData}
                    />
                </main>

                <footer className="border-t">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                        <span>{tenantData.name}</span>
                        <a
                            href={`https://${tenantData.domain}`}
                            className="inline-flex items-center gap-1"
                        >
                            {tenantData.domain}
                            <ArrowUpRight className="size-4" />
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}