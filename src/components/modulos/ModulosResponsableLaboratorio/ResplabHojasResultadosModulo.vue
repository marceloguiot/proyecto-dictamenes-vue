<template>
  <!-- Barra de acciones -->
  <section class="modulo-acciones">
    <span class="modulo-acciones-titulo">Acciones disponibles</span>

    <div class="modulo-acciones-botones">
      <button
        v-for="accion in acciones"
        :key="accion.id"
        type="button"
        class="sistpec-btn-accion"
        :class="{ active: selectedAction === accion.id }"
        @click="cambiarAccion(accion.id)"
      >
        {{ accion.label }}
      </button>
    </div>

    <div class="sistpec-info-box">
      <p class="sistpec-info-text">{{ descripcionAccionActual }}</p>
    </div>
  </section>

  <section class="modulo-contenido" ref="moduloContenidoRef">
    <!-- ALERTAS -->
    <div v-if="errores.length" class="modulo-alert modulo-alert--error">
      <ul>
        <li v-for="(err, i) in errores" :key="i">{{ err }}</li>
      </ul>
    </div>

    <div v-if="mensajeExito" class="modulo-alert modulo-alert--success">
      {{ mensajeExito }}
    </div>

    <!-- ================= CARGAR HOJA (PDF) ================= -->
    <div v-if="selectedAction === 'cargar'">
      <h3 class="subtitulo">Cargar hoja de resultados (PDF)</h3>

      <div class="sistpec-form-grid">
        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input
            v-model="form.numero_caso"
            type="text"
            placeholder="Ej. BR25-001"
          />
        </div>

        <div class="sistpec-form-group">
          <label>UPP</label>
          <input
            v-model="form.upp"
            type="text"
            placeholder="Clave o nombre UPP"
          />
        </div>

        <div class="sistpec-form-group">
          <label>MVZ que registró</label>
          <input
            v-model="form.mvz"
            type="text"
            placeholder="Nombre del MVZ"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Fecha de carga</label>
          <input v-model="form.fecha_carga" type="date" />
        </div>

        <div class="sistpec-form-group sistpec-form-group-full">
          <label>Archivo PDF</label>
          <input
            type="file"
            accept="application/pdf"
            @change="onFileChange"
          />
          <small class="sistpec-hint">
            Solo PDF. Este módulo es demo (aún no se guarda en BD).
          </small>
        </div>
      </div>

      <div class="sistpec-actions-row">
        <button type="button" class="sistpec-btn-primary" @click="cargarPDF">
          CARGAR PDF
        </button>
        <button type="button" class="sistpec-btn-secondary" @click="limpiarFormulario">
          LIMPIAR
        </button>
      </div>

      <div class="sistpec-table-wrapper" style="margin-top: 16px;">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Folio hoja</th>
              <th>Número de caso</th>
              <th>UPP</th>
              <th>MVZ</th>
              <th>Fecha carga</th>
              <th>Archivo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in hojas" :key="h.id">
              <td>{{ h.folio }}</td>
              <td>{{ h.numero_caso }}</td>
              <td>{{ h.upp }}</td>
              <td>{{ h.mvz }}</td>
              <td>{{ h.fecha_carga }}</td>
              <td>
                <a
                  v-if="h.url"
                  href="#"
                  @click.prevent="abrirPDF(h)"
                >
                  Abrir
                </a>
                <span v-else>-</span>
              </td>
            </tr>

            <tr v-if="hojas.length === 0">
              <td colspan="6" class="sin-resultados">
                Aún no se han cargado hojas de resultados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= ELIMINAR HOJA ================= -->
    <div v-else-if="selectedAction === 'eliminar'">
      <h3 class="subtitulo">Eliminar hoja de resultados</h3>

      <div class="modulo-alert modulo-alert--info">
        Capture al menos <strong>un criterio</strong> para filtrar y eliminar.
      </div>

      <div v-if="mostrarAlerta" class="modulo-alert modulo-alert--error">
        Debe capturar <strong>al menos un criterio</strong> para realizar la consulta.
      </div>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Folio hoja</label>
          <input v-model="filtros.folio" type="text" placeholder="Ej. HR-2025-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input v-model="filtros.numero_caso" type="text" placeholder="Ej. BR25-001" />
        </div>

        <div class="sistpec-form-group">
          <label>UPP</label>
          <input v-model="filtros.upp" type="text" placeholder="Clave o nombre UPP" />
        </div>

        <div class="sistpec-form-group">
          <label>MVZ</label>
          <input v-model="filtros.mvz" type="text" placeholder="Nombre del MVZ" />
        </div>
      </div>

      <div class="sistpec-search-bar fechas-bar">
        <div class="sistpec-form-group sistpec-form-group-inline">
          <label>Fecha de carga</label>
          <div class="sistpec-form-inline-inputs">
            <input v-model="filtros.fecha_inicio" type="date" />
            <span class="vigencia-sep">a</span>
            <input v-model="filtros.fecha_fin" type="date" />
          </div>
        </div>

        <!-- ✅ Botones abajo a la derecha (como pediste) -->
        <div class="sistpec-form-group sistpec-search-actions sistpec-search-actions--right">
          <button type="button" class="sistpec-btn-primary" @click="buscarEliminar">
            BUSCAR
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarEliminar">
            LIMPIAR FILTROS
          </button>
        </div>
      </div>

      <div v-if="buscado" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Folio hoja</th>
              <th>Número de caso</th>
              <th>UPP</th>
              <th>MVZ</th>
              <th>Fecha carga</th>
              <th>Archivo</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in hojasFiltradasEliminar" :key="h.id">
              <td>{{ h.folio }}</td>
              <td>{{ h.numero_caso }}</td>
              <td>{{ h.upp }}</td>
              <td>{{ h.mvz }}</td>
              <td>{{ h.fecha_carga }}</td>
              <td>
                <a v-if="h.url" href="#" @click.prevent="abrirPDF(h)">Abrir</a>
                <span v-else>-</span>
              </td>
              <td>
                <button
                  type="button"
                  class="sistpec-btn-danger"
                  @click="eliminarHoja(h.id)"
                >
                  ELIMINAR
                </button>
              </td>
            </tr>

            <tr v-if="hojasFiltradasEliminar.length === 0">
              <td colspan="7" class="sin-resultados">
                No se encontraron hojas con los criterios capturados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- fallback -->
    <div v-else>
      <h3 class="subtitulo">Acción no disponible</h3>
      <p>El contenido para esta acción aún está en desarrollo.</p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue';

defineProps({
  codigo: { type: String, required: true },
  rol: { type: String, required: true }
});

// Scroll al contenido
const moduloContenidoRef = ref(null);
function scrollAlContenido() {
  nextTick(() => {
    if (!moduloContenidoRef.value) return;
    const rect = moduloContenidoRef.value.getBoundingClientRect();
    const offset = 90;
    const top = rect.top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

// Acciones
const acciones = [
  { id: 'cargar', label: 'CARGAR HOJA (PDF)' },
  { id: 'eliminar', label: 'ELIMINAR HOJA' }
];

const selectedAction = ref('cargar');

const errores = ref([]);
const mensajeExito = ref('');

// Descripción
const descripcionAccionActual = computed(() => {
  if (selectedAction.value === 'cargar') {
    return 'Cargue la hoja de resultados en PDF asociada al número de caso. (Demo: se almacena temporalmente).';
  }
  if (selectedAction.value === 'eliminar') {
    return 'Busque hojas de resultados por criterios y elimínelas del sistema (demo).';
  }
  return '';
});

// Reset mensajes
watch(
  () => selectedAction.value,
  () => {
    errores.value = [];
    mensajeExito.value = '';
  }
);

function cambiarAccion(id) {
  selectedAction.value = id;
  scrollAlContenido();
}

// =====================
// DEMO: lista de hojas
// =====================
const hojas = ref([
  {
    id: 1,
    folio: 'HR-2025-001',
    numero_caso: 'BR25-001',
    upp: 'UPP-VER-001',
    mvz: 'MVZ Juan Pérez',
    fecha_carga: '2025-12-10',
    fileName: 'hoja_resultados_BR25-001.pdf',
    url: '' // demo vacío
  }
]);

// =====================
// CARGAR PDF
// =====================
const form = ref({
  numero_caso: '',
  upp: '',
  mvz: '',
  fecha_carga: '',
  file: null
});

function onFileChange(e) {
  const file = e.target.files?.[0] || null;
  form.value.file = file;
}

function limpiarFormulario() {
  form.value = {
    numero_caso: '',
    upp: '',
    mvz: '',
    fecha_carga: '',
    file: null
  };
  errores.value = [];
  mensajeExito.value = '';
}

function generarFolio() {
  // HR-YYYY-XXX (demo)
  const year = new Date().getFullYear();
  const consecutivo = String(hojas.value.length + 1).padStart(3, '0');
  return `HR-${year}-${consecutivo}`;
}

function cargarPDF() {
  errores.value = [];
  mensajeExito.value = '';

  const f = form.value;
  const errs = [];

  if (!f.numero_caso.trim()) errs.push('Capture el número de caso.');
  if (!f.upp.trim()) errs.push('Capture la UPP.');
  if (!f.mvz.trim()) errs.push('Capture el nombre del MVZ.');
  if (!f.fecha_carga) errs.push('Seleccione la fecha de carga.');
  if (!f.file) errs.push('Seleccione un archivo PDF.');

  if (f.file && f.file.type !== 'application/pdf') {
    errs.push('El archivo debe ser PDF (application/pdf).');
  }

  if (errs.length) {
    errores.value = errs;
    return;
  }

  const url = URL.createObjectURL(f.file);

  hojas.value.unshift({
    id: Date.now(),
    folio: generarFolio(),
    numero_caso: f.numero_caso.trim(),
    upp: f.upp.trim(),
    mvz: f.mvz.trim(),
    fecha_carga: f.fecha_carga,
    fileName: f.file.name,
    url
  });

  mensajeExito.value = 'Hoja de resultados cargada correctamente (demo).';
  limpiarFormulario();
}

function abrirPDF(h) {
  if (!h.url) return;
  window.open(h.url, '_blank');
}

// =====================
// ELIMINAR
// =====================
const filtros = ref({
  folio: '',
  numero_caso: '',
  upp: '',
  mvz: '',
  fecha_inicio: '',
  fecha_fin: ''
});

const buscado = ref(false);
const mostrarAlerta = ref(false);

function hayAlMenosUnFiltroEliminar() {
  const x = filtros.value;
  return (
    x.folio.trim() ||
    x.numero_caso.trim() ||
    x.upp.trim() ||
    x.mvz.trim() ||
    x.fecha_inicio ||
    x.fecha_fin
  );
}

function buscarEliminar() {
  mostrarAlerta.value = false;
  if (!hayAlMenosUnFiltroEliminar()) {
    buscado.value = false;
    mostrarAlerta.value = true;
    return;
  }
  buscado.value = true;
}

function limpiarEliminar() {
  filtros.value = {
    folio: '',
    numero_caso: '',
    upp: '',
    mvz: '',
    fecha_inicio: '',
    fecha_fin: ''
  };
  buscado.value = false;
  mostrarAlerta.value = false;
  errores.value = [];
  mensajeExito.value = '';
}

const hojasFiltradasEliminar = computed(() => {
  if (!buscado.value) return [];

  const f = filtros.value;
  const folio = f.folio.trim().toLowerCase();
  const caso = f.numero_caso.trim().toLowerCase();
  const upp = f.upp.trim().toLowerCase();
  const mvz = f.mvz.trim().toLowerCase();
  const ini = f.fecha_inicio;
  const fin = f.fecha_fin;

  return hojas.value.filter(h => {
    const okFolio = folio ? (h.folio || '').toLowerCase().includes(folio) : true;
    const okCaso = caso ? (h.numero_caso || '').toLowerCase().includes(caso) : true;
    const okUpp = upp ? (h.upp || '').toLowerCase().includes(upp) : true;
    const okMvz = mvz ? (h.mvz || '').toLowerCase().includes(mvz) : true;

    let okFecha = true;
    if (ini) okFecha = okFecha && (h.fecha_carga >= ini);
    if (fin) okFecha = okFecha && (h.fecha_carga <= fin);

    return okFolio && okCaso && okUpp && okMvz && okFecha;
  });
});

function eliminarHoja(id) {
  // Si traía URL de objectURL, liberamos memoria
  const found = hojas.value.find(x => x.id === id);
  if (found?.url) {
    try { URL.revokeObjectURL(found.url); } catch (e) {}
  }

  hojas.value = hojas.value.filter(x => x.id !== id);
  mensajeExito.value = 'Hoja eliminada correctamente (demo).';
}
</script>

<style scoped>
/* Acciones */
.modulo-acciones { 
    margin-bottom: 20px; 
}
.modulo-acciones-titulo { 
    display:block; 
    font-size:14px; 
    margin-bottom:8px; 
    color:#333; 
    font-weight:600; 
}
.modulo-acciones-botones { 
    display:flex; 
    flex-wrap:wrap; 
    gap:4px; 
}

.sistpec-btn-accion {
  border:none; padding:8px 16px; font-size:12px; font-weight:600;
  text-transform:uppercase; border-radius:3px; cursor:pointer;
  background-color:#2f6b32; color:#fff; letter-spacing:0.5px;
}
.sistpec-btn-accion.active { 
    background-color:#244e26; 
}

.modulo-contenido { 
    margin-top: 10px; 
}
.subtitulo { 
    font-size:18px; 
    margin:10px 0 15px; 
    color:#333; 
}

.modulo-alert { 
    margin: 10px 0 14px; 
    padding: 10px 14px; 
    border-radius: 4px; 
    font-size: 13px; 
}
.modulo-alert--error { 
    background:#fbeaea; 
    border:1px solid #f5c2c2; 
    color:#7a1f1f; 
}
.modulo-alert--success { 
    background:#e1f3e1; 
    border:1px solid #c3e6c3; 
    color:#225522; 
}
.modulo-alert--info { 
    background:#eef6ff; 
    border:1px solid #cfe6ff; 
    color:#1f3a5a; 
}

.sistpec-info-box { 
    margin-top: 10px; 
    padding: 10px 12px; 
    border-radius: 4px; 
    background:#f3f7f4; 
    border:1px solid #d7e6d9; 
}
.sistpec-info-text { 
    margin:0; font-size:13px; 
    color:#2a4b2d; 
}

/* Form */
.sistpec-form-grid{
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.sistpec-form-group { 
    display:flex; 
    flex-direction:column; 
    gap:4px; 
}
.sistpec-form-group label { 
    font-size:13px; 
    font-weight:600; 
    color:#444; 
}
.sistpec-form-group input{
  padding:8px 10px; border-radius:4px; 
  border:1px solid #ccc; font-size:14px; outline:none;
}
.sistpec-form-group input:focus{
  border-color:#2f6b32; 
  box-shadow:0 0 0 1px rgba(47,107,50,.15);
}
.sistpec-form-group-full{ 
    grid-column: 1 / -1; 
}
.sistpec-hint{ 
    color:#666; 
    font-size:12px; 
    margin-top:4px; 
}

.sistpec-actions-row{
  display:flex;
  gap: 8px;
  margin-top: 12px;
}

/* Filtros */
.sistpec-search-bar{
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.fechas-bar{ 
    grid-template-columns: repeat(2, minmax(0, 1fr)); 
}

.sistpec-form-group-inline 
.sistpec-form-inline-inputs{
  display:flex; 
  align-items:center; 
  gap:6px;
}
.vigencia-sep { 
    font-size:14px; 
    color:#666; 
}

.sistpec-search-actions{
  display:flex; align-items:flex-end; 
  gap:8px;
}
.sistpec-search-actions--right{
  justify-content: flex-end;
}

/* Botones */
.sistpec-btn-primary{
  background:#2f6b32; color:#fff; border:none; padding:8px 18px;
  border-radius:4px; font-size:13px; font-weight:600; cursor:pointer;
}
.sistpec-btn-primary:hover{ 
    background:#244e26; 
}

.sistpec-btn-secondary{
  background:#e0e0e0; color:#333; border:none; padding:8px 18px;
  border-radius:4px; font-size:13px; font-weight:600; cursor:pointer;
}
.sistpec-btn-secondary:hover{ background:#d0d0d0; }

.sistpec-btn-danger{
  background:#b42318; color:#fff; border:none; padding:7px 12px;
  border-radius:4px; font-size:12px; font-weight:700; cursor:pointer;
}
.sistpec-btn-danger:hover{ background:#8f1c13; }

/* Tabla */
.sistpec-table-wrapper { 
    width:100%; 
    overflow-x:auto; 
}
.sistpec-table { 
    width:100%; 
    border-collapse:collapse; 
    font-size:13px; 
}
.sistpec-table thead { 
    background:#7a061e; 
    color:#fff; 
}
.sistpec-table th, 
.sistpec-table td { 
    padding:8px 10px; 
    border:1px solid #ddd; 
    text-align:left; 
}
.sistpec-table tbody tr:nth-child(even) { 
    background:#fafafa; 
}
.sin-resultados { 
    text-align:center; 
    color:#777; 
}

@media (max-width: 768px){
  .sistpec-form-grid{ grid-template-columns: 1fr; }
  .sistpec-search-bar{ grid-template-columns: 1fr; }
  .fechas-bar{ grid-template-columns: 1fr; }
  .sistpec-search-actions--right{ justify-content: flex-start; }
}
</style>
