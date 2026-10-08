import type { CorporateSectionProps } from './types';

export default function Stats({ tenantData }: CorporateSectionProps) {
    const items = [
        ['Region', tenantData.region ?? 'Not set'],
        ['Industry', tenantData.industry ?? 'Not set'],
        ['Status', tenantData.status],
    ];

    return (
        <section className="border-b bg-muted/20 py-16">
            <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
                {items.map(([label, value]) => (
                    <div
                        key={label}
                        className="rounded-2xl border bg-background p-6"
                    >
                        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                            {label}
                        </p>
                        <p className="mt-3 text-xl font-semibold capitalize">
                            {value}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}