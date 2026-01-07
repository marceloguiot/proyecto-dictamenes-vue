<!-- AdminUsuariosModulo -->
<template>
  <!-- CONTENEDOR DEL MÓDULO PARA HACER SCROLL AUTOMÁTICO -->
  <div ref="moduloRoot">
    <!-- Barra de acciones -->
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

      <div class="sistpec-info-box">
        <p class="sistpec-info-text">
          {{ descripcionAccionActual }}
        </p>
      </div>
    </section>

    <section class="modulo-contenido">
      <!-- ALERTAS DE ERRORES -->
      <div v-if="errores.length" class="modulo-alert modulo-alert--error">
        <ul>
          <li v-for="(err, index) in errores" :key="index">
            {{ err }}
          </li>
        </ul>
      </div>

      <!-- ALERTA DE ÉXITO -->
      <div v-if="mensajeExito" class="modulo-alert modulo-alert--success">
        {{ mensajeExito }}
      </div>

      <!-- ================= REGISTRAR USUARIO ================= -->
      <div v-if="selectedAction === 'registrar'">
        <h3 class="subtitulo">Registrar</h3>

        <!--  novalidate para desactivar validación nativa del navegador -->
        <form class="sistpec-form" novalidate @submit.prevent="guardarUsuario">
          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Nombre</label>
              <input v-model="nuevoUsuario.nombre" type="text" required />
              <small v-if="erroresCampoRegistro.nombre" class="campo-error">
                {{ erroresCampoRegistro.nombre }}
              </small>
            </div>

            <div class="sistpec-form-group">
              <label>Apellido paterno</label>
              <input v-model="nuevoUsuario.apellido_paterno" type="text" required />
              <small v-if="erroresCampoRegistro.apellido_paterno" class="campo-error">
                {{ erroresCampoRegistro.apellido_paterno }}
              </small>
            </div>

            <div class="sistpec-form-group">
              <label>Apellido materno</label>
              <input v-model="nuevoUsuario.apellido_materno" type="text" />
              <small v-if="erroresCampoRegistro.apellido_materno" class="campo-error">
                {{ erroresCampoRegistro.apellido_materno }}
              </small>
            </div>

            <div class="sistpec-form-group">
              <label>Nombre de usuario</label>
              <input v-model="nuevoUsuario.nombre_usuario" type="text" required />
              <small v-if="erroresCampoRegistro.nombre_usuario" class="campo-error">
                {{ erroresCampoRegistro.nombre_usuario }}
              </small>
            </div>
          </div>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Correo electrónico</label>
              <input v-model="nuevoUsuario.correo" type="email" required />
              <small v-if="erroresCampoRegistro.correo" class="campo-error">
                {{ erroresCampoRegistro.correo }}
              </small>
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
              <small v-if="erroresCampoRegistro.tipo_usuario" class="campo-error">
                {{ erroresCampoRegistro.tipo_usuario }}
              </small>
            </div>
          </div>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Contraseña</label>
              <input v-model="nuevoUsuario.password" type="password" required />
              <small v-if="erroresCampoRegistro.password" class="campo-error">
                {{ erroresCampoRegistro.password }}
              </small>
            </div>

            <div class="sistpec-form-group">
              <label>Confirmar contraseña</label>
              <input v-model="nuevoUsuario.confirmPassword" type="password" required />
              <small v-if="erroresCampoRegistro.confirmPassword" class="campo-error">
                {{ erroresCampoRegistro.confirmPassword }}
              </small>
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
                <input v-model="nuevoUsuario.vigencia_inicio" type="date" required />
                <span class="vigencia-sep">a</span>
                <input v-model="nuevoUsuario.vigencia_fin" type="date" required />
              </div>
              <small v-if="erroresCampoRegistro.vigencia_inicio" class="campo-error">
                {{ erroresCampoRegistro.vigencia_inicio }}
              </small>
              <small v-else-if="erroresCampoRegistro.vigencia_fin" class="campo-error">
                {{ erroresCampoRegistro.vigencia_fin }}
              </small>
            </div>
          </div>

          <div class="sistpec-form-row sistpec-form-row-end">
            <label class="sistpec-checkbox">
              <input v-model="nuevoUsuario.activo" type="checkbox" />
              <span>Usuario activo</span>
            </label>
          </div>

          <div class="sistpec-form-actions">
            <button type="submit" class="sistpec-btn-primary">GUARDAR</button>
            <button type="button" class="sistpec-btn-secondary" @click="limpiarFormulario">
              LIMPIAR
            </button>
          </div>
        </form>
      </div>

      <!-- ================= CONSULTAR USUARIOS ================= -->
      <div v-else-if="selectedAction === 'consultar'">
        <h3 class="subtitulo">Consultar</h3>

        <div class="sistpec-search-bar">
          <div class="sistpec-form-group">
            <label>Nombre de usuario</label>
            <input v-model="filtros.nombre_usuario" type="text" placeholder="Ej. admin01" />
          </div>

          <div class="sistpec-form-group">
            <label>Clave de rumiantes</label>
            <input v-model="filtros.clave_de_rumiantes" type="text" placeholder="Ej. VER-001-2025" />
          </div>

          <div class="sistpec-form-group">
            <label>Correo electrónico</label>
            <input v-model="filtros.correo" type="email" placeholder="usuario@ejemplo.com" />
          </div>

          <div class="sistpec-form-group sistpec-search-actions">
            <button type="button" class="sistpec-btn-primary" @click="buscarUsuarios">
              BUSCAR
            </button>
            <button type="button" class="sistpec-btn-secondary" @click="limpiarFiltros">
              LIMPIAR FILTROS
            </button>
          </div>
        </div>

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
              <!-- ==================== EMPIEZAN CAMBIOS ==================== -->
              <!-- Se actualizó para usar id_usuario del backend -->
              <!-- ==================== EMPIEZAN CAMBIOS ==================== -->
              <tr v-for="u in usuariosFiltrados" :key="u.id_usuario">
                <td>{{ u.nombre_completo }}</td>
                <td>{{ u.nombre_usuario }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.rolEtiqueta }}</td>
                <td>{{ u.clave_de_rumiantes || '-' }}</td>
                <td>{{ u.vigencia_inicio }} a {{ u.vigencia_fin }}</td>
                <td>
                  <span class="badge" :class="u.activo ? 'badge--activo' : 'badge--inactivo'">
                    {{ u.activo ? 'ACTIVO' : 'INACTIVO' }}
                  </span>
                </td>
              </tr>
              <!-- ==================== TERMINAN CAMBIOS ==================== -->
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
        <h3 class="subtitulo">Editar</h3>

        <div class="sistpec-search-bar">
          <div class="sistpec-form-group">
            <label>Nombre de usuario</label>
            <input v-model="filtros.nombre_usuario" type="text" placeholder="Ej. admin01" />
          </div>

          <div class="sistpec-form-group">
            <label>Clave de rumiantes</label>
            <input v-model="filtros.clave_de_rumiantes" type="text" placeholder="Ej. VER-001-2025" />
          </div>

          <div class="sistpec-form-group">
            <label>Correo electrónico</label>
            <input v-model="filtros.correo" type="email" placeholder="usuario@ejemplo.com" />
          </div>

          <div class="sistpec-form-group sistpec-search-actions">
            <button type="button" class="sistpec-btn-primary" @click="buscarUsuarios">
              BUSCAR
            </button>
            <button type="button" class="sistpec-btn-secondary" @click="limpiarFiltros">
              LIMPIAR FILTROS
            </button>
          </div>
        </div>

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
              <!-- ==================== EMPIEZAN CAMBIOS ==================== -->
              <!-- Se actualizó para usar id_usuario del backend -->
              <!-- ==================== EMPIEZAN CAMBIOS ==================== -->
              <tr v-for="u in usuariosFiltrados" :key="u.id_usuario">
                <td>{{ u.nombre_completo }}</td>
                <td>{{ u.nombre_usuario }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.rolEtiqueta }}</td>
                <td>{{ u.clave_de_rumiantes || '-' }}</td>
                <td>{{ u.vigencia_inicio }} a {{ u.vigencia_fin }}</td>
                <td>
                  <span class="badge" :class="u.activo ? 'badge--activo' : 'badge--inactivo'">
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
              <!-- ==================== TERMINAN CAMBIOS ==================== -->
              <tr v-if="usuariosFiltrados.length === 0">
                <td colspan="8" class="sin-resultados">
                  No se encontraron usuarios con los criterios de búsqueda.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="usuarioEditando" class="sistpec-edit-panel">
          <h4 class="subtitulo-secundario">Editando: {{ usuarioEditando.nombre_usuario }}</h4>

          <!-- novalidate para desactivar validación nativa del navegador -->
          <form class="sistpec-form" novalidate @submit.prevent="guardarCambiosUsuario">
            <div class="sistpec-form-row">
              <div class="sistpec-form-group">
                <label>Nombre</label>
                <input v-model="usuarioEditando.nombre" type="text" required />
                <small v-if="erroresCampoEdicion.nombre" class="campo-error">
                  {{ erroresCampoEdicion.nombre }}
                </small>
              </div>

              <div class="sistpec-form-group">
                <label>Apellido paterno</label>
                <input v-model="usuarioEditando.apellido_paterno" type="text" required />
                <small v-if="erroresCampoEdicion.apellido_paterno" class="campo-error">
                  {{ erroresCampoEdicion.apellido_paterno }}
                </small>
              </div>

              <div class="sistpec-form-group">
                <label>Apellido materno</label>
                <input v-model="usuarioEditando.apellido_materno" type="text" />
                <small v-if="erroresCampoEdicion.apellido_materno" class="campo-error">
                  {{ erroresCampoEdicion.apellido_materno }}
                </small>
              </div>

              <div class="sistpec-form-group">
                <label>Nombre de usuario</label>
                <input v-model="usuarioEditando.nombre_usuario" type="text" required />
                <small v-if="erroresCampoEdicion.nombre_usuario" class="campo-error">
                  {{ erroresCampoEdicion.nombre_usuario }}
                </small>
              </div>
            </div>

            <div class="sistpec-form-row">
              <div class="sistpec-form-group">
                <label>Correo electrónico</label>
                <input v-model="usuarioEditando.correo" type="email" required />
                <small v-if="erroresCampoEdicion.correo" class="campo-error">
                  {{ erroresCampoEdicion.correo }}
                </small>
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
                <small v-if="erroresCampoEdicion.tipo_usuario" class="campo-error">
                  {{ erroresCampoEdicion.tipo_usuario }}
                </small>
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
                <small v-if="erroresCampoEdicion.password" class="campo-error">
                  {{ erroresCampoEdicion.password }}
                </small>
              </div>

              <div class="sistpec-form-group">
                <label>Confirmar nueva contraseña</label>
                <input
                  v-model="usuarioEditando.confirmPassword"
                  type="password"
                  placeholder="Repetir contraseña"
                />
                <small v-if="erroresCampoEdicion.confirmPassword" class="campo-error">
                  {{ erroresCampoEdicion.confirmPassword }}
                </small>
              </div>
            </div>

            <div class="sistpec-form-row">
              <div class="sistpec-form-group">
                <label>Clave de rumiantes (si aplica)</label>
                <input v-model="usuarioEditando.clave_de_rumiantes" type="text" />
              </div>

              <div class="sistpec-form-group sistpec-form-group-inline">
                <label>Vigencia</label>
                <div class="sistpec-form-inline-inputs">
                  <input v-model="usuarioEditando.vigencia_inicio" type="date" required />
                  <span class="vigencia-sep">a</span>
                  <input v-model="usuarioEditando.vigencia_fin" type="date" required />
                </div>
                <small v-if="erroresCampoEdicion.vigencia_inicio" class="campo-error">
                  {{ erroresCampoEdicion.vigencia_inicio }}
                </small>
                <small v-else-if="erroresCampoEdicion.vigencia_fin" class="campo-error">
                  {{ erroresCampoEdicion.vigencia_fin }}
                </small>
              </div>
            </div>

            <div class="sistpec-form-row sistpec-form-row-end">
              <label class="sistpec-checkbox">
                <input v-model="usuarioEditando.activo" type="checkbox" />
                <span>Usuario activo</span>
              </label>
            </div>

            <div class="sistpec-form-actions">
              <button type="submit" class="sistpec-btn-primary">GUARDAR CAMBIOS</button>
              <button type="button" class="sistpec-btn-secondary" @click="cancelarEdicion">
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================= ELIMINAR / DESACTIVAR ================= -->
      <div v-else-if="selectedAction === 'eliminar'">
        <h3 class="subtitulo">Cambiar Estatus</h3>

        <div class="sistpec-search-bar">
          <div class="sistpec-form-group">
            <label>Nombre de usuario</label>
            <input v-model="filtros.nombre_usuario" type="text" placeholder="Ej. admin01" />
          </div>

          <div class="sistpec-form-group">
            <label>Clave de rumiantes</label>
            <input v-model="filtros.clave_de_rumiantes" type="text" placeholder="Ej. VER-001-2025" />
          </div>

          <div class="sistpec-form-group">
            <label>Correo electrónico</label>
            <input v-model="filtros.correo" type="email" placeholder="usuario@ejemplo.com" />
          </div>

          <div class="sistpec-form-group sistpec-search-actions">
            <button type="button" class="sistpec-btn-primary" @click="buscarUsuarios">
              BUSCAR
            </button>
            <button type="button" class="sistpec-btn-secondary" @click="limpiarFiltros">
              LIMPIAR FILTROS
            </button>
          </div>
        </div>

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
              <!-- ==================== EMPIEZAN CAMBIOS ==================== -->
              <!-- Se actualizó para usar id_usuario del backend -->
              <!-- ==================== EMPIEZAN CAMBIOS ==================== -->
              <tr v-for="u in usuariosFiltrados" :key="u.id_usuario">
                <td>{{ u.nombre_completo }}</td>
                <td>{{ u.nombre_usuario }}</td>
                <td>{{ u.correo }}</td>
                <td>{{ u.rolEtiqueta }}</td>
                <td>{{ u.clave_de_rumiantes || '-' }}</td>
                <td>{{ u.vigencia_inicio }} a {{ u.vigencia_fin }}</td>
                <td>
                  <span class="badge" :class="u.activo ? 'badge--activo' : 'badge--inactivo'">
                    {{ u.activo ? 'ACTIVO' : 'INACTIVO' }}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    class="sistpec-btn-danger sistpec-btn-sm"
                    :disabled="!u.activo"
                    @click="desactivarUsuario(u)"
                  >
                    DESACTIVAR
                  </button>

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
              <!-- ==================== TERMINAN CAMBIOS ==================== -->
              <tr v-if="usuariosFiltrados.length === 0">
                <td colspan="8" class="sin-resultados">
                  No se encontraron usuarios con los criterios de búsqueda.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ================= BITÁCORA DE CAMBIOS ================= -->
      <div v-else-if="selectedAction === 'bitacora'">
        <h3 class="subtitulo">Bitácora</h3>

        <div class="sistpec-search-bar">
          <div class="sistpec-form-group">
            <label>Usuario que realizó el cambio</label>
            <input v-model="filtrosBitacora.actor" type="text" placeholder="Ej. admin" />
          </div>

          <div class="sistpec-form-group">
            <label>Usuario afectado</label>
            <input v-model="filtrosBitacora.objetivo" type="text" placeholder="Ej. resplab01" />
          </div>

          <div class="sistpec-form-group">
            <label>Acción</label>
            <select v-model="filtrosBitacora.accion">
              <option value="">Todas</option>
              <option value="REGISTRAR">REGISTRAR</option>
              <option value="EDITAR">EDITAR</option>
              <option value="DESACTIVAR">DESACTIVAR</option>
              <option value="REACTIVAR">REACTIVAR</option>
            </select>
          </div>

          <div class="sistpec-form-group sistpec-search-actions">
            <button type="button" class="sistpec-btn-primary" @click="cargarBitacora">
              ACTUALIZAR
            </button>
            <button type="button" class="sistpec-btn-secondary" @click="limpiarFiltrosBitacora">
              LIMPIAR FILTROS
            </button>
          </div>
        </div>

        <div class="sistpec-search-bar">
          <div class="sistpec-form-group sistpec-form-group-inline">
            <label>Rango de fecha</label>
            <div class="sistpec-form-inline-inputs">
              <input v-model="filtrosBitacora.fecha_inicio" type="date" />
              <span class="vigencia-sep">a</span>
              <input v-model="filtrosBitacora.fecha_fin" type="date" />
            </div>
          </div>
        </div>

        <div class="sistpec-table-wrapper">
          <table class="sistpec-table">
            <thead>
              <tr>
                <th>Fecha y hora</th>
                <th>Acción</th>
                <th>Realizó</th>
                <th>Afectó a</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in bitacoraFiltrada" :key="idx">
                <td>{{ r.fecha_hora }}</td>
                <td>
                  <span class="badge" :class="badgeAccionClase(r.accion)">
                    {{ r.accion }}
                  </span>
                </td>
                <td>{{ r.actor }}</td>
                <td>{{ r.objetivo }}</td>
                <td>{{ r.detalle }}</td>
              </tr>

              <tr v-if="bitacoraFiltrada.length === 0">
                <td colspan="5" class="sin-resultados">
                  No hay registros en bitácora con los filtros actuales.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ================= Fallback ================= -->
      <div v-else>
        <h3 class="subtitulo">{{ tituloAccionActual || 'Acción no disponible' }}</h3>
        <p>El contenido para esta acción aún está en desarrollo.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
// ==================== EMPIEZAN CAMBIOS ====================
// Se importó usuariosService para conectar con el backend
// ==================== EMPIEZAN CAMBIOS ====================
import { computed, ref, watch, onMounted, nextTick } from 'vue';
import { usuariosService } from '@/services/api';
// ==================== TERMINAN CAMBIOS ====================

const props = defineProps({
  codigo: { type: String, required: true },
  rol: { type: String, required: true }
});

// ====== SCROLL ======
const moduloRoot = ref(null);

function desplazarAlModulo() {
  nextTick(() => {
    if (!moduloRoot.value) return;

    const rect = moduloRoot.value.getBoundingClientRect();
    const offsetTop = rect.top + window.scrollY - 120;
    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  });
}

onMounted(() => {
  desplazarAlModulo();
  cargarBitacora(); // precarga demo

  // Cargar usuarios si la vista por defecto requiere datos
  if (selectedAction.value === 'consultar' || selectedAction.value === 'editar' || selectedAction.value === 'eliminar') {
    buscarUsuarios();
  }
});

// Catálogo de roles
const rolesCatalog = {
  1: 'Administrador',
  2: 'Responsable de laboratorio',
  3: 'Recepcionista',
  4: 'Coordinador',
  5: 'MVZ autorizado'
};

const errores = ref([]);
const mensajeExito = ref('');
// ==================== EMPIEZAN CAMBIOS ====================
// Se agregó estado de carga
// ==================== EMPIEZAN CAMBIOS ====================
const cargandoUsuarios = ref(false);
// ==================== TERMINAN CAMBIOS ====================

/** errores menasje */
const erroresCampoRegistro = ref({
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  nombre_usuario: '',
  correo: '',
  tipo_usuario: '',
  password: '',
  confirmPassword: '',
  vigencia_inicio: '',
  vigencia_fin: ''
});

const erroresCampoEdicion = ref({
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  nombre_usuario: '',
  correo: '',
  tipo_usuario: '',
  password: '',
  confirmPassword: '',
  vigencia_inicio: '',
  vigencia_fin: ''
});

function resetErroresCampoRegistro() {
  erroresCampoRegistro.value = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    nombre_usuario: '',
    correo: '',
    tipo_usuario: '',
    password: '',
    confirmPassword: '',
    vigencia_inicio: '',
    vigencia_fin: ''
  };
}

function resetErroresCampoEdicion() {
  erroresCampoEdicion.value = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    nombre_usuario: '',
    correo: '',
    tipo_usuario: '',
    password: '',
    confirmPassword: '',
    vigencia_inicio: '',
    vigencia_fin: ''
  };
}

const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
const passwordMinLength = 8;

// Acciones disponibles
const accionesUsuarios = [
  { id: 'registrar', label: 'REGISTRAR' },
  { id: 'consultar', label: 'CONSULTAR' },
  { id: 'editar', label: 'EDITAR' },
  { id: 'eliminar', label: 'CAMBIAR ESTATUS' },
  { id: 'bitacora', label: 'BITÁCORA' }
];

const selectedAction = ref('registrar');
const usuarioEditando = ref(null);

// ===== BITÁCORA (DEMO) =====
const bitacoraCambios = ref([
  {
    fecha_hora: '2025-12-19 09:10:22',
    accion: 'EDITAR',
    actor: 'admin',
    objetivo: 'resplab01',
    detalle: 'Actualizó correo y vigencia.'
  }
]);

const filtrosBitacora = ref({
  actor: '',
  objetivo: '',
  accion: '',
  fecha_inicio: '',
  fecha_fin: ''
});

function formatoFechaHoraLocal(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function registrarCambio({ accion, objetivo, detalle }) {
  // En producción: POST a API (bitacora_cambios)
  bitacoraCambios.value.unshift({
    fecha_hora: formatoFechaHoraLocal(),
    accion,
    actor: props.codigo || 'USUARIO_ACTUAL',
    objetivo,
    detalle
  });
}

function cargarBitacora() {
  // En producción: GET a API con filtros/paginación
  // Aquí solo existe el arreglo demo; se deja para estandarizar la integración.
}

function limpiarFiltrosBitacora() {
  filtrosBitacora.value = {
    actor: '',
    objetivo: '',
    accion: '',
    fecha_inicio: '',
    fecha_fin: ''
  };
}

const bitacoraFiltrada = computed(() => {
  const a = filtrosBitacora.value.actor.trim().toLowerCase();
  const o = filtrosBitacora.value.objetivo.trim().toLowerCase();
  const ac = filtrosBitacora.value.accion;
  const fi = filtrosBitacora.value.fecha_inicio;
  const ff = filtrosBitacora.value.fecha_fin;

  return bitacoraCambios.value.filter(r => {
    const okActor = a ? r.actor.toLowerCase().includes(a) : true;
    const okObj = o ? r.objetivo.toLowerCase().includes(o) : true;
    const okAcc = ac ? r.accion === ac : true;

    let okFecha = true;
    if (fi) okFecha = okFecha && r.fecha_hora.slice(0, 10) >= fi;
    if (ff) okFecha = okFecha && r.fecha_hora.slice(0, 10) <= ff;

    return okActor && okObj && okAcc && okFecha;
  });
});

function badgeAccionClase(accion) {
  if (accion === 'REGISTRAR') return 'badge--activo';
  if (accion === 'EDITAR') return 'badge--proceso';
  if (accion === 'DESACTIVAR') return 'badge--inactivo';
  if (accion === 'REACTIVAR') return 'badge--activo';
  return 'badge--proceso';
}

// ===== Registro de usuario =====
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

watch(
  () => [nuevoUsuario.value.nombre, nuevoUsuario.value.apellido_paterno, nuevoUsuario.value.apellido_materno],
  () => {
    const { nombre, apellido_paterno, apellido_materno } = nuevoUsuario.value;
    nuevoUsuario.value.nombre_completo = `${nombre} ${apellido_paterno} ${apellido_materno}`.trim();
  }
);

const descripcionAccionActual = computed(() => {
  switch (selectedAction.value) {
    case 'registrar':
      return 'Registra nuevos usuarios del sistema SISTPEC.';
    case 'consultar':
      return 'Consulta el listado de usuarios registrados en SISTPEC, con filtros.';
    case 'editar':
      return 'Edita los datos generales, roles y vigencia de los usuarios existentes.';
    case 'eliminar':
      return 'Desactiva o reactiva usuarios del sistema.';
    case 'bitacora':
      return 'Monitorea y consulta los cambios realizados por usuario.';
    default:
      return '';
  }
});

const tituloAccionActual = computed(() => {
  const accion = accionesUsuarios.find(a => a.id === selectedAction.value);
  return accion ? accion.label : '';
});

watch(
  () => selectedAction.value,
  (newAction) => {
    errores.value = [];
    mensajeExito.value = '';
    usuarioEditando.value = null;
    resetErroresCampoRegistro();
    resetErroresCampoEdicion();

    // Cargar usuarios automáticamente al cambiar a consultar o editar
    if (newAction === 'consultar' || newAction === 'editar' || newAction === 'eliminar') {
      buscarUsuarios();
    }
  }
);

// ==================== EMPIEZAN CAMBIOS ====================
// Se reemplazó usuariosDemoTabla por usuariosTabla que se llenará desde el backend
// ==================== EMPIEZAN CAMBIOS ====================
const usuariosTabla = ref([]);
// ==================== TERMINAN CAMBIOS ====================

const filtros = ref({
  nombre_usuario: '',
  clave_de_rumiantes: '',
  correo: ''
});

const usuariosFiltrados = computed(() => {
  // ==================== EMPIEZAN CAMBIOS ====================
  // Ahora solo muestra los datos cargados desde el backend
  // ==================== EMPIEZAN CAMBIOS ====================
  return usuariosTabla.value.map(u => ({
    ...u,
    nombre_completo: `${u.nombre} ${u.apellido_paterno} ${u.apellido_materno || ''}`.trim(),
    rolEtiqueta: rolesCatalog[u.tipo_usuario] || 'Sin rol'
  }));
  // ==================== TERMINAN CAMBIOS ====================
});

// ==================== EMPIEZAN CAMBIOS ====================
// Se convirtió buscarUsuarios a función async para llamar al backend
// ==================== EMPIEZAN CAMBIOS ====================
async function buscarUsuarios() {
  errores.value = [];
  mensajeExito.value = '';
  cargandoUsuarios.value = true;

  try {
    const response = await usuariosService.consultar({
      nombre_usuario: filtros.value.nombre_usuario || undefined,
      clave_de_rumiantes: filtros.value.clave_de_rumiantes || undefined,
      correo: filtros.value.correo || undefined,
      limit: 100
    });

    usuariosTabla.value = response.data;
    mensajeExito.value = `Se encontraron ${response.data.length} usuario(s).`;
  } catch (error) {
    console.error('Error al consultar usuarios:', error);
    errores.value.push('Error al consultar usuarios del servidor. Intente nuevamente.');
  } finally {
    cargandoUsuarios.value = false;
  }
}
// ==================== TERMINAN CAMBIOS ====================

function limpiarFiltros() {
  filtros.value = { nombre_usuario: '', clave_de_rumiantes: '', correo: '' };
}

// ===== Registrar =====
function limpiarFormulario() {
  const ok = window.confirm('¿Desea limpiar el formulario? Los datos capturados se perderán.');
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
  errores.value = [];
  mensajeExito.value = '';
  resetErroresCampoRegistro();
}

function validarFormularioRegistro() {
  errores.value = [];
  resetErroresCampoRegistro();

  const u = nuevoUsuario.value;

  if (!u.nombre) {
    errores.value.push('El campo Nombre es obligatorio.');
    erroresCampoRegistro.value.nombre = 'No se puede dejar en blanco.';
  } else if (!soloLetrasRegex.test(u.nombre)) {
    errores.value.push('El campo Nombre solo debe contener letras.');
    erroresCampoRegistro.value.nombre = 'Solo letras.';
  }

  if (!u.apellido_paterno) {
    errores.value.push('El campo Apellido paterno es obligatorio.');
    erroresCampoRegistro.value.apellido_paterno = 'No se puede dejar en blanco.';
  } else if (!soloLetrasRegex.test(u.apellido_paterno)) {
    errores.value.push('El campo Apellido paterno solo debe contener letras.');
    erroresCampoRegistro.value.apellido_paterno = 'Solo letras.';
  }

  if (u.apellido_materno && !soloLetrasRegex.test(u.apellido_materno)) {
    errores.value.push('El campo Apellido materno solo debe contener letras.');
    erroresCampoRegistro.value.apellido_materno = 'Solo letras.';
  }

  if (!u.nombre_usuario) {
    errores.value.push('Debe capturar el Nombre de usuario.');
    erroresCampoRegistro.value.nombre_usuario = 'No se puede dejar en blanco.';
  }

  if (!u.correo) {
    errores.value.push('Debe capturar el correo electrónico.');
    erroresCampoRegistro.value.correo = 'No se puede dejar en blanco.';
  }

  if (!u.tipo_usuario) {
    errores.value.push('Debe seleccionar un rol.');
    erroresCampoRegistro.value.tipo_usuario = 'Seleccione una opción.';
  }

  if (!u.password) {
    errores.value.push('La contraseña es obligatoria.');
    erroresCampoRegistro.value.password = 'No se puede dejar en blanco.';
  } else {
    if (u.password.length < passwordMinLength) {
      errores.value.push(`La contraseña debe tener al menos ${passwordMinLength} caracteres.`);
      erroresCampoRegistro.value.password = `Mínimo ${passwordMinLength} caracteres.`;
    } else if (!/[A-Za-z]/.test(u.password) || !/\d/.test(u.password)) {
      errores.value.push('La contraseña debe contener letras y números.');
      erroresCampoRegistro.value.password = 'Debe contener letras y números.';
    }
  }

  if (!u.confirmPassword) {
    erroresCampoRegistro.value.confirmPassword = 'No se puede dejar en blanco.';
  }

  if (u.password !== u.confirmPassword) {
    errores.value.push('La confirmación de contraseña no coincide.');
    erroresCampoRegistro.value.confirmPassword = 'No coincide.';
  }

  if (!u.vigencia_inicio) erroresCampoRegistro.value.vigencia_inicio = 'Seleccione fecha.';
  if (!u.vigencia_fin) erroresCampoRegistro.value.vigencia_fin = 'Seleccione fecha.';

  if (
    u.vigencia_inicio &&
    u.vigencia_fin &&
    u.vigencia_fin < u.vigencia_inicio
  ) {
    errores.value.push('La fecha de fin de vigencia no puede ser menor que la fecha de inicio.');
    erroresCampoRegistro.value.vigencia_fin = 'No puede ser menor que la fecha de inicio.';
  }

  return errores.value.length === 0;
}

// ==================== EMPIEZAN CAMBIOS ====================
// Se convirtió guardarUsuario a función async para llamar al backend
// ==================== EMPIEZAN CAMBIOS ====================
async function guardarUsuario() {
  mensajeExito.value = '';

  const esValido = validarFormularioRegistro();
  if (!esValido) return;

  const ok = window.confirm('¿Desea guardar el usuario con los datos capturados?');
  if (!ok) return;

  cargandoUsuarios.value = true;

  try {
    const rolNum = Number(nuevoUsuario.value.tipo_usuario);

    await usuariosService.crear({
      nombre: nuevoUsuario.value.nombre,
      apellido_paterno: nuevoUsuario.value.apellido_paterno,
      apellido_materno: nuevoUsuario.value.apellido_materno || null,
      nombre_usuario: nuevoUsuario.value.nombre_usuario,
      correo: nuevoUsuario.value.correo,
      password: nuevoUsuario.value.password,
      tipo_usuario: rolNum,
      clave_de_rumiantes: nuevoUsuario.value.clave_de_rumiantes || null,
      vigencia_inicio: nuevoUsuario.value.vigencia_inicio,
      vigencia_fin: nuevoUsuario.value.vigencia_fin,
      activo: nuevoUsuario.value.activo
    });

    mensajeExito.value = 'El usuario ha sido registrado correctamente.';
    resetErroresCampoRegistro();

    // Limpiar formulario
    limpiarFormulario();
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    errores.value.push('Error al registrar usuario en el servidor. Verifique que el nombre de usuario y correo no estén duplicados.');
  } finally {
    cargandoUsuarios.value = false;
  }
}
// ==================== TERMINAN CAMBIOS ====================

// ===== Edición =====
function seleccionarUsuario(u) {
  errores.value = [];
  mensajeExito.value = '';
  resetErroresCampoEdicion();

  // ==================== EMPIEZAN CAMBIOS ====================
  // Se actualizó para usar id_usuario y tipo_usuario del backend
  // ==================== EMPIEZAN CAMBIOS ====================
  usuarioEditando.value = {
    id_usuario: u.id_usuario,
    nombre: u.nombre,
    apellido_paterno: u.apellido_paterno,
    apellido_materno: u.apellido_materno || '',
    nombre_usuario: u.nombre_usuario,
    correo: u.correo,
    tipo_usuario: String(u.tipo_usuario),
    clave_de_rumiantes: u.clave_de_rumiantes || '',
    vigencia_inicio: u.vigencia_inicio,
    vigencia_fin: u.vigencia_fin,
    activo: u.activo,
    password: '',
    confirmPassword: ''
  };
  // ==================== TERMINAN CAMBIOS ====================
}

function cancelarEdicion() {
  const ok = window.confirm('¿Desea cancelar la edición? Los cambios no guardados se perderán.');
  if (!ok) return;
  usuarioEditando.value = null;
  resetErroresCampoEdicion();
}

function validarFormularioEdicion() {
  errores.value = [];
  resetErroresCampoEdicion();

  if (!usuarioEditando.value) {
    errores.value.push('Debe seleccionar un usuario para editar.');
    return false;
  }

  const u = usuarioEditando.value;

  if (!u.nombre) {
    errores.value.push('El campo Nombre es obligatorio.');
    erroresCampoEdicion.value.nombre = 'No se puede dejar en blanco.';
  } else if (!soloLetrasRegex.test(u.nombre)) {
    errores.value.push('El campo Nombre solo debe contener letras.');
    erroresCampoEdicion.value.nombre = 'Solo letras.';
  }

  if (!u.apellido_paterno) {
    errores.value.push('El campo Apellido paterno es obligatorio.');
    erroresCampoEdicion.value.apellido_paterno = 'No se puede dejar en blanco.';
  } else if (!soloLetrasRegex.test(u.apellido_paterno)) {
    errores.value.push('El campo Apellido paterno solo debe contener letras.');
    erroresCampoEdicion.value.apellido_paterno = 'Solo letras.';
  }

  if (u.apellido_materno && !soloLetrasRegex.test(u.apellido_materno)) {
    errores.value.push('El campo Apellido materno solo debe contener letras.');
    erroresCampoEdicion.value.apellido_materno = 'Solo letras.';
  }

  if (!u.nombre_usuario) {
    errores.value.push('Debe capturar el Nombre de usuario.');
    erroresCampoEdicion.value.nombre_usuario = 'No se puede dejar en blanco.';
  }

  if (!u.correo) {
    errores.value.push('Debe capturar el correo electrónico.');
    erroresCampoEdicion.value.correo = 'No se puede dejar en blanco.';
  }

  if (!u.tipo_usuario) {
    errores.value.push('Debe seleccionar un rol.');
    erroresCampoEdicion.value.tipo_usuario = 'Seleccione una opción.';
  }

  // Password opcional: solo valida si alguno se escribió
  if (u.password || u.confirmPassword) {
    if (!u.password) {
      erroresCampoEdicion.value.password = 'No se puede dejar en blanco.';
    } else if (u.password.length < passwordMinLength) {
      errores.value.push(`La nueva contraseña debe tener al menos ${passwordMinLength} caracteres.`);
      erroresCampoEdicion.value.password = `Mínimo ${passwordMinLength} caracteres.`;
    } else if (!/[A-Za-z]/.test(u.password) || !/\d/.test(u.password)) {
      errores.value.push('La nueva contraseña debe contener letras y números.');
      erroresCampoEdicion.value.password = 'Debe contener letras y números.';
    }

    if (!u.confirmPassword) {
      erroresCampoEdicion.value.confirmPassword = 'No se puede dejar en blanco.';
    }

    if (u.password !== u.confirmPassword) {
      errores.value.push('La confirmación de la nueva contraseña no coincide.');
      erroresCampoEdicion.value.confirmPassword = 'No coincide.';
    }
  }

  if (!u.vigencia_inicio) erroresCampoEdicion.value.vigencia_inicio = 'Seleccione fecha.';
  if (!u.vigencia_fin) erroresCampoEdicion.value.vigencia_fin = 'Seleccione fecha.';

  if (u.vigencia_inicio && u.vigencia_fin && u.vigencia_fin < u.vigencia_inicio) {
    errores.value.push('La fecha de fin de vigencia no puede ser menor que la fecha de inicio.');
    erroresCampoEdicion.value.vigencia_fin = 'No puede ser menor que la fecha de inicio.';
  }

  return errores.value.length === 0;
}

// ==================== EMPIEZAN CAMBIOS ====================
// Se convirtió guardarCambiosUsuario a función async para llamar al backend
// ==================== EMPIEZAN CAMBIOS ====================
async function guardarCambiosUsuario() {
  mensajeExito.value = '';

  const esValido = validarFormularioEdicion();
  if (!esValido) return;

  const ok = window.confirm('¿Desea guardar los cambios del usuario seleccionado?');
  if (!ok) return;

  cargandoUsuarios.value = true;

  try {
    const uEdit = usuarioEditando.value;
    const rolNum = Number(uEdit.tipo_usuario);

    const payload = {
      nombre: uEdit.nombre,
      apellido_paterno: uEdit.apellido_paterno,
      apellido_materno: uEdit.apellido_materno || null,
      nombre_usuario: uEdit.nombre_usuario,
      correo: uEdit.correo,
      tipo_usuario: rolNum,
      clave_de_rumiantes: uEdit.clave_de_rumiantes || null,
      vigencia_inicio: uEdit.vigencia_inicio,
      vigencia_fin: uEdit.vigencia_fin,
      activo: uEdit.activo
    };

    // Solo incluir password si se especificó
    if (uEdit.password) {
      payload.password = uEdit.password;
    }

    await usuariosService.actualizar(uEdit.id_usuario, payload);

    mensajeExito.value = 'Los datos del usuario se han actualizado correctamente.';
    usuarioEditando.value = null;
    resetErroresCampoEdicion();

    // Recargar la lista
    await buscarUsuarios();
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    errores.value.push('Error al actualizar usuario en el servidor.');
  } finally {
    cargandoUsuarios.value = false;
  }
}
// ==================== TERMINAN CAMBIOS ====================

// ==================== EMPIEZAN CAMBIOS ====================
// Se convirtieron desactivarUsuario y reactivarUsuario a funciones async para llamar al backend
// ==================== EMPIEZAN CAMBIOS ====================
async function desactivarUsuario(u) {
  errores.value = [];
  mensajeExito.value = '';

  if (!u.activo) {
    errores.value.push('El usuario ya se encuentra inactivo.');
    return;
  }

  const ok = window.confirm(`¿Desea desactivar al usuario "${u.nombre_usuario}"?`);
  if (!ok) return;

  try {
    await usuariosService.desactivar(u.id_usuario);
    mensajeExito.value = 'El usuario se ha desactivado correctamente.';

    // Recargar la lista
    await buscarUsuarios();
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    errores.value.push('Error al desactivar usuario en el servidor.');
  }
}

async function reactivarUsuario(u) {
  errores.value = [];
  mensajeExito.value = '';

  if (u.activo) {
    errores.value.push('El usuario ya se encuentra activo.');
    return;
  }

  const ok = window.confirm(`¿Desea reactivar al usuario "${u.nombre_usuario}"?`);
  if (!ok) return;

  try {
    await usuariosService.reactivar(u.id_usuario);
    mensajeExito.value = 'El usuario se ha reactivado correctamente.';

    // Recargar la lista
    await buscarUsuarios();
  } catch (error) {
    console.error('Error al reactivar usuario:', error);
    errores.value.push('Error al reactivar usuario en el servidor.');
  }
}
// ==================== TERMINAN CAMBIOS ====================
</script>

<style scoped>
/* Acciones */
.modulo-acciones { margin-bottom: 20px; }
.modulo-acciones-titulo { display:block; font-size: 14px; margin-bottom: 8px; color:#333; font-weight: 600; }
.modulo-acciones-botones { display:flex; flex-wrap:wrap; gap: 4px; }

.sistpec-btn-accion{
  border:none; padding:8px 16px; font-size:12px; font-weight:600;
  text-transform:uppercase; border-radius:3px; cursor:pointer;
  background-color:#2f6b32; color:#fff; letter-spacing:0.5px;
}
.sistpec-btn-accion.active{ background-color:#244e26; }

.modulo-contenido { margin-top: 10px; }

.subtitulo { font-size:18px; margin:10px 0 15px; color:#333; }
.subtitulo-secundario { font-size:16px; margin:16px 0 10px; color:#333; }


.campo-error{
  color:#7a1f1f;
  font-size:12px;
  font-weight:600;
  margin-top:4px;
}

/* Form */
.sistpec-form { display:flex; flex-direction:column; gap:16px; }
.sistpec-form-row { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:16px; }
.sistpec-form-row-end { justify-content:flex-end; display:flex; }

.sistpec-form-group { display:flex; flex-direction:column; gap:4px; }
.sistpec-form-group label { font-size:13px; font-weight:600; color:#444; }

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

.sistpec-checkbox{ display:inline-flex; align-items:center; gap:6px; font-size:14px; color:#444; }

.sistpec-form-actions{ display:flex; justify-content:flex-end; gap:8px; }

/* Botones */
.sistpec-btn-primary{
  background-color:#2f6b32; color:#fff; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:600; cursor:pointer;
}
.sistpec-btn-primary:hover{ background-color:#244e26; }

.sistpec-btn-secondary{
  background-color:#e0e0e0; color:#333; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:600; cursor:pointer;
}
.sistpec-btn-secondary:hover{ background-color:#d0d0d0; }

.sistpec-btn-sm{ padding:4px 10px; font-size:11px; }

.sistpec-btn-danger{
  background-color:#7a061e; color:#fff; border:none;
  padding:6px 14px; border-radius:4px;
  font-size:12px; font-weight:600; cursor:pointer;
}
.sistpec-btn-danger:hover{ background-color:#5a0416; }
.sistpec-btn-danger[disabled]{ opacity:0.5; cursor:default; }

/* Info */
.sistpec-info-box{ margin-top:10px; padding:10px 14px; border-radius:4px; background-color:#e1f3e1; border:1px solid #c3e6c3; }
.sistpec-info-text{ margin:0; font-size:13px; color:#225522; }

/* Alertas */
.modulo-alert{ margin-bottom:12px; padding:10px 14px; border-radius:4px; font-size:13px; }
.modulo-alert--error{ background-color:#fbeaea; border:1px solid #f5c2c2; color:#7a1f1f; }
.modulo-alert--success{ background-color:#e1f3e1; border:1px solid #c3e6c3; color:#225522; }

/* Search bar */
.sistpec-search-bar{
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap:12px;
  margin-bottom:16px;
}

.sistpec-search-actions{
  display:flex;
  align-items:flex-end;
  gap:8px;
}

/* Tabla */
.sistpec-table-wrapper{ width:100%; overflow-x:auto; }
.sistpec-table{ width:100%; border-collapse:collapse; font-size:13px; }
.sistpec-table thead{ background-color:#7a061e; color:#fff; }
.sistpec-table th, .sistpec-table td{ padding:8px 10px; border:1px solid #ddd; text-align:left; }
.sistpec-table tbody tr:nth-child(even){ background-color:#fafafa; }
.sin-resultados{ text-align:center; color:#777; }

/* Panel */
.sistpec-edit-panel{ margin-top:20px; padding-top:10px; border-top:1px dashed #ccc; }

/* Badges */
.badge{ display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; }
.badge--activo{ background-color:#e1f3e1; color:#225522; }
.badge--inactivo{ background-color:#fbeaea; color:#7a1f1f; }
.badge--proceso{ background-color:#fff4e5; color:#b26a00; }

/* Responsive */
@media (max-width: 768px) {
  .sistpec-form-row{ grid-template-columns: 1fr; }
  .sistpec-search-bar{ grid-template-columns: 1fr; }
}
</style>

