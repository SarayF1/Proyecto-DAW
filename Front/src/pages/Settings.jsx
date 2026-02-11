// src/pages/Settings.jsx
import { Typography, Button, Stack } from "@mui/material";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      // Si el contexto tiene logout, que se ejecute
      if (typeof logout === "function") logout();
    } catch (err) {
      // no romper si logout falla
      console.error("Error ejecutando logout del contexto:", err);
    }

    // Limpieza adicional por seguridad
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirigir a la pantalla de login/registro (ruta raíz)
    navigate("/");
  };

  return (
    <>
      <Typography variant="h4" mb={2}>
        Configuración
      </Typography>

      <Stack spacing={2} mt={2}>
        <Button color="error" variant="contained" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </Stack>
    </>
  );
}
