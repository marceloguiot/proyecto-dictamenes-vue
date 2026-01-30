<template>
  <section>
    <section class="modulo-acciones">
      <span class="modulo-acciones-titulo">Acciones disponibles</span>

      <div class="modulo-acciones-botones">
        <button
          v-for="a in acciones"
          :key="a.id"
          type="button"
          class="sistpec-btn-accion"
          :class="{ active: selectedAction === a.id }"
          @click="cambiarAccion(a.id)"
        >
          {{ a.label }}
        </button>
      </div>

      <div class="sistpec-info-box">
        <p class="sistpec-info-text">{{ descripcionAccion }}</p>
      </div>
    </section>

    <section class="modulo-contenido">
      <!-- ASIGNAR -->
      <div v-if="selectedAction === 'asignar'">
        <h3 class="subtitulo">Asignar</h3>

        <div v-if="msgError" class="modulo-alert modulo-alert--error">
          {{ msgError }}
        </div>

        <div v-if="msgOk" class="modulo-alert modulo-alert--success">
          {{ msgOk }}
        </div>

        <div class="sistpec-search-bar">
          <div class="sistpec-form-group">
            <label>Folio hoja control</label>
            <input v-model="form.folio_hoja_control" type="text" placeholder="Ej. HCC-2025-001" />
          </div>

          <!-- UPP: buscador + lista (sin Vuetify) -->
          <div class="sistpec-form-group">
            <label>UPP (buscar por clave o nombre)</label>
            <input
              v-model="uppSearch"
              type="text"
              placeholder="Escribe para buscar..."
              @input="onUppSearch"
            />

            <div v-if="uppOptions.length" class="sistpec-autocomplete">
              <button
                v-for="u in uppOptions"
                :key="u.id_upp"
                type="button"
                class="sistpec-autocomplete-item"
                @click="selectUpp(u)"
              >
                <strong>{{ u.clave_upp }}</strong> — {{ u.nombre_upp }}
              </button>
            </div>

            <div v-if="form.id_upp" class="sistpec-chip">
              Seleccionado: <strong>{{ form.clave_upp }}</strong> — {{ form.nombre_upp }}
              <button type="button" class="sistpec-chip-x" @click="clearUpp">×</button>
            </div>
          </div>

          <div class="sistpec-form-group">
            <label>MVZ</label>
            <input v-model="form.mvz" type="text" placeholder="Nombre del MVZ" />
          </div>

          <div class="sistpec-form-group sistpec-search-actions right">
            <button
              class="sistpec-btn-primary"
              type="button"
              :disabled="loadingAsignar"
              @click="asignar"
            >
              {{ loadingAsignar ? "ASIGNANDO..." : "ASIGNAR" }}
            </button>

            <button
              class="sistpec-btn-secondary"
              type="button"
              :disabled="loadingAsignar"
              @click="limpiarForm"
            >
              LIMPIAR
            </button>
          </div>

          <div class="sistpec-form-group sistpec-full">
            <label>Número de caso generado</label>
            <input
              v-model="numeroCasoGenerado"
              type="text"
              placeholder="Se mostrará al asignar"
              readonly
            />
          </div>
        </div>
      </div>

      <!-- CONSULTAR -->
      <div v-else>
        <h3 class="subtitulo">Consultar</h3>

        <div v-if="mostrarAlerta" class="modulo-alert modulo-alert--error">
          Debe capturar <strong>al menos un criterio de búsqueda</strong>.
        </div>

        <div v-if="errorBuscar" class="modulo-alert modulo-alert--error">
          {{ errorBuscar }}
        </div>

        <div class="sistpec-search-bar">
          <div class="sistpec-form-group">
            <label>Número de caso</label>
            <input v-model="filtros.numero_caso" type="text" placeholder="Ej. BR25-001" />
          </div>

          <div class="sistpec-form-group">
            <label>Hoja control campo</label>
            <input v-model="filtros.folio_hoja_control" type="text" placeholder="Ej. HCC-2025-001" />
          </div>

          <!-- UPP filtro -->
          <div class="sistpec-form-group">
            <label>UPP (opcional)</label>
            <input
              v-model="uppSearch2"
              type="text"
              placeholder="Buscar UPP..."
              @input="onUppSearch2"
            />

            <div v-if="uppOptions2.length" class="sistpec-autocomplete">
              <button
                v-for="u in uppOptions2"
                :key="u.id_upp"
                type="button"
                class="sistpec-autocomplete-item"
                @click="selectUpp2(u)"
              >
                <strong>{{ u.clave_upp }}</strong> — {{ u.nombre_upp }}
              </button>
            </div>

            <div v-if="filtros.id_upp" class="sistpec-chip">
              Filtro UPP: <strong>{{ filtros.clave_upp }}</strong> — {{ filtros.nombre_upp }}
              <button type="button" class="sistpec-chip-x" @click="clearUpp2">×</button>
            </div>
          </div>

          <div class="sistpec-form-group sistpec-search-actions right">
            <button class="sistpec-btn-primary" type="button" :disabled="loadingBuscar" @click="buscar">
              {{ loadingBuscar ? "BUSCANDO..." : "BUSCAR" }}
            </button>
            <button class="sistpec-btn-secondary" type="button" :disabled="loadingBuscar" @click="limpiar">
              LIMPIAR
            </button>
          </div>
        </div>

        <!-- Botones de descarga -->
        <div v-if="resultados.length > 0" class="sistpec-export-actions">
          <button type="button" class="sistpec-btn-export sistpec-btn-excel" @click="descargarExcel">
            DESCARGAR EXCEL
          </button>
          <button type="button" class="sistpec-btn-export sistpec-btn-pdf" @click="descargarPDF">
            DESCARGAR PDF
          </button>
        </div>

        <div v-if="buscado" class="sistpec-table-wrapper">
          <table class="sistpec-table">
            <thead>
              <tr>
                <th>No. Caso</th>
                <th>Hoja control</th>
                <th>UPP</th>
                <th>MVZ</th>
                <th>Fecha asignación</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="r in resultados" :key="r.id_caso">
                <td>{{ r.numero_caso }}</td>
                <td>{{ r.folio_hoja_control || "-" }}</td>
                <td>{{ r.clave_upp }} — {{ r.nombre_upp }}</td>
                <td>{{ r.mvz || "-" }}</td>
                <td>{{ r.fecha_asignacion || "-" }}</td>
              </tr>

              <tr v-if="resultados.length === 0">
                <td colspan="5" class="sin-resultados">Sin coincidencias.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import api from "@/services/api";

defineProps({ codigo: String, rol: String });

const acciones = [
  { id: "asignar", label: "ASIGNAR" },
  { id: "consultar", label: "CONSULTAR" },
];

const selectedAction = ref("asignar");

const descripcionAccion = computed(() => {
  if (selectedAction.value === "asignar") {
    return "Asigna un número de caso a una hoja de control de campo (generado por el sistema).";
  }
  return "Consulta números de caso desde la base de datos. Capture al menos un criterio.";
});

function cambiarAccion(id) {
  selectedAction.value = id;
  // Limpieza básica al cambiar de vista
  msgOk.value = "";
  msgError.value = "";
  errorBuscar.value = "";
  mostrarAlerta.value = false;
}

// =======================
// ASIGNAR (BD real)
// =======================
const form = ref({
  folio_hoja_control: "",
  id_upp: null,
  clave_upp: "",
  nombre_upp: "",
  mvz: "",
});

const numeroCasoGenerado = ref("");
const loadingAsignar = ref(false);
const msgOk = ref("");
const msgError = ref("");

// Autocomplete UPP (asignar)
const uppSearch = ref("");
const uppOptions = ref([]);
let uppTimer = null;

function onUppSearch() {
  clearTimeout(uppTimer);
  uppTimer = setTimeout(async () => {
    const s = uppSearch.value.trim();
    if (!s) {
      uppOptions.value = [];
      return;
    }
    try {
      const res = await api.get("/api/upp", { params: { search: s, limit: 15 } });
      uppOptions.value = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      uppOptions.value = [];
    }
  }, 250);
}

function selectUpp(u) {
  form.value.id_upp = u.id_upp;
  form.value.clave_upp = u.clave_upp;
  form.value.nombre_upp = u.nombre_upp;
  uppOptions.value = [];
  uppSearch.value = `${u.clave_upp} — ${u.nombre_upp}`;
}

function clearUpp() {
  form.value.id_upp = null;
  form.value.clave_upp = "";
  form.value.nombre_upp = "";
  uppSearch.value = "";
  uppOptions.value = [];
}

async function asignar() {
  msgOk.value = "";
  msgError.value = "";
  numeroCasoGenerado.value = "";

  if (!form.value.folio_hoja_control.trim()) {
    msgError.value = "Capture la hoja de control de campo.";
    return;
  }
  if (!form.value.id_upp) {
    msgError.value = "Seleccione una UPP válida (use el buscador y elija una opción).";
    return;
  }

  loadingAsignar.value = true;
  try {
    const payload = {
      id_upp: form.value.id_upp,
      fecha_recepcion: new Date().toISOString().slice(0, 10),
      observaciones: `HCC: ${form.value.folio_hoja_control || "N/A"} | MVZ: ${form.value.mvz || "N/A"}`,
      id_usuario_crea: 1, // TODO: conectar a sesión/login
      
    };

    const res = await api.post("/api/casos", payload);
    const nc = res?.data?.numero_caso || "";
    if (!nc) {
      msgError.value = "El caso se creó, pero no se recibió 'numero_caso' en la respuesta.";
      return;
    }

    numeroCasoGenerado.value = nc;
    msgOk.value = `Caso creado correctamente: ${nc}`;
  } catch (e) {
    msgError.value =
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      "Error al crear el caso en el servidor.";
    console.error(e);
  } finally {
    loadingAsignar.value = false;
  }
}

function limpiarForm() {
  form.value = { folio_hoja_control: "", id_upp: null, clave_upp: "", nombre_upp: "", mvz: "" };
  uppSearch.value = "";
  uppOptions.value = [];
  numeroCasoGenerado.value = "";
  msgOk.value = "";
  msgError.value = "";
}

// =======================
// CONSULTAR (BD real)
// =======================
const filtros = ref({
  numero_caso: "",
  folio_hoja_control: "",
  id_upp: null,
  clave_upp: "",
  nombre_upp: "",
});

const buscado = ref(false);
const mostrarAlerta = ref(false);
const loadingBuscar = ref(false);
const errorBuscar = ref("");
const resultados = ref([]);

// Autocomplete UPP (consultar)
const uppSearch2 = ref("");
const uppOptions2 = ref([]);
let uppTimer2 = null;

function onUppSearch2() {
  clearTimeout(uppTimer2);
  uppTimer2 = setTimeout(async () => {
    const s = uppSearch2.value.trim();
    if (!s) {
      uppOptions2.value = [];
      return;
    }
    try {
      const res = await api.get("/api/upp", { params: { search: s, limit: 15 } });
      uppOptions2.value = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      uppOptions2.value = [];
    }
  }, 250);
}

function selectUpp2(u) {
  filtros.value.id_upp = u.id_upp;
  filtros.value.clave_upp = u.clave_upp;
  filtros.value.nombre_upp = u.nombre_upp;
  uppOptions2.value = [];
  uppSearch2.value = `${u.clave_upp} — ${u.nombre_upp}`;
}

function clearUpp2() {
  filtros.value.id_upp = null;
  filtros.value.clave_upp = "";
  filtros.value.nombre_upp = "";
  uppSearch2.value = "";
  uppOptions2.value = [];
}

function hayFiltro() {
  const f = filtros.value;
  return f.numero_caso.trim() || f.folio_hoja_control.trim() || !!f.id_upp;
}

async function buscar() {
  mostrarAlerta.value = false;
  errorBuscar.value = "";
  resultados.value = [];

  if (!hayFiltro()) {
    buscado.value = false;
    mostrarAlerta.value = true;
    return;
  }

  loadingBuscar.value = true;
  try {
    const params = {};
    if (filtros.value.numero_caso.trim()) params.numero_caso = filtros.value.numero_caso.trim();
    if (filtros.value.folio_hoja_control.trim()) params.folio_hoja_control = filtros.value.folio_hoja_control.trim();
    if (filtros.value.id_upp) params.id_upp = filtros.value.id_upp;

    const res = await api.get("/api/casos", { params });
    resultados.value = Array.isArray(res.data) ? res.data : [];
    buscado.value = true;
  } catch (e) {
    errorBuscar.value =
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      "Error al consultar casos en el servidor.";
    buscado.value = true;
    console.error(e);
  } finally {
    loadingBuscar.value = false;
  }
}

function limpiar() {
  filtros.value = { numero_caso: "", folio_hoja_control: "", id_upp: null, clave_upp: "", nombre_upp: "" };
  buscado.value = false;
  mostrarAlerta.value = false;
  errorBuscar.value = "";
  resultados.value = [];
  uppSearch2.value = "";
  uppOptions2.value = [];
}

/* ===================== Descargar Excel / PDF ===================== */
function descargarExcel() {
  const datos = resultados.value;
  if (datos.length === 0) return;

  const encabezados = ['No. Caso', 'Hoja control', 'UPP', 'MVZ', 'Fecha asignación'];
  const filas = datos.map(r => [
    r.numero_caso || '',
    r.folio_hoja_control || '',
    `${r.clave_upp || ''} — ${r.nombre_upp || ''}`,
    r.mvz || '',
    r.fecha_asignacion || ''
  ]);

  const bom = '\uFEFF';
  const csv = [encabezados, ...filas]
    .map(fila => fila.map(celda => `"${String(celda).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `numeros_caso_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function descargarPDF() {
  const datos = resultados.value;
  if (datos.length === 0) return;

  const filasHTML = datos.map(r => `
    <tr>
      <td><strong>${r.numero_caso || ''}</strong></td>
      <td>${r.folio_hoja_control || '-'}</td>
      <td>${r.clave_upp || ''} — ${r.nombre_upp || ''}</td>
      <td>${r.mvz || '-'}</td>
      <td>${r.fecha_asignacion || '-'}</td>
    </tr>
  `).join('');

  const tablaHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Números de Caso</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background-color: #7a061e; color: #fff; padding: 8px; text-align: left; }
        td { padding: 8px; border: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #fafafa; }
        @media print {
          body { padding: 0; }
          @page { margin: 1cm; }
        }
      </style>
    </head>
    <body>
      <h1>Números de Caso - SISTPEC</h1>
      <table>
        <thead>
          <tr>
            <th>No. Caso</th>
            <th>Hoja control</th>
            <th>UPP</th>
            <th>MVZ</th>
            <th>Fecha asignación</th>
          </tr>
        </thead>
        <tbody>
          ${filasHTML}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const ventana = window.open('', '_blank');
  ventana.document.write(tablaHTML);
  ventana.document.close();
}
</script>

<style scoped>

.modulo-acciones { margin-bottom: 18px; }
.modulo-acciones-titulo { display:block; font-size:14px; margin-bottom:8px; color:#333; font-weight:600; }
.modulo-acciones-botones { display:flex; flex-wrap:wrap; gap:4px; }
.sistpec-btn-accion { border:none; padding:8px 16px; font-size:12px; font-weight:600; text-transform:uppercase; border-radius:3px; cursor:pointer; background:#2f6b32; color:#fff; }
.sistpec-btn-accion.active { background:#244e26; }

.sistpec-info-box { margin-top:10px; background:#e3f6e3; border:1px solid #bfe7bf; border-radius:4px; padding:10px 12px; }
.sistpec-info-text { margin:0; color:#1f4d1f; font-size:13px; }

.subtitulo { font-size:18px; margin:10px 0 12px; color:#333; }
.modulo-alert { margin:10px 0 14px; padding:10px 14px; border-radius:4px; font-size:13px; }
.modulo-alert--error { background:#fbeaea; border:1px solid #f5c2c2; color:#7a1f1f; }
.modulo-alert--success { background:#e1f3e1; border:1px solid #c3e6c3; color:#225522; }

.sistpec-search-bar { display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap:12px; margin-bottom:16px; }
.sistpec-form-group { display:flex; flex-direction:column; gap:4px; position:relative; }
.sistpec-form-group label { font-size:13px; font-weight:600; color:#444; }
.sistpec-form-group input { padding:8px 10px; border-radius:4px; border:1px solid #ccc; font-size:14px; outline:none; }
.sistpec-search-actions { display:flex; align-items:flex-end; gap:8px; }
.sistpec-search-actions.right { justify-content:flex-end; }

.sistpec-btn-primary { background:#2f6b32; color:#fff; border:none; padding:8px 18px; border-radius:4px; font-size:13px; font-weight:600; cursor:pointer; }
.sistpec-btn-primary:hover { background:#244e26; }
.sistpec-btn-primary:disabled { opacity:0.7; cursor:not-allowed; }
.sistpec-btn-secondary { background:#e0e0e0; color:#333; border:none; padding:8px 18px; border-radius:4px; font-size:13px; font-weight:600; cursor:pointer; }
.sistpec-btn-secondary:hover { background:#d0d0d0; }
.sistpec-btn-secondary:disabled { opacity:0.7; cursor:not-allowed; }

.sistpec-table-wrapper { width:100%; overflow-x:auto; }
.sistpec-table { width:100%; border-collapse:collapse; font-size:13px; }
.sistpec-table thead { background:#7a061e; color:#fff; }
.sistpec-table th, .sistpec-table td { padding:8px 10px; border:1px solid #ddd; text-align:left; }
.sistpec-table tbody tr:nth-child(even) { background:#fafafa; }
.sin-resultados { text-align:center; color:#777; }

.sistpec-full { grid-column: 1 / -1; }

/* autocomplete */
.sistpec-autocomplete {
  position:absolute;
  top: 100%;
  left:0;
  right:0;
  z-index: 10;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 6px;
  margin-top: 4px;
  max-height: 220px;
  overflow: auto;
  box-shadow: 0 10px 18px rgba(0,0,0,0.08);
}
.sistpec-autocomplete-item {
  width:100%;
  text-align:left;
  padding:10px 10px;
  border:none;
  background:#fff;
  cursor:pointer;
  font-size: 13px;
}
.sistpec-autocomplete-item:hover { background:#f4f4f4; }

.sistpec-chip{
  margin-top: 6px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 16px;
  background: #f0f7f0;
  border: 1px solid #bfe7bf;
  color: #1f4d1f;
  font-size: 12px;
}
.sistpec-chip-x{
  border:none;
  background: transparent;
  cursor:pointer;
  font-size: 18px;
  line-height: 1;
  color: #1f4d1f;
}

/* Botones de exportación */
.sistpec-export-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.sistpec-btn-export {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.sistpec-btn-excel {
  background-color: #217346;
  color: #fff;
}

.sistpec-btn-excel:hover {
  background-color: #1a5c38;
}

.sistpec-btn-pdf {
  background-color: #c42b1c;
  color: #fff;
}

.sistpec-btn-pdf:hover {
  background-color: #a32315;
}

@media (max-width: 768px) {
  .sistpec-search-bar { grid-template-columns: 1fr; }
  .sistpec-full { grid-column: auto; }
}
</style>


