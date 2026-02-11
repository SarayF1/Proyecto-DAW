// src/pages/Invoices.jsx
import { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";

const API_URL = "http://localhost:3001/api";

export default function Invoices() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Debes iniciar sesión para ver tus facturas.");
      setLoading(false);
      return;
    }

    const fetchFacturas = async () => {
      try {
        const res = await fetch(
          `${API_URL}/me/monedero/movimientos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("No se pudieron cargar las facturas");
        }

        const data = await res.json();

        // Solo gastos → facturas
        const gastos = (Array.isArray(data) ? data : [])
          .filter((m) => m.tipo === "GASTO")
          .sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
          );

        setFacturas(gastos);
      } catch (err) {
        console.error(err);
        setError("Error al cargar las facturas.");
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, [token]);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        Facturas
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && facturas.length === 0 && (
        <Typography color="text.secondary">
          No hay facturas todavía
        </Typography>
      )}

      <Stack spacing={2} mt={2}>
        {facturas.map((f) => (
          <Paper key={f.idMovimiento} sx={{ p: 2 }}>
            <Typography fontWeight={600}>
              {f.descripcion}
            </Typography>

            <Typography variant="body2">
              Fecha:{" "}
              {new Date(f.fecha).toLocaleString()}
            </Typography>

            <Typography
              fontWeight={600}
              color="error.main"
              mt={1}
            >
              -{Number(f.cantidad).toFixed(2)} €
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
