<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Central\User as CentralUser;
use App\Models\Tenant\User as TenantUser;
use App\Models\Universal\Role;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): CentralUser|TenantUser
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'plan_price' => ['nullable', 'string', Rule::exists('plan_prices', 'id')->where('status', 'published')],
        ])->validate();

        $model = tenancy()->initialized ? TenantUser::class : CentralUser::class;

        $user = $model::create([
            'name' => $input['name'],
            'username' => $input['username'],
            'phone' => $input['phone'] ?? null,
            'email' => $input['email'],
            'password' => $input['password'],
        ]);

        if (! tenancy()->initialized) {
            $user->assignRole(Role::findOrCreate('customer'));
            session(['selected_plan_price' => $input['plan_price'] ?? null]);
        }

        return $user;
    }
}
