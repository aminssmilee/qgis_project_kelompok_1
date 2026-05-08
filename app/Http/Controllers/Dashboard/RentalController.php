<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Requests\Dashboard\StoreRentalRequest;
use App\Http\Requests\Dashboard\UpdateRentalRequest;
use App\Models\Billboard;
use App\Models\Client;
use App\Models\Rental;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Str;
use Illuminate\View\View;

final class RentalController extends BaseController
{
    public function index(): View
    {
        $rentals = Rental::query()
            ->with(['client', 'billboard'])
            ->latest()
            ->get();

        return view('dashboard.rentals.index', [
            'rentals' => $rentals,
            'clients' => Client::query()->orderBy('name')->get(),
            'billboards' => Billboard::query()->orderBy('name')->get(),
            'activeRentals' => $rentals->count(),
            'paidRentals' => $rentals->where('payment_status', 'Paid')->count(),
            'pendingRentals' => $rentals->where('payment_status', 'Pending')->count(),
        ]);
    }

    public function store(StoreRentalRequest $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validated();
        $validated['booking_code'] = $this->generateBookingCode();
        $validated['end_date'] = Carbon::parse($validated['rental_date'])
            ->addDays((int) $validated['duration_days'] - 1)
            ->toDateString();

        $rental = Rental::query()->create($validated);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Penyewaan berhasil ditambahkan.',
                'data' => $rental,
            ], 201);
        }

        return redirect()
            ->route('dashboard.rentals.index')
            ->with('success', 'Penyewaan berhasil ditambahkan.');
    }

    public function update(UpdateRentalRequest $request, Rental $rental): RedirectResponse
    {
        $validated = $request->validated();
        $validated['end_date'] = Carbon::parse($validated['rental_date'])
            ->addDays((int) $validated['duration_days'] - 1)
            ->toDateString();

        $rental->update($validated);

        return redirect()
            ->route('dashboard.rentals.index')
            ->with('success', 'Data penyewaan berhasil diperbarui.');
    }

    public function destroy(Rental $rental): RedirectResponse
    {
        $rental->delete();

        return redirect()
            ->route('dashboard.rentals.index')
            ->with('success', 'Penyewaan berhasil dihapus.');
    }

    private function generateBookingCode(): string
    {
        return sprintf('SEWA-%s-%s', now()->format('Ymd'), mb_strtoupper(Str::random(4)));
    }
}
