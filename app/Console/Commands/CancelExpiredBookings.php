<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Booking;
use App\Services\NotificationService;
use Illuminate\Console\Command;

final class CancelExpiredBookings extends Command
{
    /**
     * The name and signature of the console command.
     * Run automatically by scheduler: every day at midnight.
     * Can also be run manually: php artisan bookings:cancel-expired
     */
    protected $signature = 'bookings:cancel-expired
                            {--days=3 : Number of days after creation before a pending booking is auto-cancelled}';

    protected $description = 'Automatically cancel pending bookings that have not been confirmed within the allowed period.';

    public function __construct(
        private readonly NotificationService $notificationService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoff = now()->subDays($days);

        $expiredBookings = Booking::query()
            ->whereIn('status', ['pending_payment', 'waiting_confirmation'])
            ->where('created_at', '<=', $cutoff)
            ->get();

        if ($expiredBookings->isEmpty()) {
            $this->info('No expired bookings found.');

            return self::SUCCESS;
        }

        $count = 0;

        foreach ($expiredBookings as $booking) {
            $booking->update([
                'status' => 'cancelled',
                'cancel_reason' => 'Auto-cancelled: booking exceeded the confirmation time limit.',
                'cancelled_at' => now(),
            ]);

            $this->notificationService->bookingExpired($booking);
            $count++;
        }

        $this->info("Successfully cancelled {$count} expired booking(s).");

        return self::SUCCESS;
    }
}
