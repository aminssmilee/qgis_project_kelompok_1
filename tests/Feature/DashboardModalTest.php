<?php

declare(strict_types=1);

use App\Models\Billboard;
use App\Models\BillboardCategory;
use App\Models\Company;
use App\Models\Rental;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;

uses(RefreshDatabase::class);

it('returns dashboard options for rental dropdowns', function (): void {
    $client = Company::query()->create([
        'name' => 'PT Maju Jaya',
        'email' => 'maju@example.com',
        'phone' => '081234567890',
        'city' => 'Jakarta',
        'status' => 'Active',
    ]);

    $category = BillboardCategory::query()->create([
        'name' => 'Digital',
        'description' => 'Billboard digital',
    ]);

    $billboard = Billboard::query()->create([
        'category_id' => $category->id,
        'name' => 'Billboard Sudirman',
        'code' => 'BBD-001',
        'description' => 'Lokasi utama',
        'address' => 'Jl. Sudirman',
        'city' => 'Jakarta',
        'traffic_density' => 'high',
        'is_active' => true,
        'is_featured' => false,
    ]);

    getJson('/dashboard/options')
        ->assertOk()
        ->assertJsonPath('clients.0.id', $client->id)
        ->assertJsonPath('clients.0.name', $client->name)
        ->assertJsonPath('billboards.0.id', $billboard->id)
        ->assertJsonPath('billboards.0.name', $billboard->name);
});

it('stores a client from the dashboard modal', function (): void {
    $response = postJson('/dashboard/clients', [
        'name' => 'CV Sukses Bersama',
        'email' => 'sukses@example.com',
        'phone' => '081200000001',
        'city' => 'Bandung',
        'status' => 'Active',
    ]);

    $response->assertCreated()
        ->assertJsonPath('message', 'Klien berhasil ditambahkan.');

    expect(Company::query()->where('email', 'sukses@example.com')->exists())->toBeTrue();
});

it('stores a rental from the dashboard modal', function (): void {
    $client = Company::query()->create([
        'name' => 'PT Maju Jaya',
        'email' => 'rental-client@example.com',
        'phone' => '081234567891',
        'city' => 'Jakarta',
        'status' => 'Active',
    ]);

    $category = BillboardCategory::query()->create([
        'name' => 'Static',
        'description' => 'Billboard statis',
    ]);

    $billboard = Billboard::query()->create([
        'category_id' => $category->id,
        'name' => 'Billboard Pusat Kota',
        'code' => 'BBD-002',
        'description' => 'Lokasi pusat kota',
        'address' => 'Jl. Pusat Kota',
        'city' => 'Jakarta',
        'traffic_density' => 'high',
        'is_active' => true,
        'is_featured' => false,
    ]);

    $response = postJson('/dashboard/rentals', [
        'company_id' => $client->id,
        'billboard_id' => $billboard->id,
        'rental_date' => '2026-05-08',
        'duration_days' => 30,
        'total_price' => 50000000,
        'payment_status' => 'Pending',
    ]);

    $response->assertCreated()
        ->assertJsonPath('message', 'Penyewaan berhasil ditambahkan.');

    expect(Rental::query()->where('company_id', $client->id)->where('billboard_id', $billboard->id)->exists())->toBeTrue();
});