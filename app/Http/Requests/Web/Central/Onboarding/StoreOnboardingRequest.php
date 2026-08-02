<?php

namespace App\Http\Requests\Web\Central\Onboarding;

use Illuminate\Foundation\Http\FormRequest;

class StoreOnboardingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'contact_mail' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:20'],
            'region' => ['nullable', 'string', 'max:255'],
            'industry' => ['nullable', 'string', 'max:255'],
        ];
    }
}
