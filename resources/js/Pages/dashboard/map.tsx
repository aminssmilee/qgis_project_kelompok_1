import { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Info, Plus, X, Search, AlertCircle, CheckCircle } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Define Billboard type
interface Billboard {
    id: number;
    name: string;
    lat: number;
    lng: number;
    price: string;
    size: string;
    address: string;
    markerVariant?: number;
}

interface FormData {
    name: string;
    lat: string;
    lng: string;
    price: string;
    size: string;
    address: string;
}

// Paket ukuran dan harga
interface SizePackage {
    size: string;
    price: string;
}

const BILLBOARD_PACKAGES: SizePackage[] = [
    { size: "2x4", price: "10 Juta/6 bulan" },
    { size: "3x4", price: "35 Juta/6 bulan" },
    { size: "4x8", price: "75 Juta/6 bulan" },
    { size: "5x10", price: "225 Juta/6 bulan" },
    { size: "8x16", price: "250 Juta/6 bulan" },
    { size: "10x20", price: "500 Juta/6 bulan" },
];

interface Errors {
    [key: string]: string;
}

interface SubmitStatus {
    type: "success" | "error";
    message: string;
}

// Fix untuk icon default leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const locationMarkerIcon = L.icon({
    iconUrl: "/assets/icons/location-marker.png",
    iconSize: [48, 64],
    iconAnchor: [24, 64],
    popupAnchor: [0, -58],
});

const billboardMarkerIcons = [
    L.icon({
        iconUrl: "/assets/icons/location-marker-wrench.png",
        iconSize: [48, 64],
        iconAnchor: [24, 64],
        popupAnchor: [0, -58],
    }),
    L.icon({
        iconUrl: "/assets/icons/location-marker-star.png",
        iconSize: [48, 64],
        iconAnchor: [24, 64],
        popupAnchor: [0, -58],
    }),
    L.icon({
        iconUrl: "/assets/icons/location-marker-tag.png",
        iconSize: [48, 64],
        iconAnchor: [24, 64],
        popupAnchor: [0, -58],
    }),
    L.icon({
        iconUrl: "/assets/icons/location-marker-crown.png",
        iconSize: [48, 64],
        iconAnchor: [24, 64],
        popupAnchor: [0, -58],
    }),
    L.icon({
        iconUrl: "/assets/icons/location-marker-lock.png",
        iconSize: [48, 64],
        iconAnchor: [24, 64],
        popupAnchor: [0, -58],
    }),
];

const defaultBillboards: Billboard[] = [
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

const normalizeBillboards = (items: Billboard[]): Billboard[] =>
    items.map((item, index) => ({
        ...item,
        markerVariant: item.markerVariant ?? index % billboardMarkerIcons.length,
    }));

const getBillboardMarkerIcon = (markerVariant?: number): any => {
    const variantIndex = markerVariant ?? 0;
    return billboardMarkerIcons[variantIndex % billboardMarkerIcons.length];
};

const DEFAULT_LAMONGAN_CENTER: [number, number] = [-7.1168, 112.4178];

export default function MapPage() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const mapModalRef = useRef<HTMLDivElement>(null);
    const mapModalInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [billboards, setBillboards] = useState<Billboard[]>([]);
    const [selectedBillboard, setSelectedBillboard] = useState<Billboard | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [mapClickMode, setMapClickMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        lat: "",
        lng: "",
        price: "",
        size: "",
        address: "",
    });

    const [dummyMapMode, setDummyMapMode] = useState(false);
    const [dummyMarker, setDummyMarker] = useState<{
        x: number;
        y: number;
        lat: number;
        lng: number;
    } | null>(null);

    // Load billboards from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("billboards");
            if (saved) {
                const parsedBillboards = normalizeBillboards(JSON.parse(saved));
                const missingDefaultBillboards = defaultBillboards.filter(
                    (defaultBillboard) =>
                        !parsedBillboards.some((savedBillboard) => savedBillboard.id === defaultBillboard.id)
                );
                const mergedBillboards = [...parsedBillboards, ...missingDefaultBillboards];
                setBillboards(mergedBillboards);
                localStorage.setItem("billboards", JSON.stringify(mergedBillboards));
            } else {
                setBillboards(defaultBillboards);
                localStorage.setItem("billboards", JSON.stringify(defaultBillboards));
            }
        } catch (error) {
            console.error("Error loading billboards:", error);
            setBillboards(defaultBillboards);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update map when billboards change
    useEffect(() => {
        if (!mapRef.current) return;

        try {
            // Clear existing map
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }

            // Initialize map
            const map = L.map(mapRef.current, {
                center: DEFAULT_LAMONGAN_CENTER,
                zoom: 12,
                zoomControl: true,
                attributionControl: true,
            });

            // Add OpenStreetMap tiles
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            // Tambah event listener untuk klik map saat mode pick location
            if (mapClickMode) {
                map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
                    setFormData((prev) => ({
                        ...prev,
                        lat: e.latlng.lat.toString(),
                        lng: e.latlng.lng.toString(),
                    }));
                    L.marker([e.latlng.lat, e.latlng.lng], {
                        icon: locationMarkerIcon,
                    })
                        .addTo(map)
                        .bindPopup(
                            `📍 Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`
                        )
                        .openPopup();
                });
            }

            // Add markers for each billboard if any exist
            if (billboards.length > 0) {
                billboards.forEach((billboard) => {
                    const marker = L.marker([billboard.lat, billboard.lng], {
                        icon: getBillboardMarkerIcon(billboard.markerVariant),
                    }).addTo(map);

                    // Popup content
                    const popupContent = `
                        <div class="p-3 bg-white rounded-lg shadow-lg">
                            <h3 class="font-bold text-sm text-gray-900">${billboard.name}</h3>
                            <p class="text-xs text-gray-600 mt-1">${billboard.address}</p>
                            <div class="mt-2 text-xs space-y-1">
                                <p><strong>Ukuran:</strong> ${billboard.size}</p>
                                <p class="font-semibold text-blue-600">${billboard.price}</p>
                            </div>
                        </div>
                    `;

                    marker.bindPopup(popupContent, { maxWidth: 250 });

                    // Click marker to select
                    marker.on("click", () => {
                        setSelectedBillboard(billboard);
                        marker.openPopup();
                    });
                });
            }

            mapInstanceRef.current = map;
        } catch (error) {
            console.error("Error initializing map:", error);
        }
    }, [billboards, mapClickMode]);

    // Initialize modal map for location picking
    useEffect(() => {
        if (!mapClickMode || !showModal || !mapModalRef.current) return;

        try {
            // Clear existing modal map
            if (mapModalInstanceRef.current) {
                mapModalInstanceRef.current.remove();
                mapModalInstanceRef.current = null;
            }
            
            // Clear existing marker ref
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }

            // Small delay to ensure DOM is ready
            const timeout = setTimeout(() => {
                if (!mapModalRef.current) return;

                // Determine initial map center
                const defaultCenter: [number, number] = DEFAULT_LAMONGAN_CENTER;
                const mapCenter: [number, number] = formData.lat && formData.lng 
                    ? [parseFloat(formData.lat), parseFloat(formData.lng)]
                    : defaultCenter;

                // Initialize modal map with selected location as center
                const modalMap = L.map(mapModalRef.current, {
                    center: mapCenter,
                    zoom: 12,
                    zoomControl: true,
                });

                // Add OpenStreetMap tiles
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 19,
                }).addTo(modalMap);

                // Restore marker from formData if location already selected
                if (formData.lat && formData.lng) {
                    const lat = parseFloat(formData.lat);
                    const lng = parseFloat(formData.lng);
                    
                    const marker = L.marker([lat, lng], {
                        icon: locationMarkerIcon,
                    }).addTo(modalMap);

                    marker.bindPopup(
                        `📍 Lokasi Terpilih<br/>Lat: ${lat.toFixed(4)}<br/>Lng: ${lng.toFixed(4)}`
                    ).openPopup();

                    markerRef.current = marker;
                }

                // Click handler to select location
                modalMap.on("click", (e: { latlng: { lat: number; lng: number } }) => {
                    // Remove old marker if exists
                    if (markerRef.current) {
                        markerRef.current.remove();
                        markerRef.current = null;
                    }

                    // Update form data
                    setFormData((prev) => ({
                        ...prev,
                        lat: e.latlng.lat.toString(),
                        lng: e.latlng.lng.toString(),
                    }));

                    // Add new marker at clicked location
                    const newMarker = L.marker([e.latlng.lat, e.latlng.lng], {
                        icon: locationMarkerIcon,
                    }).addTo(modalMap);

                    newMarker.bindPopup(
                        `📍 Lokasi Terpilih<br/>Lat: ${e.latlng.lat.toFixed(4)}<br/>Lng: ${e.latlng.lng.toFixed(4)}`
                    ).openPopup();

                    // Pan map to marker
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
    }, [mapClickMode, showModal]);

    const validateForm = (): boolean => {
        const newErrors: Errors = {};

        if (!formData.name.trim()) newErrors.name = "Nama billboard wajib diisi";
        if (!formData.address.trim()) newErrors.address = "Alamat wajib diisi";
        if (!formData.size.trim()) newErrors.size = "Ukuran wajib diisi";
        if (!formData.lat) newErrors.lat = "Pilih lokasi di map terlebih dahulu";
        if (!formData.lng) newErrors.lng = "Pilih lokasi di map terlebih dahulu";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddBillboard = (e: React.FormEvent): void => {
        e.preventDefault();
        setErrors({});
        setSubmitStatus(null);

        if (!validateForm()) {
            setSubmitStatus({ type: "error", message: "Mohon periksa kembali data Anda" });
            return;
        }

        const newBillboard: Billboard = {
            id: Math.max(...billboards.map((b) => b.id), 0) + 1,
            name: formData.name,
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng),
            price: formData.price,
            size: formData.size,
            address: formData.address,
            markerVariant: billboards.length % billboardMarkerIcons.length,
        };

        const updated = [...billboards, newBillboard];
        setBillboards(updated);
        localStorage.setItem("billboards", JSON.stringify(updated));
        setSelectedBillboard(newBillboard);
        setSubmitStatus({ type: "success", message: "Billboard berhasil ditambahkan! 🎉" });

        setTimeout(() => {
            setShowModal(false);
            setMapClickMode(false);
            setFormData({
                name: "",
                lat: "",
                lng: "",
                price: "",
                size: "",
                address: "",
            });
            setSubmitStatus(null);
        }, 1500);
    };

    const handleDeleteBillboard = (id: number): void => {
        const updated = billboards.filter((bb) => bb.id !== id);
        setBillboards(updated);
        localStorage.setItem("billboards", JSON.stringify(updated));
        setSelectedBillboard(null);
    };

    const filteredBillboards = billboards.filter(
        (bb) =>
            bb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bb.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout title="Peta Billboard">
            {isLoading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-blue-500 animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat data...</p>
                    </div>
                </div>
            ) : billboards.length === 0 ? (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">Belum ada billboard</p>
                        <Button onClick={() => setShowModal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Billboard Pertama
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Map Section */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Peta Lokasi Billboard (GIS)
                            </CardTitle>
                            <Button
                                onClick={() => setShowModal(true)}
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Billboard
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div
                                ref={mapRef}
                                className="rounded-lg overflow-hidden border-2 border-gray-200"
                                style={{ height: "600px", width: "100%" }}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Billboard Details Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    {selectedBillboard ? (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Detail Billboard
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {selectedBillboard.name}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {selectedBillboard.address}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">
                                                Ukuran
                                            </p>
                                            <p className="font-semibold">
                                                {selectedBillboard.size}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">
                                                Harga Dasar
                                            </p>
                                            <p className="font-semibold text-blue-600">
                                                {selectedBillboard.price}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">
                                                Koordinat
                                            </p>
                                            <p className="text-xs font-mono text-gray-600">
                                                {selectedBillboard.lat.toFixed(4)},
                                                {selectedBillboard.lng.toFixed(4)}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() =>
                                            handleDeleteBillboard(selectedBillboard.id)
                                        }
                                        variant="destructive"
                                        size="sm"
                                        className="w-full"
                                    >
                                        Hapus Billboard
                                    </Button>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <Info className="h-10 w-10 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500 text-center">
                                    Klik marker pada peta untuk melihat detail
                                    billboard
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Billboard List with Search */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center justify-between">
                                <span>
                                    Daftar Billboard ({filteredBillboards.length}/
                                    {billboards.length})
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau alamat..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {filteredBillboards.length > 0 ? (
                                    filteredBillboards.map((bb) => (
                                        <button
                                            key={bb.id}
                                            onClick={() => setSelectedBillboard(bb)}
                                            className={`w-full text-left p-3 rounded-lg transition-all border ${
                                                selectedBillboard?.id === bb.id
                                                    ? "bg-blue-50 border-blue-500 shadow-md"
                                                    : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {bb.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {bb.address}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2 bg-blue-100 text-blue-700`}
                                                >
                                                    {bb.size}
                                                </span>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-500 text-center py-4">
                                        {billboards.length === 0
                                            ? "Belum ada billboard"
                                            : "Tidak ada hasil pencarian"}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            )}

            {/* Add Billboard Modal */}
            {showModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setShowModal(false)}
                    />
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none overflow-y-auto"
                    >
                        <Card className="w-full max-w-md shadow-2xl pointer-events-auto my-auto flex flex-col max-h-[90vh]">
                            <CardHeader className="flex flex-row items-center justify-between border-b flex-shrink-0">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Plus className="h-5 w-5" />
                                    Tambah Billboard Baru
                                </CardTitle>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </CardHeader>
                        <CardContent className="pt-6 overflow-y-auto flex-1 flex flex-col">
                            {mapClickMode && (
                                <div className="mb-4 space-y-3">
                                    {/* Map Container */}
                                    <div
                                        ref={mapModalRef}
                                        className="rounded-lg overflow-hidden border-2 border-blue-300 bg-gray-100 w-full flex-shrink-0"
                                        style={{ height: "clamp(250px, 40vh, 400px)" }}
                                    />

                                    {/* Info & Buttons */}
                                    <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg">
                                        <p className="text-sm font-semibold text-blue-900 mb-2">
                                            📍 Klik di map untuk set lokasi
                                        </p>
                                        {formData.lat && formData.lng && (
                                            <p className="text-xs text-blue-700 font-semibold mb-3">
                                                ✅ Lokasi: {parseFloat(formData.lat).toFixed(4)}, {parseFloat(formData.lng).toFixed(4)}
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
                                                onClick={() => { setDummyMapMode((v) => !v); setDummyMarker(null); }}
                                                className="text-xs px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded font-semibold transition-all"
                                            >
                                                Gunakan Dummy Map
                                            </button>
                                        </div>
                                    </div>

                                    {/* Dummy Map Fallback */}
                                    {dummyMapMode && (
                                        <div
                                            className="mt-2 border rounded bg-gray-100 relative overflow-hidden cursor-crosshair"
                                            style={{ height: "200px" }}
                                            onClick={(e) => {
                                                const el = e.currentTarget as HTMLDivElement;
                                                const rect = el.getBoundingClientRect();
                                                const clientX = (e as unknown as MouseEvent).clientX;
                                                const clientY = (e as unknown as MouseEvent).clientY;
                                                const x = clientX - rect.left;
                                                const y = clientY - rect.top;

                                                const latTop = -6.85;
                                                const latBottom = -6.95;
                                                const lngLeft = 112.18;
                                                const lngRight = 112.25;

                                                const lat = latTop + (y / rect.height) * (latBottom - latTop);
                                                const lng = lngLeft + (x / rect.width) * (lngRight - lngLeft);

                                                setFormData({ ...formData, lat: lat.toString(), lng: lng.toString() });
                                                setDummyMarker({ x, y, lat, lng });
                                            }}
                                        >
                                            {dummyMarker && (
                                                <span
                                                    className="absolute text-2xl"
                                                    style={{ left: dummyMarker.x - 12, top: dummyMarker.y - 24 }}
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

                            {submitStatus && (
                                <div
                                    className={`mb-4 p-3 rounded-lg flex items-gap-2 ${
                                        submitStatus.type === "success"
                                            ? "bg-green-50 border border-green-200"
                                            : "bg-red-50 border border-red-200"
                                    }`}
                                >
                                    {submitStatus.type === "success" ? (
                                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                                    )}
                                    <p
                                        className={`text-sm ${
                                            submitStatus.type === "success"
                                                ? "text-green-700"
                                                : "text-red-700"
                                        }`}
                                    >
                                        {submitStatus.message}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleAddBillboard} className="space-y-4">
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Ukuran *
                                        </label>
                                        <select
                                            required
                                            value={formData.size}
                                            onChange={(e) => {
                                                const selectedPkg = BILLBOARD_PACKAGES.find((pkg) => pkg.size === e.target.value);
                                                setFormData({
                                                    ...formData,
                                                    size: e.target.value,
                                                    price: selectedPkg?.price || "",
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
                                                    {pkg.size} - {pkg.price}
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
                                            {parseFloat(formData.lat).toFixed(4)}, {parseFloat(formData.lng).toFixed(4)}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-4 border-t mt-auto flex-shrink-0 bg-white sticky bottom-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowModal(false);
                                            setMapClickMode(false);
                                            setFormData({
                                                name: "",
                                                lat: "",
                                                lng: "",
                                                price: "",
                                                size: "",
                                                address: "",
                                            });
                                            setErrors({});
                                        }}
                                        className="flex-1"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 flex items-center justify-center gap-2"
                                        disabled={submitStatus?.type === "success" || !formData.lat || !formData.lng}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Simpan Billboard
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                </>
            )}
        </DashboardLayout>
    );
}


