import express from "express";
import { pool } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import zonasRoutes from "./routes/zonas.routes.js";
import plazasRoutes from "./routes/plazas.routes.js";
import reservasRoutes from "./routes/reservas.routes.js";


const app = express();

// Middlewares
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/zonas", zonasRoutes);
app.use("/api/plazas", plazasRoutes);
app.use("/api/reservas", reservasRoutes);




// Rutas de prueba
app.get("/", (req, res) => {
  res.send("Backend MyParking funcionando");
});

app.get("/api/test-db", async (req, res) => {
  const [rows] = await pool.query("SHOW TABLES");
  res.json(rows);
});


// Prueba de ruta protegida

// import { authMiddleware } from "./middlewares/auth.middleware.js";

// app.get("/api/me", authMiddleware, (req, res) => {
//   res.json({
//     message: "Ruta protegida",
//     user: req.user,
//   });
// });


export default app;
