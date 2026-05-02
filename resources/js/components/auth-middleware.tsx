import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Middleware untuk memproteksi rute yang membutuhkan login.
 */
export function ProtectedRoute() {
    const token = localStorage.getItem("admin_token");

    if (!token) {
        // Jika tidak ada token, tendang ke login
        return <Navigate to="/" replace />;
    }

    // Jika ada token, izinkan masuk ke rute anak (Outlet)
    return <Outlet />;
}

/**
 * Middleware untuk rute publik (seperti Login) agar tidak bisa diakses jika sudah login.
 */
export function PublicRoute() {
    const token = localStorage.getItem("admin_token");

    if (token) {
        // Jika sudah login tapi coba buka halaman login, lempar ke dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
