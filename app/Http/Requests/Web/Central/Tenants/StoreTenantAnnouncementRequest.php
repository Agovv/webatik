<?php

namespace App\Http\Requests\Web\Central\Tenants;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTenantAnnouncementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create tenant announcements') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string', 'max:5000'],
            'url' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'audience' => ['required', Rule::in(['all', 'roles'])],
            'roles' => ['array', 'required_if:audience,roles'],
            'roles.*' => ['string', 'max:255'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after:starts_at'],
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($this->string('audience')->toString() !== 'roles') {
                    return;
                }

                if (collect($this->array('roles'))->filter()->isEmpty()) {
                    $validator->errors()->add('roles', __('Select at least one role for this announcement.'));
                }
            },
        ];
    }
}
