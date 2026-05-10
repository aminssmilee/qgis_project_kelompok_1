<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\Api\V1\Admin\StoreClientRequest;
use App\Http\Requests\Api\V1\Admin\UpdateClientRequest;
use App\Models\Company;
use Illuminate\Http\JsonResponse;

final class ClientController
{
    /**
     * Display a listing of the clients.
     */
    public function index(): JsonResponse
    {
        $clients = Company::query()
            ->withCount('rentals')
            ->latest()
            ->get()
            ->map(fn (Company $client): array => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
                'city' => $client->city,
                'status' => $client->status,
                'totalRentals' => $client->rentals_count,
                'joinDate' => $client->created_at->format('Y-m-d'),
            ]);

        return response()->json([
            'status' => 'success',
            'data' => $clients,
        ]);
    }

    /**
     * Store a newly created client in storage.
     */
    public function store(StoreClientRequest $request): JsonResponse
    {
        $client = Company::query()->create($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Klien berhasil ditambahkan.',
            'data' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
                'city' => $client->city,
                'status' => $client->status,
                'totalRentals' => 0,
                'joinDate' => $client->created_at->format('Y-m-d'),
            ],
        ], 201);
    }

    /**
     * Display the specified client.
     */
    public function show(string $id): JsonResponse
    {
        $client = Company::query()->withCount('rentals')->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
                'city' => $client->city,
                'status' => $client->status,
                'totalRentals' => $client->rentals_count,
                'joinDate' => $client->created_at->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Update the specified client in storage.
     */
    public function update(UpdateClientRequest $request, string $id): JsonResponse
    {
        $client = Company::query()->findOrFail($id);
        $client->update($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Data klien berhasil diperbarui.',
            'data' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
                'city' => $client->city,
                'status' => $client->status,
                'totalRentals' => $client->rentals()->count(),
                'joinDate' => $client->created_at->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Remove the specified client from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $client = Company::query()->findOrFail($id);
        $client->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Klien berhasil dihapus.',
        ]);
    }
}
