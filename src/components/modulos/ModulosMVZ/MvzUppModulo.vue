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

    <!-- ====================== 1) AGREGAR UPP ====================== -->
    <div v-if="selectedAction === 'agregar'">
      <h3 class="subtitulo">Agregar</h3>

      <form class="sistpec-form" @submit.prevent="guardarUpp">
        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Clave UPP</label>
            <input v-model="formUpp.clave_upp" type="text" placeholder="Ej. 30-025-1055-001" />
          </div>

          <div class="sistpec-form-group">
            <label>Nombre de la unidad / Rancho</label>
            <input v-model="formUpp.nombre_upp" type="text" placeholder="Ej. San Francisco" />
          </div>

          <div class="sistpec-form-group">
            <label>Propietario</label>
            <select v-model="formUpp.propietario_id">
              <option value="" disabled>Seleccione</option>
              <option v-for="p in propietariosActivosYFinados" :key="p.id" :value="p.id">
                {{ p.nombre_completo }} ({{ p.estatus }})
              </option>
            </select>
          </div>

          <div class="sistpec-form-group">
            <label>Estatus UPP</label>
            <select v-model="formUpp.estatus">
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </div>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Estado</label>
            <input v-model="formUpp.estado" type="text" placeholder="Ej. Veracruz" />
          </div>

          <div class="sistpec-form-group">
            <label>Municipio</label>
            <input v-model="formUpp.municipio" type="text" placeholder="Ej. Ayahualulco" />
          </div>

          <div class="sistpec-form-group">
            <label>Localidad</label>
            <input v-model="formUpp.localidad" type="text" placeholder="Ej. Los Altos" />
          </div>

          <div class="sistpec-form-group">
            <label>Código Postal</label>
            <input v-model="formUpp.codigo_postal" type="text" placeholder="Ej. 91260" />
          </div>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Latitud</label>
            <input v-model="formUpp.latitud" type="text" placeholder="Ej. 19.449141" />
          </div>

          <div class="sistpec-form-group">
            <label>Longitud</label>
            <input v-model="formUpp.longitud" type="text" placeholder="Ej. -97.200479" />
          </div>

          <div class="sistpec-form-group" style="grid-column: span 2;">
            <label>Observaciones (opcional)</label>
            <input v-model="formUpp.observaciones" type="text" placeholder="Notas" />
          </div>
        </div>

        <div class="sistpec-form-actions">
          <button type="submit" class="sistpec-btn-primary">GUARDAR UPP</button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarFormUpp">LIMPIAR</button>
        </div>
      </form>
    </div>

    <!-- ====================== 2) CONSULTAR UPP ====================== -->
    <div v-else-if="selectedAction === 'consultar'">
      <h3 class="subtitulo">Consultar</h3>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Clave UPP</label>
          <input v-model="filtros.clave_upp" type="text" placeholder="Ej. 30-025-1055-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Propietario</label>
          <input v-model="filtros.propietario" type="text" placeholder="Nombre o CURP" />
        </div>

        <div class="sistpec-form-group">
          <label>Municipio</label>
          <input v-model="filtros.municipio" type="text" placeholder="Ej. Ayahualulco" />
        </div>

        <div class="sistpec-form-group">
          <label>Estatus UPP</label>
          <select v-model="filtros.estatus_upp">
            <option value="">Todos</option>
            <option value="Activa">Activa</option>
            <option value="Inactiva">Inactiva</option>
          </select>
        </div>
      </div>

      <div class="sistpec-search-bar fechas-bar">
        <div class="sistpec-form-group">
          <label>Estatus propietario</label>
          <select v-model="filtros.estatus_prop">
            <option value="">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Finado">Finado</option>
          </select>
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscarUpp">BUSCAR</button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarBusqueda">LIMPIAR</button>
        </div>
      </div>

      <div v-if="buscado" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Clave UPP</th>
              <th>Nombre / Rancho</th>
              <th>Propietario</th>
              <th>Estatus propietario</th>
              <th>Municipio</th>
              <th>Estatus UPP</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="u in uppFiltradas" :key="u.id">
              <td>{{ u.clave_upp }}</td>
              <td>{{ u.nombre_upp || '-' }}</td>
              <td>{{ propietarioNombre(u.propietario_id) }}</td>
              <td>
                <span class="badge" :class="badgePropClase(propietarioEstatus(u.propietario_id))">
                  {{ propietarioEstatus(u.propietario_id) }}
                </span>
              </td>
              <td>{{ u.municipio || '-' }}</td>
              <td>
                <span class="badge" :class="badgeUppClase(u.estatus)">
                  {{ u.estatus }}
                </span>
              </td>
              <td>
                <div class="acciones">
                  <button type="button" class="sistpec-btn-secondary sistpec-btn-sm" @click="verDetalle(u)">
                    VER
                  </button>

                  <button
                    type="button"
                    class="sistpec-btn-secondary sistpec-btn-sm"
                    :disabled="!puedeEditarUpp(u)"
                    @click="abrirEdicion(u)"
                    title="Solo puede editar UPP registradas por usted."
                  >
                    EDITAR
                  </button>

                  <button
                    type="button"
                    class="sistpec-btn-primary sistpec-btn-sm"
                    :disabled="!puedeTrasladar(u)"
                    @click="abrirTraslado(u)"
                    title="Solo se permite traslado si el propietario actual está Finado."
                  >
                    TRASLADAR
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="uppFiltradas.length === 0">
              <td colspan="7" class="sin-resultados">No se encontraron UPP con esos criterios.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Panel detalle -->
      <div v-if="uppDetalle" class="sistpec-edit-panel">
        <h4 class="subtitulo-secundario">Detalle de UPP: {{ uppDetalle.clave_upp }}</h4>

        <div class="detalle-grid">
          <div><span class="lbl">Nombre:</span> {{ uppDetalle.nombre_upp || '-' }}</div>
          <div><span class="lbl">Propietario:</span> {{ propietarioNombre(uppDetalle.propietario_id) }}</div>
          <div><span class="lbl">Estado:</span> {{ uppDetalle.estado || '-' }}</div>
          <div><span class="lbl">Municipio:</span> {{ uppDetalle.municipio || '-' }}</div>
          <div><span class="lbl">Localidad:</span> {{ uppDetalle.localidad || '-' }}</div>
          <div><span class="lbl">CP:</span> {{ uppDetalle.codigo_postal || '-' }}</div>
          <div><span class="lbl">Lat:</span> {{ uppDetalle.latitud || '-' }}</div>
          <div><span class="lbl">Lng:</span> {{ uppDetalle.longitud || '-' }}</div>
          <div style="grid-column: span 2;">
            <span class="lbl">Obs:</span> {{ uppDetalle.observaciones || '-' }}
          </div>
        </div>

        <div class="sistpec-form-actions">
          <button type="button" class="sistpec-btn-secondary" @click="uppDetalle = null">CERRAR</button>
        </div>
      </div>
    </div>

    <!-- ====================== 3) EDITAR UPP ====================== -->
    <div v-else-if="selectedAction === 'editar'">
      <h3 class="subtitulo">Editar</h3>


      <div v-if="!uppEditando" class="modulo-alert modulo-alert--error">
        Seleccione una UPP desde <strong>CONSULTAR</strong> para editar.
      </div>

      <form v-else class="sistpec-form" @submit.prevent="guardarEdicionUpp">
        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Clave UPP</label>
            <input v-model="uppEditando.clave_upp" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>Nombre / Rancho</label>
            <input v-model="uppEditando.nombre_upp" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>Estatus UPP</label>
            <select v-model="uppEditando.estatus">
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </div>

          <div class="sistpec-form-group">
            <label>Propietario</label>
            <select v-model="uppEditando.propietario_id">
              <option value="" disabled>Seleccione</option>
              <option v-for="p in propietariosActivosYFinados" :key="p.id" :value="p.id">
                {{ p.nombre_completo }} ({{ p.estatus }})
              </option>
            </select>
          </div>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Estado</label>
            <input v-model="uppEditando.estado" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>Municipio</label>
            <input v-model="uppEditando.municipio" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>Localidad</label>
            <input v-model="uppEditando.localidad" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>Código Postal</label>
            <input v-model="uppEditando.codigo_postal" type="text" />
          </div>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Latitud</label>
            <input v-model="uppEditando.latitud" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>Longitud</label>
            <input v-model="uppEditando.longitud" type="text" />
          </div>

          <div class="sistpec-form-group" style="grid-column: span 2;">
            <label>Observaciones</label>
            <input v-model="uppEditando.observaciones" type="text" />
          </div>
        </div>

        <div class="sistpec-form-actions">
          <button type="submit" class="sistpec-btn-primary">GUARDAR CAMBIOS</button>
          <button type="button" class="sistpec-btn-secondary" @click="cancelarEdicion">CANCELAR</button>
        </div>
      </form>
    </div>

    <!-- ====================== 4) TRASLADAR UPP ====================== -->
    <div v-else-if="selectedAction === 'trasladar'">
      <h3 class="subtitulo">Trasladar</h3>

      <div v-if="!uppTrasladando" class="modulo-alert modulo-alert--error">
        Seleccione una UPP desde <strong>CONSULTAR</strong> y presione <strong>TRASLADAR</strong>.
      </div>

      <div v-else class="sistpec-edit-panel">
        <h4 class="subtitulo-secundario">UPP: {{ uppTrasladando.clave_upp }}</h4>

        <div class="detalle-grid" style="margin-bottom: 12px;">
          <div><span class="lbl">Propietario actual:</span> {{ propietarioNombre(uppTrasladando.propietario_id) }}</div>
          <div><span class="lbl">Estatus actual:</span> {{ propietarioEstatus(uppTrasladando.propietario_id) }}</div>
        </div>

        <form class="sistpec-form" @submit.prevent="confirmarTraslado">
          <div class="sistpec-form-row">
            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Nuevo propietario (solo Activo)</label>
              <select v-model="traslado.nuevo_propietario_id">
                <option value="" disabled>Seleccione</option>
                <option v-for="p in propietariosSoloActivos" :key="p.id" :value="p.id">
                  {{ p.nombre_completo }}
                </option>
              </select>
            </div>

            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Motivo / Observación (opcional)</label>
              <input v-model="traslado.observaciones" type="text" placeholder="Ej. Cambio de titular por fallecimiento" />
            </div>
          </div>

          <div class="sistpec-form-actions">
            <button type="submit" class="sistpec-btn-primary">CONFIRMAR TRASLADO</button>
            <button type="button" class="sistpec-btn-secondary" @click="cancelarTraslado">CANCELAR</button>
          </div>
        </form>
      </div>
    </div>

    <!-- fallback -->
    <div v-else>
      <h3 class="subtitulo">Acción no disponible</h3>
      <p>El contenido para esta acción aún está en desarrollo.</p>
    </div>
  </section>
</template>

// ==================== EMPIEZAN CAMBIOS ====================
// Se importaron servicios para conectar con el backend
// ==================== EMPIEZAN CAMBIOS ====================
<script setup>
import { computed, nextTick, ref, watch, onMounted } from 'vue';
import { uppService } from '@/services/api';
import { propietariosService } from '@/services/api';
// ==================== TERMINAN CAMBIOS ====================

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
const acciones = [
  { id: 'agregar', label: 'AGREGAR' },
  { id: 'consultar', label: 'CONSULTAR' },
  { id: 'editar', label: 'EDITAR' },
  { id: 'trasladar', label: 'TRASLADAR' }
];

const selectedAction = ref('agregar');
const errores = ref([]);
const mensajeExito = ref('');
// ==================== EMPIEZAN CAMBIOS ====================
// Se agregó estado de carga
// ==================== EMPIEZAN CAMBIOS ====================
const cargando = ref(false);
// ==================== TERMINAN CAMBIOS ====================

function cambiarAccion(id) {
  selectedAction.value = id;
  scrollAlContenido();
}

const descripcionAccionActual = computed(() => {
  switch (selectedAction.value) {
    case 'agregar':
      return 'Registre una UPP asociada a un propietario.';
    case 'consultar':
      return 'Busque UPP por clave, propietario, municipio y estatus.';
    case 'editar':
      return 'Edite solo las UPP registradas por usted.';
    case 'trasladar':
      return 'Traslade una UPP a otro propietario Activo cuando el propietario actual esté Finado.';
    default:
      return '';
  }
});

watch(
  () => selectedAction.value,
  () => {
    errores.value = [];
    mensajeExito.value = '';
  }
);

// ==================== EMPIEZAN CAMBIOS ====================
// Se eliminaron datos mock y se cargará del backend
// ==================== EMPIEZAN CAMBIOS ====================
const propietariosList = ref([]);

const propietariosActivosYFinados = computed(() => propietariosList.value);
const propietariosSoloActivos = computed(() => propietariosList.value.filter(p => p.estatus === 'Activo'));

async function cargarPropietarios() {
  try {
    const response = await propietariosService.consultar({ limit: 500 });
    propietariosList.value = response.data.map(p => ({
      id: p.id_propietario,
      curp: p.curp,
      nombre_completo: `${p.apellido_paterno} ${p.apellido_materno || ''} ${p.nombre}`.trim(),
      estatus: p.activo ? 'Activo' : 'Finado'
    }));
  } catch (error) {
    console.error('Error al cargar propietarios:', error);
  }
}
// ==================== TERMINAN CAMBIOS ====================

// ==================== EMPIEZAN CAMBIOS ====================
// Se eliminaron datos mock de UPP y se cargará del backend
// ==================== EMPIEZAN CAMBIOS ====================
const uppList = ref([]);

async function cargarUpp() {
  try {
    const response = await uppService.consultar({ limit: 500 });
    uppList.value = response.data.map(u => ({
      id: u.id_upp,
      propietario_id: u.id_propietario,
      clave_upp: u.clave_upp,
      nombre_upp: u.nombre_predio,
      estado: u.estado,
      municipio: u.municipio,
      localidad: u.localidad,
      codigo_postal: u.codigo_postal,
      latitud: u.latitud || '',
      longitud: u.longitud || '',
      estatus: u.estatus ? 'Activa' : 'Inactiva',
      observaciones: ''
    }));
  } catch (error) {
    console.error('Error al cargar UPP:', error);
  }
}

onMounted(() => {
  cargarPropietarios();
  cargarUpp();
});
// ==================== TERMINAN CAMBIOS ====================

/* ===================== Helpers propietario ===================== */
function propietarioById(id) {
  return propietariosList.value.find(p => p.id === id) || null;
}
function propietarioNombre(id) {
  return propietarioById(id)?.nombre_completo || '—';
}
function propietarioEstatus(id) {
  return propietarioById(id)?.estatus || '—';
}

/* ===================== 1) Agregar UPP ===================== */
const formUpp = ref({
  clave_upp: '',
  nombre_upp: '',
  propietario_id: '',
  estado: '',
  municipio: '',
  localidad: '',
  codigo_postal: '',
  latitud: '',
  longitud: '',
  estatus: 'Activa',
  observaciones: ''
});

function limpiarFormUpp() {
  formUpp.value = {
    clave_upp: '',
    nombre_upp: '',
    propietario_id: '',
    estado: '',
    municipio: '',
    localidad: '',
    codigo_postal: '',
    latitud: '',
    longitud: '',
    estatus: 'Activa',
    observaciones: ''
  };
}

// ==================== EMPIEZAN CAMBIOS ====================
// Se convirtió a async y se integró con backend
// ==================== EMPIEZAN CAMBIOS ====================
async function guardarUpp() {
  errores.value = [];
  mensajeExito.value = '';

  const f = formUpp.value;

  if (!String(f.clave_upp || '').trim()) errores.value.push('Capture la clave UPP.');
  if (!String(f.propietario_id || '').trim()) errores.value.push('Seleccione un propietario.');
  if (!String(f.estado || '').trim()) errores.value.push('Capture el estado.');
  if (!String(f.municipio || '').trim()) errores.value.push('Capture el municipio.');
  if (errores.value.length) return;

  const prop = propietarioById(Number(f.propietario_id));
  if (!prop) return errores.value.push('Propietario no válido.');
  if (prop.estatus === 'Finado') return errores.value.push('No se permite registrar una nueva UPP a nombre de un propietario Finado.');

  cargando.value = true;
  try {
    await uppService.crear({
      clave_upp: String(f.clave_upp).trim().toUpperCase(),
      nombre_predio: String(f.nombre_upp || '').trim(),
      id_propietario: Number(f.propietario_id),
      calle: null,
      municipio: String(f.municipio || '').trim(),
      localidad: String(f.localidad || '').trim(),
      codigo_postal: String(f.codigo_postal || '').trim() || null,
      estado: String(f.estado || '').trim(),
      latitud: f.latitud ? parseFloat(f.latitud) : null,
      longitud: f.longitud ? parseFloat(f.longitud) : null,
      estatus: f.estatus === 'Activa'
    });

    mensajeExito.value = 'UPP registrada exitosamente.';
    limpiarFormUpp();
    await cargarUpp(); // Recargar lista
  } catch (error) {
    if (error.response?.status === 400) {
      errores.value.push('La clave UPP ya existe. Verifique antes de guardar.');
    } else {
      errores.value.push('Error al registrar UPP en el servidor.');
    }
  } finally {
    cargando.value = false;
  }
}
// ==================== TERMINAN CAMBIOS ====================

/* ===================== 2) Consultar UPP ===================== */
const filtros = ref({ clave_upp: '', propietario: '', municipio: '', estatus_upp: '', estatus_prop: '' });
const buscado = ref(false);
const uppDetalle = ref(null);

function buscarUpp() {
  buscado.value = true;
  errores.value = [];
  mensajeExito.value = '';
}

function limpiarBusqueda() {
  filtros.value = { clave_upp: '', propietario: '', municipio: '', estatus_upp: '', estatus_prop: '' };
  buscado.value = false;
  uppDetalle.value = null;
  errores.value = [];
  mensajeExito.value = '';
}

// ==================== EMPIEZAN CAMBIOS ====================
// Se modificó para filtrar datos reales del backend
// ==================== EMPIEZAN CAMBIOS ====================
const uppFiltradas = computed(() => {
  if (!buscado.value) return [];
  const f = filtros.value;

  const clave = f.clave_upp.trim().toLowerCase();
  const prop = f.propietario.trim().toLowerCase();
  const mun = f.municipio.trim().toLowerCase();
  const estU = f.estatus_upp;
  const estP = f.estatus_prop;

  // Mostrar todas las UPP (no filtrar por mvz_user_id ya que ese control no existe en backend)
  const base = uppList.value;

  return base.filter(u => {
    const okClave = clave ? (u.clave_upp || '').toLowerCase().includes(clave) : true;
    const p = propietarioById(u.propietario_id);
    const textoProp = `${p?.nombre_completo || ''} ${p?.curp || ''}`.toLowerCase();
    const okProp = prop ? textoProp.includes(prop) : true;
    const okMun = mun ? (u.municipio || '').toLowerCase().includes(mun) : true;
    const okEstU = estU ? u.estatus === estU : true;
    const okEstP = estP ? (p?.estatus === estP) : true;
    return okClave && okProp && okMun && okEstU && okEstP;
  });
});
// ==================== TERMINAN CAMBIOS ====================

function verDetalle(u) {
  uppDetalle.value = { ...u };
}

/* ===================== 3) Editar UPP ===================== */
const uppEditando = ref(null);

// ==================== EMPIEZAN CAMBIOS ====================
// Se removió validación de mvz_user_id (no existe en backend)
// Ahora todos pueden editar cualquier UPP
// ==================== EMPIEZAN CAMBIOS ====================
function puedeEditarUpp(u) {
  return true; // Backend no tiene control de usuario MVZ
}
// ==================== TERMINAN CAMBIOS ====================

function abrirEdicion(u) {
  errores.value = [];
  mensajeExito.value = '';
  if (!puedeEditarUpp(u)) return errores.value.push('No tiene permisos para editar esta UPP.');
  uppEditando.value = { ...u };
  selectedAction.value = 'editar';
}

function cancelarEdicion() {
  uppEditando.value = null;
  selectedAction.value = 'consultar';
}

// ==================== EMPIEZAN CAMBIOS ====================
// Se convirtió a async y se integró con backend
// ==================== EMPIEZAN CAMBIOS ====================
async function guardarEdicionUpp() {
  errores.value = [];
  mensajeExito.value = '';

  if (!uppEditando.value) return errores.value.push('No hay UPP seleccionada para editar.');
  if (!puedeEditarUpp(uppEditando.value)) return errores.value.push('No tiene permisos para editar esta UPP.');

  const clave = String(uppEditando.value.clave_upp || '').trim();
  if (!clave) errores.value.push('La clave UPP es obligatoria.');
  if (!String(uppEditando.value.estado || '').trim()) errores.value.push('Estado obligatorio.');
  if (!String(uppEditando.value.municipio || '').trim()) errores.value.push('Municipio obligatorio.');

  const prop = propietarioById(Number(uppEditando.value.propietario_id));
  if (!prop) errores.value.push('Propietario no válido.');

  if (errores.value.length) return;

  cargando.value = true;
  try {
    await uppService.actualizar(uppEditando.value.id, {
      clave_upp: clave.toUpperCase(),
      nombre_predio: String(uppEditando.value.nombre_upp || '').trim(),
      id_propietario: Number(uppEditando.value.propietario_id),
      calle: null,
      municipio: String(uppEditando.value.municipio || '').trim(),
      localidad: String(uppEditando.value.localidad || '').trim(),
      codigo_postal: String(uppEditando.value.codigo_postal || '').trim() || null,
      estado: String(uppEditando.value.estado || '').trim(),
      latitud: uppEditando.value.latitud ? parseFloat(uppEditando.value.latitud) : null,
      longitud: uppEditando.value.longitud ? parseFloat(uppEditando.value.longitud) : null,
      estatus: uppEditando.value.estatus === 'Activa'
    });

    mensajeExito.value = 'UPP actualizada.';
    uppEditando.value = null;
    selectedAction.value = 'consultar';
    await cargarUpp(); // Recargar lista
  } catch (error) {
    if (error.response?.status === 400) {
      errores.value.push('La clave UPP ya existe en otro registro.');
    } else if (error.response?.status === 404) {
      errores.value.push('No se encontró la UPP para actualizar.');
    } else {
      errores.value.push('Error al actualizar UPP en el servidor.');
    }
  } finally {
    cargando.value = false;
  }
}
// ==================== TERMINAN CAMBIOS ====================

/* ===================== 4) Trasladar UPP ===================== */
const uppTrasladando = ref(null);
const traslado = ref({ nuevo_propietario_id: '', observaciones: '' });

// ==================== EMPIEZAN CAMBIOS ====================
// Se removió validación de mvz_user_id (no existe en backend)
// ==================== EMPIEZAN CAMBIOS ====================
function puedeTrasladar(u) {
  if (!u) return false;
  return propietarioEstatus(u.propietario_id) === 'Finado';
}
// ==================== TERMINAN CAMBIOS ====================

function abrirTraslado(u) {
  errores.value = [];
  mensajeExito.value = '';
  if (!puedeTrasladar(u)) return errores.value.push('Solo se permite trasladar si el propietario actual está Finado.');
  uppTrasladando.value = { ...u };
  traslado.value = { nuevo_propietario_id: '', observaciones: '' };
  selectedAction.value = 'trasladar';
}

function cancelarTraslado() {
  uppTrasladando.value = null;
  traslado.value = { nuevo_propietario_id: '', observaciones: '' };
  selectedAction.value = 'consultar';
}

// ==================== EMPIEZAN CAMBIOS ====================
// Se convirtió a async y se integró con backend
// ==================== EMPIEZAN CAMBIOS ====================
async function confirmarTraslado() {
  errores.value = [];
  mensajeExito.value = '';

  if (!uppTrasladando.value) return errores.value.push('No hay UPP seleccionada para traslado.');
  if (propietarioEstatus(uppTrasladando.value.propietario_id) !== 'Finado') return errores.value.push('El propietario actual no está en estatus Finado.');

  const nuevoId = Number(traslado.value.nuevo_propietario_id);
  if (!nuevoId) return errores.value.push('Seleccione el nuevo propietario.');

  const nuevoProp = propietarioById(nuevoId);
  if (!nuevoProp || nuevoProp.estatus !== 'Activo') return errores.value.push('El nuevo propietario debe estar Activo.');

  const ok = window.confirm(`¿Confirma trasladar la UPP "${uppTrasladando.value.clave_upp}" al propietario "${nuevoProp.nombre_completo}"?`);
  if (!ok) return;

  cargando.value = true;
  try {
    await uppService.actualizar(uppTrasladando.value.id, {
      id_propietario: nuevoId
    });

    mensajeExito.value = 'Traslado realizado exitosamente.';
    uppTrasladando.value = null;
    traslado.value = { nuevo_propietario_id: '', observaciones: '' };
    selectedAction.value = 'consultar';
    await cargarUpp(); // Recargar lista
  } catch (error) {
    if (error.response?.status === 404) {
      errores.value.push('No se encontró la UPP para traslado.');
    } else {
      errores.value.push('Error al realizar el traslado en el servidor.');
    }
  } finally {
    cargando.value = false;
  }
}
// ==================== TERMINAN CAMBIOS ====================

/* ===================== Badges ===================== */
function badgePropClase(estatus) {
  if (estatus === 'Activo') return 'badge--activo';
  if (estatus === 'Finado') return 'badge--inactivo';
  return 'badge--proceso';
}
function badgeUppClase(estatus) {
  if (estatus === 'Activa') return 'badge--activo';
  if (estatus === 'Inactiva') return 'badge--inactivo';
  return 'badge--proceso';
}
</script>

<style scoped>
.modulo-acciones { margin-bottom: 20px; }
.modulo-acciones-titulo { display:block; font-size:14px; margin-bottom:8px; color:#333; font-weight:700; }
.modulo-acciones-botones { display:flex; flex-wrap:wrap; gap:6px; }

.sistpec-btn-accion{
  border:none; padding:8px 14px; font-size:12px; font-weight:700;
  text-transform:uppercase; border-radius:4px; cursor:pointer;
  background:#2f6b32; color:#fff; letter-spacing:0.4px;
}
.sistpec-btn-accion.active{ background:#244e26; }

.modulo-contenido { margin-top: 10px; }
.subtitulo { font-size:18px; margin:10px 0 15px; color:#333; }
.subtitulo-secundario { font-size:16px; margin:16px 0 10px; color:#333; }

.sistpec-info-box{
  margin-top:10px; padding:10px 14px; border-radius:4px;
  background:#e1f3e1; border:1px solid #c3e6c3;
}
.sistpec-info-text{ margin:0; font-size:13px; color:#225522; }

.modulo-alert{ margin-bottom:12px; padding:10px 14px; border-radius:4px; font-size:13px; }
.modulo-alert--error{ background:#fbeaea; border:1px solid #f5c2c2; color:#7a1f1f; }
.modulo-alert--success{ background:#e1f3e1; border:1px solid #c3e6c3; color:#225522; }

.sistpec-form{ display:flex; flex-direction:column; gap:16px; }
.sistpec-form-row{ display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap:12px; }

.sistpec-form-group{ display:flex; flex-direction:column; gap:4px; }
.sistpec-form-group label{ font-size:13px; font-weight:700; color:#444; }
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

.sistpec-btn-primary{
  background:#2f6b32; color:#fff; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:800; cursor:pointer;
}
.sistpec-btn-primary:hover{ background:#244e26; }
.sistpec-btn-primary:disabled{ opacity:.5; cursor:not-allowed; }

.sistpec-btn-secondary{
  background:#e0e0e0; color:#333; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:800; cursor:pointer;
}
.sistpec-btn-secondary:hover{ background:#d0d0d0; }
.sistpec-btn-secondary:disabled{ opacity:.5; cursor:not-allowed; }

.sistpec-btn-sm{ padding:5px 10px; font-size:11px; }

.sistpec-search-bar{
  display:grid; grid-template-columns: repeat(4, minmax(0, 1fr));
  gap:12px; margin-bottom:16px;
}
.fechas-bar{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
.sistpec-search-actions{
  display:flex; align-items:flex-end; gap:8px; justify-content:flex-end;
}

.sistpec-table-wrapper{ width:100%; overflow-x:auto; }
.sistpec-table{ width:100%; border-collapse:collapse; font-size:13px; }
.sistpec-table thead{ background:#7a061e; color:#fff; }
.sistpec-table th, .sistpec-table td{ padding:8px 10px; border:1px solid #ddd; text-align:left; }
.sistpec-table tbody tr:nth-child(even){ background:#fafafa; }
.sin-resultados{ text-align:center; color:#777; }

.sistpec-edit-panel{
  margin-top:20px; padding-top:10px; border-top:1px dashed #ccc;
}

.acciones { display:flex; gap:6px; flex-wrap:wrap; }

.badge{ display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:800; }
.badge--activo{ background:#e1f3e1; color:#225522; border:1px solid #c3e6c3; }
.badge--inactivo{ background:#fbeaea; color:#7a1f1f; border:1px solid #f5c2c2; }
.badge--proceso{ background:#fff4e5; color:#b26a00; border:1px solid #ffd7a3; }

.detalle-grid{
  display:grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap:8px 12px;
  font-size:13px;
}
.lbl{ font-weight:800; color:#444; }

@media (max-width: 768px) {
  .sistpec-search-bar { grid-template-columns: 1fr; }
  .fechas-bar { grid-template-columns: 1fr; }
  .sistpec-form-row { grid-template-columns: 1fr; }
  .detalle-grid { grid-template-columns: 1fr; }
}
</style>
