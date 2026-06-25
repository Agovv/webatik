<?php

namespace App\Http\Requests\Web\Central\Domains;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateDomainRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->can('update domains');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'domain' => [
                'required',
                'string',
                'max:255',
                Rule::unique('domains', 'domain')->ignore($this->route('domain')),
                $this->autoDomainRule(),
            ],
            'new_tenant_id' => 'nullable|exists:tenants,id',
            'type' => 'required|string|in:auto,custom',
            'is_primary' => 'required|boolean',
            'status' => 'required|string|in:pending,active,disabled',
            'dns_status' => 'required|string|in:pending,verified,failed',
            'ssl_status' => 'required|string|in:pending,verified,failed',
        ];
    }

    private function autoDomainRule(): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail): void {
            if ($this->input('type') !== 'auto') {
                return;
            }

            $centralDomain = parse_url(config('app.url'), PHP_URL_HOST) ?: $this->getHost();
            $domain = Str::lower((string) $value);
            $subdomain = Str::beforeLast($domain, '.'.$centralDomain);

            if (
                ! Str::endsWith($domain, '.'.$centralDomain)
                || $domain === $centralDomain
                || preg_match('/^[a-z0-9-]+$/', $subdomain) !== 1
            ) {
                $fail("The {$attribute} must use the central domain suffix .{$centralDomain}.");
            }
        };
    }
}
