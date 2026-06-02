import React, { useState } from "react";
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
import {
    Plus,
    Edit2,
    Trash2,
    Eye,
    Search,
    MoreHorizontal,
    MapPin,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    fetchBillboards,
    deleteBillboard,
} from "@/features/billboard/billboard-api";
import AddBillboardModal from "@/features/billboard/AddBillboardModal";
import EditBillboardModal from "@/features/billboard/EditBillboardModal";
import DetailBillboardModal from "@/features/billboard/DetailBillboardModal";
import { Billboard } from "@/features/billboard/types";

interface DashboardBillboard extends Billboard {
    location: string;
    category: string;
    traffic: string;
    status: "Available" | "Booked" | "Maintenance" | string;
}

const columnHelper = createColumnHelper<DashboardBillboard>();

export default function BillboardsPage() {
    const [billboards, setBillboards] = React.useState<DashboardBillboard[]>(
        [],
    );
    const [isLoading, setIsLoading] = React.useState(true);
    const [viewingBillboard, setViewingBillboard] =
        React.useState<Billboard | null>(null);
    const [editingBillboard, setEditingBillboard] =
        React.useState<Billboard | null>(null);
    const [deletingBillboardId, setDeletingBillboardId] = React.useState<
        string | number | null
    >(null);
    const [searchTerm, setSearchTerm] = React.useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);

    React.useEffect(() => {
        let isMounted = true;
        setIsLoading(true);

        fetchBillboards()
            .then((data) => {
                if (!isMounted) return;
                const mapped = data.map((b) => ({
                    id: b.id,
                    name: b.name,
                    location: b.address, // For the table
                    address: b.address, // For the modal
                    lat: b.lat,
                    lng: b.lng,
                    photo_url: b.photo_url,
                    size: b.size ?? "—",
                    category: b.category ?? "Umum",
                    traffic:
                        b.traffic_density === "high"
                            ? "Tinggi"
                            : b.traffic_density === "very_high"
                              ? "Sangat Tinggi"
                              : "Sedang",
                    price: b.price_label ?? "—",
                    status: b.is_active ? "Available" : "Maintenance",
                }));
                setBillboards(mapped);
            })
            .catch((err) => console.error("Failed to fetch billboards:", err))
            .finally(() => {
                if (!isMounted) return;
                setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleDeleteConfirm = async () => {
        if (!deletingBillboardId) return;

        try {
            await deleteBillboard(deletingBillboardId.toString());
            setBillboards((prev) =>
                prev.filter((b) => b.id !== deletingBillboardId),
            );
            setDeletingBillboardId(null);
            toast.success("Billboard berhasil dihapus");
        } catch (error) {
            console.error("Failed to delete billboard:", error);
            toast.error("Gagal menghapus billboard.");
            setDeletingBillboardId(null);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "Available":
                return {
                    color: "bg-green-100 text-green-800 hover:bg-green-100/80",
                    icon: <CheckCircle2 className="h-3 w-3" />,
                };
            case "Booked":
                return {
                    color: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
                    icon: <Clock className="h-3 w-3" />,
                };
            case "Maintenance":
                return {
                    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
                    icon: <AlertCircle className="h-3 w-3" />,
                };
            default:
                return {
                    color: "bg-gray-100 text-gray-800 hover:bg-gray-100/80",
                    icon: <XCircle className="h-3 w-3" />,
                };
        }
    };

    const columns = React.useMemo(
        () => [
            columnHelper.accessor("name", {
                header: "Nama",
                cell: (info) => (
                    <span className="font-medium">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("location", {
                header: "Lokasi",
                cell: (info) => (
                    <span className="text-sm">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("size", {
                header: "Ukuran",
                cell: (info) => (
                    <span className="text-sm">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("category", {
                header: "Kategori",
                cell: (info) => (
                    <Badge variant="outline" className="font-normal">
                        {info.getValue()}
                    </Badge>
                ),
            }),
            columnHelper.accessor("traffic", {
                header: "Traffic",
                cell: (info) => (
                    <span className="text-sm">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("price", {
                header: "Harga",
                cell: (info) => (
                    <span className="font-semibold">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("status", {
                header: "Status",
                cell: (info) => {
                    const config = getStatusConfig(info.getValue());
                    return (
                        <Badge
                            className={cn(
                                "gap-1 px-2 py-0.5 font-medium",
                                config.color,
                            )}
                        >
                            {config.icon}
                            {info.getValue()}
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
                                        setViewingBillboard(
                                            info.row.original as Billboard,
                                        )
                                    }
                                >
                                    <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                    <span>Detail Billboard</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        setEditingBillboard(
                                            info.row.original as Billboard,
                                        )
                                    }
                                >
                                    <Edit2 className="mr-2 h-4 w-4 text-orange-600" />
                                    <span>Edit Billboard</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() =>
                                        setDeletingBillboardId(
                                            info.row.original.id,
                                        )
                                    }
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Hapus Billboard</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            }),
        ],
        [setViewingBillboard, setEditingBillboard, setDeletingBillboardId],
    );

    const table = useReactTable({
        data: billboards,
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
            const location = String(row.getValue("location")).toLowerCase();
            const search = String(filterValue).toLowerCase();
            return name.includes(search) || location.includes(search);
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    const stats = React.useMemo(
        () => [
            {
                label: "Total Billboard",
                value: billboards.length.toString(),
                hint: "Semua lokasi",
                gradient: "from-[#0b2a6b] via-[#123c9a] to-[#1b4cc4]",
                icon: MapPin,
            },
            {
                label: "Available",
                value: billboards
                    .filter((b) => b.status === "Available")
                    .length.toString(),
                hint: "Siap sewa",
                gradient: "from-[#1f4fd2] via-[#2a63e6] to-[#2f6cff]",
                icon: CheckCircle2,
            },
            {
                label: "Booked",
                value: billboards
                    .filter((b) => b.status === "Booked")
                    .length.toString(),
                hint: "Sedang terpakai",
                gradient: "from-[#0b2a6b] via-[#143b9c] to-[#1c4fc9]",
                icon: Clock,
            },
            {
                label: "Maintenance",
                value: billboards
                    .filter((b) => b.status === "Maintenance")
                    .length.toString(),
                hint: "Perlu perhatian",
                gradient: "from-[#e14b47] via-[#e4524d] to-[#f06a60]",
                icon: AlertCircle,
            },
        ],
        [billboards],
    );

    return (
        <DashboardLayout
            title="Katalog Billboard"
            subtitle="Daftar seluruh aset billboard yang terdaftar"
        >
            <div className="grid gap-4 md:grid-cols-4 mb-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.label}
                            className={`border-0 bg-gradient-to-br ${stat.gradient} text-white`}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/40 bg-white/10">
                                        <Icon className="h-4 w-4 text-white" />
                                    </span>
                                </div>
                                <p className="mt-4 text-sm text-white/80">
                                    {stat.label}
                                </p>
                                <p className="text-3xl font-semibold">
                                    {stat.value}
                                </p>
                                <span className="mt-3 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/80">
                                    {stat.hint}
                                </span>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle>Daftar Billboard</CardTitle>
                        <p className="text-xs text-slate-500">
                            Pantau status, lokasi, dan harga billboard
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari billboard..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white/90 py-2 pl-9 pr-3 text-sm shadow-sm transition focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                        {/* <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Tambah Billboard
                        </Button> */}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-xl border border-slate-200/70 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
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
                                                    <Skeleton className="h-4 w-3/4" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-1/2" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-20" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-1/4" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-1/2" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-6 w-24 rounded-full" />
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
                                            className="hover:bg-slate-50"
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
                                            Tidak ada data billboard.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-2 py-2">
                        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                            {table.getFilteredSelectedRowModel().rows.length} of{" "}
                            {table.getFilteredRowModel().rows.length} row(s)
                            selected.
                        </div>
                        <div className="flex w-full items-center gap-8 lg:w-fit">
                            <div className="hidden items-center gap-2 lg:flex">
                                <Label
                                    htmlFor="rows-per-page"
                                    className="text-sm font-medium"
                                >
                                    Baris
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
                                Hal {table.getState().pagination.pageIndex + 1}{" "}
                                dari {table.getPageCount()}
                            </div>
                            <div className="ml-auto flex items-center gap-2 lg:ml-0">
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <span className="sr-only">
                                        Go to first page
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
                                        Go to previous page
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
                                        Go to next page
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
                                        Go to last page
                                    </span>
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {editingBillboard && (
                <EditBillboardModal
                    billboard={editingBillboard}
                    onUpdate={(updatedBB) => {
                        setBillboards((prev) =>
                            prev.map((bb) =>
                                bb.id === updatedBB.id
                                    ? {
                                          ...bb,
                                          name: updatedBB.name,
                                          location: updatedBB.address,
                                          size: updatedBB.size,
                                          price: updatedBB.price,
                                      }
                                    : bb,
                            ),
                        );
                        setEditingBillboard(null);
                    }}
                    onClose={() => setEditingBillboard(null)}
                />
            )}

            {viewingBillboard && (
                <DetailBillboardModal
                    billboard={viewingBillboard}
                    onClose={() => setViewingBillboard(null)}
                />
            )}

            <AlertDialog
                open={!!deletingBillboardId}
                onOpenChange={(open) => {
                    if (!open) setDeletingBillboardId(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Billboard</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus billboard ini?
                            Tindakan ini tidak dapat dibatalkan dan akan
                            menghapus data secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
