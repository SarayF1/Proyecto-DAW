
// Hooks principales de React
import { useEffect, useState } from "react";
// import "../App.css"
// Componentes de interfaz (UI)
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
  TextField,
} from "@mui/material";

// Hook de navegación
import { useNavigate } from "react-router-dom";

// URL base del backend 
const API_URL = "https://myparking-backend.onrender.com/api";

export default function Account() {
  const navigate = useNavigate();

  // Estado del usuario autenticado
  const [user, setUser] = useState(null); // { nombre, apellido1, apellido2, email, plan, idUsuario }
  // Estados de carga y error del perfil
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
  nombre: "",
  apellido1: "",
  apellido2: "",
  email: "",
  password: "",
  });

  // historial separado
  const [ingresos, setIngresos] = useState([]); // movimientos de tipo INGRESO
  const [gastosConReserva, setGastosConReserva] = useState([]);   // movimientos de tipo GASTO que tienen idReserva asociado (vinculados a reserva)

  // Estados de carga/error del historial
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Fallback en localstorage
  const loadFallbackUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);

      // Normaliza distintos nombres (para cambios en la BD o inconsistencias)
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

  // Normalización de datos del backend para perfil -- PENDIENTE UNIFICAR CON LO DE ARRIBA (CODE SMELL DE DUPLICACION)
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

  // Cargar perfil del usuario
  useEffect(() => {
    let mounted = true;   // evita setState si el componente se desmonta durante la carga
    const token = localStorage.getItem("token");

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      if (!token) {       // Si no hay token se intenta fallback local
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

        // Manejo de errores HTTP
        if (!res.ok) {
          if (res.status === 401) {
            // Token inválido → limpiar sesión y fallback local
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

  useEffect(() => {
  if (user) {
    setFormData({
      nombre: user.nombre || "",
      apellido1: user.apellido1 || "",
      apellido2: user.apellido2 || "",
      email: user.email || "",
      password: "",
    });
  }
}, [user]);

  // Cargar historial real: movimientos del monedero + reservas
  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError("");
      try {
        // traer movimientos y reservas en paralelo - OPTIMIZCION
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
          // NORMALIZAcION id de reserva
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
  }, [user]); // disparar cuando se cargue user

  // AYUDAS UI
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

  // navegación a login/register
  const handleGoToLogin = () => navigate("/");
  const handleGoToRegister = () => navigate("/register");

  // loader principal
  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // Formatea fecha (acepta date o string)
  const fmtDate = (d) => {
    try {
      return d instanceof Date ? d.toLocaleString() : new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  };

  // Renderizado de estado de reserva en gastos vinculados y normalización de estados con chips de colores
  const renderReservaChip = (estado) => {
    if (!estado) return <Chip label="DESCONOCIDO" size="small" />;
    const e = String(estado).toUpperCase();
    if (e === "FINALIZADA") return <Chip label="FINALIZADA" size="small" color="success" />;
    if (e === "EN CURSO" || e === "ENCURSO" || e === "EN_CURSO") return <Chip label="EN CURSO" size="small" color="warning" />;
    return <Chip label={String(estado)} size="small" />;
  };

  const handleUpdate = async () => {
  const token = localStorage.getItem("token");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const textRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;

  if (!textRegex.test(formData.nombre)) {
    alert("Nombre no válido");
    return;
  }

  if (!textRegex.test(formData.apellido1)) {
    alert("Apellido 1 no válido");
    return;
  }

  if (
    formData.apellido2 &&
    !textRegex.test(formData.apellido2)
  ) {
    alert("Apellido 2 no válido");
    return;
  }

  if (!emailRegex.test(formData.email)) {
    alert("Correo electrónico no válido");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        Nombre: formData.nombre,
        Apellido1: formData.apellido1,
        Apellido2: formData.apellido2,
        Email: formData.email,
        Password: formData.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al actualizar");
    }

    const updatedUser = {
      ...user,
      ...formData,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setEditMode(false);
    alert("Datos actualizados correctamente");
  } catch (err) {
    alert(err.message);
  }
};

  return (
    <Box p={3} display="flex" justifyContent="center">
      <Paper sx={{ p: 4, maxWidth: 900, width: "100%", boxShadow: 3, borderRadius: 2 }}>
        {/* Header con avatar */}
        <Box display="flex" alignItems="center" mb={3}>
          {/* Si no hay avatar, se usa la inicial del nombre */}
          <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: "primary.main" }}>{avatarInitials()}</Avatar>
          <Box>
            <Typography variant="h5">{displayName()}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || "No registrado"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Si no hay usuario autenticado, mostrar CTA para login/registro */}
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

        {/* Si hay usuario, mostrar datos y su historial */}
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
      {editMode ? (
        <TextField
          fullWidth
          label="Nombre"
          value={formData.nombre}
          onChange={(e) =>
            setFormData({ ...formData, nombre: e.target.value })
          }
        />
      ) : (
        <Typography>
          <strong>Nombre:</strong> {user.nombre || "No registrado"}
        </Typography>
      )}
    </Grid>

    <Grid item xs={12} sm={6}>
      {editMode ? (
        <TextField
          fullWidth
          label="Apellido 1"
          value={formData.apellido1}
          onChange={(e) =>
            setFormData({ ...formData, apellido1: e.target.value })
          }
        />
      ) : (
        <Typography>
          <strong>Apellido 1:</strong> {user.apellido1 || "No registrado"}
        </Typography>
      )}
    </Grid>

    <Grid item xs={12} sm={6}>
      {editMode ? (
        <TextField
          fullWidth
          label="Apellido 2"
          value={formData.apellido2}
          onChange={(e) =>
            setFormData({ ...formData, apellido2: e.target.value })
          }
        />
      ) : (
        <Typography>
          <strong>Apellido 2:</strong> {user.apellido2 || "No registrado"}
        </Typography>
      )}
    </Grid>

    <Grid item xs={12} sm={6}>
      {editMode ? (
        <TextField
          fullWidth
          label="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />
      ) : (
        <Typography>
          <strong>Email:</strong> {user.email || "No registrado"}
        </Typography>
      )}
    </Grid>

    {editMode && (
      <Grid item xs={12}>
        <TextField
          fullWidth
          type="password"
          label="Nueva contraseña"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
      </Grid>
    )}
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
                              {/* Cantidad positiva para ingresos - verde */}
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
                                {/* Cantidad negativa para gastos */}
                                <Typography sx={{ fontWeight: 700, color: "error.main" }}>
                                  -{Number(g.cantidad).toFixed(2)} €
                                </Typography>
                                {/* chip de color para el estado de la reserva */}
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

            {/* Botón de actualizar (pendiente de implementar) */}
            <Box textAlign="center" mt={2}>
              <Button variant="contained" color="primary" 
              onClick={editMode ? handleUpdate : () => setEditMode(true)}
                    >
  {editMode ? "Guardar cambios" : "Actualizar datos"}
</Button>
            </Box>
          </>
        )}

        {/* global error (carga de perfil) */}
        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
