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
    InputAdornment
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from '@mui/icons-material/Search';

const STORAGE_KEY = "vehicles";

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [deleteStep, setDeleteStep] = useState({ open: false, vehicle: null, confirmTwice: false });
    const [form, setForm] = useState({ plate: "", brand: "", model: "", year: "" });
    const [search, setSearch] = useState("");

    useEffect(() => {
        const storedVehicles = localStorage.getItem(STORAGE_KEY);
        if (storedVehicles) setVehicles(JSON.parse(storedVehicles));
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    }, [vehicles]);

    const handleOpenAdd = () => {
        setEditingVehicle(null);
        setForm({ plate: "", brand: "", model: "", year: "" });
        setOpenForm(true);
    };

    const handleOpenEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setForm(vehicle);
        setOpenForm(true);
    };

    const handleSave = () => {
        if (!form.plate || !form.brand || !form.model || !form.year) return;

        if (editingVehicle) {
            setVehicles(prev =>
                prev.map(v => v.id === editingVehicle.id ? { ...form, id: v.id, createdAt: v.createdAt } : v)
            );
        } else {
            setVehicles(prev => [...prev, { ...form, id: Date.now(), createdAt: new Date().toISOString() }]);
        }

        setOpenForm(false);
    };

    const handleDeleteClick = (vehicle) => setDeleteStep({ open: true, vehicle, confirmTwice: false });
    const handleDeleteConfirm = () => {
        if (!deleteStep.confirmTwice) {
            setDeleteStep(prev => ({ ...prev, confirmTwice: true }));
            return;
        }
        setVehicles(prev => prev.filter(v => v.id !== deleteStep.vehicle.id));
        setDeleteStep({ open: false, vehicle: null, confirmTwice: false });
    };

    // Duplicar vehículo
    const handleDuplicate = (vehicle) => {
        const copy = { ...vehicle, id: Date.now(), plate: vehicle.plate + "-C" };
        setVehicles(prev => [...prev, copy]);
    };

    // Filtro por búsqueda
    const filteredVehicles = vehicles.filter(v =>
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

            {/* Buscador */}
            {vehicles.length > 0 && (
                <TextField
                    placeholder="Buscar por matrícula, marca o modelo..."
                    fullWidth
                    margin="normal"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                />
            )}

            {/* Empty state */}
            {vehicles.length === 0 && (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="h6" mb={1}>No tienes vehículos</Typography>
                    <Typography color="text.secondary" mb={2}>Añade tu primer vehículo para empezar</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>Añadir vehículo</Button>
                </Paper>
            )}

            {/* Lista */}
            <Stack spacing={2} mt={2}>
                {filteredVehicles.map(vehicle => {
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
                                "&:hover": { boxShadow: 6 }
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <DirectionsCarIcon fontSize="large" color="primary" />
                                <Box>
                                    <Typography fontWeight={600}>
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
                        <TextField label="Matrícula" value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} />
                        <TextField label="Marca" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
                        <TextField label="Modelo" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
                        <TextField label="Año" type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave}>Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteStep.open} onClose={() => setDeleteStep({ open: false, vehicle: null, confirmTwice: false })}>
                <DialogTitle>
                    {deleteStep.confirmTwice ? "¿Seguro? Esta acción es irreversible" : "Eliminar vehículo"}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {deleteStep.confirmTwice
                            ? "Pulsa eliminar otra vez para confirmar definitivamente."
                            : `¿Deseas eliminar el vehículo ${deleteStep.vehicle?.plate}?`}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteStep({ open: false, vehicle: null, confirmTwice: false })}>
                        Cancelar
                    </Button>
                    <Button color="error" variant="contained" onClick={handleDeleteConfirm}>Eliminar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
