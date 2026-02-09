import { pool } from "../config/db.js";

export const getMisReservas = async (req, res) => {
  const idUsuario = req.user.idUsuario;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        r.idReserva,
        r.Estado,
        r.Fecha_inicio,
        r.Fecha_fin,
        p.idPlaza,
        p.Tarifa,
        z.nombre AS zona,
        z.Localidad
      FROM Reserva r
      JOIN Plaza p ON r.id_Plaza = p.idPlaza
      JOIN Zona z ON p.id_Zona = z.idZona
      WHERE r.id_Usuario = ?
      ORDER BY r.Fecha_inicio DESC
      `,
      [idUsuario]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las reservas" });
  }
};

export const crearReserva = async (req, res) => {
  // 🔒 VALIDACIÓN PREVIA (CLAVE)
  if (!req.body) {
    return res.status(400).json({ error: "Body vacío o mal enviado" });
  }

  const { idPlaza, Fecha_inicio, Fecha_fin } = req.body;
  const idUsuario = req.user.idUsuario;

  // Validación de campos
  if (!idPlaza || !Fecha_inicio || !Fecha_fin) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    // 1. Comprobar solapamiento
    const [conflictos] = await pool.query(
      `
      SELECT idReserva
      FROM Reserva
      WHERE id_Plaza = ?
        AND Estado = 'EN CURSO'
        AND (
          ? BETWEEN Fecha_inicio AND Fecha_fin
          OR
          ? BETWEEN Fecha_inicio AND Fecha_fin
        )
      `,
      [idPlaza, Fecha_inicio, Fecha_fin]
    );

    if (conflictos.length > 0) {
      return res.status(409).json({ error: "La plaza ya está reservada" });
    }

    // 2. Crear reserva
    await pool.query(
      `
      INSERT INTO Reserva (Estado, Fecha_inicio, Fecha_fin, id_Usuario, id_Plaza)
      VALUES ('EN CURSO', ?, ?, ?, ?)
      `,
      [Fecha_inicio, Fecha_fin, idUsuario, idPlaza]
    );

    // 3. Cambiar estado de la plaza
    await pool.query(
      `
      UPDATE Plaza
      SET Estado_Plaza = 'EN USO'
      WHERE idPlaza = ?
      `,
      [idPlaza]
    );

    res.status(201).json({ message: "Reserva creada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la reserva" });
  }
};
