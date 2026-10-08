import { lazy, Suspense, type ComponentType } from 'react';
import SectionFallback from './SectionFallback';
import type { CorporateSectionProps, ThemePageSection } from './types';

const sectionRegistry: Record<
    string,
    ComponentType<CorporateSectionProps>
> = {
    hero: lazy(() => import('./Hero')),
    services: lazy(() => import('./Services')),
    about: lazy(() => import('./About')),
    stats: lazy(() => import('./Stats')),
    projects: lazy(() => import('./Projects')),
    testimonials: lazy(() => import('./Testimonials')),
    cta: lazy(() => import('./CTA')),
    faq: lazy(() => import('./FAQ')),
    blog: lazy(() => import('./Blog')),
};

export function CorporateSectionRenderer({
    sections,
    tenantData,
}: {
    sections: ThemePageSection[];
    tenantData: CorporateSectionProps['tenantData'];
}) {
    return (
        <>
            {sections.map((section) => {
                const Section =
                    sectionRegistry[section.section] ?? SectionFallback;

                return (
                    <Suspense
                        key={section.id}
                        fallback={
                            <SectionFallback
                                section={section}
                                tenantData={tenantData}
                            />
                        }
                    >
                        <Section section={section} tenantData={tenantData} />
                    </Suspense>
                );
            })}
        </>
    );
}

export { sectionRegistry };