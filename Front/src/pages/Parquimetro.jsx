// src/pages/Parquimetro.jsx
import { getZonas, getVehiculos, getPlazas } from "../services/api";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";

export default function Parquimetro() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [zonas, setZonas] = useState([]);
  const [zona, setZona] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [started, setStarted] = useState(false);

  const [loadingZonas, setLoadingZonas] = useState(false);
  const [zonasError, setZonasError] = useState("");

  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehiclesError, setVehiclesError] = useState("");

  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();
  const idZonaPreseleccionada = searchParams.get("idZona");

  // util: formato compatible MySQL 'YYYY-MM-DD HH:MM:SS'
  const formatMySQLDate = (date) => date.toISOString().slice(0, 19).replace("T", " ");

  // Cargar vehículos
  useEffect(() => {
    let mounted = true;
    const loadVehicles = async () => {
      setLoadingVehicles(true);
      setVehiclesError("");
      try {
        const data = await getVehiculos();
        if (!mounted) return;
        const mapped = (Array.isArray(data) ? data : []).map((v) => ({
          id: v.idVehiculo ?? v.id ?? v.id,
          plate: v.plate ?? v.Matricula ?? v.matricula ?? "",
          brand: v.brand ?? v.Marca ?? v.marca ?? "",
          model: v.model ?? v.Modelo ?? v.modelo ?? "",
          year: v.year ?? v.Anio ?? v.anio ?? "",
          createdAt: v.created_at ?? v.createdAt ?? new Date().toISOString(),
        }));
        setVehicles(mapped);
        if (mapped.length > 0 && !vehicleId) setVehicleId(mapped[0].id);
      } catch (err) {
        console.error("fetch vehicles error:", err);
        setVehiclesError(
          err.message?.includes("No autorizado") || err.message?.includes("401")
            ? "Debes iniciar sesión para ver tus vehículos."
            : "No se han podido cargar los vehículos. Intenta más tarde."
        );
      } finally {
        if (mounted) setLoadingVehicles(false);
      }
    };

    loadVehicles();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar zonas
  useEffect(() => {
    let mounted = true;
    const fetchZonas = async () => {
      setLoadingZonas(true);
      setZonasError("");
      try {
        const data = await getZonas();
        if (!mounted) return;
        const mapped = (Array.isArray(data) ? data : []).map((z) => ({
          id: String(z.idZona ?? z.id ?? z.id),
          nombre: z.nombre ?? z.name ?? "Zona",
          precioHora: Number(z.Tarifa ?? z.precioHora ?? z.price ?? 0),
          plazasLibres: z.plazasLibres ?? z.plazas_libres ?? null,
          totalPlazas: z.totalPlazas ?? z.total_plazas ?? null,
        }));
        setZonas(mapped);
        if (idZonaPreseleccionada) {
          const exists = mapped.find((m) => m.id === String(idZonaPreseleccionada));
          if (exists) setZona(String(idZonaPreseleccionada));
        }
      } catch (err) {
        console.error("fetch zonas error:", err);
        if (mounted) setZonasError("No se han podido cargar las zonas. Intenta más tarde.");
      } finally {
        if (mounted) setLoadingZonas(false);
      }
    };

    fetchZonas();
    return () => { mounted = false; };
  }, [idZonaPreseleccionada]);

  const selectedZona = zonas.find((z) => z.id === zona);
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const price = selectedZona ? (minutes / 60) * selectedZona.precioHora : 0;

  // Lógica principal: reservar
  const iniciarParquimetro = async () => {
    setError("");
    setMessage("");

    if (!selectedZona) return setError("Selecciona una zona válida.");
    if (!selectedVehicle) return setError("Selecciona un vehículo.");

    setProcessing(true);

    try {
      // obtener plazas y buscar una LIBRE en la zona
      const plazas = await getPlazas();
      if (!Array.isArray(plazas)) throw new Error("No se han podido obtener plazas");

      const zonaIdNum = Number(selectedZona.id);
      const plazaLibre = plazas.find((p) => {
        const pZona = Number(p.id_Zona ?? p.idZona ?? p.idZona ?? p.idZona);
        const estado = (p.Estado_Plaza ?? p.estado ?? p.status ?? "").toString().toUpperCase();
        return pZona === zonaIdNum && (estado === "LIBRE" || estado === "FREE");
      });

      if (!plazaLibre) throw new Error("No hay plazas libres en esta zona en este momento.");

      // construir fechas en formato MySQL
      const inicio = formatMySQLDate(new Date());
      const fin = formatMySQLDate(new Date(Date.now() + minutes * 60_000));

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Debes iniciar sesión para reservar.");

      // POST a /api/reservas (backend se encargará de monedero/movimientos)
      const res = await fetch("http://localhost:3001/api/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idPlaza: Number(plazaLibre.idPlaza ?? plazaLibre.id ?? plazaLibre.idPlaza ?? plazaLibre.id),
          Fecha_inicio: inicio,
          Fecha_fin: fin,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        // mostrar error provisto por el backend (si lo hay)
        throw new Error((data && data.error) || "Error creando la reserva");
      }

      // éxito
      setStarted(true);
      setMessage(`Reserva creada. Importe: ${Number(data.importe ?? 0).toFixed(2)} €`);

      // Notificar a Wallet para que recargue (escucha storage)
      try { localStorage.setItem("last_reserva_timestamp", String(Date.now())); } catch { }

    } catch (err) {
      console.error("iniciarParquimetro:", err);
      setError(err.message || "Error al iniciar el parquímetro.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box p={3} maxWidth="600px" mx="auto">
      <Typography variant="h4" mb={3}>🅿️ Parquímetro</Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          {loadingVehicles ? (
            <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
          ) : vehiclesError ? (
            <Alert severity="warning">{vehiclesError}</Alert>
          ) : vehicles.length === 0 ? (
            <Alert severity="warning">No tienes vehículos añadidos. Añádelos en "Mis Vehículos".</Alert>
          ) : null}

          <FormControl fullWidth disabled={loadingVehicles || vehicles.length === 0}>
            <InputLabel>Vehículo</InputLabel>
            <Select value={vehicleId} label="Vehículo" onChange={(e) => setVehicleId(e.target.value)}>
              {vehicles.map((v) => (<MenuItem key={v.id} value={v.id}>{v.plate} – {v.brand} {v.model}</MenuItem>))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={loadingZonas || zonas.length === 0}>
            <InputLabel>Zona</InputLabel>
            {loadingZonas ? (
              <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
            ) : zonasError ? (
              <Alert severity="error">{zonasError}</Alert>
            ) : (
              <Select value={zona} label="Zona" onChange={(e) => setZona(e.target.value)}>
                {zonas.map((z) => (<MenuItem key={z.id} value={z.id}>{z.nombre} ({z.precioHora} €/h)</MenuItem>))}
              </Select>
            )}
          </FormControl>

          <Box>
            <Typography>Tiempo: {minutes} minutos</Typography>
            <Slider value={minutes} min={15} max={240} step={15} marks onChange={(e, value) => setMinutes(Array.isArray(value) ? value[0] : value)} />
          </Box>

          <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">Total: {price.toFixed(2)} €</Typography>
          </Paper>

          <Button variant="contained" size="large" disabled={!vehicleId || !zona || processing} onClick={iniciarParquimetro}>
            {processing ? "Procesando..." : "Iniciar parquímetro"}
          </Button>

          {started && <Alert severity="success">{message || "Parquímetro iniciado y reserva creada"}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Paper>
    </Box>
  );
}
