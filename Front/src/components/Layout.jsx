// src/components/Layout.jsx
import { Box, Drawer } from "@mui/material";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ActiveReservationBanner from "./ActiveReservationBanner";
import { Outlet } from "react-router-dom";

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box display="flex" height="100vh">
            {/* Sidebar escritorio */}
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box" },
                    display: { xs: "none", sm: "block" },
                }}
                open
            >
                <Sidebar />
            </Drawer>

            {/* Sidebar móvil */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", sm: "none" },
                    [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box" },
                }}
            >
                <Sidebar noDrawer />
            </Drawer>

            {/* Contenido principal */}
            <Box flex={1} display="flex" flexDirection="column" sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
                <Navbar onMenuClick={handleDrawerToggle} />
                <Box p={3} flex={1} overflow="auto" sx={{ bgcolor: "background.default" }}>
                    <Outlet />
                </Box>
            </Box>

            {/* Widget flotante de reserva activa — fuera del flujo, no ocupa espacio */}
            <ActiveReservationBanner />
        </Box>
    );
}