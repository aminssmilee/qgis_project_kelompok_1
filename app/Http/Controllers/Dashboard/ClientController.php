<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Requests\Dashboard\StoreClientRequest;
use App\Http\Requests\Dashboard\UpdateClientRequest;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\View\View;

final class ClientController extends BaseController
{
    public function index(): View
    {
        $clients = Company::query()->latest()->get();

        return view('dashboard.clients.index', [
            'clients' => $clients,
            'totalClients' => $clients->count(),
            'activeClients' => $clients->where('status', 'Active')->count(),
            'inactiveClients' => $clients->where('status', 'Inactive')->count(),
        ]);
    }

    public function store(StoreClientRequest $request): JsonResponse|RedirectResponse
    {
        $client = Company::query()->create($request->validated());

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Klien berhasil ditambahkan.',
                'data' => $client,
            ], 201);
        }

        return to_route('dashboard.clients.index')
            ->with('success', 'Klien berhasil ditambahkan.');
    }

    public function update(UpdateClientRequest $request, Company $client): RedirectResponse
    {
        $client->update($request->validated());

        return to_route('dashboard.clients.index')
            ->with('success', 'Data klien berhasil diperbarui.');
    }

    public function destroy(Company $client): RedirectResponse
    {
        $client->delete();

        return to_route('dashboard.clients.index')
            ->with('success', 'Klien berhasil dihapus.');
    }
}
