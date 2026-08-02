import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Database,
    Fingerprint,
    Globe2,
    Lock,
    ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';

import { useTranslation } from 'react-i18next';
import AppLogoIcon from '@/components/app-logo-icon';
import AppearanceSelect from '@/components/appearance-select';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { dashboard, login, register } from '@/routes';

import type { Variants } from 'motion/react';

type TenantData = {
    id: string;
    name: string;
    slug: string;
    domain: string;
    status: 'active' | 'trial' | 'suspended' | string;
    logo: string | null;
    region: string | null;
    industry: string | null;
    createdAt: string | null;
};

type IsolationKey = 'database' | 'session' | 'domains';

const ISOLATION_ICONS: Record<IsolationKey, typeof Database> = {
    database: Database,
    session: Lock,
    domains: Globe2,
};

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'destructive'> = {
    active: 'success',
    trial: 'warning',
    suspended: 'destructive',
};

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
};

const stagger = (delay = 0): Variants => ({
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.07, delayChildren: delay },
    },
});

const isolationKeys: IsolationKey[] = ['database', 'session', 'domains'];

function formatDate(iso: string | null, locale: string): string {
    if (!iso) {
        return '-';
    }

    try {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function TenantInitial({ tenantData }: { tenantData: TenantData }) {
    if (tenantData.logo) {
        return (
            <img
                src={tenantData.logo}
                alt={tenantData.name}
                className="size-full rounded-lg object-cover"
            />
        );
    }

    return (
        <AvatarFallback
            delayMs={0}
            className="rounded-lg bg-foreground text-2xl font-semibold text-background"
        >
            {tenantData.name.charAt(0).toUpperCase()}
        </AvatarFallback>
    );
}

export default function TenantWelcome() {
    const { t, i18n } = useTranslation();

    const { auth, tenantData, canLogin, canRegister } = usePage()
        .props as unknown as {
        auth: { user: { name: string } | null };
        tenantData: TenantData;
        canLogin: boolean;
        canRegister: boolean;
    };

    const statusVariant = STATUS_VARIANTS[tenantData.status] ?? 'outline';
    const domain = tenantData.domain;
    const currentYear = new Date().getFullYear();
    const metaItems = [
        {
            label: t('tenantWelcome.stats.region'),
            value: tenantData.region || t('tenantWelcome.stats.notSet'),
        },
        {
            label: t('tenantWelcome.stats.industry'),
            value: tenantData.industry || t('tenantWelcome.stats.notSet'),
        },
        {
            label: t('tenantWelcome.stats.created'),
            value: formatDate(tenantData.createdAt, i18n.language),
        },
    ];

    return (
        <>
            <Head title={t('home.tenantTitle', { name: tenantData.name })}>
                <meta
                    name="description"
                    content={`${tenantData.name} tenant workspace in Maestro with isolated database, scoped sessions, and domain routing.`}
                />
            </Head>

            <div className="min-h-screen overflow-hidden bg-background text-foreground">
                <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,var(--chart-2)_0,transparent_20rem),radial-gradient(circle_at_88%_18%,var(--chart-5)_0,transparent_22rem),linear-gradient(180deg,var(--background),var(--muted))] opacity-[0.12] dark:opacity-[0.2]" />
                <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-72 border-b bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.16]" />

                <header className="sticky top-0 z-40 border-b border-border/70 bg-background/82 backdrop-blur-xl">
                    <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                        <Link
                            href="/"
                            className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background">
                                {tenantData.logo ? (
                                    <img
                                        src={tenantData.logo}
                                        alt={tenantData.name}
                                        width={32}
                                        height={32}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold text-foreground">
                                        {tenantData.name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </span>
                                )}
                            </span>
                            <span className="min-w-0 truncate">
                                {tenantData.name}
                            </span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <AppearanceSelect />
                            <LocaleSwitcher />
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                    <motion.section
                        initial="hidden"
                        animate="visible"
                        variants={stagger()}
                        className="grid min-h-[calc(100vh-8rem)] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]"
                    >
                        <div>
                            <motion.div
                                variants={fadeUp}
                                className="flex flex-wrap items-center gap-3"
                            >
                                <Badge
                                    variant="outline"
                                    className="gap-2 bg-background/70 px-3 py-1.5 font-mono tracking-wider uppercase"
                                >
                                    <ShieldCheck aria-hidden="true" />
                                    {t('tenantWelcome.kicker')}
                                </Badge>
                                <Badge
                                    variant={statusVariant}
                                    className="gap-2"
                                >
                                    <span className="size-1.5 rounded-full bg-current" />
                                    {t(
                                        `tenantWelcome.status.${tenantData.status}`,
                                        {
                                            defaultValue: tenantData.status,
                                        },
                                    )}
                                </Badge>
                            </motion.div>

                            <motion.div
                                variants={fadeUp}
                                className="mt-8 flex items-center gap-5"
                            >
                                <Avatar className="size-20 rounded-lg border bg-background shadow-sm">
                                    <TenantInitial tenantData={tenantData} />
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                                        {domain}
                                    </p>
                                    <h1 className="mt-2 text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                                        {t('tenantWelcome.title', {
                                            name: tenantData.name,
                                        })}
                                    </h1>
                                </div>
                            </motion.div>

                            <motion.p
                                variants={fadeUp}
                                className="mt-7 max-w-2xl text-base leading-8 text-pretty text-muted-foreground sm:text-lg"
                            >
                                {t('tenantWelcome.explanation')}
                            </motion.p>

                            <motion.div
                                variants={fadeUp}
                                className="mt-9 flex flex-col gap-3 sm:flex-row"
                            >
                                {auth.user ? (
                                    <Button asChild size="lg">
                                        <Link href={dashboard()}>
                                            {t(
                                                'tenantWelcome.actions.dashboard',
                                            )}
                                            <ArrowRight data-icon="inline-end" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        {canLogin && (
                                            <Button asChild size="lg">
                                                <Link href={login()}>
                                                    {t(
                                                        'tenantWelcome.actions.login',
                                                    )}
                                                    <ArrowRight data-icon="inline-end" />
                                                </Link>
                                            </Button>
                                        )}
                                        {canRegister && (
                                            <Button
                                                asChild
                                                size="lg"
                                                variant="outline"
                                            >
                                                <Link href={register()}>
                                                    {t(
                                                        'tenantWelcome.actions.register',
                                                    )}
                                                </Link>
                                            </Button>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        </div>

                        <motion.div
                            variants={fadeUp}
                            className="grid gap-4 rounded-lg border bg-background/80 p-4 shadow-xl shadow-foreground/5 backdrop-blur"
                        >
                            <div className="rounded-lg border bg-muted/35 p-5">
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                                            {t('tenantWelcome.infoPanelTitle')}
                                        </p>
                                        <p className="mt-1 text-xl font-semibold">
                                            {tenantData.name}
                                        </p>
                                    </div>
                                    <Fingerprint
                                        className="size-5 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="grid gap-3">
                                    {metaItems.map((item) => (
                                        <div
                                            key={item.label}
                                            className="flex items-center justify-between gap-4 rounded-md border bg-background px-3 py-2.5"
                                        >
                                            <span className="text-sm text-muted-foreground">
                                                {item.label}
                                            </span>
                                            <span className="truncate text-sm font-medium">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border bg-card p-5 text-card-foreground">
                                <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                                    tenant context
                                </p>
                                <div className="mt-4 grid gap-3 font-mono text-xs">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted-foreground">
                                            {t('tenantWelcome.meta.tenantId')}
                                        </span>
                                        <span className="truncate text-muted-foreground">
                                            {tenantData.id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted-foreground">
                                            {t('tenantWelcome.meta.slug')}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {tenantData.slug}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted-foreground">
                                            {t('tenantWelcome.meta.domain')}
                                        </span>
                                        <span className="truncate text-muted-foreground">
                                            {domain}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.section>

                    <Separator className="my-14" />

                    <motion.section
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={stagger()}
                        className="pb-16"
                    >
                        <motion.div variants={fadeUp} className="max-w-2xl">
                            <Badge variant="outline" className="mb-4">
                                {t('tenantWelcome.isolationTitle')}
                            </Badge>
                            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                {t('tenantWelcome.isolationTitle')}
                            </h2>
                            <p className="mt-4 leading-7 text-muted-foreground">
                                {t('tenantWelcome.isolationSubtitle')}
                            </p>
                        </motion.div>

                        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                            {isolationKeys.map((key) => {
                                const Icon = ISOLATION_ICONS[key];

                                return (
                                    <motion.div key={key} variants={fadeUp}>
                                        <Card className="h-full gap-4 rounded-lg bg-background/80 shadow-none transition duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lg hover:shadow-foreground/5">
                                            <CardHeader className="gap-4">
                                                <div className="flex size-11 items-center justify-center rounded-lg border bg-muted/60">
                                                    <Icon
                                                        className="size-5"
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                                <CardTitle className="text-lg leading-tight">
                                                    {t(
                                                        `tenantWelcome.isolationItems.${key}.title`,
                                                    )}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription className="leading-relaxed">
                                                    {t(
                                                        `tenantWelcome.isolationItems.${key}.description`,
                                                    )}
                                                </CardDescription>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.section>
                </main>
                <footer className="border-t border-border/70 bg-background/80">
                    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
                        <span>
                            &copy; {currentYear} {tenantData.name}
                        </span>
                        <span className="flex items-center gap-2">
                            {t('tenantWelcome.poweredBy', {
                                name: 'Maestro',
                            })}
                            <span className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
                                <AppLogoIcon
                                    className="size-4 fill-current"
                                    aria-hidden="true"
                                />
                            </span>
                        </span>
                    </div>
                </footer>
            </div>
        </>
    );
}
