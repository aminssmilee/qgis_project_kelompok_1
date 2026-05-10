<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Schedule;

// Auto-cancel pending bookings older than 3 days every day at midnight
Schedule::command('bookings:cancel-expired')->dailyAt('00:00');
