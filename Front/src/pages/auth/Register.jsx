// src/pages/auth/Register.jsx
import { useState } from "react";
import { Button, TextField, Box, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    // Estados para los campos del formulario
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [confirmarContraseña, setConfirmarContraseña] = useState("");
    const [error, setError] = useState("");

    const handleRegister = () => {
        // Validación simple
        if (!nombre || !email || !contraseña || !confirmarContraseña) {
            setError("Por favor completa todos los campos.");
            return;
        }
        if (contraseña !== confirmarContraseña) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        // Guardar token y datos de usuario en localStorage
        localStorage.setItem("token", "12345");
        const userData = { nombre, email, plan: "Residente anual" }; // plan por defecto
        localStorage.setItem("user", JSON.stringify(userData));

        // Redirigir al home
        navigate("/home");
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
                    Crear cuenta 🚗
                </Typography>

                {error && (
                    <Typography color="error" mb={2} textAlign="center">
                        {error}
                    </Typography>
                )}

                <TextField
                    fullWidth
                    label="Nombre completo"
                    margin="normal"
                    variant="outlined"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Correo"
                    margin="normal"
                    variant="outlined"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Contraseña"
                    type="password"
                    margin="normal"
                    variant="outlined"
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Confirmar contraseña"
                    type="password"
                    margin="normal"
                    variant="outlined"
                    value={confirmarContraseña}
                    onChange={(e) => setConfirmarContraseña(e.target.value)}
                />

                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    type="button"
                    onClick={handleRegister}
                >
                    Registrarse
                </Button>

                <Button
                    fullWidth
                    variant="text"
                    color="primary"
                    sx={{ mt: 1 }}
                    type="button"
                    onClick={() => navigate("/")}
                >
                    Volver al login
                </Button>
            </Paper>
        </Box>
    );
}
