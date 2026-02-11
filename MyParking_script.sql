drop database if exists MyParking;
create database MyParking;
use MyParking;


create table Usuarios(
idUsuario int primary  key auto_increment, 
Nombre varchar(20),
Apellido1 varchar(20), 
Apellido2 varchar(20),
Rol Enum("CLIENTE", "ADMIN"),
Email varchar(50) UNIQUE, 
Contraseña VARCHAR(255)
);

CREATE TABLE Vehiculos (
  idVehiculo INT PRIMARY KEY AUTO_INCREMENT,
  id_Usuario INT NOT NULL,
  Matricula VARCHAR(20) NOT NULL,
  CHECK (
    Matricula REGEXP '^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9 -]{4,15}$'
),
  Marca VARCHAR(50) NOT NULL,
  Modelo VARCHAR(50) NOT NULL,
  Anio SMALLINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vehiculo_usuario FOREIGN KEY (id_Usuario) REFERENCES Usuarios(idUsuario),
  CONSTRAINT uq_vehiculo_usuario_matricula UNIQUE (id_Usuario, Matricula)
);

CREATE TABLE Monedero (
  idMonedero INT PRIMARY KEY AUTO_INCREMENT,
  id_Usuario INT NOT NULL,
  saldo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  moneda ENUM('EUR', 'USD', 'GBP') NOT NULL DEFAULT 'EUR',

  CONSTRAINT fk_monedero_usuario
    FOREIGN KEY (id_Usuario) REFERENCES Usuarios(idUsuario),

  CONSTRAINT uq_monedero_usuario
    UNIQUE (id_Usuario)
);


create table Usuarios_Datos (
id_Usuario int primary key,
Telefono char(9),

foreign key (id_Usuario) references Usuarios(idUsuario)
);


create table Dueño (
idDueño int primary  key auto_increment, 
nombre varchar(45)
);


create table Zona (
  idZona int primary key auto_increment,
  nombre varchar(45) NOT NULL,
  Localidad varchar(45) NOT NULL,
  Tarifa DECIMAL(5,2) NOT NULL,
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  Horario_inicio TIME NOT NULL,
  Horario_fin TIME NOT NULL,
  id_Dueño INT NOT NULL,

  CONSTRAINT fk_zona_dueño
    FOREIGN KEY (id_Dueño) REFERENCES Dueño(idDueño)
);


create table Plaza (
idPlaza int primary  key auto_increment, 
Estado_Plaza enum("LIBRE", "EN USO") NOT NULL DEFAULT 'LIBRE',
id_Zona int NOT NULL,

foreign key (id_Zona) references Zona(idZona)
);


create table Reserva (
idReserva  int primary  key auto_increment, 
Estado enum("FINALIZADA", "EN CURSO") NOT NULL,
Fecha_inicio datetime NOT NULL,
Fecha_fin datetime NOT NULL,
id_Usuario int NOT NULL, 
id_Plaza int NOT NULL, 

foreign key (id_Plaza) references Plaza(idPlaza), 
foreign key (id_Usuario) references Usuarios(idUsuario)
);


CREATE TABLE Monedero_Movimientos (
  idMovimiento INT PRIMARY KEY AUTO_INCREMENT,
  id_Monedero INT NOT NULL,

  tipo ENUM('INGRESO', 'GASTO') NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Relación opcional con reserva (cuando el gasto es un parking)
  id_Reserva INT NULL,

  CONSTRAINT fk_mov_monedero
    FOREIGN KEY (id_Monedero) REFERENCES Monedero(idMonedero),

  CONSTRAINT fk_mov_reserva
    FOREIGN KEY (id_Reserva) REFERENCES Reserva(idReserva)
);

