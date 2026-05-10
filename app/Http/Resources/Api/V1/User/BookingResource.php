<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $statusMap = [
            'pending_payment' => 'pending',
            'waiting_confirmation' => 'pending',
            'active' => 'active',
            'completed' => 'completed',
            'cancelled' => 'cancelled',
            'rejected' => 'rejected',
        ];

        return [
            'id' => $this->id,
            'invoice_no' => $this->booking_code,
            'spot' => [
                'title' => $this->billboard->name,
                'type' => $this->billboard->category->name ?? 'Billboard',
            ],
            'status' => $statusMap[$this->status] ?? $this->status,
            'total_price' => (float) $this->total_price,
            'deadline_at' => $this->created_at->addDay()->toIso8601String(),
            'start_date' => $this->start_date->toDateString(),
            'end_date' => $this->end_date->toDateString(),
        ];
    }
}
