// src/pages/Home.jsx
import { Box, Typography, Grid, Button, Paper } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import AnunciosDinamicos from "../components/AnunciosDinamicos";
import { useEffect, useState } from "react";
import { getZonas } from "../services/api";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Snackbar,
} from "@mui/material";

// Icono personalizado para parkings
const parkingIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function Home() {
  const navigate = useNavigate();
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openParkingModal, setOpenParkingModal] = useState(false);
  const [ubicacionGuardada, setUbicacionGuardada] = useState(false);

  const handleOpenParkings = async () => {
  try {
    const res = await fetch(
      "https://myparking-backend.onrender.com/api/zonas"
    );

    const data = await res.json();

    setZonas(data);
    setOpenParkingModal(true);
  } catch (error) {
    console.error("Error cargando parkings:", error);
    alert("No se pudieron cargar los parkings");
  }
};

const handleGuardarUbicacion = () => {
  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const ubicacion = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      localStorage.setItem(
        "ubicacionUsuario",
        JSON.stringify(ubicacion)
      );

      setUbicacionGuardada(true);
    },
    (error) => {
      console.error(error);
      alert("No se pudo obtener la ubicación");
    }
  );
};

  useEffect(() => {
    const loadZonas = async () => {
      try {
        const data = await getZonas();
        setZonas(data);
      } catch (error) {
        console.error("Error cargando zonas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadZonas();
  }, []);

  const buttons = [
    { label: "Parquímetro", path: "/parquimetro" },
    { label: "Parkings", path: null },
    { label: "Recargas", path: "/wallet" },
    { label: "Guardar ubicación", path: null },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2} fontWeight="bold">
        Mapa de Parkings
      </Typography>

      {/* Botones */}
      <Grid container spacing={2} mb={3}>
        {buttons.map((btn) => (
          <Grid item xs={12} sm={6} md={3} key={btn.label}>
            <Button
              fullWidth
              variant="contained"
              sx={{ p: 2 }}
              onClick={() => {
                if (btn.path) {
                  navigate(btn.path);
                } else if(btn.label == "Parkings") {
                handleOpenParkings();
                } else if(btn.label == "Guardar ubicación") {
                  handleGuardarUbicacion();
                }else{
                  alert("Este botón no tiene funcionalidad actualmente.");
                }
              }}
            >
              {btn.label}
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* Mapa */}
      <Paper
        sx={{
          height: { xs: 300, sm: 400, md: 450 },
          maxHeight: 500,
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 3,
          display: "flex",
        }}
      >
        <MapContainer
          center={[28.5023, -13.8590]} // Puerto del Rosario
          zoom={14}
          style={{ flex: 1, width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Marcadores de ZONAS (parkings) */}
          {zonas
            .filter((z) => z.lat && z.lng) // seguridad
            .map((z) => (
              <Marker
                key={z.idZona}
                position={[Number(z.lat), Number(z.lng)]}
                icon={parkingIcon}
              >
                <Popup>
                  <Typography fontWeight={600}>{z.nombre}</Typography>

                  <Typography>Tarifa: {z.Tarifa} € / hora</Typography>

                  <Typography>
                    Horario: {z.Horario_inicio} – {z.Horario_fin}
                  </Typography>

                  <Typography>
                    Plazas libres: {z.plazasLibres} / {z.totalPlazas}
                  </Typography>

                  {z.plazasLibres > 0 ? (
                    <Button
                      size="small"
                      sx={{ mt: 1 }}
                      variant="contained"
                      onClick={() => navigate(`/parquimetro?idZona=${z.idZona}`)}
                    >
                      Reservar
                    </Button>
                  ) : (
                    <Typography sx={{ mt: 1 }} color="error">
                      Parking completo
                    </Typography>
                  )}
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </Paper>
<Dialog
  open={openParkingModal}
  onClose={() => setOpenParkingModal(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>Parkings disponibles</DialogTitle>

  <DialogContent>
   <List>
  {zonas.map((zona) => (
    <ListItem
      key={zona.idZona}
      button
      onClick={() => {
        setOpenParkingModal(false);
        navigate(`/parquimetro?idZona=${zona.idZona}`);
      }}
      sx={{
        cursor: "pointer",
        borderRadius: 1,
        "&:hover": {
          color: "#ffff",
          backgroundColor: "#2a2cbe",
        },
      }}
    >
      <ListItemText
        primary={zona.nombre}
        secondary={`Localidad: ${zona.Localidad} | Tarifa: ${zona.Tarifa} €/h`}
      />
    </ListItem>
  ))}
</List>
  </DialogContent>
</Dialog>
      <Snackbar
        open={ubicacionGuardada}
        autoHideDuration={3000}
        onClose={() => setUbicacionGuardada(false)}
        message="Ubicación guardada correctamente"
      />
      <AnunciosDinamicos />
    </Box>
  );
}

// take 2
// // src/pages/Home.jsx
// import { Box, Typography, Grid, Button, Paper, Stack, Chip, Avatar, Divider, CircularProgress } from "@mui/material";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import { useNavigate } from "react-router-dom";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import { useEffect, useState } from "react";
// import { getZonas, getMisReservas } from "../services/api";
// import {
//   Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Snackbar,
// } from "@mui/material";
// import {
//   LocalParking, AccountBalanceWallet, DirectionsCar,
//   MyLocation, GridView, TrendingUp, AccessTime, CheckCircle,
//   LocationOn, Schedule,
// } from "@mui/icons-material";

// const parkingIcon = new L.Icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
//   iconSize: [32, 32],
//   iconAnchor: [16, 32],
//   popupAnchor: [0, -32],
// });

// // Obtener nombre del usuario desde localStorage
// const getUserName = () => {
//   try {
//     const raw = localStorage.getItem("user");
//     if (raw) {
//       const u = JSON.parse(raw);
//       return u.nombre || u.Nombre || u.name || null;
//     }
//     const token = localStorage.getItem("token");
//     if (token) {
//       const payload = JSON.parse(atob(token.split(".")[1]));
//       return payload?.nombre || payload?.name || null;
//     }
//   } catch { }
//   return null;
// };

// const getHourGreeting = () => {
//   const h = new Date().getHours();
//   if (h < 13) return "Buenos días";
//   if (h < 20) return "Buenas tardes";
//   return "Buenas noches";
// };

// export default function Home() {
//   const navigate = useNavigate();
//   const [zonas, setZonas] = useState([]);
//   const [reservas, setReservas] = useState([]);
//   const [loadingZonas, setLoadingZonas] = useState(true);
//   const [openParkingModal, setOpenParkingModal] = useState(false);
//   const [ubicacionGuardada, setUbicacionGuardada] = useState(false);
//   const userName = getUserName();

//   const handleOpenParkings = async () => {
//     try {
//       const res = await fetch("https://myparking-backend.onrender.com/api/zonas");
//       const data = await res.json();
//       setZonas(data);
//       setOpenParkingModal(true);
//     } catch {
//       alert("No se pudieron cargar los parkings");
//     }
//   };

//   const handleGuardarUbicacion = () => {
//     if (!navigator.geolocation) { alert("Tu navegador no soporta geolocalización"); return; }
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         localStorage.setItem("ubicacionUsuario", JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
//         setUbicacionGuardada(true);
//       },
//       () => alert("No se pudo obtener la ubicación")
//     );
//   };

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [z, r] = await Promise.allSettled([getZonas(), getMisReservas()]);
//         if (z.status === "fulfilled") setZonas(z.value);
//         if (r.status === "fulfilled") setReservas(Array.isArray(r.value) ? r.value : []);
//       } catch { } finally { setLoadingZonas(false); }
//     };
//     load();
//   }, []);

//   const reservasEnCurso = reservas.filter((r) => r.Estado === "EN CURSO");
//   const reservasFinalizadas = reservas.filter((r) => r.Estado === "FINALIZADA");
//   const totalPlazasLibres = zonas.reduce((a, z) => a + (z.plazasLibres || 0), 0);

//   const quickActions = [
//     { label: "Reservar plaza", icon: <LocalParking />, color: "#00e676", action: () => navigate("/parquimetro"), desc: "Buscar y reservar" },
//     { label: "Ver parkings", icon: <GridView />, color: "#7c4dff", action: handleOpenParkings, desc: "Lista completa" },
//     { label: "Recargar saldo", icon: <AccountBalanceWallet />, color: "#00bcd4", action: () => navigate("/wallet"), desc: "Añadir fondos" },
//     { label: "Mi ubicación", icon: <MyLocation />, color: "#ff7043", action: handleGuardarUbicacion, desc: "Guardar posición" },
//   ];

//   return (
//     <Box sx={{ maxWidth: 1100, mx: "auto" }}>

//       {/* ── Saludo ── */}
//       <Box mb={3}>
//         <Typography variant="h4" fontWeight={800} sx={{ color: "#0d1117", letterSpacing: "-0.02em" }}>
//           {getHourGreeting()}{userName ? `, ${userName}` : ""} 👋
//         </Typography>
//         <Typography sx={{ color: "rgba(0,0,0,0.55)", mt: 0.5, fontSize: "0.95rem" }}>
//           {reservasEnCurso.length > 0
//             ? `Tienes ${reservasEnCurso.length} reserva${reservasEnCurso.length > 1 ? "s" : ""} en curso ahora mismo`
//             : "No tienes reservas activas · Explora los parkings disponibles"}
//         </Typography>
//       </Box>

//       {/* ── Stats cards ── */}
//       <Grid container spacing={2} mb={3}>
//         {[
//           {
//             label: "Plazas libres ahora",
//             value: loadingZonas ? "—" : totalPlazasLibres,
//             icon: <LocalParking sx={{ fontSize: 22 }} />,
//             color: "#00e676",
//             bg: "linear-gradient(135deg, #00e67622, #00bcd422)",
//           },
//           {
//             label: "Zonas disponibles",
//             value: loadingZonas ? "—" : zonas.length,
//             icon: <LocationOn sx={{ fontSize: 22 }} />,
//             color: "#7c4dff",
//             bg: "linear-gradient(135deg, #7c4dff22, #e040fb22)",
//           },
//           {
//             label: "Reservas activas",
//             value: reservasEnCurso.length,
//             icon: <AccessTime sx={{ fontSize: 22 }} />,
//             color: "#ff9800",
//             bg: "linear-gradient(135deg, #ff980022, #ff572222)",
//           },
//           {
//             label: "Historial total",
//             value: reservas.length,
//             icon: <CheckCircle sx={{ fontSize: 22 }} />,
//             color: "#00bcd4",
//             bg: "linear-gradient(135deg, #00bcd422, #0097a722)",
//           },
//         ].map((stat) => (
//           <Grid item xs={6} sm={3} key={stat.label}>
//             <Paper
//               sx={{
//                 p: 2,
//                 borderRadius: 3,
//                 background: stat.bg,
//                 border: `1px solid ${stat.color}33`,
//                 backdropFilter: "blur(10px)",
//                 transition: "transform 0.2s ease, box-shadow 0.2s ease",
//                 "&:hover": { transform: "translateY(-2px)", boxShadow: `0 8px 24px ${stat.color}22` },
//               }}
//             >
//               <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
//                 <Box>
//                   <Typography sx={{ fontSize: "0.72rem", color: "rgba(0,0,0,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>
//                     {stat.label}
//                   </Typography>
//                   <Typography sx={{ fontSize: "2rem", fontWeight: 800, color: "#0d1117", lineHeight: 1 }}>
//                     {stat.value}
//                   </Typography>
//                 </Box>
//                 <Box sx={{ color: stat.color, opacity: 0.8, mt: 0.5 }}>{stat.icon}</Box>
//               </Stack>
//             </Paper>
//           </Grid>
//         ))}
//       </Grid>

//       {/* ── Quick actions ── */}
//       <Grid container spacing={2} mb={3}>
//         {quickActions.map((btn) => (
//           <Grid item xs={6} sm={3} key={btn.label}>
//             <Paper
//               onClick={btn.action}
//               sx={{
//                 p: 2.5,
//                 borderRadius: 3,
//                 cursor: "pointer",
//                 background: "#111827",
//                 border: "1px solid rgba(255,255,255,0.07)",
//                 transition: "all 0.2s ease",
//                 "&:hover": {
//                   border: `1px solid ${btn.color}55`,
//                   boxShadow: `0 8px 24px ${btn.color}18`,
//                   transform: "translateY(-2px)",
//                 },
//               }}
//             >
//               <Stack alignItems="flex-start" spacing={1}>
//                 <Box
//                   sx={{
//                     width: 40,
//                     height: 40,
//                     borderRadius: "12px",
//                     background: `${btn.color}22`,
//                     border: `1px solid ${btn.color}44`,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     color: btn.color,
//                   }}
//                 >
//                   {btn.icon}
//                 </Box>
//                 <Box>
//                   <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#fff" }}>
//                     {btn.label}
//                   </Typography>
//                   <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
//                     {btn.desc}
//                   </Typography>
//                 </Box>
//               </Stack>
//             </Paper>
//           </Grid>
//         ))}
//       </Grid>

//       {/* ── Reservas activas (si hay) ── */}
//       {reservasEnCurso.length > 0 && (
//         <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, background: "linear-gradient(135deg, #ff980012, #ff572212)", border: "1px solid #ff980033" }}>
//           <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
//             <AccessTime sx={{ color: "#ff9800", fontSize: 18 }} />
//             <Typography fontWeight={700} sx={{ color: "#0d1117", fontSize: "0.9rem" }}>
//               Reservas en curso
//             </Typography>
//             <Chip label={reservasEnCurso.length} size="small" sx={{ bgcolor: "#ff980022", color: "#ff9800", fontWeight: 700, height: 20, fontSize: "0.68rem" }} />
//           </Stack>
//           <Stack spacing={1}>
//             {reservasEnCurso.map((res) => (
//               <Box
//                 key={res.idReserva}
//                 sx={{
//                   p: 1.5, borderRadius: 2,
//                   background: "rgba(255,255,255,0.5)",
//                   border: "1px solid rgba(255,152,0,0.2)",
//                   display: "flex", justifyContent: "space-between", alignItems: "center",
//                 }}
//               >
//                 <Stack direction="row" spacing={1.5} alignItems="center">
//                   <LocalParking sx={{ color: "#ff9800", fontSize: 18 }} />
//                   <Box>
//                     <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0d1117" }}>
//                       {res.zona} · Plaza #{res.idPlaza}
//                     </Typography>
//                     <Typography sx={{ fontSize: "0.72rem", color: "rgba(0,0,0,0.5)" }}>
//                       Hasta las {new Date(res.Fecha_fin).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
//                     </Typography>
//                   </Box>
//                 </Stack>
//                 <Chip
//                   label="EN CURSO"
//                   size="small"
//                   sx={{ bgcolor: "#ff980022", color: "#e65100", fontWeight: 700, fontSize: "0.65rem", border: "1px solid #ff980044" }}
//                 />
//               </Box>
//             ))}
//           </Stack>
//         </Paper>
//       )}

//       {/* ── Mapa ── */}
//       <Paper sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", mb: 2 }}>
//         <Box sx={{ px: 2.5, py: 2, background: "#111827", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
//           <Stack direction="row" alignItems="center" justifyContent="space-between">
//             <Stack direction="row" alignItems="center" spacing={1}>
//               <LocationOn sx={{ color: "#00e676", fontSize: 18 }} />
//               <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>
//                 Mapa de parkings — Puerto del Rosario
//               </Typography>
//             </Stack>
//             {loadingZonas ? (
//               <CircularProgress size={16} sx={{ color: "#00e676" }} />
//             ) : (
//               <Chip
//                 label={`${zonas.length} zonas`}
//                 size="small"
//                 sx={{ bgcolor: "#00e67622", color: "#00e676", fontWeight: 700, fontSize: "0.68rem", border: "1px solid #00e67633" }}
//               />
//             )}
//           </Stack>
//         </Box>
//         <Box sx={{ height: { xs: 300, sm: 380, md: 420 } }}>
//           <MapContainer center={[28.5023, -13.859]} zoom={14} style={{ width: "100%", height: "100%" }}>
//             <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//             {zonas.filter((z) => z.lat && z.lng).map((z) => (
//               <Marker key={z.idZona} position={[Number(z.lat), Number(z.lng)]} icon={parkingIcon}>
//                 <Popup>
//                   <Typography fontWeight={600}>{z.nombre}</Typography>
//                   <Typography>Tarifa: {z.Tarifa} € / hora</Typography>
//                   <Typography>Horario: {z.Horario_inicio} – {z.Horario_fin}</Typography>
//                   <Typography>Plazas libres: {z.plazasLibres} / {z.totalPlazas}</Typography>
//                   {z.plazasLibres > 0 ? (
//                     <Button size="small" sx={{ mt: 1 }} variant="contained" onClick={() => navigate(`/parquimetro?idZona=${z.idZona}`)}>
//                       Reservar
//                     </Button>
//                   ) : (
//                     <Typography sx={{ mt: 1 }} color="error">Parking completo</Typography>
//                   )}
//                 </Popup>
//               </Marker>
//             ))}
//           </MapContainer>
//         </Box>
//       </Paper>

//       {/* ── Historial reciente ── */}
//       {reservasFinalizadas.length > 0 && (
//         <Paper sx={{ p: 2.5, borderRadius: 3, background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
//           <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
//             <TrendingUp sx={{ color: "#00e676", fontSize: 18 }} />
//             <Typography fontWeight={700} sx={{ color: "#fff", fontSize: "0.9rem" }}>
//               Últimas reservas
//             </Typography>
//           </Stack>
//           <Stack spacing={1}>
//             {reservasFinalizadas.slice(0, 3).map((res) => (
//               <Stack
//                 key={res.idReserva}
//                 direction="row"
//                 justifyContent="space-between"
//                 alignItems="center"
//                 sx={{ py: 0.8, borderBottom: "1px solid rgba(255,255,255,0.05)", "&:last-child": { borderBottom: "none" } }}
//               >
//                 <Stack direction="row" spacing={1.5} alignItems="center">
//                   <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "rgba(0,230,118,0.6)" }} />
//                   <Box>
//                     <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff" }}>{res.zona}</Typography>
//                     <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
//                       {new Date(res.Fecha_inicio).toLocaleDateString("es-ES")} · Plaza #{res.idPlaza}
//                     </Typography>
//                   </Box>
//                 </Stack>
//                 <Chip label="Finalizada" size="small" sx={{ bgcolor: "rgba(0,230,118,0.1)", color: "#00e676", fontWeight: 600, fontSize: "0.65rem", border: "1px solid rgba(0,230,118,0.2)" }} />
//               </Stack>
//             ))}
//           </Stack>
//           {reservasFinalizadas.length > 3 && (
//             <Button size="small" sx={{ mt: 1, color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }} onClick={() => navigate("/invoices")}>
//               Ver todas ({reservasFinalizadas.length}) →
//             </Button>
//           )}
//         </Paper>
//       )}

//       {/* Modal de parkings */}
//       <Dialog open={openParkingModal} onClose={() => setOpenParkingModal(false)} fullWidth maxWidth="sm">
//         <DialogTitle>Parkings disponibles</DialogTitle>
//         <DialogContent>
//           <List>
//             {zonas.map((zona) => (
//               <ListItem
//                 key={zona.idZona}
//                 button
//                 onClick={() => { setOpenParkingModal(false); navigate(`/parquimetro?idZona=${zona.idZona}`); }}
//                 sx={{ cursor: "pointer", borderRadius: 1, "&:hover": { color: "#fff", backgroundColor: "#2a2cbe" } }}
//               >
//                 <ListItemText primary={zona.nombre} secondary={`Localidad: ${zona.Localidad} | Tarifa: ${zona.Tarifa} €/h`} />
//               </ListItem>
//             ))}
//           </List>
//         </DialogContent>
//       </Dialog>

//       <Snackbar open={ubicacionGuardada} autoHideDuration={3000} onClose={() => setUbicacionGuardada(false)} message="Ubicación guardada correctamente" />
//     </Box>
//   );
// }