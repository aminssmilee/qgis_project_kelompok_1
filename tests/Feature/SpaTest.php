<?php

declare(strict_types=1);

use function Pest\Laravel\get;

it('returns spa view for root path', function (): void {
    $response = get('/');

    $response->assertStatus(200);
});

it('returns spa view for any other path', function (): void {
    $response = get('/random-path');

    $response->assertStatus(200);
});
