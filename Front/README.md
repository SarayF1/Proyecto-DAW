# MyParking — Frontend

Aplicación React + Vite para la gestión de aparcamientos en Puerto del Rosario.

## Stack

- **React 18** + React Router v6
- **Vite 5** — dev server + bundler
- **Framer Motion** — animaciones
- **React Leaflet** — mapa interactivo (OpenStreetMap)
- **React Hot Toast** — notificaciones
- **date-fns** — formateo de fechas
- **CSS Modules** — estilos encapsulados

## Requisitos

- Node.js >= 18
- npm >= 9

## Instalación

```bash
cd myparking-frontend
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

## Variables de entorno

El `vite.config.js` incluye un proxy que redirige `/api` al backend:

```
https://myparking-backend.onrender.com
```

Para usar un backend local, edita `vite.config.js`:

```js
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  }
}
```

## Estructura

```
src/
├── api/
│   └── client.js          # Todos los endpoints del backend
├── components/
│   ├── AuthModal.jsx       # Modal login / registro
│   ├── LoadingScreen.jsx
│   └── Navbar.jsx
├── context/
│   └── AuthContext.jsx     # JWT auth state
├── pages/
│   ├── LandingPage.jsx     # Hero, features, zonas, CTA
│   ├── MapPage.jsx         # Mapa Leaflet + reserva
│   ├── MonederoPage.jsx    # Saldo, recargas, movimientos
│   ├── ReservasPage.jsx    # Listado de reservas
│   ├── VehiculosPage.jsx   # CRUD vehículos
│   └── AccountPage.jsx     # Perfil de usuario
├── styles/
│   └── index.css           # Variables CSS globales
└── main.jsx
```

## Backend

Repo: https://github.com/SarayF1/Proyecto-DAW  
API desplegada: https://myparking-backend.onrender.com

### Endpoints utilizados

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Registro |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/me` | ✓ | Perfil usuario |
| PUT | `/api/me` | ✓ | Actualizar perfil |
| GET | `/api/zonas` | — | Zonas + ocupación |
| GET | `/api/plazas` | — | Todas las plazas |
| GET | `/api/reservas/mias` | ✓ | Mis reservas |
| POST | `/api/reservas` | ✓ | Crear reserva |
| GET | `/api/me/monedero` | ✓ | Saldo |
| GET | `/api/me/monedero/movimientos` | ✓ | Movimientos |
| POST | `/api/me/monedero/recarga` | ✓ | Recargar saldo |
| POST | `/api/me/monedero/codigo` | ✓ | Código promo |
| GET | `/api/me/vehiculos` | ✓ | Mis vehículos |
| POST | `/api/me/vehiculos` | ✓ | Añadir vehículo |
| PUT | `/api/me/vehiculos/:id` | ✓ | Editar vehículo |
| DELETE | `/api/me/vehiculos/:id` | ✓ | Eliminar vehículo |

## Build para producción

```bash
npm run build
npm run preview
```

Los estáticos se generan en `dist/`.
