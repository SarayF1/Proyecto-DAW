
import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Switch,
  Divider,
  Stack,
  Alert,
  Snackbar,
  Chip,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  NotificationsActive,
  Mail,
  CalendarViewWeek,
  Analytics,
  MyLocation,
  Alarm,
  DataSaverOn,
  Gavel,
  Logout,
  Save,
  CheckCircle,
  InfoOutlined,
} from "@mui/icons-material";

import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// Clave en localStorage para persistir prefs
// ─────────────────────────────────────────────
const PREFS_KEY = "parkapp_user_prefs";

const DEFAULT_PREFS = {
  pushNotifications: true,
  promoEmails: false,
  weeklySummary: true,
  telemetry: true,
  backgroundLocation: true,
  autoReminders: true,
  dataSaver: false,
};

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
};

const persistPrefs = (prefs) => {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
};

// Efectos secundarios reales al cambiar preferencias
const applyPrefEffect = (key, value) => {
  try {
    if (key === "backgroundLocation" && !value) {
      localStorage.removeItem("ubicacionUsuario");
    }
    if (key === "dataSaver") {
      value
        ? localStorage.setItem("parkapp_data_saver", "1")
        : localStorage.removeItem("parkapp_data_saver");
    }
  } catch {
    /* silencioso */
  }
};

// ─────────────────────────────────────────────
// Fila de switch reutilizable
// ─────────────────────────────────────────────
function SwitchRow({ icon, label, description, prefKey, value, onChange, tooltip }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
      <Stack direction="row" alignItems="flex-start" spacing={1.5} flex={1}>
        <Box sx={{ mt: 0.3, color: value ? "primary.main" : "text.disabled", transition: "color 0.25s" }}>
          {icon}
        </Box>
        <Box flex={1}>
          <Stack direction="row" alignItems="center" spacing={0.8}>
            <Typography fontWeight={600} fontSize="0.92rem">
              {label}
            </Typography>
            {tooltip && (
              <Tooltip title={tooltip} placement="top" arrow>
                <InfoOutlined sx={{ fontSize: 14, color: "text.disabled", cursor: "help" }} />
              </Tooltip>
            )}
            {value && (
              <Chip
                label="Activo"
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  bgcolor: "rgba(0,230,118,0.12)",
                  color: "primary.main",
                  border: "1px solid rgba(0,230,118,0.3)",
                }}
              />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary" mt={0.2} fontSize="0.82rem">
            {description}
          </Typography>
        </Box>
      </Stack>
      <Switch
        checked={value}
        onChange={(e) => onChange(prefKey, e.target.checked)}
        color="primary"
      />
    </Stack>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState(loadPrefs);
  const [savedPrefs, setSavedPrefs] = useState(loadPrefs);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [saving, setSaving] = useState(false);

  const hasUnsaved = JSON.stringify(prefs) !== JSON.stringify(savedPrefs);

  const handleToggle = useCallback((key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    applyPrefEffect(key, value);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    persistPrefs(prefs);
    setSavedPrefs({ ...prefs });
    setSaving(false);
    setSnackbar({ open: true, message: "Preferencias guardadas correctamente", severity: "success" });
  }, [prefs]);

  const handleDiscard = useCallback(() => {
    setPrefs({ ...savedPrefs });
    setSnackbar({ open: true, message: "Cambios descartados", severity: "info" });
  }, [savedPrefs]);

  const handleLogout = () => {
    try {
      if (typeof logout === "function") logout();
    } catch (err) {
      console.error("Error ejecutando logout:", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <Box p={3} sx={{ maxWidth: 720, mx: "auto" }}>
      {/* Cabecera */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Configuración</Typography>
          <Typography color="text.secondary" mt={0.5}>Gestiona tus preferencias y notificaciones</Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {hasUnsaved && (
            <>
              <Chip
                label="Cambios sin guardar"
                size="small"
                sx={{
                  bgcolor: "rgba(255,167,38,0.12)",
                  color: "warning.main",
                  border: "1px solid rgba(255,167,38,0.3)",
                  fontWeight: 600,
                  fontSize: "0.72rem",
                }}
              />
              <Button variant="text" size="small" color="inherit" onClick={handleDiscard} sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                Descartar
              </Button>
            </>
          )}
          <Button
            variant={hasUnsaved ? "contained" : "outlined"}
            size="small"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : hasUnsaved ? <Save fontSize="small" /> : <CheckCircle fontSize="small" />}
            onClick={handleSave}
            disabled={saving || !hasUnsaved}
            sx={{ minWidth: 110 }}
          >
            {saving ? "Guardando…" : hasUnsaved ? "Guardar" : "Guardado"}
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>

        {/* ═══ NOTIFICACIONES ═══ */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
            <NotificationsActive sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography variant="h6" fontWeight="bold">Notificaciones</Typography>
          </Stack>
          <Stack spacing={2.5} divider={<Divider flexItem />}>
            <SwitchRow
              icon={<NotificationsActive fontSize="small" />}
              label="Notificaciones push"
              description="Alertas en tiempo real sobre el estado de tus reservas"
              prefKey="pushNotifications"
              value={prefs.pushNotifications}
              onChange={handleToggle}
              tooltip="Requiere permiso del navegador o del dispositivo"
            />
            <SwitchRow
              icon={<Mail fontSize="small" />}
              label="Correos promocionales"
              description="Ofertas exclusivas, descuentos y novedades de ParkApp"
              prefKey="promoEmails"
              value={prefs.promoEmails}
              onChange={handleToggle}
            />
            <SwitchRow
              icon={<CalendarViewWeek fontSize="small" />}
              label="Resumen semanal"
              description="Informe de tu actividad de aparcamiento cada semana"
              prefKey="weeklySummary"
              value={prefs.weeklySummary}
              onChange={handleToggle}
            />
          </Stack>
        </Paper>

        {/* ═══ PREFERENCIAS Y PRIVACIDAD ═══ */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
            <Analytics sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography variant="h6" fontWeight="bold">Preferencias y privacidad</Typography>
          </Stack>
          <Stack spacing={2.5} divider={<Divider flexItem />}>
            <SwitchRow
              icon={<Analytics fontSize="small" />}
              label="Telemetría y analíticas"
              description="Ayúdanos a mejorar la app compartiendo datos de uso anónimos"
              prefKey="telemetry"
              value={prefs.telemetry}
              onChange={handleToggle}
              tooltip="Datos completamente anónimos. Nunca incluye información personal"
            />
            <SwitchRow
              icon={<MyLocation fontSize="small" />}
              label="Ubicación en segundo plano"
              description="Muestra parkings cercanos automáticamente al abrir la app"
              prefKey="backgroundLocation"
              value={prefs.backgroundLocation}
              onChange={handleToggle}
              tooltip="Al desactivar se borrará la ubicación guardada localmente"
            />
            <SwitchRow
              icon={<Alarm fontSize="small" />}
              label="Recordatorios automáticos"
              description="Aviso 15 minutos antes del fin de tu reserva activa"
              prefKey="autoReminders"
              value={prefs.autoReminders}
              onChange={handleToggle}
            />
            <SwitchRow
              icon={<DataSaverOn fontSize="small" />}
              label="Modo ahorro de datos"
              description="Reduce la carga de mapas e imágenes al mínimo necesario"
              prefKey="dataSaver"
              value={prefs.dataSaver}
              onChange={handleToggle}
            />
          </Stack>

          {/* Resumen visual del estado */}
          <Box
            sx={{
              mt: 2.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Typography variant="caption" color="text.disabled" display="block" mb={1}>
              Estado actual de tus preferencias
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.8}>
              {Object.entries({
                pushNotifications: "Push",
                promoEmails: "Promos",
                weeklySummary: "Resumen",
                telemetry: "Telemetría",
                backgroundLocation: "Ubicación",
                autoReminders: "Recordatorios",
                dataSaver: "Ahorro datos",
              }).map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  size="small"
                  icon={prefs[key] ? <CheckCircle sx={{ fontSize: "12px !important" }} /> : undefined}
                  sx={{
                    height: 22,
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    bgcolor: prefs[key] ? "rgba(0,230,118,0.1)" : "rgba(255,255,255,0.04)",
                    color: prefs[key] ? "primary.main" : "text.disabled",
                    border: `1px solid ${prefs[key] ? "rgba(0,230,118,0.25)" : "rgba(255,255,255,0.08)"}`,
                    transition: "all 0.25s ease",
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Paper>

        {/* ═══ LEGAL ═══ */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
            <Gavel sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography variant="h6" fontWeight="bold">Información legal</Typography>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button variant="outlined" fullWidth onClick={() => navigate("/privacy")} sx={{ borderRadius: 2 }}>
              Política de privacidad
            </Button>
            <Button variant="outlined" fullWidth onClick={() => navigate("/terms")} sx={{ borderRadius: 2 }}>
              Términos y condiciones
            </Button>
          </Stack>
        </Paper>

        {/* ═══ SESIÓN ═══ */}
        <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(211,47,47,0.2)" }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
            <Logout sx={{ color: "error.main", fontSize: 20 }} />
            <Typography variant="h6" fontWeight="bold">Sesión</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Al cerrar sesión se eliminarán tus datos de acceso locales. Tus reservas y preferencias
            quedarán guardadas en el servidor.
          </Typography>
          <Button color="error" variant="contained" startIcon={<Logout />} onClick={handleLogout} sx={{ borderRadius: 2 }}>
            Cerrar sesión
          </Button>
        </Paper>
      </Stack>

      {/* Snackbar de confirmación */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2 }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}