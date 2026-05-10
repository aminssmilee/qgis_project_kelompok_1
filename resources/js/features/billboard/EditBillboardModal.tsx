import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { toast } from "sonner";
import { Edit, Image as ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormModal from "@/components/shared/FormModal";
import {
    Billboard,
    BillboardFormData,
    FormErrors,
    BILLBOARD_PACKAGES,
    DEFAULT_LAMONGAN_CENTER,
} from "./types";
import { locationMarkerIcon } from "./leaflet-icons";
import { updateBillboard, uploadBillboardPhoto } from "./billboard-api";

const EMPTY_FORM: BillboardFormData = {
    name: "",
    lat: "",
    lng: "",
    price: "",
    size: "",
    address: "",
};

interface EditBillboardModalProps {
    billboard: Billboard;
    onUpdate: (billboard: Billboard) => void;
    onClose: () => void;
}

export default function EditBillboardModal({
    billboard,
    onUpdate,
    onClose,
}: EditBillboardModalProps) {
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

    const [formData, setFormData] = useState<BillboardFormData>({
        name: billboard.name,
        lat: billboard.lat.toString(),
        lng: billboard.lng.toString(),
        price: billboard.price,
        size: billboard.size,
        address: billboard.address,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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

                L.tileLayer(
                    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    {
                        attribution:
                            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                        maxZoom: 19,
                    },
                ).addTo(modalMap);

                // Pulihkan marker jika lokasi sudah dipilih sebelumnya
                if (formData.lat && formData.lng) {
                    const lat = parseFloat(formData.lat);
                    const lng = parseFloat(formData.lng);
                    const marker = L.marker([lat, lng], {
                        icon: locationMarkerIcon,
                    }).addTo(modalMap);
                    marker
                        .bindPopup(
                            `📍 Lokasi Terpilih<br/>Lat: ${lat.toFixed(4)}<br/>Lng: ${lng.toFixed(4)}`,
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
                            `📍 Lokasi Terpilih<br/>Lat: ${e.latlng.lat.toFixed(4)}<br/>Lng: ${e.latlng.lng.toFixed(4)}`,
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
        if (!formData.name.trim())
            newErrors.name = "Nama billboard wajib diisi";
        if (!formData.address.trim()) newErrors.address = "Alamat wajib diisi";
        if (!formData.size.trim()) newErrors.size = "Ukuran wajib diisi";
        if (!formData.lat)
            newErrors.lat = "Pilih lokasi di map terlebih dahulu";
        if (!formData.lng)
            newErrors.lng = "Pilih lokasi di map terlebih dahulu";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ukuran file maksimal 5MB");
                return;
            }
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
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
            // Note: API requires id as string, billboard.id from API might be UUID but typed as number in frontend
            const updated = await updateBillboard(billboard.id.toString(), {
                name: formData.name,
                lat: parseFloat(formData.lat),
                lng: parseFloat(formData.lng),
                address: formData.address,
                size: formData.size || undefined,
            });

            if (photoFile) {
                try {
                    await uploadBillboardPhoto(
                        billboard.id.toString(),
                        photoFile,
                    );
                } catch (err: unknown) {
                    console.error("Failed to upload photo:", err);
                    toast.error("Data tersimpan, tapi gagal mengunggah foto.");
                }
            }

            const updatedBillboard: Billboard = {
                ...billboard,
                name: updated.name,
                lat: updated.lat,
                lng: updated.lng,
                address: updated.address,
                price: updated.price_label ?? formData.price,
                size: updated.size ?? formData.size,
            };

            onUpdate(updatedBillboard);
            toast.success("Billboard berhasil diperbarui! 🎉");
            onClose();
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Terjadi kesalahan";
            toast.error("Gagal menyimpan billboard", { description: message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormModal title="Edit Billboard" onClose={onClose}>
            <div className="flex flex-col max-h-[70vh] overflow-y-auto pr-1">
                {/* ── Peta Picker ── */}
                {mapClickMode && (
                    <div className="mb-4 space-y-3">
                        <div
                            ref={mapModalRef}
                            className="rounded-lg overflow-hidden border-2 border-blue-300 bg-gray-100 w-full flex-shrink-0"
                            style={{ height: "250px" }}
                        />

                        <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg">
                            <p className="text-sm font-semibold text-blue-900 mb-2">
                                📍 Klik di map untuk set lokasi
                            </p>
                            {formData.lat && formData.lng && (
                                <p className="text-xs text-blue-700 font-semibold mb-3">
                                    ✅ Lokasi:{" "}
                                    {parseFloat(formData.lat).toFixed(4)},{" "}
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
                                    const el =
                                        e.currentTarget as HTMLDivElement;
                                    const rect = el.getBoundingClientRect();
                                    const x =
                                        (e as unknown as MouseEvent).clientX -
                                        rect.left;
                                    const y =
                                        (e as unknown as MouseEvent).clientY -
                                        rect.top;
                                    const lat =
                                        -6.85 +
                                        (y / rect.height) * (-6.95 - -6.85);
                                    const lng =
                                        112.18 +
                                        (x / rect.width) * (112.25 - 112.18);
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
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                errors.name
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-blue-500"
                            }`}
                            placeholder="Misal: Billboard Pusat Kota"
                        />
                        {errors.name && (
                            <p className="text-xs text-red-600 mt-1">
                                {errors.name}
                            </p>
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
                                setFormData({
                                    ...formData,
                                    address: e.target.value,
                                })
                            }
                            className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                errors.address
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-blue-500"
                            }`}
                            placeholder="Jalan Ahmad Yani, Lamongan"
                        />
                        {errors.address && (
                            <p className="text-xs text-red-600 mt-1">
                                {errors.address}
                            </p>
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
                                        (p) => p.size === e.target.value,
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
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.size}
                                </p>
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

                    {/* Foto Billboard */}
                    <div className="space-y-4 pt-2 border-t">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-blue-600" />
                            Foto Billboard Baru
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                {photoPreview && (
                                    <div className="relative w-24 h-24 rounded overflow-hidden border">
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <label
                                        htmlFor="photo-upload"
                                        className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-6 h-6 mb-2 text-gray-500" />
                                            <p className="text-xs text-gray-500 text-center px-2">
                                                Klik untuk upload foto <br />{" "}
                                                (PNG, JPG, WEBP)
                                            </p>
                                        </div>
                                        <input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/png, image/jpeg, image/webp"
                                            className="hidden"
                                            onChange={handlePhotoChange}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex gap-2 pt-4 border-t mt-auto sticky bottom-0 bg-white pb-2">
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
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                            disabled={
                                isSubmitting || !formData.lat || !formData.lng
                            }
                        >
                            {isSubmitting ? (
                                "Menyimpan..."
                            ) : (
                                <>
                                    <Edit className="h-4 w-4" />
                                    Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </FormModal>
    );
}
