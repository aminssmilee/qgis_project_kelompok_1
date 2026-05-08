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
import { Plus, Edit2, Trash2, Eye, X, CheckCircle, AlertCircle } from "lucide-react";

const billboardsData = [
    {
        id: 1,
        name: "Billboard Pusat Kota",
        location: "Jalan MH Thamrin",
        size: "8m x 3m",
        traffic: "Tinggi",
        status: "Available",
        category: "Statis",
        price: "Rp 50 Juta",
    },
    {
        id: 2,
        name: "Billboard Jalan Sudirman",
        location: "Jalan Sudirman",
        size: "10m x 4m",
        traffic: "Sangat Tinggi",
        status: "Available",
        category: "Digital",
        price: "Rp 75 Juta",
    },
    {
        id: 3,
        name: "Billboard Gatot Subroto",
        location: "Jalan Gatot Subroto",
        size: "8m x 3m",
        traffic: "Tinggi",
        status: "Booked",
        category: "Statis",
        price: "Rp 60 Juta",
    },
    {
        id: 4,
        name: "Billboard Bandara",
        location: "Jalan Bandara Soekarno-Hatta",
        size: "6m x 3m",
        traffic: "Sedang",
        status: "Available",
        category: "LED",
        price: "Rp 45 Juta",
    },
    {
        id: 5,
        name: "Billboard Senayan",
        location: "Jalan Benda",
        size: "8m x 4m",
        traffic: "Tinggi",
        status: "Maintenance",
        category: "Digital",
        price: "Rp 65 Juta",
    },
];

export default function BillboardsPage() {
    const [billboards, setBillboards] = useState(billboardsData);
    const [showModal, setShowModal] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{type: "success" | "error"; message: string} | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        size: "",
        category: "Statis",
        traffic: "Sedang",
        status: "Available",
        price: "",
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const validateForm = () => {
        const newErrors: any = {};
        
        if (!formData.name.trim()) newErrors.name = "Nama billboard wajib diisi";
        if (!formData.location.trim()) newErrors.location = "Lokasi wajib diisi";
        if (!formData.size.trim()) newErrors.size = "Ukuran wajib diisi";
        if (!formData.price.trim()) newErrors.price = "Harga wajib diisi";
        if (!formData.category) newErrors.category = "Kategori wajib dipilih";
        if (!formData.traffic) newErrors.traffic = "Traffic wajib dipilih";
        if (!formData.status) newErrors.status = "Status wajib dipilih";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddBillboard = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus(null);

        if (!validateForm()) {
            setSubmitStatus({ type: "error", message: "Mohon periksa kembali data Anda" });
            return;
        }

        // Create new billboard with generated ID
        const newBillboard = {
            id: Math.max(...billboards.map(b => b.id), 0) + 1,
            name: formData.name,
            location: formData.location,
            size: formData.size,
            category: formData.category,
            traffic: formData.traffic,
            status: formData.status,
            price: formData.price,
        };

        // Add billboard to list
        const updatedBillboards = [...billboards, newBillboard];
        setBillboards(updatedBillboards);

        // Show success message
        setSubmitStatus({ type: "success", message: `Billboard ${formData.name} berhasil ditambahkan!` });

        // Reset form
        setTimeout(() => {
            setFormData({
                name: "",
                location: "",
                size: "",
                category: "Statis",
                traffic: "Sedang",
                status: "Available",
                price: "",
            });
            setShowModal(false);
            setSubmitStatus(null);
        }, 1500);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Available":
                return "bg-green-100 text-green-800";
            case "Booked":
                return "bg-blue-100 text-blue-800";
            case "Maintenance":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const stats = [
        {
            label: "Total Billboard",
            value: "245",
            color: "text-blue-600",
        },
        {
            label: "Available",
            value: "182",
            color: "text-green-600",
        },
        {
            label: "Booked",
            value: "52",
            color: "text-orange-600",
        },
        {
            label: "Maintenance",
            value: "11",
            color: "text-red-600",
        },
    ];

    return (
        <DashboardLayout title="Katalog Billboard">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">
                                    {stat.label}
                                </p>
                                <p className={`text-3xl font-bold ${stat.color}`}>
                                    {stat.value}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Daftar Billboard</CardTitle>
                    <Button size="sm" className="gap-2" onClick={() => setShowModal(true)}>
                        <Plus className="h-4 w-4" />
                        Tambah Billboard
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-semibold">
                                        Nama
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Lokasi
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Ukuran
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Kategori
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Traffic
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Harga
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
                                {billboards.map((billboard) => (
                                    <TableRow
                                        key={billboard.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <TableCell className="font-medium">
                                            {billboard.name}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {billboard.location}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {billboard.size}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {billboard.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {billboard.traffic}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {billboard.price}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(billboard.status)}>
                                                {billboard.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
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

            {/* Add Billboard Modal */}
            {showModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <Card className="w-full max-w-2xl shadow-2xl pointer-events-auto">
                            <CardHeader className="flex flex-row items-center justify-between border-b">
                                <CardTitle className="text-lg">Tambah Billboard Baru</CardTitle>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </CardHeader>
                            <CardContent className="pt-6">
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
                                    <div className="grid grid-cols-2 gap-4">
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
                                                placeholder="Contoh: Billboard Pusat Kota"
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Lokasi *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.location}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        location: e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    errors.location
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                                placeholder="Contoh: Jalan MH Thamrin"
                                            />
                                            {errors.location && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Ukuran *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.size}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        size: e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    errors.size
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                                placeholder="Contoh: 8m x 3m"
                                            />
                                            {errors.size && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.size}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Harga *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.price}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        price: e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    errors.price
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                                placeholder="Contoh: Rp 50 Juta"
                                            />
                                            {errors.price && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.price}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Kategori *
                                            </label>
                                            <select
                                                required
                                                value={formData.category}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        category: e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    errors.category
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                            >
                                                <option value="Statis">Statis</option>
                                                <option value="Digital">Digital</option>
                                                <option value="LED">LED</option>
                                            </select>
                                            {errors.category && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.category}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Traffic *
                                            </label>
                                            <select
                                                required
                                                value={formData.traffic}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        traffic: e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    errors.traffic
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                            >
                                                <option value="Rendah">Rendah</option>
                                                <option value="Sedang">Sedang</option>
                                                <option value="Tinggi">Tinggi</option>
                                                <option value="Sangat Tinggi">Sangat Tinggi</option>
                                            </select>
                                            {errors.traffic && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.traffic}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Status *
                                            </label>
                                            <select
                                                required
                                                value={formData.status}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        status: e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    errors.status
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                            >
                                                <option value="Available">Available</option>
                                                <option value="Booked">Booked</option>
                                                <option value="Maintenance">Maintenance</option>
                                            </select>
                                            {errors.status && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {errors.status}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
                                        >
                                            Simpan Billboard
                                        </button>
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
