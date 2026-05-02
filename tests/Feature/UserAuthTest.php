<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('user can register', function () {
    $response = $this->postJson('/api/v1/user/register', [
        'name' => 'John Doe',
        'email' => 'john@test.com',
        'phone' => '081234567890',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'message',
            'data' => [
                'id',
                'name',
                'email',
            ],
            'access_token',
        ]);
    
    $this->assertDatabaseHas('users', [
        'email' => 'john@test.com',
        'role' => 'user',
    ]);
});

test('user can login', function () {
    $user = User::factory()->create([
        'email' => 'jane@test.com',
        'password' => Hash::make('password'),
        'role' => 'user',
    ]);

    $response = $this->postJson('/api/v1/user/login', [
        'email' => 'jane@test.com',
        'password' => 'password',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'message',
            'access_token',
        ]);
});

test('admin cannot login as regular user', function () {
    $admin = User::factory()->create([
        'email' => 'admin_user@test.com',
        'password' => Hash::make('password'),
        'role' => 'admin',
    ]);

    $response = $this->postJson('/api/v1/user/login', [
        'email' => 'admin_user@test.com',
        'password' => 'password',
    ]);

    $response->assertStatus(422);
});

test('user can get profile', function () {
    $user = User::factory()->create(['role' => 'user']);
    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withToken($token)
        ->getJson('/api/v1/user/me');

    $response->assertStatus(200)
        ->assertJsonPath('data.email', $user->email);
});

test('user can logout', function () {
    $user = User::factory()->create(['role' => 'user']);
    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withToken($token)
        ->postJson('/api/v1/user/logout');

    $response->assertStatus(200);
    $this->assertCount(0, $user->tokens);
});
