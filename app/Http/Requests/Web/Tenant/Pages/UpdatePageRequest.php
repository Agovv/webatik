<?php

declare(strict_types=1);

namespace App\Http\Requests\Web\Tenant\Pages;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

final class UpdatePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()?->can('update pages') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^(?:\/|[a-z0-9][a-z0-9\/_-]*)$/i',
                Rule::unique('pages', 'slug')->ignore($this->route('page')),
            ],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:1000'],
            'sections' => ['required', 'array', 'min:1'],
            'sections.*.id' => ['required', 'string', 'max:100', 'distinct'],
            'sections.*.is_enabled' => ['required', 'boolean'],
            'sections.*.variant' => [
                'nullable',
                'string',
                'max:100',
                'regex:/^[a-z0-9][a-z0-9_-]*$/i',
            ],
            'sections.*.props_json' => [
                'required',
                'string',
                'max:20000',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    try {
                        $decoded = json_decode((string) $value, true, 512, JSON_THROW_ON_ERROR);
                    } catch (\JsonException) {
                        $fail(__('Section props must contain valid JSON.'));
                        return;
                    }

                    if (! is_array($decoded)) {
                        $fail(__('Section props must be a JSON object.'));
                    }
                },
            ],
        ];
    }
}
