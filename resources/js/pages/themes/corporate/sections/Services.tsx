import { ArrowUpRight, BriefcaseBusiness, Layers3, ShieldCheck } from 'lucide-react';
import type { CorporateSectionProps } from './types';
import SectionHeading from './SectionHeading';

const items = [
    {
        number: '01',
        title: 'Strategy',
        description:
            'Clarify your positioning, priorities, and next moves with a focused digital foundation.',
        icon: BriefcaseBusiness,
    },
    {
        number: '02',
        title: 'Delivery',
        description:
            'Turn your services and expertise into clear experiences that help visitors understand value faster.',
        icon: Layers3,
    },
    {
        number: '03',
        title: 'Reliability',
        description:
            'Build a dependable web presence with reusable sections and room for future content workflows.',
        icon: ShieldCheck,
    },
] as const;

export default function Services({ section }: CorporateSectionProps) {
    const grid = section.variant === 'grid';

    return (
        <section id="services" className="scroll-mt-20 border-b py-20 sm:py-28">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Services"
                    title="A clear structure for serious businesses."
                    description="Every section has a defined role today, while the composition remains ready for tenant-managed content and future visual editing."
                />

                <div
                    className={[
                        'mt-12 grid gap-5',
                        grid ? 'lg:grid-cols-2' : 'md:grid-cols-3',
                    ].join(' ')}
                >
                    {items.map(({ number, title, description, icon: Icon }) => (
                        <article
                            key={number}
                            className="group relative overflow-hidden rounded-[1.75rem] border bg-card p-7 shadow-sm transition-transform hover:-translate-y-1 sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">
                                    {number}
                                </span>
                                <span className="flex size-11 items-center justify-center rounded-2xl border bg-muted/50">
                                    <Icon className="size-5" aria-hidden="true" />
                                </span>
                            </div>

                            <h3 className="mt-16 text-xl font-semibold tracking-tight">{title}</h3>
                            <p className="mt-3 leading-7 text-muted-foreground">{description}</p>

                            <div className="mt-7 inline-flex items-center gap-1 text-sm font-medium">
                                Learn more
                                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
