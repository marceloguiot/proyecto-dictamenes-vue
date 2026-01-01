import api from "./api";

export async function crearCaso(payload) {
  const res = await api.post("/api/casos", payload);
  return res.data;
}
