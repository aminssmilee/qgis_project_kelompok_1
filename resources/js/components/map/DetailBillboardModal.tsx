import { X, MapPin, Tag, Ruler, TrendingUp, Info, Navigation, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Billboard } from "./types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DetailBillboardModalProps {
    billboard: Billboard;
    onClose: () => void;
}

export default function DetailBillboardModal({ billboard, onClose }: DetailBillboardModalProps) {
    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-[9998]"
                onClick={onClose}
            />

            {/* Modal container */}
            <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none overflow-y-auto">
                <Card className="w-full max-w-2xl shadow-2xl pointer-events-auto my-auto flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <CardHeader className="flex flex-row items-center justify-between border-b flex-shrink-0 bg-slate-50">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-600" />
                            Detail Billboard
                        </CardTitle>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </CardHeader>

                    {/* Scrollable Body */}
                    <CardContent className="p-0 overflow-y-auto flex-1">
                        {/* Foto Utama */}
                        <div className="w-full h-64 bg-slate-100 flex items-center justify-center relative group">
                            {billboard.photo_url ? (
                                <img 
                                    src={billboard.photo_url} 
                                    alt={billboard.name} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-slate-400">
                                    <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                                    <span>Tidak ada foto tersedia</span>
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-blue-600 shadow-md border-0 px-3 py-1 text-sm">
                                    {billboard.price}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Header Info */}
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">{billboard.name}</h2>
                                <div className="flex items-start gap-2 text-slate-600">
                                    <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-red-500" />
                                    <p className="text-sm leading-relaxed">{billboard.address}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Grid Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Ruler className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Ukuran</p>
                                            <p className="text-sm font-semibold text-slate-900">{billboard.size}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 rounded-lg">
                                            <Navigation className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Koordinat</p>
                                            <p className="text-sm font-semibold text-slate-900 font-mono">
                                                {parseFloat(billboard.lat.toString()).toFixed(5)}, {parseFloat(billboard.lng.toString()).toFixed(5)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-50 rounded-lg">
                                            <Tag className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Kategori</p>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {/* Fallback text if category is missing in local billboard object */}
                                                Umum / Baliho
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-50 rounded-lg">
                                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Status</p>
                                            <div className="mt-1">
                                                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                                                    Tersedia
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t bg-slate-50 flex justify-end">
                            <Button 
                                variant="outline" 
                                onClick={onClose}
                                className="px-6"
                            >
                                Tutup
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
