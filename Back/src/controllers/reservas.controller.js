import { pool } from "../config/db.js";

/* =========================================
   LIMPIAR RESERVAS EXPIRADAS
   ========================================= */
const cleanupExpiredReservations = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [reservasVencidas] = await conn.query(
      `
      SELECT idReserva, id_Plaza
      FROM Reserva
      WHERE Estado = 'EN CURSO'
        AND Fecha_fin < NOW()
      FOR UPDATE
      `
    );

    if (reservasVencidas.length === 0) {
      await conn.commit();
      return;
    }

    const reservaIds = reservasVencidas.map(r => r.idReserva);
    const plazaIds = reservasVencidas.map(r => r.id_Plaza);

    await conn.query(
      `UPDATE Reserva SET Estado = 'FINALIZADA' WHERE idReserva IN (?)`,
      [reservaIds]
    );

    await conn.query(
      `UPDATE Plaza SET Estado_Plaza = 'LIBRE' WHERE idPlaza IN (?)`,
      [plazaIds]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error("Error limpiando reservas:", err);
  } finally {
    conn.release();
  }
};


export const getMisReservas = async (req, res) => {
  const idUsuario = req.user.idUsuario;

  try {
    // ACTUALIZAR RESERVAS FINALIZADAS
    await cleanupExpiredReservations();

    const [rows] = await pool.query(
      `
      SELECT
        r.idReserva,
        r.Estado,
        r.Fecha_inicio,
        r.Fecha_fin,
        p.idPlaza,
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
  const { idPlaza, Fecha_inicio, Fecha_fin } = req.body;
  const idUsuario = req.user.idUsuario;

  if (!idPlaza || !Fecha_inicio || !Fecha_fin) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    /* 1️⃣ Obtener zona y tarifa */
    const [[zona]] = await conn.query(
      `
      SELECT z.idZona, z.nombre, z.Tarifa
      FROM Plaza p
      JOIN Zona z ON p.id_Zona = z.idZona
      WHERE p.idPlaza = ?
      FOR UPDATE
      `,
      [idPlaza]
    );

    if (!zona) {
      throw new Error("Zona no encontrada");
    }

    /* 2️⃣ Calcular importe */
    const minutos =
      (new Date(Fecha_fin) - new Date(Fecha_inicio)) / 60000;
    const importe = Number(((minutos / 60) * zona.Tarifa).toFixed(2));

    /* 3️⃣ Obtener monedero */
    const [[monedero]] = await conn.query(
      `
      SELECT idMonedero, saldo
      FROM Monedero
      WHERE id_Usuario = ?
      FOR UPDATE
      `,
      [idUsuario]
    );

    if (!monedero) {
      throw new Error("Monedero no encontrado");
    }

    if (Number(monedero.saldo) < importe) {
      throw new Error("Saldo insuficiente");
    }

    /* 4️⃣ Crear reserva */
    const [reservaResult] = await conn.query(
      `
      INSERT INTO Reserva (Estado, Fecha_inicio, Fecha_fin, id_Usuario, id_Plaza)
      VALUES ('EN CURSO', ?, ?, ?, ?)
      `,
      [Fecha_inicio, Fecha_fin, idUsuario, idPlaza]
    );

    const idReserva = reservaResult.insertId;

    /* 5️⃣ Actualizar plaza */
    await conn.query(
      `
      UPDATE Plaza
      SET Estado_Plaza = 'EN USO'
      WHERE idPlaza = ?
      `,
      [idPlaza]
    );

    /* 6️⃣ Descontar saldo */
    await conn.query(
      `
      UPDATE Monedero
      SET saldo = saldo - ?
      WHERE idMonedero = ?
      `,
      [importe, monedero.idMonedero]
    );

    /* 7️⃣ Insertar movimiento */
    await conn.query(
      `
      INSERT INTO Monedero_Movimientos
        (id_Monedero, tipo, descripcion, cantidad, id_Reserva)
      VALUES
        (?, 'GASTO', ?, ?, ?)
      `,
      [
        monedero.idMonedero,
        `Reserva parking ${zona.nombre}`,
        importe,
        idReserva,
      ]
    );

    await conn.commit();

    res.status(201).json({
      message: "Reserva creada correctamente",
      importe,
    }); console.log(`Reserva ${idReserva} creada por usuario usuario con ID ${idUsuario}. En la plaza ${idPlaza} con importe ${importe}€`);
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(400).json({
      error: error.message || "Error al crear la reserva",
    });
  } finally {
    conn.release();
  }
};
