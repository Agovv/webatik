import { ArrowUpRight, CalendarDays } from 'lucide-react';
import type { CorporateSectionProps } from './types';
import SectionHeading from './SectionHeading';

const articles = [
    ['Article One', 'Business insight'],
    ['Article Two', 'Company news'],
    ['Article Three', 'Expert perspective'],
];

export default function Blog({ section }: CorporateSectionProps) {
    const featured = section.variant === 'featured';

    return (
        <section id="blog" className="scroll-mt-20 border-b py-20 sm:py-28">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <SectionHeading
                        eyebrow="Blog"
                        title="Useful content, not filler."
                        description="The blog module can later replace these cards with real posts while keeping the same theme presentation."
                    />
                    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="size-4" aria-hidden="true" />
                        Content-ready
                    </span>
                </div>

                <div
                    className={[
                        'mt-12 grid gap-5',
                        featured ? 'lg:grid-cols-[1.25fr_0.75fr]' : 'md:grid-cols-3',
                    ].join(' ')}
                >
                    {articles.map(([title, category], index) => (
                        <article
                            key={title}
                            className={[
                                'group overflow-hidden rounded-[1.75rem] border bg-card shadow-sm',
                                featured && index === 0 ? 'lg:row-span-2' : '',
                            ].join(' ')}
                        >
                            <div className="relative aspect-[16/9] overflow-hidden border-b bg-muted/30">
                                <div className="absolute inset-0 bg-gradient-to-br from-muted/60 via-transparent to-muted/20" />
                                <div className="absolute left-6 top-6 rounded-full border bg-background/85 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase backdrop-blur">
                                    {category}
                                </div>
                                <div className="absolute bottom-6 right-6 size-20 rounded-[1.25rem] border bg-background/80 shadow-lg backdrop-blur" />
                            </div>

                            <div className="flex items-end justify-between gap-4 p-6 sm:p-7">
                                <div>
                                    <p className="text-xs text-muted-foreground">{index + 1} / 03</p>
                                    <h3 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
                                        {title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        A future tenant-managed article can replace this introduction.
                                    </p>
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
