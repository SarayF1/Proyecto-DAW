// controllers/vehiculos.controller.js
import { pool } from "../config/db.js";

export const getMyVehicles = async (req, res) => {
  const userId = req.user.idUsuario;
  try {
    const [rows] = await pool.query(
      "SELECT idVehiculo, Matricula AS plate, Marca AS brand, Modelo AS model, Anio AS year, created_at FROM Vehiculos WHERE id_Usuario = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("getMyVehicles error:", err);
    res.status(500).json({ error: "Error al obtener vehículos" });
  }
};

export const createVehicle = async (req, res) => {
  const userId = req.user.idUsuario;
  const { plate, brand, model, year } = req.body;

  if (!plate || !brand || !model) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO Vehiculos (id_Usuario, Matricula, Marca, Modelo, Anio)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, plate.toUpperCase(), brand, model, year || null]
    );

    const insertedId = result.insertId;
    const [rows] = await pool.query(
      "SELECT idVehiculo, Matricula AS plate, Marca AS brand, Modelo AS model, Anio AS year, created_at FROM Vehiculos WHERE idVehiculo = ?",
      [insertedId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("createVehicle error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "La matrícula ya existe para este usuario" });
    }
    res.status(500).json({ error: "Error al crear vehículo" });
  }
};

export const updateVehicle = async (req, res) => {
  const userId = req.user.idUsuario;
  const id = req.params.id;
  const { plate, brand, model, year } = req.body;

  try {
    // comprobar propiedad
    const [owner] = await pool.query("SELECT id_Usuario FROM Vehiculos WHERE idVehiculo = ?", [id]);
    if (owner.length === 0) return res.status(404).json({ error: "Vehículo no encontrado" });
    if (owner[0].id_Usuario !== userId) return res.status(403).json({ error: "No autorizado" });

    await pool.query(
      "UPDATE Vehiculos SET Matricula = ?, Marca = ?, Modelo = ?, Anio = ? WHERE idVehiculo = ?",
      [plate.toUpperCase(), brand, model, year || null, id]
    );

    const [rows] = await pool.query(
      "SELECT idVehiculo, Matricula AS plate, Marca AS brand, Modelo AS model, Anio AS year, created_at FROM Vehiculos WHERE idVehiculo = ?",
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("updateVehicle error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "La matrícula ya existe para este usuario" });
    }
    res.status(500).json({ error: "Error al actualizar vehículo" });
  }
};

export const deleteVehicle = async (req, res) => {
  const userId = req.user.idUsuario;
  const id = req.params.id;
  try {
    const [owner] = await pool.query("SELECT id_Usuario FROM Vehiculos WHERE idVehiculo = ?", [id]);
    if (owner.length === 0) return res.status(404).json({ error: "Vehículo no encontrado" });
    if (owner[0].id_Usuario !== userId) return res.status(403).json({ error: "No autorizado" });

    await pool.query("DELETE FROM Vehiculos WHERE idVehiculo = ?", [id]);
    res.json({ message: "Vehículo eliminado" });
  } catch (err) {
    console.error("deleteVehicle error:", err);
    res.status(500).json({ error: "Error al eliminar vehículo" });
  }
};
