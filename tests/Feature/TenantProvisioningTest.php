<?php

use App\Billing\ProvisionTenant;
use App\Models\Central\Plan;
use App\Models\Central\User as CentralUser;
use App\Models\Tenant\User as TenantUser;
use App\Models\Universal\Role;
use App\Notifications\TenantOwnerInvitation;
use Database\Seeders\PlanSeeder;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    config([
        'cache.default' => 'array',
        'tenancy.cache.stores' => [],
        'tenancy.cache.scope_sessions' => false,
    ]);
});

test('tenant provisioning turns the seeded admin into the customer account', function () {
    $this->seed(PlanSeeder::class);
    Notification::fake();

    $owner = CentralUser::factory()->create();
    $owner->assignRole(Role::findOrCreate('customer'));
    $price = Plan::query()->where('slug', 'starter')->firstOrFail()
        ->prices()->where('interval', 'month')->firstOrFail();
    $price->update(['stripe_price_id' => 'price_tenant_provisioning']);
    $owner->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_tenant_provisioning',
        'stripe_status' => 'active',
        'stripe_price' => $price->stripe_price_id,
        'plan_price_id' => $price->getKey(),
    ]);

    $tenant = app(ProvisionTenant::class)->handle($owner, [
        'name' => 'Customer workspace',
        'contact_mail' => $owner->email,
        'contact_phone' => $owner->phone,
        'region' => 'MX',
        'industry' => 'Technology',
    ], 'maestro.test');

    $tenant->run(function () use ($owner): void {
        $admin = TenantUser::query()->where('username', config('maestro.default.admin.username'))->firstOrFail();

        expect(TenantUser::query()->count())->toBe(2)
            ->and($admin->central_user_id)->toBe($owner->getKey())
            ->and($admin->name)->toBe($owner->name)
            ->and($admin->email)->toBe($owner->email)
            ->and($admin->hasAllRoles(['admin', 'manager']))->toBeTrue()
            ->and(TenantUser::query()->where('central_user_id', $owner->getKey())->count())->toBe(1);
    });

    $tenant->run(function () use ($owner): void {
        $admin = TenantUser::query()->where('central_user_id', $owner->getKey())->firstOrFail();

        Notification::assertSentTo($admin, TenantOwnerInvitation::class);
    });
});
