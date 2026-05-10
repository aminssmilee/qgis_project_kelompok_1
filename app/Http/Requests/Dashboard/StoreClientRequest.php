<?php

declare(strict_types=1);

namespace App\Http\Requests\Dashboard;

use Illuminate\Foundation\Http\FormRequest;

final class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', 'unique:companies,email'],
            'phone' => ['required', 'string', 'max:30'],
            'city' => ['required', 'string', 'max:100'],
            'status' => ['required', 'in:Active,Inactive'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama klien wajib diisi.',
            'email.required' => 'Email klien wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email klien sudah terdaftar.',
            'phone.required' => 'Nomor telepon wajib diisi.',
            'city.required' => 'Kota wajib diisi.',
            'status.required' => 'Status wajib dipilih.',
            'status.in' => 'Status harus Active atau Inactive.',
        ];
    }
}
