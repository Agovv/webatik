import { ArrowUpRight } from 'lucide-react';
import type { CorporateSectionProps } from './types';
import SectionHeading from './SectionHeading';

const projects = [
    { number: '01', title: 'Project Alpha', label: 'Strategy & Growth' },
    { number: '02', title: 'Project Beta', label: 'Digital Experience' },
    { number: '03', title: 'Project Gamma', label: 'Operations & Delivery' },
];

export default function Projects({ section }: CorporateSectionProps) {
    const featured = section.variant === 'featured';

    return (
        <section id="projects" className="scroll-mt-20 border-b py-20 sm:py-28">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <SectionHeading
                        eyebrow="Projects"
                        title="Selected work with room for real content."
                        description="These presentation blocks are intentionally data-ready. The tenant content layer can replace every title, image, category, and description later."
                    />
                    <a
                        href="#cta"
                        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold"
                    >
                        Start a project
                        <ArrowUpRight className="size-4" />
                    </a>
                </div>

                <div className="mt-12 grid gap-5 md:grid-cols-3">
                    {projects.map(({ number, title, label }, index) => (
                        <article
                            key={number}
                            className={[
                                'group overflow-hidden rounded-[1.75rem] border bg-card shadow-sm transition-transform hover:-translate-y-1',
                                featured && index === 0 ? 'md:col-span-2' : '',
                            ].join(' ')}
                        >
                            <div className="relative aspect-[16/10] overflow-hidden border-b bg-muted/30">
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-muted/50 to-transparent" />
                                <div className="absolute left-6 top-6 flex size-12 items-center justify-center rounded-2xl border bg-background/85 text-sm font-semibold shadow-sm backdrop-blur">
                                    {number}
                                </div>
                                <div className="absolute bottom-6 right-6 h-24 w-40 rounded-[1.5rem] border bg-background/80 shadow-lg backdrop-blur" />
                            </div>

                            <div className="flex items-end justify-between gap-5 p-6 sm:p-7">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                                        {label}
                                    </p>
                                    <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>
                                </div>
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                    <ArrowUpRight className="size-4" aria-hidden="true" />
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
