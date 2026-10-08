export default function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'left',
}: {
    eyebrow: string;
    title: string;
    description?: string;
    align?: 'left' | 'center';
}) {
    const centered = align === 'center';

    return (
        <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'}>
            <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {title}
            </h2>
            {description ? (
                <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                    {description}
                </p>
            ) : null}
        </div>
    );
}
