// src/pages/Invoices.jsx
import { useEffect, useState } from "react";
import { Typography, Paper, Stack } from "@mui/material";

const INVOICES_KEY = "invoices";

export default function Invoices() {
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem(INVOICES_KEY);
        if (stored) setInvoices(JSON.parse(stored));
    }, []);

    return (
        <>
            <Typography variant="h4" mb={2}>
                Facturas
            </Typography>

            {invoices.length === 0 && (
                <Typography color="text.secondary">
                    No hay facturas todavía
                </Typography>
            )}

            <Stack spacing={2}>
                {invoices.map((inv) => (
                    <Paper key={inv.id} sx={{ p: 2 }}>
                        <Typography fontWeight={600}>
                            {inv.zona}
                        </Typography>
                        <Typography variant="body2">
                            Vehículo: {inv.vehicle}
                        </Typography>
                        <Typography variant="body2">
                            Tiempo: {inv.minutes} min
                        </Typography>
                        <Typography variant="body2">
                            Fecha: {inv.date}
                        </Typography>
                        <Typography fontWeight={600} mt={1}>
                            {inv.amount} €
                        </Typography>
                    </Paper>
                ))}
            </Stack>
        </>
    );
}
