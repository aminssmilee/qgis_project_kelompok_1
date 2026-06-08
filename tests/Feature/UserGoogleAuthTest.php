<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Http;

test('new user can login using Google and gets registered', function (): void {
    Http::fake([
        'oauth2.googleapis.com/*' => Http::response([
            'email' => 'new_google_user@test.com',
            'name' => 'New Google User',
            'picture' => 'https://example.com/avatar.png',
            'aud' => 'dummy_google_client_id',
        ], 200),
    ]);

    $response = $this->postJson('/api/v1/user/auth/google', [
        'id_token' => 'valid_token_123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'access_token',
            'refresh_token',
            'user' => [
                'id',
                'name',
                'email',
                'avatar_url',
            ],
        ])
        ->assertJsonPath('user.email', 'new_google_user@test.com')
        ->assertJsonPath('user.name', 'New Google User')
        ->assertJsonPath('user.avatar_url', 'https://example.com/avatar.png');

    $this->assertDatabaseHas('users', [
        'email' => 'new_google_user@test.com',
        'role' => 'user',
        'is_verified' => true,
    ]);
});

test('existing user can login using Google', function (): void {
    $user = User::factory()->create([
        'email' => 'existing_google_user@test.com',
        'name' => 'Old Name',
        'role' => 'user',
    ]);

    Http::fake([
        'oauth2.googleapis.com/*' => Http::response([
            'email' => 'existing_google_user@test.com',
            'name' => 'New Name From Google',
            'picture' => 'https://example.com/new_avatar.png',
        ], 200),
    ]);

    $response = $this->postJson('/api/v1/user/auth/google', [
        'id_token' => 'valid_token_456',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'access_token',
            'refresh_token',
            'user',
        ])
        ->assertJsonPath('user.email', 'existing_google_user@test.com');

    // Avatar url should be updated
    $user->refresh();
    expect($user->avatar_url)->toBe('https://example.com/new_avatar.png');
});

test('google login fails if token verification fails', function (): void {
    Http::fake([
        'oauth2.googleapis.com/*' => Http::response([
            'error' => 'invalid_token',
        ], 400),
    ]);

    $response = $this->postJson('/api/v1/user/auth/google', [
        'id_token' => 'invalid_token_999',
    ]);

    $response->assertStatus(401)
        ->assertJsonPath('message', 'Verifikasi token Google gagal.');
});
