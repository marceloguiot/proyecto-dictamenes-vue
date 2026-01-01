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
      <p class="sistpec-info-text">
        {{ descripcionAccionActual }}
      </p>
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

    <!-- ====================== 1) RECEPCIONAR (SOLO CAMPAÑA) ====================== -->
    <div v-if="selectedAction === 'cotejar'">
      <h3 class="subtitulo">Recepcionar</h3>

      <div v-if="mostrarAlertaCamp" class="modulo-alert modulo-alert--error">
        Debe capturar <strong>al menos un criterio</strong> para buscar.
      </div>

      <!-- filtros (2 inputs + acciones) -->
      <div class="sistpec-search-bar sistpec-search-bar--acciones-2">
        <div class="sistpec-form-group">
          <label>Hoja control campo</label>
          <input v-model="filtrosCamp.hoja" type="text" placeholder="Ej. CC-5409818" />
        </div>

        <div class="sistpec-form-group">
          <label>UPP</label>
          <input v-model="filtrosCamp.upp" type="text" placeholder="Ej. 30-025-1055-001" />
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscarCampania">
            BUSCAR
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarCampania">
            LIMPIAR FILTROS
          </button>
        </div>
      </div>

      <!-- tabla lotes -->
      <div v-if="buscadoCamp" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Folio recepción</th>
              <th>Fecha</th>
              <th>UPP</th>
              <th>Hoja campo</th>
              <th>Especie</th>
              <th>Total muestras</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="l in lotesCampFiltrados" :key="l.id">
              <td>{{ l.folio_recepcion }}</td>
              <td>{{ l.fecha_recepcion }}</td>
              <td>{{ l.upp }}</td>
              <td>{{ l.hoja_control_campo }}</td>
              <td>{{ l.especie }}</td>
              <td>{{ l.total_muestras }}</td>
              <td>
                <button
                  type="button"
                  class="sistpec-btn-secondary sistpec-btn-sm"
                  @click="seleccionarLote(l)"
                >
                  COTEJAR
                </button>
              </td>
            </tr>

            <tr v-if="lotesCampFiltrados.length === 0">
              <td colspan="7" class="sin-resultados">
                No se encontraron registros con los criterios capturados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- panel cotejo -->
      <div v-if="loteSeleccionado" class="sistpec-edit-panel">
        <h4 class="subtitulo-secundario">
          Cotejando: {{ loteSeleccionado.folio_recepcion }} | {{ loteSeleccionado.upp }}
        </h4>

        <div class="sistpec-table-wrapper">
          <table class="sistpec-table">
            <thead>
              <tr>
                <th>Folio muestra</th>
                <th>Número de arete</th>
                <th>Estatus cotejo</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(m, idx) in loteSeleccionado.muestras" :key="m.id">
                <td>{{ m.folio_muestra }}</td>
                <td>
                  <input
                    v-model="loteSeleccionado.muestras[idx].arete"
                    type="text"
                    placeholder="Capturar/validar arete"
                    class="input-inline"
                  />
                </td>
                <td>
                  <span
                    class="badge"
                    :class="(m.arete || '').trim() ? 'badge--activo' : 'badge--proceso'"
                  >
                    {{ (m.arete || '').trim() ? 'COTEJADO' : 'PENDIENTE' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="sistpec-form-actions">
          <button type="button" class="sistpec-btn-primary" @click="confirmarRecepcionCampania">
            CONFIRMAR RECEPCIÓN + IMPRIMIR TICKET
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="cancelarLote">
            CANCELAR
          </button>
        </div>
      </div>
    </div>

    <!-- ====================== 2) EDITAR (PENDIENTE) ====================== -->
    <div v-else-if="selectedAction === 'editar'">
      <h3 class="subtitulo">Editar</h3>



      <div v-if="mostrarAlertaEditar" class="modulo-alert modulo-alert--error">
        Debe capturar <strong>al menos un criterio</strong> para buscar.
      </div>

      <!-- filtros (2 inputs + acciones) -->
      <div class="sistpec-search-bar sistpec-search-bar--acciones-2">
        <div class="sistpec-form-group">
          <label>Folio de muestra</label>
          <input v-model="filtrosEditar.folio" type="text" placeholder="Ej. M-0001-2025" />
        </div>

        <div class="sistpec-form-group">
          <label>UPP</label>
          <input v-model="filtrosEditar.upp" type="text" placeholder="Ej. 30-025-1055-001" />
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscarEditar">
            BUSCAR
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarEditar">
            LIMPIAR FILTROS
          </button>
        </div>
      </div>

      <div v-if="buscadoEditar" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>UPP</th>
              <th>Especie</th>
              <th>Fecha recepción</th>
              <th>Estatus</th>
              <th>Observación</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="m in muestrasPendientesFiltradas" :key="m.id">
              <td>{{ m.id_muestra }}</td>
              <td>{{ m.upp }}</td>
              <td>{{ m.especie }}</td>
              <td>{{ m.fecha_recepcion }}</td>
              <td><span class="badge badge--proceso">PENDIENTE</span></td>
              <td>{{ m.observacion || '-' }}</td>
              <td>
                <button
                  type="button"
                  class="sistpec-btn-secondary sistpec-btn-sm"
                  @click="seleccionarMuestraEdicion(m)"
                >
                  EDITAR
                </button>
              </td>
            </tr>

            <tr v-if="muestrasPendientesFiltradas.length === 0">
              <td colspan="7" class="sin-resultados">
                No se encontraron muestras pendientes con los criterios capturados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- panel edición -->
      <div v-if="muestraEditando" class="sistpec-edit-panel">
        <h4 class="subtitulo-secundario">
          Editando: {{ muestraEditando.id_muestra }}
        </h4>

        <form class="sistpec-form" @submit.prevent="guardarEdicionMuestra">
          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>UPP</label>
              <input v-model="muestraEditando.upp" type="text" />
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
              <label>Arete</label>
              <input v-model="muestraEditando.arete" type="text" />
            </div>
          </div>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Observación (opcional)</label>
              <input
                v-model="muestraEditando.observacion"
                type="text"
                placeholder="Ej. Hemolizada / Rechazada..."
              />
            </div>
          </div>

          <div class="sistpec-form-actions">
            <button type="submit" class="sistpec-btn-primary">
              GUARDAR CAMBIOS
            </button>
            <button type="button" class="sistpec-btn-secondary" @click="cancelarEdicionMuestra">
              CANCELAR
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ====================== 3) CONSULTAR ====================== -->
    <div v-else-if="selectedAction === 'consultar'">
      <h3 class="subtitulo">Consultar</h3>

      <div v-if="mostrarAlertaCons" class="modulo-alert modulo-alert--error">
        Debe seleccionar <strong>al menos un filtro</strong> para realizar la consulta.
      </div>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>ID / Folio de muestra</label>
          <input v-model="filtrosCons.id_muestra" type="text" placeholder="Ej. M-0001-2025" />
        </div>

        <div class="sistpec-form-group">
          <label>UPP</label>
          <input v-model="filtrosCons.upp" type="text" placeholder="Ej. 30-025-1055-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Estatus</label>
          <select v-model="filtrosCons.estatus">
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
            <option value="Concluido">Concluido</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
      </div>

      <div class="sistpec-search-bar fechas-bar">
        <div class="sistpec-form-group sistpec-form-group-inline">
          <label>Fecha de recepción</label>
          <div class="sistpec-form-inline-inputs">
            <input v-model="filtrosCons.fecha_inicio" type="date" />
            <span class="vigencia-sep">a</span>
            <input v-model="filtrosCons.fecha_fin" type="date" />
          </div>
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscarConsultar">
            BUSCAR
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarConsultar">
            LIMPIAR FILTROS
          </button>
        </div>
      </div>

      <div v-if="buscadoCons" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>UPP</th>
              <th>Especie</th>
              <th>Tipo</th>
              <th>Fecha recepción</th>
              <th>Estatus</th>
              <th>Observación</th>
              <th>Origen</th>
              <th>Arete</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="m in muestrasConsultadasFiltradas" :key="m.id">
              <td>{{ m.id_muestra }}</td>
              <td>{{ m.upp }}</td>
              <td>{{ m.especie }}</td>
              <td>{{ m.tipo_muestra }}</td>
              <td>{{ m.fecha_recepcion }}</td>
              <td>
                <span class="badge" :class="badgeEstatusClase(m.estatus)">
                  {{ m.estatus }}
                </span>
              </td>
              <td>{{ m.observacion || '-' }}</td>
              <td>{{ m.origen_servicio }}</td>
              <td>{{ m.arete || '-' }}</td>
            </tr>

            <tr v-if="muestrasConsultadasFiltradas.length === 0">
              <td colspan="9" class="sin-resultados">
                No se encontraron muestras con los criterios de búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ====================== 4) ELIMINAR (PENDIENTE) ====================== -->
    <div v-else-if="selectedAction === 'eliminar'">
      <h3 class="subtitulo">Eliminar</h3>


      <div v-if="mostrarAlertaEliminar" class="modulo-alert modulo-alert--error">
        Debe capturar <strong>al menos un criterio</strong> para buscar.
      </div>

      <!-- filtros (2 inputs + acciones) -->
      <div class="sistpec-search-bar sistpec-search-bar--acciones-2">
        <div class="sistpec-form-group">
          <label>Folio de muestra</label>
          <input v-model="filtrosEliminar.folio" type="text" placeholder="Ej. M-0001-2025" />
        </div>

        <div class="sistpec-form-group">
          <label>UPP</label>
          <input v-model="filtrosEliminar.upp" type="text" placeholder="Ej. 30-025-1055-001" />
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscarEliminar">
            BUSCAR
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarEliminar">
            LIMPIAR FILTROS
          </button>
        </div>
      </div>

      <div v-if="buscadoEliminar" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>UPP</th>
              <th>Fecha recepción</th>
              <th>Estatus</th>
              <th>Observación</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="m in muestrasPendientesEliminarFiltradas" :key="m.id">
              <td>{{ m.id_muestra }}</td>
              <td>{{ m.upp }}</td>
              <td>{{ m.fecha_recepcion }}</td>
              <td><span class="badge badge--proceso">PENDIENTE</span></td>
              <td>{{ m.observacion || '-' }}</td>
              <td>
                <button
                  type="button"
                  class="sistpec-btn-danger sistpec-btn-sm"
                  @click="eliminarMuestraPendiente(m)"
                >
                  ELIMINAR
                </button>
              </td>
            </tr>

            <tr v-if="muestrasPendientesEliminarFiltradas.length === 0">
              <td colspan="6" class="sin-resultados">
                No se encontraron muestras pendientes con los criterios capturados.
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
import { computed, nextTick, ref, watch } from 'vue';

defineProps({
  codigo: { type: String, required: false, default: '' },
  rol: { type: String, required: false, default: 'RESP_LAB' }
});

/* ===================== UI / HELPERS ===================== */
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

const acciones = [
  { id: 'cotejar', label: 'RECEPCIONAR' },
  { id: 'editar', label: 'EDITAR' },
  { id: 'consultar', label: 'CONSULTAR' },
  { id: 'eliminar', label: 'ELIMINAR' }
];

const selectedAction = ref('cotejar');
const errores = ref([]);
const mensajeExito = ref('');

function cambiarAccion(id) {
  selectedAction.value = id;
  scrollAlContenido();
}

const descripcionAccionActual = computed(() => {
  switch (selectedAction.value) {
    case 'cotejar':
      return 'Recepcione muestras de campaña';
    case 'editar':
      return 'Edite datos solo para muestras en estado Pendiente.';
    case 'consultar':
      return 'Consulte muestras por folio, UPP, estatus y rango de fechas.';
    case 'eliminar':
      return 'Elimine muestras solo si están en estado Pendiente.';
    default:
      return '';
  }
});

watch(
  () => selectedAction.value,
  () => {
    errores.value = [];
    mensajeExito.value = '';
    mostrarAlertaCons.value = false;
    buscadoCons.value = false;
  }
);

function badgeEstatusClase(estatus) {
  if (estatus === 'Concluido') return 'badge--activo';
  if (estatus === 'Rechazado') return 'badge--inactivo';
  if (estatus === 'Pendiente') return 'badge--proceso';
  return 'badge--proceso';
}

/* ===================== DEMO DATA (SIN BD AÚN) ===================== */
const muestrasDemo = ref([
  {
    id: 1,
    id_muestra: 'M-0001-2025',
    upp: '30-025-1055-001',
    especie: 'Bovino',
    tipo_muestra: 'Suero sanguíneo',
    fecha_recepcion: '2025-12-14',
    estatus: 'Pendiente',
    origen_servicio: 'Campaña',
    arete: '',
    observacion: ''
  },
  {
    id: 2,
    id_muestra: 'M-0002-2025',
    upp: '30-001-0001-001',
    especie: 'Bovino',
    tipo_muestra: 'Suero sanguíneo',
    fecha_recepcion: '2025-12-14',
    estatus: 'En proceso',
    origen_servicio: 'Campaña',
    arete: '301152005',
    observacion: 'Muestra con etiqueta parcialmente dañada'
  }
]);

/* ===================== 1) RECEPCIONAR (COTEJAR) - SOLO CAMPAÑA ===================== */
const filtrosCamp = ref({ hoja: '', upp: '' });
const buscadoCamp = ref(false);
const mostrarAlertaCamp = ref(false);

const lotesCampaniaDemo = ref([
  {
    id: 101,
    folio_recepcion: 'REC-2025-001',
    fecha_recepcion: '2025-12-14',
    upp: '30-025-1055-001',
    hoja_control_campo: 'CC-5409818',
    especie: 'Bovino',
    total_muestras: 4,
    muestras: [
      { id: 1001, folio_muestra: 'M-0001-2025', arete: '' },
      { id: 1002, folio_muestra: 'M-0004-2025', arete: '' },
      { id: 1003, folio_muestra: 'M-0005-2025', arete: '' },
      { id: 1004, folio_muestra: 'M-0006-2025', arete: '' }
    ]
  }
]);

function hayAlMenosUnFiltroCamp() {
  const f = filtrosCamp.value;
  return f.hoja.trim() || f.upp.trim();
}

function buscarCampania() {
  mostrarAlertaCamp.value = false;
  if (!hayAlMenosUnFiltroCamp()) {
    buscadoCamp.value = false;
    mostrarAlertaCamp.value = true;
    return;
  }
  buscadoCamp.value = true;
}

function limpiarCampania() {
  filtrosCamp.value = { hoja: '', upp: '' };
  buscadoCamp.value = false;
  mostrarAlertaCamp.value = false;
}

const lotesCampFiltrados = computed(() => {
  if (!buscadoCamp.value) return [];
  const f = filtrosCamp.value;
  const hoja = f.hoja.trim().toLowerCase();
  const upp = f.upp.trim().toLowerCase();

  return lotesCampaniaDemo.value.filter(l => {
    const okHoja = hoja ? l.hoja_control_campo.toLowerCase().includes(hoja) : true;
    const okUpp = upp ? l.upp.toLowerCase().includes(upp) : true;
    return okHoja && okUpp;
  });
});

const loteSeleccionado = ref(null);
function seleccionarLote(lote) {
  errores.value = [];
  mensajeExito.value = '';
  loteSeleccionado.value = JSON.parse(JSON.stringify(lote));
}

function cancelarLote() {
  loteSeleccionado.value = null;
}

function confirmarRecepcionCampania() {
  errores.value = [];
  mensajeExito.value = '';

  if (!loteSeleccionado.value) {
    errores.value.push('Debe seleccionar un lote para cotejar.');
    return;
  }

  const alguno = loteSeleccionado.value.muestras.some(m => (m.arete || '').trim());
  if (!alguno) {
    errores.value.push('Capture al menos un número de arete para confirmar la recepción.');
    return;
  }

  imprimirTicketRecepcion({
    tipo_servicio: 'Campaña',
    total_muestras: Number(
      loteSeleccionado.value.total_muestras || loteSeleccionado.value.muestras.length || 0
    ),
    upp: loteSeleccionado.value.upp,
    hoja_control_campo: loteSeleccionado.value.hoja_control_campo,
    especie: loteSeleccionado.value.especie,
    recibio: 'RESPONSABLE DE LABORATORIO',
    fecha_recepcion: loteSeleccionado.value.fecha_recepcion
  });

  mensajeExito.value = 'Recepción confirmada. Ticket enviado a impresión.';
  cancelarLote();
}

/* ===================== 2) EDITAR (PENDIENTE) ===================== */
const filtrosEditar = ref({ folio: '', upp: '' });
const buscadoEditar = ref(false);
const mostrarAlertaEditar = ref(false);
const muestraEditando = ref(null);

function hayAlMenosUnFiltroEditar() {
  const f = filtrosEditar.value;
  return f.folio.trim() || f.upp.trim();
}

function buscarEditar() {
  mostrarAlertaEditar.value = false;
  if (!hayAlMenosUnFiltroEditar()) {
    buscadoEditar.value = false;
    mostrarAlertaEditar.value = true;
    return;
  }
  buscadoEditar.value = true;
}

function limpiarEditar() {
  filtrosEditar.value = { folio: '', upp: '' };
  buscadoEditar.value = false;
  mostrarAlertaEditar.value = false;
  muestraEditando.value = null;
}

const muestrasPendientesFiltradas = computed(() => {
  if (!buscadoEditar.value) return [];
  const f = filtrosEditar.value;
  const folio = f.folio.trim().toLowerCase();
  const upp = f.upp.trim().toLowerCase();

  return muestrasDemo.value.filter(m => {
    if (m.estatus !== 'Pendiente') return false;
    const okFolio = folio ? (m.id_muestra || '').toLowerCase().includes(folio) : true;
    const okUpp = upp ? (m.upp || '').toLowerCase().includes(upp) : true;
    return okFolio && okUpp;
  });
});

function seleccionarMuestraEdicion(m) {
  errores.value = [];
  mensajeExito.value = '';
  muestraEditando.value = { ...m };
}

function cancelarEdicionMuestra() {
  muestraEditando.value = null;
}

function guardarEdicionMuestra() {
  errores.value = [];
  mensajeExito.value = '';

  if (!muestraEditando.value) {
    errores.value.push('No hay muestra seleccionada para editar.');
    return;
  }

  const idx = muestrasDemo.value.findIndex(x => x.id === muestraEditando.value.id);
  if (idx === -1) {
    errores.value.push('No se encontró la muestra.');
    return;
  }

  if (muestrasDemo.value[idx].estatus !== 'Pendiente') {
    errores.value.push('Solo se puede editar si el estatus es Pendiente.');
    return;
  }

  muestrasDemo.value[idx] = { ...muestrasDemo.value[idx], ...muestraEditando.value };
  mensajeExito.value = 'Muestra actualizada.';
  muestraEditando.value = null;
}

/* ===================== 3) CONSULTAR ===================== */
const filtrosCons = ref({
  id_muestra: '',
  upp: '',
  estatus: '',
  fecha_inicio: '',
  fecha_fin: ''
});
const buscadoCons = ref(false);
const mostrarAlertaCons = ref(false);

function hayAlMenosUnFiltroCons() {
  const f = filtrosCons.value;
  return f.id_muestra.trim() || f.upp.trim() || f.estatus || f.fecha_inicio || f.fecha_fin;
}

function buscarConsultar() {
  mostrarAlertaCons.value = false;

  if (!hayAlMenosUnFiltroCons()) {
    buscadoCons.value = false;
    mostrarAlertaCons.value = true;
    return;
  }
  buscadoCons.value = true;
}

function limpiarConsultar() {
  filtrosCons.value = { id_muestra: '', upp: '', estatus: '', fecha_inicio: '', fecha_fin: '' };
  buscadoCons.value = false;
  mostrarAlertaCons.value = false;
}

const muestrasConsultadasFiltradas = computed(() => {
  if (!buscadoCons.value) return [];
  const f = filtrosCons.value;
  const id = f.id_muestra.trim().toLowerCase();
  const upp = f.upp.trim().toLowerCase();
  const est = f.estatus;
  const ini = f.fecha_inicio;
  const fin = f.fecha_fin;

  return muestrasDemo.value.filter(m => {
    const okId = id ? (m.id_muestra || '').toLowerCase().includes(id) : true;
    const okUpp = upp ? (m.upp || '').toLowerCase().includes(upp) : true;
    const okEst = est ? m.estatus === est : true;

    let okFecha = true;
    if (ini) okFecha = okFecha && m.fecha_recepcion >= ini;
    if (fin) okFecha = okFecha && m.fecha_recepcion <= fin;

    return okId && okUpp && okEst && okFecha;
  });
});

/* ===================== 4) ELIMINAR (PENDIENTE) ===================== */
const filtrosEliminar = ref({ folio: '', upp: '' });
const buscadoEliminar = ref(false);
const mostrarAlertaEliminar = ref(false);

function hayAlMenosUnFiltroEliminar() {
  const f = filtrosEliminar.value;
  return f.folio.trim() || f.upp.trim();
}

function buscarEliminar() {
  mostrarAlertaEliminar.value = false;
  if (!hayAlMenosUnFiltroEliminar()) {
    buscadoEliminar.value = false;
    mostrarAlertaEliminar.value = true;
    return;
  }
  buscadoEliminar.value = true;
}

function limpiarEliminar() {
  filtrosEliminar.value = { folio: '', upp: '' };
  buscadoEliminar.value = false;
  mostrarAlertaEliminar.value = false;
}

const muestrasPendientesEliminarFiltradas = computed(() => {
  if (!buscadoEliminar.value) return [];
  const f = filtrosEliminar.value;
  const folio = f.folio.trim().toLowerCase();
  const upp = f.upp.trim().toLowerCase();

  return muestrasDemo.value.filter(m => {
    if (m.estatus !== 'Pendiente') return false;
    const okFolio = folio ? (m.id_muestra || '').toLowerCase().includes(folio) : true;
    const okUpp = upp ? (m.upp || '').toLowerCase().includes(upp) : true;
    return okFolio && okUpp;
  });
});

function eliminarMuestraPendiente(m) {
  errores.value = [];
  mensajeExito.value = '';

  const idx = muestrasDemo.value.findIndex(x => x.id === m.id);
  if (idx === -1) {
    errores.value.push('No se encontró la muestra.');
    return;
  }
  if (muestrasDemo.value[idx].estatus !== 'Pendiente') {
    errores.value.push('Solo se puede eliminar si el estatus es Pendiente.');
    return;
  }

  const ok = window.confirm(`¿Desea eliminar la muestra "${m.id_muestra}"?`);
  if (!ok) return;

  muestrasDemo.value.splice(idx, 1);
  mensajeExito.value = 'Muestra eliminada (DEMO).';
}

/* ===================== TICKET (sin <script> embebido) ===================== */
function imprimirTicketRecepcion(ticket) {
  const w = window.open('', '_blank', 'width=520,height=680');
  if (!w) {
    alert('No se pudo abrir el ticket. Permite ventanas emergentes e intenta de nuevo.');
    return;
  }

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Ticket de Recepción</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 14px; }
          h2 { margin: 0 0 10px; }
          .row { margin: 6px 0; font-size: 13px; }
          .lbl { font-weight: 700; }
          hr { margin: 10px 0; }
          .center { text-align:center; color:#666; font-size:12px; margin-top:10px; }
        </style>
      </head>
      <body>
        <h2>Ticket de Recepción</h2>

        <div class="row"><span class="lbl">Tipo servicio:</span> ${escapeHtml(ticket.tipo_servicio || '—')}</div>
        <div class="row"><span class="lbl">UPP:</span> ${escapeHtml(ticket.upp || '—')}</div>
        <div class="row"><span class="lbl">Hoja control campo:</span> ${escapeHtml(ticket.hoja_control_campo || '—')}</div>
        <div class="row"><span class="lbl">Especie:</span> ${escapeHtml(ticket.especie || '—')}</div>

        <div class="row"><span class="lbl">Total muestras recepcionadas:</span> ${ticket.total_muestras ?? '—'}</div>

        <hr/>
        <div class="row"><span class="lbl">Recibió:</span> ${escapeHtml(ticket.recibio || '—')}</div>
        <div class="row"><span class="lbl">Fecha:</span> ${escapeHtml(ticket.fecha_recepcion || '—')}</div>

        <div class="center">Documento generado por SISTPEC</div>
      </body>
    </html>
  `;

  w.document.open();
  w.document.write(html);
  w.document.close();

  w.onload = () => {
    w.focus();
    w.print();
    w.onafterprint = () => w.close();
  };
}

function escapeHtml(str) {
  const s = String(str ?? '');
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
</script>

<style scoped>
/* Acciones */
.modulo-acciones { margin-bottom: 20px; }
.modulo-acciones-titulo { display:block; font-size:14px; margin-bottom:8px; color:#333; font-weight:600; }
.modulo-acciones-botones { display:flex; flex-wrap:wrap; gap:4px; }

/* Botón acción */
.sistpec-btn-accion{
  border:none; padding:8px 16px; font-size:12px; font-weight:600;
  text-transform:uppercase; border-radius:3px; cursor:pointer;
  background:#2f6b32; color:#fff; letter-spacing:0.5px;
}
.sistpec-btn-accion.active{ background:#244e26; }

/* Contenido */
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

/* ===================== FORM / FILTROS ===================== */
.sistpec-search-bar{
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  align-items: end;
}

/*  Para barras con 2 inputs + botones (Recepcionar/Editar/Eliminar) */
.sistpec-search-bar--acciones-2{
  grid-template-columns: 1fr 1fr 240px; 
}

.fechas-bar{ grid-template-columns: repeat(2, minmax(0, 1fr)); }

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

.sistpec-form-actions{
  display:flex; justify-content:flex-end; gap:8px;
}

/*  Botones */
.sistpec-search-actions{
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: flex-end;
  align-items: flex-end;
  margin-top: 18px;
}

/* Botones mismo ancho */
.sistpec-search-actions .sistpec-btn-primary,
.sistpec-search-actions .sistpec-btn-secondary{
  width: 220px;
}

/* botones */
.sistpec-btn-primary{
  background:#2f6b32; color:#fff; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:600; cursor:pointer;
}
.sistpec-btn-primary:hover{ background:#244e26; }

.sistpec-btn-secondary{
  background:#e0e0e0; color:#333; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:600; cursor:pointer;
}
.sistpec-btn-secondary:hover{ background:#d0d0d0; }

.sistpec-btn-danger{
  background:#7a061e; color:#fff; border:none;
  padding:6px 14px; border-radius:4px;
  font-size:12px; font-weight:600; cursor:pointer;
}
.sistpec-btn-danger:hover{ background:#5a0416; }

.sistpec-btn-sm{ padding:4px 10px; font-size:11px; }

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
.badge{ display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; }
.badge--activo{ background:#e1f3e1; color:#225522; }
.badge--inactivo{ background:#fbeaea; color:#7a1f1f; }
.badge--proceso{ background:#fff4e5; color:#b26a00; }

.input-inline{
  width:100%;
  padding:8px 10px;
  border-radius:4px;
  border:1px solid #ccc;
  font-size:14px;
  outline:none;
}

/* responsive */
@media (max-width: 768px) {
  .sistpec-search-bar { grid-template-columns: 1fr; }
  .fechas-bar { grid-template-columns: 1fr; }
  .sistpec-search-bar--acciones-2 { grid-template-columns: 1fr; }
  .sistpec-search-actions{
    align-items: stretch;
    margin-top: 0;
  }
  .sistpec-search-actions .sistpec-btn-primary,
  .sistpec-search-actions .sistpec-btn-secondary{
    width: 100%;
  }
}
</style>
