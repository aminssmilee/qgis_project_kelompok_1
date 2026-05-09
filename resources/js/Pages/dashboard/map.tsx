import { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus } from "lucide-react";

import { Billboard } from "@/features/billboard/types";
import MainMap, { MainMapHandle } from "@/features/billboard/MainMap";
import { Skeleton } from "@/components/ui/skeleton";
import BillboardSidebar from "@/features/billboard/BillboardSidebar";
import AddBillboardModal from "@/features/billboard/AddBillboardModal";
import {
    fetchBillboards,
    deleteBillboard,
    ApiBillboard,
} from "@/features/billboard/billboard-api";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";


/** Konversi response API ke tipe Billboard yang digunakan komponen */
function apiBillboardToLocal(b: ApiBillboard): Billboard {
    return {
        id: b.id as unknown as number,
        name: b.name,
        lat: b.lat,
        lng: b.lng,
        address: b.address,
        photo_url: b.photo_url,
        price: b.price_label ?? "—",
        size: b.size ?? "—",
        markerVariant: undefined,
    };
}

export default function MapPage() {
    const [billboards, setBillboards] = useState<Billboard[]>([]);
    const [apiIds, setApiIds] = useState<Map<number, string>>(new Map()); // local id → uuid
    const [selectedBillboard, setSelectedBillboard] = useState<Billboard | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const mainMapRef = useRef<MainMapHandle>(null);

    // Load dari API saat mount
    useEffect(() => {
        fetchBillboards()
            .then((data) => {
                const mapped = data.map((b, idx) => ({
                    ...apiBillboardToLocal(b),
                    markerVariant: idx % 5,
                }));
                setBillboards(mapped);

                // Simpan pemetaan local-id → uuid untuk operasi delete
                const idMap = new Map<number, string>();
                data.forEach((b, idx) => idMap.set(idx, b.id));
                setApiIds(idMap);
            })
            .catch((err) => {
                console.error(err);
                setLoadError("Gagal memuat data billboard dari server.");
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleAddBillboard = (newBillboard: Billboard): void => {
        setBillboards((prev) => [...prev, { ...newBillboard, markerVariant: prev.length % 5 }]);
        setSelectedBillboard(newBillboard);
    };

    const handleDeleteBillboard = (localId: number): void => {
        setDeleteConfirmId(localId);
    };

    const confirmDelete = async (): Promise<void> => {
        if (deleteConfirmId === null) return;

        const localId = deleteConfirmId;
        const uuid = apiIds.get(localId) ?? String(localId);
        
        setIsDeleting(true);
        try {
            await deleteBillboard(uuid);
            setBillboards((prev) => prev.filter((bb) => bb.id !== localId));
            if (selectedBillboard?.id === localId) {
                setSelectedBillboard(null);
            }
            toast.success("Billboard berhasil dihapus");
        } catch (err) {
            console.error("Gagal menghapus:", err);
            toast.error("Gagal menghapus billboard", { 
                description: "Silakan coba lagi." 
            });
        } finally {
            setIsDeleting(false);
            setDeleteConfirmId(null);
        }
    };

    return (
        <DashboardLayout title="Peta Billboard">
            {/* Loading */}
            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <Card>
                            <div className="p-6 pb-0 flex justify-between items-center">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                            <CardContent className="pt-6">
                                <Skeleton className="w-full h-[600px] rounded-lg" />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1 space-y-4">
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>

            /* Error */
            ) : loadError ? (
                <div className="flex items-center justify-center h-96">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-red-500 font-semibold mb-2">⚠ Terjadi Kesalahan</p>
                            <p className="text-gray-500 text-sm">{loadError}</p>
                        </CardContent>
                    </Card>
                </div>

            /* Empty state */
            ) : billboards.length === 0 ? (
                <div className="flex items-center justify-center h-96">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">Belum ada billboard</p>
                            <Button onClick={() => setShowModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Billboard Pertama
                            </Button>
                        </CardContent>
                    </Card>
                </div>

            /* Main content */
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Peta Utama */}
                    <div className="lg:col-span-3">
                        <Card>
                            <div className="flex flex-row items-center justify-between p-6 pb-0">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Peta Lokasi Billboard (GIS)
                                </h2>
                                <Button
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={() => setShowModal(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah Billboard
                                </Button>
                            </div>
                            <CardContent className="pt-4">
                                <MainMap
                                    ref={mainMapRef}
                                    billboards={billboards}
                                    mapClickMode={false}
                                    onLocationPicked={() => {}}
                                    onBillboardSelect={setSelectedBillboard}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <BillboardSidebar
                        billboards={billboards}
                        selectedBillboard={selectedBillboard}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onSelectBillboard={setSelectedBillboard}
                        onDeleteBillboard={handleDeleteBillboard}
                        onFlyTo={(lat, lng) => mainMapRef.current?.flyTo(lat, lng)}
                    />
                </div>
            )}

            {/* Modal Tambah Billboard */}
            {showModal && (
                <AddBillboardModal
                    billboards={billboards}
                    onAdd={handleAddBillboard}
                    onClose={() => setShowModal(false)}
                />
            )}

            {/* Konfirmasi Hapus Billboard */}
            <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Billboard akan dihapus secara permanen dari server.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
