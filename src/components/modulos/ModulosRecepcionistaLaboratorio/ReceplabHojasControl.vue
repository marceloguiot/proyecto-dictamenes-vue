<template>
  <section class="modulo-acciones">
    <span class="modulo-acciones-titulo">Administrar Hojas de Reporte / Control de Campo</span>

    <div class="sistpec-info-box">
      <p class="sistpec-info-text">
        Módulo de <strong>consulta</strong>. Permite buscar hojas de control de campo y visualizar/descargar su PDF asociado.
      </p>
    </div>
  </section>

  <section class="modulo-contenido">
    <!-- ALERTAS -->
    <div v-if="errores.length" class="modulo-alert modulo-alert--error">
      <ul>
        <li v-for="(e, i) in errores" :key="i">{{ e }}</li>
      </ul>
    </div>

    <div v-if="mensajeExito" class="modulo-alert modulo-alert--success">
      {{ mensajeExito }}
    </div>

    <h3 class="subtitulo">Consultar hojas</h3>

    <!-- FILTROS -->
    <div class="sistpec-search-bar">
      <div class="sistpec-form-group">
        <label>Folio hoja</label>
        <input v-model="filtros.folio_hoja" type="text" placeholder="Ej. HCC-2025-010" />
      </div>

      <div class="sistpec-form-group">
        <label>UPP</label>
        <input v-model="filtros.upp" type="text" placeholder="Ej. VER-0001-2025" />
      </div>

      <div class="sistpec-form-group">
        <label>MVZ</label>
        <input v-model="filtros.mvz" type="text" placeholder="Nombre del MVZ" />
      </div>

      <div class="sistpec-form-group">
        <label>Especie</label>
        <select v-model="filtros.especie">
          <option value="">Todas</option>
          <option>Bovino</option>
          <option>Caprino</option>
          <option>Ovino</option>
          <option>Porcino</option>
          <option>Otro</option>
        </select>
      </div>
    </div>

    <div class="sistpec-search-bar fechas-bar">
      <div class="sistpec-form-group">
        <label>Estatus</label>
        <select v-model="filtros.estatus">
          <option value="">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Recepcionada">Recepcionada</option>
          <option value="Concluida">Concluida</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>

      <div class="sistpec-form-group sistpec-form-group-inline">
        <label>Fecha de captura</label>
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

    <!-- Botones de descarga -->
    <div v-if="hojasFiltradas.length > 0" class="sistpec-export-actions">
      <button type="button" class="sistpec-btn-export sistpec-btn-excel" @click="descargarExcel">
        DESCARGAR EXCEL
      </button>
      <button type="button" class="sistpec-btn-export sistpec-btn-pdf" @click="descargarPdfTabla">
        DESCARGAR PDF
      </button>
    </div>

    <!-- RESULTADOS -->
    <div v-if="buscado" class="sistpec-table-wrapper">
      <table class="sistpec-table">
        <thead>
          <tr>
            <th>Folio hoja</th>
            <th>Fecha</th>
            <th>MVZ</th>
            <th>UPP</th>
            <th>Especie</th>
            <th>Total muestras</th>
            <th>Estatus</th>
            <th>PDF</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="h in hojasFiltradas" :key="h.id">
            <td>{{ h.folio_hoja }}</td>
            <td>{{ h.fecha }}</td>
            <td>{{ h.mvz }}</td>
            <td>{{ h.upp }}</td>
            <td>{{ h.especie }}</td>
            <td>{{ h.total_muestras }}</td>
            <td>
              <span class="badge" :class="badgeClase(h.estatus)">
                {{ h.estatus }}
              </span>
            </td>
            <td>
              <div class="acciones-pdf">
                <button
                  type="button"
                  class="sistpec-btn-secondary sistpec-btn-sm"
                  :disabled="!h.pdf_url"
                  @click="verPdf(h)"
                >
                  VER
                </button>

                <button
                  type="button"
                  class="sistpec-btn-primary sistpec-btn-sm"
                  :disabled="!h.pdf_url"
                  @click="descargarPdf(h)"
                >
                  DESCARGAR
                </button>
              </div>

              <div v-if="!h.pdf_url" class="nota-pdf">
                Sin PDF
              </div>
            </td>
          </tr>

          <tr v-if="hojasFiltradas.length === 0">
            <td colspan="8" class="sin-resultados">
              No se encontraron hojas con esos criterios.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

defineProps({
  codigo: { type: String, required: false, default: '' },
  rol: { type: String, required: false, default: '' }
});

const errores = ref([]);
const mensajeExito = ref('');
const buscado = ref(false);

const filtros = ref({
  folio_hoja: '',
  upp: '',
  mvz: '',
  especie: '',
  estatus: '',
  fecha_inicio: '',
  fecha_fin: ''
});

/** ===================== DEMO DATA =====================
 * Reemplaza esto con la llamada al backend.
 * pdf_url puede ser: /uploads/hojas/HCC-2025-010.pdf o una URL absoluta.
 */
const hojasDemo = ref([
  {
    id: 1,
    folio_hoja: 'HCC-2025-010',
    fecha: '2025-12-14',
    mvz: 'MVZ Juan Pérez',
    upp: 'VER-0001-2025',
    especie: 'Bovino',
    total_muestras: 3,
    estatus: 'Recepcionada',
    pdf_url: '/pdfs/HCC-2025-010.pdf'
  },
  {
    id: 2,
    folio_hoja: 'HCC-2025-011',
    fecha: '2025-12-15',
    mvz: 'MVZ Ana López',
    upp: 'VER-0020-2025',
    especie: 'Bovino',
    total_muestras: 2,
    estatus: 'Pendiente',
    pdf_url: null
  },
  {
    id: 3,
    folio_hoja: 'HCC-2025-012',
    fecha: '2025-12-16',
    mvz: 'MVZ Carlos Torres',
    upp: 'VER-0100-2025',
    especie: 'Caprino',
    total_muestras: 5,
    estatus: 'Concluida',
    pdf_url: '/pdfs/HCC-2025-012.pdf'
  }
]);

function buscar() {
  errores.value = [];
  mensajeExito.value = '';
  buscado.value = true;
}

function limpiar() {
  filtros.value = {
    folio_hoja: '',
    upp: '',
    mvz: '',
    especie: '',
    estatus: '',
    fecha_inicio: '',
    fecha_fin: ''
  };
  buscado.value = false;
  errores.value = [];
  mensajeExito.value = '';
}

const hojasFiltradas = computed(() => {
  if (!buscado.value) return [];

  const f = filtros.value;
  const folio = f.folio_hoja.trim().toLowerCase();
  const upp = f.upp.trim().toLowerCase();
  const mvz = f.mvz.trim().toLowerCase();
  const especie = f.especie;
  const estatus = f.estatus;
  const ini = f.fecha_inicio;
  const fin = f.fecha_fin;

  return hojasDemo.value.filter(h => {
    const okFolio = folio ? (h.folio_hoja || '').toLowerCase().includes(folio) : true;
    const okUpp = upp ? (h.upp || '').toLowerCase().includes(upp) : true;
    const okMvz = mvz ? (h.mvz || '').toLowerCase().includes(mvz) : true;
    const okEspecie = especie ? h.especie === especie : true;
    const okEstatus = estatus ? h.estatus === estatus : true;

    let okFecha = true;
    if (ini) okFecha = okFecha && h.fecha >= ini;
    if (fin) okFecha = okFecha && h.fecha <= fin;

    return okFolio && okUpp && okMvz && okEspecie && okEstatus && okFecha;
  });
});

function verPdf(h) {
  if (!h?.pdf_url) return;
  window.open(h.pdf_url, '_blank', 'noopener,noreferrer');
}

function descargarPdf(h) {
  if (!h?.pdf_url) return;
  // Forzar descarga sin navegar fuera
  const a = document.createElement('a');
  a.href = h.pdf_url;
  a.download = `${h.folio_hoja || 'hoja-control'}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function badgeClase(estatus) {
  if (estatus === 'Concluida') return 'badge--activo';
  if (estatus === 'Cancelada') return 'badge--inactivo';
  if (estatus === 'Pendiente') return 'badge--proceso';
  return 'badge--proceso';
}

/* ===================== Descargar Excel / PDF ===================== */
function descargarExcel() {
  const datos = hojasFiltradas.value;
  if (datos.length === 0) return;

  const encabezados = ['Folio hoja', 'Fecha', 'MVZ', 'UPP', 'Especie', 'Total muestras', 'Estatus'];
  const filas = datos.map(h => [
    h.folio_hoja || '',
    h.fecha || '',
    h.mvz || '',
    h.upp || '',
    h.especie || '',
    h.total_muestras || '',
    h.estatus || ''
  ]);

  const bom = '\uFEFF';
  const csv = [encabezados, ...filas]
    .map(fila => fila.map(celda => `"${String(celda).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hojas_control_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function descargarPdfTabla() {
  const datos = hojasFiltradas.value;
  if (datos.length === 0) return;

  const filasHTML = datos.map(h => {
    let badgeClass = 'proceso';
    if (h.estatus === 'Concluida') badgeClass = 'activo';
    else if (h.estatus === 'Cancelada') badgeClass = 'inactivo';

    return `
    <tr>
      <td>${h.folio_hoja || ''}</td>
      <td>${h.fecha || ''}</td>
      <td>${h.mvz || ''}</td>
      <td>${h.upp || ''}</td>
      <td>${h.especie || ''}</td>
      <td>${h.total_muestras || ''}</td>
      <td><span class="badge ${badgeClass}">${h.estatus || ''}</span></td>
    </tr>
  `;
  }).join('');

  const tablaHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Hojas de Control de Campo</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background-color: #7a061e; color: #fff; padding: 8px; text-align: left; }
        td { padding: 8px; border: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #fafafa; }
        .badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
        .activo { background: #e1f3e1; color: #225522; }
        .inactivo { background: #fbeaea; color: #7a1f1f; }
        .proceso { background: #fff4e5; color: #b26a00; }
        @media print {
          body { padding: 0; }
          @page { margin: 1cm; }
        }
      </style>
    </head>
    <body>
      <h1>Hojas de Control de Campo - SISTPEC</h1>
      <table>
        <thead>
          <tr>
            <th>Folio hoja</th>
            <th>Fecha</th>
            <th>MVZ</th>
            <th>UPP</th>
            <th>Especie</th>
            <th>Total muestras</th>
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
/* Encabezado */
.modulo-acciones { margin-bottom: 14px; }
.modulo-acciones-titulo { display:block; font-size:15px; margin-bottom:8px; color:#333; font-weight:700; }
.modulo-contenido { margin-top: 10px; }

.subtitulo { font-size:18px; margin:10px 0 15px; color:#333; }

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

/* Form / filtros */
.sistpec-form-group{ display:flex; flex-direction:column; gap:4px; }
.sistpec-form-group label{ font-size:13px; font-weight:600; color:#444; }
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

.sistpec-form-group-inline .sistpec-form-inline-inputs{
  display:flex; align-items:center; gap:6px;
}
.vigencia-sep{ font-size:14px; color:#666; }

/* filtros grid */
.sistpec-search-bar{
  display:grid; grid-template-columns: repeat(4, minmax(0, 1fr));
  gap:12px; margin-bottom:16px;
}
/* filtros grid */
.sistpec-search-bar{
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap:12px;
  margin-bottom:16px;
  align-items:end;
}

/* esta barra es de 2 columnas */
.fechas-bar{
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items:end;
}

/* BOTONES: derecha + abajo + en columna */
.sistpec-search-actions{
  grid-column: 2 / 3;       
  justify-self: end;        
  align-self: end;          
  margin-top: 14px;        

  display:flex;
  flex-direction: column;   
  gap: 10px;                
}

/* ancho uniforme */
.sistpec-search-actions .sistpec-btn-primary,
.sistpec-search-actions .sistpec-btn-secondary{
  width: 220px;            
}


/* botones */
.sistpec-btn-primary{
  background:#2f6b32; color:#fff; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:700; cursor:pointer;
}
.sistpec-btn-primary:hover{ background:#244e26; }

.sistpec-btn-secondary{
  background:#e0e0e0; color:#333; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:700; cursor:pointer;
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

/* badges */
.badge{ display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700; }
.badge--activo{ background:#e1f3e1; color:#225522; border:1px solid #c3e6c3; }
.badge--inactivo{ background:#fbeaea; color:#7a1f1f; border:1px solid #f5c2c2; }
.badge--proceso{ background:#fff4e5; color:#b26a00; border:1px solid #ffd7a3; }

.acciones-pdf { display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
.nota-pdf { margin-top: 4px; font-size: 11px; color: #999; }

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
</style>
