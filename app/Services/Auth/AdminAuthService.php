<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

final class AdminAuthService
{
    /**
     * Handle admin login logic.
     *
     * @param  array<string, string>  $credentials
     * @return array{user: User, token: string}
     *
     * @throws ValidationException
     */
    public function login(array $credentials): array
    {
        $user = User::query()->where('email', mb_trim($credentials['email']))->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password) || $user->role !== 'admin') {
            throw ValidationException::withMessages([
                'email' => ['Kredensial tidak valid.'],
            ]);
        }

        $token = $user->createToken('admin-token', ['role:admin'])->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }
}
