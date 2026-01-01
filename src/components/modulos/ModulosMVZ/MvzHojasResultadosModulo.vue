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

    <!-- ====================== CONSULTAR RESULTADOS (PDF) ====================== -->
    <div v-if="selectedAction === 'consultar'">
      <h3 class="subtitulo">Consultar</h3>

      <div v-if="mostrarAlerta" class="modulo-alert modulo-alert--error">
        Debe capturar <strong>al menos un criterio</strong> para buscar.
      </div>

      <!-- filtros -->
      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input v-model="filtros.numero_caso" type="text" placeholder="Ej. BR25-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Folio hoja control campo</label>
          <input v-model="filtros.folio_hoja" type="text" placeholder="Ej. HCC-2025-020" />
        </div>

        <div class="sistpec-form-group">
          <label>UPP</label>
          <input v-model="filtros.upp" type="text" placeholder="Ej. 30-025-2000-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Estatus del resultado</label>
          <select v-model="filtros.estatus_resultado">
            <option value="">Todos</option>
            <option value="Emitido">Emitido</option>
            <option value="Reemitido">Reemitido</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div class="sistpec-search-bar fechas-bar">
        <div class="sistpec-form-group sistpec-form-group-inline">
          <label>Fecha de emisión</label>
          <div class="sistpec-form-inline-inputs">
            <input v-model="filtros.fecha_inicio" type="date" />
            <span class="vigencia-sep">a</span>
            <input v-model="filtros.fecha_fin" type="date" />
          </div>
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscar">
            BUSCAR
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiar">
            LIMPIAR
          </button>
        </div>
      </div>

      <!-- resultados -->
      <div v-if="buscado" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Número de caso</th>
              <th>Folio hoja</th>
              <th>Fecha emisión</th>
              <th>UPP</th>
              <th>Especie</th>
              <th>Total muestras</th>
              <th>Estatus</th>
              <th>PDF</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="r in resultadosFiltrados" :key="r.id">
              <td><strong>{{ r.numero_caso }}</strong></td>
              <td>{{ r.folio_hoja }}</td>
              <td>{{ r.fecha_emision }}</td>
              <td>{{ r.upp }}</td>
              <td>{{ r.especie }}</td>
              <td>{{ r.total_muestras }}</td>
              <td>
                <span class="badge" :class="badgeEstatusResultado(r.estatus_resultado)">
                  {{ r.estatus_resultado }}
                </span>
              </td>
              <td>
                <span class="pdf-pill">{{ r.pdf_nombre || 'resultado.pdf' }}</span>
              </td>
              <td>
                <div class="acciones">
                  <button type="button" class="sistpec-btn-secondary sistpec-btn-sm" @click="verDetalle(r)">
                    VER
                  </button>
                  <button type="button" class="sistpec-btn-primary sistpec-btn-sm" @click="abrirPdf(r)">
                    ABRIR PDF
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="resultadosFiltrados.length === 0">
              <td colspan="9" class="sin-resultados">
                No se encontraron hojas de resultados con esos criterios.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- detalle -->
      <div v-if="detalle" class="sistpec-edit-panel">
        <h4 class="subtitulo-secundario">Detalle: {{ detalle.numero_caso }}</h4>

        <div class="detalle-grid">
          <div><span class="lbl">Folio hoja:</span> {{ detalle.folio_hoja }}</div>
          <div><span class="lbl">Fecha emisión:</span> {{ detalle.fecha_emision }}</div>
          <div><span class="lbl">UPP:</span> {{ detalle.upp }}</div>
          <div><span class="lbl">Especie:</span> {{ detalle.especie }}</div>
          <div><span class="lbl">Total muestras:</span> {{ detalle.total_muestras }}</div>
          <div>
            <span class="lbl">Estatus:</span>
            <span class="badge" :class="badgeEstatusResultado(detalle.estatus_resultado)">
              {{ detalle.estatus_resultado }}
            </span>
          </div>
          <div style="grid-column: span 2;">
            <span class="lbl">Archivo PDF:</span> {{ detalle.pdf_nombre || 'resultado.pdf' }}
          </div>
          <div style="grid-column: span 2;">
            <span class="lbl">Notas:</span> {{ detalle.notas || '-' }}
          </div>
        </div>

        <div class="sistpec-form-actions">
          <button type="button" class="sistpec-btn-secondary" @click="detalle = null">CERRAR</button>
        </div>
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
import { computed, nextTick, ref, watch } from 'vue';

defineProps({
  codigo: { type: String, required: false, default: '' },
  rol: { type: String, required: false, default: 'MVZ' }
});

/* ===================== Scroll ===================== */
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

/* ===================== Acciones ===================== */
const acciones = [{ id: 'consultar', label: 'CONSULTAR' }];
const selectedAction = ref('consultar');

const errores = ref([]);
const mensajeExito = ref('');

function cambiarAccion(id) {
  selectedAction.value = id;
  scrollAlContenido();
}

const descripcionAccionActual = computed(() => {
  if (selectedAction.value === 'consultar') {
    return 'Consulte y abra en PDF los resultados emitidos por laboratorio para sus casos.';
  }
  return '';
});

watch(
  () => selectedAction.value,
  () => {
    errores.value = [];
    mensajeExito.value = '';
  }
);

/* ===================== DEMO: MVZ actual ===================== */
const mvzUserId = 10;

/* ===================== DEMO DATA ===================== */
/**
 * En producción, esto vendría del backend:
 * - resultados vinculados al mvz (por hojas/casos del mvz)
 * - url_pdf real (S3, servidor, etc.)
 */
const resultadosDemo = ref([
  {
    id: 7001,
    mvz_user_id: 10,
    numero_caso: 'BR25-001',
    folio_hoja: 'HCC-2025-020',
    fecha_emision: '2025-12-16',
    upp: '30-025-2000-001',
    especie: 'Bovino',
    total_muestras: 1,
    estatus_resultado: 'Emitido',
    pdf_nombre: 'BR25-001_resultados.pdf',
    url_pdf: 'https://example.com/BR25-001_resultados.pdf',
    notas: ''
  },
  {
    id: 7002,
    mvz_user_id: 10,
    numero_caso: 'BR25-002',
    folio_hoja: 'HCC-2025-021',
    fecha_emision: '2025-12-17',
    upp: '30-025-2000-001',
    especie: 'Bovino',
    total_muestras: 4,
    estatus_resultado: 'Emitido',
    pdf_nombre: 'BR25-002_resultados.pdf',
    url_pdf: 'https://example.com/BR25-002_resultados.pdf',
    notas: 'Resultados preliminares.'
  },
  {
    id: 7003,
    mvz_user_id: 99,
    numero_caso: 'BR25-999',
    folio_hoja: 'HCC-2025-999',
    fecha_emision: '2025-12-17',
    upp: 'XX-XXX-XXXX-XXX',
    especie: 'Bovino',
    total_muestras: 2,
    estatus_resultado: 'Emitido',
    pdf_nombre: 'AJENO.pdf',
    url_pdf: 'https://example.com/AJENO.pdf',
    notas: ''
  }
]);

/* ===================== Consultar ===================== */
const filtros = ref({
  numero_caso: '',
  folio_hoja: '',
  upp: '',
  estatus_resultado: '',
  fecha_inicio: '',
  fecha_fin: ''
});

const buscado = ref(false);
const mostrarAlerta = ref(false);
const detalle = ref(null);

function hayAlMenosUnFiltro() {
  const f = filtros.value;
  return (
    f.numero_caso.trim() ||
    f.folio_hoja.trim() ||
    f.upp.trim() ||
    f.estatus_resultado ||
    f.fecha_inicio ||
    f.fecha_fin
  );
}

function buscar() {
  errores.value = [];
  mensajeExito.value = '';
  detalle.value = null;

  mostrarAlerta.value = false;
  if (!hayAlMenosUnFiltro()) {
    buscado.value = false;
    mostrarAlerta.value = true;
    return;
  }
  buscado.value = true;
}

function limpiar() {
  filtros.value = { numero_caso: '', folio_hoja: '', upp: '', estatus_resultado: '', fecha_inicio: '', fecha_fin: '' };
  buscado.value = false;
  mostrarAlerta.value = false;
  detalle.value = null;
  errores.value = [];
  mensajeExito.value = '';
}

const resultadosFiltrados = computed(() => {
  if (!buscado.value) return [];

  const f = filtros.value;
  const num = f.numero_caso.trim().toLowerCase();
  const fol = f.folio_hoja.trim().toLowerCase();
  const upp = f.upp.trim().toLowerCase();
  const est = f.estatus_resultado;
  const ini = f.fecha_inicio;
  const fin = f.fecha_fin;

  return resultadosDemo.value
    .filter(r => r.mvz_user_id === mvzUserId)
    .filter(r => (num ? String(r.numero_caso || '').toLowerCase().includes(num) : true))
    .filter(r => (fol ? String(r.folio_hoja || '').toLowerCase().includes(fol) : true))
    .filter(r => (upp ? String(r.upp || '').toLowerCase().includes(upp) : true))
    .filter(r => (est ? r.estatus_resultado === est : true))
    .filter(r => {
      let ok = true;
      if (ini) ok = ok && r.fecha_emision >= ini;
      if (fin) ok = ok && r.fecha_emision <= fin;
      return ok;
    });
});

function verDetalle(r) {
  detalle.value = JSON.parse(JSON.stringify(r));
}

/**
 * IMPORTANTE:
 *   En producción:
 * - podría ser una ruta interna: /api/resultados/:id/pdf (con auth)
 * - o un blob/base64 (descarga segura)
 */
function abrirPdf(r) {
  errores.value = [];
  if (!r.url_pdf) {
    errores.value.push('No hay URL de PDF disponible para este resultado.');
    return;
  }
  window.open(r.url_pdf, '_blank', 'noopener,noreferrer');
}

/* ===================== UI helpers ===================== */
function badgeEstatusResultado(estatus) {
  if (estatus === 'Emitido') return 'badge--activo';
  if (estatus === 'Reemitido') return 'badge--proceso';
  if (estatus === 'Cancelado') return 'badge--inactivo';
  return 'badge--proceso';
}
</script>

<style scoped>
/* Header acciones */
.modulo-acciones { margin-bottom: 20px; }
.modulo-acciones-titulo { display:block; font-size:14px; margin-bottom:8px; color:#333; font-weight:900; }
.modulo-acciones-botones { display:flex; flex-wrap:wrap; gap:6px; }

/* Botones */
.sistpec-btn-accion{
  border:none; padding:8px 14px; font-size:12px; font-weight:900;
  text-transform:uppercase; border-radius:4px; cursor:pointer;
  background:#2f6b32; color:#fff; letter-spacing:0.4px;
}
.sistpec-btn-accion.active{ background:#244e26; }

.modulo-contenido { margin-top: 10px; }
.subtitulo { font-size:18px; margin:10px 0 15px; color:#333; }
.subtitulo-secundario { font-size:16px; margin:16px 0 10px; color:#333; }

/* Info */
.sistpec-info-box{
  margin-top:10px; padding:10px 14px; border-radius:4px;
  background:#e1f3e1; border:1px solid #c3e6c3;
}
.sistpec-info-text{ margin:0; font-size:13px; color:#225522; }

/* Alertas */
.modulo-alert{ margin-bottom:12px; padding:10px 14px; border-radius:4px; font-size:13px; }
.modulo-alert--error{ background:#fbeaea; border:1px solid #f5c2c2; color:#7a1f1f; }
.modulo-alert--success{ background:#e1f3e1; border:1px solid #c3e6c3; color:#225522; }

/* filtros grid */
.sistpec-search-bar{
  display:grid; grid-template-columns: repeat(4, minmax(0, 1fr));
  gap:12px; margin-bottom:16px;
}
.fechas-bar{ grid-template-columns: repeat(2, minmax(0, 1fr)); }

.sistpec-form-group{ display:flex; flex-direction:column; gap:4px; }
.sistpec-form-group label{ font-size:13px; font-weight:900; color:#444; }
.sistpec-form-group input,
.sistpec-form-group select{
  padding:8px 10px; border-radius:4px; border:1px solid #ccc;
  font-size:14px; outline:none;
}
.sistpec-form-group input:focus,
.sistpec-form-group select:focus{
  border-color:#2f6b32;
  box-shadow:0 0 0 1px rgba(47, 107, 50, 0.15);
}

.sistpec-search-actions{
  display:flex; align-items:flex-end; gap:8px; justify-content:flex-end;
}

/* botones */
.sistpec-btn-primary{
  background:#2f6b32; color:#fff; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:900; cursor:pointer;
}
.sistpec-btn-primary:hover{ background:#244e26; }

.sistpec-btn-secondary{
  background:#e0e0e0; color:#333; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:900; cursor:pointer;
}
.sistpec-btn-secondary:hover{ background:#d0d0d0; }

.sistpec-btn-sm{ padding:5px 10px; font-size:11px; }

/* tabla */
.sistpec-table-wrapper{ width:100%; overflow-x:auto; }
.sistpec-table{ width:100%; border-collapse:collapse; font-size:13px; }
.sistpec-table thead{ background:#7a061e; color:#fff; }
.sistpec-table th, .sistpec-table td{ padding:8px 10px; border:1px solid #ddd; text-align:left; }
.sistpec-table tbody tr:nth-child(even){ background:#fafafa; }
.sin-resultados{ text-align:center; color:#777; }

.sistpec-edit-panel{
  margin-top:20px; padding-top:10px; border-top:1px dashed #ccc;
}

/* badges */
.badge{ display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:900; }
.badge--activo{ background:#e1f3e1; color:#225522; border:1px solid #c3e6c3; }
.badge--inactivo{ background:#fbeaea; color:#7a1f1f; border:1px solid #f5c2c2; }
.badge--proceso{ background:#fff4e5; color:#b26a00; border:1px solid #ffd7a3; }

.detalle-grid{
  display:grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap:8px 12px;
  font-size:13px;
}
.lbl{ font-weight:900; color:#444; }

.vigencia-sep{ font-size:14px; color:#666; }

.sistpec-form-actions{
  display:flex; justify-content:flex-end; gap:8px;
}

.acciones{ display:flex; gap:6px; flex-wrap:wrap; }

.pdf-pill{
  display:inline-block;
  padding:2px 8px;
  border-radius:999px;
  font-size:11px;
  font-weight:900;
  background:#f0f0f0;
  border:1px solid #ddd;
  color:#333;
}

/* responsive */
@media (max-width: 768px) {
  .sistpec-search-bar { grid-template-columns: 1fr; }
  .fechas-bar { grid-template-columns: 1fr; }
  .detalle-grid { grid-template-columns: 1fr; }
}
</style>
