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

        $payment = Payment::query()
            ->where('tripay_merchant_ref', $data->merchant_ref)
            ->with('booking')
            ->first();
        if (! $payment) {
            return response()->json(['success' => false, 'message' => 'Payment not found'], 404);
        }

        $status = mb_strtoupper((string) $data->status);

        if ($payment->status === 'PAID') {
            return response()->json(['success' => true]);
        }

        $booking = $payment->booking;

        DB::beginTransaction();
        try {
            $payment->update([
                'status' => $status,
                'tripay_callback_at' => now(),
                'callback_payload' => json_decode($request->getContent(), true),
                'paid_at' => $status === 'PAID' ? now() : $payment->paid_at,
                'payment_channel' => $data->payment_channel ?? $payment->payment_channel,
                'payment_method_type' => $data->payment_method ?? $payment->payment_method_type,
            ]);

            if ($payment->payment_type === 'DP') {
                if ($status === 'PAID') {
                    $booking->update([
                        'status' => 'waiting_confirmation',
                    ]);
                } elseif (in_array($status, ['EXPIRED', 'FAILED', 'REFUND'], true)) {
                    $booking->update([
                        'status' => 'cancelled',
                        'cancelled_at' => now(),
                        'cancel_reason' => 'DP payment '.$status.' by gateway.',
                        'admin_note' => 'DP payment '.$status.' by gateway.',
                    ]);
                    $reminders = \App\Models\BillboardReminder::query()
                        ->where('billboard_id', $booking->billboard_id)
                        ->where('requested_start_date', $booking->start_date)
                        ->where('requested_end_date', $booking->end_date)
                        ->where('is_notified', false)
                        ->get();

                    foreach ($reminders as $reminder) {
                        // Logika pengiriman notifikasi (FCM/Email) Anda di sini
                        $reminder->update(['is_notified' => true]);
                    }
                }
            } elseif ($payment->payment_type === 'PELUNASAN' || $payment->is_final) {
                if ($status === 'PAID') {
                    $booking->update([
                        'status' => 'approved',
                    ]);
                }
            }

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();

            Log::error('TriPay Callback logic error', [
                'merchant_ref' => $data->merchant_ref,
                'error' => $exception->getMessage(),
            ]);

            return response()->json(['success' => false, 'message' => 'Server Error'], 500);
        }

        return response()->json(['success' => true]);
    }
}
