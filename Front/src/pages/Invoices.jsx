// src/pages/Invoices.jsx
import { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Box,
  Button,
} from "@mui/material";
import jsPDF from "jspdf";
import logo from "../assets/logo.png";
import QRCode from "qrcode";

const API_URL = "https://myparking-backend.onrender.com/api";

export default function Invoices() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const getBase64ImageFromUrl = async (url) => {
  const data = await fetch(url);
  const blob = await data.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result);
  });
};

const generarQR = async (texto) => {
  return await QRCode.toDataURL(texto);
};
  
 const descargarFactura = async (factura) => {
  const doc = new jsPDF();

  const subtotal = Number(factura.cantidad);
  const iva = subtotal * 0.21;
  const total = subtotal + iva;

  const logoBase64 = await getBase64ImageFromUrl(logo);

const nombreUsuario = `${factura.Nombre} ${factura.Apellido1} ${factura.Apellido2 || ""}`;

const matricula = factura.matricula || "No disponible";

const zona = factura.zona || "No disponible";

const tiempoReserva = factura.tiempoMinutos
  ? `${Math.floor(factura.tiempoMinutos / 60)}h ${factura.tiempoMinutos % 60}min`
  : "No disponible";

  const qrText = `
Factura: ${factura.idMovimiento}
Cliente: ${nombreUsuario}
Matrícula: ${matricula}
Zona: ${zona}
Fecha: ${new Date(factura.fecha).toLocaleString()}
Importe: ${total.toFixed(2)} €
`;

  const qrImage = await generarQR(qrText);

  // LOGO
  doc.addImage(logoBase64, "PNG", 15, 10, 50, 30);
  
  // CABECERA
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURA", 160, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Factura Nº: ${factura.idMovimiento}`, 145, 30);
  doc.text(
    `Fecha: ${new Date(factura.fecha).toLocaleString()}`,
    145,
    37
  );

  // EMPRESA
  doc.setFont("helvetica", "bold");
  doc.text("MyParking S.L.", 20, 50);

  doc.setFont("helvetica", "normal");
  doc.text("CIF: B12345678", 20, 57);
  doc.text("Gran Vía 25, Madrid", 20, 64);
  doc.text("soporte@myparking.com", 20, 71);

  doc.line(15, 80, 195, 80);

  // CLIENTE
  doc.setFont("helvetica", "bold");
  doc.text("DATOS DEL CLIENTE", 20, 92);

  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${nombreUsuario}`, 20, 100);
  doc.text(`Matrícula: ${matricula}`, 20, 108);
  doc.text(`Zona: ${zona}`, 20, 116);
  doc.text(`Tiempo: ${tiempoReserva}`, 20, 124);

  // TABLA
  doc.rect(15, 135, 180, 12);
  doc.text("Servicio", 20, 143);
  doc.text("Precio", 170, 143);

  doc.rect(15, 147, 180, 20);
  doc.text(factura.descripcion, 20, 158);
  doc.text(`${subtotal.toFixed(2)} €`, 170, 158);

  // TOTALES
  doc.text(`Base: ${subtotal.toFixed(2)} €`, 140, 180);
  doc.text(`IVA 21%: ${iva.toFixed(2)} €`, 140, 188);

  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL: ${total.toFixed(2)} €`, 140, 198);

  // QR
  doc.addImage(qrImage, "PNG", 20, 210, 40, 40);

  // FIRMA DIGITAL VISUAL
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Firmado digitalmente por MyParking",
    120,
    245
  );

  doc.line(120, 248, 180, 248);

  // PIE
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Gracias por confiar en MyParking",
    20,
    275
  );

  doc.save(`factura_${factura.idMovimiento}.pdf`);
};
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
      <Typography variant="h4" mb={2} fontWeight="bold">
        Facturas
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && facturas.length === 0 && (
        <Typography color="text.secondary" fontWeight="bold">
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
            <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => descargarFactura(f)}
            >
            Descargar PDF
            </Button>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}

// take 2

// // src/pages/Invoices.jsx
// import { useEffect, useState } from "react";
// import {
//   Typography, Paper, Stack, Alert, CircularProgress,
//   Box, Button, Chip, Grid, Avatar, Divider, TextField, InputAdornment,
// } from "@mui/material";
// import {
//   Receipt, Download, Search, CalendarToday, Euro,
//   CheckCircle, HourglassTop, FilterList,
// } from "@mui/icons-material";
// import jsPDF from "jspdf";
// import logo from "../assets/logo.png";
// import QRCode from "qrcode";

// const API_URL = "https://myparking-backend.onrender.com/api";

// const getBase64ImageFromUrl = async (url) => {
//   const data = await fetch(url);
//   const blob = await data.blob();
//   return new Promise((resolve) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(blob);
//     reader.onloadend = () => resolve(reader.result);
//   });
// };

// const generarQR = async (texto) => await QRCode.toDataURL(texto);

// const fmtDate = (d) => {
//   try { return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }); }
//   catch { return "—"; }
// };
// const fmtDateTime = (d) => {
//   try { return new Date(d).toLocaleString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
//   catch { return "—"; }
// };

// export default function Invoices() {
//   const [facturas, setFacturas] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");
//   const [downloading, setDownloading] = useState(null);
//   const token = localStorage.getItem("token");

//   const descargarFactura = async (factura) => {
//     setDownloading(factura.idMovimiento);
//     try {
//       const doc = new jsPDF();
//       const subtotal = Number(factura.cantidad);
//       const iva = subtotal * 0.21;
//       const total = subtotal + iva;
//       const logoBase64 = await getBase64ImageFromUrl(logo);
//       const nombreUsuario = `${factura.Nombre} ${factura.Apellido1} ${factura.Apellido2 || ""}`;
//       const matricula = factura.matricula || "No disponible";
//       const zona = factura.zona || "No disponible";
//       const tiempoReserva = factura.tiempoMinutos ? `${Math.floor(factura.tiempoMinutos / 60)}h ${factura.tiempoMinutos % 60}min` : "No disponible";
//       const qrText = `Factura: ${factura.idMovimiento}\nCliente: ${nombreUsuario}\nMatrícula: ${matricula}\nZona: ${zona}\nFecha: ${new Date(factura.fecha).toLocaleString()}\nImporte: ${total.toFixed(2)} €`;
//       const qrImage = await generarQR(qrText);

//       doc.addImage(logoBase64, "PNG", 15, 10, 50, 30);
//       doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.text("FACTURA", 160, 20);
//       doc.setFontSize(11); doc.setFont("helvetica", "normal");
//       doc.text(`Factura Nº: ${factura.idMovimiento}`, 145, 30);
//       doc.text(`Fecha: ${new Date(factura.fecha).toLocaleString()}`, 145, 37);
//       doc.setFont("helvetica", "bold"); doc.text("MyParking S.L.", 20, 50);
//       doc.setFont("helvetica", "normal");
//       doc.text("CIF: B12345678", 20, 57); doc.text("Gran Vía 25, Madrid", 20, 64); doc.text("soporte@myparking.com", 20, 71);
//       doc.line(15, 80, 195, 80);
//       doc.setFont("helvetica", "bold"); doc.text("DATOS DEL CLIENTE", 20, 92);
//       doc.setFont("helvetica", "normal");
//       doc.text(`Nombre: ${nombreUsuario}`, 20, 100); doc.text(`Matrícula: ${matricula}`, 20, 108);
//       doc.text(`Zona: ${zona}`, 20, 116); doc.text(`Tiempo: ${tiempoReserva}`, 20, 124);
//       doc.rect(15, 135, 180, 12); doc.text("Servicio", 20, 143); doc.text("Precio", 170, 143);
//       doc.rect(15, 147, 180, 20); doc.text(factura.descripcion, 20, 158); doc.text(`${subtotal.toFixed(2)} €`, 170, 158);
//       doc.text(`Base: ${subtotal.toFixed(2)} €`, 140, 180);
//       doc.text(`IVA 21%: ${iva.toFixed(2)} €`, 140, 188);
//       doc.setFont("helvetica", "bold"); doc.text(`TOTAL: ${total.toFixed(2)} €`, 140, 198);
//       doc.addImage(qrImage, "PNG", 20, 210, 40, 40);
//       doc.setFontSize(10); doc.setFont("helvetica", "italic"); doc.text("Firmado digitalmente por MyParking", 120, 245);
//       doc.line(120, 248, 180, 248);
//       doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.text("Gracias por confiar en MyParking", 20, 275);
//       doc.save(`factura_${factura.idMovimiento}.pdf`);
//     } catch (e) { console.error("Error generando PDF:", e); }
//     finally { setDownloading(null); }
//   };

//   useEffect(() => {
//     if (!token) { setError("Debes iniciar sesión para ver tus facturas."); setLoading(false); return; }
//     const fetch_ = async () => {
//       try {
//         const res = await fetch(`${API_URL}/me/monedero/movimientos`, { headers: { Authorization: `Bearer ${token}` } });
//         if (!res.ok) throw new Error("No se pudieron cargar las facturas");
//         const data = await res.json();
//         setFacturas((Array.isArray(data) ? data : []).filter((m) => m.tipo === "GASTO").sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
//       } catch (err) { setError("Error al cargar las facturas."); }
//       finally { setLoading(false); }
//     };
//     fetch_();
//   }, [token]);

//   const filtered = facturas.filter((f) => {
//     const q = search.toLowerCase();
//     return (
//       (f.descripcion || "").toLowerCase().includes(q) ||
//       (f.zona || "").toLowerCase().includes(q) ||
//       String(f.idMovimiento).includes(q)
//     );
//   });

//   const totalFacturado = facturas.reduce((a, f) => a + Number(f.cantidad) * 1.21, 0);

//   return (
//     <Box sx={{ maxWidth: 900, mx: "auto" }}>
//       {/* Header */}
//       <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
//         <Box>
//           <Typography variant="h4" fontWeight={800} sx={{ color: "#0d1117", letterSpacing: "-0.02em" }}>
//             Facturas
//           </Typography>
//           <Typography sx={{ color: "rgba(0,0,0,0.5)", mt: 0.3, fontSize: "0.9rem" }}>
//             {facturas.length === 0 ? "Aquí aparecerán tus facturas de reservas" : `${facturas.length} factura${facturas.length !== 1 ? "s" : ""} · Total facturado ${totalFacturado.toFixed(2)} € (IVA inc.)`}
//           </Typography>
//         </Box>
//       </Stack>

//       {/* Stats rápidas */}
//       {facturas.length > 0 && (
//         <Grid container spacing={2} mb={3}>
//           {[
//             { label: "Facturas totales", value: facturas.length, color: "#7c4dff", icon: <Receipt sx={{ fontSize: 20 }} /> },
//             { label: "Total facturado", value: `${totalFacturado.toFixed(2)} €`, color: "#00e676", icon: <Euro sx={{ fontSize: 20 }} /> },
//             { label: "Última factura", value: fmtDate(facturas[0]?.fecha), color: "#00bcd4", icon: <CalendarToday sx={{ fontSize: 20 }} /> },
//           ].map((stat) => (
//             <Grid item xs={12} sm={4} key={stat.label}>
//               <Paper sx={{
//                 p: 2, borderRadius: 3, background: "#111827", border: `1px solid ${stat.color}22`,
//                 transition: "transform 0.2s", "&:hover": { transform: "translateY(-1px)" },
//               }}>
//                 <Stack direction="row" alignItems="center" justifyContent="space-between">
//                   <Box>
//                     <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</Typography>
//                     <Typography sx={{ fontWeight: 800, color: stat.color, fontSize: "1.1rem", mt: 0.3 }}>{stat.value}</Typography>
//                   </Box>
//                   <Box sx={{ color: stat.color, opacity: 0.7 }}>{stat.icon}</Box>
//                 </Stack>
//               </Paper>
//             </Grid>
//           ))}
//         </Grid>
//       )}

//       {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

//       {loading ? (
//         <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
//       ) : facturas.length === 0 ? (
//         <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
//           <Receipt sx={{ fontSize: 56, color: "rgba(255,255,255,0.1)", mb: 2 }} />
//           <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>Sin facturas todavía</Typography>
//           <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>
//             Las facturas de tus reservas de parking aparecerán aquí
//           </Typography>
//         </Paper>
//       ) : (
//         <>
//           {/* Buscador */}
//           <Paper sx={{ mb: 2.5, borderRadius: 2.5, background: "#111827", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
//             <TextField
//               placeholder="Buscar por descripción, zona o nº de factura…"
//               fullWidth value={search} onChange={(e) => setSearch(e.target.value)}
//               InputProps={{
//                 startAdornment: <Search sx={{ mr: 1, color: "rgba(255,255,255,0.3)", fontSize: 20 }} />,
//                 disableUnderline: true,
//                 sx: { px: 2, py: 1, color: "#fff", "& input::placeholder": { color: "rgba(255,255,255,0.3)", opacity: 1 } },
//               }}
//               variant="standard"
//             />
//           </Paper>

//           <Stack spacing={1.5}>
//             {filtered.map((f) => {
//               const subtotal = Number(f.cantidad);
//               const total = subtotal * 1.21;
//               const isDownloading = downloading === f.idMovimiento;
//               return (
//                 <Paper
//                   key={f.idMovimiento}
//                   sx={{
//                     p: 0, borderRadius: 3, overflow: "hidden",
//                     background: "#111827", border: "1px solid rgba(255,255,255,0.07)",
//                     transition: "all 0.2s ease",
//                     "&:hover": { border: "1px solid rgba(124,77,255,0.3)", boxShadow: "0 4px 20px rgba(124,77,255,0.08)" },
//                   }}
//                 >
//                   {/* Línea decorativa */}
//                   <Box sx={{ height: 3, background: "linear-gradient(90deg, #7c4dff, #e040fb)" }} />

//                   <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ p: 2.5 }}>
//                     {/* Icono */}
//                     <Avatar sx={{ width: 44, height: 44, bgcolor: "rgba(124,77,255,0.12)", border: "1px solid rgba(124,77,255,0.2)", flexShrink: 0 }}>
//                       <Receipt sx={{ color: "#7c4dff", fontSize: 20 }} />
//                     </Avatar>

//                     {/* Info */}
//                     <Box flex={1} minWidth={0}>
//                       <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
//                         <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem" }} noWrap>
//                           {f.descripcion || "Reserva de parking"}
//                         </Typography>
//                         <Chip
//                           label={`#${f.idMovimiento}`}
//                           size="small"
//                           sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700, bgcolor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
//                         />
//                       </Stack>
//                       <Stack direction="row" alignItems="center" spacing={1.5} mt={0.4} flexWrap="wrap">
//                         <Stack direction="row" alignItems="center" spacing={0.4}>
//                           <CalendarToday sx={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }} />
//                           <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{fmtDateTime(f.fecha)}</Typography>
//                         </Stack>
//                         {f.zona && (
//                           <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>· {f.zona}</Typography>
//                         )}
//                       </Stack>
//                     </Box>

//                     {/* Importes y botón */}
//                     <Stack direction={{ xs: "row", sm: "column" }} alignItems={{ xs: "center", sm: "flex-end" }} spacing={{ xs: 2, sm: 0.5 }}>
//                       <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
//                         <Typography sx={{ fontWeight: 800, color: "#ff5252", fontSize: "1rem", fontVariantNumeric: "tabular-nums" }}>
//                           -{total.toFixed(2)} €
//                         </Typography>
//                         <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.25)" }}>
//                           Base: {subtotal.toFixed(2)} € + IVA 21%
//                         </Typography>
//                       </Box>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         startIcon={isDownloading ? <CircularProgress size={12} /> : <Download sx={{ fontSize: 14 }} />}
//                         onClick={() => descargarFactura(f)}
//                         disabled={isDownloading}
//                         sx={{
//                           borderRadius: 2, fontSize: "0.72rem", fontWeight: 700,
//                           borderColor: "rgba(124,77,255,0.4)", color: "#7c4dff",
//                           whiteSpace: "nowrap",
//                           "&:hover": { borderColor: "#7c4dff", bgcolor: "rgba(124,77,255,0.08)" },
//                         }}
//                       >
//                         {isDownloading ? "Generando…" : "Descargar PDF"}
//                       </Button>
//                     </Stack>
//                   </Stack>
//                 </Paper>
//               );
//             })}

//             {filtered.length === 0 && search && (
//               <Box textAlign="center" py={4}>
//                 <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.9rem" }}>
//                   No se encontraron facturas para "{search}"
//                 </Typography>
//               </Box>
//             )}
//           </Stack>
//         </>
//       )}
//     </Box>
//   );
// }