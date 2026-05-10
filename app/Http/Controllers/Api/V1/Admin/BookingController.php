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
