import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute: React.FC = () => {
    // Checamos si existe el JWT en el localStorage
    const token = localStorage.getItem('token');

    // Si no hay token, lo redirigimos al login usando 'replace' para limpiar el historial de navegación
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Si sí hay token, renderiza las rutas hijas usando <Outlet />
    return <Outlet />;
};