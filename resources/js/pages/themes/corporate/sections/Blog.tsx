import { ArrowUpRight } from 'lucide-react';
import type { CorporateSectionProps } from './types';

export default function Blog({ section }: CorporateSectionProps) {
    return (
        <section className="border-b py-20 sm:py-24">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                            Blog
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                            Latest articles
                        </h2>
                    </div>
                    {section.variant === 'featured' && (
                        <span className="text-xs text-muted-foreground">
                            Featured variant
                        </span>
                    )}
                </div>
                <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {['Article One', 'Article Two', 'Article Three'].map(
                        (title) => (
                            <article
                                key={title}
                                className="rounded-2xl border bg-background p-5 shadow-sm"
                            >
                                <div className="aspect-[16/9] rounded-xl border bg-muted/30" />
                                <h3 className="mt-5 font-semibold">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Blog content will be supplied by the blog
                                    module.
                                </p>
                                <button
                                    type="button"
                                    className="mt-5 inline-flex items-center gap-1 text-sm font-medium"
                                >
                                    Read more
                                    <ArrowUpRight className="size-4" />
                                </button>
                            </article>
                        ),
                    )}
                </div>
            </div>
        </section>
    );
}