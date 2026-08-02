<?php

namespace App\Models\Central;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Cashier\Subscription;
use Database\Factories\Central\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Cashier\Billable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property string $name
 * @property string $username
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string|null $phone
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'phone', 'username'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use Billable, HasFactory, HasRoles, HasUlids, Notifiable, PasskeyAuthenticatable, SoftDeletes, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /** @return HasMany<Tenant, $this> */
    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class, 'created_by');
    }

    /** @return HasMany<Tenant, $this> */
    public function managedTenants(): HasMany
    {
        return $this->hasMany(Tenant::class, 'created_by');
    }

    /** @return HasMany<SubscriptionCheckout, $this> */
    public function subscriptionCheckouts(): HasMany
    {
        return $this->hasMany(SubscriptionCheckout::class);
    }

    public function subscription(string $type = 'default'): ?Subscription
    {
        return Subscription::query()
            ->where($this->getForeignKey(), $this->getKey())
            ->where('type', $type)
            ->latest()
            ->first();
    }
}
