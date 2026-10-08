import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CorporateSectionProps } from './types';

export default function CTA({ section, tenantData }: CorporateSectionProps) {
    const split = section.variant === 'split';

    return (
        <section className="border-b py-20 sm:py-24">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <div
                    className={[
                        'rounded-3xl border bg-foreground p-8 text-background shadow-sm sm:p-12',
                        split ? 'lg:flex lg:items-center lg:justify-between lg:gap-10' : '',
                    ].join(' ')}
                >
                    <div>
                        <p className="text-xs font-medium tracking-[0.2em] uppercase opacity-70">
                            CTA
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                            Ready for the next step?
                        </h2>
                        <p className="mt-4 max-w-2xl leading-7 opacity-75">
                            {tenantData.name} can later manage this content
                            from the tenant page layer.
                        </p>
                    </div>
                    <Button
                        className="mt-7 bg-background text-foreground hover:bg-background/90 lg:mt-0"
                        size="lg"
                    >
                        Get started
                        <ArrowRight data-icon="inline-end" />
                    </Button>
                </div>
            </div>
        </section>
    );
}