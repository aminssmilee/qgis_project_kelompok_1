<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

final class BookingModerationController
{
    public function approveDesign(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'feedback' => ['nullable', 'string', 'max:1000'],
        ]);

        $booking = Booking::query()->findOrFail($id);

        if (! in_array($booking->status, ['waiting_confirmation', 'waiting_pelunasan'], true)
            || ! in_array($booking->design_status, ['pending', 'empty', 'rejected'], true)) {
            return response()->json([
                'message' => 'Booking not ready for design approval',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $booking->update([
                'design_status' => 'approved',
                'status' => 'waiting_pelunasan',
                'admin_note' => $request->string('feedback')->value() ?: 'Desain disetujui oleh Admin.',
                'admin_feedback' => $request->string('feedback')->value() ?: 'Desain disetujui oleh Admin.',
            ]);

            $pelunasanPayment = Payment::query()
                ->where('booking_id', $booking->id)
                ->where('payment_type', 'PELUNASAN')
                ->where('status', 'UNPAID')
                ->first();

            DB::commit();
        } catch (Throwable) {
            DB::rollBack();

            return response()->json([
                'message' => 'Error approving design',
            ], 500);
        }

        return response()->json([
            'message' => 'Design approved. Waiting for final payment.',
            'data' => [
                'booking_id' => $booking->id,
                'status' => $booking->status,
                'has_unpaid_final_payment' => $pelunasanPayment !== null,
            ],
        ]);
    }
}
