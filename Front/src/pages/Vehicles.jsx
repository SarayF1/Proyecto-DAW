// src/pages/Vehicles.jsx
import { useState, useEffect } from "react";
import {
  Select,
  Autocomplete,
  MenuItem,
  FormControl,
  InputLabel,
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
} from "../services/api";

const carCatalog = {
  Toyota: ["Corolla", "Yaris", "RAV4", "C-HR"],
  BMW: ["Serie 1", "Serie 3", "X1", "X5"],
  Audi: ["A1", "A3", "A4", "Q3", "Q5"],
  Mercedes: ["Clase A", "Clase C", "GLA", "GLE"],
  Seat: ["Ibiza", "León", "Arona", "Ateca"],
  Volkswagen: ["Golf", "Polo", "Tiguan", "Passat"],
  Renault: ["Clio", "Megane", "Captur"],
  Peugeot: ["208", "308", "3008"],
  Ford: ["Fiesta", "Focus", "Kuga"],
  Tesla: ["Model 3", "Model Y", "Model S"],
};

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

      const matriculaNormalizada = form.plate
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();

  const regexMatricula = /^[A-Z0-9-]{4,15}$/;
  const textRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/;

  if (!regexMatricula.test(matriculaNormalizada)) {
    setError("La matrícula no es válida.");
    return;
  }

  if (!textRegex.test(form.brand)) {
    setError("La marca contiene caracteres no válidos.");
    return;
  }

  if (!textRegex.test(form.model)) {
    setError("El modelo contiene caracteres no válidos.");
    return;
  }

  const yearNumber = Number(form.year);

  if (
    isNaN(yearNumber) ||
    yearNumber < 1900 ||
    yearNumber > new Date().getFullYear() + 1
  ) {
    setError("El año no es válido.");
    return;
  }

    setSaving(true);
    setError("");

    try {
      if (editingVehicle) {
        // actualizar
        const updated = await updateVehiculo(editingVehicle.id, {
          plate: matriculaNormalizada,
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
          plate: matriculaNormalizada,
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
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd} fontWeight="bold">
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
                  <SearchIcon sx={{ color: "black" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "black",
                  borderWidth: "2px",
                },
                "&:hover fieldset": {
                  borderColor: "black",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "black",
                },
              },
              "& .MuiInputBase-input": {
                fontWeight: "bold",
                color: "black",
              },
              "& .MuiInputBase-input::placeholder": {
                fontWeight: "bold",
                opacity: 1,
                color: "black",
              },
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
            <Autocomplete
  options={Object.keys(carCatalog)}
  value={form.brand}
  onChange={(event, newValue) =>
    setForm({
      ...form,
      brand: newValue || "",
      model: "",
    })
  }
  renderInput={(params) => (
    <TextField {...params} label="Marca" />
  )}
/>

<Autocomplete
  options={carCatalog[form.brand] || []}
  value={form.model}
  disabled={!form.brand}
  onChange={(event, newValue) =>
    setForm({
      ...form,
      model: newValue || "",
    })
  }
  renderInput={(params) => (
    <TextField {...params} label="Modelo" />
  )}
/>
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


// take 2
// // src/pages/Vehicles.jsx
// import { useState, useEffect } from "react";
// import {
//   Select, Autocomplete, MenuItem, FormControl, InputLabel,
//   Box, Typography, Button, Paper, Stack, IconButton,
//   Dialog, DialogTitle, DialogContent, DialogActions,
//   TextField, Chip, InputAdornment, CircularProgress, Tooltip,Alert,
//   Grid, Avatar, Snackbar, Divider,
// } from "@mui/material";
// import {
//   DirectionsCar, Add, DeleteOutline, EditOutlined,
//   ContentCopy, Search, TwoWheeler, LocalShipping, ElectricCar,
//   GarageOutlined,
// } from "@mui/icons-material";
// import { getVehiculos, createVehiculo, updateVehiculo, deleteVehiculo } from "../services/api";

// const carCatalog = {
//   Toyota: ["Corolla", "Yaris", "RAV4", "C-HR"],
//   BMW: ["Serie 1", "Serie 3", "X1", "X5"],
//   Audi: ["A1", "A3", "A4", "Q3", "Q5"],
//   Mercedes: ["Clase A", "Clase C", "GLA", "GLE"],
//   Seat: ["Ibiza", "León", "Arona", "Ateca"],
//   Volkswagen: ["Golf", "Polo", "Tiguan", "Passat"],
//   Renault: ["Clio", "Megane", "Captur"],
//   Peugeot: ["208", "308", "3008"],
//   Ford: ["Fiesta", "Focus", "Kuga"],
//   Tesla: ["Model 3", "Model Y", "Model S"],
// };

// const vehicleTypes = ["Turismo", "Moto", "Furgoneta", "Eléctrico", "SUV", "Otro"];

// const getTypeIcon = (brand) => {
//   if (!brand) return <DirectionsCar />;
//   if (brand === "Tesla") return <ElectricCar />;
//   return <DirectionsCar />;
// };

// const typeColors = {
//   Turismo: "#00e676", Moto: "#7c4dff", Furgoneta: "#ff9800",
//   Eléctrico: "#00bcd4", SUV: "#e040fb", Otro: "#9e9e9e",
// };

// const brandColors = {
//   BMW: "#1976d2", Tesla: "#e53935", Mercedes: "#333", Audi: "#b71c1c",
//   Toyota: "#c62828", Volkswagen: "#1565c0", Seat: "#ff8f00",
// };

// export default function Vehicles() {
//   const [vehicles, setVehicles] = useState([]);
//   const [openForm, setOpenForm] = useState(false);
//   const [editingVehicle, setEditingVehicle] = useState(null);
//   const [deleteStep, setDeleteStep] = useState({ open: false, vehicle: null, confirmTwice: false });
//   const [form, setForm] = useState({ plate: "", brand: "", model: "", year: "", type: "Turismo" });
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [snackbar, setSnackbar] = useState({ open: false, msg: "", sev: "success" });

//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       setLoading(true); setError("");
//       try {
//         const data = await getVehiculos();
//         if (!mounted) return;
//         setVehicles((Array.isArray(data) ? data : []).map((v) => ({
//           id: v.idVehiculo ?? v.id,
//           plate: v.plate ?? v.Matricula ?? "",
//           brand: v.brand ?? v.Marca ?? "",
//           model: v.model ?? v.Modelo ?? "",
//           year: v.year ?? v.Anio ?? "",
//           type: v.type ?? v.Tipo ?? "Turismo",
//           createdAt: v.created_at ?? v.createdAt ?? new Date().toISOString(),
//         })));
//       } catch (err) { setError("No se han podido cargar los vehículos."); }
//       finally { if (mounted) setLoading(false); }
//     };
//     load();
//     return () => { mounted = false; };
//   }, []);

//   const handleOpenAdd = () => { setEditingVehicle(null); setForm({ plate: "", brand: "", model: "", year: "", type: "Turismo" }); setOpenForm(true); };
//   const handleOpenEdit = (v) => { setEditingVehicle(v); setForm({ plate: v.plate, brand: v.brand, model: v.model, year: v.year, type: v.type || "Turismo" }); setOpenForm(true); };

//   const handleSave = async () => {
//     if (!form.plate || !form.brand || !form.model || !form.year) { setError("Rellena todos los campos."); return; }
//     const plate = form.plate.trim().toUpperCase().replace(/\s+/g, "");
//     setSaving(true); setError("");
//     try {
//       const payload = { Matricula: plate, Marca: form.brand, Modelo: form.model, Anio: Number(form.year), Tipo: form.type };
//       if (editingVehicle) {
//         await updateVehiculo(editingVehicle.id, payload);
//         setVehicles((prev) => prev.map((v) => v.id === editingVehicle.id ? { ...v, plate, brand: form.brand, model: form.model, year: form.year, type: form.type } : v));
//         setSnackbar({ open: true, msg: "Vehículo actualizado", sev: "success" });
//       } else {
//         const res = await createVehiculo(payload);
//         const newId = res?.idVehiculo ?? res?.id ?? Date.now();
//         setVehicles((prev) => [...prev, { id: newId, plate, brand: form.brand, model: form.model, year: form.year, type: form.type, createdAt: new Date().toISOString() }]);
//         setSnackbar({ open: true, msg: "Vehículo añadido", sev: "success" });
//       }
//       setOpenForm(false);
//     } catch (err) { setError(err.message || "Error al guardar"); }
//     finally { setSaving(false); }
//   };

//   const handleDeleteClick = (v) => setDeleteStep({ open: true, vehicle: v, confirmTwice: false });
//   const handleDeleteConfirm = async () => {
//     if (!deleteStep.confirmTwice) { setDeleteStep((s) => ({ ...s, confirmTwice: true })); return; }
//     try {
//       await deleteVehiculo(deleteStep.vehicle.id);
//       setVehicles((prev) => prev.filter((v) => v.id !== deleteStep.vehicle.id));
//       setDeleteStep({ open: false, vehicle: null, confirmTwice: false });
//       setSnackbar({ open: true, msg: "Vehículo eliminado", sev: "info" });
//     } catch (err) { setError(err.message || "Error al eliminar"); }
//   };

//   const handleDuplicate = async (v) => {
//     try {
//       const newPlate = `${v.plate}-COPIA`;
//       const payload = { Matricula: newPlate, Marca: v.brand, Modelo: v.model, Anio: Number(v.year), Tipo: v.type };
//       const res = await createVehiculo(payload);
//       setVehicles((prev) => [...prev, { id: res?.idVehiculo ?? Date.now(), plate: newPlate, brand: v.brand, model: v.model, year: v.year, type: v.type, createdAt: new Date().toISOString() }]);
//       setSnackbar({ open: true, msg: "Vehículo duplicado", sev: "success" });
//     } catch (err) { setError(err.message || "Error al duplicar"); }
//   };

//   const filtered = vehicles.filter((v) =>
//     [v.plate, v.brand, v.model].some((f) => f.toLowerCase().includes(search.toLowerCase()))
//   );

//   return (
//     <Box sx={{ maxWidth: 900, mx: "auto" }}>
//       {/* Header */}
//       <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
//         <Box>
//           <Typography variant="h4" fontWeight={800} sx={{ color: "#0d1117", letterSpacing: "-0.02em" }}>
//             Mis Vehículos
//           </Typography>
//           <Typography sx={{ color: "rgba(0,0,0,0.5)", mt: 0.3, fontSize: "0.9rem" }}>
//             {vehicles.length === 0 ? "Añade tu primer vehículo para empezar" : `${vehicles.length} vehículo${vehicles.length !== 1 ? "s" : ""} registrado${vehicles.length !== 1 ? "s" : ""}`}
//           </Typography>
//         </Box>
//         <Button
//           variant="contained" startIcon={<Add />} onClick={handleOpenAdd}
//           sx={{ borderRadius: 2, fontWeight: 700, background: "linear-gradient(135deg, #00e676, #00bcd4)", color: "#000", "&:hover": { background: "linear-gradient(135deg, #00c853, #00acc1)" } }}
//         >
//           Añadir vehículo
//         </Button>
//       </Stack>

//       {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}

//       {/* Buscador */}
//       {vehicles.length > 0 && (
//         <Paper sx={{ mb: 2.5, borderRadius: 2.5, background: "#111827", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
//           <TextField
//             placeholder="Buscar por matrícula, marca o modelo…"
//             fullWidth value={search} onChange={(e) => setSearch(e.target.value)}
//             InputProps={{
//               startAdornment: <Search sx={{ mr: 1, color: "rgba(255,255,255,0.3)", fontSize: 20 }} />,
//               disableUnderline: true,
//               sx: { px: 2, py: 1, color: "#fff", "& input::placeholder": { color: "rgba(255,255,255,0.3)", opacity: 1 } },
//             }}
//             variant="standard"
//           />
//         </Paper>
//       )}

//       {loading ? (
//         <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
//       ) : filtered.length === 0 && vehicles.length === 0 ? (
//         // Empty state
//         <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
//           <GarageOutlined sx={{ fontSize: 56, color: "rgba(255,255,255,0.1)", mb: 2 }} />
//           <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>Garaje vacío</Typography>
//           <Typography sx={{ color: "rgba(255,255,255,0.4)", mb: 3, fontSize: "0.9rem" }}>
//             Añade tu primer vehículo para empezar a hacer reservas
//           </Typography>
//           <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}
//             sx={{ borderRadius: 2, background: "linear-gradient(135deg, #00e676, #00bcd4)", color: "#000", fontWeight: 700 }}>
//             Añadir vehículo
//           </Button>
//         </Paper>
//       ) : (
//         <Grid container spacing={2}>
//           {filtered.map((v) => {
//             const isNew = new Date() - new Date(v.createdAt) < 7 * 24 * 60 * 60 * 1000;
//             const brandColor = brandColors[v.brand] || "#00e676";
//             const typeColor = typeColors[v.type] || "#00e676";
//             return (
//               <Grid item xs={12} sm={6} key={v.id}>
//                 <Paper
//                   sx={{
//                     p: 0, borderRadius: 3, overflow: "hidden",
//                     background: "#111827", border: "1px solid rgba(255,255,255,0.07)",
//                     transition: "all 0.2s ease",
//                     "&:hover": { border: `1px solid ${brandColor}44`, boxShadow: `0 8px 24px ${brandColor}12`, transform: "translateY(-2px)" },
//                   }}
//                 >
//                   {/* Tira de color de la marca */}
//                   <Box sx={{ height: 4, background: `linear-gradient(90deg, ${brandColor}, ${typeColor})` }} />

//                   <Box sx={{ p: 2.5 }}>
//                     <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
//                       <Stack direction="row" spacing={1.5} alignItems="center">
//                         <Avatar sx={{ width: 44, height: 44, bgcolor: `${brandColor}18`, border: `1px solid ${brandColor}33`, color: brandColor }}>
//                           {getTypeIcon(v.brand)}
//                         </Avatar>
//                         <Box>
//                           <Stack direction="row" alignItems="center" spacing={0.8}>
//                             <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#fff", letterSpacing: "0.04em" }}>
//                               {v.plate}
//                             </Typography>
//                             {isNew && <Chip label="Nuevo" size="small" sx={{ height: 18, fontSize: "0.6rem", bgcolor: "#00e67622", color: "#00e676", border: "1px solid #00e67633", fontWeight: 700 }} />}
//                           </Stack>
//                           <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
//                             {v.brand} {v.model} · {v.year}
//                           </Typography>
//                         </Box>
//                       </Stack>
//                     </Stack>

//                     <Stack direction="row" alignItems="center" justifyContent="space-between" mt={2}>
//                       <Chip
//                         label={v.type || "Turismo"}
//                         size="small"
//                         sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700, bgcolor: `${typeColor}15`, color: typeColor, border: `1px solid ${typeColor}30` }}
//                       />
//                       <Stack direction="row" spacing={0.5}>
//                         <Tooltip title="Editar">
//                           <IconButton size="small" onClick={() => handleOpenEdit(v)} sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#00e676", bgcolor: "#00e67611" } }}>
//                             <EditOutlined fontSize="small" />
//                           </IconButton>
//                         </Tooltip>
//                         <Tooltip title="Duplicar">
//                           <IconButton size="small" onClick={() => handleDuplicate(v)} sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#7c4dff", bgcolor: "#7c4dff11" } }}>
//                             <ContentCopy fontSize="small" />
//                           </IconButton>
//                         </Tooltip>
//                         <Tooltip title="Eliminar">
//                           <IconButton size="small" onClick={() => handleDeleteClick(v)} sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#ff5252", bgcolor: "#ff525211" } }}>
//                             <DeleteOutline fontSize="small" />
//                           </IconButton>
//                         </Tooltip>
//                       </Stack>
//                     </Stack>
//                   </Box>
//                 </Paper>
//               </Grid>
//             );
//           })}
//         </Grid>
//       )}

//       {/* Dialog Añadir/Editar */}
//       <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth PaperProps={{ sx: { borderRadius: 3, background: "#111827", border: "1px solid rgba(255,255,255,0.08)" } }}>
//         <DialogTitle sx={{ color: "#fff", fontWeight: 700 }}>{editingVehicle ? "Editar vehículo" : "Añadir vehículo"}</DialogTitle>
//         <DialogContent>
//           {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
//           <Stack spacing={2} mt={1}>
//             <TextField label="Matrícula" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })} size="small" />
//             <Autocomplete options={Object.keys(carCatalog)} value={form.brand}
//               onChange={(_, v) => setForm({ ...form, brand: v || "", model: "" })}
//               renderInput={(params) => <TextField {...params} label="Marca" size="small" />} />
//             <Autocomplete options={carCatalog[form.brand] || []} value={form.model} disabled={!form.brand}
//               onChange={(_, v) => setForm({ ...form, model: v || "" })}
//               renderInput={(params) => <TextField {...params} label="Modelo" size="small" />} />
//             <TextField label="Año" type="number" value={form.year} size="small"
//               onChange={(e) => setForm({ ...form, year: e.target.value })} />
//             <FormControl size="small" fullWidth>
//               <InputLabel>Tipo de vehículo</InputLabel>
//               <Select value={form.type} label="Tipo de vehículo" onChange={(e) => setForm({ ...form, type: e.target.value })}>
//                 {vehicleTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
//               </Select>
//             </FormControl>
//           </Stack>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 3 }}>
//           <Button onClick={() => setOpenForm(false)} sx={{ color: "rgba(255,255,255,0.5)" }}>Cancelar</Button>
//           <Button variant="contained" onClick={handleSave} disabled={saving}
//             sx={{ borderRadius: 2, background: "linear-gradient(135deg, #00e676, #00bcd4)", color: "#000", fontWeight: 700 }}>
//             {saving ? "Guardando…" : "Guardar"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Dialog eliminar */}
//       <Dialog open={deleteStep.open} onClose={() => setDeleteStep({ open: false, vehicle: null, confirmTwice: false })} PaperProps={{ sx: { borderRadius: 3, background: "#111827", border: "1px solid rgba(255,82,82,0.2)" } }}>
//         <DialogTitle sx={{ color: "#fff", fontWeight: 700 }}>
//           {deleteStep.confirmTwice ? "¿Confirmas la eliminación?" : "Eliminar vehículo"}
//         </DialogTitle>
//         <DialogContent>
//           <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
//             {deleteStep.confirmTwice
//               ? "Esta acción es irreversible. Pulsa Eliminar para confirmar definitivamente."
//               : `¿Deseas eliminar el vehículo ${deleteStep.vehicle?.plate}? Esta acción no se puede deshacer.`}
//           </Typography>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 3 }}>
//           <Button onClick={() => setDeleteStep({ open: false, vehicle: null, confirmTwice: false })} sx={{ color: "rgba(255,255,255,0.5)" }}>Cancelar</Button>
//           <Button color="error" variant="contained" onClick={handleDeleteConfirm} sx={{ borderRadius: 2, fontWeight: 700 }}>Eliminar</Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
//         <Alert severity={snackbar.sev} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.msg}</Alert>
//       </Snackbar>
//     </Box>
//   );
// }

// // Tooltip import fix