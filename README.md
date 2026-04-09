# MyParking

<div align="center">
    <img src="./Front/src/assets/logo2.png" alt="MyParking Logo" width="220">
</div>

<p align="center">
  <b>Aplicación web moderna para la gestión inteligente de aparcamientos</b>
</p>

<p align="center">
  Reserva · Localiza · Gestiona · Descarga facturas
</p>

---

## Descripción

**MyParking** es una aplicación web moderna e intuitiva diseñada para facilitar la **búsqueda, reserva y gestión de plazas de aparcamiento**.

Permite a los usuarios localizar zonas disponibles mediante un **mapa interactivo**, consultar disponibilidad en tiempo real, gestionar vehículos registrados, guardar la ubicación del coche y realizar pagos mediante un **monedero virtual**.

Además, incorpora funcionalidades avanzadas como **facturación en PDF profesional**, geolocalización y control seguro de usuarios.

---

## Características Principales

- **Autenticación segura**
  - Registro e inicio de sesión mediante JWT
  - Protección de rutas privadas
  - Gestión segura de sesiones

- **Mapa interactivo**
  - Integración con `react-leaflet`
  - Visualización de zonas de parking
  - Información en tiempo real de tarifas y plazas libres

- **Reserva de plazas**
  - Consulta de parkings disponibles
  - Reserva directa desde mapa
  - Redirección automática por zona seleccionada

- **Gestión de vehículos**
  - Alta, edición y eliminación
  - Validación avanzada de matrícula
  - Selección inteligente por marca y modelo
  - Prevención de duplicados

- **Geolocalización**
  - Guardado de ubicación del vehículo
  - Uso de API del navegador

- **Monedero virtual**
  - Recargas
  - control de gastos
  - historial de movimientos

- **Facturación profesional**
  - Generación PDF
  - logo corporativo
  - QR de validación
  - firma digital
  - datos reales de reserva
  - IVA y total

- **Diseño responsive**
  - Optimizado para móvil y escritorio
  - Material UI
  - experiencia fluida

---

## Tecnologías Utilizadas

### Frontend
- React
- React Router
- Material UI (MUI)
- React Leaflet
- jsPDF
- QRCode

### Backend
- Node.js
- Express
- JWT
- bcrypt

### Base de datos
- MySQL / SQL

### Despliegue
- Render
- Railway / MySQL

---

## Estructura del Proyecto

```bash
MyParking/
│
├── Front/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── assets/
│
├── Back/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── config/
│   └── app.js