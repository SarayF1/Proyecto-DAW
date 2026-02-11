// src/pages/Vehicles.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from "@mui/icons-material/Search";

import {
  getVehiculos,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo,
} from "../services/api"; // asegúrate de que exportes estas funciones

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteStep, setDeleteStep] = useState({ open: false, vehicle: null, confirmTwice: false });
  const [form, setForm] = useState({ plate: "", brand: "", model: "", year: "" });
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Cargar vehículos desde backend
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getVehiculos(); // espera array de objetos
        if (!mounted) return;

        const mapped = (Array.isArray(data) ? data : []).map((v) => ({
          id: v.idVehiculo ?? v.id ?? v.id, // mantener id
          plate: v.plate ?? v.Matricula ?? v.Matricula ?? "",
          brand: v.brand ?? v.Marca ?? "",
          model: v.model ?? v.Modelo ?? "",
          year: v.year ?? v.Anio ?? v.Anio ?? "",
          createdAt: v.created_at ?? v.createdAt ?? new Date().toISOString(),
        }));

        setVehicles(mapped);
      } catch (err) {
        console.error("Error cargando vehículos:", err);
        setError("No se han podido cargar los vehículos. Intenta más tarde.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setForm({ plate: "", brand: "", model: "", year: "" });
    setOpenForm(true);
    setError("");
  };

  const handleOpenEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setForm({ plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, year: vehicle.year });
    setOpenForm(true);
    setError("");
  };

  const handleSave = async () => {
    // Validación mínima
    if (!form.plate || !form.brand || !form.model || !form.year) {
      setError("Por favor rellena todos los campos del formulario.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingVehicle) {
        // actualizar
        const updated = await updateVehiculo(editingVehicle.id, {
          plate: form.plate,
          brand: form.brand,
          model: form.model,
          year: form.year,
        });

        // mapear respuesta si viene con idVehiculo
        const mapped = {
          id: updated.idVehiculo ?? updated.id ?? editingVehicle.id,
          plate: updated.plate ?? form.plate,
          brand: updated.brand ?? form.brand,
          model: updated.model ?? form.model,
          year: updated.year ?? form.year,
          createdAt: updated.created_at ?? editingVehicle.createdAt,
        };

        setVehicles((prev) => prev.map((v) => (v.id === editingVehicle.id ? mapped : v)));
      } else {
        // crear
        const created = await createVehiculo({
          plate: form.plate,
          brand: form.brand,
          model: form.model,
          year: form.year,
        });

        const mapped = {
          id: created.idVehiculo ?? created.id ?? Date.now(),
          plate: created.plate ?? form.plate,
          brand: created.brand ?? form.brand,
          model: created.model ?? form.model,
          year: created.year ?? form.year,
          createdAt: created.created_at ?? new Date().toISOString(),
        };

        setVehicles((prev) => [mapped, ...prev]);
      }

      setOpenForm(false);
      setEditingVehicle(null);
    } catch (err) {
      console.error("Error guardando vehículo:", err);
      setError(err.message || "Error guardando vehículo");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (vehicle) => setDeleteStep({ open: true, vehicle, confirmTwice: false });

  const handleDeleteConfirm = async () => {
    if (!deleteStep.confirmTwice) {
      setDeleteStep((prev) => ({ ...prev, confirmTwice: true }));
      return;
    }

    try {
      await deleteVehiculo(deleteStep.vehicle.id);
      setVehicles((prev) => prev.filter((v) => v.id !== deleteStep.vehicle.id));
    } catch (err) {
      console.error("Error eliminando vehículo:", err);
      setError(err.message || "Error eliminando vehículo");
    } finally {
      setDeleteStep({ open: false, vehicle: null, confirmTwice: false });
    }
  };

  // Duplicar vehículo -> crea uno nuevo en servidor con matrícula modificada
  const handleDuplicate = async (vehicle) => {
    try {
      const newPlate = `${vehicle.plate}-C`;
      const created = await createVehiculo({
        plate: newPlate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
      });

      const mapped = {
        id: created.idVehiculo ?? created.id ?? Date.now(),
        plate: created.plate ?? newPlate,
        brand: created.brand ?? vehicle.brand,
        model: created.model ?? vehicle.model,
        year: created.year ?? vehicle.year,
        createdAt: created.created_at ?? new Date().toISOString(),
      };

      setVehicles((prev) => [mapped, ...prev]);
    } catch (err) {
      console.error("Error duplicando vehículo:", err);
      setError(err.message || "No se pudo duplicar el vehículo");
    }
  };

  // Filtro por búsqueda
  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3} maxWidth="900px" mx="auto">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
        <Typography variant="h4" fontWeight={600} mb={1}>
          Mis Vehículos ({vehicles.length})
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
          Añadir vehículo
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Buscador */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        vehicles.length > 0 && (
          <TextField
            placeholder="Buscar por matrícula, marca o modelo..."
            fullWidth
            margin="normal"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        )
      )}

      {/* Empty state */}
      {!loading && vehicles.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" mb={1}>
            No tienes vehículos
          </Typography>
          <Typography color="text.secondary" mb={2}>
            Añade tu primer vehículo para empezar
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
            Añadir vehículo
          </Button>
        </Paper>
      )}

      {/* Lista */}
      <Stack spacing={2} mt={2}>
        {filteredVehicles.map((vehicle) => {
          const isNew = new Date() - new Date(vehicle.createdAt) < 7 * 24 * 60 * 60 * 1000; // < 7 días
          return (
            <Paper
              key={vehicle.id}
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "0.2s",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <DirectionsCarIcon fontSize="large" color="primary" />
                <Box>
                  <Typography component="div" fontWeight={600}>
                    {vehicle.plate} {isNew && <Chip label="Nuevo" size="small" color="success" sx={{ ml: 1 }} />}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {vehicle.brand} {vehicle.model} · {vehicle.year}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row">
                <IconButton color="primary" onClick={() => handleOpenEdit(vehicle)}>
                  <EditOutlinedIcon />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleDuplicate(vehicle)}>
                  <ContentCopyIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeleteClick(vehicle)}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      {/* Add / Edit Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth>
        <DialogTitle>{editingVehicle ? "Editar vehículo" : "Añadir vehículo"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Matrícula" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })} />
            <TextField label="Marca" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <TextField label="Modelo" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            <TextField label="Año" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteStep.open} onClose={() => setDeleteStep({ open: false, vehicle: null, confirmTwice: false })}>
        <DialogTitle>{deleteStep.confirmTwice ? "¿Seguro? Esta acción es irreversible" : "Eliminar vehículo"}</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteStep.confirmTwice ? "Pulsa eliminar otra vez para confirmar definitivamente." : `¿Deseas eliminar el vehículo ${deleteStep.vehicle?.plate}?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteStep({ open: false, vehicle: null, confirmTwice: false })}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
