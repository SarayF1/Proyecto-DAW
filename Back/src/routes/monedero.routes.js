import { Router } from "express";
import {
  getMonedero,
  getMovimientos,
  recargarSaldo,
  aplicarCodigoPromo,
  pagarReserva,
} from "../controllers/monedero.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas del monedero requieren autenticación
router.use(authMiddleware);

// Monedero
router.get("/monedero", getMonedero);
router.get("/monedero/movimientos", getMovimientos);
router.post("/monedero/recarga", recargarSaldo);
router.post("/monedero/codigo", aplicarCodigoPromo);
router.post("/monedero/pagar-reserva", pagarReserva);

export default router;
