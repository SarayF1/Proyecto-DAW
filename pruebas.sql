SELECT 
  idUsuario,
  Nombre,
  Apellido1,
  Apellido2,
  Email,
  Rol,
  Contraseña
FROM Usuarios;

SELECT * FROM Zona;

SELECT * FROM Plaza;

SELECT * FROM Reserva;

SELECT idPlaza, Estado_Plaza FROM Plaza;

SELECT idPlaza FROM Plaza;

SELECT 
  p.idPlaza,
  p.Estado_Plaza
FROM Plaza p;

SELECT * FROM Dueño;
SELECT * FROM Zona;

INSERT INTO Plaza (Tarifa, Estado_Plaza, id_Dueño, id_Zona)
VALUES (2, 'LIBRE', 1, 2);


