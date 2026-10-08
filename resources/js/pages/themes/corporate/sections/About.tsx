import { ArrowUpRight, Check } from 'lucide-react';
import type { CorporateSectionProps } from './types';
import SectionHeading from './SectionHeading';

const points = [
    'Structured information architecture',
    'Responsive by default',
    'Ready for tenant-managed content',
];

export default function About({ tenantData, section }: CorporateSectionProps) {
    const reversed = section.variant === 'image-right';

    const copy = (
        <div>
            <SectionHeading
                eyebrow="About"
                title="Built around clarity, not decoration."
                description={`${tenantData.name} starts with a strong corporate structure that can later evolve into a fully content-managed experience.`}
            />

            <div className="mt-8 grid gap-3">
                {points.map((point) => (
                    <div key={point} className="flex items-center gap-3 text-sm">
                        <span className="flex size-7 items-center justify-center rounded-full border bg-muted/50">
                            <Check className="size-3.5" aria-hidden="true" />
                        </span>
                        <span>{point}</span>
                    </div>
                ))}
            </div>

            <a
                href="#projects"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold"
            >
                See selected work
                <ArrowUpRight className="size-4" />
            </a>
        </div>
    );

    const visual = (
        <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border bg-muted/30 p-3 shadow-sm">
                <div className="relative min-h-96 overflow-hidden rounded-[1.5rem] border bg-background">
                    <div className="absolute -right-16 -top-16 size-48 rounded-full border" />
                    <div className="absolute -bottom-20 -left-16 size-56 rounded-full border" />

                    <div className="relative z-10 flex min-h-96 flex-col justify-between p-7 sm:p-8">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-[0.18em] uppercase">
                                {tenantData.industry ?? 'Corporate'}
                            </span>
                            <ArrowUpRight className="size-5" aria-hidden="true" />
                        </div>

                        <div>
                            <p className="text-6xl font-semibold tracking-[-0.05em] sm:text-7xl">
                                {tenantData.name.charAt(0).toUpperCase()}
                            </p>
                            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                                A visual identity space prepared for real brand assets in the content layer.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border bg-muted/40 p-4">
                                <p className="text-xs text-muted-foreground">Region</p>
                                <p className="mt-2 font-medium">{tenantData.region ?? 'Not set'}</p>
                            </div>
                            <div className="rounded-2xl border bg-muted/40 p-4">
                                <p className="text-xs text-muted-foreground">Status</p>
                                <p className="mt-2 font-medium capitalize">{tenantData.status}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <section id="about" className="scroll-mt-20 border-b py-20 sm:py-28">
            <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
                {reversed ? (
                    <>
                        {visual}
                        {copy}
                    </>
                ) : (
                    <>
                        {copy}
                        {visual}
                    </>
                )}
            </div>
        </section>
    );
}
