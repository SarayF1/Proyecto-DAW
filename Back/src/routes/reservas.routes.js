import { Router } from "express";
import {
  getMisReservas,
  crearReserva,
} from "../controllers/reservas.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * GET /api/reservas/mias
 * Devuelve las reservas del usuario autenticado
 */
router.get("/mias", authMiddleware, getMisReservas);

/**
 * POST /api/reservas
 * Crea una reserva y:
 *  - calcula el importe
 *  - descuenta saldo del monedero
 *  - registra movimiento (GASTO)
 *  - marca la plaza como EN USO
 */
router.post("/", authMiddleware, crearReserva);

export default router;
