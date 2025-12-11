<template>
  <!-- Barra de acciones (solo Consultar Muestras) -->
  <section class="modulo-acciones">
    <span class="modulo-acciones-titulo">Acciones disponibles</span>

    <div class="modulo-acciones-botones">
      <button
        v-for="accion in accionesMuestras"
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

    <!-- ALERTA DE ÉXITO (en este módulo casi no se usa, pero queda lista) -->
    <div
      v-if="mensajeExito"
      class="modulo-alert modulo-alert--success"
    >
      {{ mensajeExito }}
    </div>

    <!-- ================= CONSULTAR MUESTRAS ================= -->
    <div v-if="selectedAction === 'consultar'">
      <h3 class="subtitulo">Consultar muestras</h3>

      <!-- Barra de filtros -->
      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>ID / Folio de muestra</label>
          <input
            v-model="filtros.id_muestra"
            type="text"
            placeholder="Ej. M-0001-2025 o BR25-001"
          />
        </div>

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
          <label>Estatus de la muestra</label>
          <select v-model="filtros.estatus">
            <option value="">Todos</option>
            <option value="En proceso">En proceso</option>
            <option value="Concluido">Concluido</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
      </div>

      <!-- Rango de fechas -->
      <div class="sistpec-search-bar fechas-bar">
        <div class="sistpec-form-group sistpec-form-group-inline">
          <label>Fecha de recepción</label>
          <div class="sistpec-form-inline-inputs">
            <input
              v-model="filtros.fecha_inicio"
              type="date"
            />
            <span class="vigencia-sep">a</span>
            <input
              v-model="filtros.fecha_fin"
              type="date"
            />
          </div>
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button
            type="button"
            class="sistpec-btn-primary"
            @click="buscarMuestras"
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
              <th>ID muestra</th>
              <th>Clave UPP</th>
              <th>Propietario</th>
              <th>Especie</th>
              <th>Tipo de muestra</th>
              <th>Fecha recepción</th>
              <th>Estatus</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in muestrasFiltradas" :key="m.id">
              <td>{{ m.id_muestra }}</td>
              <td>{{ m.upp }}</td>
              <td>{{ m.propietario }}</td>
              <td>{{ m.especie }}</td>
              <td>{{ m.tipo_muestra }}</td>
              <td>{{ m.fecha_recepcion }}</td>
              <td>
                <span
                  class="badge"
                  :class="badgeEstatusClase(m.estatus)"
                >
                  {{ m.estatus }}
                </span>
              </td>
              <td>{{ m.resultado || '-' }}</td>
            </tr>
            <tr v-if="muestrasFiltradas.length === 0">
              <td colspan="8" class="sin-resultados">
                No se encontraron muestras con los criterios de búsqueda.
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
    const offset = 90; // compensa la barra de navegación fija
    const top = rect.top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

// Acciones disponibles (solo consulta)
const accionesMuestras = [
  { id: 'consultar', label: 'CONSULTAR MUESTRAS' }
];

const selectedAction = ref('consultar');

const errores      = ref([]);
const mensajeExito = ref('');

// Cambiar acción + scroll
function cambiarAccion(accionId) {
  selectedAction.value = accionId;
  scrollAlContenido();
}

// Descripciones según acción
const descripcionAccionActual = computed(() => {
  switch (selectedAction.value) {
    case 'consultar':
      return 'Consulta el listado de muestras recepcionadas en el laboratorio, con filtros por UPP, propietario, fechas y estatus.';
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

// ===== Datos demo para tabla (simulación de backend) =====
const muestrasDemoTabla = ref([
  {
    id: 1,
    id_muestra: 'M-0001-2025',
    upp: 'VER-0001-2025',
    propietario: 'José López Ramírez',
    especie: 'Bovino',
    tipo_muestra: 'Suero sanguíneo',
    fecha_recepcion: '2025-03-10',
    estatus: 'Concluido',
    resultado: 'Negativo'
  },
  {
    id: 2,
    id_muestra: 'M-0002-2025',
    upp: 'VER-0020-2025',
    propietario: 'María Hernández Torres',
    especie: 'Bovino',
    tipo_muestra: 'Suero sanguíneo',
    fecha_recepcion: '2025-03-12',
    estatus: 'En proceso',
    resultado: ''
  },
  {
    id: 3,
    id_muestra: 'M-0003-2025',
    upp: 'VER-0100-2025',
    propietario: 'Carlos García Santos',
    especie: 'Caprino',
    tipo_muestra: 'Suero sanguíneo',
    fecha_recepcion: '2025-03-05',
    estatus: 'Rechazado',
    resultado: 'Muestra hemolizada'
  }
]);

// Filtros
const filtros = ref({
  id_muestra: '',
  upp: '',
  propietario: '',
  estatus: '',
  fecha_inicio: '',
  fecha_fin: ''
});

const muestrasFiltradas = computed(() => {
  const idMuestra = filtros.value.id_muestra.trim().toLowerCase();
  const upp       = filtros.value.upp.trim().toLowerCase();
  const prop      = filtros.value.propietario.trim().toLowerCase();
  const estatus   = filtros.value.estatus;
  const fInicio   = filtros.value.fecha_inicio;
  const fFin      = filtros.value.fecha_fin;

  return muestrasDemoTabla.value.filter(m => {
    const matchId = idMuestra
      ? (m.id_muestra || '').toLowerCase().includes(idMuestra)
      : true;
    const matchUpp = upp
      ? (m.upp || '').toLowerCase().includes(upp)
      : true;
    const matchProp = prop
      ? (m.propietario || '').toLowerCase().includes(prop)
      : true;
    const matchEstatus = estatus
      ? m.estatus === estatus
      : true;

    let matchFecha = true;
    if (fInicio) {
      matchFecha = matchFecha && m.fecha_recepcion >= fInicio;
    }
    if (fFin) {
      matchFecha = matchFecha && m.fecha_recepcion <= fFin;
    }

    return matchId && matchUpp && matchProp && matchEstatus && matchFecha;
  });
});

function buscarMuestras() {
  // La búsqueda es reactiva con los filtros;
  // aquí podrías loggear o llamar a backend si lo requiere el CU.
}

function limpiarFiltros() {
  filtros.value = {
    id_muestra: '',
    upp: '',
    propietario: '',
    estatus: '',
    fecha_inicio: '',
    fecha_fin: ''
  };
}

// Clase de badge según estatus
function badgeEstatusClase(estatus) {
  if (estatus === 'Concluido') {
    return 'badge--activo';
  }
  if (estatus === 'Rechazado') {
    return 'badge--inactivo';
  }
  return 'badge--proceso';
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

/* ---- Filtros SISTPEC ---- */
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

/* grupo inline para fechas */
.sistpec-form-group-inline .sistpec-form-inline-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.vigencia-sep {
  font-size: 14px;
  color: #666;
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

.sistpec-search-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

/* Barra de filtros (2 filas: datos + fechas) */
.sistpec-search-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.fechas-bar {
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

/* Estatus "En proceso" */
.badge--proceso {
  background-color: #fff4e5;
  color: #b26a00;
}

/* Responsive */
@media (max-width: 768px) {
  .sistpec-search-bar {
    grid-template-columns: 1fr;
  }

  .fechas-bar {
    grid-template-columns: 1fr;
  }
}
</style>
