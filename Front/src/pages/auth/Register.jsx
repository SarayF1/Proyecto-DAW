// src/pages/auth/Register.jsx
import { useState } from "react";
import { Button, TextField, Box, Typography, Paper, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { register as registerUser, loginRequest } from "../../services/api";
import logo from "../../assets/logo.png"; // Importamos el logo para mantener consistencia

export default function Register() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [apellido1, setApellido1] = useState("");
  const [apellido2, setApellido2] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!nombre || !apellido1 || !email || !password || !confirmarPassword) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        Nombre: nombre,
        Apellido1: apellido1,
        Apellido2: apellido2 || null,
        Email: email,
        Password: password,
      });

      const loginResp = await loginRequest(email, password);

      if (loginResp?.token) {
        localStorage.setItem("token", loginResp.token);
      } else if (loginResp?.data?.token) {
        localStorage.setItem("token", loginResp.data.token);
      } else {
        throw new Error("Registro correcto, fallo al iniciar sesión automáticamente.");
      }

      navigate("/home");
    } catch (err) {
      console.error("Error registro:", err);
      const msg = err.message || err?.response?.data?.error || "Error al crear la cuenta. Inténtalo más tarde.";

      if (msg.includes("409") || msg.toLowerCase().includes("ya existe") || err?.response?.status === 409) {
        setError("El usuario ya existe.");
      } else {
        setError(msg);
      }
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
        background: "linear-gradient(135deg, #fdfbfb 0%, #b8d4e3 100%)",
        py: { xs: 4, md: 0 }, // Padding vertical en móviles para hacer scroll cómodamente
        px: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row-reverse" }, // Invertimos el orden para que sea dinámico respecto al login
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 4, md: 8 },
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
              width: { xs: "120px", sm: "160px", md: "220px" },
              height: "auto",
              display: "block",
              filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))",
            }}
          />
        </Box>

        {/* Tarjeta del Formulario */}
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 5 },
            width: "100%",
            maxWidth: 450, // Un poco más ancho porque tiene campos en la misma línea
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold" textAlign="center" color="primary.main" mb={1}>
            Crear cuenta 
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Únete a MyParking y gestiona tu espacio
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleRegister}>
            <TextField fullWidth label="Nombre" variant="outlined" size="small" margin="normal" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

            {/* Agrupamos los apellidos en una sola fila */}
            <Box sx={{ display: "flex", gap: 2, mt: 1, mb: 1 }}>
              <TextField fullWidth label="Primer apellido" variant="outlined" size="small" value={apellido1} onChange={(e) => setApellido1(e.target.value)} required />
              <TextField fullWidth label="Segundo apellido" variant="outlined" size="small" value={apellido2} onChange={(e) => setApellido2(e.target.value)} />
            </Box>

            <TextField fullWidth label="Correo electrónico" type="email" variant="outlined" size="small" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <Box sx={{ display: "flex", gap: 2, mt: 1, mb: 2 }}>
              <TextField fullWidth label="Contraseña" type="password" variant="outlined" size="small" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <TextField
                fullWidth
                label="Confirmar"
                type="password"
                variant="outlined"
                size="small"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 2, py: 1.5, borderRadius: 2, fontWeight: "bold" }}
              type="submit"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Registrarse"}
            </Button>
          </form>

          <Button
            fullWidth
            variant="text"
            color="primary"
            sx={{ mt: 2, textTransform: "none", fontWeight: "medium" }}
            onClick={() => navigate("/")}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}