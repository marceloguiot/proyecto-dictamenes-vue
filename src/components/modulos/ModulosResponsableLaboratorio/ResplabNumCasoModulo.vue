<template>
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
      <p class="sistpec-info-text">{{ descripcionAccionActual }}</p>
    </div>
  </section>

  <section class="modulo-contenido" ref="moduloContenidoRef">
    <div v-if="errores.length" class="modulo-alert modulo-alert--error">
      <ul><li v-for="(e,i) in errores" :key="i">{{ e }}</li></ul>
    </div>

    <div v-if="mensajeExito" class="modulo-alert modulo-alert--success">
      {{ mensajeExito }}
    </div>

    <!-- ASIGNAR -->
    <div v-if="selectedAction === 'asignar'">
      <h3 class="subtitulo">Asignar</h3>

      <form class="sistpec-form" @submit.prevent="asignarCaso">
        <!-- PIVOTE: FOLIO HOJA DE CONTROL -->
        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Folio / Número de hoja de control de campo</label>
            <input
              v-model="nuevoCaso.folio"
              type="text"
              required
              placeholder="Ej. HC-2025-000123"
              @keyup.enter.prevent="buscarHoja"
            />
          </div>

          <div class="sistpec-form-group sistpec-form-group--actions">
            <label>&nbsp;</label>
            <button
              type="button"
              class="sistpec-btn-secondary"
              :disabled="loadingBuscarHoja"
              @click="buscarHoja"
            >
              {{ loadingBuscarHoja ? "BUSCANDO..." : "BUSCAR FOLIO" }}
            </button>
          </div>
        </div>

        <div v-if="hojaEncontrada" class="sistpec-form-readonly">
          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Clave UPP</label>
              <input :value="datosHoja.upp" type="text" readonly />
            </div>

            <div class="sistpec-form-group">
              <label>MVZ (quien capturó)</label>
              <input :value="datosHoja.mvz" type="text" readonly />
            </div>
          </div>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Propietario</label>
              <input :value="datosHoja.propietario" type="text" readonly />
            </div>

            <div class="sistpec-form-group">
              <label>Fecha de captura</label>
              <input :value="datosHoja.fecha" type="date" readonly />
            </div>
          </div>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Número de caso (generado por el sistema)</label>
              <input :value="numeroCasoAsignado || ''" type="text" readonly placeholder="Se mostrará al asignar" />
              <small class="hint">El número de caso se genera en el backend.</small>
            </div>

            <div class="sistpec-form-group">
              <label>Estatus</label>
              <input :value="datosHoja.estatus" type="text" readonly />
            </div>
          </div>

          <div class="sistpec-form-actions">
            <button class="sistpec-btn-primary" type="submit" :disabled="loadingAsignar">
              {{ loadingAsignar ? "ASIGNANDO..." : "ASIGNAR NÚMERO DE CASO" }}
            </button>
            <button class="sistpec-btn-secondary" type="button" :disabled="loadingAsignar" @click="limpiarFormulario">
              LIMPIAR
            </button>
          </div>
        </div>

        <div v-else class="modulo-alert modulo-alert--info">
          Capture el folio y presione <strong>BUSCAR FOLIO</strong> para cargar la hoja registrada por el MVZ.
        </div>
      </form>
    </div>

    <!-- CONSULTAR -->
    <div v-else-if="selectedAction === 'consultar'">
      <header class="modulo-header">
        <h3 class="subtitulo">Consultar</h3>
        <p class="modulo-subtitle">Capture al menos un criterio de búsqueda.</p>
      </header>

      <div v-if="mostrarAlerta" class="modulo-alert modulo-alert--error">
        Debe capturar <strong>al menos un criterio de búsqueda</strong> para realizar la consulta.
      </div>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Folio (hoja de control)</label>
          <input v-model="filtros.folio" type="text" placeholder="Ej. HC-2025-000123" />
        </div>

        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input v-model="filtros.caso" type="text" placeholder="Ej. BR25-001" />
        </div>

        <div class="sistpec-form-group">
          <label>UPP</label>
          <input v-model="filtros.upp" type="text" placeholder="Clave UPP" />
        </div>

        <div class="sistpec-form-group">
          <label>MVZ</label>
          <input v-model="filtros.mvz" type="text" placeholder="Nombre MVZ" />
        </div>

        <div class="sistpec-form-group">
          <label>Fecha</label>
          <input v-model="filtros.fecha" type="date" />
        </div>

        <div class="sistpec-form-group">
          <label>Estatus</label>
          <select v-model="filtros.estatus">
            <option value="">-- Todos --</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Concluido">Concluido</option>
          </select>
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" :disabled="loadingConsulta" @click="buscar">
            {{ loadingConsulta ? "BUSCANDO..." : "BUSCAR" }}
          </button>
          <button type="button" class="sistpec-btn-secondary" :disabled="loadingConsulta" @click="limpiarFiltros">
            LIMPIAR FILTROS
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
              <th>Folio</th>
              <th>Número de caso</th>
              <th>Fecha</th>
              <th>UPP</th>
              <th>Propietario</th>
              <th>MVZ</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in resultados" :key="c.id_caso || c.id || c.numero_caso + '-' + c.folio">
              <td>{{ c.folio || '—' }}</td>
              <td>{{ c.numero_caso || c.caso || '—' }}</td>
              <td>{{ c.fecha || c.fecha_asignacion || '—' }}</td>
              <td>{{ c.upp || (c.clave_upp ? (c.clave_upp + ' — ' + (c.nombre_upp || '')) : '—') }}</td>
              <td>{{ c.propietario || '—' }}</td>
              <td>{{ c.mvz || '—' }}</td>
              <td>
                <span class="badge" :class="(c.estatus==='Pendiente') ? 'badge--proceso' : 'badge--activo'">
                  {{ c.estatus || '—' }}
                </span>
              </td>
            </tr>

            <tr v-if="resultados.length === 0">
              <td colspan="7" class="sin-resultados">No se encontraron coincidencias.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else>
      <h3 class="subtitulo">Acción no disponible</h3>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, nextTick } from "vue";
import api, { hojaControlService } from "@/services/api";

defineProps({ codigo: String, rol: String });

const moduloContenidoRef = ref(null);
function scrollAlContenido() {
  nextTick(() => {
    if (!moduloContenidoRef.value) return;
    const offset = 90;
    const top = moduloContenidoRef.value.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  });
}

const acciones = [
  { id: "asignar", label: "ASIGNAR" },
  { id: "consultar", label: "CONSULTAR" },
];

const selectedAction = ref("asignar");
const errores = ref([]);
const mensajeExito = ref("");
const buscado = ref(false);
const mostrarAlerta = ref(false);

const descripcionAccionActual = computed(() => {
  if (selectedAction.value === "asignar") {
    return "Asigna un número de caso a una hoja de control (folio) registrada previamente por el MVZ.";
  }
  if (selectedAction.value === "consultar") {
    return "Consulta números de caso por folio, caso, UPP, MVZ, fecha o estatus (base de datos).";
  }
  return "";
});

function cambiarAccion(id) {
  selectedAction.value = id;
  errores.value = [];
  mensajeExito.value = "";
  buscado.value = false;
  mostrarAlerta.value = false;

  limpiarFormulario();
  limpiarFiltros();
  resultados.value = [];

  scrollAlContenido();
}

// =====================
// ASIGNAR (BD real)
// =====================
const nuevoCaso = ref({ folio: "" });
const hojaEncontrada = ref(false);
const datosHoja = ref({
  id_hoja: null,
  folio: "",
  id_upp: null,
  upp: "",
  mvz: "",
  propietario: "",
  fecha: "",
  estatus: "",
  caso: null,
});

const numeroCasoAsignado = ref("");
const loadingBuscarHoja = ref(false);
const loadingAsignar = ref(false);

function normalizar(txt) {
  return (txt || "").trim();
}

async function buscarHoja() {
  errores.value = [];
  mensajeExito.value = "";
  hojaEncontrada.value = false;
  numeroCasoAsignado.value = "";
  datosHoja.value = { id_hoja: null, folio: "", id_upp: null, upp: "", mvz: "", propietario: "", fecha: "", estatus: "", caso: null };

  const folio = normalizar(nuevoCaso.value.folio);
  if (!folio) {
    errores.value.push("Debe capturar el folio (número de hoja de control de campo).");
    scrollAlContenido();
    return;
  }

  loadingBuscarHoja.value = true;
  try {
    const res = await hojaControlService.obtenerPorFolio(folio);

    if (!res?.data) {
      errores.value.push("No se encontró el folio capturado. Verifique que la hoja exista (registrada por el MVZ).");
      scrollAlContenido();
      return;
    }

    const h = res.data;

    hojaEncontrada.value = true;
    datosHoja.value = {
      id_hoja: h.id_hoja,
      folio: h.folio || folio,
      id_upp: h.id_upp,
      upp: h.upp || h.clave_upp || "",
      mvz: h.mvz || "",
      propietario: h.propietario || "",
      fecha: h.fecha || "",
      estatus: h.estatus || "",
      caso: h.caso || h.numero_caso || null,
    };

    if (datosHoja.value.caso) {
      // ya tiene caso asignado en BD
      numeroCasoAsignado.value = datosHoja.value.caso;
    }

    scrollAlContenido();
  } catch (e) {
    errores.value.push(
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      "Error al buscar el folio en el servidor. Verifica que exista el endpoint /api/hoja-control/por-folio."
    );
    scrollAlContenido();
    console.error(e);
  } finally {
    loadingBuscarHoja.value = false;
  }
}

async function asignarCaso() {
  errores.value = [];
  mensajeExito.value = "";

  if (!hojaEncontrada.value || !datosHoja.value.id_hoja) {
    errores.value.push("Primero debe buscar y cargar la hoja de control (folio).");
    scrollAlContenido();
    return;
  }

  if (datosHoja.value.caso) {
    errores.value.push(`Este folio ya tiene un número de caso asignado: ${datosHoja.value.caso}`);
    scrollAlContenido();
    return;
  }

  const ok = window.confirm(`¿Desea asignar el número de caso a este folio ${datosHoja.value.folio}?`);
  if (!ok) return;

  loadingAsignar.value = true;
  try {
    // ✅ Endpoint requerido en backend:
    // POST /api/casos/asignar { id_hoja, id_usuario_crea }
    const payload = {
      id_hoja: datosHoja.value.id_hoja,
      id_usuario_crea: 1, // TODO: conectar al login
    };

    const res = await api.post("/api/casos/asignar", payload);
    const nc = res?.data?.numero_caso || res?.data?.numeroCaso || "";

    if (!nc) {
      errores.value.push("Se asignó, pero no se recibió 'numero_caso' en la respuesta del servidor.");
      scrollAlContenido();
      return;
    }

    numeroCasoAsignado.value = nc;
    datosHoja.value.caso = nc;
    datosHoja.value.estatus = datosHoja.value.estatus || "Pendiente";

    mensajeExito.value = `Número de caso asignado correctamente: ${nc} (Folio: ${datosHoja.value.folio})`;

    scrollAlContenido();
  } catch (e) {
    errores.value.push(
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      "Error al asignar el número de caso. Verifica que exista /api/casos/asignar."
    );
    scrollAlContenido();
    console.error(e);
  } finally {
    loadingAsignar.value = false;
  }
}

function limpiarFormulario() {
  nuevoCaso.value = { folio: "" };
  hojaEncontrada.value = false;
  numeroCasoAsignado.value = "";
  datosHoja.value = { id_hoja: null, folio: "", id_upp: null, upp: "", mvz: "", propietario: "", fecha: "", estatus: "", caso: null };
  errores.value = [];
  mensajeExito.value = "";
}

// =====================
// CONSULTAR (BD real)
// =====================
const filtros = ref({ folio: "", caso: "", upp: "", mvz: "", fecha: "", estatus: "" });
const resultados = ref([]);
const loadingConsulta = ref(false);

function hayAlMenosUnFiltro() {
  const f = filtros.value;
  return !!(
    f.folio.trim() ||
    f.caso.trim() ||
    f.upp.trim() ||
    f.mvz.trim() ||
    f.fecha ||
    f.estatus
  );
}

async function buscar() {
  mostrarAlerta.value = false;
  errores.value = [];
  mensajeExito.value = "";
  resultados.value = [];

  if (!hayAlMenosUnFiltro()) {
    buscado.value = false;
    mostrarAlerta.value = true;
    return;
  }

  loadingConsulta.value = true;
  try {
    // ✅ Endpoint requerido: GET /api/casos (filtros)
    const params = {};
    if (filtros.value.folio.trim()) params.folio = filtros.value.folio.trim();
    if (filtros.value.caso.trim()) params.caso = filtros.value.caso.trim();
    if (filtros.value.upp.trim()) params.upp = filtros.value.upp.trim();
    if (filtros.value.mvz.trim()) params.mvz = filtros.value.mvz.trim();
    if (filtros.value.fecha) params.fecha = filtros.value.fecha;
    if (filtros.value.estatus) params.estatus = filtros.value.estatus;

    const res = await api.get("/api/casos", { params });
    resultados.value = Array.isArray(res.data) ? res.data : [];
    buscado.value = true;
    scrollAlContenido();
  } catch (e) {
    errores.value.push(
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      "Error al consultar casos. Verifica que exista el endpoint GET /api/casos."
    );
    buscado.value = true;
    scrollAlContenido();
    console.error(e);
  } finally {
    loadingConsulta.value = false;
  }
}

function limpiarFiltros() {
  filtros.value = { folio: "", caso: "", upp: "", mvz: "", fecha: "", estatus: "" };
  buscado.value = false;
  mostrarAlerta.value = false;
}

/* ===================== DESCARGAS ===================== */
function descargarExcel() {
  const datos = resultados.value;
  if (datos.length === 0) return;

  const encabezados = ['Folio', 'Número de caso', 'Fecha', 'UPP', 'Propietario', 'MVZ', 'Estatus'];
  const filas = datos.map(c => [
    c.folio || '',
    c.numero_caso || c.caso || '',
    c.fecha || c.fecha_asignacion || '',
    c.upp || (c.clave_upp ? (c.clave_upp + ' — ' + (c.nombre_upp || '')) : ''),
    c.propietario || '',
    c.mvz || '',
    c.estatus || ''
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

  const filasHTML = datos.map(c => {
    const badgeClass = c.estatus === 'Pendiente' ? 'proceso' : 'activo';
    return `
    <tr>
      <td>${c.folio || '—'}</td>
      <td><strong>${c.numero_caso || c.caso || '—'}</strong></td>
      <td>${c.fecha || c.fecha_asignacion || '—'}</td>
      <td>${c.upp || (c.clave_upp ? (c.clave_upp + ' — ' + (c.nombre_upp || '')) : '—')}</td>
      <td>${c.propietario || '—'}</td>
      <td>${c.mvz || '—'}</td>
      <td><span class="badge ${badgeClass}">${c.estatus || '—'}</span></td>
    </tr>
  `;
  }).join('');

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
        .badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
        .activo { background: #e1f3e1; color: #225522; }
        .proceso { background: #fff4e5; color: #b26a00; }
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
            <th>Folio</th>
            <th>Número de caso</th>
            <th>Fecha</th>
            <th>UPP</th>
            <th>Propietario</th>
            <th>MVZ</th>
            <th>Estatus</th>
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
/* 100% tu mismo estilo original */
.modulo-acciones { margin-bottom: 20px; }
.modulo-acciones-titulo { display: block; font-size: 14px; margin-bottom: 8px; color: #333; font-weight: 600; }
.modulo-acciones-botones { display: flex; flex-wrap: wrap; gap: 4px; }
.sistpec-btn-accion { border: none; padding: 8px 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; border-radius: 3px; cursor: pointer; background: #2f6b32; color: #fff; letter-spacing: 0.5px; }
.sistpec-btn-accion.active { background: #244e26; }

.sistpec-info-box { margin-top: 10px; padding: 10px 14px; border-radius: 4px; background: #e1f3e1; border: 1px solid #c3e6c3; }
.sistpec-info-text { margin: 0; font-size: 13px; color: #225522; }

.modulo-contenido { margin-top: 10px; }
.modulo-header { margin-bottom: 12px; text-align: left; }
.modulo-subtitle { margin: 0; font-size: 13px; color: #555; }
.subtitulo { font-size: 18px; margin: 10px 0 15px; color: #333; }

.modulo-alert { margin-bottom: 12px; padding: 10px 14px; border-radius: 4px; font-size: 13px; }
.modulo-alert--error { background: #fbeaea; border: 1px solid #f5c2c2; color: #7a1f1f; }
.modulo-alert--success { background: #e1f3e1; border: 1px solid #c3e6c3; color: #225522; }
.modulo-alert--info { background: #eef4ff; border: 1px solid #c9dcff; color: #1f3f7a; }

.sistpec-form { display: flex; flex-direction: column; gap: 16px; }
.sistpec-form-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.sistpec-form-group { display: flex; flex-direction: column; gap: 4px; }
.sistpec-form-group--actions button { height: 36px; }
.sistpec-form-group label { font-size: 13px; font-weight: 600; color: #444; }
.sistpec-form-group input, .sistpec-form-group select { padding: 8px 10px; border-radius: 4px; border: 1px solid #ccc; font-size: 14px; outline: none; }
.sistpec-form-group input[readonly] { background: #f6f6f6; color: #444; }
.hint { margin-top: 4px; font-size: 12px; color: #666; }
.sistpec-form-actions { display: flex; justify-content: flex-end; gap: 8px; }

.sistpec-btn-primary { background: #2f6b32; color: #fff; border: none; padding: 8px 18px; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; }
.sistpec-btn-primary:hover { background: #244e26; }
.sistpec-btn-secondary { background: #e0e0e0; color: #333; border: none; padding: 8px 18px; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; }
.sistpec-btn-secondary:hover { background: #d0d0d0; }
.sistpec-btn-secondary:disabled, .sistpec-btn-primary:disabled { opacity: .7; cursor: not-allowed; }

.sistpec-search-bar { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
.sistpec-search-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; align-items: flex-end; gap: 8px; }

.sistpec-table-wrapper { width: 100%; overflow-x: auto; }
.sistpec-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.sistpec-table thead { background: #7a061e; color: #fff; }
.sistpec-table th, .sistpec-table td { padding: 8px 10px; border: 1px solid #ddd; text-align: left; }
.sistpec-table tbody tr:nth-child(even) { background: #fafafa; }
.sin-resultados { text-align: center; color: #777; }

.badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
.badge--activo { background: #e1f3e1; color: #225522; }
.badge--proceso { background: #fff4e5; color: #b26a00; }

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
  .sistpec-form-row { grid-template-columns: 1fr; }
  .sistpec-search-bar { grid-template-columns: 1fr; }
  .sistpec-search-actions { grid-column: auto; justify-content: stretch; }
}
</style>
