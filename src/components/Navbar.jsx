// src/components/Navbar.jsx
import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function Navbar({ onMenuClick }) {
    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { sm: "none" } }} // solo en móvil
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div">
                    MyParking
                </Typography>
            </Toolbar>
        </AppBar>
    );
}
