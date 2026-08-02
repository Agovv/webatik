<?php

namespace App\Billing;

use App\Enums\Central\DomainDnsStatus;
use App\Enums\Central\DomainSslStatus;
use App\Enums\Central\DomainStatus;
use App\Models\Central\Domain;
use App\Models\Central\Tenant;
use App\Models\Central\User;
use App\Models\Tenant\User as TenantUser;
use App\Notifications\TenantOwnerInvitation;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProvisionTenant
{
    public function __construct(private EntitlementService $entitlements) {}

    /** @param array<string, mixed> $attributes */
    public function handle(User $owner, array $attributes, string $centralDomain): Tenant
    {
        return Cache::lock('billing:tenant-create:'.$owner->getKey(), 15)->block(5, function () use ($owner, $attributes, $centralDomain): Tenant {
            if (! $this->entitlements->canCreateTenant($owner)) {
                throw ValidationException::withMessages(['plan' => __('Your plan tenant limit has been reached.')]);
            }

            return DB::transaction(function () use ($owner, $attributes, $centralDomain): Tenant {
                $tenant = Tenant::create([
                    ...$attributes,
                    'id' => Str::lower(Str::ulid()),
                    'slug' => Tenant::uniqueSlugForName($attributes['name']),
                    'created_by' => $owner->getKey(),
                ]);

                $domain = $tenant->domains()->create([
                    'domain' => Domain::uniqueDomainForSlug($tenant->slug, $centralDomain),
                    'created_by' => $owner->getKey(),
                    'type' => 'auto',
                    'is_primary' => true,
                    'status' => DomainStatus::ACTIVE->value,
                    'dns_status' => DomainDnsStatus::VERIFIED->value,
                    'ssl_status' => DomainSslStatus::VERIFIED->value,
                ]);

                $tenant->run(function () use ($owner, $domain): void {
                    $tenantUser = TenantUser::query()
                        ->where('username', config('maestro.default.admin.username'))
                        ->firstOrFail();

                    $tenantUser->update([
                        'central_user_id' => $owner->getKey(),
                        'name' => $owner->name,
                        'email' => $owner->email,
                        'phone' => $owner->phone,
                        'email_verified_at' => $owner->email_verified_at,
                        'password' => Hash::make(Str::random(40)),
                    ]);

                    $tenantUser->syncRoles(['admin', 'manager']);
                    $token = Password::broker('tenant')->createToken($tenantUser);
                    $tenantUser->notify(new TenantOwnerInvitation($token, $domain->domain));
                });

                return $tenant->load('domains');
            });
        });
    }
}
