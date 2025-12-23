<template>
  <section>
    <header class="modulo-header">
      <p class="modulo-subtitle">
      
      </p>
    </header>

    <!-- Acciones -->
    <section class="modulo-acciones">
      <span class="modulo-acciones-titulo">Acciones disponibles</span>

      <div class="modulo-acciones-botones">
        <button
          v-for="accion in acciones"
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
        <p class="sistpec-info-text">{{ descripcionAccionActual }}</p>
      </div>
    </section>

    <!-- Alerta: buscar sin filtros -->
    <div v-if="mostrarAlerta" class="modulo-alert modulo-alert--error">
      Debe capturar <strong>al menos un criterio de búsqueda</strong> para realizar la consulta.
    </div>

    <!-- CONSULTAR -->
    <div v-if="selectedAction === 'consultar'">
      <h4 class="subtitulo-secundario">Consultar</h4>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Clave UPP</label>
          <input v-model="filtros.claveUpp" type="text" placeholder="Ej. UPP-VER-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Propietario</label>
          <input v-model="filtros.propietario" type="text" placeholder="Nombre del propietario" />
        </div>

        <div class="sistpec-form-group">
          <label>Municipio</label>
          <input v-model="filtros.municipio" type="text" placeholder="Ej. Xalapa" />
        </div>

        <div class="sistpec-form-group">
          <label>Estatus</label>
          <select v-model="filtros.estatus">
            <option value="">Todos</option>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscar">
            BUSCAR
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiar">
            LIMPIAR FILTROS
          </button>
        </div>
      </div>

      <div v-if="buscado" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Clave UPP</th>
              <th>Propietario</th>
              <th>Municipio</th>
              <th>Localidad</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in resultadosFiltrados" :key="u.id">
              <td>{{ u.claveUpp }}</td>
              <td>{{ u.propietario }}</td>
              <td>{{ u.municipio }}</td>
              <td>{{ u.localidad }}</td>
              <td>
                <span class="badge" :class="u.activo ? 'badge--activo' : 'badge--inactivo'">
                  {{ u.activo ? 'ACTIVO' : 'INACTIVO' }}
                </span>
              </td>
            </tr>

            <tr v-if="resultadosFiltrados.length === 0">
              <td colspan="5" class="sin-resultados">
                No se encontraron UPP con los criterios capturados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ELIMINAR (baja lógica) -->
    <div v-else-if="selectedAction === 'eliminar'">
      <h4 class="subtitulo-secundario">Eliminar</h4>


      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>Clave UPP</label>
          <input v-model="filtros.claveUpp" type="text" placeholder="Ej. UPP-VER-001" />
        </div>

        <div class="sistpec-form-group">
          <label>Propietario</label>
          <input v-model="filtros.propietario" type="text" placeholder="Nombre del propietario" />
        </div>

        <div class="sistpec-form-group">
          <label>Municipio</label>
          <input v-model="filtros.municipio" type="text" placeholder="Ej. Xalapa" />
        </div>

        <div class="sistpec-form-group">
          <label>Estatus</label>
          <select v-model="filtros.estatus">
            <option value="">Todos</option>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscar">
            BUSCAR
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiar">
            LIMPIAR FILTROS
          </button>
        </div>
      </div>

      <div v-if="buscado" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>Clave UPP</th>
              <th>Propietario</th>
              <th>Municipio</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in resultadosFiltrados" :key="u.id">
              <td>{{ u.claveUpp }}</td>
              <td>{{ u.propietario }}</td>
              <td>{{ u.municipio }}</td>
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
                  @click="desactivar(u)"
                >
                  ELIMINAR
                </button>

                <button
                  type="button"
                  class="sistpec-btn-secondary sistpec-btn-sm"
                  :disabled="u.activo"
                  @click="reactivar(u)"
                  style="margin-left: 6px;"
                >
                  REACTIVAR
                </button>
              </td>
            </tr>

            <tr v-if="resultadosFiltrados.length === 0">
              <td colspan="5" class="sin-resultados">
                No se encontraron UPP con los criterios capturados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const acciones = [
  { id: 'consultar', label: 'CONSULTAR' },
  { id: 'eliminar', label: 'ELIMINAR' }
];

const selectedAction = ref('consultar');

const filtros = ref({
  claveUpp: '',
  propietario: '',
  municipio: '',
  estatus: ''
});

const buscado = ref(false);
const mostrarAlerta = ref(false);

const demo = ref([
  { id: 1, claveUpp: 'UPP-VER-001', propietario: 'Juan Pérez', municipio: 'Xalapa', localidad: 'Centro', activo: true },
  { id: 2, claveUpp: 'UPP-VER-014', propietario: 'Ana López', municipio: 'Coatepec', localidad: 'La Orduña', activo: true },
  { id: 3, claveUpp: 'UPP-VER-099', propietario: 'Carlos Hernández', municipio: 'Perote', localidad: 'El Conejo', activo: false }
]);

const descripcionAccionActual = computed(() => {
  return selectedAction.value === 'consultar'
    ? 'Consulta UPP con filtros por clave, propietario, municipio y estatus.'
    : 'Elimina UPP como baja lógica (marca INACTIVA) y permite reactivar.';
});

function hayAlMenosUnFiltro() {
  const f = filtros.value;
  return (
    f.claveUpp.trim() ||
    f.propietario.trim() ||
    f.municipio.trim() ||
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
}

function limpiar() {
  filtros.value = { claveUpp: '', propietario: '', municipio: '', estatus: '' };
  buscado.value = false;
  mostrarAlerta.value = false;
}

const resultadosFiltrados = computed(() => {
  if (!buscado.value) return [];

  const f = filtros.value;
  const clave = f.claveUpp.trim().toLowerCase();
  const prop  = f.propietario.trim().toLowerCase();
  const mun   = f.municipio.trim().toLowerCase();
  const est   = f.estatus;

  return demo.value.filter(u => {
    const okClave = clave ? u.claveUpp.toLowerCase().includes(clave) : true;
    const okProp  = prop  ? u.propietario.toLowerCase().includes(prop) : true;
    const okMun   = mun   ? u.municipio.toLowerCase().includes(mun) : true;
    const okEst   = est   ? (est === 'ACTIVO' ? u.activo : !u.activo) : true;
    return okClave && okProp && okMun && okEst;
  });
});

function desactivar(u) {
  const ok = window.confirm(`¿Desea eliminar (desactivar) la UPP "${u.claveUpp}"?`);
  if (!ok) return;
  const idx = demo.value.findIndex(x => x.id === u.id);
  if (idx !== -1) demo.value[idx] = { ...demo.value[idx], activo: false };
}

function reactivar(u) {
  const ok = window.confirm(`¿Desea reactivar la UPP "${u.claveUpp}"?`);
  if (!ok) return;
  const idx = demo.value.findIndex(x => x.id === u.id);
  if (idx !== -1) demo.value[idx] = { ...demo.value[idx], activo: true };
}

// reset al cambiar acción
watch(selectedAction, () => {
  buscado.value = false;
  mostrarAlerta.value = false;
});
</script>

<style scoped>
/* reutiliza la misma línea visual del admin */
.modulo-header { 
  margin-bottom: 12px; 
  text-align: left; 
}

.modulo-subtitle { margin: 0; 
  font-size: 13px; 
  color: #555; 
}

.subtitulo { font-size: 18px; 
  margin: 10px 0 8px; 
  color: #333; 
}

.subtitulo-secundario { 
  font-size: 16px; 
  margin: 16px 0 10px; 
  color: #333; 
}

/* acciones */
.modulo-acciones { 
  margin-bottom: 12px; 
}

.modulo-acciones-titulo { 
  display:block; 
  font-size:14px; 
  margin-bottom:8px; 
  color:#333; 
  font-weight:600; 
}

.modulo-acciones-botones { 
  display:flex; 
  flex-wrap:wrap; 
  gap:4px; 
}

.sistpec-btn-accion {
  border:none; 
  padding:8px 16px; 
  font-size:12px; 
  font-weight:600; 
  text-transform:uppercase;
  border-radius:3px; 
  cursor:pointer; 
  background-color:#2f6b32; 
  color:#fff; 
  letter-spacing:.5px;
}
.sistpec-btn-accion.active { 
  background-color:#244e26; 
}


/* info */
.sistpec-info-box { 
  margin-top: 10px; 
  padding:10px 14px; 
  border-radius:4px; 
  background:#e1f3e1; 
  border:1px solid #c3e6c3; 
}

.sistpec-info-text { 
  margin:0; 
  font-size:13px; 
  color:#225522; 
}

/* alert */
.modulo-alert { 
  margin: 10px 0 14px; 
  padding: 10px 14px; 
  border-radius: 4px; 
  font-size: 13px; 

}
.modulo-alert--error { 
  background:#fbeaea; 
  border:1px solid #f5c2c2; 
  color:#7a1f1f; 
}

/* filtros */
.sistpec-search-bar { 
  display:grid; 
  grid-template-columns: repeat(4, minmax(0, 1fr)); 
  gap:12px; 
  margin-bottom: 16px; 
}

.sistpec-form-group { 
  display:flex; 
  flex-direction:column; 
  gap:4px; 
}

.sistpec-form-group label { 
  font-size:13px; 
  font-weight:600; 
  color:#444; 
}

.sistpec-form-group input, 
.sistpec-form-group select { 
  padding:8px 10px; 
  border-radius:4px; 
  border:1px solid #ccc; 
  font-size:14px; 
  outline:none; 
}

.sistpec-search-actions {
  grid-column: 1 / -1;          
  display: flex;
  justify-content: flex-end;    
  align-items: flex-end;
  gap: 8px;
}

.sistpec-btn-primary { 
  background:#2f6b32; 
  color:#fff; 
  border:none; 
  padding:8px 18px; 
  border-radius:4px; 
  font-size:13px; 
  font-weight:600; 
  cursor:pointer; 
}

.sistpec-btn-primary:hover { 
  background:#244e26; 
}

.sistpec-btn-secondary { 
  background:#e0e0e0; 
  color:#333; 
  border:none; 
  padding:8px 18px; 
  border-radius:4px; 
  font-size:13px; 
  font-weight:600; 
  cursor:pointer; 
}

.sistpec-btn-secondary:hover { 
  background:#d0d0d0; 
}

.sistpec-btn-danger { 
  background:#7a061e; 
  color:#fff; 
  border:none; 
  padding:6px 14px; 
  border-radius:4px; 
  font-size:12px; 
  font-weight:600; 
  cursor:pointer; 
}

.sistpec-btn-danger:hover { 
  background:#5a0416; 
}

.sistpec-btn-sm { 
  padding:4px 10px; 
  font-size:11px; 
}

.sistpec-btn-danger[disabled] { 
  opacity:.5; 
  cursor:default; 
}

/* tabla */
.sistpec-table-wrapper { 
  width:100%; 
  overflow-x:auto; 
}

.sistpec-table { 
  width:100%; 
  border-collapse:collapse; 
  font-size:13px; 
}

.sistpec-table thead { 
  background:#7a061e; 
  color:#fff; 
}

.sistpec-table th, 
.sistpec-table td { 
  padding:8px 10px; 
  border:1px solid #ddd; 
  text-align:left; 
}

.sistpec-table tbody tr:nth-child(even) { 
  background:#fafafa; 
}

.sin-resultados { 
  text-align:center; 
  color:#777; 
}

.badge { 
  display:inline-block; 
  padding:2px 8px; 
  border-radius:10px; 
  font-size:11px; 
  font-weight:600; 
}

.badge--activo { 
  background:#e1f3e1; 
  color:#225522; 
}

.badge--inactivo { 
  background:#fbeaea; 
  color:#7a1f1f; 
}

@media (max-width:768px){
  .sistpec-search-bar { 
    grid-template-columns: 1fr; 
  }
}
</style>
