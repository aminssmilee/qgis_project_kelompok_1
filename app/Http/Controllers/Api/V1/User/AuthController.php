<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Requests\Api\V1\User\Auth\LoginRequest;
use App\Http\Requests\Api\V1\User\Auth\RegisterRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Services\Auth\UserAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final readonly class AuthController
{
    public function __construct(
        private UserAuthService $userAuthService
    ) {}

    /**
     * Handle user registration.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->userAuthService->register($request->validated());

        return response()->json([
            'access_token' => $result['token'],
            'refresh_token' => 'dummy_refresh_token_for_sanctum', // Sanctum doesn't use refresh tokens natively
            'user' => new UserResource($result['user']),
        ], 201);
    }

    /**
     * Handle user login.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->userAuthService->login($request->validated());

        return response()->json([
            'access_token' => $result['token'],
            'refresh_token' => 'dummy_refresh_token_for_sanctum',
            'user' => new UserResource($result['user']),
        ]);
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
