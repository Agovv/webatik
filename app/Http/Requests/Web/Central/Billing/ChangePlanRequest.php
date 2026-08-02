<?php

namespace App\Http\Requests\Web\Central\Billing;

use App\Models\Central\PlanPrice;
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

    public function rules(): array
    {
        return [];
    }
}
