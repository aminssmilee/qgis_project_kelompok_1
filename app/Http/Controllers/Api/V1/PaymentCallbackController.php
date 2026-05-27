<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\TriPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

final class PaymentCallbackController extends Controller
{
    public function handle(Request $request, TriPayService $triPay)
    {
        if (! $triPay->validateCallback($request)) {
            Log::error('TriPay Callback: Invalid Signature');

            return response()->json(['success' => false, 'message' => 'Invalid Signature'], 403);
        }

        $data = json_decode($request->getContent());

        if (! isset($data->merchant_ref)) {
            return response()->json(['success' => false, 'message' => 'Invalid payload'], 400);
        }

        $booking = Booking::where('booking_code', $data->merchant_ref)->first();
        if (! $booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        $payment = Payment::where('tripay_merchant_ref', $data->merchant_ref)->first();
        if ($payment) {
            $payment->update([
                'status' => $data->status,
                'tripay_callback_at' => now(),
                'callback_payload' => json_decode($request->getContent(), true),
            ]);
        }

        if ($data->status === 'PAID') {
            $booking->update([
                'status' => 'waiting_confirmation',
            ]);
            if ($payment) {
                $payment->update(['paid_at' => now()]);
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
