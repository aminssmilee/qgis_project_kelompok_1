<?php

declare(strict_types=1);

namespace App\Http\Requests\Dashboard;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateRentalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => ['required', 'uuid', 'exists:companies,id'],
            'billboard_id' => ['required', 'uuid', 'exists:billboards,id'],
            'rental_date' => ['required', 'date'],
            'duration_days' => ['required', 'integer', 'min:1', 'max:3650'],
            'total_price' => ['required', 'numeric', 'min:0'],
            'payment_status' => ['required', 'in:Pending,Paid,Overdue'],
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => 'Klien wajib dipilih.',
            'billboard_id.required' => 'Billboard wajib dipilih.',
            'rental_date.required' => 'Tanggal sewa wajib diisi.',
            'rental_date.date' => 'Tanggal sewa tidak valid.',
            'duration_days.required' => 'Durasi wajib diisi.',
            'duration_days.integer' => 'Durasi harus berupa angka.',
            'total_price.required' => 'Total harga wajib diisi.',
            'total_price.numeric' => 'Total harga harus berupa angka.',
            'payment_status.required' => 'Status pembayaran wajib dipilih.',
            'payment_status.in' => 'Status pembayaran tidak valid.',
        ];
    }
}
