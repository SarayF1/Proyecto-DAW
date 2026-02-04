// src/pages/Account.jsx
import { Box, Typography, Paper, Divider, Avatar, Button, Chip, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Account() {
    const navigate = useNavigate();

    // Leer datos del usuario desde localStorage
    const user = JSON.parse(localStorage.getItem("user")) || {};

    // Función para simular actualización
    const actualizarDatos = () => {
        alert("Funcionalidad de actualización de datos aún no implementada");
    };

    // Definir color según plan
    const planColor = () => {
        switch (user.plan) {
            case "Residente anual": return "success";
            case "Residente mensual": return "primary";
            case "Invitado": return "default";
            default: return "warning";
        }
    };

    // Historial simulado
    const historial = [
        { action: "Pago parking Centro", date: "2026-01-15", amount: "2,00 €" },
        { action: "Recarga monedero", date: "2026-01-12", amount: "10,00 €" },
        { action: "Cambio de plan", date: "2026-01-01", amount: "-" }
    ];

    return (
        <Box p={3} display="flex" justifyContent="center">
            <Paper sx={{ p: 4, maxWidth: 700, width: "100%", boxShadow: 3, borderRadius: 2 }}>
                {/* Header con avatar */}
                <Box display="flex" alignItems="center" mb={3}>
                    <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: "primary.main" }}>
                        {user.nombre ? user.nombre[0].toUpperCase() : "U"}
                    </Avatar>
                    <Box>
                        <Typography variant="h5">{user.nombre || "Usuario no registrado"}</Typography>
                        <Typography variant="body2" color="text.secondary">{user.email || "No registrado"}</Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Información personal */}
                <Box mb={3}>
                    <Typography variant="h6" mb={1}>Información personal</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography><strong>Nombre:</strong> {user.nombre || "No registrado"}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography><strong>Email:</strong> {user.email || "No registrado"}</Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Plan */}
                <Box mb={3}>
                    <Typography variant="h6" mb={1}>Plan</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Chip 
                        label={user.plan || "No registrado"} 
                        color={planColor()} 
                        variant="outlined"
                    />
                </Box>

                {/* Historial */}
                <Box mb={3}>
                    <Typography variant="h6" mb={1}>Historial reciente</Typography>
                    <Divider sx={{ my: 1 }} />
                    {historial.map((h, index) => (
                        <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                            <Typography>{h.action}</Typography>
                            <Typography color="text.secondary">{h.date} - {h.amount}</Typography>
                        </Box>
                    ))}
                </Box>

                {/* Botón de actualizar */}
                <Box textAlign="center" mt={2}>
                    <Button variant="contained" color="primary" onClick={actualizarDatos}>
                        Actualizar datos
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
