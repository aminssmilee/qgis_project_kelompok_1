import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    TrendingUp,
    Users,
    MapPin,
    Calendar,
    X,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/api";

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

    const [summary, setSummary] = useState<any>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);

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

        const loadDashboardSummary = async () => {
            setIsSummaryLoading(true);
            try {
                const res = await api.get("/admin/dashboard/summary");
                setSummary(res.data.data);
            } catch (err) {
                console.error("Failed to load dashboard summary:", err);
            } finally {
                setIsSummaryLoading(false);
            }
        };

        loadDashboardOptions();
        loadDashboardSummary();
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
            value: isSummaryLoading
                ? "..."
                : (summary?.total_billboards?.toString() ?? "0"),
            description: "Semua titik reklame terdaftar",
            icon: MapPin,
        },
        {
            title: "Pemesanan Aktif",
            value: isSummaryLoading
                ? "..."
                : (summary?.active_rentals?.toString() ?? "0"),
            description: "Kontrak sewa sedang berjalan",
            icon: Calendar,
        },
        {
            title: "Total Klien",
            value: isSummaryLoading
                ? "..."
                : (summary?.total_clients?.toString() ?? "0"),
            description: "Mitra/klien terdaftar",
            icon: Users,
        },
        {
            title: "Total Pendapatan",
            value: isSummaryLoading
                ? "..."
                : "Rp " +
                  Number(summary?.total_revenue ?? 0).toLocaleString("id-ID"),
            description: "Akumulasi pembayaran lunas",
            icon: TrendingUp,
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
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                            {/* Stats Cards */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {stats.map((stat, index) => {
                                    const Icon = stat.icon;
                                    return (
                                        <Card key={index}>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    {stat.title}
                                                </CardTitle>
                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {stat.value}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {stat.description}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Charts */}
                            <div className="px-0">
                                <ChartAreaInteractive />
                            </div>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Aksi Cepat</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        <button
                                            onClick={() =>
                                                setShowClientModal(true)
                                            }
                                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                        >
                                            Tambah Klien
                                        </button>
                                        <button
                                            onClick={() =>
                                                setShowRentalModal(true)
                                            }
                                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                        >
                                            Tambah Penyewaan
                                        </button>
                                        <Link
                                            to="/dashboard/billboards"
                                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                        >
                                            Tambah Billboard
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Bookings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pemesanan Terbaru</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-gray-50">
                                                <TableRow>
                                                    <TableHead className="font-semibold">
                                                        ID Booking
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Klien
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Billboard
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Durasi
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Total Harga
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Status Sewa
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Pembayaran
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {isSummaryLoading ? (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={7}
                                                            className="h-24 text-center"
                                                        >
                                                            Memuat data...
                                                        </TableCell>
                                                    </TableRow>
                                                ) : summary?.recent_bookings
                                                      ?.length > 0 ? (
                                                    summary.recent_bookings.map(
                                                        (booking: any) => (
                                                            <TableRow
                                                                key={booking.id}
                                                                className="hover:bg-gray-50"
                                                            >
                                                                <TableCell className="font-medium text-blue-600">
                                                                    {
                                                                        booking.booking_code
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-sm">
                                                                    {
                                                                        booking.client
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-sm">
                                                                    {
                                                                        booking.billboard
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-sm">
                                                                    {
                                                                        booking.duration
                                                                    }
                                                                    <br />
                                                                    <span className="text-xs text-gray-500">
                                                                        {
                                                                            booking.start_date
                                                                        }{" "}
                                                                        s/d{" "}
                                                                        {
                                                                            booking.end_date
                                                                        }
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="font-semibold">
                                                                    {
                                                                        booking.amount
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        className={cn(
                                                                            "gap-1 px-2 py-0.5 font-medium",
                                                                            booking.status ===
                                                                                "active"
                                                                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100/80"
                                                                                : booking.status ===
                                                                                    "completed"
                                                                                  ? "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
                                                                                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
                                                                        )}
                                                                    >
                                                                        {booking.status
                                                                            .toUpperCase()
                                                                            .replaceAll(
                                                                                "_",
                                                                                " ",
                                                                            )}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        className={cn(
                                                                            "gap-1 px-2 py-0.5 font-medium",
                                                                            booking.payment ===
                                                                                "paid"
                                                                                ? "bg-green-100 text-green-800 hover:bg-green-100/80"
                                                                                : "bg-red-100 text-red-800 hover:bg-red-100/80",
                                                                        )}
                                                                    >
                                                                        {booking.payment.toUpperCase()}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )
                                                ) : (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={7}
                                                            className="h-24 text-center"
                                                        >
                                                            Tidak ada booking
                                                            terbaru.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
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
