// src/components/ActiveReservationBanner.jsx
// Widget flotante de reserva activa — un poco grande pero util
import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Stack,
  LinearProgress,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  LocalParking,
  ExpandLess,
  ExpandMore,
  LocationOn,
  Schedule,
  AccessTime,
  Close,
  FiberManualRecord,
} from "@mui/icons-material";
import { getMisReservas } from "../services/api";

const fmt = (dateStr) =>
  new Date(dateStr).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

const fmtDuration = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const getProgress = (inicio, fin) => {
  const now = Date.now();
  const s = new Date(inicio).getTime();
  const e = new Date(fin).getTime();
  if (now <= s) return 0;
  if (now >= e) return 100;
  return Math.round(((now - s) / (e - s)) * 100);
};

export default function ActiveReservationBanner() {
  const [reservas, setReservas] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [tick, setTick] = useState(0);

  const fetch_ = useCallback(async () => {
    try {
      const data = await getMisReservas();
      const active = (Array.isArray(data) ? data : []).filter(
        (r) => r.Estado === "EN CURSO" && new Date(r.Fecha_fin) > new Date()
      );
      setReservas(active);
      if (active.length > 0) setDismissed(false);
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => { fetch_(); const p = setInterval(fetch_, 30000); return () => clearInterval(p); }, [fetch_]);
  useEffect(() => { const t = setInterval(() => setTick((n) => n + 1), 1000); return () => clearInterval(t); }, []);

  if (dismissed || reservas.length === 0) return null;

  const r = reservas[0];
  const remaining = new Date(r.Fecha_fin).getTime() - Date.now();
  const progress = getProgress(r.Fecha_inicio, r.Fecha_fin);
  const urgent = remaining > 0 && remaining < 15 * 60 * 1000;
  const accent = urgent ? "#1ba0d4" : "#00e676";

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1400,
        width: { xs: "calc(100vw - 48px)", sm: 340 },
        borderRadius: "16px",
        overflow: "hidden",
        background: "linear-gradient(145deg, #0d1117 0%, #161b22 100%)",
        border: `1px solid ${accent}44`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.05)`,
        transition: "box-shadow 0.4s ease",
        "&:hover": {
          boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px ${accent}44`,
        },
      }}
    >
      {/* Barra de progreso top */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 3,
          bgcolor: "rgba(255,255,255,0.06)",
          "& .MuiLinearProgress-bar": {
            background: urgent
              ? "linear-gradient(90deg, #1ba0d4, #1ba0d4)"
              : "linear-gradient(90deg, #00e676, #00bcd4)",
            transition: "width 1s linear",
          },
        }}
      />

      {/* Header — siempre visible */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        px={2}
        py={1.5}
        onClick={() => setExpanded((v) => !v)}
        sx={{ cursor: "pointer", userSelect: "none" }}
      >
        {/* Icono con pulso */}
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "10px",
            background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
            border: `1px solid ${accent}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <LocalParking sx={{ fontSize: 17, color: accent }} />
          <Box
            sx={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: accent,
              animation: "dot-pulse 2s ease-in-out infinite",
              "@keyframes dot-pulse": {
                "0%, 100%": { opacity: 1, transform: "scale(1)" },
                "50%": { opacity: 0.5, transform: "scale(0.7)" },
              },
            }}
          />
        </Box>

        <Box flex={1} minWidth={0}>
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ color: "#fff", letterSpacing: "0.02em", display: "block" }}
            noWrap
          >
            {r.zona}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <FiberManualRecord sx={{ fontSize: 7, color: accent }} />
            <Typography variant="caption" sx={{ color: accent, fontWeight: 700, fontSize: "0.68rem", fontVariantNumeric: "tabular-nums" }}>
              {remaining > 0 ? fmtDuration(remaining) : "Finalizado"}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem" }}>
              · Plaza #{r.idPlaza}
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={0} flexShrink={0}>
          <Tooltip title={expanded ? "Contraer" : "Expandir"}>
            <IconButton size="small" sx={{ color: "rgba(255,255,255,0.4)", p: 0.5 }}>
              {expanded ? <ExpandMore fontSize="small" /> : <ExpandLess fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Cerrar">
            <IconButton
              size="small"
              sx={{ color: "rgba(255,255,255,0.4)", p: 0.5 }}
              onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            >
              <Close sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Panel expandido */}
      <Collapse in={expanded} timeout={250}>
        <Box px={2} pb={2}>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.07)", mb: 1.5 }} />

          {/* Grid de datos */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
              mb: 1.5,
            }}
          >
            <DataCard
              icon={<LocationOn sx={{ fontSize: 13 }} />}
              label="Localidad"
              value={r.Localidad}
              accent={accent}
            />
            <DataCard
              icon={<LocalParking sx={{ fontSize: 13 }} />}
              label="Reserva"
              value={`#${r.idReserva}`}
              accent={accent}
            />
            <DataCard
              icon={<Schedule sx={{ fontSize: 13 }} />}
              label="Entrada"
              value={fmt(r.Fecha_inicio)}
              accent={accent}
            />
            <DataCard
              icon={<AccessTime sx={{ fontSize: 13 }} />}
              label="Salida"
              value={fmt(r.Fecha_fin)}
              accent={urgent ? "#1ba0d4" : accent}
              highlight={urgent}
            />
          </Box>

          {/* Barra de progreso detallada */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" mb={0.8}>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.68rem" }}>
                Tiempo transcurrido
              </Typography>
              <Typography variant="caption" sx={{ color: accent, fontWeight: 700, fontSize: "0.72rem" }}>
                {progress}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 5,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.06)",
                "& .MuiLinearProgress-bar": {
                  background: urgent
                    ? "linear-gradient(90deg, #1ba0d4, #1ba0d4)"
                    : "linear-gradient(90deg, #00e676, #00bcd4)",
                  borderRadius: 3,
                  transition: "width 1s linear",
                },
              }}
            />
            <Stack direction="row" justifyContent="space-between" mt={0.5}>
              <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.25)" }}>
                {fmt(r.Fecha_inicio)}
              </Typography>
              <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.25)" }}>
                {fmt(r.Fecha_fin)}
              </Typography>
            </Stack>
          </Box>

          {urgent && (
            <Box
              sx={{
                mt: 1.5,
                p: 1,
                borderRadius: "8px",
                background: "rgba(255,152,0,0.08)",
                border: "1px solid rgba(255,152,0,0.25)",
                textAlign: "center",
              }}
            >
              <Typography variant="caption" sx={{ color: "#1ba0d4", fontWeight: 700, fontSize: "0.7rem" }}>
                ⚠ Quedan menos de 15 minutos
              </Typography>
            </Box>
          )}

          <Typography
            variant="caption"
            sx={{ display: "block", textAlign: "center", mt: 1.2, color: "rgba(255,255,255,0.2)", fontSize: "0.6rem" }}
          >
            Actualizado automáticamente · {reservas.length > 1 ? `${reservas.length} reservas activas` : "1 reserva activa"}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}

function DataCard({ icon, label, value, accent, highlight }) {
  return (
    <Box
      sx={{
        p: 1,
        borderRadius: "8px",
        background: highlight ? "rgba(255,152,0,0.07)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${highlight ? "rgba(255,152,0,0.2)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5} mb={0.3} sx={{ color: accent }}>
        {icon}
        <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {label}
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}