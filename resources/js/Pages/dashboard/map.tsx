import React from "react";
import DashboardLayout from "@/layouts/dashboard-layout";

export default function MapPage() {
    return (
        <DashboardLayout title="Peta Billboard">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Peta Lokasi Billboard</h2>
                    <p className="text-muted-foreground">Area ini akan menampilkan peta interaktif GIS (QGIS Integration).</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
