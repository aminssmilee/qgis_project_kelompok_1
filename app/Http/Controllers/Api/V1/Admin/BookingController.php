<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BookingController
{
    /**
     * Display a listing of all bookings for the admin dashboard.
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $query = Booking::query()
            ->with(['user.company', 'billboard', 'payments']);

        if ($status) {
            $query->where('status', $status);
        }

        $bookings = $query->latest()->get()->map(function (Booking $booking): array {
            $paymentStatus = $booking->payments->last()?->status ?? 'unpaid';
            $clientName = $booking->user->company?->name ?? $booking->user->name;

            return [
                'id' => $booking->id,
                'booking_code' => $booking->booking_code,
                'client' => $clientName,
                'billboard' => $booking->billboard->name,
                'start_date' => $booking->start_date->format('Y-m-d'),
                'end_date' => $booking->end_date->format('Y-m-d'),
                'duration' => $booking->duration_value.' '.$booking->duration_type,
                'amount' => 'Rp '.number_format((float) $booking->total_price, 0, ',', '.'),
                'status' => $this->mapStatus($booking->status),
                'payment' => $this->mapPaymentStatus($paymentStatus),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $bookings,
        ]);
    }

    /**
     * Update the booking and payment status (Admin).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => ['nullable', 'string', 'in:pending_payment,waiting_confirmation,active,completed,cancelled,rejected'],
            'payment_status' => ['nullable', 'string', 'in:unpaid,paid,failed,expired,refunded'],
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $booking = Booking::with('payments')->findOrFail($id);

        $updateData = [];

        if ($request->has('status')) {
            $updateData['status'] = $request->status;
            if ($request->status === 'active') {
                $updateData['confirmed_at'] = now();
            }
        }

        if ($request->has('admin_note')) {
            $updateData['admin_note'] = $request->admin_note;
        }

        if (! empty($updateData)) {
            $booking->update($updateData);
        }

        if ($request->has('payment_status')) {
            $paymentStatus = $request->payment_status;

            // Get the latest payment or create one if not exists
            $payment = $booking->payments->last();
            if ($payment) {
                $paymentPayload = ['status' => $paymentStatus];
                if ($paymentStatus === 'paid') {
                    $paymentPayload['paid_at'] = now();
                }
                $payment->update($paymentPayload);
            } else {
                // Create a payment record
                $paymentPayload = [
                    'booking_id' => $booking->id,
                    'amount' => $booking->total_price,
                    'status' => $paymentStatus,
                ];
                if ($paymentStatus === 'paid') {
                    $paymentPayload['paid_at'] = now();
                }
                \App\Models\Payment::create($paymentPayload);
            }

            // Sync booking status to active if payment is paid
            if ($paymentStatus === 'paid' && $booking->status === 'pending_payment') {
                $booking->update([
                    'status' => 'active',
                    'confirmed_at' => now(),
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Booking status updated successfully',
            'data' => [
                'id' => $booking->id,
                'status' => $booking->status,
                'payment_status' => $booking->payments()->latest()->first()?->status ?? 'unpaid',
            ],
        ]);
    }

    private function mapStatus(string $status): string
    {
        return match ($status) {
            'pending_payment', 'waiting_confirmation' => 'Pending',
            'active' => 'Active',
            'completed' => 'Completed',
            'cancelled', 'rejected' => 'Cancelled',
            default => 'Unknown',
        };
    }

    private function mapPaymentStatus(string $status): string
    {
        return match ($status) {
            'paid' => 'Paid',
            'unpaid', 'expired', 'failed' => 'Unpaid',
            default => 'Unpaid',
        };
    }
}
