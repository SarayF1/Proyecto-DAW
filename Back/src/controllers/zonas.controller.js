import { pool } from "../config/db.js";

export const getZonas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT idZona, nombre, Localidad, Horario_inicio, Horario_fin FROM Zona"
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las zonas" });
  }
};
