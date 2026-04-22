import React from "react";
import DashboardLayout from "@/layouts/dashboard-layout";

export default function BillboardsPage() {
    return (
        <DashboardLayout title="Katalog Billboard">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-muted/50 border flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                        Stats: Total Titik (120)
                    </span>
                </div>
                <div className="aspect-video rounded-xl bg-muted/50 border flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                        Stats: Available (15)
                    </span>
                </div>
                <div className="aspect-video rounded-xl bg-muted/50 border flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                        Stats: Expiring (5)
                    </span>
                </div>
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4 border overflow-hidden">
                <h3 className="text-lg font-semibold mb-4">
                    Daftar Titik Billboard
                </h3>
                <div className="text-sm text-muted-foreground italic">
                    Tabel daftar billboard akan muncul di sini...
                </div>
            </div>
        </DashboardLayout>
    );
}
