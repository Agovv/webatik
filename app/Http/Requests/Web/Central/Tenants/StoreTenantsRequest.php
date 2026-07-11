<?php

namespace App\Http\Requests\Web\Central\Tenants;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreTenantsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->can('create tenants');
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
            'status' => 'required|string|in:active,trial,suspended',
            'contact_mail' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'icon_path' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:4096',
            'region' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ];
    }
}
