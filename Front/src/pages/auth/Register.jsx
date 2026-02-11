// src/pages/auth/Register.jsx
import { useState } from "react";
import { Button, TextField, Box, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { register as registerUser, loginRequest } from "../../services/api";

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

      // 1) Crear usuario
      await registerUser({
        Nombre: nombre,
        Apellido1: apellido1,
        Apellido2: apellido2 || null,
        Email: email,
        Password: password,
      });

      // 2) Login automático
      const loginResp = await loginRequest(email, password);

      // 3) Guardar token y redirigir
      if (loginResp?.token) {
        localStorage.setItem("token", loginResp.token);
      } else if (loginResp?.data?.token) {
        // por si la estructura fuera { data: { token } }
        localStorage.setItem("token", loginResp.data.token);
      } else {
        // si no hay token, lanzar error para mostrar mensaje
        throw new Error("Registro correcto, fallo al iniciar sesión automáticamente.");
      }

      navigate("/home");
    } catch (err) {
      console.error("Error registro:", err);

      // Manejo de mensajes provenientes de fetch/handleResponse
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
    <Box display="flex" height="100vh" justifyContent="center" alignItems="center" bgcolor="#f5f5f5">
      <Paper sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" mb={3} textAlign="center">
          Crear cuenta 🚗
        </Typography>

        {error && (
          <Typography color="error" mb={2} textAlign="center">
            {error}
          </Typography>
        )}

        <form onSubmit={handleRegister}>
          <TextField fullWidth label="Nombre" margin="normal" value={nombre} onChange={(e) => setNombre(e.target.value)} />

          <TextField fullWidth label="Primer apellido" margin="normal" value={apellido1} onChange={(e) => setApellido1(e.target.value)} />

          <TextField fullWidth label="Segundo apellido" margin="normal" value={apellido2} onChange={(e) => setApellido2(e.target.value)} />

          <TextField fullWidth label="Correo" type="email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />

          <TextField fullWidth label="Contraseña" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />

          <TextField
            fullWidth
            label="Confirmar contraseña"
            type="password"
            margin="normal"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
          />

          <Button fullWidth variant="contained" sx={{ mt: 2 }} type="submit" disabled={loading}>
            {loading ? "Creando cuenta..." : "Registrarse"}
          </Button>
        </form>

        <Button fullWidth variant="text" sx={{ mt: 1 }} onClick={() => navigate("/")}>
          Volver al login
        </Button>
      </Paper>
    </Box>
  );
}
