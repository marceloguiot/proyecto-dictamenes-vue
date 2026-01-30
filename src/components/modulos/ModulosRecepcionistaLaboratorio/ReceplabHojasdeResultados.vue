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
        <li v-for="(e, i) in errores" :key="i">{{ e }}</li>
      </ul>
    </div>

    <div v-if="mensajeExito" class="modulo-alert modulo-alert--success">
      {{ mensajeExito }}
    </div>

    <!-- ===================== CARGAR PDF ===================== -->
    <div v-if="selectedAction === 'cargar'">
      <h3 class="subtitulo">Cargar PDF</h3>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input v-model="form.caso" type="text" placeholder="Ej. BR25-001" />
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
      </div>

      <div class="sistpec-search-bar fechas-bar">
        <div class="sistpec-form-group">
          <label>Archivo PDF</label>
          <input type="file" accept="application/pdf" @change="onFileChange" />
          <small class="hint" v-if="archivoNombre">Seleccionado: {{ archivoNombre }}</small>
        </div>

        <div class="sistpec-form-group sistpec-search-actions right">
          <button class="sistpec-btn-primary" type="button" @click="cargarPdf">
            CARGAR PDF
          </button>
          <button class="sistpec-btn-secondary" type="button" @click="limpiarForm">
            LIMPIAR
          </button>
        </div>
      </div>

      <div class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Caso</th>
              <th>UPP</th>
              <th>MVZ</th>
              <th>Fecha carga</th>
              <th>Archivo</th>
              <th>Comentarios</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in hojasDemo" :key="h.id">
              <td>{{ h.folio }}</td>
              <td>{{ h.caso }}</td>
              <td>{{ h.upp }}</td>
              <td>{{ h.mvz }}</td>
              <td>{{ h.fecha_carga }}</td>
              <td>
                <a href="#" @click.prevent="verPdf(h)">
                  {{ h.archivo_nombre }}
                </a>
              </td>
              <td class="comentarios-cell">
                <div class="comentarios-wrap">
                  <span v-if="h.comentarios" class="comentarios-text">{{ h.comentarios }}</span>
                  <span v-else class="comentarios-vacio">-</span>
                </div>
              </td>
            </tr>

            <tr v-if="hojasDemo.length === 0">
              <td colspan="7" class="sin-resultados">Sin registros.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===================== CONSULTAR ===================== -->
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
          <label>Folio</label>
          <input v-model="filtros.folio" type="text" placeholder="Ej. HRSL-2025-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input v-model="filtros.caso" type="text" placeholder="Ej. BR25-001" />
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

        <div class="sistpec-form-group sistpec-search-actions right">
          <button class="sistpec-btn-primary" type="button" @click="buscar">
            BUSCAR
          </button>
          <button class="sistpec-btn-secondary" type="button" @click="limpiarFiltros">
            LIMPIAR FILTROS
          </button>
        </div>
      </div>

      <!-- Botones de descarga -->
      <div v-if="hojasFiltradas.length > 0" class="sistpec-export-actions">
        <button type="button" class="sistpec-btn-export sistpec-btn-excel" @click="descargarExcel">
          DESCARGAR EXCEL
        </button>
        <button type="button" class="sistpec-btn-export sistpec-btn-pdf" @click="descargarPdfTabla">
          DESCARGAR PDF
        </button>
      </div>

      <div v-if="buscado" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Caso</th>
              <th>UPP</th>
              <th>MVZ</th>
              <th>Fecha carga</th>
              <th>Archivo</th>
              <th>Comentarios</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in hojasFiltradas" :key="h.id">
              <td>{{ h.folio }}</td>
              <td>{{ h.caso }}</td>
              <td>{{ h.upp }}</td>
              <td>{{ h.mvz }}</td>
              <td>{{ h.fecha_carga }}</td>
              <td>
                <a href="#" @click.prevent="verPdf(h)">
                  {{ h.archivo_nombre }}
                </a>
              </td>
              <td class="comentarios-cell">
                <div class="comentarios-wrap">
                  <span v-if="h.comentarios" class="comentarios-text">{{ h.comentarios }}</span>
                  <span v-else class="comentarios-vacio">-</span>
                </div>
              </td>
            </tr>

            <tr v-if="hojasFiltradas.length === 0">
              <td colspan="7" class="sin-resultados">No se encontraron coincidencias.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===================== ELIMINAR ===================== -->
    <div v-else-if="selectedAction === 'eliminar'">
      <h3 class="subtitulo">Eliminar</h3>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Folio</label>
          <input v-model="filtrosEliminar.folio" type="text" placeholder="Ej. HRSL-2025-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input v-model="filtrosEliminar.caso" type="text" placeholder="Ej. BR25-001" />
        </div>

        <div class="sistpec-form-group">
          <label>MVZ</label>
          <input v-model="filtrosEliminar.mvz" type="text" placeholder="Nombre del MVZ" />
        </div>

        <div class="sistpec-form-group sistpec-search-actions right">
          <button class="sistpec-btn-primary" type="button" @click="buscarEliminar">
            BUSCAR
          </button>
          <button class="sistpec-btn-secondary" type="button" @click="limpiarEliminar">
            LIMPIAR
          </button>
        </div>
      </div>

      <div v-if="eliminarBuscado" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Caso</th>
              <th>UPP</th>
              <th>MVZ</th>
              <th>Fecha carga</th>
              <th>Archivo</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in hojasParaEliminar" :key="h.id">
              <td>{{ h.folio }}</td>
              <td>{{ h.caso }}</td>
              <td>{{ h.upp }}</td>
              <td>{{ h.mvz }}</td>
              <td>{{ h.fecha_carga }}</td>
              <td>{{ h.archivo_nombre }}</td>
              <td>
                <button class="sistpec-btn-danger sistpec-btn-sm" type="button" @click="eliminarHoja(h)">
                  ELIMINAR
                </button>
              </td>
            </tr>

            <tr v-if="hojasParaEliminar.length === 0">
              <td colspan="7" class="sin-resultados">Sin coincidencias.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else>
      <h3 class="subtitulo">Acción no disponible</h3>
    </div>

    <!-- Modal simple (demo) -->
    <div v-if="modal.abierto" class="modal-backdrop" @click.self="cerrarModal">
      <div class="modal">
        <h4 class="modal-title">Vista previa</h4>
        <p class="modal-text">
          Archivo: <strong>{{ modal.archivo }}</strong>
        </p>
        <div class="modal-actions">
          <button class="sistpec-btn-secondary" type="button" @click="cerrarModal">
            CERRAR
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue';

defineProps({
  codigo: { type: String, required: false, default: '' },
  rol:    { type: String, required: false, default: '' }
});

const moduloContenidoRef = ref(null);
function scrollAlContenido() {
  nextTick(() => {
    if (!moduloContenidoRef.value) return;
    const rect = moduloContenidoRef.value.getBoundingClientRect();
    const offset = 90;
    window.scrollTo({ top: rect.top + window.scrollY - offset, behavior: 'smooth' });
  });
}

const acciones = [
  { id: 'cargar', label: 'CARGAR PDF' },
  { id: 'consultar', label: 'CONSULTAR' },
  { id: 'eliminar', label: 'ELIMINAR' }
];

const selectedAction = ref('cargar');
const errores = ref([]);
const mensajeExito = ref('');

function cambiarAccion(id) {
  selectedAction.value = id;
  errores.value = [];
  mensajeExito.value = '';
  scrollAlContenido();
}

const descripcionAccionActual = computed(() => {
  switch (selectedAction.value) {
    case 'cargar': return 'Carga una hoja de resultados en PDF para que el MVZ la consulte.';
    case 'consultar': return 'Consulta hojas de resultados.';
    case 'eliminar': return 'Elimina hojas de resultados.';
    default: return '';
  }
});

function hoyISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ===== DEMO DATA =====
const hojasDemo = ref([
  {
    id: 1,
    folio: 'HRSL-2025-001',
    caso: 'BR25-001',
    upp: 'UPP-VER-001',
    mvz: 'MVZ Juan Pérez',
    fecha_carga: '2025-12-12',
    archivo_nombre: 'resultados_BR25-001.pdf',
    comentarios: 'Hoja firmada.'
  },
  {
    id: 2,
    folio: 'HRSL-2025-002',
    caso: 'BR25-002',
    upp: 'UPP-VER-014',
    mvz: 'MVZ Ana López',
    fecha_carga: '2025-12-16',
    archivo_nombre: 'resultados_BR25-002.pdf',
    comentarios: ''
  }
]);

// ===== CARGAR =====
const form = ref({
  caso: '',
  upp: '',
  mvz: '',
  fecha_carga: hoyISO()
});

const archivo = ref(null);
const archivoNombre = computed(() => archivo.value?.name || '');

function onFileChange(e) {
  const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
  archivo.value = f;
}

function limpiarForm() {
  form.value = { caso: '', upp: '', mvz: '', fecha_carga: hoyISO() };
  archivo.value = null;
  errores.value = [];
  mensajeExito.value = '';
}

function cargarPdf() {
  errores.value = [];
  mensajeExito.value = '';

  if (!form.value.caso.trim()) errores.value.push('Debe capturar el número de caso.');
  if (!form.value.upp.trim()) errores.value.push('Debe capturar la UPP.');
  if (!form.value.mvz.trim()) errores.value.push('Debe capturar el MVZ.');
  if (!archivo.value) errores.value.push('Debe seleccionar un archivo PDF.');
  if (errores.value.length) return;

  // demo: guardamos solo el nombre
  const nuevo = {
    id: Date.now(),
    folio: `HRSL-${new Date().getFullYear()}-${String(hojasDemo.value.length + 1).padStart(3, '0')}`,
    caso: form.value.caso.trim(),
    upp: form.value.upp.trim(),
    mvz: form.value.mvz.trim(),
    fecha_carga: form.value.fecha_carga || hoyISO(),
    archivo_nombre: archivo.value.name,
    comentarios: ''
  };

  hojasDemo.value = [nuevo, ...hojasDemo.value];
  mensajeExito.value = 'Hoja de resultados cargada correctamente (demo).';
  limpiarForm();
}

// ===== CONSULTAR =====
const filtros = ref({
  folio: '',
  caso: '',
  upp: '',
  mvz: '',
  fecha_inicio: '',
  fecha_fin: ''
});

const buscado = ref(false);
const mostrarAlerta = ref(false);

function hayAlMenosUnFiltro() {
  const f = filtros.value;
  return (
    f.folio.trim() ||
    f.caso.trim() ||
    f.upp.trim() ||
    f.mvz.trim() ||
    f.fecha_inicio ||
    f.fecha_fin
  );
}

function buscar() {
  mostrarAlerta.value = false;
  if (!hayAlMenosUnFiltro()) {
    buscado.value = false;
    mostrarAlerta.value = true;
    return;
  }
  buscado.value = true;
}

function limpiarFiltros() {
  filtros.value = { folio: '', caso: '', upp: '', mvz: '', fecha_inicio: '', fecha_fin: '' };
  buscado.value = false;
  mostrarAlerta.value = false;
}

const hojasFiltradas = computed(() => {
  if (!buscado.value) return [];
  const f = filtros.value;

  const folio = f.folio.trim().toLowerCase();
  const caso  = f.caso.trim().toLowerCase();
  const upp   = f.upp.trim().toLowerCase();
  const mvz   = f.mvz.trim().toLowerCase();
  const fi    = f.fecha_inicio;
  const ff    = f.fecha_fin;

  return hojasDemo.value.filter(h => {
    const okFolio = folio ? (h.folio || '').toLowerCase().includes(folio) : true;
    const okCaso  = caso  ? (h.caso || '').toLowerCase().includes(caso) : true;
    const okUpp   = upp   ? (h.upp || '').toLowerCase().includes(upp) : true;
    const okMvz   = mvz   ? (h.mvz || '').toLowerCase().includes(mvz) : true;

    let okFecha = true;
    if (fi) okFecha = okFecha && h.fecha_carga >= fi;
    if (ff) okFecha = okFecha && h.fecha_carga <= ff;

    return okFolio && okCaso && okUpp && okMvz && okFecha;
  });
});

// ===== ELIMINAR =====
const filtrosEliminar = ref({ folio: '', caso: '', mvz: '' });
const eliminarBuscado = ref(false);

function buscarEliminar() {
  eliminarBuscado.value = true;
}

function limpiarEliminar() {
  filtrosEliminar.value = { folio: '', caso: '', mvz: '' };
  eliminarBuscado.value = false;
}

const hojasParaEliminar = computed(() => {
  if (!eliminarBuscado.value) return [];
  const f = filtrosEliminar.value;

  const folio = f.folio.trim().toLowerCase();
  const caso  = f.caso.trim().toLowerCase();
  const mvz   = f.mvz.trim().toLowerCase();

  return hojasDemo.value.filter(h => {
    const okFolio = folio ? (h.folio || '').toLowerCase().includes(folio) : true;
    const okCaso  = caso  ? (h.caso || '').toLowerCase().includes(caso) : true;
    const okMvz   = mvz   ? (h.mvz || '').toLowerCase().includes(mvz) : true;
    return okFolio && okCaso && okMvz;
  });
});

function eliminarHoja(h) {
  const ok = window.confirm(`¿Desea eliminar la hoja "${h.folio}"?`);
  if (!ok) return;

  hojasDemo.value = hojasDemo.value.filter(x => x.id !== h.id);
  mensajeExito.value = 'Hoja eliminada (demo).';
}

// ===== Modal demo =====
const modal = ref({ abierto: false, archivo: '' });

function verPdf(h) {
  modal.value = { abierto: true, archivo: h.archivo_nombre };
}

function cerrarModal() {
  modal.value = { abierto: false, archivo: '' };
}

/* ===================== Descargar Excel / PDF ===================== */
function descargarExcel() {
  const datos = hojasFiltradas.value;
  if (datos.length === 0) return;

  const encabezados = ['Folio', 'Caso', 'UPP', 'MVZ', 'Fecha carga', 'Archivo', 'Comentarios'];
  const filas = datos.map(h => [
    h.folio || '',
    h.caso || '',
    h.upp || '',
    h.mvz || '',
    h.fecha_carga || '',
    h.archivo_nombre || '',
    h.comentarios || ''
  ]);

  const bom = '\uFEFF';
  const csv = [encabezados, ...filas]
    .map(fila => fila.map(celda => `"${String(celda).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hojas_resultados_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function descargarPdfTabla() {
  const datos = hojasFiltradas.value;
  if (datos.length === 0) return;

  const filasHTML = datos.map(h => `
    <tr>
      <td>${h.folio || ''}</td>
      <td>${h.caso || ''}</td>
      <td>${h.upp || ''}</td>
      <td>${h.mvz || ''}</td>
      <td>${h.fecha_carga || ''}</td>
      <td>${h.archivo_nombre || ''}</td>
      <td>${h.comentarios || ''}</td>
    </tr>
  `).join('');

  const tablaHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Hojas de Resultados</title>
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
      <h1>Hojas de Resultados - SISTPEC</h1>
      <table>
        <thead>
          <tr>
            <th>Folio</th>
            <th>Caso</th>
            <th>UPP</th>
            <th>MVZ</th>
            <th>Fecha carga</th>
            <th>Archivo</th>
            <th>Comentarios</th>
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
/* Acciones */
.modulo-acciones { margin-bottom: 18px; }
.modulo-acciones-titulo { display:block; font-size:14px; margin-bottom:8px; color:#333; font-weight:600; }
.modulo-acciones-botones { display:flex; flex-wrap:wrap; gap:4px; }
.sistpec-btn-accion { border:none; padding:8px 16px; font-size:12px; font-weight:600; text-transform:uppercase; border-radius:3px; cursor:pointer; background:#2f6b32; color:#fff; letter-spacing:.5px; }
.sistpec-btn-accion.active { background:#244e26; }

.sistpec-info-box { margin-top:10px; padding:10px 14px; border-radius:4px; background:#e1f3e1; border:1px solid #c3e6c3; }
.sistpec-info-text { margin:0; font-size:13px; color:#225522; }

.modulo-contenido { margin-top:10px; }
.subtitulo { font-size:18px; margin:10px 0 15px; color:#333; }
.modulo-header { margin-bottom: 12px; text-align:left; }
.modulo-subtitle { margin:0; font-size:13px; color:#555; }

.modulo-alert { margin-bottom: 12px; padding: 10px 14px; border-radius: 4px; font-size: 13px; }
.modulo-alert--error { background:#fbeaea; border:1px solid #f5c2c2; color:#7a1f1f; }
.modulo-alert--success { background:#e1f3e1; border:1px solid #c3e6c3; color:#225522; }

/* filtros */
.sistpec-search-bar { display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap:12px; margin-bottom:16px; }
.fechas-bar { grid-template-columns: repeat(2, minmax(0, 1fr)); }

.sistpec-form-group { display:flex; flex-direction:column; gap:4px; }
.sistpec-form-group label { font-size:13px; font-weight:600; color:#444; }

.sistpec-form-group input,
.sistpec-form-group textarea,
.sistpec-form-group select {
  padding:8px 10px;
  border-radius:4px;
  border:1px solid #ccc;
  font-size:14px;
  outline:none;
}

.sistpec-form-group input:focus,
.sistpec-form-group textarea:focus,
.sistpec-form-group select:focus {
  border-color:#2f6b32;
  box-shadow:0 0 0 1px rgba(47,107,50,.15);
}

.sistpec-form-group-inline .sistpec-form-inline-inputs { display:flex; align-items:center; gap:6px; }
.vigencia-sep { font-size:14px; color:#666; }

.sistpec-search-actions { display:flex; align-items:flex-end; gap:8px; }
.sistpec-search-actions.right { justify-content:flex-end; }

.sistpec-btn-primary { background:#2f6b32; color:#fff; border:none; padding:8px 18px; border-radius:4px; font-size:13px; font-weight:600; cursor:pointer; }
.sistpec-btn-primary:hover { background:#244e26; }
.sistpec-btn-secondary { background:#e0e0e0; color:#333; border:none; padding:8px 18px; border-radius:4px; font-size:13px; font-weight:600; cursor:pointer; }
.sistpec-btn-secondary:hover { background:#d0d0d0; }
.sistpec-btn-sm { padding:4px 10px; font-size:11px; }

.sistpec-btn-danger { background:#7a061e; color:#fff; border:none; padding:6px 14px; border-radius:4px; font-size:12px; font-weight:600; cursor:pointer; }
.sistpec-btn-danger:hover { background:#5a0416; }

.hint { color:#666; margin-top:6px; }

/* tabla */
.sistpec-table-wrapper { width:100%; overflow-x:auto; }
.sistpec-table { width:100%; border-collapse:collapse; font-size:13px; }
.sistpec-table thead { background:#7a061e; color:#fff; }
.sistpec-table th, .sistpec-table td { padding:8px 10px; border:1px solid #ddd; text-align:left; vertical-align:top; }
.sistpec-table tbody tr:nth-child(even) { background:#fafafa; }
.sin-resultados { text-align:center; color:#777; }

/* comentarios */
.comentarios-cell { min-width: 220px; }
.comentarios-wrap {
  border: 1px solid #e2e2e2;
  background: #ffffff;
  border-radius: 6px;
  padding: 6px 8px;
  line-height: 1.25;
}
.comentarios-text { display:block; color:#333; white-space:pre-wrap; word-break:break-word; }
.comentarios-vacio { color:#888; }

/* modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 999;
}
.modal {
  width: min(520px, 100%);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,.25);
  padding: 16px;
}
.modal-title { margin: 0 0 8px; color:#7a061e; }
.modal-text { margin: 0 0 10px; color:#333; font-size: 13px; }
.modal-actions { display:flex; justify-content:flex-end; gap:8px; }

/* responsive */
@media (max-width: 768px) {
  .sistpec-search-bar { grid-template-columns: 1fr; }
  .fechas-bar { grid-template-columns: 1fr; }
}
</style>
