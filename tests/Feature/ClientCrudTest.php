<?php

declare(strict_types=1);

use App\Models\Company;

use function Pest\Laravel\delete;
use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function Pest\Laravel\put;

it('shows the clients page', function (): void {
    get('/dashboard/clients')
        ->assertOk();
});

it('stores a client with validation', function (): void {
    post('/dashboard/clients', [
        'name' => 'PT Sinar Jaya',
        'email' => 'hello@sinarjaya.id',
        'phone' => '081234567890',
        'city' => 'Lamongan',
        'status' => 'Active',
        'form_mode' => 'create',
    ])->assertRedirect(route('dashboard.clients.index'));
    
    $client = Company::query()->where('email', 'hello@sinarjaya.id')->first();

    expect($client)->not()->toBeNull();
    expect($client?->name)->toBe('PT Sinar Jaya');
});

it('rejects invalid client data', function (): void {
    post('/dashboard/clients', [
        'name' => '',
        'email' => 'invalid-email',
        'phone' => '',
        'city' => '',
        'status' => 'Unknown',
        'form_mode' => 'create',
    ])->assertSessionHasErrors(['name', 'email', 'phone', 'city', 'status']);
});

it('updates a client', function (): void {
    $client = Company::query()->create([
        'name' => 'PT Lama',
        'email' => 'lama@example.com',
        'phone' => '0811111111',
        'city' => 'Gresik',
        'status' => 'Inactive',
    ]);

    put("/dashboard/clients/{$client->id}", [
        'name' => 'PT Baru',
        'email' => 'baru@example.com',
        'phone' => '0822222222',
        'city' => 'Lamongan',
        'status' => 'Active',
        'form_mode' => 'edit',
        'record_id' => $client->id,
    ])->assertRedirect(route('dashboard.clients.index'));

    $client->refresh();

    expect($client->name)->toBe('PT Baru');
    expect($client->city)->toBe('Lamongan');
    expect($client->status)->toBe('Active');
});

it('deletes a client', function (): void {
    $client = Company::query()->create([
        'name' => 'PT Hapus',
        'email' => 'hapus@example.com',
        'phone' => '0833333333',
        'city' => 'Mojokerto',
        'status' => 'Active',
    ]);

    delete("/dashboard/clients/{$client->id}")
        ->assertRedirect(route('dashboard.clients.index'));

    $this->assertDatabaseMissing('companies', [
        'id' => $client->id,
    ]);
});
