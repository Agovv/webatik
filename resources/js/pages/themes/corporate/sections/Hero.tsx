import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CorporateSectionProps } from './types';

export default function Hero({
    tenantData,
    section,
}: CorporateSectionProps) {
    const isCentered = section.variant === 'centered';

    return (
        <section className="border-b bg-background">
            <div
                className={[
                    'mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8',
                    isCentered ? 'text-center' : '',
                ].join(' ')}
            >
                <div
                    className={[
                        'grid items-center gap-10',
                        isCentered
                            ? 'mx-auto max-w-3xl'
                            : 'lg:grid-cols-[1.1fr_0.9fr]',
                    ].join(' ')}
                >
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            {tenantData.domain}
                        </p>
                        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                            {tenantData.name}
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                            A clean corporate foundation built from a
                            blueprint-driven section composition.
                        </p>
                        <Button className="mt-8" size="lg">
                            Explore
                            <ArrowRight data-icon="inline-end" />
                        </Button>
                    </div>

                    <div className="rounded-3xl border bg-muted/30 p-8 shadow-sm">
                        <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border bg-background">
                            {tenantData.logo ? (
                                <img
                                    src={tenantData.logo}
                                    alt={tenantData.name}
                                    className="size-28 rounded-2xl object-cover"
                                />
                            ) : (
                                <span className="text-5xl font-semibold">
                                    {tenantData.name
                                        .charAt(0)
                                        .toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}