import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Pages/dashboard';
import Login from './Pages/login';
import { TooltipProvider } from "@/components/ui/tooltip";

const container = document.getElementById('app');

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <TooltipProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        {/* Redirect sembarang rute ke login jika tidak ditemukan */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </React.StrictMode>
    );
}
