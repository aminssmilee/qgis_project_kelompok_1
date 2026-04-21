import React from "react";
import DashboardLayout from "@/layouts/dashboard-layout";

export default function RentalsPage() {
    return (
        <DashboardLayout title="Penyewaan & Kontrak">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Manajemen Penyewaan</h2>
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4 border">
                <p className="text-muted-foreground italic">Daftar kontrak aktif dan histori penyewaan...</p>
            </div>
        </DashboardLayout>
    );
}
