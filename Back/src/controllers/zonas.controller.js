import { pool } from "../config/db.js";

export const getZonas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        z.idZona,
        z.nombre,
        z.Localidad,
        z.Tarifa,
        z.lat,
        z.lng,
        z.Horario_inicio,
        z.Horario_fin,
        COUNT(p.idPlaza) AS totalPlazas,
        COALESCE(SUM(p.Estado_Plaza = 'LIBRE'), 0) AS plazasLibres,
        COALESCE(SUM(p.Estado_Plaza = 'EN USO'), 0) AS plazasEnUso
      FROM Zona z
      LEFT JOIN Plaza p ON p.id_Zona = z.idZona
      GROUP BY z.idZona
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener zonas" });
  }
};
