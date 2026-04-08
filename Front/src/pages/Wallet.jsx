// import { useEffect, useState, useCallback } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   Button,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   TextField,
//   Alert,
//   Grid,
//   Stack,
// } from "@mui/material";

// const API_URL = "https://myparking-backend.onrender.com/api";

// export default function Wallet() {
//   const [saldo, setSaldo] = useState(0);
//   const [moneda, setMoneda] = useState("EUR");
//   const [movimientos, setMovimientos] = useState([]);
//   const [codigo, setCodigo] = useState("");
//   const [mensaje, setMensaje] = useState("");
//   const [error, setError] = useState("");
//   const token = localStorage.getItem("token");

//   // Función para cargar monedero y movimientos (reutilizable)
//   const fetchMonedero = useCallback(async () => {
//     if (!token) {
//       setError("No autenticado");
//       return;
//     }

//     try {
//       setError("");
//       const resMonedero = await fetch(`${API_URL}/me/monedero`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!resMonedero.ok) {
//         const err = await resMonedero.json().catch(() => ({}));
//         throw new Error(err.error || "Error al cargar monedero");
//       }
//       const monedero = await resMonedero.json();

//       const resMovs = await fetch(`${API_URL}/me/monedero/movimientos`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!resMovs.ok) {
//         const err = await resMovs.json().catch(() => ({}));
//         throw new Error(err.error || "Error al cargar movimientos");
//       }
//       const movs = await resMovs.json();

//       setSaldo(Number(monedero.saldo));
//       setMoneda(monedero.moneda);
//       setMovimientos(Array.isArray(movs) ? movs : []);
//       setError("");
//     } catch (err) {
//       console.error("fetchMonedero:", err);
//       setError(err.message || "No se pudo cargar el monedero");
//     }
//   }, [token]);

//   // Cargar al montar y cuando cambie token
//   useEffect(() => {
//     fetchMonedero();
//   }, [fetchMonedero]);

//   /* ===========================
//      Recarga manual
//      =========================== */
//   const agregarDinero = async () => {
//     if (!token) {
//       setError("No autenticado");
//       return;
//     }

//     const cantidad = prompt("Cantidad a recargar:");
//     const num = Number(cantidad);
//     if (!num || num <= 0) return;

//     try {
//       setError("");
//       const res = await fetch(`${API_URL}/me/monedero/recarga`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ cantidad: num }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Error al recargar");

//       setSaldo(Number(data.saldo));
//       setMensaje("Recarga realizada correctamente");
//       setTimeout(() => setMensaje(""), 3000);

//       // refrescar movimientos (para ver el nuevo ingreso)
//       await fetchMonedero();
//     } catch (err) {
//       console.error("agregarDinero:", err);
//       setError(err.message || "Error al recargar saldo");
//       setMensaje("");
//     }
//   };

//   /* ===========================
//      Código promocional
//      =========================== */
//   const aplicarCodigo = async () => {
//     if (!token) {
//       setError("No autenticado");
//       return;
//     }
//     if (!codigo) return;

//     try {
//       setError("");
//       const res = await fetch(`${API_URL}/me/monedero/codigo`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ codigo }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Código inválido");

//       setSaldo(Number(data.saldo));
//       setMensaje(`Código ${codigo} aplicado`);
//       setCodigo("");
//       setTimeout(() => setMensaje(""), 3000);

//       // refrescar movimientos (para ver el ingreso del código)
//       await fetchMonedero();
//     } catch (err) {
//       console.error("aplicarCodigo:", err);
//       setError(err.message || "Código inválido");
//       setMensaje("");
//     }
//   };

//   /* ===========================
//      Totales
//      =========================== */
//   const totalIngresos = movimientos
//     .filter((m) => m.tipo === "INGRESO")
//     .reduce((a, b) => a + Number(b.cantidad), 0);

//   const totalGastos = movimientos
//     .filter((m) => m.tipo === "GASTO")
//     .reduce((a, b) => a + Number(b.cantidad), 0);

//   return (
//     <Box p={3}>
//       <Typography variant="h4" mb={2}>
//         Monedero
//       </Typography>

//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error}
//         </Alert>
//       )}
//       {mensaje && (
//         <Alert severity="success" sx={{ mb: 2 }}>
//           {mensaje}
//         </Alert>
//       )}

//       <Paper sx={{ p: 3 }}>
//         {/* Resumen */}
//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={4}>
//             <Paper sx={{ p: 2, textAlign: "center" }}>
//               <Typography variant="h6">
//                 {Number(saldo).toFixed(2)} {moneda}
//               </Typography>

//               <Typography variant="body2">Saldo actual</Typography>
//             </Paper>
//           </Grid>
//           <Grid item xs={12} sm={4}>
//             <Paper sx={{ p: 2, textAlign: "center" }}>
//               <Typography variant="h6">{totalIngresos.toFixed(2)} €</Typography>
//               <Typography variant="body2">Total ingresado</Typography>
//             </Paper>
//           </Grid>
//           <Grid item xs={12} sm={4}>
//             <Paper sx={{ p: 2, textAlign: "center" }}>
//               <Typography variant="h6">{totalGastos.toFixed(2)} €</Typography>
//               <Typography variant="body2">Total gastado</Typography>
//             </Paper>
//           </Grid>
//         </Grid>

//         {/* Acciones */}
//         <Stack direction="row" spacing={2} mt={3}>
//           <Button variant="contained" onClick={agregarDinero}>
//             Agregar dinero
//           </Button>

//           <FormControl sx={{ minWidth: 120 }}>
//             <InputLabel>Moneda</InputLabel>
//             <Select value={moneda} label="Moneda" disabled>
//               <MenuItem value="EUR">€ EUR</MenuItem>
//               <MenuItem value="USD">$ USD</MenuItem>
//               <MenuItem value="GBP">£ GBP</MenuItem>
//             </Select>
//           </FormControl>
//         </Stack>

//         {/* Código promo */}
//         <Box mt={3}>
//           <Typography variant="h6">Código promocional</Typography>
//           <Stack direction="row" spacing={2} mt={1}>
//             <TextField
//               size="small"
//               label="Código"
//               value={codigo}
//               onChange={(e) => setCodigo(e.target.value)}
//             />
//             <Button variant="contained" onClick={aplicarCodigo}>
//               Aplicar
//             </Button>
//           </Stack>
//         </Box>

//         {/* Historial */}
//         <Box mt={4}>
//           <Typography variant="h6" mb={1}>
//             Historial de movimientos
//           </Typography>
//           <Paper sx={{ maxHeight: 250, overflowY: "auto", p: 2 }}>
//             {movimientos.length === 0 ? (
//               <Typography color="text.secondary">No hay movimientos</Typography>
//             ) : (
//               movimientos.map((m) => (
//                 <Stack key={m.idMovimiento} direction="row" justifyContent="space-between" mb={1}>
//                   <Typography>{m.descripcion}</Typography>
//                   <Typography color={m.tipo === "INGRESO" ? "success.main" : "error.main"}>
//                     {m.tipo === "INGRESO" ? "+" : "-"}
//                     {Number(m.cantidad).toFixed(2)} €
//                   </Typography>
//                 </Stack>
//               ))
//             )}
//           </Paper>
//         </Box>
//       </Paper>
//     </Box>
//   );
// }

// take 2

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
          backgroundColor: "#E3F2FD", // azul claro tipo bg-accent
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
          <Avatar sx={{ bgcolor: "#BBDEFB", width: 56, height: 56 }}>
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