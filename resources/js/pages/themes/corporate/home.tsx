import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppearanceSelect from '@/components/appearance-select';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { dashboard, login } from '@/routes';
import { CorporateSectionRenderer } from './sections/registry';
import type { TenantData, ThemePageSection } from './sections/types';

const navigation = [
    ['Services', '#services'],
    ['About', '#about'],
    ['Projects', '#projects'],
    ['FAQ', '#faq'],
] as const;

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
                <header className="relative z-20 border-b bg-background/90 backdrop-blur-xl">
                    <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="group flex shrink-0 items-center gap-3">
                            <span className="flex size-10 items-center justify-center overflow-hidden rounded-2xl border bg-muted shadow-sm transition-transform group-hover:scale-[1.03]">
                                {tenantData.logo ? (
                                    <img
                                        src={tenantData.logo}
                                        alt={tenantData.name}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold">
                                        {tenantData.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </span>
                            <span className="hidden max-w-48 truncate text-sm font-semibold sm:block">
                                {tenantData.name}
                            </span>
                        </Link>

                        <nav className="hidden items-center gap-7 lg:flex">
                            {navigation.map(([label, href]) => (
                                <a
                                    key={href}
                                    href={href}
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-2 sm:flex">
                                <AppearanceSelect />
                                <LocaleSwitcher />
                            </div>

                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="hidden items-center gap-1 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted sm:inline-flex"
                                >
                                    Dashboard
                                    <ArrowUpRight className="size-4" />
                                </Link>
                            ) : (
                                canLogin && (
                                    <Link
                                        href={login()}
                                        className="hidden rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 sm:inline-flex"
                                    >
                                        {t('auth.login.submit')}
                                    </Link>
                                )
                            )}

                            <details className="relative lg:hidden">
                                <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border">
                                    <Menu className="size-4" aria-hidden="true" />
                                    <span className="sr-only">Open navigation</span>
                                </summary>
                                <div className="absolute right-0 top-12 w-64 rounded-2xl border bg-background p-3 shadow-xl">
                                    <nav className="grid gap-1">
                                        {navigation.map(([label, href]) => (
                                            <a
                                                key={href}
                                                href={href}
                                                className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted"
                                            >
                                                {label}
                                            </a>
                                        ))}
                                    </nav>
                                    <div className="mt-3 grid gap-2 border-t pt-3 sm:hidden">
                                        <AppearanceSelect />
                                        <LocaleSwitcher />
                                        {auth.user ? (
                                            <Link
                                                href={dashboard()}
                                                className="rounded-xl border px-3 py-2.5 text-sm font-medium"
                                            >
                                                Dashboard
                                            </Link>
                                        ) : (
                                            canLogin && (
                                                <Link
                                                    href={login()}
                                                    className="rounded-xl bg-foreground px-3 py-2.5 text-center text-sm font-medium text-background"
                                                >
                                                    {t('auth.login.submit')}
                                                </Link>
                                            )
                                        )}
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                </header>

                <main>
                    <CorporateSectionRenderer
                        sections={pageSections}
                        tenantData={tenantData}
                    />
                </main>

                <footer className="border-t bg-muted/20">
                    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
                        <div className="grid gap-8 md:grid-cols-[1.4fr_0.6fr_0.6fr]">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="flex size-10 items-center justify-center overflow-hidden rounded-2xl border bg-background">
                                        {tenantData.logo ? (
                                            <img
                                                src={tenantData.logo}
                                                alt=""
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-semibold">
                                                {tenantData.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </span>
                                    <span className="font-semibold">{tenantData.name}</span>
                                </div>
                                <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                                    A structured corporate web experience ready to
                                    grow with tenant-managed content and future
                                    visual editing.
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                    Explore
                                </p>
                                <div className="mt-4 grid gap-2 text-sm">
                                    {navigation.slice(0, 3).map(([label, href]) => (
                                        <a
                                            key={href}
                                            href={href}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            {label}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                    Contact
                                </p>
                                <a
                                    href={`https://${tenantData.domain}`}
                                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium"
                                >
                                    {tenantData.domain}
                                    <ArrowUpRight className="size-4" />
                                </a>
                                {tenantData.region && (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {tenantData.region}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                            <span>© {new Date().getFullYear()} {tenantData.name}</span>
                            <span>Corporate Theme {theme.version}</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
