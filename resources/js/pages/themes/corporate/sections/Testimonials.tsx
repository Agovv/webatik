import { Quote } from 'lucide-react';
import type { CorporateSectionProps } from './types';
import SectionHeading from './SectionHeading';

const testimonials = [
    ['Client One', 'Managing Director'],
    ['Client Two', 'Operations Lead'],
    ['Client Three', 'Founder'],
];

export default function Testimonials({ section }: CorporateSectionProps) {
    const quoteVariant = section.variant === 'quote';

    return (
        <section id="testimonials" className="scroll-mt-20 border-b bg-muted/20 py-20 sm:py-28">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Testimonials"
                    title="Credibility belongs in the experience."
                    description="A focused testimonial layer gives future tenant content a natural place to build trust without taking over the page."
                    align="center"
                />

                <div
                    className={[
                        'mt-12 grid gap-5',
                        quoteVariant ? 'lg:grid-cols-[1.2fr_0.9fr_0.9fr]' : 'md:grid-cols-3',
                    ].join(' ')}
                >
                    {testimonials.map(([name, role]) => (
                        <blockquote key={name} className="rounded-[1.75rem] border bg-background p-7 shadow-sm sm:p-8">
                            <Quote className="size-5" aria-hidden="true" />
                            <p className="mt-8 text-lg leading-8 tracking-tight">
                                “A structured website should make the next step obvious and the brand feel dependable.”
                            </p>
                            <footer className="mt-8 flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-full border bg-muted text-xs font-semibold">
                                    {name.charAt(0)}
                                </span>
                                <span>
                                    <span className="block text-sm font-semibold">{name}</span>
                                    <span className="block text-xs text-muted-foreground">{role}</span>
                                </span>
                            </footer>
                        </blockquote>
                    ))}
                </div>
            </div>
        </section>
    );
}
