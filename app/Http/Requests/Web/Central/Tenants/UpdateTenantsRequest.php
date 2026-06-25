<?php

namespace App\Http\Requests\Web\Central\Tenants;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateTenantsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->can('update tenants');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', Rule::unique('tenants', 'slug')->ignore($this->route('tenant'))],
            'status' => 'required|string|in:active,trial,suspended',
            'contact_mail' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'icon_path' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:4096',
            'remove_icon' => 'nullable|boolean',
            'region' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ];
    }
}
