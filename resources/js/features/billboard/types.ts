// ─── Types ─────────────────────────────────────────────────────────────────

export interface Billboard {
    id: string | number;
    name: string;
    lat: number;
    lng: number;
    price: string;
    size: string;
    address: string;
    photo_url?: string | null;
    markerVariant?: number;
}

export interface BillboardFormData {
    name: string;
    lat: string;
    lng: string;
    price: string;
    size: string;
    address: string;
}

export interface SizePackage {
    size: string;
    price: string;
}

export interface FormErrors {
    [key: string]: string;
}

export interface SubmitStatus {
    type: "success" | "error";
    message: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

export const DEFAULT_LAMONGAN_CENTER: [number, number] = [-7.1168, 112.4178];

export const BILLBOARD_PACKAGES: SizePackage[] = [
    { size: "2x4", price: "10 Juta/6 bulan" },
    { size: "3x4", price: "35 Juta/6 bulan" },
    { size: "4x8", price: "75 Juta/6 bulan" },
    { size: "5x10", price: "225 Juta/6 bulan" },
    { size: "8x16", price: "250 Juta/6 bulan" },
    { size: "10x20", price: "500 Juta/6 bulan" },
];

export const DEFAULT_BILLBOARDS: Billboard[] = [
    {
        id: 1,
        name: "Billboard Pusat Kota Lamongan",
        lat: -6.8944,
        lng: 112.2147,
        price: "75 Juta/6 bulan",
        size: "4x8",
        address: "Jalan Ahmad Yani, Lamongan",
        markerVariant: 0,
    },
    {
        id: 2,
        name: "Billboard Jalan Raya Surabaya",
        lat: -6.89,
        lng: 112.22,
        price: "35 Juta/6 bulan",
        size: "3x4",
        address: "Jalan Raya Surabaya, Lamongan",
        markerVariant: 1,
    },
    {
        id: 3,
        name: "Billboard Palang Utama",
        lat: -6.9393,
        lng: 112.2171,
        price: "250 Juta/6 bulan",
        size: "8x16",
        address: "Jalan Raya Palang Utara, Lamongan",
        markerVariant: 2,
    },
    {
        id: 4,
        name: "Billboard Alun-Alun",
        lat: -6.8921,
        lng: 112.2287,
        price: "225 Juta/6 bulan",
        size: "5x10",
        address: "Area Alun-Alun Lamongan",
        markerVariant: 3,
    },
    {
        id: 5,
        name: "Billboard Gerbang Kota",
        lat: -6.9012,
        lng: 112.2063,
        price: "500 Juta/6 bulan",
        size: "10x20",
        address: "Gerbang Masuk Kota Lamongan",
        markerVariant: 4,
    },
];
