<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\User;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $statusMap = [
            'pending_payment' => 'pending',
            'waiting_confirmation' => 'pending',
            'waiting_approval' => 'pending',
            'pending_pelunasan' => 'pending',
            'active' => 'active',
            'completed' => 'completed',
            'cancelled' => 'cancelled',
            'rejected' => 'rejected',
        ];

        $payments = $this->relationLoaded('payments') ? $this->payments : $this->payments()->get();
        $dpPayment = $payments->where('type', 'dp')->first();
        $finalPayment = $payments->where('type', 'final')->first();

        // Get the active unpaid payment
        $activePayment = $payments->filter(fn ($p): bool => mb_strtoupper((string) $p->status) === 'UNPAID')->first();

        $tripayUrl = config('services.tripay.mode') === 'sandbox'
            ? 'https://sandbox.tripay.co.id/checkout/'
            : 'https://tripay.co.id/checkout/';

        $checkoutUrl = $activePayment ? $tripayUrl.$activePayment->tripay_reference : null;
        $finalCheckoutUrl = $finalPayment && mb_strtoupper((string) $finalPayment->status) === 'UNPAID' && $finalPayment->tripay_reference
            ? $tripayUrl.$finalPayment->tripay_reference
            : null;

        // Map payment status for the app: 'pending', 'dp_paid', 'paid'
        $paymentStatus = 'pending';
        if ($dpPayment && mb_strtoupper((string) $dpPayment->status) === 'PAID') {
            $paymentStatus = ($finalPayment && mb_strtoupper((string) $finalPayment->status) === 'PAID') ? 'paid' : 'dp_paid';
        }

        // Map payment stage: 'dp', 'final'
        $paymentStage = ($dpPayment && mb_strtoupper((string) $dpPayment->status) === 'PAID') ? 'final' : 'dp';

        // Map approval status: 'pending', 'approved', 'rejected'
        $approvalStatus = 'pending';
        if ($this->confirmed_at !== null || in_array($this->status, ['pending_pelunasan', 'active', 'completed'])) {
            $approvalStatus = 'approved';
        } elseif ($this->status === 'rejected') {
            $approvalStatus = 'rejected';
        }

        return [
            'id' => $this->id,
            'invoice_no' => $this->booking_code,
            'spot' => [
                'id' => $this->billboard_id,
                'title' => $this->billboard->name,
                'type' => $this->billboard->category->name ?? 'Billboard',
                'thumbnail_url' => $this->billboard->thumbnail_url
                    ?? $this->billboard->photos?->firstWhere('is_primary', true)?->photo_url
                    ?? $this->billboard->photos?->first()?->photo_url,
            ],
            'status' => $statusMap[$this->status] ?? $this->status,
            'raw_status' => $this->status,
            'total_price' => (float) $this->total_price,
            'deadline_at' => $this->created_at?->copy()->addDay()->toIso8601String(),
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'checkout_url' => $checkoutUrl,
            'final_checkout_url' => $finalCheckoutUrl,
            'payment_status' => $paymentStatus,
            'payment_stage' => $paymentStage,
            'approval_status' => $approvalStatus,
            'print_fee' => 1500000,
            'install_fee' => 500000,
            'tax_rate' => 0.11,
            'dp_rate' => 0.30,
            'down_payment_rate' => 0.30,
            'payment' => $activePayment ? [
                'type' => $activePayment->type,
                'status' => mb_strtolower((string) $activePayment->status),
                'amount' => (float) $activePayment->amount,
                'checkout_url' => $tripayUrl.$activePayment->tripay_reference,
            ] : null,
            'payments' => $payments->map(fn ($p): array => [
                'type' => $p->type,
                'status' => mb_strtolower((string) $p->status),
                'amount' => (float) $p->amount,
                'checkout_url' => $p->tripay_reference ? $tripayUrl.$p->tripay_reference : null,
            ])->toArray(),
            'creative_url' => $this->creatives->last()?->file_url,
            'creative_status' => $this->creatives->last()?->status,
            'creative_name' => $this->creatives->last()?->file_name,
            'creative_admin_note' => $this->creatives->last()?->admin_note,
        ];
    }
}
