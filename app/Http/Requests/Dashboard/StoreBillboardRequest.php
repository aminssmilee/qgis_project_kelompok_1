<?php

declare(strict_types=1);

namespace App\Http\Requests\Dashboard;

use Illuminate\Foundation\Http\FormRequest;

final class StoreBillboardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'uuid', 'exists:billboard_categories,id'],
            'name' => ['required', 'string', 'max:150'],
            'code' => ['required', 'string', 'max:30', 'unique:billboards,code'],
            'description' => ['nullable', 'string'],
            'address' => ['required', 'string'],
            'district' => ['nullable', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'traffic_density' => ['required', 'in:low,medium,high'],
            'is_illuminated' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists' => 'Kategori tidak valid.',
            'name.required' => 'Nama billboard wajib diisi.',
            'code.required' => 'Kode billboard wajib diisi.',
            'code.unique' => 'Kode billboard sudah digunakan.',
            'address.required' => 'Alamat billboard wajib diisi.',
            'city.required' => 'Kota wajib diisi.',
            'traffic_density.required' => 'Traffic density wajib dipilih.',
            'traffic_density.in' => 'Traffic density tidak valid.',
        ];
    }
}
