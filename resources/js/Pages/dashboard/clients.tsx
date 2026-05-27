import React, { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { cn } from "@/lib/utils";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    Mail,
    Phone,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Search,
} from "lucide-react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import { useDebounce } from "@/hooks/use-debounce";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    fetchClients,
    deleteClient,
    ClientData,
} from "@/features/client/client-api";
import AddClientModal from "@/features/client/AddClientModal";
import EditClientModal from "@/features/client/EditClientModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { toast } from "sonner";

const columnHelper = createColumnHelper<ClientData>();

export default function ClientsPage() {
    const [clients, setClients] = useState<ClientData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingClient, setEditingClient] = useState<ClientData | null>(null);
    const [deletingClient, setDeletingClient] = useState<ClientData | null>(
        null,
    );
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);

    useEffect(() => {
        let isMounted = true;

        const loadClients = async () => {
            setIsLoading(true);
            try {
                const data = await fetchClients();
                if (!isMounted) return;
                setClients(data);
            } catch (error) {
                if (!isMounted) return;
                console.error("Failed to load clients:", error);
                toast.error("Gagal memuat data klien.");
            } finally {
                if (!isMounted) return;
                setIsLoading(false);
            }
        };

        loadClients();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleDeleteClient = async (id: string) => {
        try {
            await deleteClient(id);
            setClients((prev) => prev.filter((c) => c.id !== id));
            toast.success("Klien berhasil dihapus.");
        } catch (error) {
            console.error("Failed to delete client:", error);
            toast.error("Gagal menghapus klien.");
        } finally {
            setDeletingClient(null);
        }
    };

    const columns = React.useMemo(
        () => [
            columnHelper.accessor("name", {
                header: "Nama Klien",
                cell: (info) => (
                    <span className="font-medium">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("email", {
                header: "Kontak",
                cell: (info) => (
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-500" />
                            {info.row.original.email}
                        </div>
                        <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-500" />
                            {info.row.original.phone}
                        </div>
                    </div>
                ),
            }),
            columnHelper.accessor("city", {
                header: "Kota",
                cell: (info) => (
                    <span className="text-sm">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("totalRentals", {
                header: "Total Rental",
                cell: (info) => (
                    <span className="text-sm">{info.getValue()} kali</span>
                ),
            }),
            columnHelper.accessor("joinDate", {
                header: "Tanggal Bergabung",
                cell: (info) => (
                    <span className="text-sm">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("status", {
                header: "Status",
                cell: (info) => {
                    const status = info.getValue();
                    const isActive = status === "Active";
                    return (
                        <Badge
                            className={cn(
                                "gap-1 px-2 py-0.5 font-medium",
                                isActive
                                    ? "bg-green-100 text-green-800 hover:bg-green-100/80"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-100/80",
                            )}
                        >
                            {isActive ? (
                                <CheckCircle2 className="h-3 w-3" />
                            ) : (
                                <XCircle className="h-3 w-3" />
                            )}
                            {status}
                        </Badge>
                    );
                },
            }),
            columnHelper.display({
                id: "actions",
                header: () => <div className="text-right">Aksi</div>,
                cell: (info) => (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() =>
                                        setEditingClient(info.row.original)
                                    }
                                >
                                    <Edit2 className="mr-2 h-4 w-4 text-orange-600" />
                                    <span>Edit Klien</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() =>
                                        setDeletingClient(info.row.original)
                                    }
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Hapus Klien</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            }),
        ],
        [setEditingClient, setDeletingClient],
    );

    const table = useReactTable({
        data: clients,
        columns,
        state: {
            globalFilter: debouncedSearch,
        },
        onGlobalFilterChange: setSearchTerm,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: (row, columnId, filterValue) => {
            const name = String(row.getValue("name")).toLowerCase();
            const email = String(row.getValue("email")).toLowerCase();
            const search = String(filterValue).toLowerCase();
            return name.includes(search) || email.includes(search);
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    return (
        <DashboardLayout title="Manajemen Klien">
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">
                                Total Klien
                            </p>
                            <p className="text-3xl font-bold text-blue-600">
                                {isLoading ? (
                                    <Skeleton className="h-9 w-12 mx-auto" />
                                ) : (
                                    clients.length
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">
                                Klien Aktif
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                                {isLoading ? (
                                    <Skeleton className="h-9 w-12 mx-auto" />
                                ) : (
                                    clients.filter((c) => c.status === "Active")
                                        .length
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">
                                Klien Baru (Bulan Ini)
                            </p>
                            <p className="text-3xl font-bold text-orange-600">
                                {isLoading ? (
                                    <Skeleton className="h-9 w-12 mx-auto" />
                                ) : (
                                    clients.filter((c) => {
                                        const joinDate = new Date(c.joinDate);
                                        const now = new Date();
                                        return (
                                            joinDate.getMonth() ===
                                                now.getMonth() &&
                                            joinDate.getFullYear() ===
                                                now.getFullYear()
                                        );
                                    }).length
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Daftar Klien
                    </CardTitle>
                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari klien..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Klien
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                className="font-semibold"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <>
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-32" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-10 w-40" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-24" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-16" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-24" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-6 w-20 rounded-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-8 w-8 rounded-md float-right" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                ) : table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            className="hover:bg-gray-50"
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            Tidak ada data klien.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-2 py-2">
                        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                            {table.getFilteredRowModel().rows.length} total
                            baris.
                        </div>
                        <div className="flex w-full items-center gap-8 lg:w-fit">
                            <div className="hidden items-center gap-2 lg:flex">
                                <Label
                                    htmlFor="rows-per-page"
                                    className="text-sm font-medium"
                                >
                                    Baris per halaman
                                </Label>
                                <Select
                                    value={`${table.getState().pagination.pageSize}`}
                                    onValueChange={(value) => {
                                        table.setPageSize(Number(value));
                                    }}
                                >
                                    <SelectTrigger
                                        className="h-8 w-20"
                                        id="rows-per-page"
                                    >
                                        <SelectValue
                                            placeholder={
                                                table.getState().pagination
                                                    .pageSize
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        {[10, 20, 30, 40, 50].map(
                                            (pageSize) => (
                                                <SelectItem
                                                    key={pageSize}
                                                    value={`${pageSize}`}
                                                >
                                                    {pageSize}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex w-fit items-center justify-center text-sm font-medium">
                                Halaman{" "}
                                {table.getState().pagination.pageIndex + 1} dari{" "}
                                {table.getPageCount()}
                            </div>
                            <div className="ml-auto flex items-center gap-2 lg:ml-0">
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <span className="sr-only">
                                        Halaman pertama
                                    </span>
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <span className="sr-only">
                                        Halaman sebelumnya
                                    </span>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <span className="sr-only">
                                        Halaman selanjutnya
                                    </span>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={() =>
                                        table.setPageIndex(
                                            table.getPageCount() - 1,
                                        )
                                    }
                                    disabled={!table.getCanNextPage()}
                                >
                                    <span className="sr-only">
                                        Halaman terakhir
                                    </span>
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {showAddModal && (
                <AddClientModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={(newClient) => {
                        setClients([newClient, ...clients]);
                        setShowAddModal(false);
                    }}
                />
            )}

            {editingClient && (
                <EditClientModal
                    client={editingClient}
                    onClose={() => setEditingClient(null)}
                    onSuccess={(updatedClient) => {
                        setClients(
                            clients.map((c) =>
                                c.id === updatedClient.id ? updatedClient : c,
                            ),
                        );
                        setEditingClient(null);
                    }}
                />
            )}

            <DeleteConfirmDialog
                open={!!deletingClient}
                onOpenChange={(open) => !open && setDeletingClient(null)}
                onConfirm={() =>
                    deletingClient && handleDeleteClient(deletingClient.id)
                }
                title="Hapus Klien?"
                description={`Tindakan ini tidak dapat dibatalkan. Ini akan secara permanen menghapus klien ${deletingClient?.name} beserta seluruh riwayat transaksinya dari server.`}
                confirmText="Ya, Hapus"
            />
        </DashboardLayout>
    );
}
