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

// take 2

// // src/pages/Wallet.jsx
// import { useEffect, useState, useCallback } from "react";
// import {
//   Box, Typography, Paper, Button, Stack, Grid, Chip,
//   CircularProgress, Alert, Snackbar, Divider, TextField, Dialog,
//   DialogTitle, DialogContent, DialogActions, Avatar,
// } from "@mui/material";
// import {
//   AccountBalanceWallet, TrendingUp, TrendingDown,
//   Add, ArrowDownward, ArrowUpward, LocalOffer,
// } from "@mui/icons-material";

// const API_URL = "https://myparking-backend.onrender.com/api";

// const fmtDate = (d) => {
//   try {
//     return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
//   } catch { return "—"; }
// };
// const fmtTime = (d) => {
//   try { return new Date(d).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }); }
//   catch { return ""; }
// };

// export default function WalletPage() {
//   const [saldo, setSaldo] = useState(0);
//   const [movimientos, setMovimientos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [snackbar, setSnackbar] = useState({ open: false, msg: "", sev: "success" });
//   const [rechargeDialog, setRechargeDialog] = useState(false);
//   const [promoDialog, setPromoDialog] = useState(false);
//   const [amount, setAmount] = useState("");
//   const [codigo, setCodigo] = useState("");
//   const [saving, setSaving] = useState(false);
//   const token = localStorage.getItem("token");

//   const fetchMonedero = useCallback(async () => {
//     if (!token) { setError("No autenticado"); setLoading(false); return; }
//     try {
//       const [mRes, movRes] = await Promise.all([
//         fetch(`${API_URL}/me/monedero`, { headers: { Authorization: `Bearer ${token}` } }),
//         fetch(`${API_URL}/me/monedero/movimientos`, { headers: { Authorization: `Bearer ${token}` } }),
//       ]);
//       const monedero = await mRes.json();
//       const movs = await movRes.json();
//       setSaldo(Number(monedero.saldo));
//       setMovimientos(Array.isArray(movs) ? movs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) : []);
//       setError("");
//     } catch { setError("Error al cargar el monedero"); }
//     finally { setLoading(false); }
//   }, [token]);

//   useEffect(() => { fetchMonedero(); }, [fetchMonedero]);

//   const handleRecharge = async () => {
//     const num = Number(amount);
//     if (!num || num <= 0) { setSnackbar({ open: true, msg: "Introduce un importe válido", sev: "error" }); return; }
//     setSaving(true);
//     try {
//       const res = await fetch(`${API_URL}/me/monedero/recarga`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ cantidad: num }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Error al recargar");
//       setSaldo(Number(data.saldo));
//       setRechargeDialog(false);
//       setAmount("");
//       setSnackbar({ open: true, msg: `Recarga de ${num.toFixed(2)} € realizada`, sev: "success" });
//       await fetchMonedero();
//     } catch (err) { setSnackbar({ open: true, msg: err.message, sev: "error" }); }
//     finally { setSaving(false); }
//   };

//   const handlePromo = async () => {
//     if (!codigo.trim()) return;
//     setSaving(true);
//     try {
//       const res = await fetch(`${API_URL}/me/monedero/codigo`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ codigo }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Código inválido");
//       setSaldo(Number(data.saldo));
//       setPromoDialog(false);
//       setCodigo("");
//       setSnackbar({ open: true, msg: `Código aplicado correctamente`, sev: "success" });
//       await fetchMonedero();
//     } catch (err) { setSnackbar({ open: true, msg: err.message, sev: "error" }); }
//     finally { setSaving(false); }
//   };

//   const totalIngresos = movimientos.filter((m) => m.tipo === "INGRESO").reduce((a, b) => a + Number(b.cantidad), 0);
//   const totalGastos = movimientos.filter((m) => m.tipo === "GASTO").reduce((a, b) => a + Number(b.cantidad), 0);

//   if (loading) return (
//     <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
//       <CircularProgress />
//     </Box>
//   );

//   return (
//     <Box sx={{ maxWidth: 800, mx: "auto" }}>
//       <Typography variant="h4" fontWeight={800} mb={0.5} sx={{ color: "#0d1117", letterSpacing: "-0.02em" }}>
//         Monedero
//       </Typography>
//       <Typography sx={{ color: "rgba(0,0,0,0.5)", mb: 3, fontSize: "0.9rem" }}>
//         Gestiona tu saldo y consulta el historial de movimientos
//       </Typography>

//       {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

//       {/* ── Tarjeta de saldo ── */}
//       <Paper
//         sx={{
//           p: 0, mb: 3, borderRadius: 3, overflow: "hidden",
//           background: "linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%)",
//           border: "1px solid rgba(0,230,118,0.2)",
//           boxShadow: "0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,230,118,0.08)",
//           position: "relative",
//         }}
//       >
//         {/* Decoración */}
//         <Box sx={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,230,118,0.08), transparent 70%)", pointerEvents: "none" }} />
//         <Box sx={{ position: "absolute", bottom: -30, left: -30, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,77,255,0.07), transparent 70%)", pointerEvents: "none" }} />

//         <Box sx={{ p: 3, position: "relative" }}>
//           <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
//             <Box>
//               <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
//                 <AccountBalanceWallet sx={{ color: "#00e676", fontSize: 18 }} />
//                 <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
//                   Saldo disponible
//                 </Typography>
//               </Stack>
//               <Typography sx={{ fontSize: "3rem", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>
//                 {saldo.toFixed(2)}
//                 <Typography component="span" sx={{ fontSize: "1.5rem", color: "#00e676", fontWeight: 700, ml: 0.5 }}>€</Typography>
//               </Typography>
//             </Box>
//             <Avatar sx={{ width: 56, height: 56, background: "rgba(0,230,118,0.12)", border: "1px solid rgba(0,230,118,0.3)" }}>
//               <AccountBalanceWallet sx={{ color: "#00e676", fontSize: 26 }} />
//             </Avatar>
//           </Stack>

//           <Grid container spacing={2} mt={1.5}>
//             <Grid item xs={6}>
//               <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(0,230,118,0.06)", border: "1px solid rgba(0,230,118,0.12)" }}>
//                 <Stack direction="row" alignItems="center" spacing={0.5} mb={0.3}>
//                   <ArrowDownward sx={{ fontSize: 13, color: "#00e676" }} />
//                   <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total ingresado</Typography>
//                 </Stack>
//                 <Typography sx={{ fontWeight: 700, color: "#00e676" }}>+{totalIngresos.toFixed(2)} €</Typography>
//               </Box>
//             </Grid>
//             <Grid item xs={6}>
//               <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(255,82,82,0.06)", border: "1px solid rgba(255,82,82,0.12)" }}>
//                 <Stack direction="row" alignItems="center" spacing={0.5} mb={0.3}>
//                   <ArrowUpward sx={{ fontSize: 13, color: "#ff5252" }} />
//                   <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total gastado</Typography>
//                 </Stack>
//                 <Typography sx={{ fontWeight: 700, color: "#ff5252" }}>-{totalGastos.toFixed(2)} €</Typography>
//               </Box>
//             </Grid>
//           </Grid>

//           <Stack direction="row" spacing={1.5} mt={2.5}>
//             <Button
//               variant="contained"
//               startIcon={<Add />}
//               onClick={() => setRechargeDialog(true)}
//               sx={{ borderRadius: 2, fontWeight: 700, flex: 1, background: "linear-gradient(135deg, #00e676, #00bcd4)", color: "#000", "&:hover": { background: "linear-gradient(135deg, #00c853, #00acc1)" } }}
//             >
//               Recargar saldo
//             </Button>
//             <Button
//               variant="outlined"
//               startIcon={<LocalOffer />}
//               onClick={() => setPromoDialog(true)}
//               sx={{ borderRadius: 2, fontWeight: 600, borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", "&:hover": { borderColor: "#7c4dff", bgcolor: "rgba(124,77,255,0.08)" } }}
//             >
//               Código promo
//             </Button>
//           </Stack>
//         </Box>
//       </Paper>

//       {/* ── Movimientos ── */}
//       <Paper sx={{ p: 2.5, borderRadius: 3, background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
//         <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
//           <Stack direction="row" alignItems="center" spacing={1}>
//             <TrendingUp sx={{ color: "#00e676", fontSize: 18 }} />
//             <Typography fontWeight={700} sx={{ color: "#fff" }}>Historial de movimientos</Typography>
//           </Stack>
//           <Chip
//             label={`${movimientos.length} operaciones`}
//             size="small"
//             sx={{ bgcolor: "rgba(0,230,118,0.1)", color: "#00e676", fontWeight: 700, fontSize: "0.68rem", border: "1px solid rgba(0,230,118,0.2)" }}
//           />
//         </Stack>

//         {movimientos.length === 0 ? (
//           <Box textAlign="center" py={4}>
//             <AccountBalanceWallet sx={{ fontSize: 40, color: "rgba(255,255,255,0.1)", mb: 1 }} />
//             <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>Sin movimientos todavía</Typography>
//           </Box>
//         ) : (
//           <Stack spacing={0.8} sx={{ maxHeight: 420, overflowY: "auto", pr: 0.5 }}>
//             {movimientos.map((m) => {
//               const isIngreso = m.tipo === "INGRESO";
//               const color = isIngreso ? "#00e676" : "#ff5252";
//               return (
//                 <Stack
//                   key={m.idMovimiento}
//                   direction="row"
//                   alignItems="center"
//                   spacing={1.5}
//                   sx={{
//                     p: 1.5, borderRadius: 2,
//                     bgcolor: `${color}06`,
//                     border: `1px solid ${color}14`,
//                     transition: "background 0.15s",
//                     "&:hover": { bgcolor: `${color}0d` },
//                   }}
//                 >
//                   <Avatar sx={{ width: 36, height: 36, bgcolor: `${color}15`, border: `1px solid ${color}30`, flexShrink: 0 }}>
//                     {isIngreso
//                       ? <ArrowDownward sx={{ fontSize: 17, color }} />
//                       : <ArrowUpward sx={{ fontSize: 17, color }} />
//                     }
//                   </Avatar>
//                   <Box flex={1} minWidth={0}>
//                     <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff" }} noWrap>
//                       {m.descripcion || "Movimiento"}
//                     </Typography>
//                     <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)" }}>
//                       {fmtDate(m.fecha)} · {fmtTime(m.fecha)}
//                     </Typography>
//                   </Box>
//                   <Box textAlign="right" flexShrink={0}>
//                     <Typography sx={{ fontWeight: 800, color, fontSize: "0.9rem", fontVariantNumeric: "tabular-nums" }}>
//                       {isIngreso ? "+" : "-"}{Number(m.cantidad).toFixed(2)} €
//                     </Typography>
//                     <Chip
//                       label={m.tipo}
//                       size="small"
//                       sx={{
//                         height: 16, fontSize: "0.58rem", fontWeight: 700,
//                         bgcolor: `${color}15`, color, border: `1px solid ${color}25`,
//                       }}
//                     />
//                   </Box>
//                 </Stack>
//               );
//             })}
//           </Stack>
//         )}
//       </Paper>

//       {/* Dialog Recarga */}
//       <Dialog open={rechargeDialog} onClose={() => setRechargeDialog(false)} PaperProps={{ sx: { borderRadius: 3, background: "#111827", border: "1px solid rgba(255,255,255,0.08)" } }}>
//         <DialogTitle sx={{ color: "#fff", fontWeight: 700 }}>Recargar saldo</DialogTitle>
//         <DialogContent>
//           <Typography sx={{ color: "rgba(255,255,255,0.5)", mb: 2, fontSize: "0.85rem" }}>
//             Introduce el importe que deseas añadir a tu monedero
//           </Typography>
//           <TextField
//             autoFocus fullWidth label="Importe (€)" type="number"
//             value={amount} onChange={(e) => setAmount(e.target.value)}
//             inputProps={{ min: 1, step: 0.5 }}
//             InputProps={{ endAdornment: <Typography sx={{ color: "#00e676", fontWeight: 700, mr: 1 }}>€</Typography> }}
//           />
//           <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
//             {[5, 10, 20, 50].map((v) => (
//               <Chip key={v} label={`${v} €`} clickable onClick={() => setAmount(String(v))}
//                 sx={{ bgcolor: amount === String(v) ? "#00e67622" : "rgba(255,255,255,0.05)", color: amount === String(v) ? "#00e676" : "rgba(255,255,255,0.6)", border: `1px solid ${amount === String(v) ? "#00e67644" : "rgba(255,255,255,0.1)"}`, fontWeight: 600 }} />
//             ))}
//           </Stack>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 3 }}>
//           <Button onClick={() => setRechargeDialog(false)} sx={{ color: "rgba(255,255,255,0.5)" }}>Cancelar</Button>
//           <Button variant="contained" onClick={handleRecharge} disabled={saving}
//             sx={{ background: "linear-gradient(135deg, #00e676, #00bcd4)", color: "#000", fontWeight: 700, borderRadius: 2 }}>
//             {saving ? "Procesando…" : "Recargar"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Dialog Código promo */}
//       <Dialog open={promoDialog} onClose={() => setPromoDialog(false)} PaperProps={{ sx: { borderRadius: 3, background: "#111827", border: "1px solid rgba(255,255,255,0.08)" } }}>
//         <DialogTitle sx={{ color: "#fff", fontWeight: 700 }}>Código promocional</DialogTitle>
//         <DialogContent>
//           <Typography sx={{ color: "rgba(255,255,255,0.5)", mb: 2, fontSize: "0.85rem" }}>
//             Introduce tu código para aplicar el descuento o bonificación
//           </Typography>
//           <TextField autoFocus fullWidth label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())}
//             InputProps={{ startAdornment: <LocalOffer sx={{ mr: 1, color: "#7c4dff", fontSize: 18 }} /> }} />
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 3 }}>
//           <Button onClick={() => setPromoDialog(false)} sx={{ color: "rgba(255,255,255,0.5)" }}>Cancelar</Button>
//           <Button variant="contained" onClick={handlePromo} disabled={saving || !codigo.trim()}
//             sx={{ background: "linear-gradient(135deg, #7c4dff, #e040fb)", fontWeight: 700, borderRadius: 2 }}>
//             {saving ? "Aplicando…" : "Aplicar"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
//         <Alert severity={snackbar.sev} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.msg}</Alert>
//       </Snackbar>
//     </Box>
//   );
// }