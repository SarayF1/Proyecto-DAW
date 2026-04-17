// src/routes/admin.routes.js
import { Router } from "express";
import {
  getReservasActivas,
  getEstadisticas,
  getReservasPorZona,
  finalizarReserva,
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Protección global
router.use(authMiddleware, isAdmin);

// Rutas
router.get("/reservas-activas", getReservasActivas);
router.get("/estadisticas", getEstadisticas);
router.get("/reservas-por-zona", getReservasPorZona);
router.put("/reservas/:idReserva/finalizar", finalizarReserva);

export default router;