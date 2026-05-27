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
    Plus,
    Edit2,
    Trash2,
    Shield,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
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
import { fetchUsers, deleteUser, UserData } from "@/features/user/user-api";
import AddUserModal from "@/features/user/AddUserModal";
import EditUserModal from "@/features/user/EditUserModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { toast } from "sonner";

const rolePermissions = {
    "Super Admin": [
        "Kelola semua billboard",
        "Kelola pengguna",
        "Lihat laporan",
        "Akses pengaturan",
    ],
    Admin: ["Kelola billboard", "Lihat laporan", "Verifikasi pembayaran"],
    Manager: ["Kelola billboard", "Lihat pemesanan"],
    Staff: ["Lihat data billboard", "Input informasi field"],
    user: ["Akses dashboard", "Lihat profil", "Lakukan pemesanan"],
};

const columnHelper = createColumnHelper<UserData>();

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserData | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);

    useEffect(() => {
        let isMounted = true;

        const loadUsers = async () => {
            try {
                const data = await fetchUsers();
                if (!isMounted) return;
                setUsers(data);
            } catch (error) {
                if (!isMounted) return;
                console.error("Failed to load users:", error);
                toast.error("Gagal memuat data pengguna.");
            } finally {
                if (!isMounted) return;
                setIsLoading(false);
            }
        };

        loadUsers();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleDeleteUser = async (id: string) => {
        try {
            await deleteUser(id);
            setUsers((prev) => prev.filter((u) => u.id !== id));
            toast.success("User berhasil dihapus.");
        } catch (error) {
            console.error("Failed to delete user:", error);
            toast.error("Gagal menghapus user.");
        } finally {
            setDeletingUser(null);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "Super Admin":
                return "bg-red-100 text-red-800";
            case "Admin":
                return "bg-blue-100 text-blue-800";
            case "Manager":
                return "bg-purple-100 text-purple-800";
            case "Staff":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
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
            columnHelper.accessor("email", {
                header: "Email",
                cell: (info) => (
                    <span className="text-sm">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("role", {
                header: "Role",
                cell: (info) => (
                    <Badge className={getRoleColor(info.getValue())}>
                        {info.getValue()}
                    </Badge>
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
            columnHelper.accessor("lastLogin", {
                header: "Last Login",
                cell: (info) => (
                    <span className="text-sm text-gray-500">
                        {info.getValue()}
                    </span>
                ),
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
                                        setEditingUser(info.row.original)
                                    }
                                >
                                    <Edit2 className="mr-2 h-4 w-4 text-orange-600" />
                                    <span>Edit User</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() =>
                                        setDeletingUser(info.row.original)
                                    }
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Hapus User</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            }),
        ],
        [setEditingUser, setDeletingUser],
    );

    const table = useReactTable({
        data: users,
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
        <DashboardLayout title="Pengaturan User">
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">
                                Total User
                            </p>
                            <p className="text-3xl font-bold text-blue-600">
                                {users.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">
                                User Aktif
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                                {
                                    users.filter((u) => u.status === "Active")
                                        .length
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">
                                Admin
                            </p>
                            <p className="text-3xl font-bold text-orange-600">
                                {
                                    users.filter(
                                        (u) =>
                                            u.role === "Super Admin" ||
                                            u.role === "Admin",
                                    ).length
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle>Daftar Pengguna</CardTitle>
                            <div className="flex items-center gap-3">
                                <div className="relative w-48">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari user..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => setShowModal(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah User
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        {table
                                            .getHeaderGroups()
                                            .map((headerGroup) => (
                                                <TableRow key={headerGroup.id}>
                                                    {headerGroup.headers.map(
                                                        (header) => (
                                                            <TableHead
                                                                key={header.id}
                                                                className="font-semibold"
                                                            >
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                          header
                                                                              .column
                                                                              .columnDef
                                                                              .header,
                                                                          header.getContext(),
                                                                      )}
                                                            </TableHead>
                                                        ),
                                                    )}
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
                                                            <Skeleton className="h-4 w-40" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Skeleton className="h-6 w-20 rounded-full" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Skeleton className="h-6 w-20 rounded-full" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Skeleton className="h-4 w-24" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Skeleton className="h-8 w-8 rounded-md float-right" />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </>
                                        ) : table.getRowModel().rows.length >
                                          0 ? (
                                            table
                                                .getRowModel()
                                                .rows.map((row) => (
                                                    <TableRow
                                                        key={row.id}
                                                        className="hover:bg-gray-50 cursor-pointer"
                                                        onClick={() =>
                                                            setSelectedRole(
                                                                row.original
                                                                    .role,
                                                            )
                                                        }
                                                    >
                                                        {row
                                                            .getVisibleCells()
                                                            .map((cell) => (
                                                                <TableCell
                                                                    key={
                                                                        cell.id
                                                                    }
                                                                >
                                                                    {flexRender(
                                                                        cell
                                                                            .column
                                                                            .columnDef
                                                                            .cell,
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
                                                    Tidak ada data pengguna.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-2 py-2">
                                <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                                    {
                                        table.getFilteredSelectedRowModel().rows
                                            .length
                                    }{" "}
                                    of {table.getFilteredRowModel().rows.length}{" "}
                                    row(s) selected.
                                </div>
                                <div className="flex w-full items-center gap-8 lg:w-fit">
                                    <div className="hidden items-center gap-2 lg:flex">
                                        <Label
                                            htmlFor="rows-per-page"
                                            className="text-sm font-medium"
                                        >
                                            Rows per page
                                        </Label>
                                        <Select
                                            value={`${table.getState().pagination.pageSize}`}
                                            onValueChange={(value) => {
                                                table.setPageSize(
                                                    Number(value),
                                                );
                                            }}
                                        >
                                            <SelectTrigger
                                                className="h-8 w-20"
                                                id="rows-per-page"
                                            >
                                                <SelectValue
                                                    placeholder={
                                                        table.getState()
                                                            .pagination.pageSize
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
                                        Page{" "}
                                        {table.getState().pagination.pageIndex +
                                            1}{" "}
                                        of {table.getPageCount()}
                                    </div>
                                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                                        <Button
                                            variant="outline"
                                            className="hidden h-8 w-8 p-0 lg:flex"
                                            onClick={() =>
                                                table.setPageIndex(0)
                                            }
                                            disabled={
                                                !table.getCanPreviousPage()
                                            }
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
                                            disabled={
                                                !table.getCanPreviousPage()
                                            }
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
                </div>

                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Jenis Role
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(rolePermissions).map(
                                    ([role, permissions]) => (
                                        <div
                                            key={role}
                                            onClick={() =>
                                                setSelectedRole(role)
                                            }
                                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                                selectedRole === role
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <Badge
                                                className={getRoleColor(role)}
                                            >
                                                {role}
                                            </Badge>
                                        </div>
                                    ),
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {selectedRole && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Permission: {selectedRole}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {(rolePermissions as any)[
                                        selectedRole
                                    ]?.map(
                                        (permission: string, idx: number) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-2"
                                            >
                                                <span className="text-green-600 font-bold">
                                                    ✓
                                                </span>
                                                <span className="text-sm">
                                                    {permission}
                                                </span>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {showModal && (
                <AddUserModal
                    onClose={() => setShowModal(false)}
                    onSuccess={(newUser) => {
                        setUsers([newUser, ...users]);
                        setShowModal(false);
                    }}
                />
            )}
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={(updatedUser) => {
                        setUsers(
                            users.map((u) =>
                                u.id === updatedUser.id ? updatedUser : u,
                            ),
                        );
                        setEditingUser(null);
                    }}
                />
            )}

            <DeleteConfirmDialog
                open={!!deletingUser}
                onOpenChange={(open) => !open && setDeletingUser(null)}
                onConfirm={() =>
                    deletingUser && handleDeleteUser(deletingUser.id)
                }
                title="Hapus User?"
                description={`Tindakan ini tidak dapat dibatalkan. Ini akan secara permanen menghapus user ${deletingUser?.name} dan menghapus datanya dari server.`}
                confirmText="Ya, Hapus"
            />
        </DashboardLayout>
    );
}
