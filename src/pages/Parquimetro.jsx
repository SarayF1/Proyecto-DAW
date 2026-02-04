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
} from "@mui/material";

const zonas = [
    { id: "AZUL", nombre: "Zona Azul", precioHora: 1.5 },
    { id: "VERDE", nombre: "Zona Verde", precioHora: 1.0 },
    { id: "ROJA", nombre: "Zona Roja", precioHora: 2.0 },
];

const VEHICLES_KEY = "vehicles";
const INVOICES_KEY = "invoices";

export default function Parquimetro() {
    const [vehicles, setVehicles] = useState([]);
    const [vehicleId, setVehicleId] = useState("");
    const [zona, setZona] = useState("");
    const [minutes, setMinutes] = useState(30);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(VEHICLES_KEY);
        if (stored) setVehicles(JSON.parse(stored));
    }, []);

    const selectedZona = zonas.find((z) => z.id === zona);
    const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

    const price =
        selectedZona ? (minutes / 60) * selectedZona.precioHora : 0;

    const iniciarParquimetro = () => {
        if (!selectedZona || !selectedVehicle) return;

        const invoices =
            JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];

        const newInvoice = {
            id: Date.now(),
            vehicle: selectedVehicle.plate,
            zona: selectedZona.nombre,
            minutes,
            amount: price.toFixed(2),
            date: new Date().toLocaleString(),
        };

        localStorage.setItem(
            INVOICES_KEY,
            JSON.stringify([newInvoice, ...invoices])
        );

        setStarted(true);
    };

    return (
        <Box p={3} maxWidth="600px" mx="auto">
            <Typography variant="h4" mb={3}>
                🅿️ Parquímetro
            </Typography>

            <Paper sx={{ p: 3 }}>
                <Stack spacing={3}>
                    {vehicles.length === 0 && (
                        <Alert severity="warning">
                            No tienes vehículos añadidos.
                        </Alert>
                    )}

                    <FormControl fullWidth disabled={!vehicles.length}>
                        <InputLabel>Vehículo</InputLabel>
                        <Select
                            value={vehicleId}
                            label="Vehículo"
                            onChange={(e) => setVehicleId(e.target.value)}
                        >
                            {vehicles.map((v) => (
                                <MenuItem key={v.id} value={v.id}>
                                    {v.plate} – {v.brand} {v.model}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Zona</InputLabel>
                        <Select
                            value={zona}
                            label="Zona"
                            onChange={(e) => setZona(e.target.value)}
                        >
                            {zonas.map((z) => (
                                <MenuItem key={z.id} value={z.id}>
                                    {z.nombre} ({z.precioHora} €/h)
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box>
                        <Typography>
                            Tiempo: {minutes} minutos
                        </Typography>
                        <Slider
                            value={minutes}
                            min={15}
                            max={240}
                            step={15}
                            marks
                            onChange={(e, value) => setMinutes(value)}
                        />
                    </Box>

                    <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h6">
                            Total: {price.toFixed(2)} €
                        </Typography>
                    </Paper>

                    <Button
                        variant="contained"
                        size="large"
                        disabled={!vehicleId || !zona}
                        onClick={iniciarParquimetro}
                    >
                        Iniciar parquímetro
                    </Button>

                    {started && (
                        <Alert severity="success">
                            Parquímetro iniciado y factura generada
                        </Alert>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}
