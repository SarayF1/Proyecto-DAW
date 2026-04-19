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
export const adminApi = {
  // Dashboard
  getEstadisticas:    () => request('/admin/estadisticas'),
  getReservasActivas: () => request('/admin/reservas-activas'),
  getReservasPorZona: () => request('/admin/reservas-por-zona'),
  getIngresosDiarios: () => request('/admin/ingresos-diarios'),

  // Reservas
  getAllReservas:    () => request('/admin/reservas'),
  finalizarReserva:  (id) => request(`/admin/reservas/${id}/finalizar`, { method: 'PUT' }),
  deleteReserva:     (id) => request(`/admin/reservas/${id}`, { method: 'DELETE' }),
  reembolsarReserva: (id, payload) =>
    request(`/admin/reservas/${id}/reembolsar`, { method: 'POST', body: JSON.stringify(payload) }),

  // Usuarios
  getUsuarios:   () => request('/admin/usuarios'),
  updateUsuario: (id, payload) =>
    request(`/admin/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteUsuario: (id) =>
    request(`/admin/usuarios/${id}`, { method: 'DELETE' }),

  // Plazas
  getPlazasAdmin: () => request('/admin/plazas'),
  updatePlaza:    (id, payload) =>
    request(`/admin/plazas/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
}
