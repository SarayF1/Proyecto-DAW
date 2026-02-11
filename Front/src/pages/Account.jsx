// src/pages/Account.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Avatar,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/api";

export default function Account() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null); // { nombre, apellido1, apellido2, email, plan, idUsuario }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // historial separado
  const [ingresos, setIngresos] = useState([]);
  const [gastosConReserva, setGastosConReserva] = useState([]);

  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Fallback local user
  const loadFallbackUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        nombre: parsed.nombre || parsed.Nombre || parsed.name || "",
        apellido1: parsed.apellido1 || parsed.Apellido1 || parsed.lastName || "",
        apellido2: parsed.apellido2 || parsed.Apellido2 || "",
        email: parsed.email || parsed.Email || "",
        plan: parsed.plan || parsed.planName || "",
        idUsuario: parsed.idUsuario || parsed.id || null,
      };
    } catch {
      return null;
    }
  };

  const normalizeProfile = (p) => {
    if (!p) return null;
    return {
      nombre: p.Nombre ?? p.nombre ?? p.firstName ?? "",
      apellido1: p.Apellido1 ?? p.apellido1 ?? p.lastName ?? "",
      apellido2: p.Apellido2 ?? p.apellido2 ?? "",
      email: p.Email ?? p.email ?? "",
      plan: p.plan ?? p.planName ?? null,
      idUsuario: p.idUsuario ?? p.id ?? null,
    };
  };

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token");

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      if (!token) {
        if (mounted) {
          setUser(loadFallbackUser());
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            if (mounted) setUser(loadFallbackUser());
            setLoading(false);
            return;
          }
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Error ${res.status}`);
        }

        const data = await res.json();
        if (!mounted) return;

        const normalized = normalizeProfile(data);
        const fallback = loadFallbackUser();
        const finalUser = { ...fallback, ...normalized };
        setUser(finalUser);
      } catch (err) {
        console.error("Error cargando perfil:", err);
        if (mounted) {
          setError("No se pudo cargar el perfil. Mostrando datos locales si existen.");
          setUser(loadFallbackUser());
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  // Cargar historial real: movimientos del monedero + reservas
  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError("");
      try {
        // traer movimientos y reservas en paralelo
        const [movRes, revRes] = await Promise.allSettled([
          fetch(`${API_URL}/me/monedero/movimientos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/reservas/mias`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // parsear movimientos
        let movimientos = [];
        if (movRes.status === "fulfilled") {
          const r = movRes.value;
          if (r.ok) {
            const data = await r.json().catch(() => []);
            movimientos = Array.isArray(data) ? data : [];
          } else {
            // si responde pero con error, intentar parsear mensaje para mostrar
            try {
              const errBody = await movRes.value.json();
              console.error("Movimientos error:", errBody);
            } catch (err) {
              console.error("Error parseando error de movimientos:", err);
            }
          }
        }

        // parsear reservas y construir map para consultar estado por idReserva
        let reservas = [];
        if (revRes.status === "fulfilled") {
          const r = revRes.value;
          if (r.ok) {
            const data = await r.json().catch(() => []);
            reservas = Array.isArray(data) ? data : [];
          } else {
            try {
              const errBody = await revRes.value.json();
              console.error("Reservas error:", errBody);
            } catch (err) {
              console.error("Error parseando error de movimientos:", err);
            }
          }
        }

        // normalizar reservas a mapa: idReserva -> Estado
        const reservasMap = new Map();
        reservas.forEach((rs) => {
          const id = rs.idReserva ?? rs.id_reserva ?? rs.id ?? null;
          const estado = rs.Estado ?? rs.estado ?? rs.Estado ?? null;
          if (id != null) reservasMap.set(Number(id), estado ?? null);
        });

        // Construir listas separadas
        const ingresosList = [];
        const gastosConReservaList = [];

        (movimientos || []).forEach((m) => {
          // normalizar campos comunes
          const tipo = (m.tipo ?? m.TIPO ?? "").toString().toUpperCase();
          const cantidad = Number(m.cantidad ?? m.CANTIDAD ?? m.amount ?? 0);
          // id de reserva puede venir como id_Reserva, idReserva, id_reserva
          const idReserva =
            m.id_Reserva ?? m.idReserva ?? m.id_reserva ?? m.id_reserv ?? null;

          // fecha: intentar parsear
          let fecha;
          try {
            fecha = m.fecha ? new Date(m.fecha) : new Date();
          } catch {
            fecha = new Date();
          }

          const item = {
            id: `mov-${m.idMovimiento ?? m.id ?? Math.random()}`,
            tipo,
            descripcion: m.descripcion ?? m.descripcion_mov ?? m.desc ?? "",
            cantidad,
            fecha,
            idReserva: idReserva != null ? Number(idReserva) : null,
            raw: m,
          };

          if (tipo === "INGRESO") {
            ingresosList.push(item);
          } else {
            // GASTO
            if (item.idReserva) {
              // adjuntar estado de reserva si existe en map
              const estadoReserva = reservasMap.has(item.idReserva)
                ? reservasMap.get(item.idReserva)
                : null;

              gastosConReservaList.push({ ...item, estadoReserva });
            }
          }
        });

        // ordenar desc por fecha (más reciente primero)
        const sortDesc = (a, b) => b.fecha - a.fecha;
        ingresosList.sort(sortDesc);
        gastosConReservaList.sort(sortDesc);

        if (mounted) {
          setIngresos(ingresosList);
          setGastosConReserva(gastosConReservaList);
        }
      } catch (err) {
        console.error("Error cargando historial:", err);
        if (mounted) setHistoryError("Error al cargar historial.");
      } finally {
        if (mounted) setHistoryLoading(false);
      }
    };

    fetchHistory();
    return () => {
      mounted = false;
    };
  }, [user]); // disparar cuando se cargue user (opcional)

  const displayName = () => {
    if (!user) return "Usuario no registrado";
    const parts = [];
    if (user.nombre) parts.push(user.nombre);
    if (user.apellido1) parts.push(user.apellido1);
    return parts.join(" ") || user.email || "Usuario";
  };

  const avatarInitials = () => {
    if (!user) return "U";
    const name = user.nombre || user.email || "U";
    return name.trim().charAt(0).toUpperCase();
  };

  const planColor = () => {
    const plan = (user && user.plan) || "";
    switch (plan) {
      case "Residente anual":
        return "success";
      case "Residente mensual":
        return "primary";
      case "Invitado":
        return "default";
      default:
        return "warning";
    }
  };

  const handleGoToLogin = () => navigate("/");
  const handleGoToRegister = () => navigate("/register");

  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const fmtDate = (d) => {
    try {
      return d instanceof Date ? d.toLocaleString() : new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  };

  const renderReservaChip = (estado) => {
    if (!estado) return <Chip label="DESCONOCIDO" size="small" />;
    const e = String(estado).toUpperCase();
    if (e === "FINALIZADA") return <Chip label="FINALIZADA" size="small" color="success" />;
    if (e === "EN CURSO" || e === "ENCURSO" || e === "EN_CURSO") return <Chip label="EN CURSO" size="small" color="warning" />;
    return <Chip label={String(estado)} size="small" />;
  };

  return (
    <Box p={3} display="flex" justifyContent="center">
      <Paper sx={{ p: 4, maxWidth: 900, width: "100%", boxShadow: 3, borderRadius: 2 }}>
        {/* Header con avatar */}
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: "primary.main" }}>{avatarInitials()}</Avatar>
          <Box>
            <Typography variant="h5">{displayName()}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || "No registrado"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {!user && (
          <Box textAlign="center" mb={3}>
            <Typography mb={2}>No estás autenticado.</Typography>
            <Button variant="contained" onClick={handleGoToLogin} sx={{ mr: 1 }}>
              Iniciar sesión
            </Button>
            <Button variant="outlined" onClick={handleGoToRegister}>
              Crear cuenta
            </Button>
          </Box>
        )}

        {user && (
          <>
            {/* Información personal */}
            <Box mb={3}>
              <Typography variant="h6" mb={1}>
                Información personal
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Nombre:</strong> {user.nombre || "No registrado"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Email:</strong> {user.email || "No registrado"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Plan */}
            <Box mb={3}>
              <Typography variant="h6" mb={1}>
                Plan
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Chip label={user.plan || "No registrado"} color={planColor()} variant="outlined" />
            </Box>

            {/* Historial: ingresos / gastos vinculados */}
            <Box mb={3}>
              <Typography variant="h6" mb={1}>
                Historial reciente
              </Typography>
              <Divider sx={{ my: 1 }} />

              {historyLoading ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={20} />
                </Box>
              ) : historyError ? (
                <Typography color="error">{historyError}</Typography>
              ) : (
                <>
                  {/* INGRESOS */}
                  <Box mb={2}>
                    <Typography variant="subtitle1" mb={1}>
                      Ingresos
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                      {ingresos.length === 0 ? (
                        <Typography color="text.secondary">No hay ingresos recientes</Typography>
                      ) : (
                        <Stack spacing={1}>
                          {ingresos.map((inc) => (
                            <Box key={inc.id} display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography sx={{ fontWeight: 600 }}>{inc.descripcion}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {fmtDate(inc.fecha)}
                                </Typography>
                              </Box>
                              <Typography color="success.main" sx={{ fontWeight: 700 }}>
                                +{Number(inc.cantidad).toFixed(2)} €
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  </Box>

                  {/* GASTOS VINCULADOS A RESERVA */}
                  <Box mb={2}>
                    <Typography variant="subtitle1" mb={1}>
                      Gastos vinculados a reservas
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                      {gastosConReserva.length === 0 ? (
                        <Typography color="text.secondary">No hay gastos vinculados a reservas</Typography>
                      ) : (
                        <Stack spacing={1}>
                          {gastosConReserva.map((g) => (
                            <Box key={g.id} display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography sx={{ fontWeight: 600 }}>{g.descripcion}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {fmtDate(g.fecha)}
                                </Typography>
                              </Box>

                              <Box textAlign="right">
                                <Typography sx={{ fontWeight: 700, color: "error.main" }}>
                                  -{Number(g.cantidad).toFixed(2)} €
                                </Typography>
                                <Box mt={0.5}>
                                  {renderReservaChip(g.estadoReserva)}
                                </Box>
                              </Box>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  </Box>
                </>
              )}
            </Box>

            {/* Botón de actualizar (temporal) */}
            <Box textAlign="center" mt={2}>
              <Button variant="contained" color="primary" onClick={() => alert("Funcionalidad pendiente")}>
                Actualizar datos
              </Button>
            </Box>
          </>
        )}

        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
