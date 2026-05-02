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
            'message' => 'User registered successfully',
            'data' => new UserResource($result['user']),
            'access_token' => $result['token'],
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Handle user login.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->userAuthService->login($request->validated());

        return response()->json([
            'message' => 'Login successful',
            'data' => new UserResource($result['user']),
            'access_token' => $result['token'],
            'token_type' => 'Bearer',
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
