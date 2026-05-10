import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";

interface BookingDetail {
    id: string;
    booking_code: string;
    client: string;
    client_email: string;
    billboard: string;
    billboard_location: string;
    start_date: string;
    end_date: string;
    duration: string;
    base_price: string;
    discount: string;
    tax: string;
    total_price: string;
    status: string;
    status_raw: string;
    payment: string;
    notes: string | null;
    admin_note: string | null;
    created_at: string;
}

interface BookingDetailModalProps {
    bookingId: string;
    onClose: () => void;
    onActionSuccess: () => void;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    Active: {
        color: "bg-blue-100 text-blue-800",
        icon: <CheckCircle2 className="h-3 w-3" />,
    },
    Pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="h-3 w-3" />,
    },
    Completed: {
        color: "bg-gray-100 text-gray-800",
        icon: <History className="h-3 w-3" />,
    },
    Cancelled: {
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="h-3 w-3" />,
    },
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-500 shrink-0">{label}</span>
            <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
        </div>
    );
}

export default function BookingDetailModal({
    bookingId,
    onClose,
    onActionSuccess,
}: BookingDetailModalProps) {
    const [detail, setDetail] = React.useState<BookingDetail | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);

    React.useEffect(() => {
        api.get(`/admin/bookings/${bookingId}`)
            .then((res) => setDetail(res.data.data))
            .catch(() => toast.error("Gagal memuat detail booking."))
            .finally(() => setIsLoading(false));
    }, [bookingId]);

    const handleApprove = async () => {
        if (!detail) return;
        setIsSubmitting(true);
        try {
            await api.patch(`/admin/bookings/${detail.id}/approve`);
            toast.success(`Booking ${detail.booking_code} berhasil disetujui!`);
            onActionSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menyetujui booking.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!detail || !rejectReason.trim()) {
            toast.error("Alasan penolakan wajib diisi.");
            return;
        }
        setIsSubmitting(true);
        try {
            await api.patch(`/admin/bookings/${detail.id}/reject`, {
                admin_note: rejectReason,
            });
            toast.success(`Booking ${detail.booking_code} berhasil ditolak.`);
            onActionSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menolak booking.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusCfg = detail ? (statusConfig[detail.status] ?? statusConfig["Cancelled"]) : null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl pointer-events-auto animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                        <h2 className="text-lg font-bold text-slate-800">Detail Penyewaan</h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700"
                        >
                            <XCircle className="h-5 w-5" />
                        </button>
                    </div>
                    {/* Scrollable Content */}
                    <div className="overflow-y-auto px-6 py-5 flex-1">
            {isLoading ? (
                <div className="space-y-3 py-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
                    ))}
                </div>
            ) : detail ? (
                <div className="space-y-5">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                        <Badge
                            className={cn(
                                "gap-1.5 px-3 py-1 text-xs font-semibold",
                                statusCfg?.color,
                            )}
                        >
                            {statusCfg?.icon}
                            {detail.status}
                        </Badge>
                        <span className="text-xs text-gray-400">
                            Dibuat: {detail.created_at}
                        </span>
                    </div>

                    {/* Booking Info */}
                    <div>
                        <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                            Info Booking
                        </p>
                        <div>
                            <InfoRow label="Kode Booking" value={<span className="font-bold text-blue-600">{detail.booking_code}</span>} />
                            <InfoRow label="Durasi" value={detail.duration} />
                            <InfoRow label="Tanggal Mulai" value={detail.start_date} />
                            <InfoRow label="Tanggal Selesai" value={detail.end_date} />
                        </div>
                    </div>

                    {/* Client Info */}
                    <div>
                        <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                            Info Klien
                        </p>
                        <div>
                            <InfoRow label="Nama" value={detail.client} />
                            <InfoRow label="Email" value={detail.client_email} />
                        </div>
                    </div>

                    {/* Billboard Info */}
                    <div>
                        <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                            Info Billboard
                        </p>
                        <div>
                            <InfoRow label="Nama" value={detail.billboard} />
                            <InfoRow label="Lokasi" value={detail.billboard_location} />
                        </div>
                    </div>

                    {/* Pricing Info */}
                    <div>
                        <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                            Rincian Harga
                        </p>
                        <div>
                            <InfoRow label="Harga Dasar" value={detail.base_price} />
                            <InfoRow label="Diskon" value={<span className="text-green-600">- {detail.discount}</span>} />
                            <InfoRow label="Pajak (PPN 11%)" value={detail.tax} />
                            <InfoRow
                                label="Total Pembayaran"
                                value={<span className="text-lg font-bold text-gray-900">{detail.total_price}</span>}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    {(detail.notes || detail.admin_note) && (
                        <div>
                            <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                                Catatan
                            </p>
                            {detail.notes && (
                                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 mb-2">
                                    <span className="font-semibold">Klien:</span> {detail.notes}
                                </p>
                            )}
                            {detail.admin_note && (
                                <p className="text-sm text-gray-700 bg-yellow-50 rounded-lg px-3 py-2">
                                    <span className="font-semibold">Admin:</span> {detail.admin_note}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action Buttons (only for Pending) */}
                    {detail.status === "Pending" && (
                        <div className="pt-2 space-y-3 border-t">
                            {showRejectForm ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Alasan Penolakan *
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Contoh: Billboard sedang dalam perbaikan..."
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setShowRejectForm(false)}
                                            disabled={isSubmitting}
                                        >
                                            Kembali
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            className="flex-1"
                                            onClick={handleReject}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Memproses..." : "Konfirmasi Tolak"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => setShowRejectForm(true)}
                                        disabled={isSubmitting}
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Tolak
                                    </Button>
                                    <Button
                                        type="button"
                                        className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                                        onClick={handleApprove}
                                        disabled={isSubmitting}
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        {isSubmitting ? "Memproses..." : "Setujui"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Close button for non-pending */}
                    {detail.status !== "Pending" && (
                        <div className="pt-2 border-t">
                            <Button type="button" variant="outline" className="w-full" onClick={onClose}>
                                Tutup
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-sm text-gray-500 text-center py-4">Data tidak ditemukan.</p>
            )}
                    </div>
                </div>
            </div>
        </>
    );
}
