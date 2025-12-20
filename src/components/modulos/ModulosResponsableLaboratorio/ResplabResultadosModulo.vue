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

    <!-- ====================== 1) REGISTRAR RESULTADOS ====================== -->
    <div v-if="selectedAction === 'registrar'">
      <h3 class="subtitulo">Registrar</h3>

      <div v-if="mostrarAlertaRegistrar" class="modulo-alert modulo-alert--error">
        Debe capturar <strong>al menos un criterio</strong> para buscar.
      </div>

      <!-- filtros de búsqueda de caso -->
      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input v-model="filtrosRegistrar.numero_caso" type="text" placeholder="Ej. BR25-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Hoja control campo</label>
          <input v-model="filtrosRegistrar.hoja_control_campo" type="text" placeholder="Ej. HCC-2025-020" />
        </div>

        <div class="sistpec-form-group">
          <label>UPP</label>
          <input v-model="filtrosRegistrar.upp" type="text" placeholder="Ej. 30-025-2000-001" />
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscarCasosRegistrar">
            BUSCAR
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarRegistrar">
            LIMPIAR
          </button>
        </div>
      </div>

      <!-- tabla casos -->
      <div v-if="buscadoRegistrar" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Número de caso</th>
              <th>Fecha recepción</th>
              <th>MVZ</th>
              <th>UPP</th>
              <th>Hoja campo</th>
              <th>Especie</th>
              <th>Total muestras</th>
              <th>Estatus resultados</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="c in casosRegistrarFiltrados" :key="c.id">
              <td><strong>{{ c.numero_caso }}</strong></td>
              <td>{{ c.fecha_recepcion }}</td>
              <td>{{ c.mvz }}</td>
              <td>{{ c.upp }}</td>
              <td>{{ c.hoja_control_campo }}</td>
              <td>{{ c.especie }}</td>
              <td>{{ c.muestras.length }}</td>
              <td>
                <span class="badge" :class="badgeEstatusClase(c.estatus_resultados)">
                  {{ c.estatus_resultados }}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  class="sistpec-btn-secondary sistpec-btn-sm"
                  @click="seleccionarCasoParaCaptura(c)"
                >
                  CAPTURAR
                </button>
              </td>
            </tr>

            <tr v-if="casosRegistrarFiltrados.length === 0">
              <td colspan="9" class="sin-resultados">
                No se encontraron casos con esos criterios.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- panel captura -->
      <div v-if="casoSeleccionado" class="sistpec-edit-panel">
        <h4 class="subtitulo-secundario">
          Capturando resultados: <strong>{{ casoSeleccionado.numero_caso }}</strong> · {{ casoSeleccionado.upp }}
        </h4>

        <div class="sistpec-info-box">
          <p class="sistpec-info-text">
            Total de muestras en hoja: <strong>{{ casoSeleccionado.muestras.length }}</strong>
          </p>
        </div>

        <div class="sistpec-table-wrapper">
          <table class="sistpec-table">
            <thead>
              <tr>
                <th>Folio muestra</th>
                <th>Arete</th>
                <th>Resultado</th>
                <th>Observaciones</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(m, idx) in casoSeleccionado.muestras" :key="m.id">
                <td>{{ m.folio_muestra }}</td>
                <td>{{ m.arete || '-' }}</td>
                <td>
                  <select v-model="casoSeleccionado.muestras[idx].resultado" class="input-inline">
                    <option value="">Seleccione</option>
                    <option value="Negativo">Negativo</option>
                    <option value="Positivo">Positivo</option>
                    <option value="Inconcluso">Inconcluso</option>
                    <option value="Rechazado">Rechazado</option>
                  </select>
                </td>
                <td>
                  <input
                    v-model="casoSeleccionado.muestras[idx].observaciones"
                    type="text"
                    class="input-inline"
                    placeholder="Ej. Muestra hemolizada / sin identificación / etc."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="sistpec-form-actions">
          <button type="button" class="sistpec-btn-secondary" @click="guardarResultadosPendiente">
            GUARDAR (PENDIENTE)
          </button>

          <button type="button" class="sistpec-btn-primary" @click="emitirEImprimirResultados">
            EMITIR + IMPRIMIR
          </button>

          <button type="button" class="sistpec-btn-secondary" @click="cancelarCaptura">
            CANCELAR
          </button>
        </div>

        <small class="ayuda">
          “Guardar (Pendiente)” permite editar/eliminar después. “Emitir + Imprimir” bloquea edición (estatus Emitido).
        </small>
      </div>
    </div>

    <!-- ====================== 2) CONSULTAR RESULTADOS ====================== -->
    <div v-else-if="selectedAction === 'consultar'">
      <h3 class="subtitulo">Consultar</h3>

      <div v-if="mostrarAlertaConsultar" class="modulo-alert modulo-alert--error">
        Debe capturar <strong>al menos un criterio</strong> para realizar la consulta.
      </div>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input v-model="filtrosConsultar.numero_caso" type="text" placeholder="Ej. BR25-001" />
        </div>

        <div class="sistpec-form-group">
          <label>UPP</label>
          <input v-model="filtrosConsultar.upp" type="text" placeholder="Ej. 30-025-2000-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Resultado</label>
          <select v-model="filtrosConsultar.resultado">
            <option value="">Todos</option>
            <option value="Negativo">Negativo</option>
            <option value="Positivo">Positivo</option>
            <option value="Inconcluso">Inconcluso</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>

        <div class="sistpec-form-group">
          <label>Estatus</label>
          <select v-model="filtrosConsultar.estatus">
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Emitido">Emitido</option>
          </select>
        </div>
      </div>

      <div class="sistpec-search-bar fechas-bar">
        <div class="sistpec-form-group sistpec-form-group-inline">
          <label>Fecha de captura</label>
          <div class="sistpec-form-inline-inputs">
            <input v-model="filtrosConsultar.fecha_inicio" type="date" />
            <span class="vigencia-sep">a</span>
            <input v-model="filtrosConsultar.fecha_fin" type="date" />
          </div>
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscarConsultar">
            BUSCAR
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarConsultar">
            LIMPIAR
          </button>
        </div>
      </div>

      <div class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Número de caso</th>
              <th>Folio muestra</th>
              <th>Arete</th>
              <th>Resultado</th>
              <th>Fecha captura</th>
              <th>Estatus</th>
              <th>Comentarios</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="r in resultadosConsultadosFiltrados" :key="r.id">
              <td><strong>{{ r.numero_caso }}</strong></td>
              <td>{{ r.folio_muestra }}</td>
              <td>{{ r.arete || '-' }}</td>
              <td>
                <span class="badge" :class="badgeResultado(r.resultado)">
                  {{ r.resultado }}
                </span>
              </td>
              <td>{{ r.fecha_captura }}</td>
              <td>
                <span class="badge" :class="badgeEstatusClase(r.estatus)">
                  {{ r.estatus }}
                </span>
              </td>
              <td>{{ r.observaciones?.trim() ? r.observaciones : '-' }}</td>
            </tr>

            <tr v-if="resultadosConsultadosFiltrados.length === 0">
              <td colspan="7" class="sin-resultados">Sin resultados con esos filtros.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ====================== 3) EDITAR (SOLO PENDIENTE) ====================== -->
    <div v-else-if="selectedAction === 'editar'">
      <h3 class="subtitulo">Editar</h3>

      <div v-if="mostrarAlertaEditar" class="modulo-alert modulo-alert--error">
        Debe capturar <strong>al menos un criterio</strong> para buscar.
      </div>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input v-model="filtrosEditar.numero_caso" type="text" placeholder="Ej. BR25-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Folio muestra</label>
          <input v-model="filtrosEditar.folio_muestra" type="text" placeholder="Ej. M-0001-2025" />
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscarEditar">
            BUSCAR
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarEditar">
            LIMPIAR
          </button>
        </div>
      </div>

      <div v-if="buscadoEditar" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Número de caso</th>
              <th>Folio muestra</th>
              <th>Resultado</th>
              <th>Fecha captura</th>
              <th>Estatus</th>
              <th>Comentarios</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="r in resultadosEditarFiltrados" :key="r.id">
              <td><strong>{{ r.numero_caso }}</strong></td>
              <td>{{ r.folio_muestra }}</td>
              <td>{{ r.resultado }}</td>
              <td>{{ r.fecha_captura }}</td>
              <td><span class="badge badge--proceso">Pendiente</span></td>
              <td>{{ r.observaciones?.trim() ? r.observaciones : '-' }}</td>
              <td>
                <button type="button" class="sistpec-btn-secondary sistpec-btn-sm" @click="seleccionarResultadoEdicion(r)">
                  EDITAR
                </button>
              </td>
            </tr>

            <tr v-if="resultadosEditarFiltrados.length === 0">
              <td colspan="7" class="sin-resultados">No hay resultados pendientes con esos criterios.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="resultadoEditando" class="sistpec-edit-panel">
        <h4 class="subtitulo-secundario">
          Editando: {{ resultadoEditando.numero_caso }} · {{ resultadoEditando.folio_muestra }}
        </h4>

        <div class="sistpec-form-grid">
          <div class="sistpec-form-group">
            <label>Resultado</label>
            <select v-model="resultadoEditando.resultado">
              <option value="">Seleccione</option>
              <option value="Negativo">Negativo</option>
              <option value="Positivo">Positivo</option>
              <option value="Inconcluso">Inconcluso</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>

          <div class="sistpec-form-group sistpec-form-group-full">
            <label>Comentarios</label>
            <input v-model="resultadoEditando.observaciones" type="text" placeholder="Ej. hemolizada, rechazada, sin arete, etc." />
          </div>
        </div>

        <div class="sistpec-form-actions">
          <button type="button" class="sistpec-btn-primary" @click="guardarEdicionResultado">
            GUARDAR CAMBIOS
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="cancelarEdicionResultado">
            CANCELAR
          </button>
        </div>
      </div>
    </div>

    <!-- ====================== 4) ELIMINAR (SOLO PENDIENTE) ====================== -->
    <div v-else-if="selectedAction === 'eliminar'">
      <h3 class="subtitulo">Eliminar</h3>

      <div v-if="mostrarAlertaEliminar" class="modulo-alert modulo-alert--error">
        Debe capturar <strong>al menos un criterio</strong> para buscar.
      </div>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input v-model="filtrosEliminar.numero_caso" type="text" placeholder="Ej. BR25-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Folio muestra</label>
          <input v-model="filtrosEliminar.folio_muestra" type="text" placeholder="Ej. M-0001-2025" />
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
              <th>Número de caso</th>
              <th>Folio muestra</th>
              <th>Resultado</th>
              <th>Fecha captura</th>
              <th>Estatus</th>
              <th>Comentarios</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="r in resultadosEliminarFiltrados" :key="r.id">
              <td><strong>{{ r.numero_caso }}</strong></td>
              <td>{{ r.folio_muestra }}</td>
              <td>{{ r.resultado }}</td>
              <td>{{ r.fecha_captura }}</td>
              <td><span class="badge badge--proceso">Pendiente</span></td>
              <td>{{ r.observaciones?.trim() ? r.observaciones : '-' }}</td>
              <td>
                <button type="button" class="sistpec-btn-danger sistpec-btn-sm" @click="eliminarResultado(r)">
                  ELIMINAR
                </button>
              </td>
            </tr>

            <tr v-if="resultadosEliminarFiltrados.length === 0">
              <td colspan="7" class="sin-resultados">No hay resultados pendientes con esos criterios.</td>
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
  { id: 'registrar', label: 'REGISTRAR' },
  { id: 'consultar', label: 'CONSULTAR' },
  { id: 'editar', label: 'EDITAR' },
  { id: 'eliminar', label: 'ELIMINAR' }
];

const selectedAction = ref('registrar');
const errores = ref([]);
const mensajeExito = ref('');

function cambiarAccion(id) {
  selectedAction.value = id;
  scrollAlContenido();
}

const descripcionAccionActual = computed(() => {
  switch (selectedAction.value) {
    case 'registrar':
      return 'Capture resultados por muestra y emita la hoja de resultados.';
    case 'consultar':
      return 'Consulte resultados capturados por filtros.';
    case 'editar':
      return 'Edite resultados únicamente si el estatus es Pendiente.';
    case 'eliminar':
      return 'Elimine resultados únicamente si el estatus es Pendiente.';
    default:
      return '';
  }
});

// Reset mensajes al cambiar acción
watch(
  () => selectedAction.value,
  () => {
    errores.value = [];
    mensajeExito.value = '';
    // no borro filtros para no frustrar, solo paneles
    casoSeleccionado.value = null;
    resultadoEditando.value = null;
  }
);

/* ===================== DEMO DATA ===================== */
const casosDemo = ref([
  {
    id: 1,
    numero_caso: 'BR25-001',
    fecha_recepcion: '2025-12-15',
    mvz: 'MVZ Juan Pérez',
    upp: '30-025-2000-001',
    hoja_control_campo: 'HCC-2025-020',
    especie: 'Bovino',
    estatus_resultados: 'Pendiente', // Pendiente | Emitido
    muestras: [
      { id: 11, folio_muestra: 'M-0001-2025', arete: '301152010', resultado: '', observaciones: '' },
      { id: 12, folio_muestra: 'M-0002-2025', arete: '301152011', resultado: '', observaciones: '' }
    ]
  },
  {
    id: 2,
    numero_caso: 'BR25-002',
    fecha_recepcion: '2025-12-16',
    mvz: 'MVZ Ana López',
    upp: '30-025-2000-010',
    hoja_control_campo: 'HCC-2025-021',
    especie: 'Bovino',
    estatus_resultados: 'Pendiente',
    muestras: [
      { id: 21, folio_muestra: 'M-0100-2025', arete: '301152111', resultado: '', observaciones: '' }
    ]
  },
  {
    id: 3,
    numero_caso: 'BR25-003',
    fecha_recepcion: '2025-12-17',
    mvz: 'MVZ Roberto Ruiz',
    upp: '30-025-2000-099',
    hoja_control_campo: 'HCC-2025-030',
    especie: 'Caprino',
    estatus_resultados: 'Emitido',
    muestras: [
      { id: 31, folio_muestra: 'M-0200-2025', arete: '900001', resultado: 'Negativo', observaciones: '' },
      { id: 32, folio_muestra: 'M-0201-2025', arete: '900002', resultado: 'Positivo', observaciones: 'Repetir prueba' }
    ]
  }
]);

/**
 * RESULTADOS capturados (normalizados por muestra) para consulta/editar/eliminar.
 * En producción, esto sería una tabla: resultados_muestras
 */
const resultadosDemo = ref([
  { id: 9001, numero_caso: 'BR25-003', folio_muestra: 'M-0200-2025', arete: '900001', resultado: 'Negativo', observaciones: '', fecha_captura: '2025-12-17', estatus: 'Emitido' },
  { id: 9002, numero_caso: 'BR25-003', folio_muestra: 'M-0201-2025', arete: '900002', resultado: 'Positivo', observaciones: 'Repetir prueba', fecha_captura: '2025-12-17', estatus: 'Emitido' }
]);

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ===================== 1) REGISTRAR ===================== */
const filtrosRegistrar = ref({ numero_caso: '', hoja_control_campo: '', upp: '' });
const buscadoRegistrar = ref(false);
const mostrarAlertaRegistrar = ref(false);

function hayAlMenosUnFiltroRegistrar() {
  const f = filtrosRegistrar.value;
  return f.numero_caso.trim() || f.hoja_control_campo.trim() || f.upp.trim();
}

function buscarCasosRegistrar() {
  errores.value = [];
  mensajeExito.value = '';
  casoSeleccionado.value = null;

  mostrarAlertaRegistrar.value = false;
  if (!hayAlMenosUnFiltroRegistrar()) {
    buscadoRegistrar.value = false;
    mostrarAlertaRegistrar.value = true;
    return;
  }
  buscadoRegistrar.value = true;
}

function limpiarRegistrar() {
  filtrosRegistrar.value = { numero_caso: '', hoja_control_campo: '', upp: '' };
  buscadoRegistrar.value = false;
  mostrarAlertaRegistrar.value = false;
  casoSeleccionado.value = null;
  errores.value = [];
  mensajeExito.value = '';
}

const casosRegistrarFiltrados = computed(() => {
  if (!buscadoRegistrar.value) return [];
  const f = filtrosRegistrar.value;
  const num = f.numero_caso.trim().toLowerCase();
  const hoja = f.hoja_control_campo.trim().toLowerCase();
  const upp = f.upp.trim().toLowerCase();

  return casosDemo.value.filter(c => {
    const okNum = num ? (c.numero_caso || '').toLowerCase().includes(num) : true;
    const okHoja = hoja ? (c.hoja_control_campo || '').toLowerCase().includes(hoja) : true;
    const okUpp = upp ? (c.upp || '').toLowerCase().includes(upp) : true;
    return okNum && okHoja && okUpp;
  });
});

const casoSeleccionado = ref(null);

function seleccionarCasoParaCaptura(caso) {
  errores.value = [];
  mensajeExito.value = '';

  if (caso.estatus_resultados === 'Emitido') {
    errores.value.push('Este caso ya tiene resultados Emitidos. No se permite recaptura desde este módulo.');
    return;
  }

  casoSeleccionado.value = JSON.parse(JSON.stringify(caso));
}

function cancelarCaptura() {
  casoSeleccionado.value = null;
}

function validarResultadosCaptura() {
  const errs = [];
  if (!casoSeleccionado.value) {
    errs.push('No hay caso seleccionado para capturar.');
    return errs;
  }
  const sinResultado = casoSeleccionado.value.muestras.some(m => !String(m.resultado || '').trim());
  if (sinResultado) errs.push('Hay muestras sin resultado. Capture el resultado de todas las muestras.');
  return errs;
}

function upsertResultadosDesdeCaso({ estatus }) {
  const fecha = hoyISO();
  const caso = casoSeleccionado.value;

  caso.muestras.forEach(m => {
    const keyNumeroCaso = caso.numero_caso;
    const keyFolio = m.folio_muestra;

    const idx = resultadosDemo.value.findIndex(r => r.numero_caso === keyNumeroCaso && r.folio_muestra === keyFolio);
    const payload = {
      numero_caso: keyNumeroCaso,
      folio_muestra: keyFolio,
      arete: m.arete || '',
      resultado: m.resultado,
      observaciones: m.observaciones || '',
      fecha_captura: fecha,
      estatus
    };

    if (idx === -1) {
      const newId = resultadosDemo.value.length ? Math.max(...resultadosDemo.value.map(x => x.id)) + 1 : 1;
      resultadosDemo.value.unshift({ id: newId, ...payload });
    } else {
      resultadosDemo.value[idx] = { ...resultadosDemo.value[idx], ...payload };
    }
  });

  const idxCaso = casosDemo.value.findIndex(c => c.id === caso.id);
  if (idxCaso !== -1) {
    casosDemo.value[idxCaso] = {
      ...casosDemo.value[idxCaso],
      estatus_resultados: estatus,
      muestras: JSON.parse(JSON.stringify(caso.muestras))
    };
  }
}

function guardarResultadosPendiente() {
  errores.value = [];
  mensajeExito.value = '';

  const errs = validarResultadosCaptura();
  if (errs.length) {
    errores.value = errs;
    return;
  }

  upsertResultadosDesdeCaso({ estatus: 'Pendiente' });
  mensajeExito.value = 'Resultados guardados en estatus Pendiente.';
}

function emitirEImprimirResultados() {
  errores.value = [];
  mensajeExito.value = '';

  const errs = validarResultadosCaptura();
  if (errs.length) {
    errores.value = errs;
    return;
  }

  upsertResultadosDesdeCaso({ estatus: 'Emitido' });

  const idxCaso = casosDemo.value.findIndex(c => c.id === casoSeleccionado.value.id);
  if (idxCaso !== -1) casosDemo.value[idxCaso].estatus_resultados = 'Emitido';

  imprimirHojaResultados(casoSeleccionado.value);

  mensajeExito.value = 'Resultados Emitidos. Hoja enviada a impresión.';
  casoSeleccionado.value = null;
}

/* ===================== IMPRESIÓN ===================== */
function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function imprimirHojaResultados(caso) {
  const w = window.open('', '_blank', 'width=900,height=720');
  if (!w) return;

  const filas = (caso.muestras || []).map((m, i) => `
    <tr>
      <td style="text-align:center;">${i + 1}</td>
      <td>${escapeHtml(m.folio_muestra)}</td>
      <td>${escapeHtml(m.arete || '-')}</td>
      <td><strong>${escapeHtml(m.resultado)}</strong></td>
      <td>${escapeHtml(m.observaciones || '')}</td>
    </tr>
  `).join('');

  w.document.write(`
    <html>
      <head>
        <title>Hoja de Resultados · ${escapeHtml(caso.numero_caso)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 18px; color:#111; }
          h2 { margin: 0 0 8px; }
          .meta { font-size: 13px; margin-bottom: 10px; display:grid; grid-template-columns: 1fr 1fr; gap:6px 12px; }
          .meta div { padding:4px 0; }
          .lbl { font-weight: 700; }
          table { width:100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th, td { border:1px solid #ccc; padding:8px; vertical-align: top; }
          th { background:#7a061e; color:#fff; text-align:left; }
          .foot { margin-top: 14px; font-size: 12px; color:#333; }
          @media print { .no-print { display:none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom:10px;">
          <button onclick="window.print()" style="padding:8px 14px; font-weight:700; cursor:pointer;">Imprimir</button>
        </div>

        <h2>Hoja de Resultados</h2>
        <div class="meta">
          <div><span class="lbl">Número de caso:</span> ${escapeHtml(caso.numero_caso)}</div>
          <div><span class="lbl">Fecha recepción:</span> ${escapeHtml(caso.fecha_recepcion)}</div>
          <div><span class="lbl">MVZ:</span> ${escapeHtml(caso.mvz)}</div>
          <div><span class="lbl">UPP:</span> ${escapeHtml(caso.upp)}</div>
          <div><span class="lbl">Hoja control campo:</span> ${escapeHtml(caso.hoja_control_campo)}</div>
          <div><span class="lbl">Especie:</span> ${escapeHtml(caso.especie)}</div>
          <div><span class="lbl">Total muestras:</span> ${escapeHtml((caso.muestras || []).length)}</div>
          <div><span class="lbl">Fecha emisión:</span> ${escapeHtml(hoyISO())}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:50px;">#</th>
              <th style="width:140px;">Folio muestra</th>
              <th style="width:160px;">Arete</th>
              <th style="width:130px;">Resultado</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>

        <div class="foot">
          <div><strong>Nota:</strong> Esta hoja se imprime para firma/sello y posterior digitalización (PDF).</div>
        </div>
      </body>
    </html>
  `);

  w.document.close();
  w.onload = () => {
    w.focus();
    w.print();
  };
}

/* ===================== 2) CONSULTAR ===================== */
const filtrosConsultar = ref({
  numero_caso: '',
  upp: '',
  resultado: '',
  estatus: '',
  fecha_inicio: '',
  fecha_fin: ''
});

const buscadoConsultar = ref(false);
const mostrarAlertaConsultar = ref(false);

function hayAlMenosUnFiltroConsultar() {
  const f = filtrosConsultar.value;
  return (
    f.numero_caso.trim() ||
    f.upp.trim() ||
    f.resultado ||
    f.estatus ||
    f.fecha_inicio ||
    f.fecha_fin
  );
}

function buscarConsultar() {
  errores.value = [];
  mensajeExito.value = '';

  mostrarAlertaConsultar.value = false;

  if (!hayAlMenosUnFiltroConsultar()) {
    buscadoConsultar.value = false;
    mostrarAlertaConsultar.value = true;
    return;
  }

  buscadoConsultar.value = true;
}

function limpiarConsultar() {
  filtrosConsultar.value = {
    numero_caso: '',
    upp: '',
    resultado: '',
    estatus: '',
    fecha_inicio: '',
    fecha_fin: ''
  };

  buscadoConsultar.value = false;
  mostrarAlertaConsultar.value = false;
}

const resultadosConsultadosFiltrados = computed(() => {
  if (!buscadoConsultar.value) return [];

  const f = filtrosConsultar.value;
  const num = f.numero_caso.trim().toLowerCase();
  const upp = f.upp.trim().toLowerCase();
  const res = f.resultado;
  const est = f.estatus;
  const ini = f.fecha_inicio;
  const fin = f.fecha_fin;

  return resultadosDemo.value.filter(r => {
    const okNum = num ? (r.numero_caso || '').toLowerCase().includes(num) : true;
    const okUpp = upp ? buscarUppPorCaso(r.numero_caso).toLowerCase().includes(upp) : true;
    const okRes = res ? r.resultado === res : true;
    const okEst = est ? r.estatus === est : true;

    let okFecha = true;
    if (ini) okFecha = okFecha && r.fecha_captura >= ini;
    if (fin) okFecha = okFecha && r.fecha_captura <= fin;

    return okNum && okUpp && okRes && okEst && okFecha;
  });
});

function buscarUppPorCaso(numeroCaso) {
  const c = casosDemo.value.find(x => x.numero_caso === numeroCaso);
  return c?.upp || '';
}

/* ===================== 3) EDITAR (PENDIENTE) ===================== */
const filtrosEditar = ref({ numero_caso: '', folio_muestra: '' });
const buscadoEditar = ref(false);
const mostrarAlertaEditar = ref(false);
const resultadoEditando = ref(null);

function hayAlMenosUnFiltroEditar() {
  const f = filtrosEditar.value;
  return f.numero_caso.trim() || f.folio_muestra.trim();
}

function buscarEditar() {
  errores.value = [];
  mensajeExito.value = '';
  resultadoEditando.value = null;

  mostrarAlertaEditar.value = false;
  if (!hayAlMenosUnFiltroEditar()) {
    buscadoEditar.value = false;
    mostrarAlertaEditar.value = true;
    return;
  }
  buscadoEditar.value = true;
}

function limpiarEditar() {
  filtrosEditar.value = { numero_caso: '', folio_muestra: '' };
  buscadoEditar.value = false;
  mostrarAlertaEditar.value = false;
  resultadoEditando.value = null;
}

const resultadosEditarFiltrados = computed(() => {
  if (!buscadoEditar.value) return [];
  const f = filtrosEditar.value;
  const num = f.numero_caso.trim().toLowerCase();
  const fol = f.folio_muestra.trim().toLowerCase();

  return resultadosDemo.value.filter(r => {
    if (r.estatus !== 'Pendiente') return false;
    const okNum = num ? (r.numero_caso || '').toLowerCase().includes(num) : true;
    const okFol = fol ? (r.folio_muestra || '').toLowerCase().includes(fol) : true;
    return okNum && okFol;
  });
});

function seleccionarResultadoEdicion(r) {
  errores.value = [];
  mensajeExito.value = '';
  resultadoEditando.value = { ...r };
}

function cancelarEdicionResultado() {
  resultadoEditando.value = null;
}

function guardarEdicionResultado() {
  errores.value = [];
  mensajeExito.value = '';

  if (!resultadoEditando.value) {
    errores.value.push('No hay resultado seleccionado para editar.');
    return;
  }
  if (!String(resultadoEditando.value.resultado || '').trim()) {
    errores.value.push('Seleccione un resultado.');
    return;
  }

  const idx = resultadosDemo.value.findIndex(x => x.id === resultadoEditando.value.id);
  if (idx === -1) {
    errores.value.push('No se encontró el resultado.');
    return;
  }

  if (resultadosDemo.value[idx].estatus !== 'Pendiente') {
    errores.value.push('Solo se puede editar si el estatus es Pendiente.');
    return;
  }

  resultadosDemo.value[idx] = { ...resultadosDemo.value[idx], ...resultadoEditando.value };

  const caso = casosDemo.value.find(c => c.numero_caso === resultadoEditando.value.numero_caso);
  if (caso) {
    const m = caso.muestras.find(mm => mm.folio_muestra === resultadoEditando.value.folio_muestra);
    if (m) {
      m.resultado = resultadoEditando.value.resultado;
      m.observaciones = resultadoEditando.value.observaciones || '';
    }
  }

  mensajeExito.value = 'Resultado actualizado.';
  resultadoEditando.value = null;
}

/* ===================== 4) ELIMINAR (PENDIENTE) ===================== */
const filtrosEliminar = ref({ numero_caso: '', folio_muestra: '' });
const buscadoEliminar = ref(false);
const mostrarAlertaEliminar = ref(false);

function hayAlMenosUnFiltroEliminar() {
  const f = filtrosEliminar.value;
  return f.numero_caso.trim() || f.folio_muestra.trim();
}

function buscarEliminar() {
  errores.value = [];
  mensajeExito.value = '';

  mostrarAlertaEliminar.value = false;
  if (!hayAlMenosUnFiltroEliminar()) {
    buscadoEliminar.value = false;
    mostrarAlertaEliminar.value = true;
    return;
  }
  buscadoEliminar.value = true;
}

function limpiarEliminar() {
  filtrosEliminar.value = { numero_caso: '', folio_muestra: '' };
  buscadoEliminar.value = false;
  mostrarAlertaEliminar.value = false;
}

const resultadosEliminarFiltrados = computed(() => {
  if (!buscadoEliminar.value) return [];
  const f = filtrosEliminar.value;
  const num = f.numero_caso.trim().toLowerCase();
  const fol = f.folio_muestra.trim().toLowerCase();

  return resultadosDemo.value.filter(r => {
    if (r.estatus !== 'Pendiente') return false;
    const okNum = num ? (r.numero_caso || '').toLowerCase().includes(num) : true;
    const okFol = fol ? (r.folio_muestra || '').toLowerCase().includes(fol) : true;
    return okNum && okFol;
  });
});

function eliminarResultado(r) {
  errores.value = [];
  mensajeExito.value = '';

  const idx = resultadosDemo.value.findIndex(x => x.id === r.id);
  if (idx === -1) {
    errores.value.push('No se encontró el resultado.');
    return;
  }
  if (resultadosDemo.value[idx].estatus !== 'Pendiente') {
    errores.value.push('Solo se puede eliminar si el estatus es Pendiente.');
    return;
  }

  const ok = window.confirm(`¿Desea eliminar el resultado de "${r.numero_caso} · ${r.folio_muestra}"?`);
  if (!ok) return;

  resultadosDemo.value.splice(idx, 1);

  const caso = casosDemo.value.find(c => c.numero_caso === r.numero_caso);
  if (caso) {
    const m = caso.muestras.find(mm => mm.folio_muestra === r.folio_muestra);
    if (m) {
      m.resultado = '';
      m.observaciones = '';
    }
    caso.estatus_resultados = 'Pendiente';
  }

  mensajeExito.value = 'Resultado eliminado.';
}

/* ===================== helpers UI ===================== */
function badgeEstatusClase(estatus) {
  if (estatus === 'Emitido') return 'badge--activo';
  if (estatus === 'Pendiente') return 'badge--proceso';
  return 'badge--proceso';
}

function badgeResultado(res) {
  if (res === 'Positivo') return 'badge--inactivo';
  if (res === 'Negativo') return 'badge--activo';
  return 'badge--proceso';
}
</script>

<style scoped>
/* Acciones */
.modulo-acciones { margin-bottom: 20px; }
.modulo-acciones-titulo { display:block; font-size:14px; margin-bottom:8px; color:#333; font-weight:900; }
.modulo-acciones-botones { display:flex; flex-wrap:wrap; gap:6px; }

/* Botón acción */
.sistpec-btn-accion{
  border:none; padding:8px 14px; font-size:12px; font-weight:900;
  text-transform:uppercase; border-radius:4px; cursor:pointer;
  background:#2f6b32; color:#fff; letter-spacing:0.4px;
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

.ayuda { color:#666; font-size:12px; margin-top:6px; display:block; }

/* Form / filtros */
.sistpec-form-grid {
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap:12px;
  margin: 10px 0 14px;
}

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

.sistpec-form-actions{
  display:flex; justify-content:flex-end; gap:8px;
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

.sistpec-btn-danger{
  background:#7a061e; color:#fff; border:none;
  padding:6px 14px; border-radius:4px;
  font-size:12px; font-weight:900; cursor:pointer;
}
.sistpec-btn-danger:hover{ background:#5a0416; }

.sistpec-btn-sm{ padding:5px 10px; font-size:11px; }

/* filtros grid */
.sistpec-search-bar{
  display:grid; grid-template-columns: repeat(4, minmax(0, 1fr));
  gap:12px; margin-bottom:16px;
}
.fechas-bar{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
.sistpec-search-actions{
  display:flex; align-items:flex-end; gap:8px; justify-content:flex-end;
}

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
  .sistpec-form-grid { grid-template-columns: 1fr; }
  .sistpec-form-actions { flex-direction:column; align-items:stretch; }
}
</style>
