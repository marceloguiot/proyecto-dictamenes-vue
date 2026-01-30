<template>
  <section>
    <header class="modulo-header">
      <h3 class="subtitulo">Consultar</h3>
      <p class="modulo-subtitle">
        Consultar resultados de laboratorio. Capture al menos un criterio de búsqueda.
      </p>
    </header>

    <div v-if="mostrarAlerta" class="modulo-alert modulo-alert--error">
      Debe capturar <strong>al menos un criterio de búsqueda</strong> para realizar la consulta.
    </div>

    <div class="sistpec-search-bar">
      <div class="sistpec-form-group">
        <label>Número de caso</label>
        <input v-model="filtros.caso" type="text" placeholder="Ej. BR25-001" />
      </div>

      <div class="sistpec-form-group">
        <label>Número de arete o muestra</label>
        <input v-model="filtros.areteOMuestra" type="text" placeholder="Ej. 3011520001 / MX25-0001" />
      </div>

      <div class="sistpec-form-group">
        <label>UPP</label>
        <input v-model="filtros.upp" type="text" placeholder="Clave o nombre UPP" />
      </div>

      <div class="sistpec-form-group">
        <label>MVZ que registró</label>
        <input v-model="filtros.mvz" type="text" placeholder="Nombre del MVZ" />
      </div>

      <div class="sistpec-form-group">
        <label>Propietario</label>
        <input v-model="filtros.propietario" type="text" placeholder="Nombre del propietario" />
      </div>

      <div class="sistpec-form-group">
        <label>Fecha de registro (caso)</label>
        <input v-model="filtros.fechaRegistro" type="date" />
      </div>

      <div class="sistpec-form-group">
        <label>Fecha de carga de resultados</label>
        <input v-model="filtros.fechaCarga" type="date" />
      </div>

      <div class="sistpec-form-group">
        <label>Resultado</label>
        <select v-model="filtros.resultado">
          <option value="">Todos</option>
          <option value="POSITIVO">POSITIVO</option>
          <option value="NEGATIVO">NEGATIVO</option>
        </select>
      </div>

      <div class="sistpec-form-group sistpec-search-actions">
        <button type="button" class="sistpec-btn-primary" @click="buscar">BUSCAR</button>
        <button type="button" class="sistpec-btn-secondary" @click="limpiar">LIMPIAR FILTROS</button>
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
            <th>Núm. caso</th>
            <th>Arete/Muestra</th>
            <th>UPP</th>
            <th>MVZ</th>
            <th>Propietario</th>
            <th>F. registro</th>
            <th>F. carga</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in resultadosFiltrados" :key="r.id">
            <td>{{ r.caso }}</td>
            <td>{{ r.areteOMuestra }}</td>
            <td>{{ r.upp }}</td>
            <td>{{ r.mvz }}</td>
            <td>{{ r.propietario }}</td>
            <td>{{ r.fechaRegistro }}</td>
            <td>{{ r.fechaCarga }}</td>
            <td>
              <span class="badge" :class="r.resultado === 'POSITIVO' ? 'badge--inactivo' : 'badge--activo'">
                {{ r.resultado }}
              </span>
            </td>
          </tr>

          <tr v-if="resultadosFiltrados.length === 0">
            <td colspan="8" class="sin-resultados">
              No se encontraron resultados con los criterios capturados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

const filtros = ref({
  caso: '',
  areteOMuestra: '',
  upp: '',
  mvz: '',
  propietario: '',
  fechaRegistro: '',
  fechaCarga: '',
  resultado: ''
});

const buscado = ref(false);
const mostrarAlerta = ref(false);

const demo = ref([
  {
    id: 1,
    caso: 'BR25-001',
    areteOMuestra: '3011520001',
    upp: 'UPP-VER-001',
    mvz: 'MVZ Juan Pérez',
    propietario: 'Juan Pérez',
    fechaRegistro: '2025-12-01',
    fechaCarga: '2025-12-03',
    resultado: 'NEGATIVO'
  },
  {
    id: 2,
    caso: 'BR25-014',
    areteOMuestra: 'MX25-0007',
    upp: 'UPP-VER-014',
    mvz: 'MVZ Ana López',
    propietario: 'Ana López',
    fechaRegistro: '2025-12-02',
    fechaCarga: '2025-12-04',
    resultado: 'POSITIVO'
  }
]);

function hayAlMenosUnFiltro() {
  const f = filtros.value;
  return (
    f.caso.trim() ||
    f.areteOMuestra.trim() ||
    f.upp.trim() ||
    f.mvz.trim() ||
    f.propietario.trim() ||
    f.fechaRegistro ||
    f.fechaCarga ||
    f.resultado
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

function limpiar() {
  filtros.value = {
    caso: '',
    areteOMuestra: '',
    upp: '',
    mvz: '',
    propietario: '',
    fechaRegistro: '',
    fechaCarga: '',
    resultado: ''
  };
  buscado.value = false;
  mostrarAlerta.value = false;
}

const resultadosFiltrados = computed(() => {
  if (!buscado.value) return [];

  const f = filtros.value;
  const caso = f.caso.trim().toLowerCase();
  const am   = f.areteOMuestra.trim().toLowerCase();
  const upp  = f.upp.trim().toLowerCase();
  const mvz  = f.mvz.trim().toLowerCase();
  const prop = f.propietario.trim().toLowerCase();

  return demo.value.filter(r => {
    const okCaso = caso ? r.caso.toLowerCase().includes(caso) : true;
    const okAm   = am   ? r.areteOMuestra.toLowerCase().includes(am) : true;
    const okUpp  = upp  ? r.upp.toLowerCase().includes(upp) : true;
    const okMvz  = mvz  ? r.mvz.toLowerCase().includes(mvz) : true;
    const okProp = prop ? r.propietario.toLowerCase().includes(prop) : true;
    const okFR   = f.fechaRegistro ? r.fechaRegistro === f.fechaRegistro : true;
    const okFC   = f.fechaCarga ? r.fechaCarga === f.fechaCarga : true;
    const okRes  = f.resultado ? r.resultado === f.resultado : true;
    return okCaso && okAm && okUpp && okMvz && okProp && okFR && okFC && okRes;
  });
});

function descargarExcel() {
  const datos = resultadosFiltrados.value;
  if (datos.length === 0) return;

  const encabezados = ['Núm. Caso', 'Arete/Muestra', 'UPP', 'MVZ', 'Propietario', 'F. Registro', 'F. Carga', 'Resultado'];
  const filas = datos.map(r => [
    r.caso || '',
    r.areteOMuestra || '',
    r.upp || '',
    r.mvz || '',
    r.propietario || '',
    r.fechaRegistro || '',
    r.fechaCarga || '',
    r.resultado || ''
  ]);

  const bom = '\uFEFF';
  const csv = [encabezados, ...filas]
    .map(fila => fila.map(celda => `"${String(celda).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `resultados_laboratorio_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function descargarPDF() {
  const datos = resultadosFiltrados.value;
  if (datos.length === 0) return;

  const filasHTML = datos.map(r => `
    <tr>
      <td>${r.caso || ''}</td>
      <td>${r.areteOMuestra || ''}</td>
      <td>${r.upp || ''}</td>
      <td>${r.mvz || ''}</td>
      <td>${r.propietario || ''}</td>
      <td>${r.fechaRegistro || ''}</td>
      <td>${r.fechaCarga || ''}</td>
      <td><span class="badge ${r.resultado === 'POSITIVO' ? 'positivo' : 'negativo'}">${r.resultado || ''}</span></td>
    </tr>
  `).join('');

  const tablaHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Resultados de Laboratorio</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background-color: #7a061e; color: #fff; padding: 8px; text-align: left; }
        td { padding: 8px; border: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #fafafa; }
        .badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
        .positivo { background: #fbeaea; color: #7a1f1f; }
        .negativo { background: #e1f3e1; color: #225522; }
        @media print {
          body { padding: 0; }
          @page { margin: 1cm; }
        }
      </style>
    </head>
    <body>
      <h1>Resultados de Laboratorio - SISTPEC</h1>
      <table>
        <thead>
          <tr>
            <th>Núm. Caso</th>
            <th>Arete/Muestra</th>
            <th>UPP</th>
            <th>MVZ</th>
            <th>Propietario</th>
            <th>F. Registro</th>
            <th>F. Carga</th>
            <th>Resultado</th>
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

.sistpec-search-bar { 
  display:grid; 
  grid-template-columns: repeat(4, minmax(0, 1fr)); 
  gap:12px; margin-bottom:16px; 
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
.sistpec-form-group input, 
.sistpec-form-group select { 
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
  background:#2f6b32; 
  color:#fff; 
  border:none; 
  padding:8px 18px; 
  border-radius:4px; 
  font-size:13px; 
  font-weight:600; 
  cursor:pointer; 
}
.sistpec-btn-primary:hover { 
  background:#244e26; 
}
.sistpec-btn-secondary { 
  background:#e0e0e0; 
  color:#333; 
  border:none; 
  padding:8px 18px; 
  border-radius:4px; 
  font-size:13px; 
  font-weight:600; 
  cursor:pointer; 
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

.badge { 
  display:inline-block; 
  padding:2px 8px; 
  border-radius:10px; 
  font-size:11px; 
  font-weight:600; 
}
.badge--activo { 
  background:#e1f3e1; 
  color:#225522; 
}
.badge--inactivo { 
  background:#fbeaea; 
  color:#7a1f1f; 
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
