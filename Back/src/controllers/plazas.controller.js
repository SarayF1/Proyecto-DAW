import { pool } from "../config/db.js";

export const getPlazas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.idPlaza,
        p.Tarifa,
        p.Estado_Plaza,
        z.idZona,
        z.nombre AS zona,
        z.Localidad
      FROM Plaza p
      JOIN Zona z ON p.id_Zona = z.idZona
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las plazas" });
  }
};
