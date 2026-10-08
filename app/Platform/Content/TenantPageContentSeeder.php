<?php

declare(strict_types=1);

namespace App\Platform\Content;

use App\Models\Tenant\Page;
use App\Models\Tenant\PageSection;
use App\Platform\Blueprints\BlueprintDefinition;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

final class TenantPageContentSeeder
{
    public function seed(BlueprintDefinition $blueprint): int
    {
        if ($blueprint->pages === []) {
            return 0;
        }

        $connection = DB::connection('tenant');

        if (! $connection->getSchemaBuilder()->hasTable('pages')) {
            throw new RuntimeException(
                'Tenant content tables are not available. Run tenant migrations before seeding page content.'
            );
        }

        $createdSections = 0;

        $connection->transaction(function () use ($blueprint, &$createdSections): void {
            foreach ($blueprint->pages as $pageKey => $items) {
                $page = Page::query()->firstOrCreate(
                    ['key' => $pageKey],
                    [
                        'title' => Str::headline(str_replace(['-', '_'], ' ', $pageKey)),
                        'slug' => $pageKey === 'home' ? '/' : $pageKey,
                        'status' => Page::STATUS_PUBLISHED,
                        'settings' => [],
                    ],
                );

                foreach ($items as $index => $item) {
                    $section = PageSection::query()->firstOrCreate(
                        [
                            'page_id' => $page->getKey(),
                            'section_id' => $item['id'],
                        ],
                        [
                            'section' => $item['section'],
                            'variant' => $item['variant'] ?? null,
                            'props' => $item['props'] ?? [],
                            'sort_order' => $index,
                            'is_enabled' => true,
                        ],
                    );

                    if ($section->wasRecentlyCreated) {
                        $createdSections++;
                    }
                }
            }
        });

        return $createdSections;
    }
}
