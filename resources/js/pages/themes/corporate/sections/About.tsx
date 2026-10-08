import type { CorporateSectionProps } from './types';

export default function About({ tenantData, section }: CorporateSectionProps) {
    const reversed = section.variant === 'image-right';

    const copy = (
        <div>
            <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                About
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Built around your business
            </h2>
            <p className="mt-5 max-w-xl leading-8 text-muted-foreground">
                {tenantData.name} gets a theme composition that can evolve from
                predefined sections into a full visual editing experience.
            </p>
        </div>
    );

    const visual = (
        <div className="min-h-72 rounded-3xl border bg-muted/30 p-4 shadow-sm">
            <div className="flex size-full min-h-64 items-center justify-center rounded-2xl border bg-background text-sm text-muted-foreground">
                About media
            </div>
        </div>
    );

    return (
        <section className="border-b py-20 sm:py-24">
            <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
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