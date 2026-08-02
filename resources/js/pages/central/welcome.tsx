import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Blocks,
    Database,
    Fingerprint,
    Globe,
    KeyRound,
    Languages,
    Moon,
    Play,
    ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AppLogoIcon from '@/components/app-logo-icon';
import AppearanceSelect from '@/components/appearance-select';
import { PlanCard } from '@/components/billing/plan-card';
import LocaleSwitcher from '@/components/LocaleSwitcher';
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
import { toInternalUrl } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';
import { store as checkout } from '@/routes/billing/checkout';
import type { Plan } from '@/types';

import type { Variants } from 'motion/react';

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

const stack = [
    'Laravel 13',
    'Inertia 3',
    'React 19',
    'Tailwind 4',
    'Fortify',
    'Wayfinder',
    'Pest 4',
    'stancl/tenancy',
];

const codeSnippet = `use App\\Models\\Tenant;

$tenant = Tenant::create([
    'name' => 'Acme Corp',
]);

$tenant->domains()->create([
    'domain' => 'acme.maestro.test',
]);`;

const FEATURE_ICONS = {
    tenancy: Globe,
    rbac: ShieldCheck,
    i18n: Languages,
    themes: Moon,
    security: KeyRound,
    ids: Fingerprint,
} as const;

type FeatureKey = keyof typeof FEATURE_ICONS;

const featureKeys: FeatureKey[] = [
    'tenancy',
    'rbac',
    'i18n',
    'themes',
    'security',
    'ids',
];

function FeatureCard({
    featureKey,
    title,
    description,
}: {
    featureKey: FeatureKey;
    title: string;
    description: string;
}) {
    const Icon = FEATURE_ICONS[featureKey];

    return (
        <motion.div variants={fadeUp} className="h-full">
            <Card className="h-full gap-4 rounded-lg border-border/70 bg-background/75 shadow-none transition duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lg hover:shadow-foreground/5">
                <CardHeader className="gap-4">
                    <div className="flex size-11 items-center justify-center rounded-lg border bg-muted/60">
                        <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-lg leading-tight">
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription className="leading-relaxed">
                        {description}
                    </CardDescription>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function CentralWelcome() {
    const { t } = useTranslation();
    const { auth, canLogin, canRegister, plans } = usePage()
        .props as unknown as {
        auth: { user: { name: string } | null };
        canLogin: boolean;
        canRegister: boolean;
        plans: Plan[];
    };
    const [billingInterval, setBillingInterval] = useState<'month' | 'year'>(
        'month',
    );

    const currentYear = new Date().getFullYear();

    return (
        <>
            <Head title={t('home.centralTitle')}>
                <meta
                    name="description"
                    content="Maestro is a production-ready Laravel 13 and Inertia 3 multitenant SaaS foundation with RBAC, i18n, themes, and passkeys."
                />
            </Head>

            <div className="min-h-screen overflow-hidden bg-background text-foreground">
                <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,var(--chart-2)_0,transparent_24rem),radial-gradient(circle_at_82%_8%,var(--chart-4)_0,transparent_18rem),linear-gradient(180deg,var(--background),var(--muted))] opacity-[0.14] dark:opacity-[0.18]" />
                <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.18]" />

                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="sticky top-0 z-40 border-b border-border/60 bg-background/82 backdrop-blur-xl"
                >
                    <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-3">
                            <span className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
                                <AppLogoIcon
                                    className="size-5 fill-current"
                                    aria-hidden="true"
                                />
                            </span>
                            <span className="text-base font-semibold tracking-tight">
                                {t('welcome.brand')}
                            </span>
                        </Link>

                        <nav className="hidden items-center gap-1 rounded-lg border bg-background/70 p-1 text-sm text-muted-foreground md:flex">
                            {[
                                ['#features', t('welcome.nav.features')],
                                ['#pricing', 'Pricing'],
                                ['#stack', t('welcome.nav.stack')],
                                ['#demo', t('welcome.nav.demo')],
                                ['#code', t('welcome.nav.code')],
                            ].map(([href, label]) => (
                                <a
                                    key={href}
                                    href={href}
                                    className="rounded-md px-3 py-1.5 transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            <AppearanceSelect />
                            <LocaleSwitcher />
                            {auth.user ? (
                                <Button asChild>
                                    <Link href={dashboard()}>
                                        {t('welcome.dashboard')}
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Button
                                            asChild
                                            variant="ghost"
                                            className="hidden sm:inline-flex"
                                        >
                                            <Link href={login()}>
                                                {t('welcome.logIn')}
                                            </Link>
                                        </Button>
                                    )}
                                    {canRegister && (
                                        <Button asChild>
                                            <Link href={register()}>
                                                {t('welcome.register')}
                                                <ArrowRight data-icon="inline-end" />
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </motion.header>

                <main>
                    <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={stagger()}
                            className="max-w-3xl"
                        >
                            <motion.div variants={fadeUp}>
                                <Badge
                                    variant="outline"
                                    className="gap-2 bg-background/70 px-3 py-1.5 font-mono tracking-wider uppercase"
                                >
                                    <Blocks aria-hidden="true" />
                                    {t('welcome.hero.badge')}
                                </Badge>
                            </motion.div>

                            <motion.h1
                                variants={fadeUp}
                                className="mt-7 text-5xl leading-[0.96] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
                            >
                                {t('welcome.hero.title')}{' '}
                                <span className="font-serif text-muted-foreground italic">
                                    {t('welcome.hero.titleAccent')}
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={fadeUp}
                                className="mt-7 max-w-2xl text-base leading-8 text-pretty text-muted-foreground sm:text-lg"
                            >
                                {t('welcome.hero.subtitle')}
                            </motion.p>

                            <motion.div
                                variants={fadeUp}
                                className="mt-9 flex flex-col gap-3 sm:flex-row"
                            >
                                {canRegister && !auth.user && (
                                    <Button asChild size="lg">
                                        <Link href={register()}>
                                            {t('welcome.hero.ctaPrimary')}
                                            <ArrowRight data-icon="inline-end" />
                                        </Link>
                                    </Button>
                                )}
                                <Button asChild size="lg" variant="outline">
                                    <a href="#demo">
                                        <Play
                                            data-icon="inline-start"
                                            aria-hidden="true"
                                        />
                                        {t('welcome.hero.ctaSecondary')}
                                    </a>
                                </Button>
                            </motion.div>

                            <motion.div
                                variants={fadeUp}
                                className="mt-12 grid max-w-xl grid-cols-3 gap-3 text-sm"
                            >
                                {[
                                    ['SSR', 'Inertia 3'],
                                    ['Auth', 'Fortify'],
                                    ['IDs', 'ULID'],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="rounded-lg border bg-background/70 p-4"
                                    >
                                        <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                                            {label}
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 18 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.65, delay: 0.12 }}
                            className="relative"
                        >
                            <div className="absolute -inset-6 -z-10 rounded-[2rem] border bg-background/30 blur-2xl" />
                            <Card className="overflow-hidden rounded-lg border-border/80 bg-neutral-950 py-0 text-neutral-100 shadow-2xl shadow-foreground/10">
                                <CardHeader className="flex-row items-center justify-between border-b border-neutral-800 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="size-2.5 rounded-full bg-rose-400" />
                                        <span className="size-2.5 rounded-full bg-amber-300" />
                                        <span className="size-2.5 rounded-full bg-emerald-400" />
                                    </div>
                                    <span className="font-mono text-xs text-neutral-500">
                                        tenant:acme
                                    </span>
                                </CardHeader>
                                <CardContent className="grid gap-4 p-5">
                                    <div className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-mono text-xs tracking-wider text-neutral-500 uppercase">
                                                    status
                                                </p>
                                                <p className="mt-1 text-xl font-semibold">
                                                    Production ready
                                                </p>
                                            </div>
                                            <Badge variant="success">
                                                live
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            ['tenants', '128'],
                                            ['domains', '342'],
                                            ['roles', '24'],
                                            ['locales', '2'],
                                        ].map(([label, value]) => (
                                            <div
                                                key={label}
                                                className="rounded-lg border border-neutral-800 bg-neutral-900/45 p-4"
                                            >
                                                <p className="font-mono text-xs text-neutral-500">
                                                    {label}
                                                </p>
                                                <p className="mt-2 text-2xl font-semibold">
                                                    {value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="rounded-lg border border-neutral-800 bg-neutral-900/45 p-4">
                                        <div className="mb-3 flex items-center gap-2 text-sm text-neutral-400">
                                            <Database className="size-4" />
                                            tenant database provisioned
                                        </div>
                                        <div className="h-2 rounded-full bg-neutral-800">
                                            <div className="h-2 w-[76%] rounded-full bg-neutral-100" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </section>

                    <section
                        id="features"
                        className="border-y border-border/70 bg-muted/25 py-20"
                    >
                        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                className="mb-10 max-w-2xl"
                            >
                                <Badge variant="outline" className="mb-4">
                                    {t('welcome.features.kicker')}
                                </Badge>
                                <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                    {t('welcome.features.title')}
                                </h2>
                                <p className="mt-4 leading-7 text-muted-foreground">
                                    {t('welcome.features.subtitle')}
                                </p>
                            </motion.div>

                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-80px' }}
                                variants={stagger()}
                                className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
                            >
                                {featureKeys.map((key) => (
                                    <FeatureCard
                                        key={key}
                                        featureKey={key}
                                        title={t(
                                            `welcome.features.items.${key}.title`,
                                        )}
                                        description={t(
                                            `welcome.features.items.${key}.description`,
                                        )}
                                    />
                                ))}
                            </motion.div>
                        </div>
                    </section>

                    <section
                        id="stack"
                        className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                        >
                            <Badge variant="outline" className="mb-4">
                                {t('welcome.stack.kicker')}
                            </Badge>
                            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                {t('welcome.stack.title')}
                            </h2>
                            <p className="mt-4 leading-7 text-muted-foreground">
                                {t('welcome.stack.subtitle')}
                            </p>
                        </motion.div>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-80px' }}
                            variants={stagger()}
                            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                        >
                            {stack.map((item) => (
                                <motion.div
                                    key={item}
                                    variants={fadeUp}
                                    className="rounded-lg border bg-background p-4 shadow-sm"
                                >
                                    <p className="font-mono text-sm">{item}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </section>

                    <section
                        id="demo"
                        className="border-y border-border/70 bg-foreground py-20 text-background"
                    >
                        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                className="self-center"
                            >
                                <Badge className="mb-4 bg-background text-foreground">
                                    {t('welcome.demo.kicker')}
                                </Badge>
                                <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                    {t('welcome.demo.title')}
                                </h2>
                                <p className="mt-4 leading-7 text-background/70">
                                    {t('welcome.demo.subtitle')}
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{ duration: 0.55 }}
                                className="overflow-hidden rounded-lg border border-background/15 bg-neutral-950 shadow-2xl"
                            >
                                <video
                                    className="aspect-video w-full object-cover"
                                    src="/video/maestro-demo.mp4"
                                    poster="/video/maestro-demo-poster.png"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                >
                                    {t('welcome.demo.fallback')}
                                </video>
                                <p className="border-t border-background/10 px-4 py-3 font-mono text-xs text-background/50">
                                    {t('welcome.demo.comingSoon')}
                                </p>
                            </motion.div>
                        </div>
                    </section>

                    <section
                        id="code"
                        className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            className="self-center"
                        >
                            <Badge variant="outline" className="mb-4">
                                {t('welcome.code.kicker')}
                            </Badge>
                            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                {t('welcome.code.title')}
                            </h2>
                            <p className="mt-4 leading-7 text-muted-foreground">
                                {t('welcome.code.subtitle')}
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                        >
                            <Card className="overflow-hidden rounded-lg border-neutral-800 bg-neutral-950 py-0 text-neutral-100 shadow-xl">
                                <CardHeader className="flex-row items-center gap-1.5 border-b border-neutral-800 bg-neutral-900 px-4 py-3">
                                    <span className="size-2.5 rounded-full bg-rose-500/80" />
                                    <span className="size-2.5 rounded-full bg-amber-500/80" />
                                    <span className="size-2.5 rounded-full bg-emerald-500/80" />
                                    <span className="ml-3 font-mono text-xs text-neutral-500">
                                        routes/starter.php
                                    </span>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <pre className="overflow-x-auto font-mono text-sm leading-relaxed">
                                        <code>{codeSnippet}</code>
                                    </pre>
                                </CardContent>
                                <CardContent className="border-t border-neutral-800 bg-neutral-900 px-6 py-3 font-mono text-xs text-neutral-500">
                                    {t('welcome.code.caption')}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </section>

                    <section
                        id="pricing"
                        className="border-t border-border/70 py-20"
                    >
                        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                                <div>
                                    <Badge variant="outline">
                                        Simple pricing
                                    </Badge>
                                    <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                                        A plan for every stage
                                    </h2>
                                    <p className="mt-3 text-muted-foreground">
                                        Every plan includes secure tenant
                                        isolation and complete billing control.
                                    </p>
                                </div>
                                <div className="flex rounded-lg border p-1">
                                    {(['month', 'year'] as const).map(
                                        (interval) => (
                                            <Button
                                                key={interval}
                                                type="button"
                                                variant={
                                                    billingInterval === interval
                                                        ? 'default'
                                                        : 'ghost'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setBillingInterval(interval)
                                                }
                                            >
                                                {interval === 'month'
                                                    ? 'Monthly'
                                                    : 'Yearly · save 2 months'}
                                            </Button>
                                        ),
                                    )}
                                </div>
                            </div>
                            <div className="grid gap-5 lg:grid-cols-3">
                                {plans.map((plan) => (
                                    <PlanCard
                                        key={plan.id}
                                        plan={plan}
                                        interval={billingInterval}
                                        onSelect={(priceId) =>
                                            auth.user
                                                ? router.post(
                                                      toInternalUrl(
                                                          checkout(priceId),
                                                      ),
                                                  )
                                                : router.visit(
                                                      register({
                                                          query: {
                                                              plan_price:
                                                                  priceId,
                                                          },
                                                      }),
                                                  )
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="border-t border-border/70 bg-muted/25 py-16">
                        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
                            <div>
                                <h2 className="text-3xl font-semibold tracking-tight text-balance">
                                    {t('welcome.cta.title')}
                                </h2>
                                <p className="mt-3 max-w-xl text-muted-foreground">
                                    {t('welcome.cta.subtitle')}
                                </p>
                            </div>
                            {!auth.user && canRegister ? (
                                <Button asChild size="lg">
                                    <Link href={register()}>
                                        {t('welcome.hero.ctaPrimary')}
                                        <ArrowRight data-icon="inline-end" />
                                    </Link>
                                </Button>
                            ) : auth.user ? (
                                <Button asChild size="lg">
                                    <Link href={dashboard()}>
                                        {t('welcome.dashboard')}
                                        <ArrowRight data-icon="inline-end" />
                                    </Link>
                                </Button>
                            ) : null}
                        </div>
                    </section>
                </main>

                <Separator />

                <footer className="py-8">
                    <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
                        <p>
                            {t('welcome.footer.copyright', {
                                year: currentYear,
                            })}
                        </p>
                        <p>{t('welcome.footer.madeWith')}</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
