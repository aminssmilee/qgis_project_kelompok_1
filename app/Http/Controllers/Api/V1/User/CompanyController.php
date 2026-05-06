<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Requests\Api\V1\User\Company\UpdateCompanyRequest;
use App\Http\Resources\Api\V1\CompanyResource;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CompanyController
{
    /**
     * Display the user's company details.
     */
    public function show(string $id, Request $request): JsonResponse
    {
        // Ensure user belongs to the company or has access
        $company = Company::query()->findOrFail($id);

        if ($request->user()->company_id !== $id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'message' => 'Company detail retrieved successfully',
            'data' => new CompanyResource($company),
        ]);
    }

    /**
     * Update company details.
     */
    public function update(string $id, UpdateCompanyRequest $request): JsonResponse
    {
        $company = Company::query()->findOrFail($id);

        if ($request->user()->company_id !== $id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $company->update($request->validated());

        return response()->json([
            'message' => 'Company updated successfully',
            'data' => new CompanyResource($company->fresh()),
        ]);
    }
}
