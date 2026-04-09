// // // Hooks principales de React
// // import { useEffect, useState } from "react";
// // // import "../App.css"
// // // Componentes de interfaz (UI)
// // import {
// //   Box,
// //   Typography,
// //   Paper,
// //   Divider,
// //   Avatar,
// //   Button,
// //   Chip,
// //   Grid,
// //   CircularProgress,
// //   Stack,
// //   TextField,
// // } from "@mui/material";

// // // Hook de navegación
// // import { useNavigate } from "react-router-dom";

// // // URL base del backend 
// // const API_URL = "https://myparking-backend.onrender.com/api";

// // export default function Account() {
// //   const navigate = useNavigate();

// //   // Estado del usuario autenticado
// //   const [user, setUser] = useState(null); // { nombre, apellido1, apellido2, email, plan, idUsuario }
// //   // Estados de carga y error del perfil
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");
// //   const [editMode, setEditMode] = useState(false);

// //   const [formData, setFormData] = useState({
// //   nombre: "",
// //   apellido1: "",
// //   apellido2: "",
// //   email: "",
// //   password: "",
// //   });

// //   // historial separado
// //   const [ingresos, setIngresos] = useState([]); // movimientos de tipo INGRESO
// //   const [gastosConReserva, setGastosConReserva] = useState([]);   // movimientos de tipo GASTO que tienen idReserva asociado (vinculados a reserva)

// //   // Estados de carga/error del historial
// //   const [historyLoading, setHistoryLoading] = useState(false);
// //   const [historyError, setHistoryError] = useState("");

// //   // Fallback en localstorage
// //   const loadFallbackUser = () => {
// //     try {
// //       const raw = localStorage.getItem("user");
// //       if (!raw) return null;
// //       const parsed = JSON.parse(raw);

// //       // Normaliza distintos nombres (para cambios en la BD o inconsistencias)
// //       return {
// //         nombre: parsed.nombre || parsed.Nombre || parsed.name || "",
// //         apellido1: parsed.apellido1 || parsed.Apellido1 || parsed.lastName || "",
// //         apellido2: parsed.apellido2 || parsed.Apellido2 || "",
// //         email: parsed.email || parsed.Email || "",
// //         plan: parsed.plan || parsed.planName || "",
// //         idUsuario: parsed.idUsuario || parsed.id || null,
// //       };
// //     } catch {
// //       return null;
// //     }
// //   };

// //   // Normalización de datos del backend para perfil -- PENDIENTE UNIFICAR CON LO DE ARRIBA (CODE SMELL DE DUPLICACION)
// //   const normalizeProfile = (p) => {
// //     if (!p) return null;
// //     return {
// //       nombre: p.Nombre ?? p.nombre ?? p.firstName ?? "",
// //       apellido1: p.Apellido1 ?? p.apellido1 ?? p.lastName ?? "",
// //       apellido2: p.Apellido2 ?? p.apellido2 ?? "",
// //       email: p.Email ?? p.email ?? "",
// //       plan: p.plan ?? p.planName ?? null,
// //       idUsuario: p.idUsuario ?? p.id ?? null,
// //     };
// //   };

// //   // Cargar perfil del usuario
// //   useEffect(() => {
// //     let mounted = true;   // evita setState si el componente se desmonta durante la carga
// //     const token = localStorage.getItem("token");

// //     const fetchProfile = async () => {
// //       setLoading(true);
// //       setError("");
// //       if (!token) {       // Si no hay token se intenta fallback local
// //         if (mounted) {
// //           setUser(loadFallbackUser());
// //           setLoading(false);
// //         }
// //         return;
// //       }

// //       try {
// //         const res = await fetch(`${API_URL}/me`, {
// //           headers: { Authorization: `Bearer ${token}` },
// //         });

// //         // Manejo de errores HTTP
// //         if (!res.ok) {
// //           if (res.status === 401) {
// //             // Token inválido → limpiar sesión y fallback local
// //             localStorage.removeItem("token");
// //             if (mounted) setUser(loadFallbackUser());
// //             setLoading(false);
// //             return;
// //           }
// //           const body = await res.json().catch(() => ({}));
// //           throw new Error(body?.error || `Error ${res.status}`);
// //         }

// //         const data = await res.json();
// //         if (!mounted) return;

// //         const normalized = normalizeProfile(data);
// //         const fallback = loadFallbackUser();
// //         const finalUser = { ...fallback, ...normalized };
// //         setUser(finalUser);
// //       } catch (err) {
// //         console.error("Error cargando perfil:", err);
// //         if (mounted) {
// //           setError("No se pudo cargar el perfil. Mostrando datos locales si existen.");
// //           setUser(loadFallbackUser());
// //         }
// //       } finally {
// //         if (mounted) setLoading(false);
// //       }
// //     };

// //     fetchProfile();
// //     return () => {
// //       mounted = false;
// //     };
// //   }, []);

// //   useEffect(() => {
// //   if (user) {
// //     setFormData({
// //       nombre: user.nombre || "",
// //       apellido1: user.apellido1 || "",
// //       apellido2: user.apellido2 || "",
// //       email: user.email || "",
// //       password: "",
// //     });
// //   }
// // }, [user]);

// //   // Cargar historial real: movimientos del monedero + reservas
// //   useEffect(() => {
// //     let mounted = true;
// //     const token = localStorage.getItem("token");
// //     if (!token) return;

// //     const fetchHistory = async () => {
// //       setHistoryLoading(true);
// //       setHistoryError("");
// //       try {
// //         // traer movimientos y reservas en paralelo - OPTIMIZCION
// //         const [movRes, revRes] = await Promise.allSettled([
// //           fetch(`${API_URL}/me/monedero/movimientos`, {
// //             headers: { Authorization: `Bearer ${token}` },
// //           }),
// //           fetch(`${API_URL}/reservas/mias`, {
// //             headers: { Authorization: `Bearer ${token}` },
// //           }),
// //         ]);

// //         // parsear movimientos
// //         let movimientos = [];
// //         if (movRes.status === "fulfilled") {
// //           const r = movRes.value;
// //           if (r.ok) {
// //             const data = await r.json().catch(() => []);
// //             movimientos = Array.isArray(data) ? data : [];
// //           } else {
// //             // si responde pero con error, intentar parsear mensaje para mostrar
// //             try {
// //               const errBody = await movRes.value.json();
// //               console.error("Movimientos error:", errBody);
// //             } catch (err) {
// //               console.error("Error parseando error de movimientos:", err);
// //             }
// //           }
// //         }

// //         // parsear reservas y construir map para consultar estado por idReserva
// //         let reservas = [];
// //         if (revRes.status === "fulfilled") {
// //           const r = revRes.value;
// //           if (r.ok) {
// //             const data = await r.json().catch(() => []);
// //             reservas = Array.isArray(data) ? data : [];
// //           } else {
// //             try {
// //               const errBody = await revRes.value.json();
// //               console.error("Reservas error:", errBody);
// //             } catch (err) {
// //               console.error("Error parseando error de movimientos:", err);
// //             }
// //           }
// //         }

// //         // normalizar reservas a mapa: idReserva -> Estado
// //         const reservasMap = new Map();
// //         reservas.forEach((rs) => {
// //           const id = rs.idReserva ?? rs.id_reserva ?? rs.id ?? null;
// //           const estado = rs.Estado ?? rs.estado ?? rs.Estado ?? null;
// //           if (id != null) reservasMap.set(Number(id), estado ?? null);
// //         });

// //         // Construir listas separadas
// //         const ingresosList = [];
// //         const gastosConReservaList = [];

// //         (movimientos || []).forEach((m) => {
// //           // normalizar campos comunes
// //           const tipo = (m.tipo ?? m.TIPO ?? "").toString().toUpperCase();
// //           const cantidad = Number(m.cantidad ?? m.CANTIDAD ?? m.amount ?? 0);
// //           // NORMALIZAcION id de reserva
// //           const idReserva =
// //             m.id_Reserva ?? m.idReserva ?? m.id_reserva ?? m.id_reserv ?? null;

// //           // fecha: intentar parsear
// //           let fecha;
// //           try {
// //             fecha = m.fecha ? new Date(m.fecha) : new Date();
// //           } catch {
// //             fecha = new Date();
// //           }

// //           const item = {
// //             id: `mov-${m.idMovimiento ?? m.id ?? Math.random()}`,
// //             tipo,
// //             descripcion: m.descripcion ?? m.descripcion_mov ?? m.desc ?? "",
// //             cantidad,
// //             fecha,
// //             idReserva: idReserva != null ? Number(idReserva) : null,
// //             raw: m,
// //           };

// //           if (tipo === "INGRESO") {
// //             ingresosList.push(item);
// //           } else {
// //             // GASTO
// //             if (item.idReserva) {
// //               // adjuntar estado de reserva si existe en map
// //               const estadoReserva = reservasMap.has(item.idReserva)
// //                 ? reservasMap.get(item.idReserva)
// //                 : null;

// //               gastosConReservaList.push({ ...item, estadoReserva });
// //             }
// //           }
// //         });

// //         // ordenar desc por fecha (más reciente primero)
// //         const sortDesc = (a, b) => b.fecha - a.fecha;
// //         ingresosList.sort(sortDesc);
// //         gastosConReservaList.sort(sortDesc);

// //         if (mounted) {
// //           setIngresos(ingresosList);
// //           setGastosConReserva(gastosConReservaList);
// //         }
// //       } catch (err) {
// //         console.error("Error cargando historial:", err);
// //         if (mounted) setHistoryError("Error al cargar historial.");
// //       } finally {
// //         if (mounted) setHistoryLoading(false);
// //       }
// //     };

// //     fetchHistory();
// //     return () => {
// //       mounted = false;
// //     };
// //   }, [user]); // disparar cuando se cargue user

// //   // AYUDAS UI
// //   const displayName = () => {
// //     if (!user) return "Usuario no registrado";
// //     const parts = [];
// //     if (user.nombre) parts.push(user.nombre);
// //     if (user.apellido1) parts.push(user.apellido1);
// //     return parts.join(" ") || user.email || "Usuario";
// //   };

// //   const avatarInitials = () => {
// //     if (!user) return "U";
// //     const name = user.nombre || user.email || "U";
// //     return name.trim().charAt(0).toUpperCase();
// //   };

// //   const planColor = () => {
// //     const plan = (user && user.plan) || "";
// //     switch (plan) {
// //       case "Residente anual":
// //         return "success";
// //       case "Residente mensual":
// //         return "primary";
// //       case "Invitado":
// //         return "default";
// //       default:
// //         return "warning";
// //     }
// //   };

// //   // navegación a login/register
// //   const handleGoToLogin = () => navigate("/");
// //   const handleGoToRegister = () => navigate("/register");

// //   // loader principal
// //   if (loading) {
// //     return (
// //       <Box p={3} display="flex" justifyContent="center" alignItems="center" minHeight="200px">
// //         <CircularProgress />
// //       </Box>
// //     );
// //   }

// //   // Formatea fecha (acepta date o string)
// //   const fmtDate = (d) => {
// //     try {
// //       return d instanceof Date ? d.toLocaleString() : new Date(d).toLocaleString();
// //     } catch {
// //       return String(d);
// //     }
// //   };

// //   // Renderizado de estado de reserva en gastos vinculados y normalización de estados con chips de colores
// //   const renderReservaChip = (estado) => {
// //     if (!estado) return <Chip label="DESCONOCIDO" size="small" />;
// //     const e = String(estado).toUpperCase();
// //     if (e === "FINALIZADA") return <Chip label="FINALIZADA" size="small" color="success" />;
// //     if (e === "EN CURSO" || e === "ENCURSO" || e === "EN_CURSO") return <Chip label="EN CURSO" size="small" color="warning" />;
// //     return <Chip label={String(estado)} size="small" />;
// //   };

// //   const handleUpdate = async () => {
// //   const token = localStorage.getItem("token");
// //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //   const textRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;

// //   if (!textRegex.test(formData.nombre)) {
// //     alert("Nombre no válido");
// //     return;
// //   }

// //   if (!textRegex.test(formData.apellido1)) {
// //     alert("Apellido 1 no válido");
// //     return;
// //   }

// //   if (
// //     formData.apellido2 &&
// //     !textRegex.test(formData.apellido2)
// //   ) {
// //     alert("Apellido 2 no válido");
// //     return;
// //   }

// //   if (!emailRegex.test(formData.email)) {
// //     alert("Correo electrónico no válido");
// //     return;
// //   }

// //   try {
// //     const res = await fetch(`${API_URL}/me`, {
// //       method: "PUT",
// //       headers: {
// //         "Content-Type": "application/json",
// //         Authorization: `Bearer ${token}`,
// //       },
// //       body: JSON.stringify({
// //         Nombre: formData.nombre,
// //         Apellido1: formData.apellido1,
// //         Apellido2: formData.apellido2,
// //         Email: formData.email,
// //         Password: formData.password,
// //       }),
// //     });

// //     const data = await res.json();

// //     if (!res.ok) {
// //       throw new Error(data.error || "Error al actualizar");
// //     }

// //     const updatedUser = {
// //       ...user,
// //       ...formData,
// //     };

// //     setUser(updatedUser);
// //     localStorage.setItem("user", JSON.stringify(updatedUser));

// //     setEditMode(false);
// //     alert("Datos actualizados correctamente");
// //   } catch (err) {
// //     alert(err.message);
// //   }
// // };

// //   return (
// //     <Box p={3} display="flex" justifyContent="center">
// //       <Paper sx={{ p: 4, maxWidth: 900, width: "100%", boxShadow: 3, borderRadius: 2 }}>
// //         {/* Header con avatar */}
// //         <Box display="flex" alignItems="center" mb={3}>
// //           {/* Si no hay avatar, se usa la inicial del nombre */}
// //           <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: "primary.main" }}>{avatarInitials()}</Avatar>
// //           <Box>
// //             <Typography variant="h5">{displayName()}</Typography>
// //             <Typography variant="body2" color="text.secondary">
// //               {user?.email || "No registrado"}
// //             </Typography>
// //           </Box>
// //         </Box>

// //         <Divider sx={{ mb: 3 }} />

// //         {/* Si no hay usuario autenticado, mostrar CTA para login/registro */}
// //         {!user && (
// //           <Box textAlign="center" mb={3}>
// //             <Typography mb={2}>No estás autenticado.</Typography>
// //             <Button variant="contained" onClick={handleGoToLogin} sx={{ mr: 1 }}>
// //               Iniciar sesión
// //             </Button>
// //             <Button variant="outlined" onClick={handleGoToRegister}>
// //               Crear cuenta
// //             </Button>
// //           </Box>
// //         )}

// //         {/* Si hay usuario, mostrar datos y su historial */}
// //         {user && (
// //           <>
// //   {/* Información personal */}
// //   <Box mb={3}>
// //   <Typography variant="h6" mb={1}>
// //     Información personal
// //   </Typography>
// //   <Divider sx={{ my: 1 }} />

// //   <Grid container spacing={2}>
// //     <Grid item xs={12} sm={6}>
// //       {editMode ? (
// //         <TextField
// //           fullWidth
// //           label="Nombre"
// //           value={formData.nombre}
// //           onChange={(e) =>
// //             setFormData({ ...formData, nombre: e.target.value })
// //           }
// //         />
// //       ) : (
// //         <Typography>
// //           <strong>Nombre:</strong> {user.nombre || "No registrado"}
// //         </Typography>
// //       )}
// //     </Grid>

// //     <Grid item xs={12} sm={6}>
// //       {editMode ? (
// //         <TextField
// //           fullWidth
// //           label="Apellido 1"
// //           value={formData.apellido1}
// //           onChange={(e) =>
// //             setFormData({ ...formData, apellido1: e.target.value })
// //           }
// //         />
// //       ) : (
// //         <Typography>
// //           <strong>Apellido 1:</strong> {user.apellido1 || "No registrado"}
// //         </Typography>
// //       )}
// //     </Grid>

// //     <Grid item xs={12} sm={6}>
// //       {editMode ? (
// //         <TextField
// //           fullWidth
// //           label="Apellido 2"
// //           value={formData.apellido2}
// //           onChange={(e) =>
// //             setFormData({ ...formData, apellido2: e.target.value })
// //           }
// //         />
// //       ) : (
// //         <Typography>
// //           <strong>Apellido 2:</strong> {user.apellido2 || "No registrado"}
// //         </Typography>
// //       )}
// //     </Grid>

// //     <Grid item xs={12} sm={6}>
// //       {editMode ? (
// //         <TextField
// //           fullWidth
// //           label="Email"
// //           value={formData.email}
// //           onChange={(e) =>
// //             setFormData({ ...formData, email: e.target.value })
// //           }
// //         />
// //       ) : (
// //         <Typography>
// //           <strong>Email:</strong> {user.email || "No registrado"}
// //         </Typography>
// //       )}
// //     </Grid>

// //     {editMode && (
// //       <Grid item xs={12}>
// //         <TextField
// //           fullWidth
// //           type="password"
// //           label="Nueva contraseña"
// //           value={formData.password}
// //           onChange={(e) =>
// //             setFormData({ ...formData, password: e.target.value })
// //           }
// //         />
// //       </Grid>
// //     )}
// //   </Grid>
// // </Box>

// //             {/* Plan */}
// //             <Box mb={3}>
// //               <Typography variant="h6" mb={1}>
// //                 Plan
// //               </Typography>
// //               <Divider sx={{ my: 1 }} />
// //               <Chip label={user.plan || "No registrado"} color={planColor()} variant="outlined" />
// //             </Box>

// //             {/* Historial: ingresos / gastos vinculados */}
// //             <Box mb={3}>
// //               <Typography variant="h6" mb={1}>
// //                 Historial reciente
// //               </Typography>
// //               <Divider sx={{ my: 1 }} />

// //               {historyLoading ? (
// //                 <Box display="flex" justifyContent="center" py={2}>
// //                   <CircularProgress size={20} />
// //                 </Box>
// //               ) : historyError ? (
// //                 <Typography color="error">{historyError}</Typography>
// //               ) : (
// //                 <>
// //                   {/* INGRESOS */}
// //                   <Box mb={2}>
// //                     <Typography variant="subtitle1" mb={1}>
// //                       Ingresos
// //                     </Typography>
// //                     <Paper sx={{ p: 2 }}>
// //                       {ingresos.length === 0 ? (
// //                         <Typography color="text.secondary">No hay ingresos recientes</Typography>
// //                       ) : (
// //                         <Stack spacing={1}>
// //                           {ingresos.map((inc) => (
// //                             <Box key={inc.id} display="flex" justifyContent="space-between" alignItems="center">
// //                               <Box>
// //                                 <Typography sx={{ fontWeight: 600 }}>{inc.descripcion}</Typography>
// //                                 <Typography variant="body2" color="text.secondary">
// //                                   {fmtDate(inc.fecha)}
// //                                 </Typography>
// //                               </Box>
// //                               {/* Cantidad positiva para ingresos - verde */}
// //                               <Typography color="success.main" sx={{ fontWeight: 700 }}>
// //                                 +{Number(inc.cantidad).toFixed(2)} €
// //                               </Typography>
// //                             </Box>
// //                           ))}
// //                         </Stack>
// //                       )}
// //                     </Paper>
// //                   </Box>

// //                   {/* GASTOS VINCULADOS A RESERVA */}
// //                   <Box mb={2}>
// //                     <Typography variant="subtitle1" mb={1}>
// //                       Gastos vinculados a reservas
// //                     </Typography>
// //                     <Paper sx={{ p: 2 }}>
// //                       {gastosConReserva.length === 0 ? (
// //                         <Typography color="text.secondary">No hay gastos vinculados a reservas</Typography>
// //                       ) : (
// //                         <Stack spacing={1}>
// //                           {gastosConReserva.map((g) => (
// //                             <Box key={g.id} display="flex" justifyContent="space-between" alignItems="center">
// //                               <Box>
// //                                 <Typography sx={{ fontWeight: 600 }}>{g.descripcion}</Typography>
// //                                 <Typography variant="body2" color="text.secondary">
// //                                   {fmtDate(g.fecha)}
// //                                 </Typography>
// //                               </Box>

// //                               <Box textAlign="right">
// //                                 {/* Cantidad negativa para gastos */}
// //                                 <Typography sx={{ fontWeight: 700, color: "error.main" }}>
// //                                   -{Number(g.cantidad).toFixed(2)} €
// //                                 </Typography>
// //                                 {/* chip de color para el estado de la reserva */}
// //                                 <Box mt={0.5}>
// //                                   {renderReservaChip(g.estadoReserva)}
// //                                 </Box>
// //                               </Box>
// //                             </Box>
// //                           ))}
// //                         </Stack>
// //                       )}
// //                     </Paper>
// //                   </Box>
// //                 </>
// //               )}
// //             </Box>

// //             {/* Botón de actualizar (pendiente de implementar) */}
// //             <Box textAlign="center" mt={2}>
// //               <Button variant="contained" color="primary" 
// //               onClick={editMode ? handleUpdate : () => setEditMode(true)}
// //                     >
// //   {editMode ? "Guardar cambios" : "Actualizar datos"}
// // </Button>
// //             </Box>
// //           </>
// //         )}

// //         {/* global error (carga de perfil) */}
// //         {error && (
// //           <Typography color="error" mt={2}>
// //             {error}
// //           </Typography>
// //         )}
// //       </Paper>
// //     </Box>
// //   );
// // }

// // src/pages/Account.jsx
// import { useEffect, useState } from "react";
// import {
//   Box, Typography, Paper, Divider, Avatar, Button, Chip, Grid,
//   CircularProgress, Stack, TextField, Alert, Snackbar, IconButton, Tooltip,
// } from "@mui/material";
// import {
//   Person, Email, Badge, Edit, Save, Close, TrendingUp, TrendingDown,
//   CheckCircle, AccessTime, AccountCircle, Key,
// } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";

// const API_URL = "https://myparking-backend.onrender.com/api";

// const normalizeProfile = (p) => {
//   if (!p) return null;
//   return {
//     nombre: p.Nombre ?? p.nombre ?? "",
//     apellido1: p.Apellido1 ?? p.apellido1 ?? "",
//     apellido2: p.Apellido2 ?? p.apellido2 ?? "",
//     email: p.Email ?? p.email ?? "",
//     plan: p.plan ?? p.planName ?? null,
//     idUsuario: p.idUsuario ?? p.id ?? null,
//     rol: p.Rol ?? p.rol ?? null,
//   };
// };

// const loadFallback = () => {
//   try {
//     const raw = localStorage.getItem("user");
//     if (!raw) return null;
//     const p = JSON.parse(raw);
//     return {
//       nombre: p.nombre || p.Nombre || "",
//       apellido1: p.apellido1 || p.Apellido1 || "",
//       apellido2: p.apellido2 || p.Apellido2 || "",
//       email: p.email || p.Email || "",
//       plan: p.plan || p.planName || "",
//       idUsuario: p.idUsuario || p.id || null,
//       rol: p.rol || p.Rol || null,
//     };
//   } catch { return null; }
// };

// const planColor = (plan) => {
//   if (!plan) return "default";
//   if (plan.toLowerCase().includes("anual")) return "success";
//   if (plan.toLowerCase().includes("mensual")) return "primary";
//   if (plan.toLowerCase().includes("invitado")) return "default";
//   return "warning";
// };

// export default function Account() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [editMode, setEditMode] = useState(false);
//   const [form, setForm] = useState({ nombre: "", apellido1: "", apellido2: "", email: "", password: "" });
//   const [ingresos, setIngresos] = useState([]);
//   const [gastos, setGastos] = useState([]);
//   const [historyLoading, setHistoryLoading] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, msg: "", sev: "success" });

//   // Cargar perfil
//   useEffect(() => {
//     let mounted = true;
//     const token = localStorage.getItem("token");
//     const fetch_ = async () => {
//       setLoading(true);
//       if (!token) { if (mounted) { setUser(loadFallback()); setLoading(false); } return; }
//       try {
//         const res = await fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } });
//         if (!res.ok) { setUser(loadFallback()); setLoading(false); return; }
//         const data = await res.json();
//         if (!mounted) return;
//         const norm = normalizeProfile(data);
//         setUser({ ...loadFallback(), ...norm });
//       } catch { if (mounted) setUser(loadFallback()); }
//       finally { if (mounted) setLoading(false); }
//     };
//     fetch_();
//     return () => { mounted = false; };
//   }, []);

//   useEffect(() => {
//     if (user) setForm({ nombre: user.nombre || "", apellido1: user.apellido1 || "", apellido2: user.apellido2 || "", email: user.email || "", password: "" });
//   }, [user]);

//   // Cargar historial
//   useEffect(() => {
//     let mounted = true;
//     const token = localStorage.getItem("token");
//     if (!token || !user) return;
//     const fetch_ = async () => {
//       setHistoryLoading(true);
//       try {
//         const [movRes, resRes] = await Promise.allSettled([
//           fetch(`${API_URL}/me/monedero/movimientos`, { headers: { Authorization: `Bearer ${token}` } }),
//           fetch(`${API_URL}/reservas/mias`, { headers: { Authorization: `Bearer ${token}` } }),
//         ]);
//         let movs = [], reservas = [];
//         if (movRes.status === "fulfilled" && movRes.value.ok) movs = await movRes.value.json().catch(() => []);
//         if (resRes.status === "fulfilled" && resRes.value.ok) reservas = await resRes.value.json().catch(() => []);
//         const resMap = new Map((Array.isArray(reservas) ? reservas : []).map((r) => [Number(r.idReserva ?? r.id), r.Estado ?? ""]));
//         const list = (Array.isArray(movs) ? movs : []).map((m) => ({
//           id: m.idMovimiento ?? Math.random(),
//           tipo: (m.tipo ?? "").toUpperCase(),
//           desc: m.descripcion ?? "",
//           cantidad: Number(m.cantidad ?? 0),
//           fecha: new Date(m.fecha ?? Date.now()),
//           idReserva: m.id_Reserva ?? m.idReserva ?? null,
//           estadoReserva: m.id_Reserva ? resMap.get(Number(m.id_Reserva)) ?? null : null,
//         })).sort((a, b) => b.fecha - a.fecha);
//         if (mounted) {
//           setIngresos(list.filter((m) => m.tipo === "INGRESO").slice(0, 5));
//           setGastos(list.filter((m) => m.tipo === "GASTO" && m.idReserva).slice(0, 5));
//         }
//       } catch { } finally { if (mounted) setHistoryLoading(false); }
//     };
//     fetch_();
//     return () => { mounted = false; };
//   }, [user]);

//   const handleUpdate = async () => {
//     const token = localStorage.getItem("token");
//     const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const textRx = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
//     if (!textRx.test(form.nombre)) { setSnackbar({ open: true, msg: "Nombre no válido", sev: "error" }); return; }
//     if (!textRx.test(form.apellido1)) { setSnackbar({ open: true, msg: "Apellido 1 no válido", sev: "error" }); return; }
//     if (form.apellido2 && !textRx.test(form.apellido2)) { setSnackbar({ open: true, msg: "Apellido 2 no válido", sev: "error" }); return; }
//     if (!emailRx.test(form.email)) { setSnackbar({ open: true, msg: "Correo no válido", sev: "error" }); return; }
//     try {
//       const res = await fetch(`${API_URL}/me`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ Nombre: form.nombre, Apellido1: form.apellido1, Apellido2: form.apellido2, Email: form.email, Password: form.password }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Error al actualizar");
//       const updated = { ...user, ...form };
//       setUser(updated);
//       localStorage.setItem("user", JSON.stringify(updated));
//       setEditMode(false);
//       setSnackbar({ open: true, msg: "Datos actualizados correctamente", sev: "success" });
//     } catch (err) { setSnackbar({ open: true, msg: err.message, sev: "error" }); }
//   };

//   const displayName = () => {
//     if (!user) return "Usuario";
//     return [user.nombre, user.apellido1].filter(Boolean).join(" ") || user.email || "Usuario";
//   };

//   const initials = () => {
//     if (!user) return "U";
//     const n = user.nombre || user.email || "U";
//     const a = user.apellido1 || "";
//     if (n && a) return `${n[0]}${a[0]}`.toUpperCase();
//     return n[0].toUpperCase();
//   };

//   if (loading) return (
//     <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
//       <CircularProgress />
//     </Box>
//   );

//   const fmtDate = (d) => { try { return (d instanceof Date ? d : new Date(d)).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }); } catch { return "—"; } };
//   const fmtTime = (d) => { try { return (d instanceof Date ? d : new Date(d)).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }); } catch { return "—"; } };

//   return (
//     <Box sx={{ maxWidth: 960, mx: "auto" }}>
//       {/* ── Header card ── */}
//       <Paper
//         sx={{
//           p: 0, mb: 3, borderRadius: 3, overflow: "hidden",
//           background: "#111827", border: "1px solid rgba(255,255,255,0.07)",
//         }}
//       >
//         {/* Banner decorativo */}
//         <Box sx={{ height: 80, background: "linear-gradient(135deg, #00e67618 0%, #7c4dff18 50%, #00bcd418 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
//           <Box sx={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, #00e67609, transparent 50%), radial-gradient(circle at 80% 50%, #7c4dff09, transparent 50%)" }} />
//         </Box>
//         <Box sx={{ px: 3, pb: 3 }}>
//           <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "flex-end" }} sx={{ mt: "-32px" }}>
//             <Avatar
//               sx={{
//                 width: 72, height: 72,
//                 background: "linear-gradient(135deg, #00e676, #00bcd4)",
//                 fontSize: "1.6rem", fontWeight: 800, border: "3px solid #111827",
//                 boxShadow: "0 4px 16px rgba(0,230,118,0.3)",
//               }}
//             >
//               {initials()}
//             </Avatar>
//             <Box flex={1} pb={0.5}>
//               <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
//                 <Typography variant="h5" fontWeight={800} sx={{ color: "#fff" }}>
//                   {displayName()}
//                 </Typography>
//                 {user?.rol === "ADMIN" && (
//                   <Chip label="Admin" size="small" sx={{ bgcolor: "#7c4dff22", color: "#7c4dff", border: "1px solid #7c4dff44", fontWeight: 700, fontSize: "0.68rem" }} />
//                 )}
//                 {user?.plan && (
//                   <Chip label={user.plan} size="small" color={planColor(user.plan)} variant="outlined" sx={{ fontWeight: 600, fontSize: "0.68rem" }} />
//                 )}
//               </Stack>
//               <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", mt: 0.3 }}>
//                 {user?.email}
//               </Typography>
//             </Box>
//             <Box>
//               {!editMode ? (
//                 <Button startIcon={<Edit />} variant="outlined" size="small" onClick={() => setEditMode(true)} sx={{ borderRadius: 2, color: "#00e676", borderColor: "#00e67644", "&:hover": { borderColor: "#00e676", bgcolor: "#00e67611" } }}>
//                   Editar perfil
//                 </Button>
//               ) : (
//                 <Stack direction="row" spacing={1}>
//                   <Button startIcon={<Save />} variant="contained" size="small" onClick={handleUpdate} sx={{ borderRadius: 2 }}>Guardar</Button>
//                   <Button startIcon={<Close />} variant="outlined" size="small" onClick={() => setEditMode(false)} sx={{ borderRadius: 2, color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.15)" }}>Cancelar</Button>
//                 </Stack>
//               )}
//             </Box>
//           </Stack>
//         </Box>
//       </Paper>

//       <Grid container spacing={3}>
//         {/* ── Datos personales ── */}
//         <Grid item xs={12} md={6}>
//           <Paper sx={{ p: 2.5, borderRadius: 3, background: "#111827", border: "1px solid rgba(255,255,255,0.07)", height: "100%" }}>
//             <Stack direction="row" alignItems="center" spacing={1} mb={2}>
//               <Person sx={{ color: "#00e676", fontSize: 18 }} />
//               <Typography fontWeight={700} sx={{ color: "#fff" }}>Información personal</Typography>
//             </Stack>
//             <Stack spacing={2}>
//               {editMode ? (
//                 <>
//                   <Grid container spacing={1.5}>
//                     <Grid item xs={12}><TextField fullWidth size="small" label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Grid>
//                     <Grid item xs={6}><TextField fullWidth size="small" label="Apellido 1" value={form.apellido1} onChange={(e) => setForm({ ...form, apellido1: e.target.value })} /></Grid>
//                     <Grid item xs={6}><TextField fullWidth size="small" label="Apellido 2" value={form.apellido2} onChange={(e) => setForm({ ...form, apellido2: e.target.value })} /></Grid>
//                     <Grid item xs={12}><TextField fullWidth size="small" label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
//                     <Grid item xs={12}><TextField fullWidth size="small" type="password" label="Nueva contraseña" placeholder="Dejar vacío para no cambiar" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Grid>
//                   </Grid>
//                 </>
//               ) : (
//                 <>
//                   {[
//                     { icon: <Badge sx={{ fontSize: 15 }} />, label: "Nombre completo", value: [user?.nombre, user?.apellido1, user?.apellido2].filter(Boolean).join(" ") },
//                     { icon: <Email sx={{ fontSize: 15 }} />, label: "Correo electrónico", value: user?.email },
//                     { icon: <AccountCircle sx={{ fontSize: 15 }} />, label: "ID de usuario", value: user?.idUsuario ? `#${user.idUsuario}` : "—" },
//                     { icon: <Key sx={{ fontSize: 15 }} />, label: "Contraseña", value: "••••••••••" },
//                   ].map(({ icon, label, value }) => (
//                     <Box key={label} sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
//                       <Stack direction="row" alignItems="center" spacing={0.6} mb={0.3} sx={{ color: "rgba(255,255,255,0.35)" }}>
//                         {icon}
//                         <Typography sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</Typography>
//                       </Stack>
//                       <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "#fff" }}>{value || "—"}</Typography>
//                     </Box>
//                   ))}
//                 </>
//               )}
//             </Stack>
//           </Paper>
//         </Grid>

//         {/* ── Resumen financiero ── */}
//         <Grid item xs={12} md={6}>
//           <Paper sx={{ p: 2.5, borderRadius: 3, background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
//             <Stack direction="row" alignItems="center" spacing={1} mb={2}>
//               <TrendingUp sx={{ color: "#00e676", fontSize: 18 }} />
//               <Typography fontWeight={700} sx={{ color: "#fff" }}>Resumen financiero</Typography>
//             </Stack>
//             <Grid container spacing={1.5} mb={2}>
//               {[
//                 { label: "Total ingresos", value: ingresos.reduce((a, m) => a + m.cantidad, 0), color: "#00e676", icon: <TrendingDown sx={{ fontSize: 16 }} /> },
//                 { label: "Total gastos", value: gastos.reduce((a, m) => a + m.cantidad, 0), color: "#ff5252", icon: <TrendingUp sx={{ fontSize: 16 }} /> },
//               ].map(({ label, value, color, icon }) => (
//                 <Grid item xs={6} key={label}>
//                   <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}10`, border: `1px solid ${color}22`, textAlign: "center" }}>
//                     <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ color, mb: 0.5 }}>
//                       {icon}
//                       <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</Typography>
//                     </Stack>
//                     <Typography sx={{ fontSize: "1.3rem", fontWeight: 800, color }}>{value.toFixed(2)} €</Typography>
//                   </Box>
//                 </Grid>
//               ))}
//             </Grid>

//             {historyLoading ? (
//               <Box display="flex" justifyContent="center" py={2}><CircularProgress size={20} sx={{ color: "#00e676" }} /></Box>
//             ) : (
//               <Stack spacing={0.8}>
//                 <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>
//                   Últimas operaciones
//                 </Typography>
//                 {[...ingresos.slice(0, 2), ...gastos.slice(0, 2)]
//                   .sort((a, b) => b.fecha - a.fecha)
//                   .slice(0, 4)
//                   .map((m) => (
//                     <Stack key={m.id} direction="row" justifyContent="space-between" alignItems="center"
//                       sx={{ py: 0.8, px: 1, borderRadius: 1.5, bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
//                       <Stack direction="row" alignItems="center" spacing={1}>
//                         <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: m.tipo === "INGRESO" ? "#00e676" : "#ff5252" }} />
//                         <Box>
//                           <Typography sx={{ fontSize: "0.78rem", color: "#fff", fontWeight: 500 }} noWrap>{m.desc || "Movimiento"}</Typography>
//                           <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>{fmtDate(m.fecha)} · {fmtTime(m.fecha)}</Typography>
//                         </Box>
//                       </Stack>
//                       <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: m.tipo === "INGRESO" ? "#00e676" : "#ff5252", flexShrink: 0, ml: 1 }}>
//                         {m.tipo === "INGRESO" ? "+" : "-"}{m.cantidad.toFixed(2)} €
//                       </Typography>
//                     </Stack>
//                   ))}
//                 {ingresos.length === 0 && gastos.length === 0 && (
//                   <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", textAlign: "center", py: 1 }}>Sin movimientos recientes</Typography>
//                 )}
//               </Stack>
//             )}
//           </Paper>
//         </Grid>

//         {/* ── Historial de reservas ── */}
//         <Grid item xs={12}>
//           <Paper sx={{ p: 2.5, borderRadius: 3, background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
//             <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
//               <Stack direction="row" alignItems="center" spacing={1}>
//                 <AccessTime sx={{ color: "#00e676", fontSize: 18 }} />
//                 <Typography fontWeight={700} sx={{ color: "#fff" }}>Reservas vinculadas a gastos</Typography>
//               </Stack>
//               <Button size="small" sx={{ color: "#00e676", fontSize: "0.75rem" }} onClick={() => navigate("/invoices")}>Ver facturas →</Button>
//             </Stack>
//             {historyLoading ? (
//               <Box display="flex" justifyContent="center" py={2}><CircularProgress size={20} /></Box>
//             ) : gastos.length === 0 ? (
//               <Typography sx={{ color: "rgba(255,255,255,0.3)", textAlign: "center", py: 2, fontSize: "0.85rem" }}>
//                 No hay gastos vinculados a reservas
//               </Typography>
//             ) : (
//               <Stack spacing={0.8}>
//                 {gastos.map((g) => (
//                   <Stack key={g.id} direction="row" justifyContent="space-between" alignItems="center"
//                     sx={{ py: 1, px: 1.5, borderRadius: 2, bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
//                     <Box>
//                       <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff" }}>{g.desc}</Typography>
//                       <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)" }}>{fmtDate(g.fecha)}</Typography>
//                     </Box>
//                     <Stack direction="row" alignItems="center" spacing={1}>
//                       {g.estadoReserva && (
//                         <Chip
//                           label={g.estadoReserva}
//                           size="small"
//                           sx={{
//                             height: 20, fontSize: "0.62rem", fontWeight: 700,
//                             bgcolor: g.estadoReserva === "FINALIZADA" ? "rgba(0,230,118,0.1)" : "rgba(255,152,0,0.1)",
//                             color: g.estadoReserva === "FINALIZADA" ? "#00e676" : "#ff9800",
//                             border: `1px solid ${g.estadoReserva === "FINALIZADA" ? "rgba(0,230,118,0.2)" : "rgba(255,152,0,0.2)"}`,
//                           }}
//                         />
//                       )}
//                       <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#ff5252" }}>
//                         -{g.cantidad.toFixed(2)} €
//                       </Typography>
//                     </Stack>
//                   </Stack>
//                 ))}
//               </Stack>
//             )}
//           </Paper>
//         </Grid>
//       </Grid>

//       <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
//         <Alert severity={snackbar.sev} variant="filled" sx={{ borderRadius: 2 }} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
//           {snackbar.msg}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }

// Hooks principales de React
import { useEffect, useState } from "react";
// import "../App.css"
// Componentes de interfaz (UI)
import {
  Box,
  Typography,
  Paper,
  Divider,
  Avatar,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Stack,
  TextField,
} from "@mui/material";

// Hook de navegación
import { useNavigate } from "react-router-dom";

// URL base del backend 
const API_URL = "https://myparking-backend.onrender.com/api";

export default function Account() {
  const navigate = useNavigate();

  // Estado del usuario autenticado
  const [user, setUser] = useState(null); // { nombre, apellido1, apellido2, email, plan, idUsuario }
  // Estados de carga y error del perfil
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
  nombre: "",
  apellido1: "",
  apellido2: "",
  email: "",
  password: "",
  });

  // historial separado
  const [ingresos, setIngresos] = useState([]); // movimientos de tipo INGRESO
  const [gastosConReserva, setGastosConReserva] = useState([]);   // movimientos de tipo GASTO que tienen idReserva asociado (vinculados a reserva)

  // Estados de carga/error del historial
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Fallback en localstorage
  const loadFallbackUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);

      // Normaliza distintos nombres (para cambios en la BD o inconsistencias)
      return {
        nombre: parsed.nombre || parsed.Nombre || parsed.name || "",
        apellido1: parsed.apellido1 || parsed.Apellido1 || parsed.lastName || "",
        apellido2: parsed.apellido2 || parsed.Apellido2 || "",
        email: parsed.email || parsed.Email || "",
        plan: parsed.plan || parsed.planName || "",
        idUsuario: parsed.idUsuario || parsed.id || null,
      };
    } catch {
      return null;
    }
  };

  // Normalización de datos del backend para perfil -- PENDIENTE UNIFICAR CON LO DE ARRIBA (CODE SMELL DE DUPLICACION)
  const normalizeProfile = (p) => {
    if (!p) return null;
    return {
      nombre: p.Nombre ?? p.nombre ?? p.firstName ?? "",
      apellido1: p.Apellido1 ?? p.apellido1 ?? p.lastName ?? "",
      apellido2: p.Apellido2 ?? p.apellido2 ?? "",
      email: p.Email ?? p.email ?? "",
      plan: p.plan ?? p.planName ?? null,
      idUsuario: p.idUsuario ?? p.id ?? null,
    };
  };

  // Cargar perfil del usuario
  useEffect(() => {
    let mounted = true;   // evita setState si el componente se desmonta durante la carga
    const token = localStorage.getItem("token");

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      if (!token) {       // Si no hay token se intenta fallback local
        if (mounted) {
          setUser(loadFallbackUser());
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Manejo de errores HTTP
        if (!res.ok) {
          if (res.status === 401) {
            // Token inválido → limpiar sesión y fallback local
            localStorage.removeItem("token");
            if (mounted) setUser(loadFallbackUser());
            setLoading(false);
            return;
          }
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Error ${res.status}`);
        }

        const data = await res.json();
        if (!mounted) return;

        const normalized = normalizeProfile(data);
        const fallback = loadFallbackUser();
        const finalUser = { ...fallback, ...normalized };
        setUser(finalUser);
      } catch (err) {
        console.error("Error cargando perfil:", err);
        if (mounted) {
          setError("No se pudo cargar el perfil. Mostrando datos locales si existen.");
          setUser(loadFallbackUser());
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
  if (user) {
    setFormData({
      nombre: user.nombre || "",
      apellido1: user.apellido1 || "",
      apellido2: user.apellido2 || "",
      email: user.email || "",
      password: "",
    });
  }
}, [user]);

  // Cargar historial real: movimientos del monedero + reservas
  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError("");
      try {
        // traer movimientos y reservas en paralelo - OPTIMIZCION
        const [movRes, revRes] = await Promise.allSettled([
          fetch(`${API_URL}/me/monedero/movimientos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/reservas/mias`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // parsear movimientos
        let movimientos = [];
        if (movRes.status === "fulfilled") {
          const r = movRes.value;
          if (r.ok) {
            const data = await r.json().catch(() => []);
            movimientos = Array.isArray(data) ? data : [];
          } else {
            // si responde pero con error, intentar parsear mensaje para mostrar
            try {
              const errBody = await movRes.value.json();
              console.error("Movimientos error:", errBody);
            } catch (err) {
              console.error("Error parseando error de movimientos:", err);
            }
          }
        }

        // parsear reservas y construir map para consultar estado por idReserva
        let reservas = [];
        if (revRes.status === "fulfilled") {
          const r = revRes.value;
          if (r.ok) {
            const data = await r.json().catch(() => []);
            reservas = Array.isArray(data) ? data : [];
          } else {
            try {
              const errBody = await revRes.value.json();
              console.error("Reservas error:", errBody);
            } catch (err) {
              console.error("Error parseando error de movimientos:", err);
            }
          }
        }

        // normalizar reservas a mapa: idReserva -> Estado
        const reservasMap = new Map();
        reservas.forEach((rs) => {
          const id = rs.idReserva ?? rs.id_reserva ?? rs.id ?? null;
          const estado = rs.Estado ?? rs.estado ?? rs.Estado ?? null;
          if (id != null) reservasMap.set(Number(id), estado ?? null);
        });

        // Construir listas separadas
        const ingresosList = [];
        const gastosConReservaList = [];

        (movimientos || []).forEach((m) => {
          // normalizar campos comunes
          const tipo = (m.tipo ?? m.TIPO ?? "").toString().toUpperCase();
          const cantidad = Number(m.cantidad ?? m.CANTIDAD ?? m.amount ?? 0);
          // NORMALIZAcION id de reserva
          const idReserva =
            m.id_Reserva ?? m.idReserva ?? m.id_reserva ?? m.id_reserv ?? null;

          // fecha: intentar parsear
          let fecha;
          try {
            fecha = m.fecha ? new Date(m.fecha) : new Date();
          } catch {
            fecha = new Date();
          }

          const item = {
            id: `mov-${m.idMovimiento ?? m.id ?? Math.random()}`,
            tipo,
            descripcion: m.descripcion ?? m.descripcion_mov ?? m.desc ?? "",
            cantidad,
            fecha,
            idReserva: idReserva != null ? Number(idReserva) : null,
            raw: m,
          };

          if (tipo === "INGRESO") {
            ingresosList.push(item);
          } else {
            // GASTO
            if (item.idReserva) {
              // adjuntar estado de reserva si existe en map
              const estadoReserva = reservasMap.has(item.idReserva)
                ? reservasMap.get(item.idReserva)
                : null;

              gastosConReservaList.push({ ...item, estadoReserva });
            }
          }
        });

        // ordenar desc por fecha (más reciente primero)
        const sortDesc = (a, b) => b.fecha - a.fecha;
        ingresosList.sort(sortDesc);
        gastosConReservaList.sort(sortDesc);

        if (mounted) {
          setIngresos(ingresosList);
          setGastosConReserva(gastosConReservaList);
        }
      } catch (err) {
        console.error("Error cargando historial:", err);
        if (mounted) setHistoryError("Error al cargar historial.");
      } finally {
        if (mounted) setHistoryLoading(false);
      }
    };

    fetchHistory();
    return () => {
      mounted = false;
    };
  }, [user]); // disparar cuando se cargue user

  // AYUDAS UI
  const displayName = () => {
    if (!user) return "Usuario no registrado";
    const parts = [];
    if (user.nombre) parts.push(user.nombre);
    if (user.apellido1) parts.push(user.apellido1);
    return parts.join(" ") || user.email || "Usuario";
  };

  const avatarInitials = () => {
    if (!user) return "U";
    const name = user.nombre || user.email || "U";
    return name.trim().charAt(0).toUpperCase();
  };

  const planColor = () => {
    const plan = (user && user.plan) || "";
    switch (plan) {
      case "Residente anual":
        return "success";
      case "Residente mensual":
        return "primary";
      case "Invitado":
        return "default";
      default:
        return "warning";
    }
  };

  // navegación a login/register
  const handleGoToLogin = () => navigate("/");
  const handleGoToRegister = () => navigate("/register");

  // loader principal
  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // Formatea fecha (acepta date o string)
  const fmtDate = (d) => {
    try {
      return d instanceof Date ? d.toLocaleString() : new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  };

  // Renderizado de estado de reserva en gastos vinculados y normalización de estados con chips de colores
  const renderReservaChip = (estado) => {
    if (!estado) return <Chip label="DESCONOCIDO" size="small" />;
    const e = String(estado).toUpperCase();
    if (e === "FINALIZADA") return <Chip label="FINALIZADA" size="small" color="success" />;
    if (e === "EN CURSO" || e === "ENCURSO" || e === "EN_CURSO") return <Chip label="EN CURSO" size="small" color="warning" />;
    return <Chip label={String(estado)} size="small" />;
  };

  const handleUpdate = async () => {
  const token = localStorage.getItem("token");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const textRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;

  if (!textRegex.test(formData.nombre)) {
    alert("Nombre no válido");
    return;
  }

  if (!textRegex.test(formData.apellido1)) {
    alert("Apellido 1 no válido");
    return;
  }

  if (
    formData.apellido2 &&
    !textRegex.test(formData.apellido2)
  ) {
    alert("Apellido 2 no válido");
    return;
  }

  if (!emailRegex.test(formData.email)) {
    alert("Correo electrónico no válido");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        Nombre: formData.nombre,
        Apellido1: formData.apellido1,
        Apellido2: formData.apellido2,
        Email: formData.email,
        Password: formData.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al actualizar");
    }

    const updatedUser = {
      ...user,
      ...formData,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setEditMode(false);
    alert("Datos actualizados correctamente");
  } catch (err) {
    alert(err.message);
  }
};

  return (
    <Box p={3} display="flex" justifyContent="center">
      <Paper sx={{ p: 4, maxWidth: 900, width: "100%", boxShadow: 3, borderRadius: 2 }}>
        {/* Header con avatar */}
        <Box display="flex" alignItems="center" mb={3}>
          {/* Si no hay avatar, se usa la inicial del nombre */}
          <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: "primary.main" }}>{avatarInitials()}</Avatar>
          <Box>
            <Typography variant="h5">{displayName()}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || "No registrado"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Si no hay usuario autenticado, mostrar CTA para login/registro */}
        {!user && (
          <Box textAlign="center" mb={3}>
            <Typography mb={2}>No estás autenticado.</Typography>
            <Button variant="contained" onClick={handleGoToLogin} sx={{ mr: 1 }}>
              Iniciar sesión
            </Button>
            <Button variant="outlined" onClick={handleGoToRegister}>
              Crear cuenta
            </Button>
          </Box>
        )}

        {/* Si hay usuario, mostrar datos y su historial */}
        {user && (
          <>
  {/* Información personal */}
  <Box mb={3}>
  <Typography variant="h6" mb={1}>
    Información personal
  </Typography>
  <Divider sx={{ my: 1 }} />

  <Grid container spacing={2}>
    <Grid item xs={12} sm={6}>
      {editMode ? (
        <TextField
          fullWidth
          label="Nombre"
          value={formData.nombre}
          onChange={(e) =>
            setFormData({ ...formData, nombre: e.target.value })
          }
        />
      ) : (
        <Typography>
          <strong>Nombre:</strong> {user.nombre || "No registrado"}
        </Typography>
      )}
    </Grid>

    <Grid item xs={12} sm={6}>
      {editMode ? (
        <TextField
          fullWidth
          label="Apellido 1"
          value={formData.apellido1}
          onChange={(e) =>
            setFormData({ ...formData, apellido1: e.target.value })
          }
        />
      ) : (
        <Typography>
          <strong>Apellido 1:</strong> {user.apellido1 || "No registrado"}
        </Typography>
      )}
    </Grid>

    <Grid item xs={12} sm={6}>
      {editMode ? (
        <TextField
          fullWidth
          label="Apellido 2"
          value={formData.apellido2}
          onChange={(e) =>
            setFormData({ ...formData, apellido2: e.target.value })
          }
        />
      ) : (
        <Typography>
          <strong>Apellido 2:</strong> {user.apellido2 || "No registrado"}
        </Typography>
      )}
    </Grid>

    <Grid item xs={12} sm={6}>
      {editMode ? (
        <TextField
          fullWidth
          label="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />
      ) : (
        <Typography>
          <strong>Email:</strong> {user.email || "No registrado"}
        </Typography>
      )}
    </Grid>

    {editMode && (
      <Grid item xs={12}>
        <TextField
          fullWidth
          type="password"
          label="Nueva contraseña"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
      </Grid>
    )}
  </Grid>
</Box>

            {/* Plan */}
            <Box mb={3}>
              <Typography variant="h6" mb={1}>
                Plan
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Chip label={user.plan || "No registrado"} color={planColor()} variant="outlined" />
            </Box>

            {/* Historial: ingresos / gastos vinculados */}
            <Box mb={3}>
              <Typography variant="h6" mb={1}>
                Historial reciente
              </Typography>
              <Divider sx={{ my: 1 }} />

              {historyLoading ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={20} />
                </Box>
              ) : historyError ? (
                <Typography color="error">{historyError}</Typography>
              ) : (
                <>
                  {/* INGRESOS */}
                  <Box mb={2}>
                    <Typography variant="subtitle1" mb={1}>
                      Ingresos
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                      {ingresos.length === 0 ? (
                        <Typography color="text.secondary">No hay ingresos recientes</Typography>
                      ) : (
                        <Stack spacing={1}>
                          {ingresos.map((inc) => (
                            <Box key={inc.id} display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography sx={{ fontWeight: 600 }}>{inc.descripcion}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {fmtDate(inc.fecha)}
                                </Typography>
                              </Box>
                              {/* Cantidad positiva para ingresos - verde */}
                              <Typography color="success.main" sx={{ fontWeight: 700 }}>
                                +{Number(inc.cantidad).toFixed(2)} €
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  </Box>

                  {/* GASTOS VINCULADOS A RESERVA */}
                  <Box mb={2}>
                    <Typography variant="subtitle1" mb={1}>
                      Gastos vinculados a reservas
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                      {gastosConReserva.length === 0 ? (
                        <Typography color="text.secondary">No hay gastos vinculados a reservas</Typography>
                      ) : (
                        <Stack spacing={1}>
                          {gastosConReserva.map((g) => (
                            <Box key={g.id} display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography sx={{ fontWeight: 600 }}>{g.descripcion}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {fmtDate(g.fecha)}
                                </Typography>
                              </Box>

                              <Box textAlign="right">
                                {/* Cantidad negativa para gastos */}
                                <Typography sx={{ fontWeight: 700, color: "error.main" }}>
                                  -{Number(g.cantidad).toFixed(2)} €
                                </Typography>
                                {/* chip de color para el estado de la reserva */}
                                <Box mt={0.5}>
                                  {renderReservaChip(g.estadoReserva)}
                                </Box>
                              </Box>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  </Box>
                </>
              )}
            </Box>

            {/* Botón de actualizar (pendiente de implementar) */}
            <Box textAlign="center" mt={2}>
              <Button variant="contained" color="primary" 
              onClick={editMode ? handleUpdate : () => setEditMode(true)}
                    >
  {editMode ? "Guardar cambios" : "Actualizar datos"}
</Button>
            </Box>
          </>
        )}

        {/* global error (carga de perfil) */}
        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
