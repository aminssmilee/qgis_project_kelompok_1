<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\User\Company;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

final class UpdateCompanyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'address' => ['nullable', 'string'],
            'npwp' => ['nullable', 'string', 'max:25'],
            'nib' => ['nullable', 'string', 'max:30'],
        ];
    }
}
