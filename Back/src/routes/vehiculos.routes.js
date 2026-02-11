import express from "express";
import {
  getMyVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from "../controllers/vehiculos.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware); // todas requieren auth

router.get("/", getMyVehicles);
router.post("/", createVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

export default router;
