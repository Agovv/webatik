<?php

namespace App\Concerns;

use App\Support\TenantIconGenerator;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\AbstractDriver;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Drivers\Imagick\Driver as ImagickDriver;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageManagerInterface;

trait ImageTreatment
{
    protected function supportImagick(): bool
    {
        try {
            return extension_loaded('imagick');
        } catch (Exception $e) {
            return false;
        }
    }

    protected function supportWebp(AbstractDriver $driver): bool
    {
        try {
            return $driver->supports('webp');
        } catch (Exception $e) {
            return false;
        }
    }

    protected function getImageDriver(): AbstractDriver
    {
        if ($this->supportImagick()) {
            return new ImagickDriver;
        }

        return new GdDriver;
    }

    protected function getImageManager(): ImageManagerInterface
    {
        return ImageManager::usingDriver($this->getImageDriver());
    }

    private function getDiskDefaultPublic(?string $custom = null): string
    {

        return ! empty($custom) ? $custom : config('filesystems.public_default');
    }

    protected function scaleDownImage(UploadedFile $file, string $pathToSave, ?int $maxWidth = null, ?int $maxHeight = null, ?string $disk = null): string
    {
        $name = Str::lower(Str::orderedUuid()->toString());
        $extension = $file->extension();
        $manager = $this->getImageManager();
        $disk = $this->getDiskDefaultPublic($disk);

        if (! $this->supportWebp($this->getImageDriver()) || $extension === 'gif') {
            return $this->processImageScaleDownFallback($file, $pathToSave, $name, $extension, $disk);
        }

        return $this->proccessImageScaleDown($file, $pathToSave, $name, $extension, $maxWidth, $maxHeight, $disk, $manager);
    }

    /**
     * @return array{icon_path: string, icons: array<string, string>}
     */
    protected function processTenantIcon(UploadedFile $file, string $pathToSave = 'tenant_icons', ?string $disk = null): array
    {
        $disk = $this->getDiskDefaultPublic($disk);

        return [
            'icon_path' => $this->scaleDownImage($file, $pathToSave, 100, 100, $disk),
            'icons' => app(TenantIconGenerator::class)->generate($file, "{$pathToSave}/generated", $disk),
        ];
    }

    /**
     * @param  array<string, string>|null  $icons
     */
    protected function deleteTenantIconFiles(?string $iconPath, ?array $icons, ?string $disk = null): void
    {
        $disk = $this->getDiskDefaultPublic($disk);

        $paths = array_filter([
            $iconPath,
            ...array_values($icons ?? []),
        ]);

        if ($paths === []) {
            return;
        }

        Storage::disk($disk)->delete($paths);
    }

    private function processImageScaleDownFallback(UploadedFile $file, string $pathToSave, string $name, string $extension, string $disk): string
    {
        Storage::disk($disk)->putFileAs($pathToSave, $file, "$name.$extension");

        return "$pathToSave/$name.$extension";
    }

    private function proccessImageScaleDown(
        UploadedFile $file,
        string $pathToSave,
        string $name,
        string $extension,
        ?int $maxWidth = null,
        ?int $maxHeight = null,
        ?string $disk = null,
        ?ImageManagerInterface $manager = null
    ): string {
        try {
            $disk = $this->getDiskDefaultPublic($disk);
            $manager ??= $this->getImageManager();
            $image = $manager->decode($file)->scaleDown(width: $maxWidth, height: $maxHeight);
            $webp = (string) $image->encodeUsingFileExtension('webp', quality: 90);

            Storage::disk($disk)->put("$pathToSave/$name.webp", $webp);

            return "$pathToSave/$name.webp";
        } catch (Exception $e) {
            report($e);

            return $this->processImageScaleDownFallback($file, $pathToSave, $name, $extension, $disk);
        }
    }
}
