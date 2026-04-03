// src/components/Sidebar.jsx
import {
    Drawer,
    List,
    ListItemButton,
    ListItemText,
    Toolbar,
    Divider,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const menu = [
    { label: "Mapa", path: "/home" },
    { label: "Mi cuenta", path: "/account" },
    { label: "Vehículos", path: "/vehicles" },
    { label: "Monedero", path: "/wallet" },
    { label: "Facturas", path: "/invoices" },
    { label: "Configuración", path: "/settings" },
    { label: "🔒 Admin", path: "/admin" },
];

const drawerWidth = 240;

// ✅ Componente MenuContent - DEBE estar ANTES de Sidebar
const MenuContent = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem("token");
    let isAdmin = false;

    try {
        if (token) {
            const payload = JSON.parse(atob(token.split(".")[1]));
            isAdmin = payload?.rol === "ADMIN";
        }
    } catch {
        isAdmin = false;
    }

    return (
        <>
            <Toolbar />
            <Divider />
            <List>
                {menu.map((item) => {
                    if (item.path === "/admin" && !isAdmin) return null;

                    return (
                        <ListItemButton
                            key={item.path}
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                        >
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    );
                })}
            </List>
        </>
    );
};

// ✅ Componente principal Sidebar
export default function Sidebar({ noDrawer = false }) {
    // Si noDrawer es true → solo retorna el contenido del menú
    if (noDrawer) {
        return <MenuContent />;
    }

    // Si no → retorna el contenido dentro del Drawer permanente
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: "border-box",
                },
                display: { xs: "none", sm: "block" }, // oculto en móviles
            }}
        >
            <MenuContent />
        </Drawer>
    );
}

