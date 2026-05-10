<?php

declare(strict_types=1);

use App\Models\Billboard;
use App\Models\BillboardCategory;
use App\Models\BillboardPricing;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    $this->category = BillboardCategory::create([
        'name' => 'Standard',
        'description' => 'Standard billboard',
    ]);

    $this->billboard = Billboard::create([
        'category_id' => $this->category->id,
        'name' => 'Billboard Test Notif',
        'code' => 'BBD-NOTIF-001',
        'address' => 'Jl. Test No. 1',
        'district' => 'Test District',
        'city' => 'Samarinda',
        'is_active' => true,
    ]);

    DB::table('billboards')
        ->where('id', $this->billboard->id)
        ->update(['location' => DB::raw('ST_MakePoint(117.1, -0.5)::geography')]);

    $this->pricing = BillboardPricing::create([
        'billboard_id' => $this->billboard->id,
        'price_per_month' => 50000000,
        'price_per_day' => 2000000,
        'price_per_week' => 12000000,
        'price_per_year' => 500000000,
        'min_duration_days' => 7,
        'is_active' => true,
    ]);

    $this->user = User::factory()->create(['role' => 'user']);
    $this->admin = User::factory()->create(['role' => 'admin']);

    // Helper: create a booking for the user
    $this->booking = Booking::create([
        'booking_code' => 'ORD-NOTIF-001',
        'user_id' => $this->user->id,
        'billboard_id' => $this->billboard->id,
        'pricing_id' => $this->pricing->id,
        'duration_type' => 'monthly',
        'duration_value' => 1,
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date' => now()->addDays(35)->toDateString(),
        'total_days' => 30,
        'base_price' => 50000000,
        'tax_amount' => 5500000,
        'total_price' => 55500000,
        'status' => 'pending_payment',
    ]);
});

// ─── Notification Tests ────────────────────────────────────────────────────

it('creates a notification when a booking is created', function (): void {
    $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/v1/user/spots/{$this->billboard->id}/book", [
            'start_date' => now()->addDays(60)->toDateString(),
            'end_date' => now()->addDays(90)->toDateString(),
            'duration_type' => 'monthly',
            'duration_value' => 1,
        ])
        ->assertCreated();

    $this->assertDatabaseHas('notifications', [
        'user_id' => $this->user->id,
        'type' => 'booking_created',
    ]);
});

it('creates a notification when admin approves a booking', function (): void {
    $this->actingAs($this->admin, 'sanctum')
        ->patchJson("/api/v1/admin/bookings/{$this->booking->id}/approve")
        ->assertSuccessful();

    $this->assertDatabaseHas('notifications', [
        'user_id' => $this->user->id,
        'type' => 'booking_approved',
    ]);
});

it('creates a notification when admin rejects a booking', function (): void {
    $this->actingAs($this->admin, 'sanctum')
        ->patchJson("/api/v1/admin/bookings/{$this->booking->id}/reject", [
            'admin_note' => 'Billboard sedang dalam perbaikan.',
        ])
        ->assertSuccessful();

    $this->assertDatabaseHas('notifications', [
        'user_id' => $this->user->id,
        'type' => 'booking_rejected',
    ]);
});

// ─── Auto-Cancel Command Tests ─────────────────────────────────────────────

it('auto-cancels pending bookings older than 3 days', function (): void {
    // Move created_at to 4 days ago to simulate expired booking
    DB::table('bookings')
        ->where('id', $this->booking->id)
        ->update(['created_at' => now()->subDays(4)]);

    $this->artisan('bookings:cancel-expired')
        ->assertExitCode(0)
        ->expectsOutput('Successfully cancelled 1 expired booking(s).');

    $this->assertDatabaseHas('bookings', [
        'id' => $this->booking->id,
        'status' => 'cancelled',
    ]);

    // Should also send expired notification
    $this->assertDatabaseHas('notifications', [
        'user_id' => $this->user->id,
        'type' => 'booking_expired',
    ]);
});

it('does not cancel recent pending bookings', function (): void {
    $this->artisan('bookings:cancel-expired')
        ->assertExitCode(0)
        ->expectsOutput('No expired bookings found.');

    $this->assertDatabaseHas('bookings', [
        'id' => $this->booking->id,
        'status' => 'pending_payment',
    ]);
});

it('does not cancel already active bookings', function (): void {
    $this->booking->update(['status' => 'active']);

    DB::table('bookings')
        ->where('id', $this->booking->id)
        ->update(['created_at' => now()->subDays(10)]);

    $this->artisan('bookings:cancel-expired')
        ->assertExitCode(0)
        ->expectsOutput('No expired bookings found.');

    $this->assertDatabaseHas('bookings', [
        'id' => $this->booking->id,
        'status' => 'active',
    ]);
});

// ─── Booking Creative Upload Tests ─────────────────────────────────────────

it('can upload a creative file for an active booking', function (): void {
    Storage::fake('public');

    $this->booking->update(['status' => 'active']);

    $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/v1/user/activities/{$this->booking->id}/creatives", [
            'file' => UploadedFile::fake()->create('design.jpg', 500, 'image/jpeg'),
        ])
        ->assertCreated()
        ->assertJsonPath('message', 'Creative file uploaded successfully. It is pending admin review.');

    $this->assertDatabaseHas('booking_creatives', [
        'booking_id' => $this->booking->id,
        'file_name' => 'design.jpg',
        'status' => 'pending_review',
    ]);
});

it('cannot upload creative for a pending booking', function (): void {
    Storage::fake('public');

    // booking is still pending_payment
    $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/v1/user/activities/{$this->booking->id}/creatives", [
            'file' => UploadedFile::fake()->create('design.jpg', 500, 'image/jpeg'),
        ])
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Creative files can only be uploaded for active bookings.');
});

it('cannot upload creative for another users booking', function (): void {
    Storage::fake('public');

    $otherUser = User::factory()->create(['role' => 'user']);
    $this->booking->update(['status' => 'active']);

    $this->actingAs($otherUser, 'sanctum')
        ->postJson("/api/v1/user/activities/{$this->booking->id}/creatives", [
            'file' => UploadedFile::fake()->create('design.jpg', 500, 'image/jpeg'),
        ])
        ->assertNotFound();
});

it('can list creative files for own booking', function (): void {
    Storage::fake('public');

    $this->booking->update(['status' => 'active']);

    // Upload first
    $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/v1/user/activities/{$this->booking->id}/creatives", [
            'file' => UploadedFile::fake()->create('design.pdf', 1000, 'application/pdf'),
        ])
        ->assertCreated();

    // Then list
    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson("/api/v1/user/activities/{$this->booking->id}/creatives")
        ->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.file_name'))->toBe('design.pdf');
});
