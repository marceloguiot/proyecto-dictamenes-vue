<template>
  <section>
    <section class="modulo-acciones">
      <span class="modulo-acciones-titulo">Acciones disponibles</span>

      <div class="modulo-acciones-botones">
        <button
          v-for="a in acciones"
          :key="a.id"
          type="button"
          class="sistpec-btn-accion"
          :class="{ active: selectedAction === a.id }"
          @click="selectedAction = a.id"
        >
          {{ a.label }}
        </button>
      </div>

      <div class="sistpec-info-box">
        <p class="sistpec-info-text">{{ descripcionAccion }}</p>
      </div>
    </section>

    <section class="modulo-contenido">
      <!-- ASIGNAR -->
      <div v-if="selectedAction === 'asignar'">
        <h3 class="subtitulo">Asignar</h3>

        <div class="sistpec-search-bar">
          <div class="sistpec-form-group">
            <label>Folio hoja control</label>
            <input v-model="form.hoja" type="text" placeholder="Ej. HCC-2025-001" />
          </div>

          <div class="sistpec-form-group">
            <label>UPP</label>
            <input v-model="form.upp" type="text" placeholder="Clave o nombre UPP" />
          </div>

          <div class="sistpec-form-group">
            <label>MVZ</label>
            <input v-model="form.mvz" type="text" placeholder="Nombre del MVZ" />
          </div>

          <div class="sistpec-form-group sistpec-search-actions right">
            <button class="sistpec-btn-primary" type="button" @click="asignar">
              ASIGNAR
            </button>
            <button class="sistpec-btn-secondary" type="button" @click="limpiarForm">
              LIMPIAR
            </button>
          </div>
        </div>

        <div v-if="mensaje" class="modulo-alert modulo-alert--success">
          {{ mensaje }}
        </div>
      </div>

      <!-- CONSULTAR -->
      <div v-else>
        <h3 class="subtitulo">Consultar</h3>

        <div v-if="mostrarAlerta" class="modulo-alert modulo-alert--error">
          Debe capturar <strong>al menos un criterio de búsqueda</strong>.
        </div>

        <div class="sistpec-search-bar">
          <div class="sistpec-form-group">
            <label>Número de caso</label>
            <input v-model="filtros.caso" type="text" placeholder="Ej. BR25-001" />
          </div>

          <div class="sistpec-form-group">
            <label>Hoja control campo</label>
            <input v-model="filtros.hoja" type="text" placeholder="Ej. HCC-2025-001" />
          </div>

          <div class="sistpec-form-group">
            <label>UPP</label>
            <input v-model="filtros.upp" type="text" placeholder="Clave o nombre UPP" />
          </div>

          <div class="sistpec-form-group sistpec-search-actions right">
            <button class="sistpec-btn-primary" type="button" @click="buscar">BUSCAR</button>
            <button class="sistpec-btn-secondary" type="button" @click="limpiar">LIMPIAR</button>
          </div>
        </div>

        <div v-if="buscado" class="sistpec-table-wrapper">
          <table class="sistpec-table">
            <thead>
              <tr>
                <th>No. Caso</th>
                <th>Hoja control</th>
                <th>UPP</th>
                <th>MVZ</th>
                <th>Fecha asignación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in resultados" :key="r.id">
                <td>{{ r.caso }}</td>
                <td>{{ r.hoja }}</td>
                <td>{{ r.upp }}</td>
                <td>{{ r.mvz }}</td>
                <td>{{ r.fecha }}</td>
              </tr>

              <tr v-if="resultados.length === 0">
                <td colspan="5" class="sin-resultados">Sin coincidencias.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

defineProps({ codigo: String, rol: String });

const acciones = [
  { id: 'asignar', label: 'ASIGNAR' },
  { id: 'consultar', label: 'CONSULTAR' }
];

const selectedAction = ref('asignar');

const descripcionAccion = computed(() => {
  if (selectedAction.value === 'asignar') return 'Asigna un número de caso a una hoja de control de campo.';
  return 'Consulta números de caso con filtros. Capture al menos un criterio.';
});

const form = ref({ hoja: '', upp: '', mvz: '' });
const mensaje = ref('');

function asignar() {
  // demo: generar consecutivo simple
  if (!form.value.hoja.trim()) {
    mensaje.value = 'Capture la hoja de control de campo.';
    return;
  }
  mensaje.value = `Asignado (demo): BR25-${String(Math.floor(Math.random()*900)+100)}`;
}

function limpiarForm() {
  form.value = { hoja: '', upp: '', mvz: '' };
  mensaje.value = '';
}

// consultar
const filtros = ref({ caso: '', hoja: '', upp: '' });
const buscado = ref(false);
const mostrarAlerta = ref(false);

const demo = ref([
  { id: 1, caso: 'BR25-001', hoja: 'HCC-2025-001', upp: 'UPP-VER-001', mvz: 'MVZ Juan Pérez', fecha: '2025-12-15' },
  { id: 2, caso: 'BR25-002', hoja: 'HCC-2025-002', upp: 'UPP-VER-014', mvz: 'MVZ Ana López', fecha: '2025-12-16' },
]);

function hayFiltro() {
  const f = filtros.value;
  return f.caso.trim() || f.hoja.trim() || f.upp.trim();
}

const resultados = computed(() => {
  if (!buscado.value) return [];
  const f = filtros.value;
  const caso = f.caso.trim().toLowerCase();
  const hoja = f.hoja.trim().toLowerCase();
  const upp = f.upp.trim().toLowerCase();

  return demo.value.filter(x => {
    const okCaso = caso ? x.caso.toLowerCase().includes(caso) : true;
    const okHoja = hoja ? x.hoja.toLowerCase().includes(hoja) : true;
    const okUpp  = upp  ? x.upp.toLowerCase().includes(upp) : true;
    return okCaso && okHoja && okUpp;
  });
});

function buscar() {
  mostrarAlerta.value = false;
  if (!hayFiltro()) {
    buscado.value = false;
    mostrarAlerta.value = true;
    return;
  }
  buscado.value = true;
}

function limpiar() {
  filtros.value = { caso: '', hoja: '', upp: '' };
  buscado.value = false;
  mostrarAlerta.value = false;
}
</script>

<style scoped>

/* reutilizable */
.modulo-acciones { 
    margin-bottom: 18px; 
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
    background:#2f6b32; 
    color:#fff; 
}
.sistpec-btn-accion.active { 
    background:#244e26; 
}

.sistpec-info-box { 
    margin-top:10px; 
    background:#e3f6e3; 
    border:1px solid #bfe7bf; 
    border-radius:4px; 
    padding:10px 12px; 
}
.sistpec-info-text { 
    margin:0; 
    color:#1f4d1f; 
    font-size:13px; 
}

.subtitulo { 
    font-size:18px; 
    margin:10px 0 12px; 
    color:#333; 
}
.modulo-alert { 
    margin:10px 0 14px; 
    padding:10px 14px; 
    border-radius:4px; 
    font-size:13px; 
}
.modulo-alert--error { 
    background:#fbeaea; 
    border:1px solid #f5c2c2; 
    color:#7a1f1f; 
}
.modulo-alert--success { 
    background:#e1f3e1; 
    border:1px solid #c3e6c3; 
    color:#225522; 
}

.sistpec-search-bar { 
    display:grid; 
    grid-template-columns: repeat(4, minmax(0,1fr)); 
    gap:12px; margin-bottom:16px; 
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
.sistpec-form-group input { 
    padding:8px 10px; 
    border-radius:4px; 
    border:1px solid #ccc; 
    font-size:14px; 
    outline:none; 
}
.sistpec-search-actions { 
    display:flex; 
    align-items:flex-end; 
    gap:8px; 
}
.sistpec-search-actions.right { 
    justify-content:flex-end; 
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
    background:#fafafa; }
.sin-resultados { text-align:center; 
    color:#777; 
}

@media (max-width:768px){ 
    .sistpec-search-bar { 
        grid-template-columns:1fr; 
        } 
    }
</style>
