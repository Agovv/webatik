<?php

declare(strict_types=1);

namespace App\Platform\Themes;

final readonly class ThemePageSection
{
    /**
     * @param array<string, mixed> $props
     */
    public function __construct(
        public string $id,
        public string $section,
        public ?string $variant,
        public string $component,
        public array $props = [],
    ) {}

    /**
     * @return array{
     *     id: string,
     *     section: string,
     *     variant: string|null,
     *     component: string,
     *     props: array<string, mixed>
     * }
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'section' => $this->section,
            'variant' => $this->variant,
            'component' => $this->component,
            'props' => $this->props,
        ];
    }
}