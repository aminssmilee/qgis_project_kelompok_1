<?php

declare(strict_types=1);

use function Pest\Laravel\get;

it('returns the spa shell for dashboard route', function (): void {
    get('/dashboard')
        ->assertOk();
});
