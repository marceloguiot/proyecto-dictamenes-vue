<template>
  <section class="modulo-acciones">
    <span class="modulo-acciones-titulo">Acciones disponibles</span>

    <div class="modulo-acciones-botones">
      <button
        v-for="accion in accionesUpp"
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
    <!-- ALERTAS -->
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

    <div
      v-if="mensajeExito"
      class="modulo-alert modulo-alert--success"
    >
      {{ mensajeExito }}
    </div>

    <!-- ================= CONSULTAR UPP ================= -->
    <div v-if="selectedAction === 'consultar'">
      <h3 class="subtitulo">Consultar</h3>

      <!-- Filtros -->
      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Clave UPP</label>
          <input
            v-model="filtros.clave_upp"
            type="text"
            placeholder="Ej. UPP-VER-001"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Nombre de la UPP</label>
          <input
            v-model="filtros.nombre_upp"
            type="text"
            placeholder="Nombre de la unidad"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Propietario</label>
          <input
            v-model="filtros.propietario"
            type="text"
            placeholder="Nombre del propietario"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Municipio</label>
          <input
            v-model="filtros.municipio"
            type="text"
            placeholder="Municipio"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Localidad</label>
          <input
            v-model="filtros.localidad"
            type="text"
            placeholder="Localidad"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Estatus</label>
          <select v-model="filtros.estatus">
            <option value="">Todos</option>
            <option value="ACTIVA">Activa</option>
            <option value="BAJA">Baja</option>
          </select>
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button
            type="button"
            class="sistpec-btn-primary"
            @click="buscarUpp"
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

      <!-- Resultados -->
      <div class="sistpec-table-wrapper" v-if="seBusco">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Clave UPP</th>
              <th>Nombre UPP</th>
              <th>Propietario</th>
              <th>Municipio</th>
              <th>Localidad</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in uppFiltradas" :key="u.id">
              <td>{{ u.clave_upp }}</td>
              <td>{{ u.nombre_upp }}</td>
              <td>{{ u.propietario }}</td>
              <td>{{ u.municipio }}</td>
              <td>{{ u.localidad }}</td>
              <td>
                <span
                  class="badge"
                  :class="u.estatus === 'ACTIVA' ? 'badge--activo' : 'badge--inactivo'"
                >
                  {{ u.estatus }}
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

      <div v-else class="sin-resultados sin-busqueda">
        Capture al menos un filtro y presione <strong>BUSCAR</strong> para mostrar las UPP.
      </div>
    </div>

    <!-- ================= ELIMINAR UPP ================= -->
    <div v-else-if="selectedAction === 'eliminar'">
      <h3 class="subtitulo">Eliminar (dar de baja) UPP</h3>


      <!-- Filtros -->
      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Clave UPP</label>
          <input
            v-model="filtros.clave_upp"
            type="text"
            placeholder="Ej. UPP-VER-001"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Nombre de la UPP</label>
          <input
            v-model="filtros.nombre_upp"
            type="text"
            placeholder="Nombre de la unidad"
          />
        </div>

        <div class="sistpec-form-group">
          <label>Propietario</label>
          <input
            v-model="filtros.propietario"
            type="text"
            placeholder="Nombre del propietario"
          />
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button
            type="button"
            class="sistpec-btn-primary"
            @click="buscarUpp"
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

      <!-- Resultados con botón ELIMINAR -->
      <div class="sistpec-table-wrapper" v-if="seBusco">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Clave UPP</th>
              <th>Nombre UPP</th>
              <th>Propietario</th>
              <th>Municipio</th>
              <th>Localidad</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in uppFiltradas" :key="u.id">
              <td>{{ u.clave_upp }}</td>
              <td>{{ u.nombre_upp }}</td>
              <td>{{ u.propietario }}</td>
              <td>{{ u.municipio }}</td>
              <td>{{ u.localidad }}</td>
              <td>
                <span
                  class="badge"
                  :class="u.estatus === 'ACTIVA' ? 'badge--activo' : 'badge--inactivo'"
                >
                  {{ u.estatus }}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  class="sistpec-btn-danger sistpec-btn-sm"
                  :disabled="u.estatus === 'BAJA'"
                  @click="bajaUpp(u)"
                >
                  DAR DE BAJA
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

      <div v-else class="sin-resultados sin-busqueda">
        Capture al menos un filtro y presione <strong>BUSCAR</strong> para mostrar las UPP.
      </div>
    </div>

    <!-- Fallback -->
    <div v-else>
      <h3 class="subtitulo">Acción no disponible</h3>
      <p>El contenido para esta acción aún está en desarrollo.</p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

defineProps({
  codigo: { type: String, required: true },
  rol: { type: String, required: true }
});

const errores = ref([]);
const mensajeExito = ref('');
const seBusco = ref(false);

// Acciones disponibles
const accionesUpp = [
  { id: 'consultar', label: 'CONSULTAR' },
  { id: 'eliminar', label: 'ELIMINAR' }
];

const selectedAction = ref('consultar');

const descripcionAccionActual = computed(() => {
  switch (selectedAction.value) {
    case 'consultar':
      return 'Consulta las Unidades de Producción Pecuaria (UPP) registradas en el sistema.';
    case 'eliminar':
      return 'Permite dar de baja lógicamente una UPP que ya no debe considerarse activa.';
    default:
      return '';
  }
});

// Filtros
const filtros = ref({
  clave_upp: '',
  nombre_upp: '',
  propietario: '',
  municipio: '',
  localidad: '',
  estatus: ''
});

// Datos demo
const uppDemoTabla = ref([
  {
    id: 1,
    clave_upp: 'UPP-VER-001',
    nombre_upp: 'Rancho San Gabriel',
    propietario: 'Ganadera San Gabriel',
    municipio: 'Tantoyuca',
    localidad: 'San Gabriel',
    estatus: 'ACTIVA'
  },
  {
    id: 2,
    clave_upp: 'UPP-VER-002',
    nombre_upp: 'Rancho La Gloria',
    propietario: 'Productores La Gloria',
    municipio: 'Perote',
    localidad: 'La Gloria',
    estatus: 'ACTIVA'
  },
  {
    id: 3,
    clave_upp: 'UPP-VER-003',
    nombre_upp: 'Granja El Zapotal',
    propietario: 'Productores Unidos',
    municipio: 'Acajete',
    localidad: 'El Zapotal',
    estatus: 'BAJA'
  }
]);

const uppFiltradas = computed(() => {
  const f = filtros.value;

  return uppDemoTabla.value.filter((u) => {
    if (f.clave_upp && !u.clave_upp.toLowerCase().includes(f.clave_upp.toLowerCase())) {
      return false;
    }
    if (f.nombre_upp && !u.nombre_upp.toLowerCase().includes(f.nombre_upp.toLowerCase())) {
      return false;
    }
    if (f.propietario && !u.propietario.toLowerCase().includes(f.propietario.toLowerCase())) {
      return false;
    }
    if (f.municipio && !u.municipio.toLowerCase().includes(f.municipio.toLowerCase())) {
      return false;
    }
    if (f.localidad && !u.localidad.toLowerCase().includes(f.localidad.toLowerCase())) {
      return false;
    }
    if (f.estatus && u.estatus !== f.estatus) {
      return false;
    }
    return true;
  });
});

function hayAlgunFiltro() {
  return Object.values(filtros.value).some((v) => String(v).trim() !== '');
}

function buscarUpp() {
  errores.value = [];
  mensajeExito.value = '';
  seBusco.value = false;

  // >>> Se debe de capturar al menos un criterio <<<
  if (!hayAlgunFiltro()) {
    errores.value.push(
      'Debe capturar al menos un criterio de búsqueda para consultar UPP.'
    );
    return;
  }

  seBusco.value = true;

  if (uppFiltradas.value.length) {
    mensajeExito.value = `Se encontraron ${uppFiltradas.value.length} UPP que coinciden con la búsqueda.`;
  } else {
    mensajeExito.value = '';
  }
}

function limpiarFiltros() {
  filtros.value = {
    clave_upp: '',
    nombre_upp: '',
    propietario: '',
    municipio: '',
    localidad: '',
    estatus: ''
  };
  errores.value = [];
  mensajeExito.value = '';
  seBusco.value = false;
}

function bajaUpp(u) {
  errores.value = [];
  mensajeExito.value = '';

  if (u.estatus === 'BAJA') {
    errores.value.push('La UPP ya se encuentra dada de baja.');
    return;
  }

  const ok = window.confirm(
    `¿Desea dar de baja la UPP "${u.nombre_upp}" (${u.clave_upp})?`
  );
  if (!ok) return;

  const idx = uppDemoTabla.value.findIndex((x) => x.id === u.id);
  if (idx === -1) {
    errores.value.push('No se encontró la UPP en la lista.');
    return;
  }

  uppDemoTabla.value[idx] = {
    ...uppDemoTabla.value[idx],
    estatus: 'BAJA'
  };

  mensajeExito.value = 'La UPP se ha dado de baja correctamente.';
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

/* Barra de filtros */
.sistpec-search-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
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

/* Botones buscar/limpiar */
.sistpec-search-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

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

/* Botón peligro (baja) */
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
  margin-top: 10px;
}

.sin-busqueda {
  font-size: 13px;
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
