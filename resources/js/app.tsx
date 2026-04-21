import "../css/app.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Pages/dashboard";
import Login from "./Pages/login";
import MapPage from "./Pages/dashboard/map";
import BillboardsPage from "./Pages/dashboard/billboards";
import RentalsPage from "./Pages/dashboard/rentals";
import ClientsPage from "./Pages/dashboard/clients";
import UsersPage from "./Pages/dashboard/users";
import { TooltipProvider } from "@/components/ui/tooltip";

const container = document.getElementById("app");

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <TooltipProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/dashboard/map" element={<MapPage />} />
                        <Route
                            path="/dashboard/billboards"
                            element={<BillboardsPage />}
                        />
                        <Route path="/dashboard/rentals" element={<RentalsPage />} />
                        <Route path="/dashboard/clients" element={<ClientsPage />} />
                        <Route path="/dashboard/users" element={<UsersPage />} />
                        {/* Redirect sembarang rute ke login jika tidak ditemukan */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </React.StrictMode>,
    );
}
