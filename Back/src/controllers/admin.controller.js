// src/controllers/admin.controller.js
import { pool } from "../config/db.js";

/**
 * Obtener todas las reservas activas con detalles
 * Incluye información de usuario, vehículo, zona y estado
 */
export const getReservasActivas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        r.idReserva,
        r.Estado,
        r.Fecha_inicio,
        r.Fecha_fin,
        
        -- Información de la plaza y zona
        p.idPlaza,
        z.idZona,
        z.nombre AS zona_nombre,
        z.Localidad AS zona_localidad,
        z.Tarifa AS zona_tarifa,
        
        -- Información del usuario
        u.idUsuario,
        u.Nombre AS usuario_nombre,
        u.Apellido1 AS usuario_apellido1,
        u.Apellido2 AS usuario_apellido2,
        u.Email AS usuario_email,
        
        -- Información del vehículo (si existe)
        v.idVehiculo,
        v.Matricula AS vehiculo_matricula,
        v.Marca AS vehiculo_marca,
        v.Modelo AS vehiculo_modelo,
        
        -- Estado de pago (si está vencida)
        CASE
          WHEN r.Fecha_fin < NOW() THEN 'CADUCADA'
          ELSE 'ACTIVA'
        END AS estado_pago,
        
        -- Minutos restantes o de retraso
        TIMESTAMPDIFF(MINUTE, NOW(), r.Fecha_fin) AS minutos_restantes
        
      FROM Reserva r
      JOIN Plaza p ON r.id_Plaza = p.idPlaza
      JOIN Zona z ON p.id_Zona = z.idZona
      JOIN Usuarios u ON r.id_Usuario = u.idUsuario
      LEFT JOIN Vehiculos v ON v.id_Usuario = u.idUsuario
      
      WHERE r.Estado = 'EN CURSO'
      ORDER BY z.nombre, r.Fecha_fin ASC
      `
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener reservas activas:", error);
    res.status(500).json({ error: "Error al obtener reservas activas" });
  }
};

/**
 * Obtener estadísticas generales del sistema
 */
export const getEstadisticas = async (req, res) => {
  try {
    const [stats] = await pool.query(
      `
      SELECT
        (SELECT COUNT(*) FROM Reserva WHERE Estado = 'EN CURSO') AS reservas_activas,
        (SELECT COUNT(*) FROM Reserva WHERE Estado = 'EN CURSO' AND Fecha_fin < NOW()) AS reservas_caducadas,
        (SELECT COUNT(*) FROM Plaza WHERE Estado_Plaza = 'LIBRE') AS plazas_libres,
        (SELECT COUNT(*) FROM Plaza WHERE Estado_Plaza = 'EN USO') AS plazas_ocupadas,
        (SELECT COUNT(*) FROM Usuarios WHERE Rol = 'CLIENTE') AS total_clientes,
        (SELECT COUNT(DISTINCT id_Zona) FROM Plaza) AS total_zonas,
        (
          SELECT COALESCE(SUM(CASE WHEN tipo = 'GASTO' THEN cantidad ELSE -cantidad END), 0)
          FROM Monedero_Movimientos
          WHERE DATE(fecha) = CURDATE() AND id_Reserva IS NOT NULL
        ) AS ingresos_hoy
      `
    );

    res.json(stats[0]);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};

/**
 * Obtener reservas agrupadas por zona
 */
export const getReservasPorZona = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        z.idZona,
        z.nombre AS zona_nombre,
        z.Localidad,
        z.Tarifa,
        COUNT(r.idReserva) AS total_reservas,
        SUM(CASE WHEN r.Fecha_fin >= NOW() THEN 1 ELSE 0 END) AS reservas_activas,
        SUM(CASE WHEN r.Fecha_fin < NOW() THEN 1 ELSE 0 END) AS reservas_caducadas,
        COUNT(DISTINCT r.id_Usuario) AS usuarios_unicos
      FROM Zona z
      LEFT JOIN Plaza p ON p.id_Zona = z.idZona
      LEFT JOIN Reserva r ON r.id_Plaza = p.idPlaza AND r.Estado = 'EN CURSO'
      GROUP BY z.idZona
      ORDER BY total_reservas DESC
      `
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener reservas por zona:", error);
    res.status(500).json({ error: "Error al obtener reservas por zona" });
  }
};

/**
 * Finalizar manualmente una reserva (útil para gestión de incidencias)
 */
export const finalizarReserva = async (req, res) => {
  const { idReserva } = req.params;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Obtener la reserva y la plaza
    const [[reserva]] = await conn.query(
      `SELECT r.*, p.idPlaza 
       FROM Reserva r 
       JOIN Plaza p ON r.id_Plaza = p.idPlaza 
       WHERE r.idReserva = ? 
       FOR UPDATE`,
      [idReserva]
    );

    if (!reserva) {
      throw new Error("Reserva no encontrada");
    }

    if (reserva.Estado !== "EN CURSO") {
      throw new Error("La reserva ya está finalizada");
    }

    // Finalizar reserva
    await conn.query(
      `UPDATE Reserva SET Estado = 'FINALIZADA' WHERE idReserva = ?`,
      [idReserva]
    );

    // Liberar plaza
    await conn.query(
      `UPDATE Plaza SET Estado_Plaza = 'LIBRE' WHERE idPlaza = ?`,
      [reserva.idPlaza]
    );

    await conn.commit();

    res.json({ message: "Reserva finalizada correctamente" });
  } catch (error) {
    await conn.rollback();
    console.error("Error al finalizar reserva:", error);
    res.status(400).json({ error: error.message || "Error al finalizar reserva" });
  } finally {
    conn.release();
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   BLOCK A · Gestión completa de usuarios / plazas / reservas
   Endpoints que el frontend ya usa pero no estaban implementados.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Listar todos los usuarios (sin la contraseña)
 */
export const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT idUsuario, Nombre, Apellido1, Apellido2, Email, Rol
       FROM Usuarios
       ORDER BY idUsuario`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

/**
 * Actualizar datos de un usuario
 */
export const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { Nombre, Apellido1, Apellido2, Email, Rol } = req.body;

  if (!Nombre || !Apellido1 || !Email || !Rol) {
    return res.status(400).json({ error: "Datos incompletos" });
  }
  if (!["CLIENTE", "ADMIN"].includes(Rol)) {
    return res.status(400).json({ error: "Rol inválido" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE Usuarios
       SET Nombre = ?, Apellido1 = ?, Apellido2 = ?, Email = ?, Rol = ?
       WHERE idUsuario = ?`,
      [Nombre, Apellido1, Apellido2 || null, Email, Rol, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ message: "Usuario actualizado" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

/**
 * Eliminar un usuario — solo si no es ADMIN
 */
export const deleteUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const [[user]] = await pool.query(
      `SELECT Rol FROM Usuarios WHERE idUsuario = ?`,
      [id]
    );
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    if (user.Rol === "ADMIN") {
      return res.status(403).json({ error: "No se puede eliminar un administrador" });
    }

    await pool.query(`DELETE FROM Usuarios WHERE idUsuario = ?`, [id]);
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    // Probable FK violation (reservas, monedero, vehiculos)
    res.status(400).json({
      error: "No se pudo eliminar: el usuario tiene datos asociados (reservas, monedero, vehículos).",
    });
  }
};

/**
 * Listar todas las plazas con su zona
 */
export const getPlazasAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.idPlaza, p.Estado_Plaza,
              z.idZona, z.nombre AS zona, z.Localidad, z.Tarifa
       FROM Plaza p
       JOIN Zona z ON p.id_Zona = z.idZona
       ORDER BY p.idPlaza`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener plazas:", error);
    res.status(500).json({ error: "Error al obtener plazas" });
  }
};

/**
 * Cambiar el estado de una plaza (LIBRE / EN USO)
 */
export const updatePlazaAdmin = async (req, res) => {
  const { id } = req.params;
  const { Estado_Plaza } = req.body;

  if (!["LIBRE", "EN USO"].includes(Estado_Plaza)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE Plaza SET Estado_Plaza = ? WHERE idPlaza = ?`,
      [Estado_Plaza, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Plaza no encontrada" });
    }
    res.json({ message: "Plaza actualizada" });
  } catch (error) {
    console.error("Error al actualizar plaza:", error);
    res.status(500).json({ error: "Error al actualizar plaza" });
  }
};

/**
 * Listar TODAS las reservas (EN CURSO y FINALIZADA).
 * Incluye totales pagados / reembolsados por reserva para la UI de reembolso.
 */
export const getAllReservas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         r.idReserva, r.Estado, r.Fecha_inicio, r.Fecha_fin,
         u.idUsuario, u.Nombre AS usuario_nombre, u.Apellido1 AS usuario_apellido1,
         u.Email AS usuario_email,
         p.idPlaza,
         z.nombre AS zona_nombre, z.Localidad AS zona_localidad, z.Tarifa AS zona_tarifa,
         COALESCE(pag.pagado, 0)       AS pagado,
         COALESCE(rmb.reembolsado, 0)  AS reembolsado
       FROM Reserva r
       JOIN Usuarios u ON r.id_Usuario = u.idUsuario
       JOIN Plaza    p ON r.id_Plaza   = p.idPlaza
       JOIN Zona     z ON p.id_Zona    = z.idZona
       LEFT JOIN (
         SELECT id_Reserva, SUM(cantidad) AS pagado
         FROM Monedero_Movimientos
         WHERE tipo = 'GASTO' AND id_Reserva IS NOT NULL
         GROUP BY id_Reserva
       ) pag ON pag.id_Reserva = r.idReserva
       LEFT JOIN (
         SELECT id_Reserva, SUM(cantidad) AS reembolsado
         FROM Monedero_Movimientos
         WHERE tipo = 'INGRESO' AND id_Reserva IS NOT NULL
         GROUP BY id_Reserva
       ) rmb ON rmb.id_Reserva = r.idReserva
       ORDER BY r.Fecha_inicio DESC
       LIMIT 200`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener todas las reservas:", error);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
};

/**
 * Eliminar una reserva (y libera la plaza si estaba EN USO).
 */
export const deleteReserva = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [[reserva]] = await conn.query(
      `SELECT idReserva, id_Plaza, Estado FROM Reserva WHERE idReserva = ? FOR UPDATE`,
      [id]
    );
    if (!reserva) throw new Error("Reserva no encontrada");

    // Desvincular movimientos de monedero que apuntaban a esta reserva
    await conn.query(
      `UPDATE Monedero_Movimientos SET id_Reserva = NULL WHERE id_Reserva = ?`,
      [id]
    );

    await conn.query(`DELETE FROM Reserva WHERE idReserva = ?`, [id]);

    // Si la plaza estaba ocupada por esta reserva activa, liberarla
    if (reserva.Estado === "EN CURSO") {
      await conn.query(
        `UPDATE Plaza SET Estado_Plaza = 'LIBRE' WHERE idPlaza = ?`,
        [reserva.id_Plaza]
      );
    }

    await conn.commit();
    res.json({ message: "Reserva eliminada" });
  } catch (error) {
    await conn.rollback();
    console.error("Error al eliminar reserva:", error);
    res.status(400).json({ error: error.message || "Error al eliminar reserva" });
  } finally {
    conn.release();
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   BLOCK B · Reembolsos
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Reembolsar (parcial o totalmente) una reserva.
 * Genera un movimiento INGRESO en el monedero del usuario.
 * - Cantidad manual (la decide el admin).
 * - Motivo obligatorio.
 * - No permite reembolsar más de lo realmente pagado por esa reserva.
 */
export const reembolsarReserva = async (req, res) => {
  const { idReserva } = req.params;
  const { cantidad, motivo } = req.body;

  const amount = Number(cantidad);
  if (!amount || amount <= 0 || Number.isNaN(amount)) {
    return res.status(400).json({ error: "Cantidad inválida" });
  }
  const motivoTrim = (motivo || "").trim();
  if (!motivoTrim) {
    return res.status(400).json({ error: "El motivo es obligatorio" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Cargar reserva + monedero del usuario
    const [[reserva]] = await conn.query(
      `SELECT r.idReserva, r.id_Usuario, m.idMonedero
       FROM Reserva r
       JOIN Monedero m ON m.id_Usuario = r.id_Usuario
       WHERE r.idReserva = ?
       FOR UPDATE`,
      [idReserva]
    );
    if (!reserva) throw new Error("Reserva no encontrada");

    // Cuánto se pagó realmente por esta reserva
    const [[pag]] = await conn.query(
      `SELECT COALESCE(SUM(cantidad), 0) AS pagado
       FROM Monedero_Movimientos
       WHERE id_Reserva = ? AND tipo = 'GASTO'`,
      [idReserva]
    );
    const [[rmb]] = await conn.query(
      `SELECT COALESCE(SUM(cantidad), 0) AS reembolsado
       FROM Monedero_Movimientos
       WHERE id_Reserva = ? AND tipo = 'INGRESO'`,
      [idReserva]
    );
    const maxReembolsable = Number(pag.pagado) - Number(rmb.reembolsado);

    if (maxReembolsable <= 0) {
      throw new Error("Esta reserva ya ha sido reembolsada en su totalidad");
    }
    if (amount > maxReembolsable + 0.005) {
      throw new Error(
        `Máximo reembolsable: ${maxReembolsable.toFixed(2)} € ` +
        `(pagado ${Number(pag.pagado).toFixed(2)} €, ya reembolsado ${Number(rmb.reembolsado).toFixed(2)} €)`
      );
    }

    // Registrar INGRESO y actualizar saldo
    await conn.query(
      `INSERT INTO Monedero_Movimientos (id_Monedero, tipo, descripcion, cantidad, id_Reserva)
       VALUES (?, 'INGRESO', ?, ?, ?)`,
      [reserva.idMonedero, `Reembolso admin: ${motivoTrim}`, amount, idReserva]
    );
    await conn.query(
      `UPDATE Monedero SET saldo = saldo + ? WHERE idMonedero = ?`,
      [amount, reserva.idMonedero]
    );

    await conn.commit();
    res.json({ message: "Reembolso realizado", cantidad: amount });
  } catch (error) {
    await conn.rollback();
    console.error("Error al reembolsar:", error);
    res.status(400).json({ error: error.message || "Error al reembolsar" });
  } finally {
    conn.release();
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   BLOCK C · Gráficas del dashboard
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Ingresos netos (GASTO − INGRESO de reservas) diarios, últimos 7 días.
 * Solo cuenta movimientos ligados a una reserva (id_Reserva IS NOT NULL),
 * así ignoramos recargas de monedero (que no son "ingresos" del parking).
 */
export const getIngresosDiarios = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         DATE(fecha) AS fecha,
         COALESCE(SUM(CASE WHEN tipo = 'GASTO' THEN cantidad ELSE -cantidad END), 0) AS total
       FROM Monedero_Movimientos
       WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
         AND id_Reserva IS NOT NULL
       GROUP BY DATE(fecha)
       ORDER BY fecha ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener ingresos diarios:", error);
    res.status(500).json({ error: "Error al obtener ingresos diarios" });
  }
};
