<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\Api\V1\Admin\StoreUserRequest;
use App\Http\Requests\Api\V1\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

final class UserController
{
    /**
     * Display a listing of the users.
     */
    public function index(): JsonResponse
    {
        $users = User::query()->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $users->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'status' => $user->is_active ? 'Active' : 'Inactive',
                    'is_active' => $user->is_active,
                    'is_verified' => $user->is_verified,
                    'joinDate' => $user->created_at->format('Y-m-d'),
                    'lastLogin' => '—', // Placeholder for now
                ];
            }),
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = $validated['status'] === 'Active';
        $validated['is_verified'] = true;
        unset($validated['status']);

        $user = User::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'User created successfully.',
            'data' => $user,
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $user,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $validated = $request->validated();

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        if (isset($validated['status'])) {
            $validated['is_active'] = $validated['status'] === 'Active';
            unset($validated['status']);
        }

        $user->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'User updated successfully.',
            'data' => $user,
        ]);
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting yourself if needed, but skipping for simplicity
        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully.',
        ]);
    }
}
