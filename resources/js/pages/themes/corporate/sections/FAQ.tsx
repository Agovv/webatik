import type { CorporateSectionProps } from './types';
import SectionHeading from './SectionHeading';

const questions = [
    [
        'How is the homepage assembled?',
        'The blueprint defines the initial section order and variants, while the theme defines how each section is rendered.',
    ],
    [
        'Can the section order change later?',
        'Yes. The composition is intentionally separated from the visual implementation so ordering can become tenant-managed later.',
    ],
    [
        'Can a visual builder edit it later?',
        'Yes. A future builder can manipulate the composition and props without replacing the underlying theme components.',
    ],
    [
        'Where will real company content live?',
        'A future tenant content layer can supply titles, media, projects, testimonials, FAQs, and other editable page data.',
    ],
];

export default function FAQ({ section }: CorporateSectionProps) {
    const twoColumn = section.variant === 'two-column';

    return (
        <section id="faq" className="scroll-mt-20 border-b py-20 sm:py-28">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="FAQ"
                    title="The structure is designed to stay understandable."
                    description="These questions document the intended architecture while keeping the visual section useful as a real corporate FAQ component later."
                />

                <div
                    className={[
                        'mt-10 gap-4',
                        twoColumn ? 'grid md:grid-cols-2' : 'mx-auto max-w-4xl space-y-3',
                    ].join(' ')}
                >
                    {questions.map(([question, answer]) => (
                        <details key={question} className="group rounded-[1.5rem] border bg-card px-5 py-4 shadow-sm">
                            <summary className="cursor-pointer list-none pr-8 font-semibold marker:content-none">
                                <span className="relative block">{question}</span>
                            </summary>
                            <p className="max-w-2xl pb-2 pt-4 text-sm leading-7 text-muted-foreground">
                                {answer}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
