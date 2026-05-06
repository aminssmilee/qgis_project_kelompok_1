<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

final class UserAuthService
{
    /**
     * Handle user registration.
     *
     * @param  array<string, mixed>  $data
     * @return array{user: User, token: string}
     */
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data): array {
            $company = Company::query()->create([
                'name' => $data['company_name'],
                'nib' => $data['nib'],
            ]);

            $user = User::query()->create([
                'company_id' => $company->id,
                'name' => $data['company_name'], // Default name to company name
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'user',
                'is_active' => true,
                'is_verified' => false,
                'phone' => '-', // Default placeholder for now
            ]);

            $token = $user->createToken('auth_token', ['role:user'])->plainTextToken;

            return [
                'user' => $user,
                'token' => $token,
            ];
        });
    }

    /**
     * Handle user login.
     *
     * @param  array<string, string>  $credentials
     * @return array{user: User, token: string}
     *
     * @throws ValidationException
     */
    public function login(array $credentials): array
    {
        $user = User::query()->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password) || $user->role !== 'user') {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang diberikan tidak cocok atau Anda tidak memiliki akses.'],
            ]);
        }

        $token = $user->createToken('auth_token', ['role:user'])->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }
}
