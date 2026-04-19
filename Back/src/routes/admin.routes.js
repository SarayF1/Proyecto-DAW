// src/routes/admin.routes.js
import { Router } from "express";
import {
  // Dashboard (ya existían)
  getReservasActivas,
  getEstadisticas,
  getReservasPorZona,
  finalizarReserva,
  // Block A
  getUsuarios,
  updateUsuario,
  deleteUsuario,
  getPlazasAdmin,
  updatePlazaAdmin,
  getAllReservas,
  deleteReserva,
  // Block B
  reembolsarReserva,
  // Block C
  getIngresosDiarios,
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Protección global: todas las rutas exigen JWT válido + rol ADMIN
router.use(authMiddleware, isAdmin);

// ── Dashboard ──
router.get("/estadisticas",       getEstadisticas);
router.get("/reservas-activas",   getReservasActivas);
router.get("/reservas-por-zona",  getReservasPorZona);
router.get("/ingresos-diarios",   getIngresosDiarios);

// ── Usuarios ──
router.get   ("/usuarios",     getUsuarios);
router.put   ("/usuarios/:id", updateUsuario);
router.delete("/usuarios/:id", deleteUsuario);

// ── Plazas ──
router.get("/plazas",     getPlazasAdmin);
router.put("/plazas/:id", updatePlazaAdmin);

// ── Reservas ──
router.get   ("/reservas",                       getAllReservas);
router.put   ("/reservas/:idReserva/finalizar",  finalizarReserva);
router.post  ("/reservas/:idReserva/reembolsar", reembolsarReserva);
router.delete("/reservas/:id",                   deleteReserva);

export default router;
