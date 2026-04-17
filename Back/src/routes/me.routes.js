// src/routes/me.routes.js
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getMe, updateMe } from "../controllers/me.controller.js";

const router = Router();

router.get("/", authMiddleware, getMe);
router.put("/", authMiddleware, updateMe);

export default router;
