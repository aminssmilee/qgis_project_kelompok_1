<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Booking;
use App\Models\Payment;
use App\Services\TriPayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final readonly class BookingController
{
    public function __construct(private TriPayService $triPay) {}

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
            $clientName = $booking->user->company?->name ?? $booking->user->name;

            $dpPayment = $booking->payments->where('type', 'dp')->first();
            $finalPayment = $booking->payments->where('type', 'final')->first();

            $dpAmountVal = $dpPayment ? $dpPayment->amount : ($booking->total_price * 0.3);
            $finalAmountVal = $finalPayment ? $finalPayment->amount : ($booking->total_price * 0.7);

            $dpAmount = 'Rp '.number_format((float) $dpAmountVal, 0, ',', '.');
            $finalAmount = 'Rp '.number_format((float) $finalAmountVal, 0, ',', '.');

            $dpStatus = $dpPayment ? mb_strtolower((string) $dpPayment->status) : 'unpaid';
            $finalStatus = $finalPayment ? mb_strtolower((string) $finalPayment->status) : 'unpaid';

            // Map overall payment status for the dashboard: 'Pending', 'DP Paid', 'Paid'
            $overallPayment = 'Pending';
            if ($dpStatus === 'paid') {
                $overallPayment = ($finalStatus === 'paid') ? 'Paid' : 'DP Paid';
            }

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
                'payment' => $overallPayment,
                'raw_status' => $booking->status,
                'dp_amount' => $dpAmount,
                'dp_status' => $dpStatus,
                'final_amount' => $finalAmount,
                'final_status' => $finalStatus,
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
            'status' => ['nullable', 'string', 'in:pending_payment,waiting_confirmation,waiting_approval,pending_pelunasan,active,completed,cancelled,rejected'],
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

        if ($updateData !== []) {
            $booking->update($updateData);
        }

        // DP System: Generate final payment if status changed to pending_pelunasan
        if ($request->status === 'pending_pelunasan') {
            $dpPayment = $booking->payments()->where('type', 'dp')->first();
            $paymentChannel = $dpPayment ? $dpPayment->payment_channel : 'QRIS';
            $finalAmount = $booking->total_price - ($dpPayment ? $dpPayment->amount : ($booking->total_price * 0.3));

            $finalPayment = $booking->payments()->where('type', 'final')->first();
            if (! $finalPayment) {
                $finalPayment = Payment::query()->create([
                    'booking_id' => $booking->id,
                    'type' => 'final',
                    'tripay_merchant_ref' => $booking->booking_code.'-FINAL',
                    'payment_channel' => $paymentChannel,
                    'amount' => $finalAmount,
                    'status' => 'UNPAID',
                ]);

                $res = $this->triPay->createTransaction($finalPayment, $paymentChannel);
                if ($res && isset($res['success']) && $res['success']) {
                    $finalPayment->update([
                        'tripay_reference' => $res['data']['reference'],
                    ]);
                }
            }
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
                // Create a payment record (default to DP)
                $paymentPayload = [
                    'booking_id' => $booking->id,
                    'type' => 'dp',
                    'amount' => $booking->total_price * 0.3,
                    'status' => $paymentStatus,
                ];
                if ($paymentStatus === 'paid') {
                    $paymentPayload['paid_at'] = now();
                }
                Payment::query()->create($paymentPayload);
            }

            // Sync booking status
            if ($paymentStatus === 'paid') {
                if ($payment && $payment->type === 'dp') {
                    $booking->update([
                        'status' => 'waiting_confirmation',
                    ]);
                } elseif ($payment && $payment->type === 'final') {
                    $booking->update([
                        'status' => 'active',
                        'confirmed_at' => now(),
                    ]);
                }
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
            'pending_payment' => 'Pending DP',
            'waiting_confirmation' => 'DP Paid',
            'waiting_approval' => 'Waiting Approval',
            'pending_pelunasan' => 'Pending Pelunasan',
            'active' => 'Active',
            'completed' => 'Completed',
            'cancelled', 'rejected' => 'Cancelled',
            default => ucfirst(str_replace('_', ' ', $status)),
        };
    }
}
