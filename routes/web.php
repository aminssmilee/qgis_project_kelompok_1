<?php

declare(strict_types=1);

use App\Http\Controllers\Dashboard\BillboardController;
use App\Http\Controllers\Dashboard\ClientController;
use App\Http\Controllers\Dashboard\RentalController;
use App\Models\Billboard;
use App\Models\BillboardCategory;
use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Route;

Route::prefix('dashboard')->name('dashboard.')->group(function (): void {
    Route::get('/clients', fn (): Factory|View => view('app'))->name('clients.index');
    Route::get('/rentals', fn (): Factory|View => view('app'))->name('rentals.index');
    
    Route::post('/clients', [ClientController::class, 'store'])->name('clients.store');
    Route::put('/clients/{client}', [ClientController::class, 'update'])->name('clients.update');
    Route::delete('/clients/{client}', [ClientController::class, 'destroy'])->name('clients.destroy');

    Route::post('/rentals', [RentalController::class, 'store'])->name('rentals.store');
    Route::put('/rentals/{rental}', [RentalController::class, 'update'])->name('rentals.update');
    Route::delete('/rentals/{rental}', [RentalController::class, 'destroy'])->name('rentals.destroy');

    Route::post('/billboards', [BillboardController::class, 'store'])->name('billboards.store');

    Route::get('/options', function () {
        return response()->json([
            'clients' => \App\Models\Company::query()->orderBy('name')->get(['id', 'name']),
            'billboards' => Billboard::query()->orderBy('name')->get(['id', 'name']),
            'categories' => BillboardCategory::query()->orderBy('name')->get(['id', 'name']),
        ]);
    })->name('options');
});

Route::get('/{any}', fn (): Factory|View => view('app'))->where('any', '.*');
