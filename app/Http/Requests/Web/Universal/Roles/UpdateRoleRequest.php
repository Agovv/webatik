<?php

namespace App\Http\Requests\Web\Universal\Roles;

use App\Models\Universal\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->can('update roles');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $role = $this->route('role');
        $roleId = $role instanceof Role ? $role->getKey() : null;

        return [
            'name' => 'required|string|max:255|unique:roles,name,'.$roleId,
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => __('The role name is required.'),
            'name.unique' => __('A role with this name already exists.'),
            'permissions.*.exists' => __('One or more selected permissions are invalid.'),
        ];
    }
}
