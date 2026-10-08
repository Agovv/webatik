import type { CorporateSectionProps } from './types';

export default function SectionFallback({
    section,
}: CorporateSectionProps) {
    return (
        <section className="border-y bg-muted/30 py-16">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                    Section
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    {section.section}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    This section is registered but does not have a Corporate
                    component yet.
                </p>
            </div>
        </section>
    );
}