<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Models\Payment;
use App\Services\TriPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final class PaymentCallbackController
{
    public function handle(Request $request, TriPayService $triPay): JsonResponse
    {
        if (! $triPay->validateCallback($request)) {
            Log::error('TriPay Callback: Invalid Signature');

            return response()->json(['success' => false, 'message' => 'Invalid Signature'], 403);
        }

        $data = json_decode($request->getContent());

        if (! isset($data->merchant_ref)) {
            return response()->json(['success' => false, 'message' => 'Invalid payload'], 400);
        }

        $merchantRef = $data->merchant_ref;
        $bookingCode = mb_substr($merchantRef, 0, mb_strrpos($merchantRef, '-'));
        if ($bookingCode === '' || $bookingCode === '0') {
            $bookingCode = $merchantRef;
        }

        $booking = Booking::query()->where('booking_code', $bookingCode)->first();
        if (! $booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        $payment = Payment::query()->where('tripay_merchant_ref', $merchantRef)->first();
        if ($payment) {
            $payment->update([
                'status' => $status,
                'tripay_callback_at' => now(),
                'callback_payload' => json_decode($request->getContent(), true),
                'paid_at' => $status === 'PAID' ? now() : $payment->paid_at,
                'payment_channel' => $data->payment_channel ?? $payment->payment_channel,
                'payment_method_type' => $data->payment_method ?? $payment->payment_method_type,
            ]);

        if ($data->status === 'PAID') {
            if ($payment) {
                $payment->update(['paid_at' => now()]);
            }

            if ($payment && $payment->type === 'final') {
                $booking->update([
                    'status' => 'active',
                    'confirmed_at' => now(),
                ]);
            } else {
                // Default or DP payment paid
                $booking->update([
                    'status' => 'waiting_confirmation',
                ]);
            }
        } elseif (in_array($data->status, ['EXPIRED', 'FAILED', 'REFUND'])) {
            $booking->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancel_reason' => 'Payment '.$data->status,
            ]);
        }

        return response()->json(['success' => true]);
    }
}
