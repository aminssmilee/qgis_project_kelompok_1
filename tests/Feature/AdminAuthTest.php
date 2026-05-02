<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('admin can login with correct credentials', function () {
    $admin = User::factory()->create([
        'email' => 'admin@test.com',
        'password' => Hash::make('password'),
        'role' => 'admin',
    ]);

    $response = $this->postJson('/api/v1/admin/login', [
        'email' => 'admin@test.com',
        'password' => 'password',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'message',
            'data' => [
                'id',
                'name',
                'email',
                'role',
            ],
            'token',
        ]);
});

test('regular user cannot login as admin', function () {
    $user = User::factory()->create([
        'email' => 'user@test.com',
        'password' => Hash::make('password'),
        'role' => 'user',
    ]);

    $response = $this->postJson('/api/v1/admin/login', [
        'email' => 'user@test.com',
        'password' => 'password',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('admin can logout', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $token = $admin->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)
        ->postJson('/api/v1/admin/logout');

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Logout success',
        ]);

    $this->assertCount(0, $admin->tokens);
});
