import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import type { CorporateSectionProps } from './types';

export default function Hero({ tenantData, section }: CorporateSectionProps) {
    const centered = section.variant === 'centered';

    return (
        <section id="hero" className="relative overflow-hidden border-b">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-32 top-0 size-96 rounded-full bg-muted blur-3xl" />
                <div className="absolute left-0 top-24 size-72 rounded-full bg-muted/60 blur-3xl" />
            </div>

            <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
                <div
                    className={[
                        'grid items-center gap-12',
                        centered ? 'mx-auto max-w-4xl text-center' : 'lg:grid-cols-[1.08fr_0.92fr]',
                    ].join(' ')}
                >
                    <div>
                        <div
                            className={[
                                'inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium shadow-sm',
                                centered ? 'mx-auto' : '',
                            ].join(' ')}
                        >
                            <Sparkles className="size-3.5" aria-hidden="true" />
                            <span>{tenantData.industry ?? 'Corporate Solutions'}</span>
                        </div>

                        <h1 className="mt-6 text-5xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
                            {tenantData.name}
                        </h1>

                        <p
                            className={[
                                'mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg',
                                centered ? 'mx-auto' : '',
                            ].join(' ')}
                        >
                            A confident digital presence with a clear message,
                            flexible sections, and a foundation designed to evolve
                            with your business.
                        </p>

                        <div
                            className={[
                                'mt-8 flex flex-col gap-3 sm:flex-row',
                                centered ? 'justify-center' : '',
                            ].join(' ')}
                        >
                            <a
                                href="#services"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
                            >
                                Explore services
                                <ArrowRight className="size-4" />
                            </a>
                            <a
                                href="#about"
                                className="inline-flex items-center justify-center gap-2 rounded-full border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted"
                            >
                                Discover more
                                <ArrowUpRight className="size-4" />
                            </a>
                        </div>

                        <div
                            className={[
                                'mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground',
                                centered ? 'justify-center' : '',
                            ].join(' ')}
                        >
                            <span>{tenantData.domain}</span>
                            {tenantData.region ? <span>{tenantData.region}</span> : null}
                            <span>Blueprint-driven</span>
                        </div>
                    </div>

                    {!centered ? (
                        <div className="relative">
                            <div className="rounded-[2rem] border bg-background/80 p-3 shadow-2xl shadow-foreground/5">
                                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border bg-muted/40">
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />
                                    <div className="absolute inset-x-8 top-8 flex items-center justify-between">
                                        <span className="rounded-full border bg-background/85 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                                            {tenantData.status}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {tenantData.region ?? 'Global'}
                                        </span>
                                    </div>

                                    <div className="absolute inset-0 flex items-center justify-center p-8">
                                        <div className="w-full max-w-sm rounded-[1.5rem] border bg-background p-6 shadow-xl">
                                            <div className="flex items-center gap-4">
                                                <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl border bg-muted">
                                                    {tenantData.logo ? (
                                                        <img
                                                            src={tenantData.logo}
                                                            alt={tenantData.name}
                                                            className="size-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xl font-semibold">
                                                            {tenantData.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold">
                                                        {tenantData.name}
                                                    </p>
                                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                                        {tenantData.domain}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-6 grid grid-cols-3 gap-3">
                                                {[
                                                    ['01', 'Strategy'],
                                                    ['02', 'Delivery'],
                                                    ['03', 'Growth'],
                                                ].map(([number, label]) => (
                                                    <div key={number} className="rounded-2xl border p-3">
                                                        <p className="text-[10px] font-semibold text-muted-foreground">
                                                            {number}
                                                        </p>
                                                        <p className="mt-5 text-xs font-medium">{label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
