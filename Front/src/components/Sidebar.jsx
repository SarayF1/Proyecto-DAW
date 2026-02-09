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
];

const drawerWidth = 240;

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation(); // Para resaltar la ruta activa

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
            <Toolbar /> {/* Espacio para que no tape el AppBar */}
            <Divider />
            <List>
                {menu.map((item) => (
                    <ListItemButton
                        key={item.path}
                        selected={location.pathname === item.path} // Resalta activo
                        onClick={() => navigate(item.path)}
                    >
                        <ListItemText primary={item.label} />
                    </ListItemButton>
                ))}
            </List>
        </Drawer>
    );
}
