<?php

declare(strict_types=1);

use App\Models\Billboard;
use App\Models\BillboardCategory;
use App\Models\User;

it('returns admin billboards with coordinates on non-postgres drivers', function (): void {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $token = $admin->createToken('test-token')->plainTextToken;

    $category = BillboardCategory::factory()->create();

    Billboard::factory()
        ->for($category, 'category')
        ->create([
            'location' => json_encode(['lat' => -1.25, 'lng' => 116.85]),
        ]);

    $response = $this->withToken($token)
        ->getJson('/api/v1/admin/billboards');

    $response->assertSuccessful()
        ->assertJsonPath('data.0.lat', -1.25)
        ->assertJsonPath('data.0.lng', 116.85);
});
