<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\User\AuthController;
use App\Http\Controllers\Api\V1\User\BillboardController;
use App\Http\Controllers\Api\V1\User\BookingController;
use App\Http\Controllers\Api\V1\User\CategoryController;
use App\Http\Controllers\Api\V1\User\CompanyController;
use App\Http\Controllers\Api\V1\User\DashboardController as UserDashboardController;
use App\Http\Controllers\Api\V1\User\ProfileController;
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

        // Public Spot Routes (Explore)
        Route::get('/spots', [BillboardController::class, 'index']);
        Route::get('/spots/{id}', [BillboardController::class, 'show']);

        // Public Category Routes
        Route::get('/categories', [CategoryController::class, 'index']);

        // Protected User Routes (Require Token)
        Route::middleware(['auth:sanctum', 'role:user'])->group(function (): void {
            Route::get('/me', [AuthController::class, 'me']);
            Route::patch('/me', [ProfileController::class, 'update']);
            Route::post('/logout', [AuthController::class, 'logout']);

            // Dashboard Summary
            Route::get('/dashboard/summary', [UserDashboardController::class, 'summary']);

            // Booking Routes
            Route::post('/spots/{id}/book', [BookingController::class, 'store']);

            // Company Routes
            Route::get('/companies/{id}', [CompanyController::class, 'show']);
            Route::patch('/companies/{id}', [CompanyController::class, 'update']);
            // Profil, Booking, dll akan ditambahkan di sini
        });
    });
    // Admin API (Web Dashboard)
    Route::prefix('admin')->group(function (): void {
        Route::post('/login', [App\Http\Controllers\Api\V1\Admin\AuthController::class, 'login']);

        Route::middleware(['auth:sanctum', 'role:admin'])->group(function (): void {
            Route::post('/logout', [App\Http\Controllers\Api\V1\Admin\AuthController::class, 'logout']);
        });
    });
});
