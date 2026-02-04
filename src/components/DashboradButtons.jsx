// src/components/DashboardButtons.jsx
import { Grid, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function DashboardButtons() {
    const navigate = useNavigate();

    const buttons = [
        { label: "Parquímetro", path: "/parquimetro" },
        { label: "Parkings", path: "/parkings" },
        { label: "Recargas", path: "/wallet" },
        { label: "Guardar ubicación", path: "/home" },
    ];

    return (
        <Grid container spacing={2}>
            {buttons.map((btn) => (
                <Grid item xs={12} md={3} key={btn.label}>
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ p: 2, height: 80 }}
                        onClick={() => navigate(btn.path)}
                    >
                        {btn.label}
                    </Button>
                </Grid>
            ))}
        </Grid>
    );
}
