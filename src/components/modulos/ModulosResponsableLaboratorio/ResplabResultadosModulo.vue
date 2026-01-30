<template>

  <!-- ===================== ACCIONES Modulo ResplabResultadosModulo ===================== -->
  <section class="modulo-acciones">
    <span class="modulo-acciones-titulo">Acciones disponibles</span>

    <div class="modulo-acciones-botones">
      <button
        v-for="a in acciones"
        :key="a.id"
        type="button"
        class="sistpec-btn-accion"
        :class="{ active: selectedAction === a.id }"
        @click="cambiarAccion(a.id)"
      >
        {{ a.label }}
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

    <!-- ===================== 1) REGISTRAR ===================== -->
    <div v-if="selectedAction === 'registrar'">
      <h3 class="subtitulo">Registrar/Capturar</h3>

      <!-- FILTROS / BÚSQUEDA -->
      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Hoja de control (CC No.)</label>
          <input v-model="filtros.cc_no" type="text" placeholder="Ej. 5409818" />
        </div>

        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input v-model="filtros.caso" type="text" placeholder="Ej. BR25-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Tarjeta</label>
          <input v-model="filtros.tarjeta" type="text" placeholder="Ej. 1" />
        </div>

        <div class="sistpec-form-group sistpec-search-actions right">
          <div class="acciones-vertical">
            <button class="sistpec-btn-primary" type="button" @click="buscarParaCaptura">
              BUSCAR
            </button>
            <button class="sistpec-btn-secondary" type="button" @click="limpiarFiltros">
              LIMPIAR
            </button>
          </div>
        </div>
      </div>

      <div v-if="cabeceraEncontrada" class="cabecera-info">
        <div><strong>CC No.:</strong> {{ cabecera.cc_no }}</div>
        <div><strong>Caso:</strong> {{ cabecera.caso }}</div>
        <div><strong>UPP:</strong> {{ cabecera.upp }}</div>
        <div><strong>MVZ:</strong> {{ cabecera.mvz }}</div>
        <div><strong>Fecha:</strong> {{ cabecera.fecha || '-' }}</div>
      </div>

      <!-- TABLA -->
      <div v-if="muestrasCaptura.length" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>#</th>
              <th>SNIIGA (Arete)</th>
              <th>Especie</th>
              <th>Edad (meses)</th>
              <th>Raza</th>
              <th>Sexo</th>
              <th>Fierro</th>

              <th>Tarjeta</th>
              <th>Resultado (tarjeta)</th>
              <th>Tubo</th>
              <th>Estado</th>
              <th>Fecha captura</th>
              <th>Observaciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(m, idx) in muestrasCaptura" :key="m.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ m.arete }}</td>
              <td>{{ m.especie }}</td>
              <td>{{ m.edad_meses }}</td>
              <td>{{ m.raza }}</td>
              <td>{{ m.sexo }}</td>
              <td>{{ m.fierro }}</td>

              <td>{{ m.tarjeta }}</td>

              <!-- Resultado (3 opciones) -->
              <td>
                <select v-model="m.resultado_tarjeta" class="input-mini">
                  <option value="">-</option>
                  <option v-for="op in OPCIONES_RESULTADO_TARJETA" :key="op" :value="op">
                    {{ op }}
                  </option>
                </select>
              </td>

              <td>
                <input v-model="m.tubo" type="text" class="input-mini" placeholder="Ej. 1" />
              </td>

              <td>
                <select v-model="m.estado" class="input-mini">
                  <option value="Pendiente">Pendiente</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </td>

              <td>
                <input v-model="m.fecha_captura" type="date" class="input-mini" />
              </td>

              <!-- Observaciones (catálogo + Otra) -->
              <td class="obs-cell">
                <select v-model="m.obs_opcion" class="input-mini">
                  <option value="">-</option>
                  <option v-for="op in OPCIONES_OBSERVACION" :key="op" :value="op">
                    {{ op }}
                  </option>
                </select>

                <input
                  v-if="m.obs_opcion === 'Otra'"
                  v-model="m.obs_otro"
                  type="text"
                  class="input-obs"
                  placeholder="Escriba la observación..."
                  style="margin-top:6px;"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div class="acciones-inferiores">
          <button class="sistpec-btn-primary" type="button" @click="guardarResultados">
            GUARDAR
          </button>

          <button
            class="sistpec-btn-secondary"
            type="button"
            :disabled="!puedeImprimir(muestrasCaptura)"
            @click="imprimirPDF('captura')"
          >
            IMPRIMIR / PDF
          </button>
        </div>

        <p v-if="!puedeImprimir(muestrasCaptura)" class="ayuda">
          Para imprimir, primero asegúrate de que cada fila tenga Resultado + Tubo + Fecha + Estado.
        </p>
      </div>

      <div v-else-if="buscadoCaptura" class="modulo-alert modulo-alert--error">
        No se encontraron muestras para los criterios capturados.
      </div>
    </div>

    <!-- ===================== 2) CONSULTAR ===================== -->
    <div v-else-if="selectedAction === 'consultar'">
      <h3 class="subtitulo">Consultar</h3>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>CC No.</label>
          <input v-model="filtros.cc_no" type="text" placeholder="Ej. 5409818" />
        </div>

        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input v-model="filtros.caso" type="text" placeholder="Ej. BR25-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Tarjeta</label>
          <input v-model="filtros.tarjeta" type="text" placeholder="Ej. 1" />
        </div>

        <div class="sistpec-form-group sistpec-search-actions right">
          <div class="acciones-vertical">
            <button class="sistpec-btn-primary" type="button" @click="consultarResultados">
              BUSCAR
            </button>
            <button class="sistpec-btn-secondary" type="button" @click="limpiarFiltros">
              LIMPIAR
            </button>
          </div>
        </div>
      </div>

      <!-- Botones de descarga -->
      <div v-if="resultadosConsulta.length > 0" class="sistpec-export-actions">
        <button type="button" class="sistpec-btn-export sistpec-btn-excel" @click="descargarExcel">
          DESCARGAR EXCEL
        </button>
        <button type="button" class="sistpec-btn-export sistpec-btn-pdf" @click="descargarPDFTabla">
          DESCARGAR PDF
        </button>
      </div>

      <div v-if="resultadosConsulta.length" class="sistpec-table-wrapper">
        <div class="acciones-inferiores">
          <button class="sistpec-btn-secondary" type="button" @click="imprimirPDF('consulta')">
            IMPRIMIR / PDF
          </button>
        </div>

        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Caso</th>
              <th>CC No.</th>
              <th>Tarjeta</th>
              <th>Arete</th>
              <th>Resultado</th>
              <th>Tubo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Observaciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="r in resultadosConsulta" :key="'c-' + r.id">
              <td>{{ r.caso }}</td>
              <td>{{ r.cc_no }}</td>
              <td>{{ r.tarjeta }}</td>
              <td>{{ r.arete }}</td>
              <td>{{ r.resultado_tarjeta || '-' }}</td>
              <td>{{ r.tubo || '-' }}</td>
              <td>{{ r.fecha_captura || '-' }}</td>
              <td>
                <span class="badge" :class="r.estado === 'Pendiente' ? 'badge--proceso' : 'badge--activo'">
                  {{ r.estado }}
                </span>
              </td>
              <td>{{ (r.observaciones && r.observaciones.trim()) ? r.observaciones : '-' }}</td>
            </tr>

            <tr v-if="resultadosConsulta.length === 0">
              <td colspan="9" class="sin-resultados">Sin coincidencias.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="buscadoConsulta" class="modulo-alert modulo-alert--error">
        No se encontraron resultados.
      </div>
    </div>

    <!-- ===================== 3) EDITAR (Pendiente) ===================== -->
    <div v-else-if="selectedAction === 'editar'">
      <h3 class="subtitulo">Editar</h3>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>CC No.</label>
          <input v-model="filtros.cc_no" type="text" placeholder="Ej. 5409818" />
        </div>

        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input v-model="filtros.caso" type="text" placeholder="Ej. BR25-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Tarjeta</label>
          <input v-model="filtros.tarjeta" type="text" placeholder="Ej. 1" />
        </div>

        <div class="sistpec-form-group sistpec-search-actions right">
          <div class="acciones-vertical">
            <button class="sistpec-btn-primary" type="button" @click="cargarPendientesParaEditar">
              BUSCAR
            </button>
            <button class="sistpec-btn-secondary" type="button" @click="limpiarFiltros">
              LIMPIAR
            </button>
          </div>
        </div>
      </div>

      <div v-if="resultadosEditar.length" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Caso</th>
              <th>CC No.</th>
              <th>Tarjeta</th>
              <th>Arete</th>
              <th>Resultado (tarjeta)</th>
              <th>Tubo</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Observaciones</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="r in resultadosEditar" :key="'e-' + r.id">
              <td>{{ r.caso }}</td>
              <td>{{ r.cc_no }}</td>
              <td>{{ r.tarjeta }}</td>
              <td>{{ r.arete }}</td>

              <!-- Resultado (3 opciones) -->
              <td>
                <select v-model="r.resultado_tarjeta" class="input-mini">
                  <option value="">-</option>
                  <option v-for="op in OPCIONES_RESULTADO_TARJETA" :key="op" :value="op">
                    {{ op }}
                  </option>
                </select>
              </td>

              <td><input v-model="r.tubo" type="text" class="input-mini" /></td>

              <td>
                <select v-model="r.estado" class="input-mini">
                  <option value="Pendiente">Pendiente</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </td>

              <td><input v-model="r.fecha_captura" type="date" class="input-mini" /></td>

              <!-- Observaciones (catálogo + Otra) -->
              <td class="obs-cell">
                <select v-model="r.obs_opcion" class="input-mini">
                  <option value="">-</option>
                  <option v-for="op in OPCIONES_OBSERVACION" :key="op" :value="op">
                    {{ op }}
                  </option>
                </select>

                <input
                  v-if="r.obs_opcion === 'Otra'"
                  v-model="r.obs_otro"
                  type="text"
                  class="input-obs"
                  placeholder="Escriba la observación..."
                  style="margin-top:6px;"
                />
              </td>

              <td>
                <button class="sistpec-btn-primary sistpec-btn-sm" type="button" @click="guardarEdicion(r)">
                  GUARDAR
                </button>
              </td>
            </tr>

            <tr v-if="resultadosEditar.length === 0">
              <td colspan="10" class="sin-resultados">No hay resultados pendientes con esos criterios.</td>
            </tr>
          </tbody>
        </table>

        <small class="ayuda">
          Solo se permite editar cuando el estado es <strong>Pendiente</strong>. Si está <strong>Entregado</strong>, ya no se puede editar.
        </small>
      </div>

      <div v-else-if="buscadoEditar" class="modulo-alert modulo-alert--error">
        No hay resultados Pendientes para editar con esos criterios.
      </div>
    </div>

    <!-- ===================== 4) ELIMINAR (Pendiente) ===================== -->
    <div v-else-if="selectedAction === 'eliminar'">
      <h3 class="subtitulo">Eliminar</h3>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>CC No.</label>
          <input v-model="filtros.cc_no" type="text" placeholder="Ej. 5409818" />
        </div>

        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input v-model="filtros.caso" type="text" placeholder="Ej. BR25-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Tarjeta</label>
          <input v-model="filtros.tarjeta" type="text" placeholder="Ej. 1" />
        </div>

        <div class="sistpec-form-group sistpec-search-actions right">
          <div class="acciones-vertical">
            <button class="sistpec-btn-primary" type="button" @click="cargarPendientesParaEliminar">
              BUSCAR
            </button>
            <button class="sistpec-btn-secondary" type="button" @click="limpiarFiltros">
              LIMPIAR
            </button>
          </div>
        </div>
      </div>

      <div v-if="resultadosEliminar.length" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Caso</th>
              <th>CC No.</th>
              <th>Tarjeta</th>
              <th>Arete</th>
              <th>Resultado</th>
              <th>Tubo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Observaciones</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="r in resultadosEliminar" :key="'d-' + r.id">
              <td>{{ r.caso }}</td>
              <td>{{ r.cc_no }}</td>
              <td>{{ r.tarjeta }}</td>
              <td>{{ r.arete }}</td>
              <td>{{ r.resultado_tarjeta || '-' }}</td>
              <td>{{ r.tubo || '-' }}</td>
              <td>{{ r.fecha_captura || '-' }}</td>
              <td><span class="badge badge--proceso">Pendiente</span></td>
              <td>{{ (r.observaciones && r.observaciones.trim()) ? r.observaciones : '-' }}</td>
              <td>
                <button class="sistpec-btn-danger sistpec-btn-sm" type="button" @click="eliminarResultado(r)">
                  ELIMINAR
                </button>
              </td>
            </tr>

            <tr v-if="resultadosEliminar.length === 0">
              <td colspan="10" class="sin-resultados">No hay resultados pendientes con esos criterios.</td>
            </tr>
          </tbody>
        </table>

        <small class="ayuda">
          El sistema solo permite eliminar si el resultado está <strong>Pendiente</strong> y debe guardar registro de quién lo hizo.
        </small>
      </div>

      <div v-else-if="buscadoEliminar" class="modulo-alert modulo-alert--error">
        No hay resultados Pendientes para eliminar con esos criterios.
      </div>
    </div>

    <!-- ===================== PRINT AREA ===================== -->
    <div ref="printAreaRef" class="print-area">
      <div class="print-header">
        <div class="print-title">SISTPEC - Resultados Brucelosis</div>

        <div class="print-sub">
          <div><strong>CC No.:</strong> {{ cabecera.cc_no || '-' }}</div>
          <div><strong>Caso:</strong> {{ cabecera.caso || '-' }}</div>
          <div><strong>UPP:</strong> {{ cabecera.upp || '-' }}</div>
          <div><strong>MVZ:</strong> {{ cabecera.mvz || '-' }}</div>
          <div><strong>Fecha:</strong> {{ cabecera.fecha || '-' }}</div>
        </div>
      </div>

      <table class="print-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Arete</th>
            <th>Especie</th>
            <th>Edad</th>
            <th>Raza</th>
            <th>Sexo</th>
            <th>Fierro</th>
            <th>Tarjeta</th>
            <th>Resultado</th>
            <th>Tubo</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Observaciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(m, i) in printRows" :key="'p-' + m.id">
            <td>{{ i + 1 }}</td>
            <td>{{ m.arete }}</td>
            <td>{{ m.especie }}</td>
            <td>{{ m.edad_meses }}</td>
            <td>{{ m.raza }}</td>
            <td>{{ m.sexo }}</td>
            <td>{{ m.fierro }}</td>
            <td>{{ m.tarjeta }}</td>
            <td>{{ m.resultado_tarjeta || '-' }}</td>
            <td>{{ m.tubo || '-' }}</td>
            <td>{{ m.estado || '-' }}</td>
            <td>{{ m.fecha_captura || '-' }}</td>
            <td>{{ (m.observaciones && m.observaciones.trim()) ? m.observaciones : '-' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="print-footer">
        <div>Generado desde SISTPEC</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, ref, onMounted } from 'vue';
import { resultadosService } from '@/services/api';

const moduloContenidoRef = ref(null);
const printAreaRef = ref(null);

function scrollAlContenido() {
  nextTick(() => {
    if (!moduloContenidoRef.value) return;
    const rect = moduloContenidoRef.value.getBoundingClientRect();
    const offset = 90;
    window.scrollTo({ top: rect.top + window.scrollY - offset, behavior: 'smooth' });
  });
}

/* ========= Catálogos (NUEVO) ========= */
const OPCIONES_RESULTADO_TARJETA = ['Positivo', 'Negativo', 'No aplica'];
const OPCIONES_OBSERVACION = ['Hemólisis', 'Contaminada', 'Insuficiente', 'Otra'];

function normalizarObservacion(row) {
  if (!row) return;
  if (row.obs_opcion === 'Otra') {
    row.observaciones = String(row.obs_otro || '').trim();
  } else if (row.obs_opcion) {
    row.observaciones = row.obs_opcion; // Hemólisis/Contaminada/Insuficiente
  } else {
    row.observaciones = '';
  }
}

function hidratarObservacionUI(row) {
  if (!row) return;
  const txt = String(row.observaciones || '').trim();
  if (!txt) {
    row.obs_opcion = '';
    row.obs_otro = '';
    return;
  }
  if (['Hemólisis', 'Contaminada', 'Insuficiente'].includes(txt)) {
    row.obs_opcion = txt;
    row.obs_otro = '';
  } else {
    row.obs_opcion = 'Otra';
    row.obs_otro = txt;
  }
}

/* Acciones */
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
  errores.value = [];
  mensajeExito.value = '';
  scrollAlContenido();
}

/* Descripción por acción */
const descripcionAccionActual = computed(() => {
  switch (selectedAction.value) {
    case 'registrar':
      return 'Busque por CC No., Número de caso o Tarjeta.';
    case 'consultar':
      return 'Consulte resultados.';
    case 'editar':
      return 'Edite únicamente resultados con estado Pendiente.';
    case 'eliminar':
      return 'Elimine únicamente resultados con estado Pendiente.';
    default:
      return '';
  }
});

/* Filtros */
const filtros = ref({ cc_no: '', caso: '', tarjeta: '' });
function limpiarFiltros() {
  filtros.value = { cc_no: '', caso: '', tarjeta: '' };
  errores.value = [];
  mensajeExito.value = '';
  buscadoCaptura.value = false;
  buscadoConsulta.value = false;
  buscadoEditar.value = false;
  buscadoEliminar.value = false;
  muestrasCaptura.value = [];
  resultadosConsulta.value = [];
  resultadosEditar.value = [];
  resultadosEliminar.value = [];
  cabeceraEncontrada.value = false;
  cabecera.value = { cc_no: '', caso: '', upp: '', mvz: '', fecha: '' };
}

/* Cabecera (para impresión) */
const cabeceraEncontrada = ref(false);
const cabecera = ref({ cc_no: '', caso: '', upp: '', mvz: '', fecha: '' });

/* ========= DEMO "BASE" ========= */
function hoyISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/* Simula registros existentes */
const dbResultados = ref([
  {
    id: 1,
    cc_no: '5409818',
    caso: 'BR25-001',
    upp: '30-025-1055-001',
    mvz: 'Jacinto Anastasio Cortés',
    fecha: hoyISO(),

    arete: '3064155716',
    especie: 'Bov',
    edad_meses: 127,
    raza: 'HF',
    sexo: 'H',
    fierro: 'AA',

    tarjeta: '1',

    resultado_tarjeta: '',
    tubo: '',
    estado: 'Pendiente',
    fecha_captura: hoyISO(),

    // NUEVO UI (no rompe nada)
    obs_opcion: '',
    obs_otro: '',

    observaciones: ''
  },
  {
    id: 2,
    cc_no: '5409818',
    caso: 'BR25-001',
    upp: '30-025-1055-001',
    mvz: 'Jacinto Anastasio Cortés',
    fecha: hoyISO(),

    arete: '3075424421',
    especie: 'Bov',
    edad_meses: 32,
    raza: 'HF',
    sexo: 'H',
    fierro: 'ADA',

    tarjeta: '2',

    resultado_tarjeta: '',
    tubo: '',
    estado: 'Pendiente',
    fecha_captura: hoyISO(),

    obs_opcion: '',
    obs_otro: '',

    observaciones: ''
  },
  {
    id: 3,
    cc_no: '2369449',
    caso: 'BR25-010',
    upp: '30-010-0001-001',
    mvz: 'MVZ Ejemplo',
    fecha: hoyISO(),

    arete: '3011111111',
    especie: 'Bov',
    edad_meses: 24,
    raza: 'CB',
    sexo: 'H',
    fierro: '—',

    tarjeta: '1',

    // ajustado al nuevo catálogo
    resultado_tarjeta: 'Negativo',
    tubo: '1',
    estado: 'Entregado',
    fecha_captura: hoyISO(),

    // ejemplo: una observación de catálogo
    observaciones: 'Hemólisis',

    // UI (se hidrata al cargar)
    obs_opcion: '',
    obs_otro: ''
  }
]);

/* Helpers */
function normalizarFiltros() {
  return {
    cc: String(filtros.value.cc_no || '').trim(),
    cs: String(filtros.value.caso || '').trim().toUpperCase(),
    tj: String(filtros.value.tarjeta || '').trim()
  };
}

function filtrarBase({ soloPendiente = false } = {}) {
  const { cc, cs, tj } = normalizarFiltros();

  if (!cc && !cs && !tj) return [];

  return dbResultados.value.filter(x => {
    const okCC = cc ? x.cc_no === cc : true;
    const okCS = cs ? x.caso === cs : true;
    const okTJ = tj ? String(x.tarjeta) === tj : true;
    const okPend = soloPendiente ? x.estado === 'Pendiente' : true;
    return okCC && okCS && okTJ && okPend;
  });
}

function setCabeceraDesde(rows) {
  if (!rows.length) return;
  cabecera.value = {
    cc_no: rows[0].cc_no,
    caso: rows[0].caso,
    upp: rows[0].upp,
    mvz: rows[0].mvz,
    fecha: rows[0].fecha || hoyISO()
  };
  cabeceraEncontrada.value = true;
}

/* ===================== REGISTRAR ===================== */
const buscadoCaptura = ref(false);
const muestrasCaptura = ref([]);

async function buscarParaCaptura() {
  errores.value = [];
  mensajeExito.value = '';
  cabeceraEncontrada.value = false;
  buscadoCaptura.value = false;
  muestrasCaptura.value = [];

  const rows = filtrarBase({ soloPendiente: false });
  buscadoCaptura.value = true;

  if (!rows.length) return;

  setCabeceraDesde(rows);

  // Copia editable para capturar + hidrata UI obs
  muestrasCaptura.value = rows.map(r => {
    const x = { ...r };
    hidratarObservacionUI(x);
    return x;
  });

  mensajeExito.value = `Se cargaron ${muestrasCaptura.value.length} registros.`;
  scrollAlContenido();
}

function validarCaptura(rows) {
  const faltantes = [];
  rows.forEach((m, i) => {
    const fila = i + 1;

    if (!String(m.resultado_tarjeta || '').trim()) faltantes.push(`Fila ${fila}: falta Resultado (Tarjeta).`);
    if (!String(m.tubo || '').trim()) faltantes.push(`Fila ${fila}: falta Tubo.`);
    if (!String(m.fecha_captura || '').trim()) faltantes.push(`Fila ${fila}: falta Fecha de captura.`);
    if (!String(m.estado || '').trim()) faltantes.push(`Fila ${fila}: falta Estado.`);

    // Observación "Otra" requiere texto
    if (m.obs_opcion === 'Otra' && !String(m.obs_otro || '').trim()) {
      faltantes.push(`Fila ${fila}: capture la observación manual (Otra).`);
    }
  });
  return faltantes;
}

function puedeImprimir(rows) {
  if (!rows || !rows.length) return false;
  return validarCaptura(rows).length === 0;
}

async function guardarResultados() {
  errores.value = [];
  mensajeExito.value = '';

  if (!muestrasCaptura.value.length) {
    errores.value.push('Primero cargue registros con la búsqueda.');
    return;
  }

  // normaliza observaciones antes de validar/guardar
  muestrasCaptura.value.forEach(row => normalizarObservacion(row));

  const faltantes = validarCaptura(muestrasCaptura.value);
  if (faltantes.length) {
    errores.value = faltantes;
    return;
  }

  // DEMO persist
  muestrasCaptura.value.forEach(editRow => {
    const idx = dbResultados.value.findIndex(x => x.id === editRow.id);
    if (idx >= 0) dbResultados.value[idx] = { ...dbResultados.value[idx], ...editRow };
  });

  mensajeExito.value = 'Resultados guardados correctamente.';
}

/* ===================== CONSULTAR ===================== */
const buscadoConsulta = ref(false);
const resultadosConsulta = ref([]);

async function consultarResultados() {
  errores.value = [];
  mensajeExito.value = '';
  cabeceraEncontrada.value = false;
  buscadoConsulta.value = false;
  resultadosConsulta.value = [];

  const rows = filtrarBase({ soloPendiente: false });
  buscadoConsulta.value = true;

  if (!rows.length) return;

  setCabeceraDesde(rows);

  // lectura (normal) — no requiere UI
  resultadosConsulta.value = rows.map(r => ({ ...r }));

  mensajeExito.value = `Se cargaron ${resultadosConsulta.value.length} resultados.`;
  scrollAlContenido();
}

/* ===================== EDITAR (Pendiente) ===================== */
const buscadoEditar = ref(false);
const resultadosEditar = ref([]);

async function cargarPendientesParaEditar() {
  errores.value = [];
  mensajeExito.value = '';
  buscadoEditar.value = false;
  resultadosEditar.value = [];

  const rows = filtrarBase({ soloPendiente: true });
  buscadoEditar.value = true;

  if (!rows.length) return;

  resultadosEditar.value = rows.map(r => {
    const x = { ...r };
    hidratarObservacionUI(x);
    return x;
  });

  mensajeExito.value = `Se cargaron ${resultadosEditar.value.length} resultados Pendientes.`;
  scrollAlContenido();
}

async function guardarEdicion(r) {
  errores.value = [];
  mensajeExito.value = '';

  if (r.estado !== 'Pendiente' && r.estado !== 'Entregado') {
    errores.value.push('Estado inválido.');
    return;
  }

  // normaliza observación antes de validar/guardar
  normalizarObservacion(r);

  const faltantes = validarCaptura([r]);
  if (faltantes.length) {
    errores.value = faltantes;
    return;
  }

  // DEMO persist
  const idx = dbResultados.value.findIndex(x => x.id === r.id);
  if (idx >= 0) dbResultados.value[idx] = { ...dbResultados.value[idx], ...r };

  mensajeExito.value = 'Edición guardada correctamente.';
}

/* ===================== ELIMINAR (Pendiente) ===================== */
const buscadoEliminar = ref(false);
const resultadosEliminar = ref([]);

async function cargarPendientesParaEliminar() {
  errores.value = [];
  mensajeExito.value = '';
  buscadoEliminar.value = false;
  resultadosEliminar.value = [];

  const rows = filtrarBase({ soloPendiente: true });
  buscadoEliminar.value = true;

  if (!rows.length) return;

  resultadosEliminar.value = rows.map(r => ({ ...r }));
  mensajeExito.value = `Se cargaron ${resultadosEliminar.value.length} resultados Pendientes.`;
  scrollAlContenido();
}

async function eliminarResultado(r) {
  errores.value = [];
  mensajeExito.value = '';

  if (r.estado !== 'Pendiente') {
    errores.value.push('Solo se puede eliminar si el estado es Pendiente.');
    return;
  }

  const ok = window.confirm(
    `¿Seguro que deseas eliminar este resultado?\n\nCaso: ${r.caso}\nCC No.: ${r.cc_no}\nTarjeta: ${r.tarjeta}\nArete: ${r.arete}`
  );
  if (!ok) return;

  dbResultados.value = dbResultados.value.filter(x => x.id !== r.id);
  resultadosEliminar.value = resultadosEliminar.value.filter(x => x.id !== r.id);

  mensajeExito.value = 'Resultado eliminado correctamente.';
}

/* ===================== IMPRESIÓN / PDF ===================== */
const printRows = ref([]);

function imprimirPDF(origen) {
  if (origen === 'captura') {
    // normaliza observaciones para impresión
    muestrasCaptura.value.forEach(row => normalizarObservacion(row));
    printRows.value = muestrasCaptura.value.map(x => ({ ...x }));
  } else if (origen === 'consulta') {
    printRows.value = resultadosConsulta.value.map(x => ({ ...x }));
  } else {
    printRows.value = [];
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
  nextTick(() => window.print());
}

/* ===================== DESCARGAS ===================== */
function descargarExcel() {
  const datos = resultadosConsulta.value;
  if (datos.length === 0) return;

  const encabezados = ['Caso', 'CC No.', 'Tarjeta', 'Arete', 'Resultado', 'Tubo', 'Fecha', 'Estado', 'Observaciones'];
  const filas = datos.map(r => [
    r.caso || '',
    r.cc_no || '',
    r.tarjeta || '',
    r.arete || '',
    r.resultado_tarjeta || '',
    r.tubo || '',
    r.fecha_captura || '',
    r.estado || '',
    r.observaciones || ''
  ]);

  const bom = '\uFEFF';
  const csv = [encabezados, ...filas]
    .map(fila => fila.map(celda => `"${String(celda).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `resultados_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function descargarPDFTabla() {
  const datos = resultadosConsulta.value;
  if (datos.length === 0) return;

  const filasHTML = datos.map(r => {
    const badgeClass = r.estado === 'Pendiente' ? 'proceso' : 'activo';
    return `
    <tr>
      <td>${r.caso || ''}</td>
      <td>${r.cc_no || ''}</td>
      <td>${r.tarjeta || ''}</td>
      <td>${r.arete || ''}</td>
      <td>${r.resultado_tarjeta || '-'}</td>
      <td>${r.tubo || '-'}</td>
      <td>${r.fecha_captura || '-'}</td>
      <td><span class="badge ${badgeClass}">${r.estado || ''}</span></td>
      <td>${(r.observaciones && r.observaciones.trim()) ? r.observaciones : '-'}</td>
    </tr>
  `;
  }).join('');

  const tablaHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Resultados Brucelosis</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background-color: #7a061e; color: #fff; padding: 8px; text-align: left; }
        td { padding: 8px; border: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #fafafa; }
        .badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
        .activo { background: #e1f3e1; color: #225522; }
        .proceso { background: #fff4e5; color: #b26a00; }
        @media print {
          body { padding: 0; }
          @page { margin: 1cm; }
        }
      </style>
    </head>
    <body>
      <h1>Resultados Brucelosis - SISTPEC</h1>
      <table>
        <thead>
          <tr>
            <th>Caso</th>
            <th>CC No.</th>
            <th>Tarjeta</th>
            <th>Arete</th>
            <th>Resultado</th>
            <th>Tubo</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Observaciones</th>
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
/* ====== Acciones ====== */
.modulo-acciones { margin-bottom: 18px; }
.modulo-acciones-titulo { display:block; font-size:14px; margin-bottom:8px; color:#333; font-weight:600; }
.modulo-acciones-botones { display:flex; flex-wrap:wrap; gap:6px; }
.sistpec-btn-accion {
  border:none; padding:8px 16px; font-size:12px; font-weight:700;
  text-transform:uppercase; border-radius:3px; cursor:pointer;
  background:#2f6b32; color:#fff; letter-spacing:.5px;
}
.sistpec-btn-accion.active { background:#244e26; }
.sistpec-info-box { margin-top:10px; padding:10px 14px; border-radius:4px; background:#e1f3e1; border:1px solid #c3e6c3; }
.sistpec-info-text { margin:0; font-size:13px; color:#225522; }

/* ====== Layout ====== */
.modulo-contenido { margin-top:10px; }
.subtitulo { font-size:18px; margin:10px 0 15px; color:#333; }
.ayuda { font-size: 12px; color:#666; margin-top:8px; }

.modulo-alert { margin-bottom: 12px; padding: 10px 14px; border-radius: 4px; font-size: 13px; }
.modulo-alert--error { background:#fbeaea; border:1px solid #f5c2c2; color:#7a1f1f; }
.modulo-alert--success { background:#e1f3e1; border:1px solid #c3e6c3; color:#225522; }

/* ====== Filtros ====== */
.sistpec-search-bar {
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap:12px;
  margin-bottom:16px;
  align-items:end;
}
.sistpec-form-group { display:flex; flex-direction:column; gap:4px; }
.sistpec-form-group label { font-size:13px; font-weight:700; color:#444; }

.sistpec-form-group input,
.sistpec-form-group select {
  padding:8px 10px;
  border-radius:4px;
  border:1px solid #ccc;
  font-size:14px;
  outline:none;
}

.sistpec-search-actions.right { display:flex; justify-content:flex-end; }
.acciones-vertical{ display:flex; flex-direction:column; gap:10px; margin-top: 10px; }

.sistpec-btn-primary {
  background:#2f6b32; color:#fff; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:800; cursor:pointer;
}
.sistpec-btn-primary:hover { background:#244e26; }

.sistpec-btn-secondary {
  background:#e0e0e0; color:#333; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:800; cursor:pointer;
}
.sistpec-btn-secondary:hover { background:#d0d0d0; }
.sistpec-btn-secondary:disabled { opacity:.6; cursor:default; }

.sistpec-btn-sm { padding:6px 10px; font-size:12px; border-radius:4px; }
.sistpec-btn-danger {
  background:#a51d2d; color:#fff; border:none;
  padding:8px 14px; border-radius:4px;
  font-size:13px; font-weight:800; cursor:pointer;
}
.sistpec-btn-danger:hover { background:#861823; }

/* ====== Cabecera ====== */
.cabecera-info {
  display:grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap:10px;
  padding:10px 12px;
  background:#f7f7f7;
  border:1px solid #e2e2e2;
  border-radius:6px;
  margin: 0 0 12px 0;
  font-size: 13px;
}

/* ====== Tabla ====== */
.sistpec-table-wrapper { width:100%; overflow-x:auto; }
.sistpec-table { width:100%; border-collapse:collapse; font-size:13px; }
.sistpec-table thead { background:#7a061e; color:#fff; }
.sistpec-table th, .sistpec-table td {
  padding:8px 10px; border:1px solid #ddd; text-align:left; vertical-align:top;
}
.sistpec-table tbody tr:nth-child(even) { background:#fafafa; }

.input-mini { width: 100%; min-width: 90px; padding: 6px 8px; border:1px solid #cfcfcf; border-radius:4px; }
.obs-cell { min-width: 240px; }
.input-obs { width: 100%; padding: 6px 8px; border:1px solid #cfcfcf; border-radius:4px; }

.acciones-inferiores {
  display:flex;
  justify-content:flex-end;
  gap:10px;
  margin: 12px 0;
}

.sin-resultados { text-align:center; color:#777; }

/* ====== Badges ====== */
.badge { display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:900; }
.badge--proceso { background:#fff4e5; color:#b26a00; border:1px solid #ffd7a3; }
.badge--activo { background:#e1f3e1; color:#225522; border:1px solid #c3e6c3; }

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

/* ===================== PRINT ===================== */
.print-area { display: none; }

@media print {
  .modulo-acciones, .modulo-contenido > *:not(.print-area) { display: none !important; }
  .print-area { display: block !important; }

  .print-header { margin-bottom: 12px; }
  .print-title { font-size: 16px; font-weight: 900; margin-bottom: 6px; }
  .print-sub { display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; font-size: 12px; }

  .print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }
  .print-table th, .print-table td {
    border: 1px solid #000;
    padding: 4px 6px;
  }

  .print-footer { margin-top: 10px; font-size: 11px; }
}

@media (max-width: 900px) {
  .sistpec-search-bar { grid-template-columns: 1fr; }
  .cabecera-info { grid-template-columns: 1fr; }
}
</style>

