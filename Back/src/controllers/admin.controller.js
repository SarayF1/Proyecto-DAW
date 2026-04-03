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
        v.Color AS vehiculo_color,
        
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
      LEFT JOIN Vehiculo v ON v.id_Usuario = u.idUsuario AND v.Estado = 'ACTIVO'
      
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
        (SELECT COALESCE(SUM(cantidad), 0) FROM Monedero_Movimientos WHERE tipo = 'GASTO' AND DATE(fecha) = CURDATE()) AS ingresos_hoy
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
