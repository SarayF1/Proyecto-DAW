-- =====================================================
-- INSERT 01 · Alta de dueños de las zonas de aparcamiento
-- =====================================================
INSERT INTO Dueño (nombre)
VALUES
('Ayuntamiento de Puerto del Rosario'),
('Centro comercial'),
('Centro salud');


-- =====================================================
-- INSERT 02 · Alta de zonas de aparcamiento
-- =====================================================
INSERT INTO Zona (nombre, Localidad, Tarifa, lat, lng, Horario_inicio, Horario_fin, id_Dueño)
VALUES
('Parking Ayuntamiento', 'Puerto del Rosario', 1.22, 28.4986, -13.8599, '07:30', '19:30', 1),
('Parking Centro Comercial', 'Puerto del Rosario', 1.70, 28.4960, -13.8636, '09:00', '22:00', 2),
('Parking Centro salud', 'Puerto del Rosario', 1.50, 28.5023, -13.8590, '08:00', '20:00', 3);


-- =====================================================
-- INSERT 03 · Alta de plazas por zona
-- (id_Dueño eliminado porque ya no existe en la tabla Plaza)
-- =====================================================
INSERT INTO Plaza (Estado_Plaza, id_Zona)
VALUES
('LIBRE', 1),
('LIBRE', 1),
('LIBRE', 2),
('LIBRE', 2),
('LIBRE', 3),
('LIBRE', 3),
('LIBRE', 3);
