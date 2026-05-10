<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('user can register', function (): void {
    $response = $this->postJson('/api/v1/user/auth/register', [
        'email' => 'john@test.com',
        'company_name' => 'PT John Test',
        'nib' => '1234567890123',
        'password' => 'password',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'access_token',
            'refresh_token',
            'user' => [
                'id',
                'name',
                'email',
            ],
        ]);

    $this->assertDatabaseHas('users', [
        'email' => 'john@test.com',
        'role' => 'user',
    ]);
});

test('user can login', function (): void {
    $user = User::factory()->create([
        'email' => 'jane@test.com',
        'password' => Hash::make('password'),
        'role' => 'user',
    ]);

    $response = $this->postJson('/api/v1/user/auth/login', [
        'email' => 'jane@test.com',
        'password' => 'password',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'access_token',
            'refresh_token',
            'user' => [
                'id',
                'name',
                'email',
            ],
        ]);
});

test('admin cannot login as regular user', function (): void {
    $admin = User::factory()->create([
        'email' => 'admin_user@test.com',
        'password' => Hash::make('password'),
        'role' => 'admin',
    ]);

    $response = $this->postJson('/api/v1/user/auth/login', [
        'email' => 'admin_user@test.com',
        'password' => 'password',
    ]);

    $response->assertStatus(422);
});

test('user can get profile', function (): void {
    $user = User::factory()->create(['role' => 'user']);
    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withToken($token)
        ->getJson('/api/v1/user/me');

    $response->assertStatus(200)
        ->assertJsonPath('data.email', $user->email);
});

test('user can logout', function (): void {
    $user = User::factory()->create(['role' => 'user']);
    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withToken($token)
        ->postJson('/api/v1/user/logout');

    $response->assertStatus(200);
    $this->assertCount(0, $user->tokens);
});
