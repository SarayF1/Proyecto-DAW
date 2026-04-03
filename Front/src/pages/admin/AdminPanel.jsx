// src/pages/admin/AdminPanel.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  CheckCircle,
  Warning,
  DirectionsCar,
  AttachMoney,
  People,
  LocationOn,
} from "@mui/icons-material";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados para datos
  const [estadisticas, setEstadisticas] = useState(null);
  const [reservasActivas, setReservasActivas] = useState([]);
  const [reservasPorZona, setReservasPorZona] = useState([]);

  // Filtros
  const [filtroZona, setFiltroZona] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Cargar estadísticas
      const resStats = await fetch("https://myparking-backend.onrender.com/api/admin/estadisticas", {
        headers,
      });
      if (!resStats.ok) throw new Error("Error al cargar estadísticas");
      const stats = await resStats.json();
      setEstadisticas(stats);

      // Cargar reservas activas
      const resReservas = await fetch(
        "https://myparking-backend.onrender.com/api/admin/reservas-activas",
        { headers }
      );
      if (!resReservas.ok) throw new Error("Error al cargar reservas");
      const reservas = await resReservas.json();
      setReservasActivas(reservas);

      // Cargar reservas por zona
      const resZonas = await fetch(
        "https://myparking-backend.onrender.com/api/admin/reservas-por-zona",
        { headers }
      );
      if (!resZonas.ok) throw new Error("Error al cargar zonas");
      const zonas = await resZonas.json();
      setReservasPorZona(zonas);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const finalizarReserva = async (idReserva) => {
    if (!confirm("¿Seguro que quieres finalizar esta reserva?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://myparking-backend.onrender.com/api/admin/reservas/${idReserva}/finalizar`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Error al finalizar reserva");

      alert("Reserva finalizada correctamente");
      cargarDatos(); // Recargar datos
    } catch (err) {
      alert(err.message || "Error al finalizar reserva");
    }
  };

  // Filtrar reservas
  const reservasFiltradas = reservasActivas.filter((reserva) => {
    // Filtro por zona
    if (filtroZona !== "todas" && reserva.idZona !== parseInt(filtroZona)) {
      return false;
    }

    // Filtro por estado
    if (filtroEstado === "activas" && reserva.estado_pago !== "ACTIVA") {
      return false;
    }
    if (filtroEstado === "caducadas" && reserva.estado_pago !== "CADUCADA") {
      return false;
    }

    // Búsqueda por matrícula, email o nombre
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      const matches =
        reserva.vehiculo_matricula?.toLowerCase().includes(searchLower) ||
        reserva.usuario_email?.toLowerCase().includes(searchLower) ||
        reserva.usuario_nombre?.toLowerCase().includes(searchLower);
      if (!matches) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Panel de Administración
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      {estadisticas && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <DirectionsCar color="primary" />
                  <Box>
                    <Typography variant="h5">{estadisticas.reservas_activas}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reservas Activas
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Warning color="warning" />
                  <Box>
                    <Typography variant="h5">{estadisticas.reservas_caducadas}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reservas Caducadas
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <CheckCircle color="success" />
                  <Box>
                    <Typography variant="h5">{estadisticas.plazas_libres}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Plazas Libres
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <AttachMoney color="success" />
                  <Box>
                    <Typography variant="h5">€{estadisticas.ingresos_hoy}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ingresos Hoy
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Reservas Activas" />
          <Tab label="Por Zona" />
        </Tabs>
      </Paper>

      {/* Tab 1: Reservas Activas */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Gestión de Reservas
          </Typography>

          {/* Filtros */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Zona"
                value={filtroZona}
                onChange={(e) => setFiltroZona(e.target.value)}
              >
                <MenuItem value="todas">Todas las zonas</MenuItem>
                {reservasPorZona.map((zona) => (
                  <MenuItem key={zona.idZona} value={zona.idZona}>
                    {zona.zona_nombre} - {zona.Localidad}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <MenuItem value="todas">Todos los estados</MenuItem>
                <MenuItem value="activas">Solo activas</MenuItem>
                <MenuItem value="caducadas">Solo caducadas</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Buscar (matrícula, email, nombre)"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Tabla de reservas */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Estado</TableCell>
                  <TableCell>Zona</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Vehículo</TableCell>
                  <TableCell>Plaza</TableCell>
                  <TableCell>Inicio</TableCell>
                  <TableCell>Fin</TableCell>
                  <TableCell>Tiempo</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No hay reservas que coincidan con los filtros
                    </TableCell>
                  </TableRow>
                ) : (
                  reservasFiltradas.map((reserva) => (
                    <TableRow key={reserva.idReserva}>
                      <TableCell>
                        <Chip
                          label={reserva.estado_pago}
                          color={reserva.estado_pago === "ACTIVA" ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {reserva.zona_nombre}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {reserva.zona_localidad}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {reserva.usuario_nombre} {reserva.usuario_apellido1}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {reserva.usuario_email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {reserva.vehiculo_matricula || "N/A"}
                        <br />
                        {reserva.vehiculo_marca && (
                          <Typography variant="caption" color="text.secondary">
                            {reserva.vehiculo_marca} {reserva.vehiculo_modelo}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>Plaza {reserva.idPlaza}</TableCell>
                      <TableCell>
                        {new Date(reserva.Fecha_inicio).toLocaleString("es-ES")}
                      </TableCell>
                      <TableCell>
                        {new Date(reserva.Fecha_fin).toLocaleString("es-ES")}
                      </TableCell>
                      <TableCell>
                        {reserva.minutos_restantes > 0
                          ? `${reserva.minutos_restantes} min restantes`
                          : `${Math.abs(reserva.minutos_restantes)} min de retraso`}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => finalizarReserva(reserva.idReserva)}
                        >
                          Finalizar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 2: Por Zona */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {reservasPorZona.map((zona) => (
            <Grid item xs={12} md={6} key={zona.idZona}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <LocationOn color="primary" />
                    <Typography variant="h6">{zona.zona_nombre}</Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {zona.Localidad} - Tarifa: €{zona.Tarifa}/hora
                  </Typography>

                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2">Total Reservas:</Typography>
                      <Typography variant="h6">{zona.total_reservas}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">Activas:</Typography>
                      <Typography variant="h6" color="success.main">
                        {zona.reservas_activas}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">Caducadas:</Typography>
                      <Typography variant="h6" color="error.main">
                        {zona.reservas_caducadas}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">Usuarios:</Typography>
                      <Typography variant="h6">{zona.usuarios_unicos}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Botón de recarga */}
      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Button variant="contained" onClick={cargarDatos}>
          Recargar Datos
        </Button>
      </Box>
    </Container>
  );
}
