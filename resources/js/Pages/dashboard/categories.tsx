import { useState, useEffect, useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
    Plus,
    Edit2,
    Trash2,
    Package,
    Tag,
    Layers,
    MoreHorizontal,
    Search,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import FormModal from "@/components/shared/FormModal";

interface CategoryData {
    id: string;
    name: string;
    icon: string;
    description: string;
    billboards_count: number;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryData | null>(
        null,
    );
    const [deletingCategory, setDeletingCategory] =
        useState<CategoryData | null>(null);

    // Form fields
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("Package");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let isMounted = true;
        loadCategories(isMounted);
        return () => {
            isMounted = false;
        };
    }, []);

    const loadCategories = async (isMounted = true) => {
        setIsLoading(true);
        try {
            const response = await api.get("/admin/categories");
            if (response.data?.status === "success") {
                if (isMounted) {
                    setCategories(response.data.data);
                }
            }
        } catch (error) {
            console.error("Failed to load categories:", error);
            if (isMounted) {
                toast.error("Gagal memuat kategori.");
            }
        } finally {
            if (isMounted) {
                setIsLoading(false);
            }
        }
    };

    const handleOpenCreate = () => {
        setEditingCategory(null);
        setName("");
        setIcon("Package");
        setDescription("");
        setIsFormOpen(true);
    };

    const handleOpenEdit = (category: CategoryData) => {
        setEditingCategory(category);
        setName(category.name);
        setIcon(category.icon || "Package");
        setDescription(category.description || "");
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Nama kategori wajib diisi.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { name, icon, description };
            if (editingCategory) {
                // Update
                const response = await api.put(
                    `/admin/categories/${editingCategory.id}`,
                    payload,
                );
                if (response.data?.status === "success") {
                    toast.success("Kategori berhasil diperbarui");
                    loadCategories();
                    setIsFormOpen(false);
                }
            } else {
                // Create
                const response = await api.post("/admin/categories", payload);
                if (response.data?.status === "success") {
                    toast.success("Kategori berhasil ditambahkan");
                    loadCategories();
                    setIsFormOpen(false);
                }
            }
        } catch (error: any) {
            console.error("Failed to save category:", error);
            const errMsg =
                error.response?.data?.message || "Gagal menyimpan kategori.";
            toast.error(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (!deletingCategory) return;
        try {
            const response = await api.delete(
                `/admin/categories/${deletingCategory.id}`,
            );
            if (response.data?.status === "success") {
                toast.success("Kategori berhasil dihapus");
                loadCategories();
            }
        } catch (error: any) {
            console.error("Failed to delete category:", error);
            const errMsg =
                error.response?.data?.message || "Gagal menghapus kategori.";
            toast.error(errMsg);
        } finally {
            setDeletingCategory(null);
        }
    };

    // Filter categories based on search
    const filteredCategories = useMemo(() => {
        const query = searchTerm.toLowerCase();
        return categories.filter((cat) => {
            return (
                cat.name.toLowerCase().includes(query) ||
                (cat.description &&
                    cat.description.toLowerCase().includes(query))
            );
        });
    }, [categories, searchTerm]);

    // Total billboards across all categories
    const totalBillboardsCount = useMemo(() => {
        return categories.reduce((sum, cat) => sum + cat.billboards_count, 0);
    }, [categories]);

    return (
        <DashboardLayout title="Manajemen Kategori">
            {/* Header Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                <Layers className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Kategori
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {categories.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                <Package className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Billboard Terkait
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {totalBillboardsCount}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                <Tag className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Rata-rata per Kategori
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {categories.length > 0
                                        ? (
                                              totalBillboardsCount /
                                              categories.length
                                          ).toFixed(1)
                                        : 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Daftar Kategori Billboard</CardTitle>
                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari kategori..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <Button onClick={handleOpenCreate} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Tambah Kategori
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="w-[80px]">
                                        Ikon
                                    </TableHead>
                                    <TableHead>Nama Kategori</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead className="text-center w-[150px]">
                                        Jumlah Billboard
                                    </TableHead>
                                    <TableHead className="text-right w-[100px]">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <Skeleton className="h-8 w-8 rounded-md" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-32" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-64" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-6 w-12 rounded-full mx-auto" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-8 w-8 rounded-md float-right" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                ) : filteredCategories.length > 0 ? (
                                    filteredCategories.map((cat) => (
                                        <TableRow
                                            key={cat.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <TableCell>
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                                    <Layers className="h-4 w-4" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-gray-900">
                                                {cat.name}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500 max-w-[300px] truncate">
                                                {cat.description || (
                                                    <span className="text-gray-400 italic">
                                                        Tidak ada deskripsi
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={
                                                        cat.billboards_count > 0
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {cat.billboards_count}{" "}
                                                    Billboard
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <span className="sr-only">
                                                                Open menu
                                                            </span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>
                                                            Pilihan
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleOpenEdit(
                                                                    cat,
                                                                )
                                                            }
                                                        >
                                                            <Edit2 className="mr-2 h-4 w-4 text-orange-600" />
                                                            <span>
                                                                Edit Kategori
                                                            </span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() =>
                                                                setDeletingCategory(
                                                                    cat,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>
                                                                Hapus Kategori
                                                            </span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center text-gray-500"
                                        >
                                            Tidak ada kategori ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Form Dialog */}
            {isFormOpen && (
                <FormModal
                    title={
                        editingCategory
                            ? "Edit Kategori Billboard"
                            : "Tambah Kategori Billboard"
                    }
                    onClose={() => setIsFormOpen(false)}
                >
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Nama Kategori *
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Contoh: Megatron, Videotron, Neon Box"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="icon"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Ikon (Nama Ikon Lucide)
                            </label>
                            <input
                                id="icon"
                                type="text"
                                placeholder="Contoh: Package, Layers, Map"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Deskripsi
                            </label>
                            <textarea
                                id="description"
                                placeholder="Berikan deskripsi singkat tentang kategori billboard ini..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsFormOpen(false)}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </FormModal>
            )}

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                open={!!deletingCategory}
                onOpenChange={(open) => !open && setDeletingCategory(null)}
                onConfirm={handleDeleteCategory}
                title="Hapus Kategori?"
                description={`Apakah Anda yakin ingin menghapus kategori "${deletingCategory?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus Kategori"
            />
        </DashboardLayout>
    );
}
