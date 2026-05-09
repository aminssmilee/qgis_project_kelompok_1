import { Search, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Billboard } from "./types";

interface BillboardSidebarProps {
    billboards: Billboard[];
    selectedBillboard: Billboard | null;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onSelectBillboard: (billboard: Billboard) => void;
    onDeleteBillboard: (id: number) => void;
    onFlyTo?: (lat: number, lng: number) => void;
}

export default function BillboardSidebar({
    billboards,
    selectedBillboard,
    searchTerm,
    onSearchChange,
    onSelectBillboard,
    onDeleteBillboard,
    onFlyTo,
}: BillboardSidebarProps) {
    const filteredBillboards = billboards.filter(
        (bb) =>
            bb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bb.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="lg:col-span-1 space-y-4">
            {/* Detail Panel */}
            {selectedBillboard ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Detail Billboard</CardTitle>
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
                                <p className="font-semibold">{selectedBillboard.size}</p>
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
                                    {selectedBillboard.lat.toFixed(4)},{" "}
                                    {selectedBillboard.lng.toFixed(4)}
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => onDeleteBillboard(selectedBillboard.id)}
                            variant="destructive"
                            size="sm"
                            className="w-full"
                        >
                            Hapus Billboard
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <Info className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 text-center">
                            Klik marker pada peta untuk melihat detail billboard
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Search & List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Daftar Billboard ({filteredBillboards.length}/{billboards.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau alamat..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {filteredBillboards.length > 0 ? (
                            filteredBillboards.map((bb) => (
                                <button
                                    key={bb.id}
                                    onClick={() => {
                                        onSelectBillboard(bb);
                                        onFlyTo?.(bb.lat, bb.lng);
                                    }}
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
                                        <span className="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2 bg-blue-100 text-blue-700">
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
    );
}
