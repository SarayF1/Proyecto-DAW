// src/controllers/me.controller.js
import { pool } from "../config/db.js";

export const getMe = async (req, res) => {
  const { idUsuario } = req.user;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        idUsuario,
        Nombre,
        Apellido1,
        Apellido2,
        Email,
        Rol
      FROM Usuarios
      WHERE idUsuario = ?
      `,
      [idUsuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("getMe:", error);
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};
