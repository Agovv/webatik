<?php

namespace App\Http\Requests\Web\Central\Tenants;

use App\Models\Tenant;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class DestroyTenantsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()?->can('delete tenants') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * The user must type the tenant's exact name to confirm the deletion.
     * This mirrors the safety pattern used by GitHub when deleting a
     * repository and prevents accidental clicks from wiping data that
     * cannot be recovered.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Tenant|null $tenant */
        $tenant = $this->route('tenant');

        return [
            'confirmation' => [
                'required',
                'string',
                Rule::in([$tenant?->name ?? '']),
            ],
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        /** @var Tenant|null $tenant */
        $tenant = $this->route('tenant');
        $name = $tenant?->name ?? '';

        return [
            'confirmation.required' => 'Please type the tenant name to confirm the deletion.',
            'confirmation.in' => 'The typed value does not match the tenant name. Type exactly: '.$name,
        ];
    }
}
