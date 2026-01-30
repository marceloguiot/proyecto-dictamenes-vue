<template>
  <section>
    <header class="modulo-header">
      <h3 class="subtitulo">Consultar</h3>
      <p class="modulo-subtitle">
        Consulta hojas de reporte. Capture al menos un criterio de búsqueda.
      </p>
    </header>

    <div v-if="mostrarAlerta" class="modulo-alert modulo-alert--error">
      Debe capturar <strong>al menos un criterio de búsqueda</strong> para realizar la consulta.
    </div>

    <div v-if="errorCarga" class="modulo-alert modulo-alert--error">
      {{ errorCarga }}
    </div>

    <div class="sistpec-search-bar">
      <div class="sistpec-form-group">
        <label>Folio / ID</label>
        <input v-model="filtros.folio" type="text" placeholder="Ej. HR-2025-001" />
      </div>

      <div class="sistpec-form-group">
        <label>MVZ</label>
        <input v-model="filtros.mvz" type="text" placeholder="Nombre del MVZ" />
      </div>

      <div class="sistpec-form-group">
        <label>Fecha de reporte</label>
        <input v-model="filtros.fecha" type="date" />
      </div>

      <div class="sistpec-form-group sistpec-search-actions">
        <button type="button" class="sistpec-btn-primary" @click="buscar" :disabled="cargando">
          {{ cargando ? 'BUSCANDO...' : 'BUSCAR' }}
        </button>
        <button type="button" class="sistpec-btn-secondary" @click="limpiar" :disabled="cargando">LIMPIAR FILTROS</button>
      </div>
    </div>

    <!-- Botones de descarga -->
    <div v-if="resultadosFiltrados.length > 0" class="sistpec-export-actions">
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
            <th>Fecha</th>
            <th>MVZ</th>
            <th>Periodo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in resultadosFiltrados" :key="h.id">
            <td>{{ h.folio }}</td>
            <td>{{ h.fecha }}</td>
            <td>{{ h.mvz }}</td>
            <td>{{ h.periodo_inicio }} - {{ h.periodo_fin }}</td>
          </tr>

          <tr v-if="resultadosFiltrados.length === 0">
            <td colspan="4" class="sin-resultados">
              No se encontraron hojas de reporte con los criterios capturados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { hojaReporteService } from '@/services/api';

const filtros = ref({
  folio: '',
  mvz: '',
  fecha: ''
});

const buscado = ref(false);
const mostrarAlerta = ref(false);
const cargando = ref(false);
const errorCarga = ref('');
const hojasReporte = ref([]);

function hayAlMenosUnFiltro() {
  const f = filtros.value;
  return f.folio.trim() || f.mvz.trim() || f.fecha;
}

async function buscar() {
  mostrarAlerta.value = false;
  errorCarga.value = '';

  if (!hayAlMenosUnFiltro()) {
    buscado.value = false;
    mostrarAlerta.value = true;
    return;
  }

  cargando.value = true;

  try {
    const params = {};
    if (filtros.value.folio.trim()) params.folio = filtros.value.folio.trim();
    if (filtros.value.mvz.trim()) params.mvz = filtros.value.mvz.trim();
    if (filtros.value.fecha) params.fecha = filtros.value.fecha;

    const response = await hojaReporteService.consultar(params);
    hojasReporte.value = response.data || [];
    buscado.value = true;
  } catch (error) {
    console.error('Error al consultar hojas de reporte:', error);
    errorCarga.value = 'Error al consultar hojas de reporte del servidor. Verifique su conexión.';
    hojasReporte.value = [];
    buscado.value = false;
  } finally {
    cargando.value = false;
  }
}

function limpiar() {
  filtros.value = { folio: '', mvz: '', fecha: '' };
  buscado.value = false;
  mostrarAlerta.value = false;
  errorCarga.value = '';
  hojasReporte.value = [];
}

const resultadosFiltrados = computed(() => {
  if (!buscado.value) return [];
  return hojasReporte.value;
});

function descargarExcel() {
  const datos = resultadosFiltrados.value;
  if (datos.length === 0) return;

  const encabezados = ['Folio', 'Fecha', 'MVZ', 'Periodo'];
  const filas = datos.map(h => [
    h.folio || '',
    h.fecha || '',
    h.mvz || '',
    `${h.periodo_inicio || ''} - ${h.periodo_fin || ''}`
  ]);

  const bom = '\uFEFF';
  const csv = [encabezados, ...filas]
    .map(fila => fila.map(celda => `"${String(celda).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hojas_reporte_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function descargarPDF() {
  const datos = resultadosFiltrados.value;
  if (datos.length === 0) return;

  const filasHTML = datos.map(h => `
    <tr>
      <td>${h.folio || ''}</td>
      <td>${h.fecha || ''}</td>
      <td>${h.mvz || ''}</td>
      <td>${h.periodo_inicio || ''} - ${h.periodo_fin || ''}</td>
    </tr>
  `).join('');

  const tablaHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Hojas de Reporte</title>
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
      <h1>Hojas de Reporte - SISTPEC</h1>
      <table>
        <thead>
          <tr>
            <th>Folio</th>
            <th>Fecha</th>
            <th>MVZ</th>
            <th>Periodo</th>
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
.modulo-header { 
  margin-bottom: 12px; 
  text-align:left; 
}
.modulo-subtitle { 
  margin:0; font-size:13px; 
  color:#555; 
}
.subtitulo { 
  font-size:18px; 
  margin:10px 0 8px; 
  color:#333; 
}

.modulo-alert { 
  margin: 10px 0 14px; padding: 10px 14px;
  border-radius: 4px; font-size: 13px; 
}
.modulo-alert--error { 
  background:#fbeaea; 
  border:1px solid #f5c2c2; 
  color:#7a1f1f; 
}

.sistpec-search-bar { 
  display:grid; 
  grid-template-columns: repeat(4, minmax(0, 1fr)); 
  gap:12px; margin-bottom:16px; 
}
.sistpec-form-group { 
  display:flex; flex-direction:column; 
  gap:4px; 
}
.sistpec-form-group label { 
  font-size:13px; font-weight:600; 
  color:#444; 
}
.sistpec-form-group input { 
  padding:8px 10px; border-radius:4px; 
  border:1px solid #ccc; font-size:14px; 
  outline:none; 
}

.sistpec-search-actions {
  grid-column: 1 / -1;          
  display: flex;
  justify-content: flex-end;    
  align-items: flex-end;
  gap: 8px;
}

.sistpec-btn-primary { 
  background:#2f6b32; color:#fff;
  border:none; padding:8px 18px; 
  border-radius:4px; font-size:13px; 
  font-weight:600; cursor:pointer; 
}
.sistpec-btn-primary:hover { 
  background:#244e26; 
}
.sistpec-btn-secondary { 
  background:#e0e0e0; color:#333; 
  border:none; padding:8px 18px; 
  border-radius:4px; font-size:13px; 
  font-weight:600; cursor:pointer; 
}
.sistpec-btn-secondary:hover { 
  background:#d0d0d0; 
}

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

@media (max-width:768px){
  .sistpec-search-bar {
    grid-template-columns: 1fr;
  }
}
</style>
