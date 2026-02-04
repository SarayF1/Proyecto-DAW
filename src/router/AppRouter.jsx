// src/router/AppRouter.jsx
import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages/Home";
import Account from "../pages/Account";
import Vehicles from "../pages/Vehicles";
import Wallet from "../pages/Wallet";
import Invoices from "../pages/Invoices";
import Settings from "../pages/Settings";
import Parquimetro from "../pages/Parquimetro"; 
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";

export default function AppRouter() {
    return (
        <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="home" element={<Home />} />
                <Route path="parquimetro" element={<Parquimetro />} />
                <Route path="account" element={<Account />} />
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="wallet" element={<Wallet />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            {/* Ruta comodín para 404 */}
            <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
        </Routes>
    );
}
