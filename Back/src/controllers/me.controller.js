// src/controllers/me.controller.js
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

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


export const updateMe = async (req, res) => {
  try {
    const userId = req.user.idUsuario;

    const {
      Nombre,
      Apellido1,
      Apellido2,
      Email,
      Password,
    } = req.body;

    let query = `
      UPDATE Usuarios
      SET Nombre = ?, Apellido1 = ?, Apellido2 = ?, Email = ?
    `;

    const values = [
      Nombre,
      Apellido1,
      Apellido2,
      Email,
    ];

    if (Password && Password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(Password, 10);
      query += `, Contraseña = ?`;
      values.push(hashedPassword);
    }

    query += ` WHERE idUsuario = ?`;
    values.push(userId);

    await pool.query(query, values);

    res.json({
      message: "Datos actualizados correctamente",
    });
  } catch (error) {
    console.error("Error updateMe:", error);

    res.status(500).json({
      error: "Error al actualizar usuario",
    });
  }
};
