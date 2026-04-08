import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  Divider,
  Stack,
  Alert,
} from "@mui/material";

import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [mensaje, setMensaje] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSave = () => {
    setMensaje("Cambios guardados correctamente");
    setTimeout(() => setMensaje(""), 3000);
  };

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
    <Box p={3} sx={{ maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" fontWeight="bold" mb={1}>
        Configuración
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Gestiona tu perfil y preferencias
      </Typography>

      {mensaje && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {mensaje}
        </Alert>
      )}

      <Stack spacing={3}>

        {/* ================= NOTIFICACIONES ================= */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" mb={2}>
            Notificaciones
          </Typography>

          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography fontWeight="medium">Notificaciones push</Typography>
                <Typography variant="body2" color="text.secondary">
                  Recibe alertas sobre tus reservas
                </Typography>
              </Box>
              <Switch defaultChecked />
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography fontWeight="medium">Correos promocionales</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ofertas y descuentos exclusivos
                </Typography>
              </Box>
              <Switch />
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography fontWeight="medium">Resumen semanal</Typography>
                <Typography variant="body2" color="text.secondary">
                  Actividad de la semana
                </Typography>
              </Box>
              <Switch defaultChecked />
            </Stack>
          </Stack>
        </Paper>

        {/* ================= SEGURIDAD =================
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" mb={2}>
            Seguridad
          </Typography>

          <Stack spacing={2}>
            <TextField type="password" label="Contraseña actual" fullWidth />
            <TextField type="password" label="Nueva contraseña" fullWidth />

            <Button variant="outlined">
              Cambiar contraseña
            </Button>
          </Stack>
        </Paper> */}

        {/* ================= PREFERENCIAS ================= */}
<Paper sx={{ p: 3, borderRadius: 3 }}>
  <Typography variant="h6" mb={2}>
    Preferencias y privacidad
  </Typography>

  <Stack spacing={2}>
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box>
        <Typography fontWeight="medium">
          Telemetría y analíticas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ayúdanos a mejorar la aplicación con datos de uso
        </Typography>
      </Box>
      <Switch defaultChecked />
    </Stack>

    <Divider />

    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box>
        <Typography fontWeight="medium">
          Ubicación en segundo plano
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Mostrar parkings cercanos automáticamente
        </Typography>
      </Box>
      <Switch defaultChecked />
    </Stack>

    <Divider />

    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box>
        <Typography fontWeight="medium">
          Recordatorios automáticos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Avisos antes del fin de tu reserva
        </Typography>
      </Box>
      <Switch defaultChecked />
    </Stack>

    <Divider />

    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box>
        <Typography fontWeight="medium">
          Modo ahorro de datos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Reduce la carga de mapas e imágenes
        </Typography>
      </Box>
      <Switch />
    </Stack>
  </Stack>
</Paper>

        {/* ================= LEGAL ================= */}
<Paper sx={{ p: 3, borderRadius: 3 }}>
  <Typography variant="h6" mb={2}>
    Información legal
  </Typography>

  <Stack direction="row" spacing={2}>
    <Button variant="outlined" fullWidth onClick={() => navigate("/privacy")}>
      Política de privacidad
    </Button>

    <Button variant="outlined" fullWidth onClick={() => navigate("/terms")}>
      Términos y condiciones
    </Button>
  </Stack>
</Paper>
        <Button color="error" variant="contained" onClick={handleLogout}>
          Cerrar sesión
        </Button>

      </Stack>
    </Box>
  );
}