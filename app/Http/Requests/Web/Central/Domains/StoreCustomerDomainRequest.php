<?php

namespace App\Http\Requests\Web\Central\Domains;

use App\Models\Central\Tenant;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerDomainRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenant = $this->route('tenant');

        return $this->user() !== null
            && $tenant instanceof Tenant
            && $tenant->created_by === $this->user()->getKey();
    }

    /** @return array<string, ValidationRule|array<int, mixed>|string> */
    public function rules(): array
    {
        return ['domain' => ['required', 'string', 'max:255', 'unique:domains,domain']];
    }
}
