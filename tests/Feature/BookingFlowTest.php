<?php

declare(strict_types=1);

use App\Models\Billboard;
use App\Models\BillboardCategory;
use App\Models\BillboardPricing;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Support\Facades\DB;

beforeEach(function (): void {
    // Create a billboard category
    $this->category = BillboardCategory::create([
        'name' => 'Standard',
        'description' => 'Standard billboard',
    ]);

    // Create a billboard with PostGIS-compatible location
    $this->billboard = Billboard::create([
        'category_id' => $this->category->id,
        'name' => 'Billboard Test Pusat Kota',
        'code' => 'BBD-TEST-001',
        'address' => 'Jl. Test No. 1',
        'district' => 'Test District',
        'city' => 'Samarinda',
        'is_active' => true,
    ]);

    // Set location via raw query (PostGIS)
    DB::table('billboards')
        ->where('id', $this->billboard->id)
        ->update(['location' => DB::raw('ST_MakePoint(117.1, -0.5)::geography')]);

    // Create pricing for the billboard
    $this->pricing = BillboardPricing::create([
        'billboard_id' => $this->billboard->id,
        'price_per_month' => 50000000,
        'price_per_day' => 2000000,
        'price_per_week' => 12000000,
        'price_per_year' => 500000000,
        'min_duration_days' => 7,
        'is_active' => true,
    ]);

    // Create a user with role 'user'
    $this->user = User::factory()->create(['role' => 'user']);
});

it('can create a booking successfully with different duration types', function (string $type, int $value): void {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/v1/user/spots/{$this->billboard->id}/book", [
            'start_date' => now()->addDays(5)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
            'duration_type' => $type,
            'duration_value' => $value,
            'notes' => 'Test booking ' . $type,
        ]);

    $response->assertCreated()
        ->assertJsonPath('message', 'Booking created successfully');

    $this->assertDatabaseHas('bookings', [
        'user_id' => $this->user->id,
        'billboard_id' => $this->billboard->id,
        'duration_type' => $type,
        'duration_value' => $value,
        'status' => 'pending_payment',
    ]);
})->with([
    ['daily', 15],
    ['weekly', 2],
    ['monthly', 1],
    ['monthly', 3], // Should hit discount_3month
    ['monthly', 6], // Should hit discount_6month
    ['monthly', 12], // Should hit discount_1year
    ['yearly', 1],
]);

it('rejects booking for inactive billboard', function (): void {
    $this->billboard->update(['is_active' => false]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/v1/user/spots/{$this->billboard->id}/book", [
            'start_date' => now()->addDays(5)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
            'duration_type' => 'daily',
            'duration_value' => 15,
        ]);

    $response->assertUnprocessable()
        ->assertJsonPath('message', 'Billboard is not available for booking');
});

it('rejects booking shorter than minimum duration', function (): void {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/v1/user/spots/{$this->billboard->id}/book", [
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(3)->toDateString(),
            'duration_type' => 'daily',
            'duration_value' => 2,
        ]);

    $response->assertUnprocessable()
        ->assertJsonPath('message', 'Minimum booking duration is 7 days');
});

it('prevents double booking (schedule conflict)', function (): void {
    // Create first booking
    Booking::create([
        'booking_code' => 'ORD-TEST-001',
        'user_id' => $this->user->id,
        'billboard_id' => $this->billboard->id,
        'pricing_id' => $this->pricing->id,
        'duration_type' => 'daily',
        'duration_value' => 15,
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date' => now()->addDays(20)->toDateString(),
        'total_days' => 15,
        'base_price' => 30000000,
        'tax_amount' => 3300000,
        'total_price' => 33300000,
        'status' => 'pending_payment',
    ]);

    // Try to book overlapping dates
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/v1/user/spots/{$this->billboard->id}/book", [
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(25)->toDateString(),
            'duration_type' => 'daily',
            'duration_value' => 15,
        ]);

    $response->assertStatus(409)
        ->assertJsonPath('message', 'Billboard is already booked for the selected dates. Please choose different dates.');
});

it('allows booking after cancelled or rejected booking on same dates', function (string $status): void {
    // Create a cancelled or rejected booking
    Booking::create([
        'booking_code' => 'ORD-TEST-002-' . $status,
        'user_id' => $this->user->id,
        'billboard_id' => $this->billboard->id,
        'pricing_id' => $this->pricing->id,
        'duration_type' => 'daily',
        'duration_value' => 15,
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date' => now()->addDays(20)->toDateString(),
        'total_days' => 15,
        'base_price' => 30000000,
        'tax_amount' => 3300000,
        'total_price' => 33300000,
        'status' => $status,
    ]);

    // Should be allowed since the previous one was cancelled/rejected
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/v1/user/spots/{$this->billboard->id}/book", [
            'start_date' => now()->addDays(5)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
            'duration_type' => 'daily',
            'duration_value' => 15,
        ]);

    $response->assertCreated();
})->with([
    ['cancelled'],
    ['rejected'],
]);

it('only shows bookings owned by authenticated user', function (): void {
    $otherUser = User::factory()->create(['role' => 'user']);

    // Create booking for authenticated user
    $myBooking = Booking::create([
        'booking_code' => 'ORD-MINE-001',
        'user_id' => $this->user->id,
        'billboard_id' => $this->billboard->id,
        'pricing_id' => $this->pricing->id,
        'duration_type' => 'daily',
        'duration_value' => 10,
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date' => now()->addDays(15)->toDateString(),
        'total_days' => 10,
        'base_price' => 20000000,
        'tax_amount' => 2200000,
        'total_price' => 22200000,
        'status' => 'pending_payment',
    ]);

    // Create booking for other user
    Booking::create([
        'booking_code' => 'ORD-OTHER-001',
        'user_id' => $otherUser->id,
        'billboard_id' => $this->billboard->id,
        'pricing_id' => $this->pricing->id,
        'duration_type' => 'daily',
        'duration_value' => 10,
        'start_date' => now()->addDays(30)->toDateString(),
        'end_date' => now()->addDays(40)->toDateString(),
        'total_days' => 10,
        'base_price' => 20000000,
        'tax_amount' => 2200000,
        'total_price' => 22200000,
        'status' => 'pending_payment',
    ]);

    // List should only show my booking
    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/v1/user/activities');

    $response->assertSuccessful();
    expect($response->json('data.data'))->toHaveCount(1);
    expect($response->json('data.data.0.id'))->toBe($myBooking->id);
});

it('prevents user from viewing another users booking detail', function (): void {
    $otherUser = User::factory()->create(['role' => 'user']);

    $otherBooking = Booking::create([
        'booking_code' => 'ORD-OTHER-002',
        'user_id' => $otherUser->id,
        'billboard_id' => $this->billboard->id,
        'pricing_id' => $this->pricing->id,
        'duration_type' => 'daily',
        'duration_value' => 10,
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date' => now()->addDays(15)->toDateString(),
        'total_days' => 10,
        'base_price' => 20000000,
        'tax_amount' => 2200000,
        'total_price' => 22200000,
        'status' => 'pending_payment',
    ]);

    // Try to access other user's booking
    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson("/api/v1/user/activities/{$otherBooking->id}");

    $response->assertNotFound();
});

it('can cancel a pending booking', function (): void {
    $booking = Booking::create([
        'booking_code' => 'ORD-CANCEL-001',
        'user_id' => $this->user->id,
        'billboard_id' => $this->billboard->id,
        'pricing_id' => $this->pricing->id,
        'duration_type' => 'daily',
        'duration_value' => 10,
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date' => now()->addDays(15)->toDateString(),
        'total_days' => 10,
        'base_price' => 20000000,
        'tax_amount' => 2200000,
        'total_price' => 22200000,
        'status' => 'pending_payment',
    ]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->patchJson("/api/v1/user/activities/{$booking->id}/cancel", [
            'cancel_reason' => 'Berubah pikiran',
        ]);

    $response->assertSuccessful()
        ->assertJsonPath('message', 'Booking cancelled successfully');

    $this->assertDatabaseHas('bookings', [
        'id' => $booking->id,
        'status' => 'cancelled',
        'cancel_reason' => 'Berubah pikiran',
    ]);
});

it('cannot cancel an active booking', function (): void {
    $booking = Booking::create([
        'booking_code' => 'ORD-ACTIVE-001',
        'user_id' => $this->user->id,
        'billboard_id' => $this->billboard->id,
        'pricing_id' => $this->pricing->id,
        'duration_type' => 'daily',
        'duration_value' => 10,
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date' => now()->addDays(15)->toDateString(),
        'total_days' => 10,
        'base_price' => 20000000,
        'tax_amount' => 2200000,
        'total_price' => 22200000,
        'status' => 'active',
    ]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->patchJson("/api/v1/user/activities/{$booking->id}/cancel");

    $response->assertUnprocessable();

    $this->assertDatabaseHas('bookings', [
        'id' => $booking->id,
        'status' => 'active',
    ]);
});

it('cannot cancel another users booking', function (): void {
    $otherUser = User::factory()->create(['role' => 'user']);

    $otherBooking = Booking::create([
        'booking_code' => 'ORD-OTHCANC-001',
        'user_id' => $otherUser->id,
        'billboard_id' => $this->billboard->id,
        'pricing_id' => $this->pricing->id,
        'duration_type' => 'daily',
        'duration_value' => 10,
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date' => now()->addDays(15)->toDateString(),
        'total_days' => 10,
        'base_price' => 20000000,
        'tax_amount' => 2200000,
        'total_price' => 22200000,
        'status' => 'pending_payment',
    ]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->patchJson("/api/v1/user/activities/{$otherBooking->id}/cancel");

    $response->assertNotFound();
});
