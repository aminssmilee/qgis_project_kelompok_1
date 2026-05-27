<?php

declare(strict_types=1);

use App\Http\Controllers\Dashboard\BillboardController;
use App\Http\Controllers\Dashboard\ClientController;
use App\Http\Controllers\Dashboard\RentalController;
use App\Models\Billboard;
use App\Models\BillboardCategory;
use App\Models\Company;
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

    Route::get('/options', fn () => response()->json([
        'clients' => Company::query()->orderBy('name')->get(['id', 'name']),
        'billboards' => Billboard::query()->orderBy('name')->get(['id', 'name']),
        'categories' => BillboardCategory::query()->orderBy('name')->get(['id', 'name']),
    ]))->name('options');
});

Route::get('/payment/return', fn (): string => "
    <html>
    <head>
        <title>Payment Return</title>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f3f4f6; }
            .card { background: white; padding: 2.5rem 2rem; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); text-align: center; max-width: 420px; width: 90%; }
            .icon { font-size: 4rem; color: #10b981; margin-bottom: 1rem; }
            h1 { color: #1f2937; font-size: 1.5rem; margin-bottom: 0.75rem; font-weight: 700; }
            p { color: #4b5563; line-height: 1.6; margin-bottom: 2rem; font-size: 0.95rem; }
            .btn { background: #2563eb; color: white; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; transition: background 0.2s; }
            .btn:hover { background: #1d4ed8; }
        </style>
    </head>
    <body>
        <div class='card'>
            <div class='icon'>✓</div>
            <h1>Pembayaran Diproses</h1>
            <p>Terima kasih! Transaksi Anda sedang diproses oleh TriPay. Silakan kembali ke aplikasi mobile untuk melihat status pemesanan terbaru Anda.</p>
            <a href='javascript:void(0)' onclick='window.close();' class='btn'>Tutup Halaman</a>
        </div>
    </body>
    </html>");

Route::get('/{any}', fn (): Factory|View => view('app'))->where('any', '.*');
