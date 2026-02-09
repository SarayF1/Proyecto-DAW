drop database if exists MyParking;
create database MyParking;
use MyParking;


create table Usuarios(
idUsuario int primary  key auto_increment, 
Nombre varchar(20),
Apellido1 varchar(20), 
Apellido2 varchar(20),
Rol Enum("CLIENTE", "ADMIN"),
Email varchar(50), 
Contraseña VARCHAR(255)
);


create table Usuarios_Datos (
id_Usuario int primary key,
Telefono char(9),
Matricula varchar(15),
CHECK (
    Matricula REGEXP '^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9 -]{4,15}$'
),

foreign key (id_Usuario) references Usuarios(idUsuario)
);


create table Dueño (
idDueño int primary  key auto_increment, 
nombre varchar(45)
);



create table Zona (
idZona int primary  key auto_increment, 
nombre varchar(45),
Localidad varchar(45),
Horario_inicio time,
Horario_fin time
);

create table Plaza (
idPlaza int primary  key auto_increment, 
Tarifa tinyint,
Estado_Plaza enum("LIBRE", "EN USO"),
id_Dueño int, 
id_Zona int,

foreign key (id_Dueño) references Dueño(idDueño),
foreign key (id_Zona) references Zona(idZona)
);


create table Reserva (
idReserva  int primary  key auto_increment, 
Estado enum("FINALIZADA", "EN CURSO"),
Fecha_inicio date,
Fecha_fin date,
id_Usuario int, 
id_Plaza int, 

foreign key (id_Plaza) references Plaza(idPlaza), 
foreign key (id_Usuario) references Usuarios(idUsuario)
)
