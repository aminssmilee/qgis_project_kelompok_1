<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\User;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

final class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $statusMap = [
            'pending_payment' => 'pending',
            'waiting_confirmation' => 'pending',
            'waiting_pelunasan' => 'pending',
            'approved' => 'active',
            'active' => 'active',
            'completed' => 'completed',
            'cancelled' => 'cancelled',
            'rejected' => 'rejected',
        ];

        /** @var Collection<int, Payment> $payments */
        $payments = $this->relationLoaded('payments')
            ? $this->payments
            : $this->payments()->orderByRaw('COALESCE(sequence, 999), created_at')->get();

        $orderedPayments = $payments
            ->sortBy(fn (Payment $payment): array => [
                $payment->sequence ?? 999,
                $payment->created_at?->getTimestamp() ?? 0,
            ])
            ->values();

        $nextUnpaidPayment = $orderedPayments->first(function (Payment $payment): bool {
            $attrs = $payment->getAttributes();
            $status = $attrs['status'] ?? null;
            $tripayRef = $attrs['tripay_reference'] ?? null;

            return $status === 'UNPAID' && ! empty($tripayRef);
        });

        $checkoutUrl = null;
        if ($nextUnpaidPayment !== null) {
            $nr = $nextUnpaidPayment->getAttributes()['tripay_reference'] ?? null;
            if (! empty($nr)) {
                $checkoutUrl = 'https://tripay.co.id/checkout/'.$nr;
            }
        }

        $paymentTracker = $orderedPayments->map(function (Payment $payment): array {
            $attrs = $payment->getAttributes();
            $paymentType = (string) ($attrs['payment_type'] ?? 'FULL');
            $paymentSequence = $attrs['sequence'] ?? null;
            $isFinal = (bool) ($attrs['is_final'] ?? false);
            $dueAt = $attrs['due_at'] ?? null;
            $paidAt = $attrs['paid_at'] ?? null;
            $status = (string) ($attrs['status'] ?? 'UNPAID');
            $tripayReference = $attrs['tripay_reference'] ?? null;

            return [
                'id' => $payment->id,
                'type' => mb_strtolower($paymentType),
                'label' => match ($paymentType) {
                    'DP' => 'Down Payment',
                    'PELUNASAN' => 'Pelunasan',
                    default => 'Pembayaran',
                },
                'sequence' => $paymentSequence,
                'is_final' => $isFinal,
                'amount' => (float) ($attrs['amount'] ?? $payment->amount ?? 0),
                'status' => mb_strtolower($status),
                'due_at' => $dueAt ? \Illuminate\Support\Carbon::parse($dueAt)->toIso8601String() : null,
                'paid_at' => $paidAt ? \Illuminate\Support\Carbon::parse($paidAt)->toIso8601String() : null,
                'checkout_url' => $status === 'UNPAID' && ! empty($tripayReference)
                    ? 'https://tripay.co.id/checkout/'.$tripayReference
                    : null,
            ];
        })->values();

        return [
            'id' => $this->id,
            'invoice_no' => $this->booking_code,
            'spot' => [
                'title' => data_get($this->billboard, 'name', 'Billboard'),
                'type' => data_get($this->billboard, 'category.name', 'Billboard'),
            ],
            'status' => $statusMap[$this->status] ?? $this->status,
            'total_price' => (float) $this->total_price,
            'deadline_at' => $this->created_at?->copy()->addDay()->toIso8601String(),
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'checkout_url' => $checkoutUrl,
            'payment_tracker' => $paymentTracker,
        ];
    }
}
