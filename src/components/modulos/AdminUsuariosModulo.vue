<template>
  <!-- Barra de acciones (botones Registrar / Consultar / Editar / Eliminar) -->
  <section class="modulo-acciones">
    <span class="modulo-acciones-titulo">Acciones disponibles</span>

    <div class="modulo-acciones-botones">
      <button
        v-for="accion in accionesUsuarios"
        :key="accion.id"
        type="button"
        class="sistpec-btn-accion"
        :class="{ active: selectedAction === accion.id }"
        @click="selectedAction = accion.id"
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

  <section class="modulo-contenido">
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

    <!-- ================= REGISTRAR USUARIO ================= -->
    <div v-if="selectedAction === 'registrar'">
      <h3 class="subtitulo">Registrar usuario</h3>

      <form class="sistpec-form" @submit.prevent="guardarUsuario">
        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Nombre</label>
            <input v-model="nuevoUsuario.nombre" type="text" required />
          </div>

          <div class="sistpec-form-group">
            <label>Apellido paterno</label>
            <input v-model="nuevoUsuario.apellido_paterno" type="text" required />
          </div>

          <div class="sistpec-form-group">
            <label>Apellido materno</label>
            <input v-model="nuevoUsuario.apellido_materno" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>Nombre de usuario</label>
            <input
              v-model="nuevoUsuario.nombre_usuario"
              type="text"
              required
            />
          </div>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Correo electrónico</label>
            <input
              v-model="nuevoUsuario.correo"
              type="email"
              required
            />
          </div>

          <div class="sistpec-form-group">
            <label>Rol / tipo de usuario</label>
            <select v-model="nuevoUsuario.tipo_usuario" required>
              <option value="" disabled>Seleccione un rol</option>
              <option value="1">Administrador</option>
              <option value="2">Responsable de laboratorio</option>
              <option value="3">Recepcionista</option>
              <option value="4">Coordinador</option>
              <option value="5">MVZ autorizado</option>
            </select>
          </div>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Contraseña</label>
            <input
              v-model="nuevoUsuario.password"
              type="password"
              required
            />
          </div>

          <div class="sistpec-form-group">
            <label>Confirmar contraseña</label>
            <input
              v-model="nuevoUsuario.confirmPassword"
              type="password"
              required
            />
          </div>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Clave de rumiantes (si aplica)</label>
            <input
              v-model="nuevoUsuario.clave_de_rumiantes"
              type="text"
              placeholder="Solo para MVZ autorizado"
            />
          </div>

          <div class="sistpec-form-group sistpec-form-group-inline">
            <label>Vigencia</label>
            <div class="sistpec-form-inline-inputs">
              <input
                v-model="nuevoUsuario.vigencia_inicio"
                type="date"
                required
              />
              <span class="vigencia-sep">a</span>
              <input
                v-model="nuevoUsuario.vigencia_fin"
                type="date"
                required
              />
            </div>
          </div>
        </div>

        <div class="sistpec-form-row sistpec-form-row-end">
          <label class="sistpec-checkbox">
            <input
              v-model="nuevoUsuario.activo"
              type="checkbox"
            />
            <span>Usuario activo</span>
          </label>
        </div>

        <div class="sistpec-form-actions">
          <button type="submit" class="sistpec-btn-primary">
            GUARDAR
          </button>
          <button
            type="button"
            class="sistpec-btn-secondary"
            @click="limpiarFormulario"
          >
            LIMPIAR
          </button>
        </div>
      </form>
    </div>

    <!-- ================= CONSULTAR USUARIOS ================= -->
    <div v-else-if="selectedAction === 'consultar'">
      <h3 class="subtitulo">Consultar usuarios</h3>

      <!-- Barra de filtros -->
      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Nombre de usuario</label>
          <input
            v-model="filtros.nombre_usuario"
            type="text"
            placeholder="Ej. admin01"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Clave de rumiantes</label>
          <input
            v-model="filtros.clave_de_rumiantes"
            type="text"
            placeholder="Ej. VER-001-2025"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Correo electrónico</label>
          <input
            v-model="filtros.correo"
            type="email"
            placeholder="usuario@ejemplo.com"
          />
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button
            type="button"
            class="sistpec-btn-primary"
            @click="buscarUsuarios"
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
      </div>

      <!-- Tabla de resultados -->
      <div class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>Nombre usuario</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Clave rumiantes</th>
              <th>Vigencia</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuariosFiltrados" :key="u.id">
              <td>{{ u.nombre_completo }}</td>
              <td>{{ u.nombre_usuario }}</td>
              <td>{{ u.correo }}</td>
              <td>{{ u.rolEtiqueta }}</td>
              <td>{{ u.clave_de_rumiantes || '-' }}</td>
              <td>{{ u.vigencia_inicio }} a {{ u.vigencia_fin }}</td>
              <td>
                <span
                  class="badge"
                  :class="u.activo ? 'badge--activo' : 'badge--inactivo'"
                >
                  {{ u.activo ? 'ACTIVO' : 'INACTIVO' }}
                </span>
              </td>
            </tr>
            <tr v-if="usuariosFiltrados.length === 0">
              <td colspan="7" class="sin-resultados">
                No se encontraron usuarios con los criterios de búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= EDITAR USUARIOS ================= -->
    <div v-else-if="selectedAction === 'editar'">
      <h3 class="subtitulo">Editar usuarios</h3>

      <!-- Filtros reutilizados -->
      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Nombre de usuario</label>
          <input
            v-model="filtros.nombre_usuario"
            type="text"
            placeholder="Ej. admin01"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Clave de rumiantes</label>
          <input
            v-model="filtros.clave_de_rumiantes"
            type="text"
            placeholder="Ej. VER-001-2025"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Correo electrónico</label>
          <input
            v-model="filtros.correo"
            type="email"
            placeholder="usuario@ejemplo.com"
          />
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button
            type="button"
            class="sistpec-btn-primary"
            @click="buscarUsuarios"
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
      </div>

      <!-- Tabla con botón Editar -->
      <div class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>Nombre usuario</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Clave rumiantes</th>
              <th>Vigencia</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuariosFiltrados" :key="u.id">
              <td>{{ u.nombre_completo }}</td>
              <td>{{ u.nombre_usuario }}</td>
              <td>{{ u.correo }}</td>
              <td>{{ u.rolEtiqueta }}</td>
              <td>{{ u.clave_de_rumiantes || '-' }}</td>
              <td>{{ u.vigencia_inicio }} a {{ u.vigencia_fin }}</td>
              <td>
                <span
                  class="badge"
                  :class="u.activo ? 'badge--activo' : 'badge--inactivo'"
                >
                  {{ u.activo ? 'ACTIVO' : 'INACTIVO' }}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  class="sistpec-btn-secondary sistpec-btn-sm"
                  @click="seleccionarUsuario(u)"
                >
                  EDITAR
                </button>
              </td>
            </tr>
            <tr v-if="usuariosFiltrados.length === 0">
              <td colspan="8" class="sin-resultados">
                No se encontraron usuarios con los criterios de búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Formulario de edición -->
      <div v-if="usuarioEditando" class="sistpec-edit-panel">
        <h4 class="subtitulo-secundario">
          Editando: {{ usuarioEditando.nombre_usuario }}
        </h4>

        <form class="sistpec-form" @submit.prevent="guardarCambiosUsuario">
          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Nombre</label>
              <input v-model="usuarioEditando.nombre" type="text" required />
            </div>

            <div class="sistpec-form-group">
              <label>Apellido paterno</label>
              <input v-model="usuarioEditando.apellido_paterno" type="text" required />
            </div>

            <div class="sistpec-form-group">
              <label>Apellido materno</label>
              <input v-model="usuarioEditando.apellido_materno" type="text" />
            </div>

            <div class="sistpec-form-group">
              <label>Nombre de usuario</label>
              <input
                v-model="usuarioEditando.nombre_usuario"
                type="text"
                required
              />
            </div>
          </div>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Correo electrónico</label>
              <input
                v-model="usuarioEditando.correo"
                type="email"
                required
              />
            </div>

            <div class="sistpec-form-group">
              <label>Rol / tipo de usuario</label>
              <select v-model="usuarioEditando.tipo_usuario" required>
                <option value="" disabled>Seleccione un rol</option>
                <option value="1">Administrador</option>
                <option value="2">Responsable de laboratorio</option>
                <option value="3">Recepcionista</option>
                <option value="4">Coordinador</option>
                <option value="5">MVZ autorizado</option>
              </select>
            </div>
          </div>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Nueva contraseña (opcional)</label>
              <input
                v-model="usuarioEditando.password"
                type="password"
                placeholder="Dejar en blanco para no cambiar"
              />
            </div>

            <div class="sistpec-form-group">
              <label>Confirmar nueva contraseña</label>
              <input
                v-model="usuarioEditando.confirmPassword"
                type="password"
                placeholder="Repetir contraseña"
              />
            </div>
          </div>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Clave de rumiantes (si aplica)</label>
              <input
                v-model="usuarioEditando.clave_de_rumiantes"
                type="text"
              />
            </div>

            <div class="sistpec-form-group sistpec-form-group-inline">
              <label>Vigencia</label>
              <div class="sistpec-form-inline-inputs">
                <input
                  v-model="usuarioEditando.vigencia_inicio"
                  type="date"
                  required
                />
                <span class="vigencia-sep">a</span>
                <input
                  v-model="usuarioEditando.vigencia_fin"
                  type="date"
                  required
                />
              </div>
            </div>
          </div>

          <div class="sistpec-form-row sistpec-form-row-end">
            <label class="sistpec-checkbox">
              <input
                v-model="usuarioEditando.activo"
                type="checkbox"
              />
              <span>Usuario activo</span>
            </label>
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

    <!-- ================= ELIMINAR / DESACTIVAR USUARIOS ================= -->
    <div v-else-if="selectedAction === 'eliminar'">
      <h3 class="subtitulo">Eliminar (desactivar) usuarios</h3>

      <div class="sistpec-info-box">
        <p class="sistpec-info-text">
          La eliminación se realiza como baja lógica: el usuario se marca como
          <strong>INACTIVO</strong> y deja de tener acceso al sistema SISTPEC.
        </p>
      </div>

      <!-- Filtros -->
      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Nombre de usuario</label>
          <input
            v-model="filtros.nombre_usuario"
            type="text"
            placeholder="Ej. admin01"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Clave de rumiantes</label>
          <input
            v-model="filtros.clave_de_rumiantes"
            type="text"
            placeholder="Ej. VER-001-2025"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Correo electrónico</label>
          <input
            v-model="filtros.correo"
            type="email"
            placeholder="usuario@ejemplo.com"
          />
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button
            type="button"
            class="sistpec-btn-primary"
            @click="buscarUsuarios"
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
      </div>

      <!-- Tabla con opción de desactivar -->
      <div class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>Nombre usuario</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Clave rumiantes</th>
              <th>Vigencia</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuariosFiltrados" :key="u.id">
              <td>{{ u.nombre_completo }}</td>
              <td>{{ u.nombre_usuario }}</td>
              <td>{{ u.correo }}</td>
              <td>{{ u.rolEtiqueta }}</td>
              <td>{{ u.clave_de_rumiantes || '-' }}</td>
              <td>{{ u.vigencia_inicio }} a {{ u.vigencia_fin }}</td>
              <td>
                <span
                  class="badge"
                  :class="u.activo ? 'badge--activo' : 'badge--inactivo'"
                >
                  {{ u.activo ? 'ACTIVO' : 'INACTIVO' }}
                </span>
              </td>
             <td>
           <!-- Botón DESACTIVAR -->
        <button
           type="button"
           class="sistpec-btn-danger sistpec-btn-sm"
           :disabled="!u.activo"
           @click="desactivarUsuario(u)"
        >
            DESACTIVAR
        </button>

         <!-- Botón REACTIVAR -->
        <button
          type="button"
          class="sistpec-btn-secondary sistpec-btn-sm"
          :disabled="u.activo"
          @click="reactivarUsuario(u)"
          style="margin-left: 6px;"
        >
          REACTIVAR
        </button>
          </td>


            </tr>
            <tr v-if="usuariosFiltrados.length === 0">
              <td colspan="8" class="sin-resultados">
                No se encontraron usuarios con los criterios de búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= Fallback (no debería ocurrir) ================= -->
    <div v-else>
      <h3 class="subtitulo">
        {{ tituloAccionActual || 'Acción no disponible' }}
      </h3>
      <p>
        El contenido para esta acción aún está en desarrollo.
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

defineProps({
  codigo: { type: String, required: true },
  rol:    { type: String, required: true }
});

// Catálogo de roles
const rolesCatalog = {
  1: 'Administrador',
  2: 'Responsable de laboratorio',
  3: 'Recepcionista',
  4: 'Coordinador',
  5: 'MVZ autorizado'
};

// Estado: registro de usuario
const nuevoUsuario = ref({
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  nombre_completo: '',
  nombre_usuario: '',
  correo: '',
  password: '',
  confirmPassword: '',
  tipo_usuario: '',
  clave_de_rumiantes: '',
  vigencia_inicio: '',
  vigencia_fin: '',
  activo: true
});

const errores      = ref([]);
const mensajeExito = ref('');

const soloLetrasRegex    = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
const passwordMinLength  = 8;

// Acciones disponibles
const accionesUsuarios = [
  { id: 'registrar', label: 'REGISTRAR USUARIO' },
  { id: 'consultar', label: 'CONSULTAR USUARIOS' },
  { id: 'editar',    label: 'EDITAR USUARIOS' },
  { id: 'eliminar',  label: 'ELIMINAR USUARIOS' }
];

const selectedAction   = ref('registrar');
const usuarioEditando  = ref(null);

// Nombre completo automático
watch(
  () => [
    nuevoUsuario.value.nombre,
    nuevoUsuario.value.apellido_paterno,
    nuevoUsuario.value.apellido_materno
  ],
  () => {
    const { nombre, apellido_paterno, apellido_materno } = nuevoUsuario.value;
    nuevoUsuario.value.nombre_completo =
      `${nombre} ${apellido_paterno} ${apellido_materno}`.trim();
  }
);

// Descripciones según acción
const descripcionAccionActual = computed(() => {
  switch (selectedAction.value) {
    case 'registrar':
      return 'Registra nuevos usuarios del sistema SISTPEC, asignando rol, vigencia y datos de contacto.';
    case 'consultar':
      return 'Consulta el listado de usuarios registrados en SISTPEC, con filtros y opciones de exportación.';
    case 'editar':
      return 'Edita los datos generales, roles y vigencia de los usuarios existentes.';
    case 'eliminar':
      return 'Desactiva usuarios que ya no deban tener acceso al sistema SISTPEC.';
    default:
      return '';
  }
});

const tituloAccionActual = computed(() => {
  const accion = accionesUsuarios.find(a => a.id === selectedAction.value);
  return accion ? accion.label : '';
});

// Reset de mensajes al cambiar de acción
watch(
  () => selectedAction.value,
  () => {
    errores.value      = [];
    mensajeExito.value = '';
    usuarioEditando.value = null;
  }
);

// Datos demo para tabla
const usuariosDemoTabla = ref([
  {
    id: 1,
    nombre: 'Juan',
    apellido_paterno: 'Pérez',
    apellido_materno: 'López',
    nombre_completo: 'Juan Pérez López',
    nombre_usuario: 'admin',
    correo: 'admin@sistpec.ver.mx',
    rol: 1,
    rolEtiqueta: 'Administrador',
    clave_de_rumiantes: '',
    vigencia_inicio: '2025-01-01',
    vigencia_fin: '2025-12-31',
    activo: true
  },
  {
    id: 2,
    nombre: 'María',
    apellido_paterno: 'García',
    apellido_materno: 'Ruiz',
    nombre_completo: 'María García Ruiz',
    nombre_usuario: 'resplab01',
    correo: 'resplab01@sistpec.ver.mx',
    rol: 2,
    rolEtiqueta: 'Responsable de laboratorio',
    clave_de_rumiantes: '',
    vigencia_inicio: '2025-01-01',
    vigencia_fin: '2025-12-31',
    activo: true
  },
  {
    id: 3,
    nombre: 'Carlos',
    apellido_paterno: 'Hernández',
    apellido_materno: 'Torres',
    nombre_completo: 'Carlos Hernández Torres',
    nombre_usuario: 'mvzver01',
    correo: 'mvzver01@sistpec.ver.mx',
    rol: 5,
    rolEtiqueta: 'MVZ autorizado',
    clave_de_rumiantes: 'VER-001-2025',
    vigencia_inicio: '2025-03-01',
    vigencia_fin: '2025-12-31',
    activo: true
  }
]);

const filtros = ref({
  nombre_usuario: '',
  clave_de_rumiantes: '',
  correo: ''
});

const usuariosFiltrados = computed(() => {
  const nom   = filtros.value.nombre_usuario.trim().toLowerCase();
  const clave = filtros.value.clave_de_rumiantes.trim().toLowerCase();
  const mail  = filtros.value.correo.trim().toLowerCase();

  return usuariosDemoTabla.value.filter(u => {
    const matchNombre = nom
      ? u.nombre_usuario.toLowerCase().includes(nom)
      : true;
    const matchClave = clave
      ? (u.clave_de_rumiantes || '').toLowerCase().includes(clave)
      : true;
    const matchCorreo = mail
      ? u.correo.toLowerCase().includes(mail)
      : true;

    return matchNombre && matchClave && matchCorreo;
  });
});

function buscarUsuarios() {
  // La búsqueda es reactiva con los filtros;
  // aquí podrías loggear o llamar a backend si lo requiere el CU.
}

function limpiarFiltros() {
  filtros.value = {
    nombre_usuario: '',
    clave_de_rumiantes: '',
    correo: ''
  };
}

// ===== Registrar usuario =====
function limpiarFormulario() {
  const ok = window.confirm(
    '¿Desea limpiar el formulario? Los datos capturados se perderán.'
  );
  if (!ok) return;

  nuevoUsuario.value = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    nombre_completo: '',
    nombre_usuario: '',
    correo: '',
    password: '',
    confirmPassword: '',
    tipo_usuario: '',
    clave_de_rumiantes: '',
    vigencia_inicio: '',
    vigencia_fin: '',
    activo: true
  };
  errores.value      = [];
  mensajeExito.value = '';
}

function validarFormularioRegistro() {
  errores.value = [];

  // Nombre y apellidos
  if (!nuevoUsuario.value.nombre) {
    errores.value.push('El campo Nombre es obligatorio.');
  } else if (!soloLetrasRegex.test(nuevoUsuario.value.nombre)) {
    errores.value.push('El campo Nombre solo debe contener letras.');
  }

  if (!nuevoUsuario.value.apellido_paterno) {
    errores.value.push('El campo Apellido paterno es obligatorio.');
  } else if (!soloLetrasRegex.test(nuevoUsuario.value.apellido_paterno)) {
    errores.value.push('El campo Apellido paterno solo debe contener letras.');
  }

  if (
    nuevoUsuario.value.apellido_materno &&
    !soloLetrasRegex.test(nuevoUsuario.value.apellido_materno)
  ) {
    errores.value.push('El campo Apellido materno solo debe contener letras.');
  }

  // Usuario y correo
  if (!nuevoUsuario.value.nombre_usuario) {
    errores.value.push('Debe capturar el Nombre de usuario.');
  }
  if (!nuevoUsuario.value.correo) {
    errores.value.push('Debe capturar el correo electrónico.');
  }

  // Contraseña
  if (!nuevoUsuario.value.password) {
    errores.value.push('La contraseña es obligatoria.');
  } else {
    if (nuevoUsuario.value.password.length < passwordMinLength) {
      errores.value.push(
        `La contraseña debe tener al menos ${passwordMinLength} caracteres.`
      );
    }
    if (
      !/[A-Za-z]/.test(nuevoUsuario.value.password) ||
      !/\d/.test(nuevoUsuario.value.password)
    ) {
      errores.value.push(
        'La contraseña debe contener letras y números.'
      );
    }
  }

  if (nuevoUsuario.value.password !== nuevoUsuario.value.confirmPassword) {
    errores.value.push('La confirmación de contraseña no coincide.');
  }

  // Vigencia
  if (
    nuevoUsuario.value.vigencia_inicio &&
    nuevoUsuario.value.vigencia_fin &&
    nuevoUsuario.value.vigencia_fin < nuevoUsuario.value.vigencia_inicio
  ) {
    errores.value.push(
      'La fecha de fin de vigencia no puede ser menor que la fecha de inicio.'
    );
  }

  return errores.value.length === 0;
}

function guardarUsuario() {
  mensajeExito.value = '';

  const esValido = validarFormularioRegistro();
  if (!esValido) return;

  const ok = window.confirm(
    '¿Desea guardar el usuario con los datos capturados?'
  );
  if (!ok) return;

  const newId = usuariosDemoTabla.value.length
    ? Math.max(...usuariosDemoTabla.value.map(u => u.id)) + 1
    : 1;

  const rolNum      = Number(nuevoUsuario.value.tipo_usuario);
  const rolEtiqueta = rolesCatalog[rolNum] || 'Sin rol';

  usuariosDemoTabla.value.push({
    id: newId,
    nombre: nuevoUsuario.value.nombre,
    apellido_paterno: nuevoUsuario.value.apellido_paterno,
    apellido_materno: nuevoUsuario.value.apellido_materno,
    nombre_completo: nuevoUsuario.value.nombre_completo,
    nombre_usuario: nuevoUsuario.value.nombre_usuario,
    correo: nuevoUsuario.value.correo,
    rol: rolNum,
    rolEtiqueta,
    clave_de_rumiantes: nuevoUsuario.value.clave_de_rumiantes,
    vigencia_inicio: nuevoUsuario.value.vigencia_inicio,
    vigencia_fin: nuevoUsuario.value.vigencia_fin,
    activo: nuevoUsuario.value.activo
  });

  mensajeExito.value = 'El usuario ha sido registrado correctamente.';
}

// ===== Edición de usuarios =====
function seleccionarUsuario(u) {
  errores.value      = [];
  mensajeExito.value = '';

  usuarioEditando.value = {
    id: u.id,
    nombre: u.nombre,
    apellido_paterno: u.apellido_paterno,
    apellido_materno: u.apellido_materno,
    nombre_usuario: u.nombre_usuario,
    correo: u.correo,
    tipo_usuario: String(u.rol),
    clave_de_rumiantes: u.clave_de_rumiantes || '',
    vigencia_inicio: u.vigencia_inicio,
    vigencia_fin: u.vigencia_fin,
    activo: u.activo,
    password: '',
    confirmPassword: ''
  };
}

function cancelarEdicion() {
  const ok = window.confirm(
    '¿Desea cancelar la edición? Los cambios no guardados se perderán.'
  );
  if (!ok) return;
  usuarioEditando.value = null;
}

function validarFormularioEdicion() {
  errores.value = [];

  if (!usuarioEditando.value) {
    errores.value.push('Debe seleccionar un usuario para editar.');
    return false;
  }

  const u = usuarioEditando.value;

  // Nombre y apellidos
  if (!u.nombre) {
    errores.value.push('El campo Nombre es obligatorio.');
  } else if (!soloLetrasRegex.test(u.nombre)) {
    errores.value.push('El campo Nombre solo debe contener letras.');
  }

  if (!u.apellido_paterno) {
    errores.value.push('El campo Apellido paterno es obligatorio.');
  } else if (!soloLetrasRegex.test(u.apellido_paterno)) {
    errores.value.push('El campo Apellido paterno solo debe contener letras.');
  }

  if (u.apellido_materno && !soloLetrasRegex.test(u.apellido_materno)) {
    errores.value.push('El campo Apellido materno solo debe contener letras.');
  }

  // Usuario y correo
  if (!u.nombre_usuario) {
    errores.value.push('Debe capturar el Nombre de usuario.');
  }
  if (!u.correo) {
    errores.value.push('Debe capturar el correo electrónico.');
  }

  // Contraseña (solo si se cambia)
  if (u.password || u.confirmPassword) {
    if (u.password.length < passwordMinLength) {
      errores.value.push(
        `La nueva contraseña debe tener al menos ${passwordMinLength} caracteres.`
      );
    }
    if (!/[A-Za-z]/.test(u.password) || !/\d/.test(u.password)) {
      errores.value.push(
        'La nueva contraseña debe contener letras y números.'
      );
    }
    if (u.password !== u.confirmPassword) {
      errores.value.push('La confirmación de la nueva contraseña no coincide.');
    }
  }

  // Vigencia
  if (
    u.vigencia_inicio &&
    u.vigencia_fin &&
    u.vigencia_fin < u.vigencia_inicio
  ) {
    errores.value.push(
      'La fecha de fin de vigencia no puede ser menor que la fecha de inicio.'
    );
  }

  return errores.value.length === 0;
}

function guardarCambiosUsuario() {
  mensajeExito.value = '';

  const esValido = validarFormularioEdicion();
  if (!esValido) return;

  const ok = window.confirm(
    '¿Desea guardar los cambios del usuario seleccionado?'
  );
  if (!ok) return;

  const uEdit = usuarioEditando.value;
  const idx   = usuariosDemoTabla.value.findIndex(u => u.id === uEdit.id);

  if (idx === -1) {
    errores.value.push('No se encontró el usuario en la lista.');
    return;
  }

  const rolNum      = Number(uEdit.tipo_usuario);
  const rolEtiqueta = rolesCatalog[rolNum] || 'Sin rol';

  usuariosDemoTabla.value[idx] = {
    ...usuariosDemoTabla.value[idx],
    nombre: uEdit.nombre,
    apellido_paterno: uEdit.apellido_paterno,
    apellido_materno: uEdit.apellido_materno,
    nombre_completo: `${uEdit.nombre} ${uEdit.apellido_paterno} ${uEdit.apellido_materno}`.trim(),
    nombre_usuario: uEdit.nombre_usuario,
    correo: uEdit.correo,
    rol: rolNum,
    rolEtiqueta,
    clave_de_rumiantes: uEdit.clave_de_rumiantes,
    vigencia_inicio: uEdit.vigencia_inicio,
    vigencia_fin: uEdit.vigencia_fin,
    activo: uEdit.activo
  };

  mensajeExito.value = 'Los datos del usuario se han actualizado correctamente.';
}

// ===== Eliminar / desactivar usuarios =====
function desactivarUsuario(u) {
  errores.value      = [];
  mensajeExito.value = '';

  if (!u.activo) {
    errores.value.push('El usuario ya se encuentra inactivo.');
    return;
  }

  const ok = window.confirm(
    `¿Desea desactivar al usuario "${u.nombre_usuario}"?`
  );
  if (!ok) return;

  const idx = usuariosDemoTabla.value.findIndex(x => x.id === u.id);
  if (idx === -1) {
    errores.value.push('No se encontró el usuario en la lista.');
    return;
  }

  usuariosDemoTabla.value[idx] = {
    ...usuariosDemoTabla.value[idx],
    activo: false
  };

  mensajeExito.value = 'El usuario se ha desactivado correctamente.';
}

function reactivarUsuario(u) {
  errores.value      = [];
  mensajeExito.value = '';

  if (u.activo) {
    errores.value.push('El usuario ya se encuentra activo.');
    return;
  }

  const ok = window.confirm(
    `¿Desea reactivar al usuario "${u.nombre_usuario}"?`
  );
  if (!ok) return;

  const idx = usuariosDemoTabla.value.findIndex(x => x.id === u.id);
  if (idx === -1) {
    errores.value.push('No se encontró el usuario en la lista.');
    return;
  }

  usuariosDemoTabla.value[idx] = {
    ...usuariosDemoTabla.value[idx],
    activo: true
  };

  mensajeExito.value = 'El usuario se ha reactivado correctamente.';
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

/* grupo inline para vigencia */
.sistpec-form-group-inline .sistpec-form-inline-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.vigencia-sep {
  font-size: 14px;
  color: #666;
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
