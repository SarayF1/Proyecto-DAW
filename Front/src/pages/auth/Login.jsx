// src/pages/auth/Login.jsx
import { Button, TextField, Box, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    const handleLogin = () => {
        // Simulación de login
        localStorage.setItem("token", "12345"); // Guardar token
        navigate("/home"); // Redirigir al home
    };

    return (
        <Box
            display="flex"
            height="100vh"
            justifyContent="center"
            alignItems="center"
            bgcolor="#f5f5f5"
        >
            <Paper sx={{ p: 4, width: 350 }}>
                <Typography variant="h5" mb={3} textAlign="center">
                    MyParking 🚗
                </Typography>

                <TextField
                    fullWidth
                    label="Correo"
                    margin="normal"
                    variant="outlined"
                />
                <TextField
                    fullWidth
                    label="Contraseña"
                    type="password"
                    margin="normal"
                    variant="outlined"
                />

                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    type="button"
                    onClick={handleLogin}
                >
                    Iniciar sesión
                </Button>

                <Button
                    fullWidth
                    variant="text"
                    color="primary"
                    sx={{ mt: 1 }}
                    type="button"
                    onClick={() => navigate("/register")}
                >
                    Crear cuenta
                </Button>
            </Paper>
        </Box>
    );
}
