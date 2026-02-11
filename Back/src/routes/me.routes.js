// src/routes/me.routes.js
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getMe } from "../controllers/me.controller.js";

const router = Router();

router.get("/", authMiddleware, getMe);

export default router;
