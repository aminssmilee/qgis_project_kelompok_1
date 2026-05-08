import React, { useState } from "react";
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
import { Users, Plus, Edit2, Trash2, Mail, Phone, X, CheckCircle, AlertCircle } from "lucide-react";

const clientsData = [
    {
        id: 1,
        name: "PT. Maju Jaya",
        email: "info@majujaya.com",
        phone: "+62-21-1234567",
        city: "Jakarta",
        totalRentals: 5,
        totalSpent: "Rp 250 Juta",
        status: "Active",
        joinDate: "2023-01-15",
    },
    {
        id: 2,
        name: "CV. Cipta Digital",
        email: "admin@cipta.co.id",
        phone: "+62-812-9876543",
        city: "Jakarta",
        totalRentals: 8,
        totalSpent: "Rp 420 Juta",
        status: "Active",
        joinDate: "2022-11-20",
    },
    {
        id: 3,
        name: "PT. Indo Promosi",
        email: "contact@indopromosi.id",
        phone: "+62-21-5555666",
        city: "Bandung",
        totalRentals: 3,
        totalSpent: "Rp 180 Juta",
        status: "Active",
        joinDate: "2024-02-10",
    },
    {
        id: 4,
        name: "PT. Media Global",
        email: "sales@mediaglobal.com",
        phone: "+62-21-9999888",
        city: "Jakarta",
        totalRentals: 12,
        totalSpent: "Rp 680 Juta",
        status: "Active",
        joinDate: "2021-08-05",
    },
    {
        id: 5,
        name: "Startup Tech Indonesia",
        email: "hello@techstartup.id",
        phone: "+62-812-1111222",
        city: "Jakarta",
        totalRentals: 2,
        totalSpent: "Rp 95 Juta",
        status: "Inactive",
        joinDate: "2023-06-12",
    },
];

const emptyClientForm = { name: "", email: "", phone: "", city: "", status: "Active" };

export default function ClientsPage() {
    const [clients, setClients] = useState(clientsData);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ ...emptyClientForm });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openModal = () => {
        setFormData({ ...emptyClientForm });
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
        if (!formData.name.trim()) errs.name = "Nama klien wajib diisi";
        if (!formData.email.trim()) errs.email = "Email wajib diisi";
        if (!formData.phone.trim()) errs.phone = "Telepon wajib diisi";
        if (!formData.city.trim()) errs.city = "Kota wajib diisi";
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
            const res = await fetch("/dashboard/clients", {
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
                setSubmitStatus({ type: "success", message: `Klien ${formData.name} berhasil ditambahkan!` });
                setTimeout(() => {
                    closeModal();
                    window.location.reload();
                }, 1200);
            } else {
                const firstErr = payload?.errors
                    ? Object.values(payload.errors as Record<string, string[]>).flat()[0]
                    : null;
                setSubmitStatus({ type: "error", message: firstErr ?? payload?.message ?? "Gagal menambahkan klien" });
            }
        } catch {
            setSubmitStatus({ type: "error", message: "Terjadi kesalahan jaringan" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = (field: string) =>
        `w-full rounded-lg border px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
            formErrors[field] ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"
        }`;

    const stats = [
        { label: "Total Klien", value: "182", color: "text-blue-600" },
        { label: "Klien Aktif", value: "165", color: "text-green-600" },
        { label: "Klien Baru (Bulan Ini)", value: "12", color: "text-orange-600" },
    ];

    return (
        <DashboardLayout title="Manajemen Klien">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Clients Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Daftar Klien
                    </CardTitle>
                    <Button size="sm" className="gap-2" onClick={openModal}>
                        <Plus className="h-4 w-4" />
                        Tambah Klien
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-semibold">
                                        Nama Klien
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Kontak
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Kota
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Total Rental
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Total Pengeluaran
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Tanggal Bergabung
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Status
                                    </TableHead>
                                    <TableHead className="font-semibold text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.map((client) => (
                                    <TableRow
                                        key={client.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <TableCell className="font-medium">
                                            {client.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3 text-gray-500" />
                                                    {client.email}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3 text-gray-500" />
                                                    {client.phone}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {client.city}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {client.totalRentals} kali
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {client.totalSpent}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {client.joinDate}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    client.status === "Active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }
                                            >
                                                {client.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-orange-600 hover:text-orange-700"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Tambah Klien Modal */}
            {showModal && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={closeModal} />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <Card className="w-full max-w-md shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
                            <CardHeader className="flex flex-row items-center justify-between border-b">
                                <CardTitle>Tambah Klien Baru</CardTitle>
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
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Klien *</label>
                                        <input type="text" required autoFocus value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass("name")} placeholder="PT Maju Jaya" />
                                        {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                        <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass("email")} placeholder="email@perusahaan.com" />
                                        {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Telepon *</label>
                                        <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass("phone")} placeholder="08xxxxxxxxxx" />
                                        {formErrors.phone && <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Kota *</label>
                                        <input type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={inputClass("city")} placeholder="Jakarta" />
                                        {formErrors.city && <p className="text-xs text-red-600 mt-1">{formErrors.city}</p>}
                                    </div>

                                    <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                                        <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>Batal</Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? "Menyimpan..." : "Simpan Klien"}
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
