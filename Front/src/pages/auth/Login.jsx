// src/pages/auth/Login.jsx
import { useState } from "react";
import { Button, TextField, Box, Typography, Paper, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../../services/api";
import logo from "../../assets/logo.png"

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

      // Opcional: eliminar datos locales ligados a sesión anónima
      // localStorage.removeItem("vehicles");

      navigate("/home");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };


return (
  <Box
    display="flex"
    minHeight="100vh"
    width="100%"
    justifyContent="center"
    alignItems="center"
    bgcolor="#b8d4e3"
    sx={{
      px: 2,
      overflowX: "hidden",
      flexDirection: {
        xs: "column",
        md: "row",
      },
      gap: 3,
    }}
  >
    <Box
      component="img"
      src={logo}
      alt="Logo"
      sx={{
        width: {
          xs: "220px",
          sm: "200px",
          md: "240px",
        },
        padding: "120px",
        height: "auto",
        maxWidth: "100%",
      }}
    />

    <Paper
      sx={{
        p: 4,
        width: {
          xs: "100%",
          sm: 360,
        },
        maxWidth: 360,
      }}
    >
      <Typography
        variant="h5"
        mb={3}
        textAlign="center"
        paddingBottom={2}
      >
        Iniciar Sesión
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Correo"
          margin="normal"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
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
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          type="submit"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Iniciar sesión"}
        </Button>
      </form>

      <Button
        fullWidth
        variant="text"
        color="primary"
        sx={{ mt: 1 }}
        onClick={() => navigate("/register")}
      >
        Crear cuenta
      </Button>
    </Paper>
  </Box>
);
}
