<?php

namespace App\Http\Requests\Web\Central\Billing;

use App\Models\Central\PlanPrice;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ChangePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        $price = $this->route('planPrice');

        return $this->user() !== null
            && $price instanceof PlanPrice
            && $price->isPurchasable()
            && $this->user()->subscription('default')?->valid();
    }

    /** @return array<string, ValidationRule|array<int, mixed>|string> */
    public function rules(): array
    {
        return [];
    }
}
