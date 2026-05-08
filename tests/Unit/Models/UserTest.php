<?php

declare(strict_types=1);

use App\Models\User;

test('to array', function (): void {
    $user = User::factory()->create()->refresh();

    expect(array_keys($user->toArray()))
        ->toBe([
            'id',
            'name',
            'email',
            'phone',
            'avatar_url',
            'is_verified',
            'is_active',
            'created_at',
            'updated_at',
            'role',
            'company_id',
        ]);
});
