<?php

declare(strict_types=1);

use App\Billing\FeatureAvailability;
use App\Http\Middleware\EnsureFeatureIsAvailable;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

it('allows the request when the feature is available', function (): void {
    $features = Mockery::mock(FeatureAvailability::class);

    $features->shouldReceive('allows')
        ->once()
        ->with('blog.posts.view')
        ->andReturn(true);

    $middleware = new EnsureFeatureIsAvailable($features);
    $request = Request::create('/test', 'GET');

    $response = $middleware->handle(
        $request,
        fn (Request $request) => response('ok'),
        'blog.posts.view',
    );

    expect($response->getStatusCode())->toBe(200)
        ->and($response->getContent())->toBe('ok');
});

it('rejects the request when the feature is unavailable', function (): void {
    $features = Mockery::mock(FeatureAvailability::class);

    $features->shouldReceive('allows')
        ->once()
        ->with('blog.posts.create')
        ->andReturn(false);

    $middleware = new EnsureFeatureIsAvailable($features);
    $request = Request::create('/test', 'GET');

    expect(fn () => $middleware->handle(
        $request,
        fn (Request $request) => response('ok'),
        'blog.posts.create',
    ))->toThrow(HttpException::class);
});
