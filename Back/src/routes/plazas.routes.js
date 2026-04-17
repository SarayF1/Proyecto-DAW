import { Router } from "express";
import { getPlazas } from "../controllers/plazas.controller.js";

const router = Router();

router.get("/", getPlazas);

export default router;
