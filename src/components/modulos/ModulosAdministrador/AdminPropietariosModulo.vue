<template>
  <!-- Barra de acciones (botones Consultar / Editar / Eliminar) -->
  <section class="modulo-acciones">
    <span class="modulo-acciones-titulo">Acciones disponibles</span>

    <div class="modulo-acciones-botones">
      <button
        v-for="accion in accionesPropietarios"
        :key="accion.id"
        type="button"
        class="sistpec-btn-accion"
        :class="{ active: selectedAction === accion.id }"
        @click="cambiarAccion(accion.id)"
      >
        {{ accion.label }}
      </button>
    </div>

    <!-- Mensaje que cambia según la acción -->
    <div class="sistpec-info-box">
      <p class="sistpec-info-text">
        {{ descripcionAccionActual }}
      </p>
    </div>
  </section>

  <section class="modulo-contenido" ref="moduloContenidoRef">
    <!-- ALERTAS DE ERRORES -->
    <div
      v-if="errores.length"
      class="modulo-alert modulo-alert--error"
    >
      <ul>
        <li v-for="(err, index) in errores" :key="index">
          {{ err }}
        </li>
      </ul>
    </div>

    <!-- ALERTA DE ÉXITO -->
    <div
      v-if="mensajeExito"
      class="modulo-alert modulo-alert--success"
    >
      {{ mensajeExito }}
    </div>

    <!-- ================= CONSULTAR PROPIETARIOS ================= -->
    <div v-if="selectedAction === 'consultar'">
      <h3 class="subtitulo">Consultar</h3>

      <!-- Barra de filtros -->
      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>CURP</label>
          <input
            v-model="filtros.curp"
            type="text"
            placeholder="Ej. HEAC000101MDFRRL09"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Nombre del propietario</label>
          <input
            v-model="filtros.nombre"
            type="text"
            placeholder="Nombre y/o apellidos"
          />
        </div>

        <div class="sistpec-form-group">
          <label>UPP</label>
          <input
            v-model="filtros.upp"
            type="text"
            placeholder="Ej. VER-0001-2025"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Municipio</label>
          <input
            v-model="filtros.municipio"
            type="text"
            placeholder="Ej. Xalapa"
          />
        </div>
      </div>

      <!-- Botones buscar / limpiar -->
      <div class="sistpec-search-actions sistpec-search-actions-bottom">
        <button
          type="button"
          class="sistpec-btn-primary"
          @click="buscarPropietarios"
        >
          BUSCAR
        </button>
        <button
          type="button"
          class="sistpec-btn-secondary"
          @click="limpiarFiltros"
        >
          LIMPIAR FILTROS
        </button>
      </div>

      <!-- Tabla de resultados -->
      <div class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>CURP</th>
              <th>UPP</th>
              <th>Municipio</th>
              <th>Localidad</th>
              <th>Teléfono</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in propietariosFiltrados" :key="p.id">
              <td>{{ p.nombre_completo }}</td>
              <td>{{ p.curp }}</td>
              <td>{{ p.upp }}</td>
              <td>{{ p.municipio }}</td>
              <td>{{ p.localidad }}</td>
              <td>{{ p.telefono || '-' }}</td>
              <td>
                <span
                  class="badge"
                  :class="p.activo ? 'badge--activo' : 'badge--inactivo'"
                >
                  {{ p.activo ? 'ACTIVO' : 'FINADO' }}
                </span>
              </td>
            </tr>
            <tr v-if="propietariosFiltrados.length === 0">
              <td colspan="7" class="sin-resultados">
                No se encontraron propietarios con los criterios de búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= EDITAR PROPIETARIOS ================= -->
    <div v-else-if="selectedAction === 'editar'">
      <h3 class="subtitulo">Editar</h3>

      <!-- Filtros reutilizados -->
      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>CURP</label>
          <input
            v-model="filtros.curp"
            type="text"
            placeholder="Ej. HEAC000101MDFRRL09"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Nombre del propietario</label>
          <input
            v-model="filtros.nombre"
            type="text"
            placeholder="Nombre y/o apellidos"
          />
        </div>

        <div class="sistpec-form-group">
          <label>UPP</label>
          <input
            v-model="filtros.upp"
            type="text"
            placeholder="Ej. VER-0001-2025"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Municipio</label>
          <input
            v-model="filtros.municipio"
            type="text"
            placeholder="Ej. Xalapa"
          />
        </div>
      </div>

      <div class="sistpec-search-actions sistpec-search-actions-bottom">
        <button
          type="button"
          class="sistpec-btn-primary"
          @click="buscarPropietarios"
        >
          BUSCAR
        </button>
        <button
          type="button"
          class="sistpec-btn-secondary"
          @click="limpiarFiltros"
        >
          LIMPIAR FILTROS
        </button>
      </div>

      <!-- Tabla con botón Editar -->
      <div class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>CURP</th>
              <th>UPP</th>
              <th>Municipio</th>
              <th>Localidad</th>
              <th>Teléfono</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in propietariosFiltrados" :key="p.id">
              <td>{{ p.nombre_completo }}</td>
              <td>{{ p.curp }}</td>
              <td>{{ p.upp }}</td>
              <td>{{ p.municipio }}</td>
              <td>{{ p.localidad }}</td>
              <td>{{ p.telefono || '-' }}</td>
              <td>
                <span
                  class="badge"
                  :class="p.activo ? 'badge--activo' : 'badge--inactivo'"
                >
                  {{ p.activo ? 'ACTIVO' : 'FINADO' }}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  class="sistpec-btn-secondary sistpec-btn-sm"
                  @click="seleccionarPropietario(p)"
                >
                  EDITAR
                </button>
              </td>
            </tr>
            <tr v-if="propietariosFiltrados.length === 0">
              <td colspan="8" class="sin-resultados">
                No se encontraron propietarios con los criterios de búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Formulario de edición -->
      <div v-if="propietarioEditando" class="sistpec-edit-panel">
        <h4 class="subtitulo-secundario">
          Editando propietario: {{ propietarioEditando.nombre_completo }}
        </h4>

        <form class="sistpec-form" @submit.prevent="guardarCambiosPropietario">
          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Nombre</label>
              <input v-model="propietarioEditando.nombre" type="text" required />
            </div>

            <div class="sistpec-form-group">
              <label>Apellido paterno</label>
              <input v-model="propietarioEditando.apellido_paterno" type="text" required />
            </div>

            <div class="sistpec-form-group">
              <label>Apellido materno</label>
              <input v-model="propietarioEditando.apellido_materno" type="text" />
            </div>

            <div class="sistpec-form-group">
              <label>CURP</label>
              <input v-model="propietarioEditando.curp" type="text" required />
            </div>
          </div>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Teléfono</label>
              <input v-model="propietarioEditando.telefono" type="text" />
            </div>

            <div class="sistpec-form-group">
              <label>Correo electrónico</label>
              <input v-model="propietarioEditando.email" type="email" />
            </div>

            <div class="sistpec-form-group">
              <label>RFC</label>
              <input v-model="propietarioEditando.rfc" type="text" placeholder="RFC (opcional)" />
            </div>
          </div>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group sistpec-form-row-end">
              <label class="sistpec-checkbox">
                <input
                  v-model="propietarioEditando.activo"
                  type="checkbox"
                />
                <span>Propietario activo</span>
              </label>
            </div>
          </div>

          <div class="sistpec-form-actions">
            <button type="submit" class="sistpec-btn-primary">
              GUARDAR CAMBIOS
            </button>
            <button
              type="button"
              class="sistpec-btn-secondary"
              @click="cancelarEdicion"
            >
              CANCELAR
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ================= ELIMINAR / DESACTIVAR PROPIETARIOS ================= -->
    <div v-else-if="selectedAction === 'eliminar'">
      <h3 class="subtitulo">Cambiar estatus</h3>


      <!-- Filtros -->
      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>CURP</label>
          <input
            v-model="filtros.curp"
            type="text"
            placeholder="Ej. HEAC000101MDFRRL09"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Nombre del propietario</label>
          <input
            v-model="filtros.nombre"
            type="text"
            placeholder="Nombre y/o apellidos"
          />
        </div>

        <div class="sistpec-form-group">
          <label>UPP</label>
          <input
            v-model="filtros.upp"
            type="text"
            placeholder="Ej. VER-0001-2025"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Municipio</label>
          <input
            v-model="filtros.municipio"
            type="text"
            placeholder="Ej. Xalapa"
          />
        </div>
      </div>

      <div class="sistpec-search-actions sistpec-search-actions-bottom">
        <button
          type="button"
          class="sistpec-btn-primary"
          @click="buscarPropietarios"
        >
          BUSCAR
        </button>
        <button
          type="button"
          class="sistpec-btn-secondary"
          @click="limpiarFiltros"
        >
          LIMPIAR FILTROS
        </button>
      </div>

      <!-- Tabla con opción de desactivar / reactivar -->
      <div class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>CURP</th>
              <th>UPP</th>
              <th>Municipio</th>
              <th>Localidad</th>
              <th>Teléfono</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in propietariosFiltrados" :key="p.id">
              <td>{{ p.nombre_completo }}</td>
              <td>{{ p.curp }}</td>
              <td>{{ p.upp }}</td>
              <td>{{ p.municipio }}</td>
              <td>{{ p.localidad }}</td>
              <td>{{ p.telefono || '-' }}</td>
              <td>
                <span
                  class="badge"
                  :class="p.activo ? 'badge--activo' : 'badge--inactivo'"
                >
                  {{ p.activo ? 'ACTIVO' : 'FINADO' }}
                </span>
              </td>
              <td>
                <!-- Botón DESACTIVAR -->
                <button
                  type="button"
                  class="sistpec-btn-danger sistpec-btn-sm"
                  :disabled="!p.activo"
                  @click="desactivarPropietario(p)"
                >
                  DESACTIVAR
                </button>

                <!-- Botón REACTIVAR -->
                <button
                  type="button"
                  class="sistpec-btn-secondary sistpec-btn-sm"
                  :disabled="p.activo"
                  @click="reactivarPropietario(p)"
                  style="margin-left: 6px;"
                >
                  REACTIVAR
                </button>
              </td>
            </tr>
            <tr v-if="propietariosFiltrados.length === 0">
              <td colspan="8" class="sin-resultados">
                No se encontraron propietarios con los criterios de búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= Fallback (no debería ocurrir) ================= -->
    <div v-else>
      <h3 class="subtitulo">
        Acción no disponible
      </h3>
      <p>
        El contenido para esta acción aún está en desarrollo.
      </p>
    </div>
  </section>
</template>

<script setup>
// ==================== EMPIEZAN CAMBIOS ====================
// Se agregó el import del servicio de propietarios para conectar con el backend
// ==================== EMPIEZAN CAMBIOS ====================
import { computed, ref, watch, nextTick, onMounted } from 'vue';
import { propietariosService } from '@/services/api';

defineProps({
  codigo: { type: String, required: true },
  rol:    { type: String, required: true }
});
// ==================== TERMINAN CAMBIOS ====================

// Referencia para hacer scroll al contenido del módulo
const moduloContenidoRef = ref(null);

function scrollAlContenido() {
  nextTick(() => {
    if (!moduloContenidoRef.value) return;
    const rect = moduloContenidoRef.value.getBoundingClientRect();
    const offset = 90; // compensa la barra roja fija
    const top = rect.top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

// Cargar propietarios al montar el componente si la acción requiere datos
onMounted(() => {
  scrollAlContenido();
  if (selectedAction.value === 'consultar' || selectedAction.value === 'editar' || selectedAction.value === 'eliminar') {
    buscarPropietarios();
  }
});

// Acciones disponibles (solo consulta, edición y eliminación)
const accionesPropietarios = [
  { id: 'consultar', label: 'CONSULTAR' },
  { id: 'editar',    label: 'EDITAR' },
  { id: 'eliminar',  label: 'CAMBIAR ESTATUS' }
];

const selectedAction      = ref('consultar');
const propietarioEditando = ref(null);

const errores      = ref([]);
const mensajeExito = ref('');

// Helper para cambiar de acción + scroll
function cambiarAccion(accionId) {
  selectedAction.value = accionId;
  scrollAlContenido();
}

// Descripciones según acción
const descripcionAccionActual = computed(() => {
  switch (selectedAction.value) {
    case 'consultar':
      return 'Consulta el padrón de propietarios registrados en SISTPEC, con filtros por CURP, UPP y municipio.';
    case 'editar':
      return 'Edita los datos generales del propietario (nombre, CURP, UPP, domicilio y contacto).';
    case 'eliminar':
      return 'Realiza bajas lógicas de propietarios que ya no deban estar activos en SISTPEC.';
    default:
      return '';
  }
});

// Reset de mensajes al cambiar de acción
watch(
  () => selectedAction.value,
  (newAction) => {
    errores.value          = [];
    mensajeExito.value     = '';
    propietarioEditando.value = null;

    // Cargar propietarios automáticamente al cambiar a consultar, editar o eliminar
    if (newAction === 'consultar' || newAction === 'editar' || newAction === 'eliminar') {
      buscarPropietarios();
    }
  }
);

// ==================== EMPIEZAN CAMBIOS ====================
// Se eliminó propietariosDemoTabla y se reemplazó por propietariosTabla que se llenará desde el backend
// ==================== EMPIEZAN CAMBIOS ====================
const propietariosTabla = ref([]);
const cargandoPropietarios = ref(false);
// ==================== TERMINAN CAMBIOS ====================

// Filtros
const filtros = ref({
  curp: '',
  nombre: '',
  upp: '',
  municipio: ''
});

// ==================== EMPIEZAN CAMBIOS ====================
// Se reemplazó propietariosFiltrados por propietariosTabla que viene del backend
// ==================== EMPIEZAN CAMBIOS ====================
const propietariosFiltrados = computed(() => propietariosTabla.value);

// ==================== EMPIEZAN CAMBIOS ====================
// Función buscarPropietarios modificada para usar la API del backend
// ==================== EMPIEZAN CAMBIOS ====================
async function buscarPropietarios() {
  errores.value = [];
  mensajeExito.value = '';
  cargandoPropietarios.value = true;

  try {
    const response = await propietariosService.consultar({
      curp: filtros.value.curp || undefined,
      nombre: filtros.value.nombre || undefined,
      upp: filtros.value.upp || undefined,
      municipio: filtros.value.municipio || undefined,
      limit: 100
    });

    propietariosTabla.value = response.data;

    if (response.data.length > 0) {
      mensajeExito.value = `Se encontraron ${response.data.length} propietario(s)`;
    } else {
      mensajeExito.value = 'No se encontraron propietarios con los criterios especificados';
    }
  } catch (error) {
    console.error('Error al buscar propietarios:', error);
    errores.value.push('Error al consultar propietarios del servidor. Verifique su conexión.');
    propietariosTabla.value = [];
  } finally {
    cargandoPropietarios.value = false;
  }
}
// ==================== TERMINAN CAMBIOS ====================

function limpiarFiltros() {
  filtros.value = {
    curp: '',
    nombre: '',
    upp: '',
    municipio: ''
  };
  // ==================== EMPIEZAN CAMBIOS ====================
  // Limpiar también los resultados
  propietariosTabla.value = [];
  mensajeExito.value = '';
  errores.value = [];
  // ==================== TERMINAN CAMBIOS ====================
}

// ===== Edición de propietarios =====
const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

// ==================== EMPIEZAN CAMBIOS ====================
// Se ajustó para usar id_propietario y calle en lugar de upp y domicilio
// ==================== EMPIEZAN CAMBIOS ====================
function seleccionarPropietario(p) {
  errores.value      = [];
  mensajeExito.value = '';

  // BD propietarios: id_propietario, nombre, curp, rfc, telefono, email, estatus
  propietarioEditando.value = {
    id: p.id_propietario,
    nombre: p.nombre,
    apellido_paterno: p.apellido_paterno || '',
    apellido_materno: p.apellido_materno || '',
    nombre_completo: p.nombre_completo,
    curp: p.curp,
    rfc: p.rfc || '',
    telefono: p.telefono,
    email: p.email,
    activo: p.activo
  };

  scrollAlContenido();
}
// ==================== TERMINAN CAMBIOS ====================

function cancelarEdicion() {
  const ok = window.confirm(
    '¿Desea cancelar la edición? Los cambios no guardados se perderán.'
  );
  if (!ok) return;
  propietarioEditando.value = null;
}

function validarFormularioEdicion() {
  errores.value = [];

  if (!propietarioEditando.value) {
    errores.value.push('Debe seleccionar un propietario para editar.');
    return false;
  }

  const p = propietarioEditando.value;

  if (!p.nombre) {
    errores.value.push('El campo Nombre es obligatorio.');
  } else if (!soloLetrasRegex.test(p.nombre)) {
    errores.value.push('El campo Nombre solo debe contener letras.');
  }

  if (!p.apellido_paterno) {
    errores.value.push('El campo Apellido paterno es obligatorio.');
  } else if (!soloLetrasRegex.test(p.apellido_paterno)) {
    errores.value.push('El campo Apellido paterno solo debe contener letras.');
  }

  if (p.apellido_materno && !soloLetrasRegex.test(p.apellido_materno)) {
    errores.value.push('El campo Apellido materno solo debe contener letras.');
  }

  if (!p.curp) {
    errores.value.push('El campo CURP es obligatorio.');
  }

  return errores.value.length === 0;
}

// ==================== EMPIEZAN CAMBIOS ====================
// Función guardarCambiosPropietario modificada para usar la API del backend
// ==================== EMPIEZAN CAMBIOS ====================
async function guardarCambiosPropietario() {
  mensajeExito.value = '';

  const esValido = validarFormularioEdicion();
  if (!esValido) return;

  const ok = window.confirm(
    '¿Desea guardar los cambios del propietario seleccionado?'
  );
  if (!ok) return;

  const pEdit = propietarioEditando.value;

  try {
    // BD propietarios: id_propietario, nombre, curp, rfc, telefono, email, estatus
    await propietariosService.actualizar(pEdit.id, {
      nombre: pEdit.nombre,
      apellido_paterno: pEdit.apellido_paterno,
      apellido_materno: pEdit.apellido_materno,
      curp: pEdit.curp,
      rfc: pEdit.rfc,
      telefono: pEdit.telefono,
      email: pEdit.email,
      activo: pEdit.activo
    });

    mensajeExito.value = 'Los datos del propietario se han actualizado correctamente.';
    propietarioEditando.value = null;

    // Recargar la lista
    await buscarPropietarios();

  } catch (error) {
    console.error('Error al actualizar propietario:', error);
    if (error.response?.data?.detail) {
      errores.value.push(error.response.data.detail);
    } else {
      errores.value.push('Error al actualizar el propietario en el servidor.');
    }
  }
}
// ==================== TERMINAN CAMBIOS ====================

// ==================== EMPIEZAN CAMBIOS ====================
// Funciones desactivarPropietario y reactivarPropietario modificadas para usar la API
// ==================== EMPIEZAN CAMBIOS ====================
async function desactivarPropietario(p) {
  errores.value      = [];
  mensajeExito.value = '';

  if (!p.activo) {
    errores.value.push('El propietario ya se encuentra inactivo.');
    return;
  }

  const ok = window.confirm(
    `¿Desea desactivar al propietario "${p.nombre_completo}"?`
  );
  if (!ok) return;

  try {
    await propietariosService.desactivar(p.id_propietario);
    mensajeExito.value = 'El propietario se ha desactivado correctamente.';

    // Recargar la lista
    await buscarPropietarios();

  } catch (error) {
    console.error('Error al desactivar propietario:', error);
    if (error.response?.data?.detail) {
      errores.value.push(error.response.data.detail);
    } else {
      errores.value.push('Error al desactivar el propietario en el servidor.');
    }
  }
}

async function reactivarPropietario(p) {
  errores.value      = [];
  mensajeExito.value = '';

  if (p.activo) {
    errores.value.push('El propietario ya se encuentra activo.');
    return;
  }

  const ok = window.confirm(
    `¿Desea reactivar al propietario "${p.nombre_completo}"?`
  );
  if (!ok) return;

  try {
    await propietariosService.reactivar(p.id_propietario);
    mensajeExito.value = 'El propietario se ha reactivado correctamente.';

    // Recargar la lista
    await buscarPropietarios();

  } catch (error) {
    console.error('Error al reactivar propietario:', error);
    if (error.response?.data?.detail) {
      errores.value.push(error.response.data.detail);
    } else {
      errores.value.push('Error al reactivar el propietario en el servidor.');
    }
  }
}
// ==================== TERMINAN CAMBIOS ====================
</script>

<style scoped>
/* Acciones */
.modulo-acciones {
  margin-bottom: 20px;
}

.modulo-acciones-titulo {
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
}

.modulo-acciones-botones {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* Botones de acción de módulo */
.sistpec-btn-accion {
  border: none;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 3px;
  cursor: pointer;
  background-color: #2f6b32;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.sistpec-btn-accion.active {
  background-color: #244e26;
}

/* Contenido */
.modulo-contenido {
  margin-top: 10px;
}

/* Subtítulos */
.subtitulo {
  font-size: 18px;
  margin: 10px 0 15px;
  color: #333;
}

.subtitulo-secundario {
  font-size: 16px;
  margin: 16px 0 10px;
  color: #333;
}

/* ---- Formulario SISTPEC ---- */
.sistpec-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sistpec-form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.sistpec-form-row-end {
  justify-content: flex-end;
  display: flex;
}

.sistpec-form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sistpec-form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
}

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

/* checkbox */
.sistpec-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #444;
}

/* Botones de acción del form */
.sistpec-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Botones */
.sistpec-btn-primary {
  background-color: #2f6b32;
  color: #ffffff;
  border: none;
  padding: 8px 18px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.sistpec-btn-primary:hover {
  background-color: #244e26;
}

.sistpec-btn-secondary {
  background-color: #e0e0e0;
  color: #333;
  border: none;
  padding: 8px 18px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.sistpec-btn-secondary:hover {
  background-color: #d0d0d0;
}

.sistpec-btn-sm {
  padding: 4px 10px;
  font-size: 11px;
}

/* Botón peligro (desactivar) */
.sistpec-btn-danger {
  background-color: #7a061e;
  color: #ffffff;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.sistpec-btn-danger:hover {
  background-color: #5a0416;
}

.sistpec-btn-danger[disabled] {
  opacity: 0.5;
  cursor: default;
}

/* Info box verde claro */
.sistpec-info-box {
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: 4px;
  background-color: #e1f3e1;
  border: 1px solid #c3e6c3;
}

.sistpec-info-text {
  margin: 0;
  font-size: 13px;
  color: #225522;
}

/* ALERTAS */
.modulo-alert {
  margin-bottom: 12px;
  padding: 10px 14px;
  border-radius: 4px;
  font-size: 13px;
}

.modulo-alert--error {
  background-color: #fbeaea;
  border: 1px solid #f5c2c2;
  color: #7a1f1f;
}

.modulo-alert--success {
  background-color: #e1f3e1;
  border: 1px solid #c3e6c3;
  color: #225522;
}

/* CONSULTAR / EDITAR / ELIMINAR: barra de filtros */
.sistpec-search-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.sistpec-search-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.sistpec-search-actions-bottom {
  margin-bottom: 14px;
}

/* Tabla */
.sistpec-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.sistpec-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.sistpec-table thead {
  background-color: #7a061e;
  color: #ffffff;
}

.sistpec-table th,
.sistpec-table td {
  padding: 8px 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.sistpec-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.sin-resultados {
  text-align: center;
  color: #777;
}

/* Panel edición */
.sistpec-edit-panel {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px dashed #ccc;
}

/* badges */
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.badge--activo {
  background-color: #e1f3e1;
  color: #225522;
}

.badge--inactivo {
  background-color: #fbeaea;
  color: #7a1f1f;
}

/* Responsive */
@media (max-width: 768px) {
  .sistpec-form-row {
    grid-template-columns: 1fr;
  }

  .sistpec-search-bar {
    grid-template-columns: 1fr;
  }
}
</style>
