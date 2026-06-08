<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Requests\Api\V1\User\Auth\LoginRequest;
use App\Http\Requests\Api\V1\User\Auth\RegisterRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use App\Services\Auth\UserAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

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

    /**
     * Handle user login using Google ID token.
     */
    public function googleLogin(Request $request): JsonResponse
    {
        $request->validate([
            'id_token' => ['nullable', 'string'],
            'access_token' => ['nullable', 'string'],
        ]);

        $idToken = $request->input('id_token');
        $accessToken = $request->input('access_token');

        if (! $idToken && ! $accessToken) {
            return response()->json([
                'message' => 'Token otentikasi Google tidak ditemukan.',
            ], 400);
        }

        // Jika menggunakan access_token (biasanya di Web)
        if ($accessToken) {
            $response = Http::withoutVerifying()->withToken($accessToken)->get('https://www.googleapis.com/oauth2/v3/userinfo');
        } else {
            // Jika menggunakan id_token (Android/iOS)
            $response = Http::withoutVerifying()->get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $idToken,
            ]);
        }

        if ($response->failed()) {
            return response()->json([
                'message' => 'Verifikasi token Google gagal.',
            ], 401);
        }

        $payload = $response->json();
        $email = $payload['email'] ?? null;
        if (! $email) {
            return response()->json([
                'message' => 'Email tidak ditemukan dari token Google.',
            ], 400);
        }

        $name = $payload['name'] ?? 'Google User';
        $avatarUrl = $payload['picture'] ?? null;

        // Find or create user
        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            $user = User::query()->create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(Str::random(16)),
                'role' => 'user',
                'is_active' => true,
                'is_verified' => true,
                'phone' => '-',
                'avatar_url' => $avatarUrl,
            ]);
        } else {
            // Update avatar if provided
            $user->update([
                'avatar_url' => $avatarUrl ?? $user->avatar_url,
            ]);
        }

        $token = $user->createToken('auth_token', ['role:user'])->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'refresh_token' => 'dummy_refresh_token_for_sanctum',
            'user' => new UserResource($user),
        ]);
    }
}
