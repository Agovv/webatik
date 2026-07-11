<?php

namespace App\Concerns;

use App\Models\Central\User as CentralUser;
use App\Models\Tenant\User as TenantUser;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null): array
    {
        $model = tenancy()->initialized ? TenantUser::class : CentralUser::class;

        return [
            'name' => $this->nameRules(),
            'email' => $this->emailRules($userId),
            'username' => [
                'required',
                'string',
                'max:255',
                $userId === null
                    ? Rule::unique($model)
                    : Rule::unique($model)->ignore($userId),
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20',
                $userId === null
                    ? Rule::unique($model)
                    : Rule::unique($model)->ignore($userId),
            ],
        ];
    }

    /**
     * Get the validation rules used to validate user names.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function nameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate user emails.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function emailRules(?int $userId = null): array
    {
        $model = tenancy()->initialized ? TenantUser::class : CentralUser::class;

        return [
            'required',
            'string',
            'email',
            'max:255',
            $userId === null
                ? Rule::unique($model)
                : Rule::unique($model)->ignore($userId),
        ];
    }
}
