<?php

namespace App\Http\Requests\Web\Central\Plans;

use App\Platform\Modules\FeatureRegistry;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create plans') ?? false;
    }

    /** @return array<string, ValidationRule|array<int, mixed>|string> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'alpha_dash', 'max:255', Rule::unique('plans')],
            'description' => ['nullable', 'string'],
            'rank' => ['required', 'integer', 'min:0'],
            'sort_order' => ['required', 'integer', 'min:0'],
            'is_featured' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
            'features' => ['sometimes', 'array'],
            'features.*' => ['string', 'distinct', Rule::in(array_keys(app(FeatureRegistry::class)->all()))],
            'feature_selection_present' => ['sometimes', 'accepted'],
            'prices' => ['required', 'array'],
            'prices.month' => ['required', 'integer', 'min:50'],
            'prices.year' => ['required', 'integer', 'min:50'],
            'limits' => ['required', 'array'],
            'limits.tenants' => ['required', 'integer', 'min:0'],
            'limits.default_domains' => ['required', 'integer', 'min:0'],
            'limits.custom_domains' => ['required', 'integer', 'min:0'],
            'limits.tenant_users' => ['required', 'integer', 'min:0'],
            'limits.tenant_custom_roles' => ['required', 'integer', 'min:0'],
        ];
    }
}
