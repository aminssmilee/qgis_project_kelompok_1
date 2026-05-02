<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Resources\Api\V1\AdminResource;
use App\Http\Requests\Api\V1\Admin\Auth\LoginAdminRequest;
use App\Services\Auth\AdminAuthService;
use Illuminate\Http\JsonResponse;

final readonly class AuthController
{
    public function __construct(
        private AdminAuthService $adminAuthService
    ) {}

    /**
     * Handle admin login.
     */
    public function login(LoginAdminRequest $request): JsonResponse
    {
        $result = $this->adminAuthService->login($request->validated());

        return response()->json([
            'message' => 'Login success',
            'data' => new AdminResource($result['user']),
            'token' => $result['token'],
        ]);
    }

    /**
     * Handle admin logout.
     */
    public function logout(): JsonResponse
    {
        auth()->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout success',
        ]);
    }
}
