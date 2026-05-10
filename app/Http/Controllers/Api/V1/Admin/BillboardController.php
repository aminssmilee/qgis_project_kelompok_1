<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Billboard;
use App\Models\BillboardCategory;
use App\Models\BillboardPhoto;
use App\Models\BillboardPricing;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

final class BillboardController
{
    /**
     * Return all billboards with lat/lng extracted from PostGIS geometry.
     */
    public function index(): JsonResponse
    {
        $billboards = Billboard::query()
            ->with(['category', 'activePricing', 'photos'])
            ->select('*')
            ->addSelect(DB::raw('ST_X(location::geometry) as lng'))
            ->addSelect(DB::raw('ST_Y(location::geometry) as lat'))
            ->latest()
            ->get()
            ->map(fn (Billboard $b): array => $this->format($b));

        return response()->json([
            'message' => 'Billboards retrieved',
            'data' => $billboards,
        ]);
    }

    /**
     * Store a new billboard, saving coordinates as PostGIS Point.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'code' => ['nullable', 'string', 'max:30', 'unique:billboards,code'],
            'category_id' => ['nullable', 'uuid', 'exists:billboard_categories,id'],
            'description' => ['nullable', 'string'],
            'address' => ['required', 'string'],
            'district' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            'facing_direction' => ['nullable', 'string', 'max:10'],
            'traffic_density' => ['nullable', Rule::in(['low', 'medium', 'high'])],
            'is_illuminated' => ['boolean'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            // Ukuran & harga — disimpan ke billboard_pricing
            'size' => ['nullable', 'string', 'max:20'],
            'price_label' => ['nullable', 'string', 'max:100'],
            'price_per_month' => ['nullable', 'numeric', 'min:0'],
        ]);

        // Auto-generate code unik jika tidak dikirim dari frontend
        if (empty($data['code'])) {
            $data['code'] = 'BBD-'.mb_strtoupper(Str::random(6));
        }

        // Gunakan kategori pertama sebagai default jika tidak dipilih
        if (empty($data['category_id'])) {
            $data['category_id'] = BillboardCategory::query()->value('id');
        }

        // Extrakt lat/lng untuk PostGIS, lalu hapus dari $data agar tidak di-insert sebagai kolom
        $lat = (float) $data['lat'];
        $lng = (float) $data['lng'];
        $size = $data['size'] ?? null;
        $priceLabel = $data['price_label'] ?? null;
        $priceMonth = isset($data['price_per_month']) ? (float) $data['price_per_month'] : 0;
        unset($data['lat'], $data['lng'], $data['size'], $data['price_label'], $data['price_per_month']);

        // Simpan ukuran di description jika belum ada description
        if ($size && empty($data['description'])) {
            $data['description'] = "Ukuran: {$size}".($priceLabel ? " | Harga: {$priceLabel}" : '');
        }

        $billboard = Billboard::query()->create([
            ...$data,
            'location' => DB::raw(
                "ST_SetSRID(ST_MakePoint({$lng}, {$lat}), 4326)::geography"
            ),
        ]);

        // Buat record pricing jika ada harga
        if ($priceMonth > 0 || $size) {
            BillboardPricing::query()->create([
                'billboard_id' => $billboard->id,
                'price_per_month' => $priceMonth,
                'price_per_day' => round($priceMonth / 30, 2),
                'price_per_week' => round($priceMonth / 4, 2),
                'price_per_year' => round($priceMonth * 12, 2),
                'is_active' => true,
            ]);
        }

        return response()->json([
            'message' => 'Billboard berhasil ditambahkan',
            'data' => $this->format(
                Billboard::query()
                    ->with(['category', 'activePricing', 'photos'])
                    ->select('*')
                    ->addSelect(DB::raw('ST_X(location::geometry) as lng'))
                    ->addSelect(DB::raw('ST_Y(location::geometry) as lat'))
                    ->findOrFail($billboard->id)
            ),
        ], 201);
    }

    /**
     * Display the specified billboard.
     */
    public function show(string $id): JsonResponse
    {
        $billboard = Billboard::query()
            ->with(['category', 'activePricing', 'photos'])
            ->select('*')
            ->addSelect(DB::raw('ST_X(location::geometry) as lng'))
            ->addSelect(DB::raw('ST_Y(location::geometry) as lat'))
            ->findOrFail($id);

        return response()->json([
            'message' => 'Billboard detail',
            'data' => $this->format($billboard),
        ]);
    }

    /**
     * Update the specified billboard.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $billboard = Billboard::query()->findOrFail($id);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:150'],
            'code' => ['sometimes', 'string', 'max:30', Rule::unique('billboards', 'code')->ignore($id)],
            'category_id' => ['sometimes', 'uuid', 'exists:billboard_categories,id'],
            'description' => ['nullable', 'string'],
            'address' => ['sometimes', 'string'],
            'district' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'lat' => ['sometimes', 'numeric', 'between:-90,90'],
            'lng' => ['sometimes', 'numeric', 'between:-180,180'],
            'facing_direction' => ['nullable', 'string', 'max:10'],
            'traffic_density' => ['nullable', Rule::in(['low', 'medium', 'high'])],
            'is_illuminated' => ['boolean'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
        ]);

        if (isset($data['lat'], $data['lng'])) {
            $lat = (float) $data['lat'];
            $lng = (float) $data['lng'];
            unset($data['lat'], $data['lng']);

            $data['location'] = DB::raw(
                "ST_SetSRID(ST_MakePoint({$lng}, {$lat}), 4326)::geography"
            );
        } else {
            unset($data['lat'], $data['lng']);
        }

        $billboard->update($data);

        return response()->json([
            'message' => 'Billboard berhasil diperbarui',
            'data' => $this->format(
                Billboard::query()
                    ->with(['category', 'activePricing', 'photos'])
                    ->select('*')
                    ->addSelect(DB::raw('ST_X(location::geometry) as lng'))
                    ->addSelect(DB::raw('ST_Y(location::geometry) as lat'))
                    ->findOrFail($billboard->id)
            ),
        ]);
    }

    /**
     * Remove the specified billboard.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $billboard = Billboard::query()->findOrFail($id);

            DB::transaction(function () use ($billboard): void {
                // Hapus harga terkait agar tidak terjadi foreign key constraint error
                $billboard->pricings()->delete();
                $billboard->delete();
            });

            return response()->json(['message' => 'Billboard berhasil dihapus']);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Billboard tidak ditemukan'], 404);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus billboard. Pastikan tidak ada data yang masih terhubung.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Upload photo for a billboard.
     */
    public function uploadPhoto(Request $request, string $id): JsonResponse
    {
        $billboard = Billboard::query()->findOrFail($id);

        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'], // max 5MB
        ]);

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $path = $file->store('billboards', 'public');

            // Generate full URL
            $url = url('storage/'.$path);

            $photo = BillboardPhoto::query()->create([
                'billboard_id' => $billboard->id,
                'photo_url' => $url,
                'is_primary' => $billboard->photos()->count() === 0, // Set as primary if it's the first photo
                'sort_order' => $billboard->photos()->count() + 1,
            ]);

            return response()->json([
                'message' => 'Foto berhasil diunggah',
                'data' => $photo,
            ], 201);
        }

        return response()->json(['message' => 'Gagal mengunggah foto'], 400);
    }

    /**
     * Format a billboard model with lat/lng from PostGIS geometry.
     */
    private function format(Billboard $billboard): array
    {
        $pricing = $billboard->activePricing;
        $primaryPhoto = $billboard->photos->firstWhere('is_primary', true) ?? $billboard->photos->first();

        // Ambil ukuran dari description jika tersimpan di sana
        $size = null;
        $price = null;
        if ($billboard->description && str_starts_with($billboard->description, 'Ukuran:')) {
            preg_match('/Ukuran: ([^|]+)/', $billboard->description, $sizeMatch);
            preg_match('/Harga: (.+)/', $billboard->description, $priceMatch);
            $size = isset($sizeMatch[1]) ? mb_trim($sizeMatch[1]) : null;
            $price = isset($priceMatch[1]) ? mb_trim($priceMatch[1]) : null;
        }

        return [
            'id' => $billboard->id,
            'name' => $billboard->name,
            'code' => $billboard->code,
            'category_id' => $billboard->category_id,
            'category' => $billboard->category?->name,
            'description' => $billboard->description,
            'size' => $size,
            'price_label' => $price ?? ($pricing ? 'Rp '.number_format((float) $pricing->price_per_month, 0, ',', '.').'/bulan' : null),
            'price_per_month' => $pricing ? (float) $pricing->price_per_month : null,
            'address' => $billboard->address,
            'district' => $billboard->district,
            'city' => $billboard->city,
            'lat' => $billboard->lat !== null ? (float) $billboard->lat : null,
            'lng' => $billboard->lng !== null ? (float) $billboard->lng : null,
            'facing_direction' => $billboard->facing_direction,
            'traffic_density' => $billboard->traffic_density,
            'is_illuminated' => $billboard->is_illuminated,
            'is_active' => $billboard->is_active,
            'is_featured' => $billboard->is_featured,
            'photo_url' => $primaryPhoto ? $primaryPhoto->photo_url : null,
            'created_at' => $billboard->created_at,
        ];
    }
}
