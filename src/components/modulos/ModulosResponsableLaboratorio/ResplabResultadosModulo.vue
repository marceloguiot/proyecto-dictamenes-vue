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
          <input v-model="form.numero_caso" type="text" placeholder="Ej. BR25-001" />
        </div>

        <div class="sistpec-form-group">
          <label>UPP</label>
          <input v-model="form.upp" type="text" placeholder="Clave o nombre UPP" />
        </div>

        <div class="sistpec-form-group">
          <label>MVZ</label>
          <input v-model="form.mvz" type="text" placeholder="Nombre del MVZ" />
        </div>

        <div class="sistpec-form-group">
          <label>Fecha de carga</label>
          <input v-model="form.fecha_carga" type="date" />
        </div>

        <div class="sistpec-form-group sistpec-form-group-full">
          <label>Archivo PDF</label>
          <input
            ref="fileInputRef"
            type="file"
            accept="application/pdf"
            @change="onFileChange"
          />
          <small class="ayuda">
            Solo se permite PDF. (Demo: no se sube realmente, se registra en la tabla.)
          </small>
        </div>
      </div>

      <div class="acciones-form">
        <button type="button" class="sistpec-btn-primary" @click="cargarHoja">
          GUARDAR / CARGAR PDF
        </button>
        <button type="button" class="sistpec-btn-secondary" @click="limpiarFormulario">
          LIMPIAR
        </button>
      </div>
    </div>

    <!-- ================= ELIMINAR HOJA ================= -->
    <div v-else-if="selectedAction === 'eliminar'">
      <h3 class="subtitulo">Eliminar hoja de resultados</h3>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Buscar por número de caso</label>
          <input v-model="filtroEliminar" type="text" placeholder="Ej. BR25-001" />
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscarEliminar">
            BUSCAR
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarEliminar">
            LIMPIAR
          </button>
        </div>
      </div>

      <div v-if="buscadoEliminar" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>ID</th>
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
              <td>{{ h.id }}</td>
              <td>{{ h.numero_caso }}</td>
              <td>{{ h.upp }}</td>
              <td>{{ h.mvz }}</td>
              <td>{{ h.fecha_carga }}</td>
              <td>{{ h.nombre_archivo }}</td>
              <td>
                <button class="btn-danger" type="button" @click="eliminarHoja(h.id)">
                  ELIMINAR
                </button>
              </td>
            </tr>

            <tr v-if="hojasFiltradasEliminar.length === 0">
              <td colspan="7" class="sin-resultados">
                No se encontraron hojas con ese criterio.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= Fallback ================= -->
    <div v-else>
      <h3 class="subtitulo">Acción no disponible</h3>
      <p>El contenido para esta acción aún está en desarrollo.</p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue';

const props = defineProps({
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

function cambiarAccion(id) {
  selectedAction.value = id;
  scrollAlContenido();
}

watch(
  () => selectedAction.value,
  () => {
    errores.value = [];
    mensajeExito.value = '';
  }
);

const descripcionAccionActual = computed(() => {
  if (selectedAction.value === 'cargar') {
    return 'Cargue la hoja de resultados en formato PDF asociada a un número de caso.';
  }
  if (selectedAction.value === 'eliminar') {
    return 'Busque y elimine hojas de resultados cargadas previamente.';
  }
  return '';
});

// ===== DEMO: “Base” local =====
const hojasResultados = ref([
  {
    id: 1,
    numero_caso: 'BR25-001',
    upp: 'UPP-VER-001',
    mvz: 'MVZ Juan Pérez',
    fecha_carga: '2025-12-10',
    nombre_archivo: 'hoja_resultados_BR25-001.pdf'
  },
  {
    id: 2,
    numero_caso: 'BR25-014',
    upp: 'UPP-VER-014',
    mvz: 'MVZ Ana López',
    fecha_carga: '2025-12-11',
    nombre_archivo: 'hoja_resultados_BR25-014.pdf'
  }
]);

// ===== CARGA =====
const fileInputRef = ref(null);
const archivoPDF = ref(null);

const form = ref({
  numero_caso: '',
  upp: '',
  mvz: '',
  fecha_carga: ''
});

function onFileChange(e) {
  const file = e.target.files?.[0];
  archivoPDF.value = null;

  if (!file) return;

  // Validación básica
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    errores.value = ['El archivo debe ser un PDF.'];
    if (fileInputRef.value) fileInputRef.value.value = '';
    return;
  }

  archivoPDF.value = file;
}

function validarCarga() {
  const errs = [];
  if (!form.value.numero_caso.trim()) errs.push('Capture el número de caso.');
  if (!form.value.upp.trim()) errs.push('Capture la UPP.');
  if (!form.value.mvz.trim()) errs.push('Capture el nombre del MVZ.');
  if (!form.value.fecha_carga) errs.push('Seleccione la fecha de carga.');
  if (!archivoPDF.value) errs.push('Seleccione un archivo PDF.');
  return errs;
}

function cargarHoja() {
  errores.value = [];
  mensajeExito.value = '';

  const errs = validarCarga();
  if (errs.length) {
    errores.value = errs;
    return;
  }

  // DEMO: insertamos registro simulado
  const newId =
    hojasResultados.value.length
      ? Math.max(...hojasResultados.value.map(x => x.id)) + 1
      : 1;

  hojasResultados.value.unshift({
    id: newId,
    numero_caso: form.value.numero_caso.trim(),
    upp: form.value.upp.trim(),
    mvz: form.value.mvz.trim(),
    fecha_carga: form.value.fecha_carga,
    nombre_archivo: archivoPDF.value?.name || 'archivo.pdf'
  });

  mensajeExito.value = 'Hoja de resultados cargada correctamente (modo demo).';
  limpiarFormulario();
}

function limpiarFormulario() {
  form.value = { numero_caso: '', upp: '', mvz: '', fecha_carga: '' };
  archivoPDF.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
}

// ===== ELIMINAR =====
const filtroEliminar = ref('');
const buscadoEliminar = ref(false);

function buscarEliminar() {
  // aquí sí permitimos buscar vacío (mostrar todo) o exigir criterio, tú decides.
  buscadoEliminar.value = true;
}

function limpiarEliminar() {
  filtroEliminar.value = '';
  buscadoEliminar.value = false;
}

const hojasFiltradasEliminar = computed(() => {
  if (!buscadoEliminar.value) return [];
  const q = filtroEliminar.value.trim().toLowerCase();
  if (!q) return hojasResultados.value;
  return hojasResultados.value.filter(h =>
    (h.numero_caso || '').toLowerCase().includes(q)
  );
});

function eliminarHoja(id) {
  errores.value = [];
  mensajeExito.value = '';

  const idx = hojasResultados.value.findIndex(x => x.id === id);
  if (idx === -1) {
    errores.value = ['No se encontró la hoja para eliminar.'];
    return;
  }

  hojasResultados.value.splice(idx, 1);
  mensajeExito.value = 'Hoja de resultados eliminada correctamente (modo demo).';
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

.sistpec-info-box { 
    margin-top:10px; 
    background:#eaf4ea; 
    border:1px solid #cfe6cf; 
    padding:10px 12px; 
    border-radius:4px; 
}
.sistpec-info-text { 
    margin:0; 
    font-size:13px; 
    color:#1f4d22; 
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
    margin-bottom:12px; 
    padding:10px 14px; 
    border-radius:4px; 
    font-size:13px; 
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

/* Form */
.sistpec-form-grid {
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap:12px;
  margin-bottom: 14px;
}
.sistpec-form-group { 
    display:flex; 
    flex-direction:column; 
    gap:4px; 
}
.sistpec-form-group-full { 
    grid-column: 1 / -1; 
}

.sistpec-form-group label { 
    font-size:13px; 
    font-weight:600; 
    color:#444; 
}
.sistpec-form-group input {
  padding:8px 10px; 
  border-radius:4px; 
  border:1px solid #ccc; 
  font-size:14px; 
  outline:none;
}
.sistpec-form-group input:focus {
  border-color:#2f6b32;
  box-shadow:0 0 0 1px rgba(47, 107, 50, 0.15);
}
.ayuda { 
    color:#666; 
    font-size:12px; 
    margin-top:4px; 
}

.acciones-form{
  display:flex;
  gap:10px;
  justify-content:flex-end;
  margin-bottom: 10px;
}

.sistpec-btn-primary{
  background:#2f6b32; color:#fff; border:none; padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:600; cursor:pointer;
}
.sistpec-btn-primary:hover{ background:#244e26; }

.sistpec-btn-secondary{
  background:#e0e0e0; 
  color:#333; 
  border:none; 
  padding:8px 18px; 
  border-radius:4px;
  font-size:13px; 
  font-weight:600; 
  cursor:pointer;
}
.sistpec-btn-secondary:hover{ 
    background:#d0d0d0; }

/* Search bar (eliminar) */
.sistpec-search-bar {
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap:12px;
  margin-bottom:16px;
}
.sistpec-search-actions {
  display:flex;
  align-items:flex-end;
  justify-content:flex-end;
  gap:8px;
}

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

.btn-danger{
  background:#8b1a1a; color:#fff; border:none; padding:6px 12px; border-radius:4px;
  font-size:12px; font-weight:700; cursor:pointer;
}
.btn-danger:hover{ background:#6f1414; }

/* Responsive */
@media (max-width: 768px){
  .sistpec-form-grid { grid-template-columns: 1fr; }
  .sistpec-search-bar { grid-template-columns: 1fr; }
  .acciones-form{ justify-content:stretch; flex-direction:column; }
  .sistpec-search-actions{ justify-content:stretch; }
}
</style>
