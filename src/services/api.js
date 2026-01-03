// ==================== EMPIEZAN CAMBIOS ====================
// Se expandió el servicio de API para incluir todos los endpoints del backend
// ==================== EMPIEZAN CAMBIOS ====================
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://xdr.com.mx/apis/sistpec-cfpp",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== EMPIEZAN CAMBIOS ====================
// Servicios de Autenticación
// ==================== EMPIEZAN CAMBIOS ====================
export const authService = {
  login: (credentials) => api.post("/api/auth/login", credentials),
  logout: () => api.post("/api/auth/logout"),
  validate: (token) => api.get("/api/auth/validate", { params: { token } }),
};

// ==================== EMPIEZAN CAMBIOS ====================
// Servicios de Usuarios
// ==================== EMPIEZAN CAMBIOS ====================
export const usuariosService = {
  consultar: (filtros = {}) => api.get("/api/usuarios", { params: filtros }),
  obtenerPorId: (id) => api.get(`/api/usuarios/${id}`),
  crear: (usuario) => api.post("/api/usuarios", usuario),
  actualizar: (id, usuario) => api.put(`/api/usuarios/${id}`, usuario),
  desactivar: (id) => api.patch(`/api/usuarios/${id}/desactivar`),
  reactivar: (id) => api.patch(`/api/usuarios/${id}/reactivar`),
  eliminar: (id) => api.delete(`/api/usuarios/${id}`),
};

// ==================== EMPIEZAN CAMBIOS ====================
// Servicios de Propietarios
// ==================== EMPIEZAN CAMBIOS ====================
export const propietariosService = {
  consultar: (filtros = {}) => api.get("/api/propietarios", { params: filtros }),
  obtenerPorId: (id) => api.get(`/api/propietarios/${id}`),
  obtenerPorCurp: (curp) => api.get("/api/propietarios/por-curp", { params: { curp } }),
  crear: (propietario) => api.post("/api/propietarios", propietario),
  actualizar: (id, propietario) => api.put(`/api/propietarios/${id}`, propietario),
  desactivar: (id) => api.patch(`/api/propietarios/${id}/desactivar`),
  reactivar: (id) => api.patch(`/api/propietarios/${id}/reactivar`),
  eliminar: (id) => api.delete(`/api/propietarios/${id}`),
};

// ==================== EMPIEZAN CAMBIOS ====================
// Servicios de UPP
// ==================== EMPIEZAN CAMBIOS ====================
export const uppService = {
  consultar: (filtros = {}) => api.get("/api/upp", { params: filtros }),
  obtenerPorId: (id) => api.get(`/api/upp/${id}`),
  obtenerPorClave: (clave) => api.get("/api/upp/por-clave", { params: { clave } }),
  crear: (upp) => api.post("/api/upp", upp),
  actualizar: (id, upp) => api.put(`/api/upp/${id}`, upp),
  darBaja: (id) => api.patch(`/api/upp/${id}/dar-baja`),
  reactivar: (id) => api.patch(`/api/upp/${id}/reactivar`),
  eliminar: (id) => api.delete(`/api/upp/${id}`),
};

// ==================== EMPIEZAN CAMBIOS ====================
// Servicios de Casos
// ==================== EMPIEZAN CAMBIOS ====================
export const casosService = {
  consultar: (filtros = {}) => api.get("/api/casos", { params: filtros }),
  crear: (caso) => api.post("/api/casos", caso),
};

// ==================== EMPIEZAN CAMBIOS ====================
// Servicios de Muestras
// ==================== EMPIEZAN CAMBIOS ====================
export const muestrasService = {
  consultar: (filtros = {}) => api.get("/api/muestras", { params: filtros }),
  obtenerPorId: (id) => api.get(`/api/muestras/${id}`),
  crear: (muestra) => api.post("/api/muestras", muestra),
  actualizar: (id, muestra) => api.put(`/api/muestras/${id}`, muestra),
  eliminar: (id) => api.delete(`/api/muestras/${id}`),
};

// ==================== EMPIEZAN CAMBIOS ====================
// Servicios de Resultados
// ==================== EMPIEZAN CAMBIOS ====================
export const resultadosService = {
  consultar: (filtros = {}) => api.get("/api/resultados", { params: filtros }),
  obtenerPorId: (id) => api.get(`/api/resultados/${id}`),
  crear: (resultado) => api.post("/api/resultados", resultado),
  actualizar: (id, resultado) => api.put(`/api/resultados/${id}`, resultado),
  eliminar: (id) => api.delete(`/api/resultados/${id}`),
};

// ==================== TERMINAN CAMBIOS ====================

export default api;
