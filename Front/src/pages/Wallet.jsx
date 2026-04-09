import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Avatar,
  Alert,
} from "@mui/material";
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight } from "lucide-react";

const API_URL = "https://myparking-backend.onrender.com/api";

export default function WalletPage() {
  const [saldo, setSaldo] = useState(0);
  const [movimientos, setMovimientos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const fetchMonedero = useCallback(async () => {
    if (!token) {
      setError("No autenticado");
      return;
    }
    try {
      const resMonedero = await fetch(`${API_URL}/me/monedero`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const monedero = await resMonedero.json();
      setSaldo(Number(monedero.saldo));

      const resMovs = await fetch(`${API_URL}/me/monedero/movimientos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const movs = await resMovs.json();
      setMovimientos(Array.isArray(movs) ? movs : []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Error al cargar monedero");
    }
  }, [token]);

  useEffect(() => {
    fetchMonedero();
  }, [fetchMonedero]);

  const agregarDinero = async () => {
    if (!token) {
      setError("No autenticado");
      return;
    }
    const cantidad = prompt("Cantidad a recargar:");
    const num = Number(cantidad);
    if (!num || num <= 0) return;

    try {
      const res = await fetch(`${API_URL}/me/monedero/recarga`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cantidad: num }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al recargar");
      setSaldo(Number(data.saldo));
      setMensaje("Recarga realizada correctamente");
      setTimeout(() => setMensaje(""), 3000);

      await fetchMonedero();
    } catch (err) {
      console.error(err);
      setError("Error al recargar saldo");
    }
  };

  return (
    <Box p={3} maxWidth="md" mx="auto">
      <Typography variant="h4" mb={3} fontWeight="bold">
        Monedero
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {mensaje && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {mensaje}
        </Alert>
      )}

      {/* Resumen de saldo */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: "#b5d3e9", // azul claro tipo bg-accent
          color: "#0D47A1", // texto azul oscuro tipo text-accent-foreground
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" opacity={0.8} fontWeight="bold">
              Saldo disponible
            </Typography>
            <Typography variant="h3" fontWeight="bold" mt={1}>
              {saldo.toFixed(2)} €
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: "#cfe7fc", width: 56, height: 56 }}>
            <Wallet color="#0D47A1" size={28} />
          </Avatar>
        </Stack>
        <Button
          variant="contained"
          sx={{ mt: 3, backgroundColor: "#1976d2", "&:hover": { backgroundColor: "#1565c0" } }}
          onClick={agregarDinero}
          startIcon={<Plus />}
        >
          Recargar saldo
        </Button>
      </Paper>

      {/* Últimos movimientos */}
      <Typography variant="h6" mb={2} fontWeight="bold">
        Últimos movimientos
      </Typography>
      <Stack spacing={2}>
        {movimientos.length === 0 && (
          <Typography color="text.secondary">No hay movimientos</Typography>
        )}
        {movimientos.map((tx) => (
          <Paper key={tx.idMovimiento} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: tx.tipo === "INGRESO" ? "#BBDEFB" : "#FFCDD2", // azul claro para ingreso, rojo claro para gasto
                width: 40,
                height: 40,
              }}
            >
              {tx.tipo === "INGRESO" ? (
                <ArrowDownLeft color="#1976d2" size={20} />
              ) : (
                <ArrowUpRight color="#D32F2F" size={20} />
              )}
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography fontWeight={500} fontSize="0.875rem">
                {tx.descripcion}
              </Typography>
              <Typography fontSize="0.75rem" color="text.secondary">
                {tx.fecha}
              </Typography>
            </Box>
            <Typography
              fontWeight={600}
              color={tx.tipo === "INGRESO" ? "#1976d2" : "#D32F2F"}
            >
              {tx.tipo === "INGRESO" ? "+" : "-"}
              {Number(tx.cantidad).toFixed(2)} €
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
