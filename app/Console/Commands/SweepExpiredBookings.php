<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Payment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final class SweepExpiredBookings extends Command
{
    protected $signature = 'booking:sweep-expired';

    protected $description = 'Failsafe: cancel bookings with expired DP payments';

    public function handle(): int
    {
        Log::info('Cron Job: starting sweep for expired DP payments');

        $expiredPayments = Payment::query()
            ->where('payment_type', 'DP')
            ->where('status', 'UNPAID')
            ->where(function ($query): void {
                $query->where(function ($sub): void {
                    $sub->whereNotNull('expired_at')
                        ->where('expired_at', '<', now());
                })->orWhere(function ($sub): void {
                    $sub->whereNull('expired_at')
                        ->whereNotNull('due_at')
                        ->where('due_at', '<', now());
                });
            })
            ->with('booking')
            ->get();

        if ($expiredPayments->isEmpty()) {
            $this->info('No expired zombie payments found.');

            return self::SUCCESS;
        }

        $count = 0;

        foreach ($expiredPayments as $payment) {
            $booking = $payment->booking;

            if (! $booking || $booking->status !== 'pending_payment') {
                continue;
            }

            DB::beginTransaction();
            try {
                $payment->update(['status' => 'EXPIRED']);

                $booking->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                    'cancel_reason' => 'Auto-cancelled by system failsafe.',
                    'admin_note' => 'Auto-cancelled by system failsafe.',
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

                DB::commit();

                $count++;
                Log::notice('Zombie booking cancelled', [
                    'booking_code' => $booking->booking_code,
                    'payment_id' => $payment->id,
                ]);
            } catch (Throwable $exception) {
                DB::rollBack();
                Log::error('Failed to cancel zombie booking', [
                    'booking_code' => $booking->booking_code,
                    'payment_id' => $payment->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        $this->info("Successfully swept {$count} zombie bookings.");

        return self::SUCCESS;
    }
}
