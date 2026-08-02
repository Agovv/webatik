<?php

namespace App\Http\Requests\Web\Central\Billing;

use App\Models\Central\PlanPrice;
use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        $price = $this->route('planPrice');

        return $this->user() !== null
            && $price instanceof PlanPrice
            && $price->isPurchasable()
            && ! $this->user()->subscribed('default');
    }

    public function rules(): array
    {
        return [];
    }
}
