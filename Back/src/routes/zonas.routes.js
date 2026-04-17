import { Router } from "express";
import { getZonas } from "../controllers/zonas.controller.js";

const router = Router();

router.get("/", getZonas);

export default router;
