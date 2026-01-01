<template>
  <section class="modulo-contenido" ref="moduloContenidoRef">
    <header class="modulo-header">
      <h3 class="subtitulo">Consultar</h3>
    </header>

      
    <!-- ALERTA: mínimo un filtro -->
    <div v-if="mostrarAlertaFiltros" class="modulo-alert modulo-alert--error">
      Debe capturar <strong>al menos un criterio de búsqueda</strong> para realizar la consulta.
    </div>

    <!-- ALERTA: sin resultados al buscar -->
    <div v-if="mostrarAlertaSinResultados" class="modulo-alert modulo-alert--error">
      No se encontraron hojas de reporte con los criterios capturados.
    </div>

    <!-- Barra de filtros (fila 1) -->
    <div class="sistpec-search-bar">
      <div class="sistpec-form-group">
        <label>Folio / ID</label>
        <input
          v-model="filtros.folio"
          type="text"
          placeholder="Ej. HR-2025-001"
        />
      </div>

      <div class="sistpec-form-group">
        <label>MVZ</label>
        <input
          v-model="filtros.mvz"
          type="text"
          placeholder="Nombre del MVZ"
        />
      </div>

      <div class="sistpec-form-group">
        <label>UPP</label>
        <input
          v-model="filtros.upp"
          type="text"
          placeholder="Clave o nombre UPP"
        />
      </div>

      <div class="sistpec-form-group">
        <label>Tipo</label>
        <select v-model="filtros.tipo">
          <option value="">Todos</option>
          <option value="Campaña">Campaña</option>
          <option value="Particular">Particular</option>
        </select>
      </div>
    </div>

    <!-- Barra de filtros  -->
    <div class="sistpec-search-bar fechas-bar">
      <div class="sistpec-form-group sistpec-form-group-inline">
        <label>Fecha de reporte</label>
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
          LIMPIAR FILTROS
        </button>
      </div>
    </div>

    <!-- Reportes / Exportación  -->
    <div v-if="buscado" class="reportes-panel">
      <div class="reportes-header">
        <h4 class="subtitulo-secundario">Reporte de coincidencias</h4>

        <div class="reportes-actions">
          <button
            type="button"
            class="sistpec-btn-secondary"
            :disabled="resultadosFiltrados.length === 0"
            @click="exportarCSV"
          >
            EXPORTAR EXCEL
          </button>

          <button
            type="button"
            class="sistpec-btn-secondary"
            :disabled="resultadosFiltrados.length === 0"
            @click="exportarPDF"
          >
            EXPORTAR PDF
          </button>
        </div>
      </div>

      <div class="kpis">
        <div class="kpi">
          <span class="kpi-label">Total coincidencias</span>
          <span class="kpi-value">{{ resultadosFiltrados.length }}</span>
        </div>
        <div class="kpi">
          <span class="kpi-label">Campaña</span>
          <span class="kpi-value">{{ resumen.campana }}</span>
        </div>
        <div class="kpi">
          <span class="kpi-label">Particular</span>
          <span class="kpi-value">{{ resumen.particular }}</span>
        </div>
      </div>
    </div>

    <!-- Tabla de resultados -->
    <div v-if="buscado" class="sistpec-table-wrapper">
      <table class="sistpec-table">
        <thead>
          <tr>
            <th>Folio</th>
            <th>Fecha</th>
            <th>MVZ</th>
            <th>UPP</th>
            <th>Tipo</th>
            <th>Georeferencia</th>
            <th>Observaciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="h in resultadosFiltrados" :key="h.id">
            <td>{{ h.folio }}</td>
            <td>{{ h.fecha }}</td>
            <td>{{ h.mvz }}</td>
            <td>{{ h.upp }}</td>
            <td>
              <span
                class="badge"
                :class="h.tipo === 'Campaña' ? 'badge--activo' : 'badge--proceso'"
              >
                {{ h.tipo }}
              </span>
            </td>
            <td class="mono">
              <span v-if="h.lat && h.lng">{{ h.lat }}, {{ h.lng }}</span>
              <span v-else>-</span>
            </td>
            <td>{{ h.obs || '-' }}</td>
          </tr>

          <tr v-if="resultadosFiltrados.length === 0">
            <td colspan="7" class="sin-resultados">
              No se encontraron hojas de reporte con los criterios capturados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue';

// Scroll al contenido del módulo
const moduloContenidoRef = ref(null);
function scrollAlContenido() {
  nextTick(() => {
    if (!moduloContenidoRef.value) return;
    const offset = 90;
    const top =
      moduloContenidoRef.value.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

// Filtros
const filtros = ref({
  folio: '',
  mvz: '',
  upp: '',
  tipo: '',
  fecha_inicio: '',
  fecha_fin: ''
});

const buscado = ref(false);
const mostrarAlertaFiltros = ref(false);
const mostrarAlertaSinResultados = ref(false);

// DEMO
const demo = ref([
  {
    id: 1,
    folio: 'HR-2025-001',
    fecha: '2025-12-01',
    mvz: 'MVZ Juan Pérez',
    upp: 'UPP-VER-001',
    tipo: 'Campaña',
    lat: '19.543210',
    lng: '-96.910111',
    obs: 'Sin novedades'
  },
  {
    id: 2,
    folio: 'HR-2025-002',
    fecha: '2025-12-03',
    mvz: 'MVZ Ana López',
    upp: 'UPP-VER-014',
    tipo: 'Campaña',
    lat: '19.500010',
    lng: '-96.900020',
    obs: 'Se anexan evidencias'
  },
  {
    id: 3,
    folio: 'HR-2025-010',
    fecha: '2025-12-05',
    mvz: 'MVZ Ana López',
    upp: 'UPP-VER-200',
    tipo: 'Particular',
    lat: '',
    lng: '',
    obs: 'Captura manual'
  }
]);

function hayAlMenosUnFiltro() {
  const f = filtros.value;
  return (
    f.folio.trim() ||
    f.mvz.trim() ||
    f.upp.trim() ||
    f.tipo ||
    f.fecha_inicio ||
    f.fecha_fin
  );
}

function buscar() {
  mostrarAlertaFiltros.value = false;
  mostrarAlertaSinResultados.value = false;

  if (!hayAlMenosUnFiltro()) {
    buscado.value = false;
    mostrarAlertaFiltros.value = true;
    scrollAlContenido();
    return;
  }

  buscado.value = true;

  if (resultadosFiltrados.value.length === 0) {
    mostrarAlertaSinResultados.value = true;
  }

  scrollAlContenido();
}

function limpiar() {
  filtros.value = {
    folio: '',
    mvz: '',
    upp: '',
    tipo: '',
    fecha_inicio: '',
    fecha_fin: ''
  };
  buscado.value = false;
  mostrarAlertaFiltros.value = false;
  mostrarAlertaSinResultados.value = false;
}

const resultadosFiltrados = computed(() => {
  if (!buscado.value) return [];

  const f = filtros.value;
  const folio = f.folio.trim().toLowerCase();
  const mvz = f.mvz.trim().toLowerCase();
  const upp = f.upp.trim().toLowerCase();
  const tipo = f.tipo;
  const fi = f.fecha_inicio;
  const ff = f.fecha_fin;

  return demo.value.filter(h => {
    const okFolio = folio ? h.folio.toLowerCase().includes(folio) : true;
    const okMvz = mvz ? h.mvz.toLowerCase().includes(mvz) : true;
    const okUpp = upp ? h.upp.toLowerCase().includes(upp) : true;
    const okTipo = tipo ? h.tipo === tipo : true;

    let okFecha = true;
    if (fi) okFecha = okFecha && h.fecha >= fi;
    if (ff) okFecha = okFecha && h.fecha <= ff;

    return okFolio && okMvz && okUpp && okTipo && okFecha;
  });
});

const resumen = computed(() => {
  const rows = resultadosFiltrados.value;
  const campana = rows.filter(r => r.tipo === 'Campaña').length;
  const particular = rows.filter(r => r.tipo === 'Particular').length;
  return { campana, particular };
});

// ===============
// Exportar CSV
// ===============
function exportarCSV() {
  const rows = resultadosFiltrados.value;
  if (!rows.length) return;

  const headers = ['Folio', 'Fecha', 'MVZ', 'UPP', 'Tipo', 'Lat', 'Lng', 'Observaciones'];
  const csv = [
    headers.join(','),
    ...rows.map(r => [
      esc(r.folio),
      esc(r.fecha),
      esc(r.mvz),
      esc(r.upp),
      esc(r.tipo),
      esc(r.lat || ''),
      esc(r.lng || ''),
      esc(r.obs || '')
    ].join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_hoja_campo_${hoyISO()}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

function esc(value) {
  const s = String(value ?? '');
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function hoyISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ===============
// Exportar PDF
// ===============
function exportarPDF() {
  const rows = resultadosFiltrados.value;
  if (!rows.length) return;

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Reporte Hoja de Control de Campo</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 18px; color: #111; }
        h1 { font-size: 16px; margin: 0 0 8px 0; }
        p { margin: 0 0 10px 0; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; vertical-align: top; }
        th { background: #7a061e; color: white; }
        .kpis { display: flex; gap: 12px; margin: 10px 0 12px; }
        .kpi { border: 1px solid #ddd; border-radius: 6px; padding: 8px 10px; min-width: 140px; }
        .kpi .l { font-size: 11px; color: #555; }
        .kpi .v { font-size: 14px; font-weight: bold; }
        @media print {
          body { padding: 0; }
          .kpi { page-break-inside: avoid; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      </style>
    </head>
    <body>
      <h1>Reporte - Hojas de Control de Campo</h1>
      <p>Generado: ${new Date().toLocaleString()}</p>

      <div class="kpis">
        <div class="kpi"><div class="l">Total coincidencias</div><div class="v">${rows.length}</div></div>
        <div class="kpi"><div class="l">Campaña</div><div class="v">${resumen.value.campana}</div></div>
        <div class="kpi"><div class="l">Particular</div><div class="v">${resumen.value.particular}</div></div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Folio</th>
            <th>Fecha</th>
            <th>MVZ</th>
            <th>UPP</th>
            <th>Tipo</th>
            <th>Georeferencia</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td>${safe(r.folio)}</td>
              <td>${safe(r.fecha)}</td>
              <td>${safe(r.mvz)}</td>
              <td>${safe(r.upp)}</td>
              <td>${safe(r.tipo)}</td>
              <td>${safe((r.lat && r.lng) ? `${r.lat}, ${r.lng}` : '-')}</td>
              <td>${safe(r.obs || '-')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <script>
        window.onload = () => window.print();
      <\/script>
    </body>
  </html>
  `;

  const w = window.open('', '_blank');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function safe(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
</script>

<style scoped>
.modulo-header { margin-bottom: 12px; text-align: left; }
.modulo-subtitle { margin: 0; font-size: 13px; color: #555; }
.subtitulo { font-size: 18px; margin: 10px 0 8px; color: #333; }
.subtitulo-secundario { font-size: 16px; margin: 0; color: #333; }

.modulo-alert { margin: 10px 0 14px; padding: 10px 14px; border-radius: 4px; font-size: 13px; }
.modulo-alert--error { background: #fbeaea; border: 1px solid #f5c2c2; color: #7a1f1f; }

.sistpec-search-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.fechas-bar { grid-template-columns: repeat(2, minmax(0, 1fr)); }

.sistpec-form-group { display: flex; flex-direction: column; gap: 4px; }
.sistpec-form-group label { font-size: 13px; font-weight: 600; color: #444; }

.sistpec-form-group input,
.sistpec-form-group select {
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
  outline: none;
}

.sistpec-form-group input:focus,
.sistpec-form-group select:focus {
  border-color: #2f6b32;
  box-shadow: 0 0 0 1px rgba(47, 107, 50, 0.15);
}

.sistpec-form-group-inline .sistpec-form-inline-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
}
.vigencia-sep { font-size: 14px; color: #666; }

.sistpec-search-actions {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 8px;
}

.sistpec-btn-primary {
  background: #2f6b32; color: #fff; border: none;
  padding: 8px 18px; border-radius: 4px;
  font-size: 13px; font-weight: 600; cursor: pointer;
}
.sistpec-btn-primary:hover { background: #244e26; }

.sistpec-btn-secondary {
  background: #e0e0e0; color: #333; border: none;
  padding: 8px 18px; border-radius: 4px;
  font-size: 13px; font-weight: 600; cursor: pointer;
}
.sistpec-btn-secondary:hover { background: #d0d0d0; }
.sistpec-btn-secondary:disabled { opacity: 0.55; cursor: default; }

.reportes-panel {
  margin: 6px 0 14px;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
}

.reportes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.reportes-actions { display: flex; gap: 8px; }

.kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.kpi { border: 1px solid #eee; border-radius: 10px; padding: 10px 12px; background: #fafafa; }
.kpi-label { display: block; font-size: 12px; color: #666; }
.kpi-value { display: block; font-size: 18px; font-weight: 700; color: #222; }

.sistpec-table-wrapper { width: 100%; overflow-x: auto; }
.sistpec-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.sistpec-table thead { background: #7a061e; color: #fff; }
.sistpec-table th, .sistpec-table td { padding: 8px 10px; border: 1px solid #ddd; text-align: left; }
.sistpec-table tbody tr:nth-child(even) { background: #fafafa; }
.sin-resultados { text-align: center; color: #777; }

.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

.badge {
  display: inline-block; padding: 2px 8px; border-radius: 10px;
  font-size: 11px; font-weight: 600;
}
.badge--activo { background: #e1f3e1; color: #225522; }
.badge--proceso { background: #fff4e5; color: #b26a00; }

@media (max-width: 768px) {
  .sistpec-search-bar { grid-template-columns: 1fr; }
  .fechas-bar { grid-template-columns: 1fr; }
  .kpis { grid-template-columns: 1fr; }
  .reportes-header { flex-direction: column; align-items: flex-start; }
  .sistpec-search-actions { justify-content: flex-start; }
}
</style>
