<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\ActivityLog;
use App\Models\Booking;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BookingController
{
    public function __construct(
        private readonly NotificationService $notificationService,
    ) {}

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

        $bookings = $query->latest()->get()->map(function (Booking $booking) {
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
     * Display the specified booking detail.
     */
    public function show(string $id): JsonResponse
    {
        $booking = Booking::query()
            ->with(['user.company', 'billboard.category', 'payments', 'creatives'])
            ->findOrFail($id);

        $paymentStatus = $booking->payments->last()?->status ?? 'unpaid';
        $clientName = $booking->user->company?->name ?? $booking->user->name;

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $booking->id,
                'booking_code' => $booking->booking_code,
                'client' => $clientName,
                'client_email' => $booking->user->email,
                'billboard' => $booking->billboard->name,
                'billboard_location' => $booking->billboard->location ?? '-',
                'start_date' => $booking->start_date->format('Y-m-d'),
                'end_date' => $booking->end_date->format('Y-m-d'),
                'duration' => $booking->duration_value.' '.$booking->duration_type,
                'base_price' => 'Rp '.number_format((float) $booking->base_price, 0, ',', '.'),
                'discount' => 'Rp '.number_format((float) $booking->discount_amount, 0, ',', '.'),
                'tax' => 'Rp '.number_format((float) $booking->tax_amount, 0, ',', '.'),
                'total_price' => 'Rp '.number_format((float) $booking->total_price, 0, ',', '.'),
                'status' => $this->mapStatus($booking->status),
                'status_raw' => $booking->status,
                'payment' => $this->mapPaymentStatus($paymentStatus),
                'notes' => $booking->notes,
                'admin_note' => $booking->admin_note,
                'created_at' => $booking->created_at->format('Y-m-d H:i'),
            ],
        ]);
    }

    /**
     * Approve a booking (change status to active).
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $booking = Booking::query()->findOrFail($id);

        if (! in_array($booking->status, ['pending_payment', 'waiting_confirmation'])) {
            return response()->json([
                'message' => 'Only pending bookings can be approved.',
            ], 422);
        }

        $booking->update([
            'status' => 'active',
            'admin_note' => $request->admin_note,
            'confirmed_at' => now(),
        ]);

        ActivityLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'approve_booking',
            'target_type' => 'Booking',
            'target_id' => $booking->id,
            'description' => "Admin approved booking {$booking->booking_code}",
            'ip_address' => $request->ip(),
        ]);

        $this->notificationService->bookingApproved($booking);

        return response()->json([
            'message' => "Booking {$booking->booking_code} has been approved successfully.",
            'data' => [
                'id' => $booking->id,
                'booking_code' => $booking->booking_code,
                'status' => 'Active',
            ],
        ]);
    }

    /**
     * Reject a booking (change status to rejected).
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'admin_note' => ['required', 'string', 'max:1000'],
        ]);

        $booking = Booking::query()->findOrFail($id);

        if (! in_array($booking->status, ['pending_payment', 'waiting_confirmation'])) {
            return response()->json([
                'message' => 'Only pending bookings can be rejected.',
            ], 422);
        }

        $booking->update([
            'status' => 'rejected',
            'admin_note' => $request->admin_note,
            'confirmed_at' => now(),
        ]);

        ActivityLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'reject_booking',
            'target_type' => 'Booking',
            'target_id' => $booking->id,
            'description' => "Admin rejected booking {$booking->booking_code}: {$request->admin_note}",
            'ip_address' => $request->ip(),
        ]);

        $this->notificationService->bookingRejected($booking, $request->admin_note);

        return response()->json([
            'message' => "Booking {$booking->booking_code} has been rejected.",
            'data' => [
                'id' => $booking->id,
                'booking_code' => $booking->booking_code,
                'status' => 'Cancelled',
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
