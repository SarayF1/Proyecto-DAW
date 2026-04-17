-- =====================================================
-- CONSULTA 01 · Listado de plazas con su zona y dueño
-- =====================================================
SELECT
  p.idPlaza,
  p.Estado_Plaza,
  z.nombre AS zona,
  d.nombre AS dueño
FROM Plaza p
JOIN Zona z ON z.idZona = p.id_Zona
JOIN Dueño d ON d.idDueño = z.id_Dueño
ORDER BY z.nombre, p.idPlaza;


-- =====================================================
-- CONSULTA 02 · Ocupación y disponibilidad por zona
-- Incluye porcentaje de ocupación
-- =====================================================
SELECT
  z.idZona,
  z.nombre,
  z.Localidad,
  z.Tarifa,
  z.Horario_inicio,
  z.Horario_fin,
  COUNT(p.idPlaza) AS totalPlazas,
  SUM(p.Estado_Plaza = 'LIBRE') AS plazasLibres,
  SUM(p.Estado_Plaza = 'EN USO') AS plazasEnUso,
  ROUND(
    SUM(p.Estado_Plaza = 'EN USO') / COUNT(p.idPlaza) * 100, 2
  ) AS porcentajeOcupacion
FROM Zona z
LEFT JOIN Plaza p ON p.id_Zona = z.idZona
GROUP BY
  z.idZona,
  z.nombre,
  z.Localidad,
  z.Tarifa,
  z.Horario_inicio,
  z.Horario_fin
ORDER BY porcentajeOcupacion DESC;


-- =====================================================
-- CONSULTA 03 · Listado de usuarios
-- =====================================================
SELECT
  idUsuario,
  Nombre,
  Apellido1,
  Apellido2,
  Email,
  Rol
FROM Usuarios
ORDER BY idUsuario;


-- =====================================================
-- CONSULTA 04 · Listado completo de reservas con usuario y zona
-- =====================================================
SELECT 
    u.idUsuario,
    u.Nombre,
    u.Apellido1,
    u.Apellido2,
    r.idReserva,
    r.Estado,
    r.Fecha_inicio,
    r.Fecha_fin,
    p.idPlaza,
    z.nombre AS Zona,
    z.Localidad
FROM Usuarios u
JOIN Reserva r ON u.idUsuario = r.id_Usuario
JOIN Plaza p   ON r.id_Plaza = p.idPlaza
JOIN Zona z    ON p.id_Zona = z.idZona
ORDER BY u.idUsuario, r.Fecha_inicio;


-- =====================================================
-- CONSULTA 05 · Estado de monederos y movimientos
-- =====================================================
SELECT 
  m.idMonedero,
  u.Nombre,
  u.Apellido1,
  m.saldo,
  m.moneda
FROM Monedero m
JOIN Usuarios u ON u.idUsuario = m.id_Usuario
ORDER BY m.idMonedero;


SELECT 
  mm.idMovimiento,
  mm.tipo,
  mm.descripcion,
  mm.cantidad,
  mm.fecha,
  mm.id_Reserva
FROM Monedero_Movimientos mm
ORDER BY mm.fecha DESC;
