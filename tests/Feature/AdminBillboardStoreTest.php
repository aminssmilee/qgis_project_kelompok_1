<?php

declare(strict_types=1);

use App\Models\BillboardCategory;
use App\Models\User;

it('creates pricing and size when admin stores billboard', function (): void {
    $category = BillboardCategory::query()->create([
        'name' => 'Statis',
        'description' => 'Kategori statis',
    ]);

    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/billboards', [
        'name' => 'Billboard Admin Baru',
        'category_id' => $category->id,
        'address' => 'Jalan Test',
        'district' => 'Lamongan',
        'city' => 'Lamongan',
        'lat' => -7.3286,
        'lng' => 112.7513,
        'traffic_density' => 'medium',
        'is_active' => true,
        'is_featured' => false,
        'size' => '5x10',
        'price_label' => '225 Juta/6 bulan',
    ]);

    $response->assertCreated();

    $billboardId = $response->json('data.id');

    expect($billboardId)->not->toBeNull();

    $this->assertDatabaseHas('billboard_pricing', [
        'billboard_id' => $billboardId,
        'is_active' => true,
        'price_per_month' => '37500000.00',
    ]);

    $this->assertDatabaseHas('billboard_sizes', [
        'billboard_id' => $billboardId,
        'is_primary' => true,
        'label' => '5x10m',
        'width_m' => '5.00',
        'height_m' => '10.00',
        'area_m2' => '50.00',
    ]);
});
