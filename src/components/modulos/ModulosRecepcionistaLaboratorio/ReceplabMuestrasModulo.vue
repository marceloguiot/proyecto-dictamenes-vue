<template>
  <section>
    <!-- Barra de acciones -->
    <section class="modulo-acciones">
      <span class="modulo-acciones-titulo">Acciones disponibles</span>

      <div class="modulo-acciones-botones">
        <button
          v-for="a in acciones"
          :key="a.id"
          type="button"
          class="sistpec-btn-accion"
          :class="{ active: selectedAction === a.id }"
          @click="selectedAction = a.id"
        >
          {{ a.label }}
        </button>
      </div>

      <div class="sistpec-info-box">
        <p class="sistpec-info-text">{{ descripcionAccion }}</p>
      </div>
    </section>

    <section class="modulo-contenido">
      <!-- ====================== COTEJAR ====================== -->
      <div v-if="selectedAction === 'cotejar'">
        <h3 class="subtitulo">Cotejar datos</h3>

        <div v-if="errores.length" class="modulo-alert modulo-alert--error">
          <ul style="margin: 0; padding-left: 18px;">
            <li v-for="(e, i) in errores" :key="i">{{ e }}</li>
          </ul>
        </div>

        <div class="sistpec-search-bar">
          <div class="sistpec-form-group">
            <label>Folio hoja control de campo</label>
            <input v-model="cotejo.hoja" type="text" placeholder="Ej. HCC-2025-001" />
          </div>

          <div class="sistpec-form-group">
            <label>UPP</label>
            <input v-model="cotejo.upp" type="text" placeholder="Clave o nombre UPP" />
          </div>

          <div class="sistpec-form-group">
            <label>MVZ</label>
            <input v-model="cotejo.mvz" type="text" placeholder="Nombre del MVZ" />
          </div>

          <div class="sistpec-form-group sistpec-search-actions right">
            <button class="sistpec-btn-primary" type="button" @click="confirmarCotejo">
              CONFIRMAR RECEPCIÓN
            </button>

            <button class="sistpec-btn-secondary" type="button" @click="limpiarCotejo">
              LIMPIAR
            </button>
          </div>
        </div>

        <div v-if="mensajeExito" class="modulo-alert modulo-alert--success">
          {{ mensajeExito }}
        </div>
      </div>

      <!-- ====================== EDITAR ====================== -->
      <div v-else-if="selectedAction === 'editar'">
        <h3 class="subtitulo">Editar muestras (estado Pendiente)</h3>

        <div class="sistpec-search-bar">
          <div class="sistpec-form-group">
            <label>ID muestra</label>
            <input v-model="filtrosEditar.id_muestra" type="text" placeholder="Ej. M-0001-2025" />
          </div>

          <div class="sistpec-form-group">
            <label>Hoja control</label>
            <input v-model="filtrosEditar.hoja" type="text" placeholder="Ej. HCC-2025-001" />
          </div>

          <div class="sistpec-form-group">
            <label>UPP</label>
            <input v-model="filtrosEditar.upp" type="text" placeholder="Clave o nombre UPP" />
          </div>

          <div class="sistpec-form-group">
            <label>MVZ</label>
            <input v-model="filtrosEditar.mvz" type="text" placeholder="Nombre del MVZ" />
          </div>

          <div class="sistpec-form-group sistpec-search-actions right">
            <button class="sistpec-btn-primary" type="button" @click="buscarParaEditar">
              BUSCAR
            </button>
            <button class="sistpec-btn-secondary" type="button" @click="limpiarEditar">
              LIMPIAR
            </button>
          </div>
        </div>

        <div v-if="editarBuscado && !muestraEditando" class="modulo-alert modulo-alert--error">
          No se encontró una muestra <strong>Pendiente</strong> con esos criterios.
        </div>

        <div v-if="muestraEditando" class="sistpec-card">
          <div class="sistpec-form-grid">
            <div class="sistpec-form-group">
              <label>ID muestra</label>
              <input v-model="muestraEditando.id_muestra" type="text" disabled />
            </div>

            <div class="sistpec-form-group">
              <label>Hoja control</label>
              <input v-model="muestraEditando.hoja" type="text" />
            </div>

            <div class="sistpec-form-group">
              <label>UPP</label>
              <input v-model="muestraEditando.upp" type="text" />
            </div>

            <div class="sistpec-form-group">
              <label>MVZ</label>
              <input v-model="muestraEditando.mvz" type="text" />
            </div>

            <div class="sistpec-form-group">
              <label>Arete</label>
              <input v-model="muestraEditando.arete" type="text" />
            </div>

            <div class="sistpec-form-group">
              <label>Especie</label>
              <input v-model="muestraEditando.especie" type="text" />
            </div>

            <div class="sistpec-form-group">
              <label>Tipo de muestra</label>
              <input v-model="muestraEditando.tipo_muestra" type="text" />
            </div>

            <div class="sistpec-form-group">
              <label>Fecha recepción</label>
              <input v-model="muestraEditando.fecha_recepcion" type="date" />
            </div>

            <div class="sistpec-form-group">
              <label>Comentarios</label>
              <input v-model="muestraEditando.comentarios" type="text" />
            </div>
          </div>

          <div class="sistpec-actions-row">
            <button class="sistpec-btn-primary" type="button" @click="guardarEdicion">
              GUARDAR CAMBIOS
            </button>
            <button class="sistpec-btn-secondary" type="button" @click="cancelarEdicion">
              CANCELAR
            </button>
          </div>

          <div v-if="mensajeEditar" class="modulo-alert modulo-alert--success">
            {{ mensajeEditar }}
          </div>
        </div>
      </div>

      <!-- ====================== CONSULTAR ====================== -->
      <div v-else-if="selectedAction === 'consultar'">
        <h3 class="subtitulo">Consultar muestras</h3>

        <div class="sistpec-search-bar">
          <div class="sistpec-form-group">
            <label>ID muestra</label>
            <input v-model="filtrosConsultar.id_muestra" type="text" placeholder="Ej. M-0001-2025" />
          </div>

          <div class="sistpec-form-group">
            <label>Hoja control</label>
            <input v-model="filtrosConsultar.hoja" type="text" placeholder="Ej. HCC-2025-001" />
          </div>

          <div class="sistpec-form-group">
            <label>UPP</label>
            <input v-model="filtrosConsultar.upp" type="text" placeholder="Clave o nombre UPP" />
          </div>

          <div class="sistpec-form-group">
            <label>MVZ</label>
            <input v-model="filtrosConsultar.mvz" type="text" placeholder="Nombre del MVZ" />
          </div>

          <div class="sistpec-form-group sistpec-search-actions right">
            <button class="sistpec-btn-primary" type="button" @click="buscarConsultar">
              BUSCAR
            </button>
            <button class="sistpec-btn-secondary" type="button" @click="limpiarConsultar">
              LIMPIAR
            </button>
          </div>
        </div>

        <!-- Botones de descarga -->
        <div v-if="resultadosConsultar.length > 0" class="sistpec-export-actions">
          <button type="button" class="sistpec-btn-export sistpec-btn-excel" @click="descargarExcel">
            DESCARGAR EXCEL
          </button>
          <button type="button" class="sistpec-btn-export sistpec-btn-pdf" @click="descargarPDF">
            DESCARGAR PDF
          </button>
        </div>

        <div v-if="consultarBuscado" class="sistpec-table-wrapper">
          <table class="sistpec-table">
            <thead>
              <tr>
                <th>ID Muestra</th>
                <th>Hoja</th>
                <th>UPP</th>
                <th>MVZ</th>
                <th>Arete</th>
                <th>Especie</th>
                <th>Tipo muestra</th>
                <th>Fecha recepción</th>
                <th>Estatus</th>
                <th>Resultado</th>
                <th>Comentarios</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="m in resultadosConsultar" :key="m.id">
                <td>{{ m.id_muestra }}</td>
                <td>{{ m.hoja }}</td>
                <td>{{ m.upp }}</td>
                <td>{{ m.mvz }}</td>
                <td>{{ m.arete }}</td>
                <td>{{ m.especie }}</td>
                <td>{{ m.tipo_muestra }}</td>
                <td>{{ m.fecha_recepcion }}</td>
                <td>
                  <span class="badge" :class="badgeEstatusClase(m.estatus)">
                    {{ m.estatus }}
                  </span>
                </td>
                <td>{{ mostrarResultado(m) }}</td>
                <td>{{ m.comentarios }}</td>
              </tr>

              <tr v-if="resultadosConsultar.length === 0">
                <td colspan="11" class="sin-resultados">Sin coincidencias.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ====================== ELIMINAR ====================== -->
      <div v-else>
        <h3 class="subtitulo">Eliminar muestras (estado Pendiente)</h3>

        <div class="sistpec-search-bar">
          <div class="sistpec-form-group">
            <label>ID muestra</label>
            <input v-model="filtrosEliminar.id_muestra" type="text" placeholder="Ej. M-0001-2025" />
          </div>

          <div class="sistpec-form-group">
            <label>Hoja control</label>
            <input v-model="filtrosEliminar.hoja" type="text" placeholder="Ej. HCC-2025-001" />
          </div>

          <div class="sistpec-form-group">
            <label>UPP</label>
            <input v-model="filtrosEliminar.upp" type="text" placeholder="Clave o nombre UPP" />
          </div>

          <div class="sistpec-form-group">
            <label>MVZ</label>
            <input v-model="filtrosEliminar.mvz" type="text" placeholder="Nombre del MVZ" />
          </div>

          <div class="sistpec-form-group sistpec-search-actions right">
            <button class="sistpec-btn-primary" type="button" @click="buscarParaEliminar">
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
                <th>ID Muestra</th>
                <th>Hoja</th>
                <th>UPP</th>
                <th>MVZ</th>
                <th>Arete</th>
                <th>Fecha recepción</th>
                <th>Estatus</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="m in resultadosEliminar" :key="m.id">
                <td>{{ m.id_muestra }}</td>
                <td>{{ m.hoja }}</td>
                <td>{{ m.upp }}</td>
                <td>{{ m.mvz }}</td>
                <td>{{ m.arete }}</td>
                <td>{{ m.fecha_recepcion }}</td>
                <td>
                  <span class="badge" :class="badgeEstatusClase(m.estatus)">
                    {{ m.estatus }}
                  </span>
                </td>
                <td>
                  <button class="sistpec-btn-danger" type="button" @click="eliminarMuestra(m)">
                    ELIMINAR
                  </button>
                </td>
              </tr>

              <tr v-if="resultadosEliminar.length === 0">
                <td colspan="8" class="sin-resultados">Sin coincidencias.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="mensajeEliminar" class="modulo-alert modulo-alert--success">
          {{ mensajeEliminar }}
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

defineProps({ codigo: String, rol: String });

const acciones = [
  { id: 'cotejar', label: 'COTEJAR' },
  { id: 'editar', label: 'EDITAR' },
  { id: 'consultar', label: 'CONSULTAR' },
  { id: 'eliminar', label: 'ELIMINAR' }
];

const selectedAction = ref('cotejar');

const descripcionAccion = computed(() => {
  if (selectedAction.value === 'cotejar') return 'Cotejar datos de hoja de control de campo, UPP y MVZ.';
  if (selectedAction.value === 'editar') return 'Editar muestras únicamente en estado Pendiente.';
  if (selectedAction.value === 'consultar') return 'Consultar muestras con filtros.';
  return 'Eliminar muestras únicamente en estado Pendiente.';
});

// ====================== DATA DEMO (con HOJA) ======================
const muestrasDemoTabla = ref([
  {
    id: 1,
    id_muestra: 'M-0001-2025',
    hoja: 'HCC-2025-001',
    upp: 'UPP-VER-001',
    mvz: 'MVZ Juan Pérez',
    arete: '3011520051',
    especie: 'Bovino',
    tipo_muestra: 'Suero sanguíneo',
    fecha_recepcion: '2025-12-15',
    estatus: 'Concluido',
    resultado: 'Negativo',
    comentarios: ''
  },
  {
    id: 2,
    id_muestra: 'M-0002-2025',
    hoja: 'HCC-2025-002',
    upp: 'UPP-VER-014',
    mvz: 'MVZ Ana López',
    arete: '3011520062',
    especie: 'Bovino',
    tipo_muestra: 'Suero sanguíneo',
    fecha_recepcion: '2025-12-16',
    estatus: 'En proceso',
    resultado: '',
    comentarios: ''
  },
  {
    id: 3,
    id_muestra: 'M-0003-2025',
    hoja: 'HCC-2025-001',
    upp: 'UPP-VER-010',
    mvz: 'MVZ Carlos Torres',
    arete: '3011520099',
    especie: 'Caprino',
    tipo_muestra: 'Suero sanguíneo',
    fecha_recepcion: '2025-12-14',
    estatus: 'Rechazado',
    resultado: '',
    comentarios: 'Muestra derramada al arribo.'
  },
  {
    id: 4,
    id_muestra: 'M-0004-2025',
    hoja: 'HCC-2025-001',
    upp: 'UPP-VER-002',
    mvz: 'MVZ Juan Pérez',
    arete: '3011520044',
    especie: 'Bovino',
    tipo_muestra: 'Suero sanguíneo',
    fecha_recepcion: '2025-12-16',
    estatus: 'Pendiente',
    resultado: '',
    comentarios: ''
  }
]);

function mostrarResultado(m) {
  if (m.estatus === 'Rechazado') return 'No aplica';
  if (m.estatus === 'En proceso') return '-';
  return m.resultado || '-';
}

function badgeEstatusClase(estatus) {
  if (estatus === 'Concluido') return 'badge--activo';
  if (estatus === 'Rechazado') return 'badge--inactivo';
  if (estatus === 'Pendiente') return 'badge--pendiente';
  return 'badge--proceso';
}

// ====================== COTEJAR ======================
const cotejo = ref({ hoja: '', upp: '', mvz: '' });
const folioTicket = ref('');

const errores = ref([]);
const mensajeExito = ref('');

function confirmarCotejo() {
  errores.value = [];
  mensajeExito.value = '';

  if (!cotejo.value.hoja.trim()) errores.value.push('Debe capturar la hoja de control de campo.');
  if (!cotejo.value.upp.trim()) errores.value.push('Debe capturar la UPP.');
  if (!cotejo.value.mvz.trim()) errores.value.push('Debe capturar el MVZ.');
  if (errores.value.length) return;

  // ✅ Folio por evento
  folioTicket.value = `TCK-${Date.now()}`;

  // ✅ Validar que existan muestras ligadas a esa hoja
  const hojaActual = cotejo.value.hoja.trim().toLowerCase();
  const totalEnHoja = muestrasDemoTabla.value.filter(m => (m.hoja || '').trim().toLowerCase() === hojaActual).length;

  if (totalEnHoja === 0) {
    errores.value.push('No hay muestras registradas para la hoja capturada. Verifica el folio.');
    return;
  }

  mensajeExito.value = 'Recepción confirmada (demo).';
  imprimirTicketRecepcion();
}

function limpiarCotejo() {
  cotejo.value = { hoja: '', upp: '', mvz: '' };
  errores.value = [];
  mensajeExito.value = '';
}

// ====================== EDITAR ======================
const filtrosEditar = ref({ id_muestra: '', hoja: '', upp: '', mvz: '' });
const editarBuscado = ref(false);
const muestraEditando = ref(null);
const mensajeEditar = ref('');

function buscarParaEditar() {
  editarBuscado.value = true;
  mensajeEditar.value = '';

  const f = filtrosEditar.value;
  const idm = f.id_muestra.trim().toLowerCase();
  const hoja = f.hoja.trim().toLowerCase();
  const upp = f.upp.trim().toLowerCase();
  const mvz = f.mvz.trim().toLowerCase();

  const encontrada = muestrasDemoTabla.value.find(x => {
    if (x.estatus !== 'Pendiente') return false;
    const okId = idm ? x.id_muestra.toLowerCase().includes(idm) : true;
    const okHoja = hoja ? (x.hoja || '').toLowerCase().includes(hoja) : true;
    const okUpp = upp ? x.upp.toLowerCase().includes(upp) : true;
    const okMvz = mvz ? x.mvz.toLowerCase().includes(mvz) : true;
    return okId && okHoja && okUpp && okMvz;
  });

  muestraEditando.value = encontrada ? { ...encontrada } : null;
}

function guardarEdicion() {
  if (!muestraEditando.value) return;

  const idx = muestrasDemoTabla.value.findIndex(x => x.id === muestraEditando.value.id);
  if (idx === -1) return;

  if (muestrasDemoTabla.value[idx].estatus !== 'Pendiente') {
    mensajeEditar.value = '';
    alert('Solo se puede editar una muestra en estado Pendiente.');
    return;
  }

  muestrasDemoTabla.value[idx] = { ...muestraEditando.value };
  mensajeEditar.value = 'Cambios guardados (demo).';
}

function cancelarEdicion() {
  muestraEditando.value = null;
  editarBuscado.value = false;
  mensajeEditar.value = '';
}

function limpiarEditar() {
  filtrosEditar.value = { id_muestra: '', hoja: '', upp: '', mvz: '' };
  editarBuscado.value = false;
  muestraEditando.value = null;
  mensajeEditar.value = '';
}

// ====================== CONSULTAR ======================
const filtrosConsultar = ref({ id_muestra: '', hoja: '', upp: '', mvz: '' });
const consultarBuscado = ref(false);

const resultadosConsultar = computed(() => {
  if (!consultarBuscado.value) return [];
  const f = filtrosConsultar.value;

  const idm = f.id_muestra.trim().toLowerCase();
  const hoja = f.hoja.trim().toLowerCase();
  const upp = f.upp.trim().toLowerCase();
  const mvz = f.mvz.trim().toLowerCase();

  return muestrasDemoTabla.value.filter(x => {
    const okId = idm ? x.id_muestra.toLowerCase().includes(idm) : true;
    const okHoja = hoja ? (x.hoja || '').toLowerCase().includes(hoja) : true;
    const okUpp = upp ? x.upp.toLowerCase().includes(upp) : true;
    const okMvz = mvz ? x.mvz.toLowerCase().includes(mvz) : true;
    return okId && okHoja && okUpp && okMvz;
  });
});

function buscarConsultar() {
  consultarBuscado.value = true;
}

function limpiarConsultar() {
  filtrosConsultar.value = { id_muestra: '', hoja: '', upp: '', mvz: '' };
  consultarBuscado.value = false;
}

// ====================== ELIMINAR ======================
const filtrosEliminar = ref({ id_muestra: '', hoja: '', upp: '', mvz: '' });
const eliminarBuscado = ref(false);
const mensajeEliminar = ref('');

const resultadosEliminar = computed(() => {
  if (!eliminarBuscado.value) return [];
  const f = filtrosEliminar.value;

  const idm = f.id_muestra.trim().toLowerCase();
  const hoja = f.hoja.trim().toLowerCase();
  const upp = f.upp.trim().toLowerCase();
  const mvz = f.mvz.trim().toLowerCase();

  return muestrasDemoTabla.value.filter(x => {
    if (x.estatus !== 'Pendiente') return false;
    const okId = idm ? x.id_muestra.toLowerCase().includes(idm) : true;
    const okHoja = hoja ? (x.hoja || '').toLowerCase().includes(hoja) : true;
    const okUpp = upp ? x.upp.toLowerCase().includes(upp) : true;
    const okMvz = mvz ? x.mvz.toLowerCase().includes(mvz) : true;
    return okId && okHoja && okUpp && okMvz;
  });
});

function buscarParaEliminar() {
  eliminarBuscado.value = true;
  mensajeEliminar.value = '';
}

function eliminarMuestra(m) {
  if (!m || m.estatus !== 'Pendiente') {
    alert('Solo se puede eliminar una muestra en estado Pendiente.');
    return;
  }
  const idx = muestrasDemoTabla.value.findIndex(x => x.id === m.id);
  if (idx === -1) return;

  muestrasDemoTabla.value.splice(idx, 1);
  mensajeEliminar.value = 'Muestra eliminada (demo).';
}

function limpiarEliminar() {
  filtrosEliminar.value = { id_muestra: '', hoja: '', upp: '', mvz: '' };
  eliminarBuscado.value = false;
  mensajeEliminar.value = '';
}

// ====================== TICKET (conteo por HOJA) ======================
function imprimirTicketRecepcion() {
  const hojaActual = cotejo.value.hoja.trim().toLowerCase();

  const muestrasDeHoja = muestrasDemoTabla.value.filter(m => {
    return (m.hoja || '').trim().toLowerCase() === hojaActual;
  });

  const totalMuestras = muestrasDeHoja.length;
  const fecha = new Date().toLocaleString('es-MX', { hour12: true });

  const htmlTicket = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ticket de Recepción</title>
  <style>
    body { font-family: monospace; font-size: 12px; width: 280px; padding: 8px; }
    h3 { text-align:center; margin:4px 0; }
    hr { border:none; border-top:1px dashed #000; margin:8px 0; }
    .linea { margin-bottom:6px; }
    .center { text-align:center; }
    @media print { body { margin:0; } }
  </style>
</head>
<body>

  <h3>CEFPP VERACRUZ</h3>
  <div class="center">Ticket de Recepción</div>

  <hr>

  <div class="linea"><strong>Folio:</strong> ${folioTicket.value}</div>
  <div class="linea"><strong>Fecha:</strong> ${fecha}</div>

  <hr>

  <div class="linea"><strong>MVZ:</strong> ${cotejo.value.mvz}</div>
  <div class="linea"><strong>UPP:</strong> ${cotejo.value.upp}</div>
  <div class="linea"><strong>Hoja campo:</strong> ${cotejo.value.hoja}</div>

  <hr>

  <div class="linea"><strong>Muestras recepcionadas:</strong> ${totalMuestras}</div>

  <hr>

  <div class="linea"><strong>Recibió:</strong> Usuario del laboratorio</div>

  <hr>

  <div class="center">Documento generado por SISTPEC</div>

  <script>
    window.onload = () => { window.focus(); window.print(); };
    window.onafterprint = () => { window.close(); };
  <\/script>

</body>
</html>
  `;

  const ventana = window.open('', '_blank', 'noopener,noreferrer,width=420,height=700');
  if (!ventana) {
    alert('No se pudo abrir el ticket. Permite ventanas emergentes e intenta de nuevo.');
    return;
  }

  ventana.document.open();
  ventana.document.write(htmlTicket);
  ventana.document.close();
}

/* ===================== Descargar Excel / PDF ===================== */
function descargarExcel() {
  const datos = resultadosConsultar.value;
  if (datos.length === 0) return;

  const encabezados = ['ID Muestra', 'Hoja', 'UPP', 'MVZ', 'Arete', 'Especie', 'Tipo muestra', 'Fecha recepción', 'Estatus', 'Resultado', 'Comentarios'];
  const filas = datos.map(m => [
    m.id_muestra || '',
    m.hoja || '',
    m.upp || '',
    m.mvz || '',
    m.arete || '',
    m.especie || '',
    m.tipo_muestra || '',
    m.fecha_recepcion || '',
    m.estatus || '',
    mostrarResultado(m),
    m.comentarios || ''
  ]);

  const bom = '\uFEFF';
  const csv = [encabezados, ...filas]
    .map(fila => fila.map(celda => `"${String(celda).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `muestras_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function descargarPDF() {
  const datos = resultadosConsultar.value;
  if (datos.length === 0) return;

  const filasHTML = datos.map(m => {
    let badgeClass = 'proceso';
    if (m.estatus === 'Concluido') badgeClass = 'activo';
    else if (m.estatus === 'Rechazado') badgeClass = 'inactivo';
    else if (m.estatus === 'Pendiente') badgeClass = 'pendiente';

    return `
    <tr>
      <td>${m.id_muestra || ''}</td>
      <td>${m.hoja || ''}</td>
      <td>${m.upp || ''}</td>
      <td>${m.mvz || ''}</td>
      <td>${m.arete || ''}</td>
      <td>${m.especie || ''}</td>
      <td>${m.tipo_muestra || ''}</td>
      <td>${m.fecha_recepcion || ''}</td>
      <td><span class="badge ${badgeClass}">${m.estatus || ''}</span></td>
      <td>${mostrarResultado(m)}</td>
      <td>${m.comentarios || ''}</td>
    </tr>
  `;
  }).join('');

  const tablaHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Muestras</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background-color: #7a061e; color: #fff; padding: 8px; text-align: left; }
        td { padding: 8px; border: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #fafafa; }
        .badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
        .activo { background: #e1f3e1; color: #225522; }
        .inactivo { background: #fbeaea; color: #7a1f1f; }
        .pendiente { background: #fff2cc; color: #6a4a00; }
        .proceso { background: #e8f1ff; color: #0b3d91; }
        @media print {
          body { padding: 0; }
          @page { margin: 1cm; }
        }
      </style>
    </head>
    <body>
      <h1>Muestras - SISTPEC</h1>
      <table>
        <thead>
          <tr>
            <th>ID Muestra</th>
            <th>Hoja</th>
            <th>UPP</th>
            <th>MVZ</th>
            <th>Arete</th>
            <th>Especie</th>
            <th>Tipo muestra</th>
            <th>Fecha recepción</th>
            <th>Estatus</th>
            <th>Resultado</th>
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
.modulo-acciones { margin-bottom: 18px; }
.modulo-acciones-titulo { display:block; font-size:14px; margin-bottom:8px; color:#333; font-weight:600; }
.modulo-acciones-botones { display:flex; flex-wrap:wrap; gap:4px; }
.sistpec-btn-accion {
  border:none; padding:8px 16px; font-size:12px; font-weight:700;
  text-transform:uppercase; border-radius:3px; cursor:pointer;
  background:#2f6b32; color:#fff; letter-spacing:.5px;
}
.sistpec-btn-accion.active { background:#244e26; }

.sistpec-info-box { margin-top:10px; padding:10px 14px; border-radius:4px; background:#e1f3e1; border:1px solid #c3e6c3; }
.sistpec-info-text { margin:0; font-size:13px; color:#225522; }

.subtitulo { font-size:18px; margin:10px 0 12px; color:#333; }
.modulo-alert { margin:10px 0 14px; padding:10px 14px; border-radius:4px; font-size:13px; }
.modulo-alert--error { background:#fbeaea; border:1px solid #f5c2c2; color:#7a1f1f; }
.modulo-alert--success { background:#e1f3e1; border:1px solid #c3e6c3; color:#225522; }

.sistpec-search-bar {
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap:12px;
  margin-bottom:16px;
}
.sistpec-form-group { display:flex; flex-direction:column; gap:4px; }
.sistpec-form-group label { font-size:13px; font-weight:600; color:#444; }
.sistpec-form-group input {
  padding:8px 10px; border-radius:4px; border:1px solid #ccc;
  font-size:14px; outline:none;
}
.sistpec-search-actions { display:flex; align-items:flex-end; gap:8px; }
.sistpec-search-actions.right { justify-content:flex-end; }

.sistpec-btn-primary {
  background:#2f6b32; color:#fff; border:none; padding:8px 18px;
  border-radius:4px; font-size:13px; font-weight:700; cursor:pointer;
}
.sistpec-btn-primary:hover { background:#244e26; }

.sistpec-btn-secondary {
  background:#e0e0e0; color:#333; border:none; padding:8px 18px;
  border-radius:4px; font-size:13px; font-weight:700; cursor:pointer;
}
.sistpec-btn-secondary:hover { background:#d0d0d0; }

.sistpec-btn-danger {
  background:#a30000; color:#fff; border:none; padding:6px 12px;
  border-radius:4px; font-size:12px; font-weight:700; cursor:pointer;
}
.sistpec-btn-danger:hover { filter: brightness(0.9); }

.sistpec-table-wrapper { width:100%; overflow-x:auto; }
.sistpec-table { width:100%; border-collapse:collapse; font-size:13px; }
.sistpec-table thead { background:#7a061e; color:#fff; }
.sistpec-table th, .sistpec-table td { padding:8px 10px; border:1px solid #ddd; text-align:left; }
.sistpec-table tbody tr:nth-child(even) { background:#fafafa; }
.sin-resultados { text-align:center; color:#777; }

.badge { display:inline-block; padding:3px 8px; border-radius:999px; font-size:12px; font-weight:700; }
.badge--activo { background:#e1f3e1; color:#225522; border:1px solid #c3e6c3; }
.badge--inactivo { background:#fbeaea; color:#7a1f1f; border:1px solid #f5c2c2; }
.badge--pendiente { background:#fff2cc; color:#6a4a00; border:1px solid #ffe08a; }
.badge--proceso { background:#e8f1ff; color:#0b3d91; border:1px solid #bcd5ff; }

.sistpec-card {
  border:1px solid #e5e5e5;
  border-radius:8px;
  padding:14px;
  background:#fff;
}
.sistpec-form-grid {
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap:12px;
}
.sistpec-actions-row {
  display:flex;
  justify-content:flex-end;
  gap:8px;
  margin-top:12px;
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
  .sistpec-form-grid { grid-template-columns: 1fr; }
}
</style>

