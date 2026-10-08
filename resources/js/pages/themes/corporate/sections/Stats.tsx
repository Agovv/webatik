import { Building2, Compass, Globe2, ShieldCheck } from 'lucide-react';
import type { CorporateSectionProps } from './types';

export default function Stats({ tenantData, section }: CorporateSectionProps) {
    const items = [
        { label: 'Region', value: tenantData.region ?? 'Not set', icon: Compass },
        { label: 'Industry', value: tenantData.industry ?? 'Corporate', icon: Building2 },
        { label: 'Status', value: tenantData.status, icon: ShieldCheck },
        { label: 'Presence', value: tenantData.domain, icon: Globe2 },
    ];

    const cards = section.variant === 'cards';

    return (
        <section id="stats" className="scroll-mt-20 border-b bg-muted/20 py-14 sm:py-16">
            <div
                className={[
                    'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
                    cards ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4' : '',
                ].join(' ')}
            >
                {!cards ? (
                    <div className="grid overflow-hidden rounded-[1.5rem] border bg-background sm:grid-cols-2 lg:grid-cols-4">
                        {items.map(({ label, value, icon: Icon }, index) => (
                            <div
                                key={label}
                                className={[
                                    'p-6 sm:p-7',
                                    index > 0 ? 'border-t sm:border-l sm:border-t-0' : '',
                                    index > 1 ? 'lg:border-t-0' : '',
                                    index > 0 ? 'lg:border-l' : '',
                                ].join(' ')}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                        {label}
                                    </span>
                                    <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                                </div>
                                <p className="mt-4 truncate text-lg font-semibold capitalize">{value}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    items.map(({ label, value, icon: Icon }) => (
                        <div
                            key={label}
                            className="rounded-[1.5rem] border bg-background p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-xl border bg-muted/50">
                                    <Icon className="size-4" aria-hidden="true" />
                                </span>
                                <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    {label}
                                </span>
                            </div>
                            <p className="mt-6 truncate text-xl font-semibold capitalize">{value}</p>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
