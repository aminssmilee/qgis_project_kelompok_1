<?php

declare(strict_types=1);

use function Pest\Laravel\getJson;

it('returns dashboard data successfully', function (): void {
    $response = getJson('/api/dashboard-data');

    $response->assertStatus(200)
        ->assertJsonCount(2)
        ->assertJsonStructure([
            '*' => [
                'id',
                'header',
                'type',
                'status',
                'target',
                'limit',
                'reviewer',
            ],
        ]);
});
