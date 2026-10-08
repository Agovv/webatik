<?php

declare(strict_types=1);

namespace App\Themes;

use App\Platform\Themes\Contracts\ThemeContract;
use App\Platform\Themes\ThemeDefinition;
use App\Platform\Themes\ThemeSectionDefinition;

final class CorporateTheme implements ThemeContract
{
    public function definition(): ThemeDefinition
    {
        return new ThemeDefinition(
            key: 'corporate',
            name: 'Corporate',
            version: '1.0.0',
            sections: [
                new ThemeSectionDefinition(
                    key: 'hero',
                    name: 'Hero',
                    component: 'sections/hero',
                    variants: ['split', 'centered'],
                ),
                new ThemeSectionDefinition(
                    key: 'services',
                    name: 'Services',
                    component: 'sections/services',
                    variants: ['cards', 'grid'],
                ),
                new ThemeSectionDefinition(
                    key: 'about',
                    name: 'About',
                    component: 'sections/about',
                    variants: ['image-left', 'image-right'],
                ),
                new ThemeSectionDefinition(
                    key: 'stats',
                    name: 'Stats',
                    component: 'sections/stats',
                    variants: ['inline', 'cards'],
                ),
                new ThemeSectionDefinition(
                    key: 'projects',
                    name: 'Projects',
                    component: 'sections/projects',
                    variants: ['grid', 'featured'],
                ),
                new ThemeSectionDefinition(
                    key: 'testimonials',
                    name: 'Testimonials',
                    component: 'sections/testimonials',
                    variants: ['cards', 'quote'],
                ),
                new ThemeSectionDefinition(
                    key: 'cta',
                    name: 'CTA',
                    component: 'sections/cta',
                    variants: ['band', 'split'],
                ),
                new ThemeSectionDefinition(
                    key: 'faq',
                    name: 'FAQ',
                    component: 'sections/faq',
                    variants: ['accordion', 'two-column'],
                ),
                new ThemeSectionDefinition(
                    key: 'blog',
                    name: 'Blog',
                    component: 'sections/blog',
                    variants: ['cards', 'featured'],
                ),
            ],
        );
    }
}