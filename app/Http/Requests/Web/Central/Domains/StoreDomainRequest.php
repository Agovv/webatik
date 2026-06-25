<?php

namespace App\Http\Requests\Web\Central\Domains;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreDomainRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->can('create domains');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tenant_id' => [
                Rule::requiredIf(fn (): bool => $this->route('tenant') === null),
                'string',
                'exists:tenants,id',
            ],
            'domain' => [
                'required',
                'string',
                'max:255',
                Rule::unique('domains', 'domain'),
                $this->autoDomainRule(),
            ],
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
