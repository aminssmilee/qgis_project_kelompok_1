import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Billboard,
    BillboardFormData,
    FormErrors,
    BILLBOARD_PACKAGES,
    DEFAULT_LAMONGAN_CENTER,
} from "./types";
import { locationMarkerIcon } from "./leaflet-icons";
import { createBillboard } from "./billboard-api";

const EMPTY_FORM: BillboardFormData = {
    name: "",
    lat: "",
    lng: "",
    price: "",
    size: "",
    address: "",
};

interface AddBillboardModalProps {
    billboards: Billboard[];
    onAdd: (billboard: Billboard) => void;
    onClose: () => void;
}

export default function AddBillboardModal({
    billboards,
    onAdd,
    onClose,
}: AddBillboardModalProps) {
    const mapModalRef = useRef<HTMLDivElement>(null);
    const mapModalInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const [mapClickMode, setMapClickMode] = useState(false);
    const [dummyMapMode, setDummyMapMode] = useState(false);
    const [dummyMarker, setDummyMarker] = useState<{
        x: number;
        y: number;
        lat: number;
        lng: number;
    } | null>(null);

    const [formData, setFormData] = useState<BillboardFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Inisialisasi peta picker dalam modal
    useEffect(() => {
        if (!mapClickMode || !mapModalRef.current) return;

        try {
            if (mapModalInstanceRef.current) {
                mapModalInstanceRef.current.remove();
                mapModalInstanceRef.current = null;
            }
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }

            const timeout = setTimeout(() => {
                if (!mapModalRef.current) return;

                const mapCenter: [number, number] =
                    formData.lat && formData.lng
                        ? [parseFloat(formData.lat), parseFloat(formData.lng)]
                        : DEFAULT_LAMONGAN_CENTER;

                const modalMap = L.map(mapModalRef.current, {
                    center: mapCenter,
                    zoom: 12,
                    zoomControl: true,
                });

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 19,
                }).addTo(modalMap);

                // Pulihkan marker jika lokasi sudah dipilih sebelumnya
                if (formData.lat && formData.lng) {
                    const lat = parseFloat(formData.lat);
                    const lng = parseFloat(formData.lng);
                    const marker = L.marker([lat, lng], {
                        icon: locationMarkerIcon,
                    }).addTo(modalMap);
                    marker
                        .bindPopup(
                            `📍 Lokasi Terpilih<br/>Lat: ${lat.toFixed(4)}<br/>Lng: ${lng.toFixed(4)}`
                        )
                        .openPopup();
                    markerRef.current = marker;
                }

                // Klik peta untuk set koordinat
                modalMap.on("click", (e: L.LeafletMouseEvent) => {
                    if (markerRef.current) {
                        markerRef.current.remove();
                        markerRef.current = null;
                    }

                    setFormData((prev) => ({
                        ...prev,
                        lat: e.latlng.lat.toString(),
                        lng: e.latlng.lng.toString(),
                    }));

                    const newMarker = L.marker([e.latlng.lat, e.latlng.lng], {
                        icon: locationMarkerIcon,
                    }).addTo(modalMap);
                    newMarker
                        .bindPopup(
                            `📍 Lokasi Terpilih<br/>Lat: ${e.latlng.lat.toFixed(4)}<br/>Lng: ${e.latlng.lng.toFixed(4)}`
                        )
                        .openPopup();
                    modalMap.panTo(newMarker.getLatLng());
                    markerRef.current = newMarker;
                });

                mapModalInstanceRef.current = modalMap;
            }, 100);

            return () => {
                clearTimeout(timeout);
                if (mapModalInstanceRef.current) {
                    mapModalInstanceRef.current.remove();
                    mapModalInstanceRef.current = null;
                }
            };
        } catch (error) {
            console.error("Error initializing modal map:", error);
        }
    }, [mapClickMode]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = "Nama billboard wajib diisi";
        if (!formData.address.trim()) newErrors.address = "Alamat wajib diisi";
        if (!formData.size.trim()) newErrors.size = "Ukuran wajib diisi";
        if (!formData.lat) newErrors.lat = "Pilih lokasi di map terlebih dahulu";
        if (!formData.lng) newErrors.lng = "Pilih lokasi di map terlebih dahulu";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) {
            toast.error("Form tidak lengkap", {
                description: "Mohon isi semua field yang wajib diisi.",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const created = await createBillboard({
                name: formData.name,
                lat: parseFloat(formData.lat),
                lng: parseFloat(formData.lng),
                address: formData.address,
                city: "Lamongan",
                district: null,
                is_active: true,
                is_featured: false,
                is_illuminated: false,
                traffic_density: "medium",
                facing_direction: null,
                size: formData.size || undefined,
                price_label: formData.price || undefined,
            });

            // Konversi ke tipe lokal Billboard
            const newBillboard: Billboard = {
                id: Date.now(),
                name: created.name,
                lat: created.lat,
                lng: created.lng,
                address: created.address,
                price: created.price_label ?? formData.price,
                size: created.size ?? formData.size,
                markerVariant: billboards.length % 5,
            };

            onAdd(newBillboard);
            toast.success("Billboard berhasil ditambahkan! 🎉", {
                description: `${created.name} — ${created.address}`,
            });
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan";
            toast.error("Gagal menyimpan billboard", { description: message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-[9998]"
                onClick={onClose}
            />

            {/* Modal container */}
            <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none overflow-y-auto">
                <Card className="w-full max-w-md shadow-2xl pointer-events-auto my-auto flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <CardHeader className="flex flex-row items-center justify-between border-b flex-shrink-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Tambah Billboard Baru
                        </CardTitle>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </CardHeader>

                    {/* Scrollable Body */}
                    <CardContent className="pt-6 overflow-y-auto flex-1 flex flex-col">
                        {/* ── Peta Picker ── */}
                        {mapClickMode && (
                            <div className="mb-4 space-y-3">
                                <div
                                    ref={mapModalRef}
                                    className="rounded-lg overflow-hidden border-2 border-blue-300 bg-gray-100 w-full flex-shrink-0"
                                    style={{ height: "clamp(250px, 40vh, 400px)" }}
                                />

                                <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg">
                                    <p className="text-sm font-semibold text-blue-900 mb-2">
                                        📍 Klik di map untuk set lokasi
                                    </p>
                                    {formData.lat && formData.lng && (
                                        <p className="text-xs text-blue-700 font-semibold mb-3">
                                            ✅ Lokasi: {parseFloat(formData.lat).toFixed(4)},{" "}
                                            {parseFloat(formData.lng).toFixed(4)}
                                        </p>
                                    )}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setMapClickMode(false)}
                                            className="text-xs px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition-all"
                                        >
                                            ✓ Selesai memilih
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDummyMapMode((v) => !v);
                                                setDummyMarker(null);
                                            }}
                                            className="text-xs px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded font-semibold transition-all"
                                        >
                                            Gunakan Dummy Map
                                        </button>
                                    </div>
                                </div>

                                {/* Dummy map fallback */}
                                {dummyMapMode && (
                                    <div
                                        className="mt-2 border rounded bg-gray-100 relative overflow-hidden cursor-crosshair"
                                        style={{ height: "200px" }}
                                        onClick={(e) => {
                                            const el = e.currentTarget as HTMLDivElement;
                                            const rect = el.getBoundingClientRect();
                                            const x =
                                                (e as unknown as MouseEvent).clientX - rect.left;
                                            const y =
                                                (e as unknown as MouseEvent).clientY - rect.top;
                                            const lat =
                                                -6.85 + (y / rect.height) * (-6.95 - -6.85);
                                            const lng =
                                                112.18 + (x / rect.width) * (112.25 - 112.18);
                                            setFormData((prev) => ({
                                                ...prev,
                                                lat: lat.toString(),
                                                lng: lng.toString(),
                                            }));
                                            setDummyMarker({ x, y, lat, lng });
                                        }}
                                    >
                                        {dummyMarker && (
                                            <span
                                                className="absolute text-2xl"
                                                style={{
                                                    left: dummyMarker.x - 12,
                                                    top: dummyMarker.y - 24,
                                                }}
                                            >
                                                📍
                                            </span>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 pointer-events-none">
                                            Klik area ini untuk memilih lokasi (dummy)
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Form ── */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nama */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nama Billboard *
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                        errors.name
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                    placeholder="Misal: Billboard Pusat Kota"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Alamat */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Alamat *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address: e.target.value })
                                    }
                                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                        errors.address
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                    placeholder="Jalan Ahmad Yani, Lamongan"
                                />
                                {errors.address && (
                                    <p className="text-xs text-red-600 mt-1">{errors.address}</p>
                                )}
                            </div>

                            {/* Ukuran + Harga */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Ukuran *
                                    </label>
                                    <select
                                        required
                                        value={formData.size}
                                        onChange={(e) => {
                                            const pkg = BILLBOARD_PACKAGES.find(
                                                (p) => p.size === e.target.value
                                            );
                                            setFormData({
                                                ...formData,
                                                size: e.target.value,
                                                price: pkg?.price ?? "",
                                            });
                                        }}
                                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                            errors.size
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                    >
                                        <option value="">Pilih ukuran...</option>
                                        {BILLBOARD_PACKAGES.map((pkg) => (
                                            <option key={pkg.size} value={pkg.size}>
                                                {pkg.size} — {pkg.price}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.size && (
                                        <p className="text-xs text-red-600 mt-1">{errors.size}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Harga
                                    </label>
                                    <div className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-100 text-gray-600 font-semibold">
                                        {formData.price || "—"}
                                    </div>
                                </div>
                            </div>

                            {/* Pilih Lokasi */}
                            {!mapClickMode && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMapClickMode(true);
                                        setErrors({});
                                    }}
                                    className="w-full py-2 px-3 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-all"
                                >
                                    📍 Pilih Lokasi di Map
                                </button>
                            )}

                            {formData.lat && formData.lng && (
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-xs font-semibold text-green-900">
                                        ✅ Lokasi sudah dipilih
                                    </p>
                                    <p className="text-xs text-green-700 mt-1">
                                        {parseFloat(formData.lat).toFixed(4)},{" "}
                                        {parseFloat(formData.lng).toFixed(4)}
                                    </p>
                                </div>
                            )}

                            {/* Tombol Aksi */}
                            <div className="flex gap-2 pt-4 border-t mt-auto flex-shrink-0 bg-white sticky bottom-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2"
                                    disabled={
                                        isSubmitting ||
                                        !formData.lat ||
                                        !formData.lng
                                    }
                                >
                                    {isSubmitting ? (
                                        "Menyimpan..."
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            Simpan Billboard
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
