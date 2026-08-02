<?php

namespace App\Http\Requests\Web\Central\Plans;

use Illuminate\Validation\Rule;

class UpdatePlanRequest extends StorePlanRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update plans') ?? false;
    }

    public function rules(): array
    {
        return [
            ...parent::rules(),
            'slug' => ['required', 'alpha_dash', 'max:255', Rule::unique('plans')->ignore($this->route('plan'))],
        ];
    }
}
