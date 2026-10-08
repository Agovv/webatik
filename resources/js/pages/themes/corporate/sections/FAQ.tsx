import type { CorporateSectionProps } from './types';

const questions = [
    'How is this section selected?',
    'Can the order be changed later?',
    'Can a visual builder edit it later?',
];

export default function FAQ({ section }: CorporateSectionProps) {
    return (
        <section className="border-b bg-muted/20 py-20 sm:py-24">
            <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                    FAQ
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                    Frequently asked questions
                </h2>
                <div className="mt-8 divide-y rounded-2xl border bg-background">
                    {questions.map((question) => (
                        <details key={question} className="group p-5">
                            <summary className="cursor-pointer list-none font-medium">
                                {question}
                            </summary>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                The answer will come from tenant-managed
                                content in a later phase.
                            </p>
                        </details>
                    ))}
                </div>
                {section.variant === 'two-column' && (
                    <p className="mt-4 text-xs text-muted-foreground">
                        Two-column variant selected.
                    </p>
                )}
            </div>
        </section>
    );
}