import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp,
    Users,
    MapPin,
    Calendar,
    X,
    CheckCircle,
    AlertCircle,
    UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import data from "./data.json";

type DashboardOption = {
    id: string;
    name: string;
};

type DashboardOptionsState = {
    clients: DashboardOption[];
    billboards: DashboardOption[];
};

export default function Page() {
    const [dashboardOptions, setDashboardOptions] =
        useState<DashboardOptionsState>({
            clients: [],
            billboards: [],
        });
    const [showClientModal, setShowClientModal] = useState(false);
    const [showRentalModal, setShowRentalModal] = useState(false);
    const [clientFormData, setClientFormData] = useState({
        name: "",
        email: "",
        phone: "",
        city: "",
        status: "Active",
    });
    const [rentalFormData, setRentalFormData] = useState({
        client_id: "",
        billboard_id: "",
        rental_date: "",
        duration_days: "",
        total_price: "",
        payment_status: "Pending",
    });
    const [clientErrors, setClientErrors] = useState<{ [key: string]: string }>(
        {},
    );
    const [rentalErrors, setRentalErrors] = useState<{ [key: string]: string }>(
        {},
    );
    const [submitStatus, setSubmitStatus] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    useEffect(() => {
        const loadDashboardOptions = async () => {
            try {
                const response = await fetch("/dashboard/options", {
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (!response.ok) {
                    return;
                }

                const payload = await response.json();

                setDashboardOptions({
                    clients: Array.isArray(payload.clients)
                        ? payload.clients
                        : [],
                    billboards: Array.isArray(payload.billboards)
                        ? payload.billboards
                        : [],
                });
            } catch {
                setDashboardOptions({ clients: [], billboards: [] });
            }
        };

        loadDashboardOptions();
    }, []);

    const getErrorMessage = (payload: unknown, fallbackMessage: string) => {
        if (!payload || typeof payload !== "object") {
            return fallbackMessage;
        }

        const responsePayload = payload as {
            message?: string;
            errors?: Record<string, string[]>;
        };

        const firstError = Object.values(responsePayload.errors ?? {})
            .flat()
            .find((message) => Boolean(message));

        return firstError ?? responsePayload.message ?? fallbackMessage;
    };

    const validateClientForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!clientFormData.name.trim())
            newErrors.name = "Nama klien wajib diisi";
        if (!clientFormData.email.trim()) newErrors.email = "Email wajib diisi";
        if (!clientFormData.phone.trim())
            newErrors.phone = "Telepon wajib diisi";
        if (!clientFormData.city.trim()) newErrors.city = "Kota wajib diisi";
        setClientErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateRentalForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!rentalFormData.client_id)
            newErrors.client_id = "Klien wajib dipilih";
        if (!rentalFormData.billboard_id)
            newErrors.billboard_id = "Billboard wajib dipilih";
        if (!rentalFormData.rental_date)
            newErrors.rental_date = "Tanggal sewa wajib diisi";
        if (!rentalFormData.duration_days)
            newErrors.duration_days = "Durasi wajib diisi";
        if (!rentalFormData.total_price)
            newErrors.total_price = "Harga wajib diisi";
        setRentalErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus(null);

        if (!validateClientForm()) {
            setSubmitStatus({
                type: "error",
                message: "Mohon isi semua field yang wajib",
            });
            return;
        }

        try {
            const response = await fetch("/dashboard/clients", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
                body: JSON.stringify(clientFormData),
            });

            const payload = await response.json().catch(() => null);

            if (response.ok) {
                setSubmitStatus({
                    type: "success",
                    message: `Klien ${clientFormData.name} berhasil ditambahkan!`,
                });
                setTimeout(() => {
                    setClientFormData({
                        name: "",
                        email: "",
                        phone: "",
                        city: "",
                        status: "Active",
                    });
                    setShowClientModal(false);
                    setSubmitStatus(null);
                    window.location.reload();
                }, 1500);
            } else {
                setSubmitStatus({
                    type: "error",
                    message: getErrorMessage(
                        payload,
                        "Gagal menambahkan klien",
                    ),
                });
            }
        } catch (error) {
            setSubmitStatus({ type: "error", message: "Terjadi kesalahan" });
        }
    };

    const handleAddRental = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus(null);

        if (!validateRentalForm()) {
            setSubmitStatus({
                type: "error",
                message: "Mohon isi semua field yang wajib",
            });
            return;
        }

        try {
            const response = await fetch("/dashboard/rentals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
                body: JSON.stringify(rentalFormData),
            });

            const payload = await response.json().catch(() => null);

            if (response.ok) {
                setSubmitStatus({
                    type: "success",
                    message: "Penyewaan berhasil ditambahkan!",
                });
                setTimeout(() => {
                    setRentalFormData({
                        client_id: "",
                        billboard_id: "",
                        rental_date: "",
                        duration_days: "",
                        total_price: "",
                        payment_status: "Pending",
                    });
                    setShowRentalModal(false);
                    setSubmitStatus(null);
                    window.location.reload();
                }, 1500);
            } else {
                setSubmitStatus({
                    type: "error",
                    message: getErrorMessage(
                        payload,
                        "Gagal menambahkan penyewaan",
                    ),
                });
            }
        } catch (error) {
            setSubmitStatus({ type: "error", message: "Terjadi kesalahan" });
        }
    };
    const stats = [
        {
            title: "Total Billboard",
            value: "245",
            description: "+12% bulan ini",
            icon: MapPin,
            gradient: "from-[#0b2a6b] via-[#123aa0] to-[#1a4acb]",
        },
        {
            title: "Pemesanan Aktif",
            value: "38",
            description: "+5% bulan ini",
            icon: Calendar,
            gradient: "from-[#1f49c8] via-[#2b5ddd] to-[#3a6df0]",
        },
        {
            title: "Total Klien",
            value: "182",
            description: "+22% bulan ini",
            icon: Users,
            gradient: "from-[#0b2a6b] via-[#143b9c] to-[#1c4fc9]",
        },
        {
            title: "Pendapatan Bulan Ini",
            value: "Rp 145.2 M",
            description: "+8% bulan ini",
            icon: TrendingUp,
            gradient: "from-[#123aa0] via-[#1f4ed1] to-[#2e66f0]",
        },
    ];

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader
                    title="Dashboard"
                    subtitle="Selamat datang kembali, Super Admin"
                />
                <div className="flex flex-1 flex-col bg-transparent">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-5 px-4 py-6 md:gap-6 lg:px-6">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {stats.map((stat, index) => {
                                    const Icon = stat.icon;
                                    return (
                                        <Card
                                            key={index}
                                            className={`border-0 bg-gradient-to-br ${stat.gradient} text-white shadow-sm`}
                                        >
                                            <CardContent className="p-5">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                </div>
                                                <p className="mt-5 text-xs font-medium text-white/80">
                                                    {stat.title}
                                                </p>
                                                <div className="mt-1 text-2xl font-semibold">
                                                    {stat.value}
                                                </div>
                                                <span className="mt-3 inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                                                    {stat.description}
                                                </span>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                                <ChartAreaInteractive />
                                <Card className="h-full border border-slate-200/70">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Aksi Cepat
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3">
                                        <button
                                            onClick={() =>
                                                setShowClientModal(true)
                                            }
                                            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
                                        >
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                <UserPlus className="h-4 w-4" />
                                            </span>
                                            <span>
                                                <span className="block text-sm font-semibold text-slate-800">
                                                    Tambah Klien
                                                </span>
                                                <span className="block text-xs text-slate-500">
                                                    Daftarkan klien baru
                                                </span>
                                            </span>
                                        </button>
                                        <button
                                            onClick={() =>
                                                setShowRentalModal(true)
                                            }
                                            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
                                        >
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                <Calendar className="h-4 w-4" />
                                            </span>
                                            <span>
                                                <span className="block text-sm font-semibold text-slate-800">
                                                    Tambah Penyewaan
                                                </span>
                                                <span className="block text-xs text-slate-500">
                                                    Buat order penyewaan
                                                </span>
                                            </span>
                                        </button>
                                        <Link
                                            to="/dashboard/billboards"
                                            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
                                        >
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                <MapPin className="h-4 w-4" />
                                            </span>
                                            <span>
                                                <span className="block text-sm font-semibold text-slate-800">
                                                    Tambah Billboard
                                                </span>
                                                <span className="block text-xs text-slate-500">
                                                    Input lokasi baru
                                                </span>
                                            </span>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="px-0">
                                <DataTable data={data} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Modal */}
                {showClientModal && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setShowClientModal(false)}
                        />
                        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                            <Card className="w-full max-w-md shadow-2xl pointer-events-auto">
                                <CardHeader className="flex flex-row items-center justify-between border-b">
                                    <CardTitle>Tambah Klien Baru</CardTitle>
                                    <button
                                        onClick={() =>
                                            setShowClientModal(false)
                                        }
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
                                                    submitStatus.type ===
                                                    "success"
                                                        ? "text-green-700"
                                                        : "text-red-700"
                                                }`}
                                            >
                                                {submitStatus.message}
                                            </p>
                                        </div>
                                    )}

                                    <form
                                        onSubmit={handleAddClient}
                                        className="space-y-4"
                                    >
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Nama Klien *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                autoFocus
                                                value={clientFormData.name}
                                                onChange={(e) =>
                                                    setClientFormData({
                                                        ...clientFormData,
                                                        name: e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    clientErrors.name
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                                placeholder="PT Maju Jaya"
                                            />
                                            {clientErrors.name && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {clientErrors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={clientFormData.email}
                                                onChange={(e) =>
                                                    setClientFormData({
                                                        ...clientFormData,
                                                        email: e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    clientErrors.email
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                                placeholder="email@perusahaan.com"
                                            />
                                            {clientErrors.email && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {clientErrors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Telepon *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={clientFormData.phone}
                                                onChange={(e) =>
                                                    setClientFormData({
                                                        ...clientFormData,
                                                        phone: e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    clientErrors.phone
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                                placeholder="08xxxxxxxxxx"
                                            />
                                            {clientErrors.phone && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {clientErrors.phone}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Kota *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={clientFormData.city}
                                                onChange={(e) =>
                                                    setClientFormData({
                                                        ...clientFormData,
                                                        city: e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    clientErrors.city
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                                placeholder="Lamongan"
                                            />
                                            {clientErrors.city && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {clientErrors.city}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowClientModal(false)
                                                }
                                                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                            >
                                                Simpan Klien
                                            </button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {/* Rental Modal */}
                {showRentalModal && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setShowRentalModal(false)}
                        />
                        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                            <Card className="w-full max-w-md shadow-2xl pointer-events-auto">
                                <CardHeader className="flex flex-row items-center justify-between border-b">
                                    <CardTitle>Tambah Penyewaan Baru</CardTitle>
                                    <button
                                        onClick={() =>
                                            setShowRentalModal(false)
                                        }
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
                                                    submitStatus.type ===
                                                    "success"
                                                        ? "text-green-700"
                                                        : "text-red-700"
                                                }`}
                                            >
                                                {submitStatus.message}
                                            </p>
                                        </div>
                                    )}

                                    <form
                                        onSubmit={handleAddRental}
                                        className="space-y-4"
                                    >
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Klien *
                                            </label>
                                            <select
                                                required
                                                value={rentalFormData.client_id}
                                                onChange={(e) =>
                                                    setRentalFormData({
                                                        ...rentalFormData,
                                                        client_id:
                                                            e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    rentalErrors.client_id
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                            >
                                                <option value="">
                                                    Pilih klien
                                                </option>
                                                {dashboardOptions.clients.map(
                                                    (client) => (
                                                        <option
                                                            key={client.id}
                                                            value={client.id}
                                                        >
                                                            {client.name}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            {rentalErrors.client_id && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {rentalErrors.client_id}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Billboard *
                                            </label>
                                            <select
                                                required
                                                value={
                                                    rentalFormData.billboard_id
                                                }
                                                onChange={(e) =>
                                                    setRentalFormData({
                                                        ...rentalFormData,
                                                        billboard_id:
                                                            e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    rentalErrors.billboard_id
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                            >
                                                <option value="">
                                                    Pilih billboard
                                                </option>
                                                {dashboardOptions.billboards.map(
                                                    (billboard) => (
                                                        <option
                                                            key={billboard.id}
                                                            value={billboard.id}
                                                        >
                                                            {billboard.name}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            {rentalErrors.billboard_id && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {rentalErrors.billboard_id}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Tanggal Sewa *
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                value={
                                                    rentalFormData.rental_date
                                                }
                                                onChange={(e) =>
                                                    setRentalFormData({
                                                        ...rentalFormData,
                                                        rental_date:
                                                            e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    rentalErrors.rental_date
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                            />
                                            {rentalErrors.rental_date && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {rentalErrors.rental_date}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Durasi (hari) *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                value={
                                                    rentalFormData.duration_days
                                                }
                                                onChange={(e) =>
                                                    setRentalFormData({
                                                        ...rentalFormData,
                                                        duration_days:
                                                            e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    rentalErrors.duration_days
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                                placeholder="30"
                                            />
                                            {rentalErrors.duration_days && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {rentalErrors.duration_days}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Total Harga *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                value={
                                                    rentalFormData.total_price
                                                }
                                                onChange={(e) =>
                                                    setRentalFormData({
                                                        ...rentalFormData,
                                                        total_price:
                                                            e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    rentalErrors.total_price
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                                placeholder="50000000"
                                            />
                                            {rentalErrors.total_price && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {rentalErrors.total_price}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowRentalModal(false)
                                                }
                                                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                            >
                                                Simpan Penyewaan
                                            </button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </SidebarInset>
        </SidebarProvider>
    );
}
