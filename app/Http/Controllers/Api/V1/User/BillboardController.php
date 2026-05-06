<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Resources\Api\V1\BillboardResource;
use App\Models\Billboard;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class BillboardController
{
    /**
     * Display a listing of active billboards.
     */
    public function index(Request $request): JsonResponse
    {
        $lat = $request->query('lat');
        $lng = $request->query('lng');
        $radius = (int) $request->query('radius', 10); // KM
        $keyword = $request->query('q');

        $query = Billboard::query()
            ->with(['activePricing'])
            ->select('*')
            ->addSelect(DB::raw('ST_X(location::geometry) as longitude'))
            ->addSelect(DB::raw('ST_Y(location::geometry) as latitude'))
            ->where('is_active', true);

        // Radius Search (PostGIS)
        if ($lat && $lng) {
            $query->whereRaw('ST_DWithin(location, ST_MakePoint(?, ?)::geography, ?)', [
                (float) $lng,
                (float) $lat,
                $radius * 1000, // Convert KM to Meters
            ]);
        }

        // Keyword Search
        if ($keyword) {
            $query->where(function (Builder $q) use ($keyword) {
                $q->where('name', 'ilike', "%{$keyword}%")
                    ->orWhere('address', 'ilike', "%{$keyword}%")
                    ->orWhere('district', 'ilike', "%{$keyword}%");
            });
        }

        $billboards = $query->latest()->paginate(15);

        return response()->json([
            'message' => 'Billboards retrieved successfully',
            'data' => BillboardResource::collection($billboards)->response()->getData(true),
        ]);
    }

    /**
     * Display the specified billboard.
     */
    public function show(string $id): JsonResponse
    {
        $billboard = Billboard::query()
            ->with(['activePricing'])
            ->select('*')
            ->addSelect(DB::raw('ST_X(location::geometry) as longitude'))
            ->addSelect(DB::raw('ST_Y(location::geometry) as latitude'))
            ->where('id', $id)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'message' => 'Billboard detail retrieved successfully',
            'data' => new BillboardResource($billboard),
        ]);
    }
}
