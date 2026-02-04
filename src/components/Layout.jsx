// src/components/Layout.jsx
import { Box, Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box display="flex" height="100vh">
            {/* Sidebar para escritorio */}
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box" },
                    display: { xs: "none", sm: "block" }, // ocultar en XS
                }}
                open
            >
                <Sidebar />
            </Drawer>

            {/* Sidebar para móvil */}
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
                <Sidebar />
            </Drawer>

            {/* Contenido principal */}
            <Box flex={1} display="flex" flexDirection="column">
                {/* Navbar con botón para abrir Sidebar en móvil */}
                <Navbar onMenuClick={handleDrawerToggle} />
                <Box p={3} flex={1} overflow="auto">
                    <Outlet /> {/* Aquí se renderizan las páginas hijas */}
                </Box>
            </Box>
        </Box>
    );
}
