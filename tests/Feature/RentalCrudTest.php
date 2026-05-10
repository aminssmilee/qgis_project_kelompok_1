<?php

declare(strict_types=1);

use App\Models\Billboard;
use App\Models\BillboardCategory;
use App\Models\Company;
use App\Models\Rental;
use Illuminate\Support\Facades\Date;

use function Pest\Laravel\delete;
use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function Pest\Laravel\put;

function makeRentalBillboard(): Billboard
{
    $category = BillboardCategory::query()->create([
        'name' => 'Statis',
        'description' => 'Kategori billboard untuk testing',
    ]);

    return Billboard::query()->create([
        'category_id' => $category->id,
        'name' => 'Billboard Test Lamongan',
        'code' => 'BBD-TST-001',
        'description' => 'Billboard untuk pengujian rental',
        'address' => 'Jalan Ahmad Yani, Lamongan',
        'district' => 'Lamongan',
        'city' => 'Lamongan',
        'traffic_density' => 'high',
        'is_illuminated' => false,
        'is_active' => true,
        'is_featured' => false,
        'created_by' => null,
    ]);
}

it('shows the rentals page', function (): void {
    get('/dashboard/rentals')
        ->assertOk();
});

it('stores a rental with computed end date', function (): void {
    $client = Company::query()->create([
        'name' => 'PT Penyewa',
        'email' => 'sewa@example.com',
        'phone' => '08125555555',
        'city' => 'Lamongan',
        'status' => 'Active',
    ]);

    $billboard = makeRentalBillboard();

    post('/dashboard/rentals', [
        'company_id' => $client->id,
        'billboard_id' => $billboard->id,
        'rental_date' => '2026-05-08',
        'duration_days' => 30,
        'total_price' => 75000000,
        'payment_status' => 'Paid',
        'form_mode' => 'create',
    ])->assertRedirect(route('dashboard.rentals.index'));

    $rental = Rental::query()->first();

    expect($rental)->not()->toBeNull();
    expect($rental?->end_date?->toDateString())->toBe('2026-06-06');
    expect($rental?->booking_code)->toStartWith('SEWA-'.now()->format('Ymd').'-');
});

it('rejects invalid rental data', function (): void {
    post('/dashboard/rentals', [
        'company_id' => '',
        'billboard_id' => '',
        'rental_date' => '',
        'duration_days' => 0,
        'total_price' => -1,
        'payment_status' => 'Invalid',
        'form_mode' => 'create',
    ])->assertSessionHasErrors(['company_id', 'billboard_id', 'rental_date', 'duration_days', 'total_price', 'payment_status']);
});

it('updates a rental', function (): void {
    $client = Company::query()->create([
        'name' => 'PT Update',
        'email' => 'update@example.com',
        'phone' => '08127777777',
        'city' => 'Gresik',
        'status' => 'Active',
    ]);

    $billboard = makeRentalBillboard();

    $rental = Rental::query()->create([
        'booking_code' => 'SEWA-20260508-EDIT',
        'company_id' => $client->id,
        'billboard_id' => $billboard->id,
        'rental_date' => '2026-05-08',
        'duration_days' => 15,
        'end_date' => Date::parse('2026-05-08')->addDays(14)->toDateString(),
        'total_price' => 35000000,
        'payment_status' => 'Pending',
    ]);

    put("/dashboard/rentals/{$rental->id}", [
        'company_id' => $client->id,
        'billboard_id' => $billboard->id,
        'rental_date' => '2026-05-10',
        'duration_days' => 20,
        'total_price' => 42000000,
        'payment_status' => 'Paid',
        'form_mode' => 'edit',
        'record_id' => $rental->id,
    ])->assertRedirect(route('dashboard.rentals.index'));

    $rental->refresh();

    expect($rental->rental_date->toDateString())->toBe('2026-05-10');
    expect($rental->duration_days)->toBe(20);
    expect($rental->payment_status)->toBe('Paid');
});

it('deletes a rental', function (): void {
    $client = Company::query()->create([
        'name' => 'PT Delete',
        'email' => 'delete@example.com',
        'phone' => '08128888888',
        'city' => 'Lamongan',
        'status' => 'Active',
    ]);

    $billboard = makeRentalBillboard();

    $rental = Rental::query()->create([
        'booking_code' => 'SEWA-20260508-DEL',
        'company_id' => $client->id,
        'billboard_id' => $billboard->id,
        'rental_date' => '2026-05-08',
        'duration_days' => 10,
        'end_date' => Date::parse('2026-05-08')->addDays(9)->toDateString(),
        'total_price' => 15000000,
        'payment_status' => 'Pending',
    ]);

    delete("/dashboard/rentals/{$rental->id}")
        ->assertRedirect(route('dashboard.rentals.index'));

    $this->assertDatabaseMissing('rentals', [
        'id' => $rental->id,
    ]);
});
