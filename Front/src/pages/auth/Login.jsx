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
    sx={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      bgcolor: "#b8d4e3",
      px: 2,
    }}
  >
    <Box
      sx={{
        display: "flex",
        flexDirection: {
          xs: "column",
          md: "row",
        },
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        width: "100%",
        maxWidth: "800px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            width: {
              xs: "120px",
              sm: "160px",
              md: "220px",
            },
            height: "auto",
            display: "block",
          }}
        />
      </Box>

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
          MyParking
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
  </Box>
);
}
