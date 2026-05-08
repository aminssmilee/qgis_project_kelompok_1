<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Billboard;
use App\Models\Client;
use App\Models\Rental;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

final class RentalSeeder extends Seeder
{
    public function run(): void
    {
        $client = Client::query()->where('email', 'info@majujaya.com')->first();
        $billboard = Billboard::query()->where('code', 'BBD-001')->first();

        if (! $client || ! $billboard) {
            return;
        }

        Rental::query()->updateOrCreate(
            ['booking_code' => 'SEWA-20260508-001'],
            [
                'client_id' => $client->id,
                'billboard_id' => $billboard->id,
                'rental_date' => Carbon::parse('2026-05-08')->toDateString(),
                'duration_days' => 30,
                'end_date' => Carbon::parse('2026-05-08')->addDays(29)->toDateString(),
                'total_price' => 75000000,
                'payment_status' => 'Paid',
            ]
        );
    }
}
