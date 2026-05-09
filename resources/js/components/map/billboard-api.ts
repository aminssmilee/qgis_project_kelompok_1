/**
 * Base URL API — sesuai dengan konfigurasi Laravel
 */
const API_BASE = '/api/v1/admin/billboards';

/** Ambil token Sanctum yang disimpan setelah admin login */
function getAuthToken(): string {
    return localStorage.getItem('admin_token') ?? '';
}

function authHeaders(): Record<string, string> {
    return {
        Accept: 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
    };
}

export interface ApiBillboard {
    id: string;
    name: string;
    lat: number;
    lng: number;
    address: string;
    city: string;
    district: string | null;
    category: string | null;
    category_id?: string;
    code?: string;
    size?: string | null;
    price_label?: string | null;
    price_per_month?: number | null;
    is_active: boolean;
    is_featured: boolean;
    is_illuminated: boolean;
    traffic_density: string;
    facing_direction: string | null;
    created_at: string;
}

export async function fetchBillboards(): Promise<ApiBillboard[]> {
    const res = await fetch(API_BASE, {
        headers: authHeaders(),
    });

    if (!res.ok) {
        throw new Error(`Gagal memuat billboard: ${res.status}`);
    }

    const json = await res.json();
    return json.data as ApiBillboard[];
}

export async function createBillboard(
    payload: Omit<ApiBillboard, 'id' | 'category' | 'created_at'> & {
        size?: string;
        price_label?: string;
        price_per_month?: number;
    }
): Promise<ApiBillboard> {
    const token = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? '';

    const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
            'X-CSRF-TOKEN': token,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message ?? `Gagal menyimpan billboard: ${res.status}`);
    }

    const json = await res.json();
    return json.data as ApiBillboard;
}

export async function updateBillboard(
    id: string,
    payload: UpdateBillboardData
): Promise<ApiBillboard> {
    const token = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? '';

    const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
            'X-CSRF-TOKEN': token,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message ?? `Gagal memperbarui billboard: ${res.status}`);
    }

    const json = await res.json();
    return json.data as ApiBillboard;
}

export async function deleteBillboard(id: string): Promise<void> {
    const token = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? '';

    const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: {
            ...authHeaders(),
            'X-CSRF-TOKEN': token,
        },
    });

    if (!res.ok) {
        throw new Error(`Gagal menghapus billboard: ${res.status}`);
    }
}
