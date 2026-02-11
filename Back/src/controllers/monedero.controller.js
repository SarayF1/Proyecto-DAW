import { pool } from "../config/db.js";

/**
 * Obtener monedero del usuario autenticado
 * GET /api/me/monedero
 */
export const getMonedero = async (req, res) => {
  const { idUsuario } = req.user;

  try {
    const [rows] = await pool.query(
      `SELECT idMonedero, saldo, moneda
       FROM Monedero
       WHERE id_Usuario = ?`,
      [idUsuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Monedero no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("getMonedero:", error);
    res.status(500).json({ error: "Error al obtener el monedero" });
  }
};

/**
 * Obtener movimientos del monedero
 * GET /api/me/monedero/movimientos
 */
export const getMovimientos = async (req, res) => {
  const { idUsuario } = req.user;

  try {
    const [rows] = await pool.query(
      `SELECT m.idMovimiento,
              m.tipo,
              m.descripcion,
              m.cantidad,
              m.fecha,
              m.id_Reserva
       FROM Monedero_Movimientos m
       JOIN Monedero mo ON mo.idMonedero = m.id_Monedero
       WHERE mo.id_Usuario = ?
       ORDER BY m.fecha DESC`,
      [idUsuario]
    );

    res.json(rows);
  } catch (error) {
    console.error("getMovimientos:", error);
    res.status(500).json({ error: "Error al obtener movimientos" });
  }
};

/**
 * Recarga manual de saldo
 * POST /api/me/monedero/recarga
 * body: { cantidad }
 */
export const recargarSaldo = async (req, res) => {
  const { idUsuario } = req.user;
  const { cantidad } = req.body;

  if (!cantidad || cantidad <= 0) {
    return res.status(400).json({ error: "Cantidad inválida" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[monedero]] = await conn.query(
      `SELECT idMonedero, saldo
       FROM Monedero
       WHERE id_Usuario = ? FOR UPDATE`,
      [idUsuario]
    );

    if (!monedero) {
      await conn.rollback();
      return res.status(404).json({ error: "Monedero no encontrado" });
    }

    const nuevoSaldo = Number(monedero.saldo) + Number(cantidad);

    await conn.query(
      `UPDATE Monedero SET saldo = ? WHERE idMonedero = ?`,
      [nuevoSaldo, monedero.idMonedero]
    );

    await conn.query(
      `INSERT INTO Monedero_Movimientos
       (id_Monedero, tipo, descripcion, cantidad)
       VALUES (?, 'INGRESO', 'Recarga manual', ?)`,
      [monedero.idMonedero, cantidad]
    );

    await conn.commit();

    res.json({ saldo: nuevoSaldo });
  } catch (error) {
    await conn.rollback();
    console.error("recargarSaldo:", error);
    res.status(500).json({ error: "Error al recargar saldo" });
  } finally {
    conn.release();
  }
};

/**
 * Aplicar código promocional
 * POST /api/me/monedero/codigo
 * body: { codigo }
 */
export const aplicarCodigoPromo = async (req, res) => {
  const { idUsuario } = req.user;
  const { codigo } = req.body;

  const CODIGOS = {
    PRUEBA10: 10,
    BONUS5: 5,
    REGALO20: 20,
  };

  const cantidad = CODIGOS[codigo];

  if (!cantidad) {
    return res.status(400).json({ error: "Código promocional inválido" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[monedero]] = await conn.query(
      `SELECT idMonedero, saldo
       FROM Monedero
       WHERE id_Usuario = ? FOR UPDATE`,
      [idUsuario]
    );

    if (!monedero) {
      await conn.rollback();
      return res.status(404).json({ error: "Monedero no encontrado" });
    }

    const nuevoSaldo = Number(monedero.saldo) + cantidad;

    await conn.query(
      `UPDATE Monedero SET saldo = ? WHERE idMonedero = ?`,
      [nuevoSaldo, monedero.idMonedero]
    );

    await conn.query(
      `INSERT INTO Monedero_Movimientos
       (id_Monedero, tipo, descripcion, cantidad)
       VALUES (?, 'INGRESO', ?, ?)`,
      [
        monedero.idMonedero,
        `Código promocional ${codigo}`,
        cantidad,
      ]
    );

    await conn.commit();

    res.json({ saldo: nuevoSaldo });
  } catch (error) {
    await conn.rollback();
    console.error("aplicarCodigoPromo:", error);
    res.status(500).json({ error: "Error al aplicar código" });
  } finally {
    conn.release();
  }
};

/**
 * Pagar una reserva desde el monedero
 * POST /api/me/monedero/pagar-reserva
 * body: { idReserva, importe }
 */
export const pagarReserva = async (req, res) => {
  const { idUsuario } = req.user;
  const { idReserva, importe } = req.body;

  if (!idReserva || !importe || importe <= 0) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[monedero]] = await conn.query(
      `SELECT idMonedero, saldo
       FROM Monedero
       WHERE id_Usuario = ? FOR UPDATE`,
      [idUsuario]
    );

    if (!monedero || Number(monedero.saldo) < Number(importe)) {
      await conn.rollback();
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    const nuevoSaldo = Number(monedero.saldo) - Number(importe);

    await conn.query(
      `UPDATE Monedero SET saldo = ? WHERE idMonedero = ?`,
      [nuevoSaldo, monedero.idMonedero]
    );

    await conn.query(
      `INSERT INTO Monedero_Movimientos
       (id_Monedero, tipo, descripcion, cantidad, id_Reserva)
       VALUES (?, 'GASTO', 'Pago de parking', ?, ?)`,
      [monedero.idMonedero, importe, idReserva]
    );

    await conn.commit();

    res.json({ saldo: nuevoSaldo });
  } catch (error) {
    await conn.rollback();
    console.error("pagarReserva:", error);
    res.status(500).json({ error: "Error al pagar la reserva" });
  } finally {
    conn.release();
  }
};
