import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { CorporateSectionProps } from './types';

export default function CTA({ section, tenantData }: CorporateSectionProps) {
    const split = section.variant === 'split';

    return (
        <section id="cta" className="scroll-mt-20 border-b py-20 sm:py-28">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div
                    className={[
                        'relative overflow-hidden rounded-[2rem] bg-foreground px-7 py-10 text-background shadow-2xl shadow-foreground/10 sm:px-10 sm:py-12 lg:px-14 lg:py-14',
                        split ? 'lg:flex lg:items-end lg:justify-between lg:gap-12' : 'text-center',
                    ].join(' ')}
                >
                    <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full border border-background/10" />
                    <div className="pointer-events-none absolute -bottom-28 left-1/3 size-72 rounded-full border border-background/10" />

                    <div className={split ? 'relative max-w-2xl' : 'relative mx-auto max-w-3xl'}>
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-60">
                            Contact
                        </p>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                            Ready to turn attention into action?
                        </h2>
                        <p className="mt-4 text-base leading-7 opacity-75 sm:text-lg">
                            {tenantData.name} now has a flexible corporate foundation
                            that can grow into a content-managed site.
                        </p>
                    </div>

                    <a
                        href={`https://${tenantData.domain}`}
                        className={[
                            'relative mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-background px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5 lg:shrink-0',
                            split ? 'lg:mt-0' : '',
                        ].join(' ')}
                    >
                        Get in touch
                        <ArrowRight className="size-4" />
                    </a>

                    {!split ? (
                        <span className="relative mx-auto mt-5 inline-flex items-center gap-1 text-xs opacity-60">
                            {tenantData.domain}
                            <ArrowUpRight className="size-3.5" />
                        </span>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
