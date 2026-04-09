# 📍 MyParking

![MyParking Logo](./Front/src/assets/logo2.jpg) **MyParking** es una aplicación web intuitiva y moderna diseñada para facilitar la búsqueda, reserva y gestión de plazas de aparcamiento. A través de un mapa interactivo, los usuarios pueden localizar zonas de parking disponibles, revisar tarifas en tiempo real, guardar la ubicación de su vehículo y gestionar pagos mediante un monedero virtual.

---

## ✨ Características Principales

* **Autenticación Segura:** Sistema de registro e inicio de sesión con JWT.
* **Mapa Interactivo:** Visualización de parkings y zonas de estacionamiento regulado utilizando `react-leaflet`.
* **Disponibilidad en Tiempo Real:** Consulta de plazas libres, horarios y tarifas actualizadas.
* **Geolocalización:** Funcionalidad para que el usuario guarde la ubicación exacta de su coche.
* **Gestión de Parquímetro y Recargas:** Interfaz para reservar plazas y manejar el saldo del usuario (Wallet).
* **Diseño Responsivo:** Interfaz adaptada tanto para dispositivos móviles como para ordenadores, utilizando Material-UI (MUI).

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React, React Router, Material-UI (MUI), Leaflet.
* **Backend:** Node.js, Express (API REST).
* **Base de Datos:** SQL (Configurable vía entorno).
* **Autenticación:** JSON Web Tokens (JWT).

---

## ⚙️ Variables de Entorno (.env)

Para que el proyecto funcione correctamente, es necesario configurar las variables de entorno en tu servidor (carpeta backend). 

Crea un archivo `.env` en el directorio raíz del backend y añade las siguientes variables con tus credenciales:

```env
PORT=
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=
JWT_SECRET=