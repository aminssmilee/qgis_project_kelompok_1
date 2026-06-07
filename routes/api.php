<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Admin\BillboardController as AdminBillboardController;
use App\Http\Controllers\Api\V1\Admin\BookingModerationController;
use App\Http\Controllers\Api\V1\Admin\ClientController;
use App\Http\Controllers\Api\V1\Admin\PaymentController;
use App\Http\Controllers\Api\V1\Admin\ReportController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\PaymentCallbackController;
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
    // Payment Webhook (Public)
    Route::post('/payment/callback', [PaymentCallbackController::class, 'handle']);

    // End User API (Mobile App)
    Route::prefix('user')->group(function (): void {
        // Public Auth Routes
        Route::prefix('auth')->group(function (): void {
            Route::post('/register', [AuthController::class, 'register']);
            Route::post('/login', [AuthController::class, 'login']);
        });

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

            // Payment Channels
            Route::get('/payment-channels', [BookingController::class, 'getPaymentChannels']);

            // Dashboard Summary
            Route::get('/dashboard/summary', [UserDashboardController::class, 'summary']);

            // Dashboard Summary
            Route::get('/dashboard/summary', [UserDashboardController::class, 'summary']);

            // Booking & Activity Routes
            Route::post('/spots/{id}/book', [BookingController::class, 'store']);
            Route::get('/activities', [BookingController::class, 'index']);
            Route::get('/activities/{id}', [BookingController::class, 'show']);
            Route::patch('/activities/{id}/cancel', [BookingController::class, 'cancel']);
            // Company Routes
            Route::get('/companies/{id}', [CompanyController::class, 'show']);
            Route::patch('/companies/{id}', [CompanyController::class, 'update']);
            Route::post('/reminders', [ReminderController::class, 'store']);
        });
    });
    // Admin API (Web Dashboard)
    Route::prefix('admin')->group(function (): void {
        // Hanya login yang boleh akses tanpa token
        Route::post('/login', [App\Http\Controllers\Api\V1\Admin\AuthController::class, 'login']);

        Route::middleware(['auth:sanctum', 'role:admin'])->group(function (): void {
            Route::post('/logout', [App\Http\Controllers\Api\V1\Admin\AuthController::class, 'logout']);

            // Dashboard Summary
            Route::get('/dashboard/summary', [App\Http\Controllers\Api\V1\Admin\DashboardController::class, 'summary']);

            // Billboards CRUD (semua dilindungi — hanya admin login)
            Route::get('/billboards', [AdminBillboardController::class, 'index']);
            Route::get('/billboards/{id}', [AdminBillboardController::class, 'show']);
            Route::post('/billboards', [AdminBillboardController::class, 'store']);
            Route::put('/billboards/{id}', [AdminBillboardController::class, 'update']);
            Route::delete('/billboards/{id}', [AdminBillboardController::class, 'destroy']);

            // Photos
            Route::post('/billboards/{id}/photos', [AdminBillboardController::class, 'uploadPhoto']);

            // Users CRUD
            Route::get('/users', [UserController::class, 'index']);
            Route::get('/users/{id}', [UserController::class, 'show']);
            Route::post('/users', [UserController::class, 'store']);
            Route::put('/users/{id}', [UserController::class, 'update']);
            Route::delete('/users/{id}', [UserController::class, 'destroy']);

            // Clients CRUD
            Route::get('/clients', [ClientController::class, 'index']);
            Route::get('/clients/{id}', [ClientController::class, 'show']);
            Route::post('/clients', [ClientController::class, 'store']);
            Route::put('/clients/{id}', [ClientController::class, 'update']);
            Route::delete('/clients/{id}', [ClientController::class, 'destroy']);

            // Bookings CRUD
            Route::get('/bookings', [App\Http\Controllers\Api\V1\Admin\BookingController::class, 'index']);
            Route::patch('/bookings/{id}', [App\Http\Controllers\Api\V1\Admin\BookingController::class, 'update']);
            Route::patch('/bookings/{id}/approve-design', [BookingModerationController::class, 'approveDesign']);

            // Categories CRUD
            Route::apiResource('categories', App\Http\Controllers\Api\V1\Admin\CategoryController::class);

            // Reports & Payment logs
            Route::get('/reports/summary', [ReportController::class, 'summary']);
            Route::get('/payments', [PaymentController::class, 'index']);
        });
    });
});
