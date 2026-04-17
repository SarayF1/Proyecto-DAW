// src/api/client.js
// All API calls to the MyParking backend

const BASE = '/api'

function getToken() {
  return localStorage.getItem('mp_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg = data.error || data.message || `Error ${res.status}`
    throw new Error(msg)
  }
  return data
}

// ── Auth ──────────────────────────────────────
export const authApi = {
  login: (Email, Password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ Email, Password }) }),

  register: (payload) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  googleLogin: (credential) =>
    request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
}

// ── Me (profile) ──────────────────────────────
export const meApi = {
  getMe: () => request('/me'),
  updateMe: (payload) =>
    request('/me', { method: 'PUT', body: JSON.stringify(payload) }),
}

// ── Zonas ─────────────────────────────────────
export const zonasApi = {
  getZonas: () => request('/zonas'),
}

// ── Plazas ────────────────────────────────────
export const plazasApi = {
  getPlazas: () => request('/plazas'),
}

// ── Reservas ──────────────────────────────────
export const reservasApi = {
  getMisReservas: () => request('/reservas/mias'),
  crearReserva: (payload) =>
    request('/reservas', { method: 'POST', body: JSON.stringify(payload) }),
}

// ── Monedero ──────────────────────────────────
export const monederoApi = {
  getMonedero: () => request('/me/monedero'),
  getMovimientos: () => request('/me/monedero/movimientos'),
  recargar: (cantidad) =>
    request('/me/monedero/recarga', { method: 'POST', body: JSON.stringify({ cantidad }) }),
  aplicarCodigo: (codigo) =>
    request('/me/monedero/codigo', { method: 'POST', body: JSON.stringify({ codigo }) }),
}

// ── Vehículos ─────────────────────────────────
export const vehiculosApi = {
  getVehiculos: () => request('/me/vehiculos'),
  crear: (payload) =>
    request('/me/vehiculos', { method: 'POST', body: JSON.stringify(payload) }),
  actualizar: (id, payload) =>
    request(`/me/vehiculos/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  eliminar: (id) =>
    request(`/me/vehiculos/${id}`, { method: 'DELETE' }),
}

// ── Admin ─────────────────────────────────────
// Note: only these 4 routes exist on the deployed backend:
//   GET  /admin/estadisticas
//   GET  /admin/reservas-activas
//   GET  /admin/reservas-por-zona
//   PUT  /admin/reservas/:id/finalizar
// The endpoints below fall back to public/me routes where possible.
export const adminApi = {
  getEstadisticas:   () => request('/admin/estadisticas'),
  getReservasActivas:() => request('/admin/reservas-activas'),
  getReservasPorZona:() => request('/admin/reservas-por-zona'),
  finalizarReserva:  (id) => request(`/admin/reservas/${id}/finalizar`, { method: 'PUT' }),

  // ── Usuarios: /admin/usuarios not deployed → graceful 404 handler in AdminPage ──
  getUsuarios: () => request('/admin/usuarios'),
  updateUsuario: (id, payload) =>
    request(`/admin/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteUsuario: (id) =>
    request(`/admin/usuarios/${id}`, { method: 'DELETE' }),

  // ── Plazas: /admin/plazas not deployed → fall back to public /plazas ──
  getPlazasAdmin: () => request('/plazas'),           // public endpoint — works
  updatePlaza: (id, payload) =>
    request(`/admin/plazas/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  // ── All reservas: use reservas-activas as source ──
  getAllReservas: () => request('/admin/reservas-activas'),
  deleteReserva: (id) =>
    request(`/admin/reservas/${id}`, { method: 'DELETE' }),
}
