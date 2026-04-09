// src/pages/auth/Login.jsx
import { useState } from "react";
import { Button, TextField, Box, Typography, Paper, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../../services/api";
import logo from "../../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginRequest(email, password); // { token }

      if (!data || !data.token) {
        throw new Error("Respuesta inválida del servidor");
      }

      // Guardar token REAL del backend
      localStorage.setItem("token", data.token);

      navigate("/home");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #fdfbfb 0%, #b8d4e3 100%)", // Gradiente moderno
        px: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 4, md: 8 }, // Más espacio en escritorio
          width: "100%",
          maxWidth: "900px",
        }}
      >
        {/* Contenedor del Logo */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Box
            component="img"
            src={logo}
            alt="MyParking Logo"
            sx={{
              width: { xs: "140px", sm: "180px", md: "250px" },
              height: "auto",
              display: "block",
              filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))", // Sombra sutil al logo
            }}
          />
        </Box>

        {/* Tarjeta del Formulario */}
        <Paper
          elevation={6} // Sombra más pronunciada
          sx={{
            p: { xs: 3, sm: 5 },
            width: "100%",
            maxWidth: 400,
            borderRadius: 3, // Bordes más redondeados
          }}
        >
          <Typography variant="h4" fontWeight="bold" textAlign="center" color="primary.main" mb={1}>
            ¡Bienvenido!
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Ingresa a tu cuenta de MyParking
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo electrónico"
              margin="normal"
              variant="outlined"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              margin="normal"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              disabled={loading}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: "bold", mb: 2 }}
            >
              {loading ? "Entrando..." : "Iniciar sesión"}
            </Button>
          </form>

          <Button
            fullWidth
            variant="text"
            color="primary"
            onClick={() => navigate("/register")}
            sx={{ textTransform: "none", fontWeight: "medium" }}
          >
            ¿No tienes cuenta? Regístrate aquí
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}