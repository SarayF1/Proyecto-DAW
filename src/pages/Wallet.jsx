import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    TextField,
    Alert,
    Grid,
    Stack
} from "@mui/material";

const INVOICES_KEY = "invoices";

export default function Wallet() {
    const [saldo, setSaldo] = useState(12.5);
    const [moneda, setMoneda] = useState("EUR");
    const [codigo, setCodigo] = useState("");
    const [mensajePromo, setMensajePromo] = useState("");
    const [codigoUsado, setCodigoUsado] = useState([]);
    const [historial, setHistorial] = useState([
        { tipo: "Gasto", descripcion: "Parking Centro", cantidad: 2, fecha: "2026-01-15" }
    ]);

    const [invoices, setInvoices] = useState([]);

    // Cargar facturas de localStorage
    useEffect(() => {
        const storedInvoices = localStorage.getItem(INVOICES_KEY);
        if (storedInvoices) {
            const invs = JSON.parse(storedInvoices);

            // Pagar facturas automáticamente si no están pagadas
            const unpaid = invs.filter(inv => !inv.paid);
            unpaid.forEach(inv => {
                setSaldo(prev => prev - inv.amount);
                setHistorial(prev => [
                    ...prev,
                    { tipo: "Gasto", descripcion: `Factura ${inv.zona} (${inv.vehicle})`, cantidad: inv.amount, fecha: inv.date }
                ]);
            });

            // Marcar todas las facturas como pagadas
            const updated = invs.map(inv => ({ ...inv, paid: true }));
            localStorage.setItem(INVOICES_KEY, JSON.stringify(updated));
            setInvoices(updated);
        }
    }, []);

    // Función para agregar dinero
    const agregarDinero = () => {
        const cantidad = prompt("Ingresa la cantidad a agregar (solo números positivos):");
        const num = parseFloat(cantidad);

        if (isNaN(num)) return alert("Cantidad inválida");
        if (num <= 0) return alert("Solo se permiten cantidades mayores a 0");

        setSaldo(prev => prev + num);
        setHistorial(prev => [...prev, { tipo: "Ingreso", descripcion: "Depósito manual", cantidad: num, fecha: new Date().toLocaleDateString() }]);
    };

    const handleMonedaChange = (event) => setMoneda(event.target.value);

    const convertirSaldo = () => {
        switch (moneda) {
            case "USD": return (saldo * 1.1).toFixed(2);
            case "GBP": return (saldo * 0.88).toFixed(2);
            default: return saldo.toFixed(2);
        }
    };

    const aplicarCodigo = () => {
        const code = codigo.toUpperCase().trim();
        if (!code) {
            setMensajePromo("Introduce un código promocional.");
            return;
        }

        const codigosValidos = {
            "PRUEBA10": 10,
            "BONUS5": 5,
            "REGALO20": 20
        };

        if (codigosValidos[code]) {
            if (codigoUsado.includes(code)) {
                setMensajePromo(`❌ El código ${code} ya ha sido utilizado.`);
            } else {
                const cantidad = codigosValidos[code];
                setSaldo(prev => prev + cantidad);
                setHistorial(prev => [...prev, { tipo: "Ingreso", descripcion: `Código ${code}`, cantidad, fecha: new Date().toLocaleDateString() }]);
                setCodigoUsado(prev => [...prev, code]);
                setMensajePromo(`🎉 Código ${code} aplicado: +${cantidad} € añadidos.`);
            }
        } else {
            setMensajePromo("❌ Código promocional no válido.");
        }
        setCodigo("");
    };

    return (
        <Box p={3}>
            <Typography variant="h4" mb={2}>Monedero</Typography>

            <Paper sx={{ p: 3 }}>
                {/* Resumen */}
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6">{convertirSaldo()} {moneda}</Typography>
                            <Typography variant="body2" color="text.secondary">Saldo actual</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6">{historial.filter(h => h.tipo === "Ingreso").reduce((a, b) => a + b.cantidad, 0)} €</Typography>
                            <Typography variant="body2" color="text.secondary">Total ingresado</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6">{historial.filter(h => h.tipo === "Gasto").reduce((a, b) => a + b.cantidad, 0)} €</Typography>
                            <Typography variant="body2" color="text.secondary">Total gastado</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Acciones */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={3} mb={3}>
                    <Button variant="contained" onClick={agregarDinero}>Agregar dinero</Button>

                    <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Moneda</InputLabel>
                        <Select value={moneda} label="Moneda" onChange={handleMonedaChange}>
                            <MenuItem value="EUR">€ EUR</MenuItem>
                            <MenuItem value="USD">$ USD</MenuItem>
                            <MenuItem value="GBP">£ GBP</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                {/* Código promocional */}
                <Box mt={3}>
                    <Typography variant="h6" mb={1}>Código promocional</Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
                        <TextField
                            label="Introduce tu código"
                            value={codigo}
                            onChange={e => setCodigo(e.target.value)}
                            size="small"
                        />
                        <Button variant="contained" color="secondary" onClick={aplicarCodigo}>
                            Aplicar
                        </Button>
                    </Stack>
                    {mensajePromo && <Alert severity="info" sx={{ mb: 2 }}>{mensajePromo}</Alert>}
                </Box>

                {/* Facturas */}
                <Box mt={3}>
                    <Typography variant="h6" mb={1}>Facturas</Typography>
                    {invoices.length === 0 && <Typography color="text.secondary">No hay facturas pendientes</Typography>}
                    <Stack spacing={2}>
                        {invoices.map(inv => (
                            <Paper key={inv.id} sx={{ p: 2 }}>
                                <Typography fontWeight={600}>{inv.zona}</Typography>
                                <Typography variant="body2">Vehículo: {inv.vehicle}</Typography>
                                <Typography variant="body2">Tiempo: {inv.minutes} min</Typography>
                                <Typography variant="body2">Fecha: {inv.date}</Typography>
                                <Typography fontWeight={600} mt={1}>{inv.amount} €</Typography>
                                <Typography color="success.main" variant="body2">
                                    Pagado automáticamente
                                </Typography>
                            </Paper>
                        ))}
                    </Stack>
                </Box>

                {/* Historial */}
                <Box mt={3}>
                    <Typography variant="h6" mb={1}>Historial de movimientos</Typography>
                    <Paper sx={{ maxHeight: 250, overflowY: "auto", p: 2 }}>
                        {historial.length === 0 ? (
                            <Typography color="text.secondary">No hay movimientos aún</Typography>
                        ) : (
                            historial.map((h, i) => (
                                <Stack key={i} direction="row" justifyContent="space-between" mb={1}>
                                    <Typography>{h.descripcion}</Typography>
                                    <Typography color={h.tipo === "Ingreso" ? "success.main" : "error.main"}>
                                        {h.tipo === "Ingreso" ? "+" : "-"}{h.cantidad} €
                                    </Typography>
                                </Stack>
                            ))
                        )}
                    </Paper>
                </Box>
            </Paper>
        </Box>
    );
}
