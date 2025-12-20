<template>
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
    <div v-if="errores.length" class="modulo-alert modulo-alert--error">
      <ul><li v-for="(e,i) in errores" :key="i">{{ e }}</li></ul>
    </div>

    <div v-if="mensajeExito" class="modulo-alert modulo-alert--success">
      {{ mensajeExito }}
    </div>

    <!-- ASIGNAR -->
    <div v-if="selectedAction === 'asignar'">
      <h3 class="subtitulo">Asignar</h3>

      <form class="sistpec-form" @submit.prevent="asignarCaso">
        <!-- PIVOTE: FOLIO HOJA DE CONTROL -->
        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Folio / Número de hoja de control de campo</label>
            <input
              v-model="nuevoCaso.folio"
              type="text"
              required
              placeholder="Ej. HC-2025-000123"
              @keyup.enter.prevent="buscarHoja"
            />
          </div>

          <div class="sistpec-form-group sistpec-form-group--actions">
            <label>&nbsp;</label>
            <button type="button" class="sistpec-btn-secondary" @click="buscarHoja">
              BUSCAR FOLIO
            </button>
          </div>
        </div>

        <div v-if="hojaEncontrada" class="sistpec-form-readonly">
          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Clave UPP</label>
              <input :value="datosHoja.upp" type="text" readonly />
            </div>

            <div class="sistpec-form-group">
              <label>MVZ (quien capturó)</label>
              <input :value="datosHoja.mvz" type="text" readonly />
            </div>
          </div>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Propietario</label>
              <input :value="datosHoja.propietario" type="text" readonly />
            </div>

            <div class="sistpec-form-group">
              <label>Fecha de captura</label>
              <input :value="datosHoja.fecha" type="date" readonly />
            </div>
          </div>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Número de caso (se asignará)</label>
              <input :value="siguienteCaso" type="text" readonly />
              <small class="hint">Se genera en automático para el ejemplo (demo). Si lo necesitas manual, lo cambiamos.</small>
            </div>

            <div class="sistpec-form-group">
              <label>Estatus</label>
              <input :value="datosHoja.estatus" type="text" readonly />
            </div>
          </div>

          <div class="sistpec-form-actions">
            <button class="sistpec-btn-primary" type="submit">
              ASIGNAR NÚMERO DE CASO
            </button>
            <button class="sistpec-btn-secondary" type="button" @click="limpiarFormulario">
              LIMPIAR
            </button>
          </div>
        </div>

        <div v-else class="modulo-alert modulo-alert--info">
          Capture el folio y presione <strong>BUSCAR FOLIO</strong> para cargar la hoja registrada por el MVZ.
        </div>
      </form>
    </div>

    <!-- CONSULTAR -->
    <div v-else-if="selectedAction === 'consultar'">
      <header class="modulo-header">
        <h3 class="subtitulo">Consultar</h3>
        <p class="modulo-subtitle">Capture al menos un criterio de búsqueda.</p>
      </header>

      <div v-if="mostrarAlerta" class="modulo-alert modulo-alert--error">
        Debe capturar <strong>al menos un criterio de búsqueda</strong> para realizar la consulta.
      </div>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Folio (hoja de control)</label>
          <input v-model="filtros.folio" type="text" placeholder="Ej. HC-2025-000123" />
        </div>

        <div class="sistpec-form-group">
          <label>Número de caso</label>
          <input v-model="filtros.caso" type="text" placeholder="Ej. BR25-001" />
        </div>

        <div class="sistpec-form-group">
          <label>UPP</label>
          <input v-model="filtros.upp" type="text" placeholder="Clave UPP" />
        </div>

        <div class="sistpec-form-group">
          <label>MVZ</label>
          <input v-model="filtros.mvz" type="text" placeholder="Nombre MVZ" />
        </div>

        <div class="sistpec-form-group">
          <label>Fecha</label>
          <input v-model="filtros.fecha" type="date" />
        </div>

        <div class="sistpec-form-group">
          <label>Estatus</label>
          <select v-model="filtros.estatus">
            <option value="">-- Todos --</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Concluido">Concluido</option>
          </select>
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscar">BUSCAR</button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarFiltros">LIMPIAR FILTROS</button>
        </div>
      </div>

      <div v-if="buscado" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Número de caso</th>
              <th>Fecha</th>
              <th>UPP</th>
              <th>Propietario</th>
              <th>MVZ</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in casosFiltrados" :key="c.id">
              <td>{{ c.folio }}</td>
              <td>{{ c.caso || '—' }}</td>
              <td>{{ c.fecha }}</td>
              <td>{{ c.upp }}</td>
              <td>{{ c.propietario }}</td>
              <td>{{ c.mvz }}</td>
              <td>
                <span class="badge" :class="c.estatus==='Pendiente' ? 'badge--proceso' : 'badge--activo'">
                  {{ c.estatus }}
                </span>
              </td>
            </tr>

            <tr v-if="casosFiltrados.length === 0">
              <td colspan="7" class="sin-resultados">No se encontraron coincidencias.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else>
      <h3 class="subtitulo">Acción no disponible</h3>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue';

defineProps({ codigo: String, rol: String });

const moduloContenidoRef = ref(null);
function scrollAlContenido() {
  nextTick(() => {
    if (!moduloContenidoRef.value) return;
    const offset = 90;
    const top = moduloContenidoRef.value.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

const acciones = [
  { id: 'asignar', label: 'ASIGNAR' },
  { id: 'consultar', label: 'CONSULTAR' },
];

const selectedAction = ref('asignar');
const errores = ref([]);
const mensajeExito = ref('');
const buscado = ref(false);
const mostrarAlerta = ref(false);

const descripcionAccionActual = computed(() => {
  if (selectedAction.value === 'asignar') {
    return 'Asigna un número de caso a una hoja de control (folio) registrada previamente por el MVZ.';
  }
  if (selectedAction.value === 'consultar') {
    return 'Consulta números de caso por folio, caso, UPP, MVZ, fecha o estatus.';
  }
  return '';
});

function cambiarAccion(id) {
  selectedAction.value = id;
  errores.value = [];
  mensajeExito.value = '';
  buscado.value = false;
  mostrarAlerta.value = false;
  limpiarFormulario();
  scrollAlContenido();
}

/**
 * DEMO: estas "hojas de control" simulan registros previos del MVZ.
 * Cuando se asigna, el caso se guarda en el mismo registro del folio.
 */
const hojasDemo = ref([
  {
    id: 1,
    folio: 'HC-2025-000123',
    caso: null,
    fecha: '2025-12-01',
    upp: 'VER-0001-2025',
    propietario: 'José López Ramírez',
    mvz: 'MVZ Ana López',
    estatus: 'Pendiente',
  },
  {
    id: 2,
    folio: 'HC-2025-000124',
    caso: 'BR25-002',
    fecha: '2025-12-03',
    upp: 'VER-0020-2025',
    propietario: 'María Hernández Torres',
    mvz: 'MVZ Juan Pérez',
    estatus: 'Concluido',
  },
]);

const nuevoCaso = ref({ folio: '' });
const hojaEncontrada = ref(false);
const datosHoja = ref({ folio: '', upp: '', mvz: '', propietario: '', fecha: '', estatus: '' });
const hojaIdSeleccionada = ref(null);

function normalizar(txt) {
  return (txt || '').trim().toLowerCase();
}

function buscarHoja() {
  errores.value = [];
  mensajeExito.value = '';
  hojaEncontrada.value = false;
  hojaIdSeleccionada.value = null;
  datosHoja.value = { folio: '', upp: '', mvz: '', propietario: '', fecha: '', estatus: '' };

  const folio = normalizar(nuevoCaso.value.folio);
  if (!folio) {
    errores.value.push('Debe capturar el folio (número de hoja de control de campo).');
    scrollAlContenido();
    return;
  }

  const hoja = hojasDemo.value.find(h => normalizar(h.folio) === folio);
  if (!hoja) {
    errores.value.push('No se encontró el folio capturado. Verifique que la hoja exista (registrada por el MVZ).');
    scrollAlContenido();
    return;
  }

  hojaEncontrada.value = true;
  hojaIdSeleccionada.value = hoja.id;
  datosHoja.value = {
    folio: hoja.folio,
    upp: hoja.upp,
    mvz: hoja.mvz,
    propietario: hoja.propietario,
    fecha: hoja.fecha,
    estatus: hoja.estatus,
  };

  scrollAlContenido();
}

/** Genera el siguiente caso demo (BR25-XXX) sin repetir */
const siguienteCaso = computed(() => {
  // toma los casos existentes y calcula el siguiente consecutivo
  const existentes = hojasDemo.value
    .map(h => h.caso)
    .filter(Boolean);

  // obtiene el max num de BR25-XXX
  let max = 0;
  for (const c of existentes) {
    const m = String(c).match(/BR25-(\d{3,})/i);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n)) max = Math.max(max, n);
    }
  }
  const nextNum = String(max + 1).padStart(3, '0');
  return `BR25-${nextNum}`;
});

function asignarCaso() {
  errores.value = [];
  mensajeExito.value = '';

  if (!hojaEncontrada.value || !hojaIdSeleccionada.value) {
    errores.value.push('Primero debe buscar y cargar la hoja de control (folio).');
    scrollAlContenido();
    return;
  }

  const hoja = hojasDemo.value.find(h => h.id === hojaIdSeleccionada.value);
  if (!hoja) {
    errores.value.push('No se encontró la hoja seleccionada. Intente buscar el folio nuevamente.');
    scrollAlContenido();
    return;
  }

  // Validación: si ya tiene caso asignado
  if (hoja.caso) {
    errores.value.push(`Este folio ya tiene un número de caso asignado: ${hoja.caso}`);
    scrollAlContenido();
    return;
  }

  const casoNuevo = siguienteCaso.value;

  // Validación: no duplicar caso
  const duplicado = hojasDemo.value.some(h => normalizar(h.caso) === normalizar(casoNuevo));
  if (duplicado) {
    errores.value.push('El número de caso generado ya existe. (Demo) Ajuste la lógica del consecutivo.');
    scrollAlContenido();
    return;
  }

  const ok = window.confirm(`¿Desea asignar el número de caso ${casoNuevo} al folio ${hoja.folio}?`);
  if (!ok) return;

  hoja.caso = casoNuevo;
  hoja.estatus = 'Pendiente';

  mensajeExito.value = `Número de caso asignado correctamente: ${casoNuevo} (Folio: ${hoja.folio})`;

  // Mantener folio, pero limpiar vista y forzar recarga si se requiere
  hojaEncontrada.value = false;
  hojaIdSeleccionada.value = null;
  datosHoja.value = { folio: '', upp: '', mvz: '', propietario: '', fecha: '', estatus: '' };

  scrollAlContenido();
}

function limpiarFormulario() {
  nuevoCaso.value = { folio: '' };
  hojaEncontrada.value = false;
  hojaIdSeleccionada.value = null;
  datosHoja.value = { folio: '', upp: '', mvz: '', propietario: '', fecha: '', estatus: '' };
  errores.value = [];
  mensajeExito.value = '';
}

const filtros = ref({ folio: '', caso: '', upp: '', mvz: '', fecha: '', estatus: '' });

function hayAlMenosUnFiltro() {
  const f = filtros.value;
  return !!(
    f.folio.trim() ||
    f.caso.trim() ||
    f.upp.trim() ||
    f.mvz.trim() ||
    f.fecha ||
    f.estatus
  );
}

function buscar() {
  mostrarAlerta.value = false;
  if (!hayAlMenosUnFiltro()) {
    buscado.value = false;
    mostrarAlerta.value = true;
    return;
  }
  buscado.value = true;
  scrollAlContenido();
}

function limpiarFiltros() {
  filtros.value = { folio: '', caso: '', upp: '', mvz: '', fecha: '', estatus: '' };
  buscado.value = false;
  mostrarAlerta.value = false;
}

const casosFiltrados = computed(() => {
  if (!buscado.value) return [];

  const f = filtros.value;
  const folio = f.folio.trim().toLowerCase();
  const caso = f.caso.trim().toLowerCase();
  const upp = f.upp.trim().toLowerCase();
  const mvz = f.mvz.trim().toLowerCase();
  const fecha = f.fecha;
  const estatus = f.estatus;

  return hojasDemo.value.filter(c => {
    const okFolio = folio ? (c.folio || '').toLowerCase().includes(folio) : true;
    const okCaso = caso ? ((c.caso || '').toLowerCase().includes(caso)) : true;
    const okUpp = upp ? (c.upp || '').toLowerCase().includes(upp) : true;
    const okMvz = mvz ? (c.mvz || '').toLowerCase().includes(mvz) : true;
    const okFec = fecha ? c.fecha === fecha : true;
    const okEst = estatus ? c.estatus === estatus : true;
    return okFolio && okCaso && okUpp && okMvz && okFec && okEst;
  });
});
</script>

<style scoped>
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
  background: #2f6b32;
  color: #fff;
  letter-spacing: 0.5px;
}
.sistpec-btn-accion.active {
  background: #244e26;
}

.sistpec-info-box {
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: 4px;
  background: #e1f3e1;
  border: 1px solid #c3e6c3;
}
.sistpec-info-text {
  margin: 0;
  font-size: 13px;
  color: #225522;
}

.modulo-contenido {
  margin-top: 10px;
}
.modulo-header {
  margin-bottom: 12px;
  text-align: left;
}
.modulo-subtitle {
  margin: 0;
  font-size: 13px;
  color: #555;
}
.subtitulo {
  font-size: 18px;
  margin: 10px 0 15px;
  color: #333;
}

.modulo-alert {
  margin-bottom: 12px;
  padding: 10px 14px;
  border-radius: 4px;
  font-size: 13px;
}
.modulo-alert--error {
  background: #fbeaea;
  border: 1px solid #f5c2c2;
  color: #7a1f1f;
}
.modulo-alert--success {
  background: #e1f3e1;
  border: 1px solid #c3e6c3;
  color: #225522;
}
.modulo-alert--info {
  background: #eef4ff;
  border: 1px solid #c9dcff;
  color: #1f3f7a;
}

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
.sistpec-form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sistpec-form-group--actions button {
  height: 36px;
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
.sistpec-form-group input[readonly] {
  background: #f6f6f6;
  color: #444;
}
.hint {
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}
.sistpec-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.sistpec-btn-primary {
  background: #2f6b32;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.sistpec-btn-primary:hover {
  background: #244e26;
}
.sistpec-btn-secondary {
  background: #e0e0e0;
  color: #333;
  border: none;
  padding: 8px 18px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.sistpec-btn-secondary:hover {
  background: #d0d0d0;
}

.sistpec-search-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.sistpec-search-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 8px;
}

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
  background: #7a061e;
  color: #fff;
}
.sistpec-table th,
.sistpec-table td {
  padding: 8px 10px;
  border: 1px solid #ddd;
  text-align: left;
}
.sistpec-table tbody tr:nth-child(even) {
  background: #fafafa;
}
.sin-resultados {
  text-align: center;
  color: #777;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}
.badge--activo {
  background: #e1f3e1;
  color: #225522;
}
.badge--proceso {
  background: #fff4e5;
  color: #b26a00;
}

@media (max-width: 768px) {
  .sistpec-form-row {
    grid-template-columns: 1fr;
  }
  .sistpec-search-bar {
    grid-template-columns: 1fr;
  }
  .sistpec-search-actions {
    grid-column: auto;
    justify-content: stretch;
  }
}
</style>
