<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\User\AuthController;
use App\Http\Controllers\Api\V1\User\BillboardController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard-data', [DashboardController::class, 'getData']);

// API V1 Routes
Route::prefix('v1')->group(function (): void {
    // End User API (Mobile App)
    Route::prefix('user')->group(function (): void {
        // Public Auth Routes
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);

        // Public Billboard Routes
        Route::get('/billboards', [BillboardController::class, 'index']);
        Route::get('/billboards/{id}', [BillboardController::class, 'show']);

        // Protected User Routes (Require Token)
        Route::middleware('auth:sanctum')->group(function (): void {
            // Profil, Booking, dll akan ditambahkan di sini
        });
    });
});
