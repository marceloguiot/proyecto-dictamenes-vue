<template>
  <!-- Barra de acciones (botones Consultar / Eliminar) -->
  <section class="modulo-acciones">
    <span class="modulo-acciones-titulo">Acciones disponibles</span>

    <div class="modulo-acciones-botones">
      <button
        v-for="accion in accionesUpp"
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

    <!-- ================= CONSULTAR UPP ================= -->
    <div v-if="selectedAction === 'consultar'">
      <h3 class="subtitulo">Consultar UPP</h3>

      <!-- Barra de filtros -->
      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Clave UPP</label>
          <input
            v-model="filtros.upp"
            type="text"
            placeholder="Ej. VER-0001-2025"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Propietario</label>
          <input
            v-model="filtros.propietario"
            type="text"
            placeholder="Nombre y/o apellidos"
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

        <div class="sistpec-form-group">
          <label>Localidad</label>
          <input
            v-model="filtros.localidad"
            type="text"
            placeholder="Ej. El Castillo"
          />
        </div>
      </div>

      <!-- Botones buscar / limpiar -->
      <div class="sistpec-search-actions sistpec-search-actions-bottom">
        <button
          type="button"
          class="sistpec-btn-primary"
          @click="buscarUpps"
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
              <th>Clave UPP</th>
              <th>Propietario</th>
              <th>Municipio</th>
              <th>Localidad</th>
              <th>Estrato</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in uppFiltradas" :key="u.id">
              <td>{{ u.upp }}</td>
              <td>{{ u.propietario }}</td>
              <td>{{ u.municipio }}</td>
              <td>{{ u.localidad }}</td>
              <td>{{ u.estrato || '-' }}</td>
              <td>
                <span
                  class="badge"
                  :class="u.activo ? 'badge--activo' : 'badge--inactivo'"
                >
                  {{ u.activo ? 'ACTIVA' : 'INACTIVA' }}
                </span>
              </td>
            </tr>
            <tr v-if="uppFiltradas.length === 0">
              <td colspan="6" class="sin-resultados">
                No se encontraron UPP con los criterios de búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= ELIMINAR / DESACTIVAR UPP ================= -->
    <div v-else-if="selectedAction === 'eliminar'">
      <h3 class="subtitulo">Eliminar (desactivar) UPP</h3>

      <div class="sistpec-info-box">
        <p class="sistpec-info-text">
          La eliminación se realiza como baja lógica: la UPP se marca como
          <strong>INACTIVA</strong> y ya no puede usarse para nuevos dictámenes,
          pero se conserva el historial en SISTPEC.
        </p>
      </div>

      <!-- Filtros -->
      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Clave UPP</label>
          <input
            v-model="filtros.upp"
            type="text"
            placeholder="Ej. VER-0001-2025"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Propietario</label>
          <input
            v-model="filtros.propietario"
            type="text"
            placeholder="Nombre y/o apellidos"
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

        <div class="sistpec-form-group">
          <label>Localidad</label>
          <input
            v-model="filtros.localidad"
            type="text"
            placeholder="Ej. El Castillo"
          />
        </div>
      </div>

      <div class="sistpec-search-actions sistpec-search-actions-bottom">
        <button
          type="button"
          class="sistpec-btn-primary"
          @click="buscarUpps"
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
              <th>Clave UPP</th>
              <th>Propietario</th>
              <th>Municipio</th>
              <th>Localidad</th>
              <th>Estrato</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in uppFiltradas" :key="u.id">
              <td>{{ u.upp }}</td>
              <td>{{ u.propietario }}</td>
              <td>{{ u.municipio }}</td>
              <td>{{ u.localidad }}</td>
              <td>{{ u.estrato || '-' }}</td>
              <td>
                <span
                  class="badge"
                  :class="u.activo ? 'badge--activo' : 'badge--inactivo'"
                >
                  {{ u.activo ? 'ACTIVA' : 'INACTIVA' }}
                </span>
              </td>
              <td>
                <!-- Botón DESACTIVAR -->
                <button
                  type="button"
                  class="sistpec-btn-danger sistpec-btn-sm"
                  :disabled="!u.activo"
                  @click="desactivarUpp(u)"
                >
                  DESACTIVAR
                </button>

                <!-- Botón REACTIVAR -->
                <button
                  type="button"
                  class="sistpec-btn-secondary sistpec-btn-sm"
                  :disabled="u.activo"
                  @click="reactivarUpp(u)"
                  style="margin-left: 6px;"
                >
                  REACTIVAR
                </button>
              </td>
            </tr>
            <tr v-if="uppFiltradas.length === 0">
              <td colspan="7" class="sin-resultados">
                No se encontraron UPP con los criterios de búsqueda.
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

// Acciones disponibles (solo consulta y eliminación)
const accionesUpp = [
  { id: 'consultar', label: 'CONSULTAR UPP' },
  { id: 'eliminar',  label: 'ELIMINAR UPP' }
];

const selectedAction = ref('consultar');

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
      return 'Consulta el catálogo de Unidades de Producción Pecuaria registradas en SISTPEC.';
    case 'eliminar':
      return 'Realiza bajas lógicas de UPP que ya no deban estar activas en SISTPEC.';
    default:
      return '';
  }
});

// Reset de mensajes al cambiar de acción
watch(
  () => selectedAction.value,
  () => {
    errores.value      = [];
    mensajeExito.value = '';
  }
);

// ===== Datos demo para tabla (simula respuesta de backend) =====
const uppDemoTabla = ref([
  {
    id: 1,
    upp: 'VER-0001-2025',
    propietario: 'José López Ramírez',
    municipio: 'Xalapa',
    localidad: 'El Castillo',
    estrato: 'Pequeño productor',
    activo: true
  },
  {
    id: 2,
    upp: 'VER-0020-2025',
    propietario: 'María Hernández Torres',
    municipio: 'Perote',
    localidad: 'La Gloria',
    estrato: 'Mediano productor',
    activo: true
  },
  {
    id: 3,
    upp: 'VER-0100-2025',
    propietario: 'Carlos García Santos',
    municipio: 'Isla',
    localidad: 'Paso del Medio',
    estrato: 'Pequeño productor',
    activo: false
  }
]);

// Filtros
const filtros = ref({
  upp: '',
  propietario: '',
  municipio: '',
  localidad: ''
});

const uppFiltradas = computed(() => {
  const upp        = filtros.value.upp.trim().toLowerCase();
  const prop       = filtros.value.propietario.trim().toLowerCase();
  const municipio  = filtros.value.municipio.trim().toLowerCase();
  const localidad  = filtros.value.localidad.trim().toLowerCase();

  return uppDemoTabla.value.filter(u => {
    const matchUpp = upp
      ? (u.upp || '').toLowerCase().includes(upp)
      : true;
    const matchProp = prop
      ? (u.propietario || '').toLowerCase().includes(prop)
      : true;
    const matchMunicipio = municipio
      ? (u.municipio || '').toLowerCase().includes(municipio)
      : true;
    const matchLocalidad = localidad
      ? (u.localidad || '').toLowerCase().includes(localidad)
      : true;

    return matchUpp && matchProp && matchMunicipio && matchLocalidad;
  });
});

function buscarUpps() {
  // La búsqueda es reactiva con los filtros;
  // aquí podrías loggear o llamar a backend si lo requiere el CU.
}

function limpiarFiltros() {
  filtros.value = {
    upp: '',
    propietario: '',
    municipio: '',
    localidad: ''
  };
}

// ===== Eliminar / desactivar UPP =====
function desactivarUpp(u) {
  errores.value      = [];
  mensajeExito.value = '';

  if (!u.activo) {
    errores.value.push('La UPP ya se encuentra inactiva.');
    return;
  }

  const ok = window.confirm(
    `¿Desea desactivar la UPP "${u.upp}" del propietario "${u.propietario}"?`
  );
  if (!ok) return;

  const idx = uppDemoTabla.value.findIndex(x => x.id === u.id);
  if (idx === -1) {
    errores.value.push('No se encontró la UPP en la lista.');
    return;
  }

  uppDemoTabla.value[idx] = {
    ...uppDemoTabla.value[idx],
    activo: false
  };

  mensajeExito.value = 'La UPP se ha desactivado correctamente.';
}

function reactivarUpp(u) {
  errores.value      = [];
  mensajeExito.value = '';

  if (u.activo) {
    errores.value.push('La UPP ya se encuentra activa.');
    return;
  }

  const ok = window.confirm(
    `¿Desea reactivar la UPP "${u.upp}" del propietario "${u.propietario}"?`
  );
  if (!ok) return;

  const idx = uppDemoTabla.value.findIndex(x => x.id === u.id);
  if (idx === -1) {
    errores.value.push('No se encontró la UPP en la lista.');
    return;
  }

  uppDemoTabla.value[idx] = {
    ...uppDemoTabla.value[idx],
    activo: true
  };

  mensajeExito.value = 'La UPP se ha reactivado correctamente.';
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

/* ---- Formulario / filtros SISTPEC ---- */
.sistpec-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

/* CONSULTAR / ELIMINAR: barra de filtros */
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
  .sistpec-search-bar {
    grid-template-columns: 1fr;
  }
}
</style>
