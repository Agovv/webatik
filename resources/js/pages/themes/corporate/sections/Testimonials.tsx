import { Quote } from 'lucide-react';
import type { CorporateSectionProps } from './types';

export default function Testimonials({
    section,
}: CorporateSectionProps) {
    return (
        <section className="border-b bg-muted/20 py-20 sm:py-24">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                    Testimonials
                </p>
                <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {['Client One', 'Client Two', 'Client Three'].map(
                        (name) => (
                            <blockquote
                                key={name}
                                className="rounded-2xl border bg-background p-6"
                            >
                                <Quote className="size-5" aria-hidden="true" />
                                <p className="mt-5 leading-7 text-muted-foreground">
                                    A structured testimonial block ready for
                                    tenant content.
                                </p>
                                <footer className="mt-6 text-sm font-medium">
                                    {name}
                                </footer>
                            </blockquote>
                        ),
                    )}
                </div>
                {section.variant === 'quote' && (
                    <p className="mt-5 text-xs text-muted-foreground">
                        Quote variant selected.
                    </p>
                )}
            </div>
        </section>
    );
}