import React, { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, CheckCircle, Eye, X, AlertCircle } from "lucide-react";

type OptionItem = { id: string; name: string };

const rentalsData = [
    {
        id: "BK001",
        client: "PT. Maju Jaya",
        billboard: "Billboard Pusat Kota",
        startDate: "2024-05-01",
        endDate: "2024-05-31",
        duration: "30 hari",
        amount: "Rp 50 Juta",
        status: "Active",
        payment: "Paid",
    },
    {
        id: "BK002",
        client: "CV. Cipta Digital",
        billboard: "Billboard Jalan Sudirman",
        startDate: "2024-05-05",
        endDate: "2024-06-05",
        duration: "31 hari",
        amount: "Rp 75 Juta",
        status: "Active",
        payment: "Paid",
    },
    {
        id: "BK003",
        client: "PT. Indo Promosi",
        billboard: "Billboard Gatot Subroto",
        startDate: "2024-06-01",
        endDate: "2024-06-30",
        duration: "30 hari",
        amount: "Rp 60 Juta",
        status: "Pending",
        payment: "Unpaid",
    },
    {
        id: "BK004",
        client: "PT. Media Global",
        billboard: "Billboard Bandara",
        startDate: "2024-04-01",
        endDate: "2024-04-30",
        duration: "30 hari",
        amount: "Rp 45 Juta",
        status: "Completed",
        payment: "Paid",
    },
    {
        id: "BK005",
        client: "Startup Tech Indonesia",
        billboard: "Billboard Senayan",
        startDate: "2024-05-15",
        endDate: "2024-08-15",
        duration: "92 hari",
        amount: "Rp 190 Juta",
        status: "Active",
        payment: "Paid",
    },
];

const emptyForm = {
    client_id: "",
    billboard_id: "",
    rental_date: "",
    duration_days: "",
    total_price: "",
    payment_status: "Pending",
};

export default function RentalsPage() {
    const [rentals, setRentals] = useState(rentalsData);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ ...emptyForm });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clients, setClients] = useState<OptionItem[]>([]);
    const [billboards, setBillboards] = useState<OptionItem[]>([]);

    useEffect(() => {
        fetch("/dashboard/options", { headers: { Accept: "application/json" } })
            .then((res) => (res.ok ? res.json() : Promise.reject()))
            .then((data) => {
                setClients(Array.isArray(data.clients) ? data.clients : []);
                setBillboards(Array.isArray(data.billboards) ? data.billboards : []);
            })
            .catch(() => {});
    }, []);

    const openModal = () => {
        setFormData({ ...emptyForm });
        setFormErrors({});
        setSubmitStatus(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSubmitStatus(null);
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!formData.client_id) errs.client_id = "Klien wajib dipilih";
        if (!formData.billboard_id) errs.billboard_id = "Billboard wajib dipilih";
        if (!formData.rental_date) errs.rental_date = "Tanggal sewa wajib diisi";
        if (!formData.duration_days) errs.duration_days = "Durasi wajib diisi";
        if (!formData.total_price) errs.total_price = "Total harga wajib diisi";
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus(null);
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
            const res = await fetch("/dashboard/rentals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify(formData),
            });
            const payload = await res.json().catch(() => null);

            if (res.ok) {
                setSubmitStatus({ type: "success", message: "Penyewaan berhasil ditambahkan!" });
                setTimeout(() => {
                    closeModal();
                    window.location.reload();
                }, 1200);
            } else {
                const firstErr = payload?.errors
                    ? Object.values(payload.errors as Record<string, string[]>).flat()[0]
                    : null;
                setSubmitStatus({ type: "error", message: firstErr ?? payload?.message ?? "Gagal menambahkan penyewaan" });
            }
        } catch {
            setSubmitStatus({ type: "error", message: "Terjadi kesalahan jaringan" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active":
                return "bg-blue-100 text-blue-800";
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Completed":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getPaymentColor = (payment: string) => {
        return payment === "Paid"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";
    };

    const stats = [
        { label: "Penyewaan Aktif", value: "38", icon: Calendar, color: "text-blue-600" },
        { label: "Pending Pembayaran", value: "5", icon: DollarSign, color: "text-orange-600" },
        { label: "Selesai Bulan Ini", value: "12", icon: CheckCircle, color: "text-green-600" },
    ];

    const inputClass = (field: string) =>
        `w-full rounded-lg border px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
            formErrors[field] ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"
        }`;

    return (
        <DashboardLayout title="Penyewaan & Kontrak">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Rentals Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Daftar Penyewaan</CardTitle>
                    <Button size="sm" onClick={openModal}>Tambah Penyewaan</Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-semibold">ID Booking</TableHead>
                                    <TableHead className="font-semibold">Klien</TableHead>
                                    <TableHead className="font-semibold">Billboard</TableHead>
                                    <TableHead className="font-semibold">Durasi</TableHead>
                                    <TableHead className="font-semibold">Total</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold">Pembayaran</TableHead>
                                    <TableHead className="font-semibold text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rentals.map((rental) => (
                                    <TableRow key={rental.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium text-blue-600">{rental.id}</TableCell>
                                        <TableCell className="text-sm">{rental.client}</TableCell>
                                        <TableCell className="text-sm">{rental.billboard}</TableCell>
                                        <TableCell className="text-sm">
                                            {rental.duration}<br />
                                            <span className="text-xs text-gray-500">{rental.startDate} s/d {rental.endDate}</span>
                                        </TableCell>
                                        <TableCell className="font-semibold">{rental.amount}</TableCell>
                                        <TableCell><Badge className={getStatusColor(rental.status)}>{rental.status}</Badge></TableCell>
                                        <TableCell><Badge className={getPaymentColor(rental.payment)}>{rental.payment}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Tambah Penyewaan Modal */}
            {showModal && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={closeModal} />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <Card className="w-full max-w-lg shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
                            <CardHeader className="flex flex-row items-center justify-between border-b">
                                <CardTitle>Tambah Penyewaan Baru</CardTitle>
                                <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {submitStatus && (
                                    <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                                        submitStatus.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                                    }`}>
                                        {submitStatus.type === "success" ? (
                                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                                        )}
                                        <p className={`text-sm ${submitStatus.type === "success" ? "text-green-700" : "text-red-700"}`}>
                                            {submitStatus.message}
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Klien *</label>
                                        <select required value={formData.client_id} onChange={(e) => setFormData({ ...formData, client_id: e.target.value })} className={inputClass("client_id")}>
                                            <option value="">Pilih klien</option>
                                            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        {formErrors.client_id && <p className="text-xs text-red-600 mt-1">{formErrors.client_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Billboard *</label>
                                        <select required value={formData.billboard_id} onChange={(e) => setFormData({ ...formData, billboard_id: e.target.value })} className={inputClass("billboard_id")}>
                                            <option value="">Pilih billboard</option>
                                            {billboards.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                        {formErrors.billboard_id && <p className="text-xs text-red-600 mt-1">{formErrors.billboard_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Sewa *</label>
                                        <input type="date" required value={formData.rental_date} onChange={(e) => setFormData({ ...formData, rental_date: e.target.value })} className={inputClass("rental_date")} />
                                        {formErrors.rental_date && <p className="text-xs text-red-600 mt-1">{formErrors.rental_date}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Durasi (hari) *</label>
                                            <input type="number" min="1" required placeholder="30" value={formData.duration_days} onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })} className={inputClass("duration_days")} />
                                            {formErrors.duration_days && <p className="text-xs text-red-600 mt-1">{formErrors.duration_days}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Total Harga *</label>
                                            <input type="number" min="0" required placeholder="50000000" value={formData.total_price} onChange={(e) => setFormData({ ...formData, total_price: e.target.value })} className={inputClass("total_price")} />
                                            {formErrors.total_price && <p className="text-xs text-red-600 mt-1">{formErrors.total_price}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status Pembayaran</label>
                                        <select value={formData.payment_status} onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })} className={inputClass("payment_status")}>
                                            <option value="Pending">Pending</option>
                                            <option value="Paid">Paid</option>
                                            <option value="Overdue">Overdue</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                                        <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>Batal</Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? "Menyimpan..." : "Simpan Penyewaan"}
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

