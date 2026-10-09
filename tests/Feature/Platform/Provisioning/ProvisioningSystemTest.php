<?php

declare(strict_types=1);

use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Provisioning\ProvisioningContext;
use App\Platform\Provisioning\ProvisioningManager;

it('binds the provisioning manager through the application container', function (): void {
    expect(app(ProvisioningManager::class))
        ->toBeInstanceOf(ProvisioningManager::class);
});

it('provisions the corporate blueprint core steps', function (): void {
    $blueprint = app(BlueprintRegistry::class)
        ->get('corporate', '1.0.0');

    $context = new ProvisioningContext(
        $blueprint->definition(),
    );

    $result = app(ProvisioningManager::class)->run($context);

    expect($result->isSuccessful())->toBeTrue()
        ->and($result->steps())->toHaveCount(3)
        ->and($result->steps()[0]->step)->toBe('blueprint.validate')
        ->and($result->steps()[1]->step)->toBe('theme.resolve')
        ->and($result->steps()[2]->step)->toBe('modules.resolve')
        ->and($context->getState('resolved_theme'))
            ->toBe([
                'key' => 'corporate',
                'version' => '1.0.0',
            ])
        ->and($context->getState('resolved_modules'))
            ->toBe(['blog', 'content']);
});
