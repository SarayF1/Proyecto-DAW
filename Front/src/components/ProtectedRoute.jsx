// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

// Simulación de autenticación
const isAuthenticated = () => {
    // Aquí podrías leer un token de localStorage o contexto Auth
    return localStorage.getItem("token") ? true : false;
};

export default function ProtectedRoute({ children }) {
    if (!isAuthenticated()) {
        // Redirige al login si no está autenticado
        return <Navigate to="/" replace />;
    }
    return children;
}
