import express from "express";
import cors from "cors";
import cron from  "node-cron";
import { pool } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import zonasRoutes from "./routes/zonas.routes.js";
import plazasRoutes from "./routes/plazas.routes.js";
import reservasRoutes from "./routes/reservas.routes.js";
import vehiculosRoutes from "./routes/vehiculos.routes.js";
import monederoRoutes from "./routes/monedero.routes.js";
import meRoutes from "./routes/me.routes.js";


const app = express();

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middlewares
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/zonas", zonasRoutes);
app.use("/api/plazas", plazasRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/me/vehiculos", vehiculosRoutes);
app.use("/api/me", monederoRoutes);
app.use("/api/me", meRoutes);

// CRON PARA LIMPIAR RESERVAS EXPIRADAS CADA MINUTO
cron.schedule("*/1 * * * *", async () => {
  console.log("⏳ Ejecutando cron para limpiar reservas expiradas...");

  try {
    // 1️⃣ Ver qué reservas van a cambiar
    const [reservas] = await pool.query(`
      SELECT idReserva, id_Plaza
      FROM Reserva
      WHERE Estado = 'EN CURSO'
        AND Fecha_fin < NOW()
    `);

    if (reservas.length === 0) {
      console.log("✔ No hay reservas expiradas.");
      return;
    }

    console.log("🔎 Reservas expiradas encontradas:", reservas);

    // 2️⃣ Actualizar reservas y plazas
    const [result] = await pool.query(`
      UPDATE Plaza p
      JOIN Reserva r ON r.id_Plaza = p.idPlaza
      SET r.Estado = 'FINALIZADA',
          p.Estado_Plaza = 'LIBRE'
      WHERE r.Estado = 'EN CURSO'
        AND r.Fecha_fin < NOW()
    `);

    console.log(`✅ Reservas finalizadas: ${result.affectedRows}`);

  } catch (err) {
    console.error("❌ Error cron reservas:", err);
  }
});



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
