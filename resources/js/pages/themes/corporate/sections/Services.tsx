import { BriefcaseBusiness, Layers3, ShieldCheck } from 'lucide-react';
import type { CorporateSectionProps } from './types';

const items = [
    ['Strategy', BriefcaseBusiness],
    ['Delivery', Layers3],
    ['Reliability', ShieldCheck],
] as const;

export default function Services({ section }: CorporateSectionProps) {
    return (
        <section className="border-b bg-muted/20 py-20 sm:py-24">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Services"
                    title={section.variant === 'grid' ? 'Service grid' : 'Core services'}
                />
                <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {items.map(([title, Icon]) => (
                        <article
                            key={title}
                            className="rounded-2xl border bg-background p-6 shadow-sm"
                        >
                            <Icon className="size-5" aria-hidden="true" />
                            <h3 className="mt-5 font-semibold">{title}</h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Section content will come from tenant-managed
                                data in a later layer.
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function SectionHeading({
    eyebrow,
    title,
}: {
    eyebrow: string;
    title: string;
}) {
    return (
        <div>
            <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                {title}
            </h2>
        </div>
    );
}