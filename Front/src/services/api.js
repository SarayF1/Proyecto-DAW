//Nuestro backend se encuentra desplegado en Render, por lo que la URL base es la siguiente:
const API_URL = "https://myparking-backend.onrender.com";

async function handleResponse(res) {
  // intenta parsear JSON; si no se puede, lanza mensaje genérico
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Error de respuesta del servidor: ${res.status}`);
  }

  if (!res.ok) {
    const message = data?.error || data?.message || `Error ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// REGISTER
export const register = async (payload) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload), // { Nombre, Apellido1, Apellido2, Email, Password }
  });

  return handleResponse(res);
};

// LOGIN (ya existía; se deja con manejo consistente de errores)
export const loginRequest = async (email, password) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Email: email,
      Password: password,
    }),
  });

  return handleResponse(response); // { token }
};

// RESERVAS DEL USUARIO
export const getMisReservas = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/api/reservas/mias`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

// ZONAS (MARCADORES DE PARKINGS EN EL MAPA)
export const getZonas = async () => {
  const response = await fetch(`${API_URL}/api/zonas`);
  return handleResponse(response);
};

// PLAZAS (detalles / reserva)
export const getPlazas = async () => {
  const response = await fetch(`${API_URL}/api/plazas`);
  return handleResponse(response);
};

// Export por defecto (compatibilidad)
export default {
  register,
  loginRequest,
  getMisReservas,
  getZonas,
  getPlazas,
};


// VEHÍCULOS (CRUD)
// OBTENER
export const getVehiculos = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/me/vehiculos`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return handleResponse(res);
};

// CREAR
export const createVehiculo = async (payload) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/me/vehiculos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// UPDATE
export const updateVehiculo = async (id, payload) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/me/vehiculos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

//DELETE
export const deleteVehiculo = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/me/vehiculos/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};
