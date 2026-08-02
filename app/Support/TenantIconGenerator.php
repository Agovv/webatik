<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\AbstractDriver;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Drivers\Imagick\Driver as ImagickDriver;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageManagerInterface;
use Throwable;

class TenantIconGenerator
{
    /**
     * @return array{favicon_16: string, favicon_32: string, apple_touch_icon: string}|array{}
     */
    public function generate(UploadedFile $upload, string $directory = 'tenant_icons/generated', string $disk = 'public'): array
    {
        try {
            $image = $this->manager()->decode($upload);
        } catch (Throwable $exception) {
            report($exception);

            return [];
        }

        $baseName = Str::lower(Str::ulid()->toString());
        $icons = [
            'favicon_16' => [$directory, "{$baseName}-16.png", 16],
            'favicon_32' => [$directory, "{$baseName}-32.png", 32],
            'apple_touch_icon' => [$directory, "{$baseName}-apple-touch-icon.png", 180],
        ];

        foreach ($icons as $icon) {
            [$path, $fileName, $size] = $icon;
            $encoded = (string) (clone $image)
                ->cover($size, $size)
                ->encodeUsingFileExtension('png');

            Storage::disk($disk)->put("{$path}/{$fileName}", $encoded);
        }

        return collect($icons)
            ->map(fn (array $icon): string => "{$icon[0]}/{$icon[1]}")
            ->all();
    }

    /**
     * @param  array<string, string>|null  $icons
     */
    public function delete(?array $icons, string $disk = 'public'): void
    {
        if ($icons === null || $icons === []) {
            return;
        }

        Storage::disk($disk)->delete(array_values($icons));
    }

    private function manager(): ImageManagerInterface
    {
        return ImageManager::usingDriver($this->driver());
    }

    private function driver(): AbstractDriver
    {
        if (extension_loaded('imagick')) {
            return new ImagickDriver;
        }

        return new GdDriver;
    }
}
