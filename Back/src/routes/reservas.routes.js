import { Router } from "express";
import {
  getMisReservas,
  crearReserva
} from "../controllers/reservas.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Ver mis reservas
router.get("/mias", authMiddleware, getMisReservas);

// Crear una reserva
router.post("/", authMiddleware, crearReserva);

export default router;
