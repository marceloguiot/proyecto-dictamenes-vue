<template>
  <!-- Barra de acciones -->
  <section class="modulo-acciones">
    <span class="modulo-acciones-titulo">Acciones disponibles</span>

    <div class="modulo-acciones-botones">
      <button
        v-for="accion in accionesActividad"
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
        <li v-for="(err, idx) in errores" :key="idx">{{ err }}</li>
      </ul>
    </div>

    <div v-if="mensajeExito" class="modulo-alert modulo-alert--success">
      {{ mensajeExito }}
    </div>

    <!-- ================= CONSULTAR VISITAS ================= -->
    <div v-if="selectedAction === 'consultar'">
      <h3 class="subtitulo">Consultar visitas</h3>

      <!-- Filtros principales -->
      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Clave UPP</label>
          <input v-model="filtros.upp" type="text" placeholder="Ej. VER-0001-2025" />
        </div>

        <div class="sistpec-form-group">
          <label>MVZ asignado</label>
          <input v-model="filtros.mvz" type="text" placeholder="Ej. mvzver01 o nombre" />
        </div>

        <div class="sistpec-form-group">
          <label>Estatus</label>
          <select v-model="filtros.estatus">
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Realizada">Realizada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        <div class="sistpec-form-group">
          <label>Prioridad</label>
          <select v-model="filtros.prioridad">
            <option value="">Todas</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      <!-- Filtros por fechas + acciones -->
      <div class="sistpec-search-bar fechas-bar">
        <div class="sistpec-form-group sistpec-form-group-inline">
          <label>Periodo programado</label>
          <div class="sistpec-form-inline-inputs">
            <input v-model="filtros.fecha_inicio" type="date" />
            <span class="vigencia-sep">a</span>
            <input v-model="filtros.fecha_fin" type="date" />
          </div>
        </div>

        <div class="sistpec-form-group sistpec-form-group-inline">
          <label>Fecha de visita (real)</label>
          <div class="sistpec-form-inline-inputs">
            <input v-model="filtros.visita_inicio" type="date" />
            <span class="vigencia-sep">a</span>
            <input v-model="filtros.visita_fin" type="date" />
          </div>
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscarVisitas">
            BUSCAR
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarFiltros">
            LIMPIAR FILTROS
          </button>
        </div>
      </div>

      <!-- Tabla -->
      <div class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>UPP</th>
              <th>MVZ</th>
              <th>Periodo</th>
              <th>Prioridad</th>
              <th>Estatus</th>
              <th>Fecha visita</th>
              <th>Hoja campo</th>
              <th>Latitud</th>
              <th>Longitud</th>
              <th>Comentarios</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="v in visitasFiltradas" :key="v.id">
              <td>{{ v.upp }}</td>
              <td>{{ v.mvz }}</td>
              <td>{{ v.fecha_inicio }} a {{ v.fecha_fin }}</td>
              <td>
                <span class="badge" :class="badgePrioridadClase(v.prioridad)">
                  {{ v.prioridad }}
                </span>
              </td>
              <td>
                <span class="badge" :class="badgeEstatusClase(v.estatus)">
                  {{ v.estatus }}
                </span>
              </td>
              <td>{{ v.fecha_visita || '-' }}</td>
              <td>{{ v.hoja_control || '-' }}</td>
              <td>{{ v.latitud ?? '-' }}</td>
              <td>{{ v.longitud ?? '-' }}</td>
              <td class="col-comentarios">{{ v.comentarios || '-' }}</td>

              <td>
                <button
                  type="button"
                  class="sistpec-btn-danger sistpec-btn-sm"
                  :disabled="v.estatus !== 'Pendiente'"
                  @click="cancelarVisita(v)"
                  title="Cancelar visita"
                >
                  CANCELAR
                </button>
              </td>
            </tr>

            <tr v-if="visitasFiltradas.length === 0">
              <td colspan="11" class="sin-resultados">
                No se encontraron visitas con los criterios de búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= PROGRAMAR VISITAS ================= -->
    <div v-else-if="selectedAction === 'programar'">
      <h3 class="subtitulo">Programar visitas</h3>

      <form class="sistpec-form" @submit.prevent="guardarProgramacion">
        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Clave UPP</label>
            <input
              v-model="programacion.upp"
              type="text"
              placeholder="Ej. VER-0001-2025"
              required
            />
          </div>

          <div class="sistpec-form-group">
            <label>MVZ a asignar</label>
            <input
              v-model="programacion.mvz"
              type="text"
              placeholder="Ej. mvzver01"
              required
            />
          </div>

          <div class="sistpec-form-group">
            <label>Prioridad</label>
            <select v-model="programacion.prioridad" required>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group sistpec-form-group-inline">
            <label>Periodo programado</label>
            <div class="sistpec-form-inline-inputs">
              <input v-model="programacion.fecha_inicio" type="date" required />
              <span class="vigencia-sep">a</span>
              <input v-model="programacion.fecha_fin" type="date" required />
            </div>
          </div>

          <div class="sistpec-form-group">
            <label>Observaciones / comentarios (opcional)</label>
            <input
              v-model="programacion.comentarios"
              type="text"
              placeholder="Ej. Seguimiento, visita por sospecha, etc."
            />
          </div>
        </div>

        <div class="sistpec-form-actions">
          <button type="submit" class="sistpec-btn-primary">
            GUARDAR PROGRAMACIÓN
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarProgramacion">
            LIMPIAR
          </button>
        </div>
      </form>

      <div class="sistpec-divider"></div>

      <h4 class="subtitulo-secundario">Programaciones recientes</h4>

      <div class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>UPP</th>
              <th>MVZ</th>
              <th>Periodo</th>
              <th>Prioridad</th>
              <th>Estatus</th>
              <th>Comentarios</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in programacionesRecientes" :key="v.id">
              <td>{{ v.upp }}</td>
              <td>{{ v.mvz }}</td>
              <td>{{ v.fecha_inicio }} a {{ v.fecha_fin }}</td>
              <td>
                <span class="badge" :class="badgePrioridadClase(v.prioridad)">
                  {{ v.prioridad }}
                </span>
              </td>
              <td>
                <span class="badge" :class="badgeEstatusClase(v.estatus)">
                  {{ v.estatus }}
                </span>
              </td>
              <td class="col-comentarios">{{ v.comentarios || '-' }}</td>
            </tr>

            <tr v-if="programacionesRecientes.length === 0">
              <td colspan="6" class="sin-resultados">
                Aún no hay programaciones registradas.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="sistpec-info-box" style="margin-top: 12px;">
        <p class="sistpec-info-text">
          Nota: Estas programaciones quedarán como <strong>Pendiente</strong> y pasarán a
          <strong>Realizada</strong> cuando el MVZ capture la visita y su hoja de control campo asignada.
        </p>
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
import { computed, ref, watch, nextTick } from 'vue';

defineProps({
  codigo: { type: String, required: true },
  rol: { type: String, required: true }
});

// Scroll
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
const accionesActividad = [
  { id: 'consultar', label: 'CONSULTAR VISITAS' },
  { id: 'programar', label: 'PROGRAMAR VISITAS' }
];

const selectedAction = ref('consultar');

const errores = ref([]);
const mensajeExito = ref('');

function cambiarAccion(accionId) {
  selectedAction.value = accionId;
  scrollAlContenido();
}

const descripcionAccionActual = computed(() => {
  if (selectedAction.value === 'consultar') {
    return 'Consulta visitas programadas y realizadas; muestra georreferencia (lat/long) cuando el MVZ la registre.';
  }
  if (selectedAction.value === 'programar') {
    return 'Asigna visitas de UPP a MVZ en un periodo determinado para dar seguimiento a actividades en campo.';
  }
  return '';
});

watch(
  () => selectedAction.value,
  () => {
    errores.value = [];
    mensajeExito.value = '';
  }
);

// ===== Datos demo =====
const visitasDemoTabla = ref([
  {
    id: 1,
    upp: 'VER-0001-2025',
    mvz: 'mvzver01',
    prioridad: 'Alta',
    estatus: 'Pendiente',
    fecha_inicio: '2025-12-01',
    fecha_fin: '2025-12-10',
    fecha_visita: '',
    hoja_control: '',
    latitud: null,
    longitud: null,
    comentarios: 'Visita prioritaria por seguimiento.'
  },
  {
    id: 2,
    upp: 'VER-0020-2025',
    mvz: 'mvzver02',
    prioridad: 'Media',
    estatus: 'Realizada',
    fecha_inicio: '2025-11-15',
    fecha_fin: '2025-11-20',
    fecha_visita: '2025-11-18',
    hoja_control: 'HC-00045-2025',
    latitud: 19.54321,
    longitud: -96.91012,
    comentarios: 'Captura completa en hoja de control.'
  }
]);

// ===== CONSULTA =====
const filtros = ref({
  upp: '',
  mvz: '',
  estatus: '',
  prioridad: '',
  fecha_inicio: '',
  fecha_fin: '',
  visita_inicio: '',
  visita_fin: ''
});

function tieneAlMenosUnFiltro() {
  const f = filtros.value;
  return Boolean(
    f.upp.trim() ||
      f.mvz.trim() ||
      f.estatus ||
      f.prioridad ||
      f.fecha_inicio ||
      f.fecha_fin ||
      f.visita_inicio ||
      f.visita_fin
  );
}

function buscarVisitas() {
  errores.value = [];
  mensajeExito.value = '';

  if (!tieneAlMenosUnFiltro()) {
    errores.value.push('Debe capturar al menos un campo de filtro para realizar la consulta.');
    return;
  }

  scrollAlContenido();
}

function limpiarFiltros() {
  filtros.value = {
    upp: '',
    mvz: '',
    estatus: '',
    prioridad: '',
    fecha_inicio: '',
    fecha_fin: '',
    visita_inicio: '',
    visita_fin: ''
  };
  errores.value = [];
  mensajeExito.value = '';
}

const visitasFiltradas = computed(() => {
  const f = filtros.value;
  const upp = f.upp.trim().toLowerCase();
  const mvz = f.mvz.trim().toLowerCase();

  return visitasDemoTabla.value.filter(v => {
    const matchUpp = upp ? (v.upp || '').toLowerCase().includes(upp) : true;
    const matchMvz = mvz ? (v.mvz || '').toLowerCase().includes(mvz) : true;
    const matchEstatus = f.estatus ? v.estatus === f.estatus : true;
    const matchPrioridad = f.prioridad ? v.prioridad === f.prioridad : true;

    // Periodo programado
    let matchPeriodo = true;
    if (f.fecha_inicio) matchPeriodo = matchPeriodo && v.fecha_inicio >= f.fecha_inicio;
    if (f.fecha_fin) matchPeriodo = matchPeriodo && v.fecha_fin <= f.fecha_fin;

    // Fecha de visita real
    let matchVisita = true;
    if (f.visita_inicio) matchVisita = matchVisita && (v.fecha_visita || '') >= f.visita_inicio;
    if (f.visita_fin) matchVisita = matchVisita && (v.fecha_visita || '') <= f.visita_fin;

    return matchUpp && matchMvz && matchEstatus && matchPrioridad && matchPeriodo && matchVisita;
  });
});

function cancelarVisita(v) {
  errores.value = [];
  mensajeExito.value = '';

  if (v.estatus !== 'Pendiente') {
    errores.value.push('Solo se pueden cancelar visitas en estatus Pendiente.');
    return;
  }

  const ok = window.confirm(`¿Desea cancelar la visita programada para la UPP "${v.upp}"?`);
  if (!ok) return;

  const idx = visitasDemoTabla.value.findIndex(x => x.id === v.id);
  if (idx === -1) return;

  visitasDemoTabla.value[idx] = {
    ...visitasDemoTabla.value[idx],
    estatus: 'Cancelada'
  };

  mensajeExito.value = 'La visita fue cancelada correctamente.';
  scrollAlContenido();
}

// ===== PROGRAMAR =====
const programacion = ref({
  upp: '',
  mvz: '',
  prioridad: 'Media',
  fecha_inicio: '',
  fecha_fin: '',
  comentarios: ''
});

function validarProgramacion() {
  errores.value = [];

  const p = programacion.value;

  if (!p.upp.trim()) errores.value.push('La Clave UPP es obligatoria.');
  if (!p.mvz.trim()) errores.value.push('El MVZ a asignar es obligatorio.');
  if (!p.fecha_inicio) errores.value.push('La fecha de inicio es obligatoria.');
  if (!p.fecha_fin) errores.value.push('La fecha de fin es obligatoria.');

  if (p.fecha_inicio && p.fecha_fin && p.fecha_fin < p.fecha_inicio) {
    errores.value.push('La fecha de fin no puede ser menor que la fecha de inicio.');
  }

  // Evitar duplicado exacto
  const dup = visitasDemoTabla.value.some(v =>
    v.upp === p.upp.trim() &&
    v.mvz === p.mvz.trim() &&
    v.fecha_inicio === p.fecha_inicio &&
    v.fecha_fin === p.fecha_fin &&
    v.estatus !== 'Cancelada'
  );

  if (dup) {
    errores.value.push('Ya existe una programación igual (UPP, MVZ y periodo).');
  }

  return errores.value.length === 0;
}

function guardarProgramacion() {
  mensajeExito.value = '';

  const okValid = validarProgramacion();
  if (!okValid) return;

  const ok = window.confirm('¿Desea guardar la programación de visita?');
  if (!ok) return;

  const p = programacion.value;

  const newId = visitasDemoTabla.value.length
    ? Math.max(...visitasDemoTabla.value.map(x => x.id)) + 1
    : 1;

  visitasDemoTabla.value.unshift({
    id: newId,
    upp: p.upp.trim(),
    mvz: p.mvz.trim(),
    prioridad: p.prioridad,
    estatus: 'Pendiente',
    fecha_inicio: p.fecha_inicio,
    fecha_fin: p.fecha_fin,
    fecha_visita: '',
    hoja_control: '',
    latitud: null,
    longitud: null,
    comentarios: (p.comentarios || '').trim()
  });

  mensajeExito.value = 'La visita fue programada correctamente.';
  limpiarProgramacion(false);
  scrollAlContenido();
}

function limpiarProgramacion(confirmar = true) {
  if (confirmar) {
    const ok = window.confirm('¿Desea limpiar el formulario de programación?');
    if (!ok) return;
  }

  programacion.value = {
    upp: '',
    mvz: '',
    prioridad: 'Media',
    fecha_inicio: '',
    fecha_fin: '',
    comentarios: ''
  };
}

// Listado “recientes” (las últimas 10, sin cancelar primero)
const programacionesRecientes = computed(() => {
  return visitasDemoTabla.value
    .slice()
    .sort((a, b) => (b.id - a.id))
    .slice(0, 10);
});

// Badges
function badgeEstatusClase(estatus) {
  if (estatus === 'Realizada') return 'badge--activo';
  if (estatus === 'Cancelada') return 'badge--inactivo';
  return 'badge--proceso'; // Pendiente
}

function badgePrioridadClase(p) {
  if (p === 'Alta') return 'badge--alta';
  if (p === 'Media') return 'badge--media';
  return 'badge--baja';
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
  border: none; padding: 8px 16px; 
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
  margin: 10px 0 10px; 
  color: #333; 
}

/* Info box */
.sistpec-info-box {
  margin-top: 10px; 
  padding: 10px 14px; border-radius: 4px;
  background-color: #e1f3e1; 
  border: 1px solid #c3e6c3;
}

.sistpec-info-text { 
  margin: 0; font-size: 13px; 
  color: #225522; 
}

/* Alertas */
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

/* Form */
.sistpec-form { 
  display: flex; 
  flex-direction: column; 
  gap: 16px; 
}

.sistpec-form-row { 
  display: grid; 
  grid-template-columns: repeat(3, minmax(0, 1fr)); 
  gap: 16px; 
}

.sistpec-form-actions { 
  display: flex; 
  justify-content: flex-end; 
  gap: 8px; 
}

/* Inputs */
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

/* Inline fechas */
.sistpec-form-group-inline 
.sistpec-form-inline-inputs {
  display: flex; 
  align-items: center; 
  gap: 6px;
}
.vigencia-sep { font-size: 14px; 
  color: #666; 
}

/* Botones */
.sistpec-btn-primary {
  background-color: #2f6b32; 
  color: #ffffff; 
  border: none; padding: 8px 18px;
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
  opacity: 0.5; cursor: default;
 }
.sistpec-btn-sm { 
  padding: 4px 10px; font-size: 11px; 
}

/* Barras filtros */
.sistpec-search-bar {
  display: grid; 
  grid-template-columns: repeat(4, minmax(0, 1fr)); 
  gap: 12px; 
  margin-bottom: 16px;
}

.fechas-bar { 
  grid-template-columns: repeat(3, minmax(0, 1fr)); 
}

.sistpec-search-actions { 
  display: flex; align-items: flex-end; 
  gap: 8px; 
}

/* Tabla */
.sistpec-table-wrapper { 
  width: 100%; overflow-x: auto; 
}

.sistpec-table { 
  width: 100%; border-collapse: collapse; 
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
  vertical-align: top;
}
.sistpec-table tbody tr:nth-child(even) { 
  background-color: #fafafa; 
}
.sin-resultados { 
  text-align: center; 
  color: #777; 
}
.col-comentarios { 
  min-width: 220px; 
  white-space: normal; 
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

/* Realizada */
.badge--inactivo {
   background-color: #fbeaea; 
   color: #7a1f1f; 
  }    
  
  /* Cancelada */
.badge--proceso { 
  background-color: #fff4e5; 
  color: #b26a00; 
}     

/* Pendiente */

.badge--alta { 
  background-color: #fbeaea; 
  color: #7a061e; 
}

.badge--media { 
  background-color: #fff4e5; 
  color: #b26a00; 
}

.badge--baja { 
  background-color: #e1f3e1; 
  color: #225522; 
}

.sistpec-divider { 
  margin: 18px 0; 
  border-top: 1px dashed #ccc; 
}

/* Responsive */
@media (max-width: 768px) {
  .sistpec-search-bar { grid-template-columns: 1fr; }
  .fechas-bar { grid-template-columns: 1fr; }
  .sistpec-form-row { grid-template-columns: 1fr; }
}
</style>
