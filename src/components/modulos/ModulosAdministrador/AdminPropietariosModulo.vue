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
              <input v-model="propietarioEditando.correo" type="email" />
            </div>

            <div class="sistpec-form-group">
              <label>UPP</label>
              <input v-model="propietarioEditando.upp" type="text" required />
            </div>

            <div class="sistpec-form-group">
              <label>Municipio</label>
              <input v-model="propietarioEditando.municipio" type="text" required />
            </div>
          </div>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Localidad</label>
              <input v-model="propietarioEditando.localidad" type="text" />
            </div>

            <div class="sistpec-form-group">
              <label>Domicilio</label>
              <input v-model="propietarioEditando.domicilio" type="text" />
            </div>

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
import { computed, ref, watch, nextTick } from 'vue';

defineProps({
  codigo: { type: String, required: true },
  rol:    { type: String, required: true }
});

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
  () => {
    errores.value          = [];
    mensajeExito.value     = '';
    propietarioEditando.value = null;
  }
);

// ===== Datos demo para tabla (simula respuesta de backend) =====
const propietariosDemoTabla = ref([
  {
    id: 1,
    nombre: 'José',
    apellido_paterno: 'López',
    apellido_materno: 'Ramírez',
    nombre_completo: 'José López Ramírez',
    curp: 'LORJ800101HDFRPS01',
    upp: 'VER-0001-2025',
    municipio: 'Xalapa',
    localidad: 'El Castillo',
    domicilio: 'Camino a El Castillo S/N',
    telefono: '2281234567',
    correo: 'jlopez@ejemplo.com',
    activo: true
  },
  {
    id: 2,
    nombre: 'María',
    apellido_paterno: 'Hernández',
    apellido_materno: 'Torres',
    nombre_completo: 'María Hernández Torres',
    curp: 'HETM820305MDFRRR02',
    upp: 'VER-0020-2025',
    municipio: 'Perote',
    localidad: 'La Gloria',
    domicilio: 'Calle Principal 10',
    telefono: '2829876543',
    correo: 'mhernandez@ejemplo.com',
    activo: true
  },
  {
    id: 3,
    nombre: 'Carlos',
    apellido_paterno: 'García',
    apellido_materno: 'Santos',
    nombre_completo: 'Carlos García Santos',
    curp: 'GASC750910HDFRNL03',
    upp: 'VER-0100-2025',
    municipio: 'Isla',
    localidad: 'Paso del Medio',
    domicilio: 'Rancho El Progreso',
    telefono: '',
    correo: '',
    activo: false
  }
]);

// Filtros
const filtros = ref({
  curp: '',
  nombre: '',
  upp: '',
  municipio: ''
});

const propietariosFiltrados = computed(() => {
  const curp      = filtros.value.curp.trim().toLowerCase();
  const nombre    = filtros.value.nombre.trim().toLowerCase();
  const upp       = filtros.value.upp.trim().toLowerCase();
  const municipio = filtros.value.municipio.trim().toLowerCase();

  return propietariosDemoTabla.value.filter(p => {
    const matchCurp = curp
      ? (p.curp || '').toLowerCase().includes(curp)
      : true;
    const matchNombre = nombre
      ? (p.nombre_completo || '').toLowerCase().includes(nombre)
      : true;
    const matchUpp = upp
      ? (p.upp || '').toLowerCase().includes(upp)
      : true;
    const matchMunicipio = municipio
      ? (p.municipio || '').toLowerCase().includes(municipio)
      : true;

    return matchCurp && matchNombre && matchUpp && matchMunicipio;
  });
});

function buscarPropietarios() {
  // La búsqueda es reactiva con los filtros;
  // aquo se loggea o llama a backend si se requiere.
}

function limpiarFiltros() {
  filtros.value = {
    curp: '',
    nombre: '',
    upp: '',
    municipio: ''
  };
}

// ===== Edición de propietarios =====
const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

function seleccionarPropietario(p) {
  errores.value      = [];
  mensajeExito.value = '';

  propietarioEditando.value = {
    id: p.id,
    nombre: p.nombre,
    apellido_paterno: p.apellido_paterno,
    apellido_materno: p.apellido_materno,
    nombre_completo: p.nombre_completo,
    curp: p.curp,
    telefono: p.telefono,
    correo: p.correo,
    upp: p.upp,
    municipio: p.municipio,
    localidad: p.localidad,
    domicilio: p.domicilio,
    activo: p.activo
  };

  scrollAlContenido();
}

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

  if (!p.upp) {
    errores.value.push('El campo UPP es obligatorio.');
  }

  if (!p.municipio) {
    errores.value.push('El campo Municipio es obligatorio.');
  }

  return errores.value.length === 0;
}

function guardarCambiosPropietario() {
  mensajeExito.value = '';

  const esValido = validarFormularioEdicion();
  if (!esValido) return;

  const ok = window.confirm(
    '¿Desea guardar los cambios del propietario seleccionado?'
  );
  if (!ok) return;

  const pEdit = propietarioEditando.value;
  const idx   = propietariosDemoTabla.value.findIndex(p => p.id === pEdit.id);

  if (idx === -1) {
    errores.value.push('No se encontró el propietario en la lista.');
    return;
  }

  propietariosDemoTabla.value[idx] = {
    ...propietariosDemoTabla.value[idx],
    nombre: pEdit.nombre,
    apellido_paterno: pEdit.apellido_paterno,
    apellido_materno: pEdit.apellido_materno,
    nombre_completo: `${pEdit.nombre} ${pEdit.apellido_paterno} ${pEdit.apellido_materno}`.trim(),
    curp: pEdit.curp,
    telefono: pEdit.telefono,
    correo: pEdit.correo,
    upp: pEdit.upp,
    municipio: pEdit.municipio,
    localidad: pEdit.localidad,
    domicilio: pEdit.domicilio,
    activo: pEdit.activo
  };

  mensajeExito.value = 'Los datos del propietario se han actualizado correctamente.';
}

// ===== Eliminar / desactivar propietarios =====
function desactivarPropietario(p) {
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

  const idx = propietariosDemoTabla.value.findIndex(x => x.id === p.id);
  if (idx === -1) {
    errores.value.push('No se encontró el propietario en la lista.');
    return;
  }

  propietariosDemoTabla.value[idx] = {
    ...propietariosDemoTabla.value[idx],
    activo: false
  };

  mensajeExito.value = 'El propietario se ha desactivado correctamente.';
}

function reactivarPropietario(p) {
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

  const idx = propietariosDemoTabla.value.findIndex(x => x.id === p.id);
  if (idx === -1) {
    errores.value.push('No se encontró el propietario en la lista.');
    return;
  }

  propietariosDemoTabla.value[idx] = {
    ...propietariosDemoTabla.value[idx],
    activo: true
  };

  mensajeExito.value = 'El propietario se ha reactivado correctamente.';
}
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
