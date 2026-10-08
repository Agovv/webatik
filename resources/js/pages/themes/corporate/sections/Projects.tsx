import type { CorporateSectionProps } from './types';

export default function Projects({ section }: CorporateSectionProps) {
    const featured = section.variant === 'featured';

    return (
        <section className="border-b py-20 sm:py-24">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                    Projects
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                    Selected work
                </h2>
                <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {['Project Alpha', 'Project Beta', 'Project Gamma'].map(
                        (name, index) => (
                            <article
                                key={name}
                                className={[
                                    'rounded-2xl border bg-muted/20 p-6',
                                    featured && index === 0
                                        ? 'md:col-span-2'
                                        : '',
                                ].join(' ')}
                            >
                                <div className="aspect-[16/10] rounded-xl border bg-background" />
                                <h3 className="mt-5 font-semibold">{name}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Project presentation placeholder.
                                </p>
                            </article>
                        ),
                    )}
                </div>
            </div>
        </section>
    );
}