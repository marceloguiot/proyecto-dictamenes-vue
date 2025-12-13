<template>
  <section class="coord-modulo">
    <header class="modulo-header">
      <h3 class="subtitulo">Administrar Actividad de campo</h3>
      <p class="modulo-subtitle">
        Consulta actividades registradas. Capture al menos un criterio de búsqueda.
      </p>
    </header>

    <!-- ALERTA (cuando intenta buscar sin filtros) -->
    <div v-if="mostrarAlerta" class="modulo-alert modulo-alert--error">
      Debe capturar <strong>al menos un criterio de búsqueda</strong> para realizar la consulta.
    </div>

    <!-- Filtros -->
    <div class="sistpec-search-bar">
      <div class="sistpec-form-group">
        <label>MVZ</label>
        <input v-model="filtros.mvz" type="text" placeholder="Nombre del MVZ" />
      </div>

      <div class="sistpec-form-group">
        <label>UPP</label>
        <input v-model="filtros.upp" type="text" placeholder="Clave o nombre UPP" />
      </div>

      <div class="sistpec-form-group">
        <label>Municipio</label>
        <input v-model="filtros.municipio" type="text" placeholder="Ej. Xalapa" />
      </div>

      <div class="sistpec-form-group">
        <label>Fecha de actividad</label>
        <input v-model="filtros.fecha" type="date" />
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

    <!-- Resultados -->
    <div v-if="buscado" class="sistpec-table-wrapper">
      <table class="sistpec-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>MVZ</th>
            <th>UPP</th>
            <th>Municipio</th>
            <th>Actividad</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in resultadosFiltrados" :key="r.id">
            <td>{{ r.fecha }}</td>
            <td>{{ r.mvz }}</td>
            <td>{{ r.upp }}</td>
            <td>{{ r.municipio }}</td>
            <td>{{ r.actividad }}</td>
          </tr>

          <tr v-if="resultadosFiltrados.length === 0">
            <td colspan="5" class="sin-resultados">
              No se encontraron resultados con los criterios capturados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

// filtros
const filtros = ref({
  mvz: '',
  upp: '',
  municipio: '',
  fecha: ''
});

const buscado = ref(false);
const mostrarAlerta = ref(false);

// datos demo (luego se reemplaza por backend)
const demo = ref([
  { id: 1, fecha: '2025-12-01', mvz: 'MVZ Juan Pérez', upp: 'UPP-VER-001', municipio: 'Xalapa', actividad: 'Visita a campo / toma de muestra' },
  { id: 2, fecha: '2025-12-03', mvz: 'MVZ Ana López', upp: 'UPP-VER-014', municipio: 'Coatepec', actividad: 'Seguimiento epidemiológico' },
  { id: 3, fecha: '2025-12-05', mvz: 'MVZ Juan Pérez', upp: 'UPP-VER-001', municipio: 'Xalapa', actividad: 'Entrega de muestras' }
]);

function hayAlMenosUnFiltro() {
  const f = filtros.value;
  return (
    f.mvz.trim() ||
    f.upp.trim() ||
    f.municipio.trim() ||
    f.fecha
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
  filtros.value = { mvz: '', upp: '', municipio: '', fecha: '' };
  buscado.value = false;
  mostrarAlerta.value = false;
}

const resultadosFiltrados = computed(() => {
  if (!buscado.value) return [];

  const mvz = filtros.value.mvz.trim().toLowerCase();
  const upp = filtros.value.upp.trim().toLowerCase();
  const mun = filtros.value.municipio.trim().toLowerCase();
  const fec = filtros.value.fecha;

  return demo.value.filter(r => {
    const okMvz = mvz ? r.mvz.toLowerCase().includes(mvz) : true;
    const okUpp = upp ? r.upp.toLowerCase().includes(upp) : true;
    const okMun = mun ? r.municipio.toLowerCase().includes(mun) : true;
    const okFec = fec ? r.fecha === fec : true;
    return okMvz && okUpp && okMun && okFec;
  });
});
</script>

<style scoped>
.subtitulo {
  font-size: 18px;
  margin: 10px 0 8px;
  color: #333;
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

/* ALERTAS */
.modulo-alert {
  margin: 10px 0 14px;
  padding: 10px 14px;
  border-radius: 4px;
  font-size: 13px;
}
.modulo-alert--error {
  background-color: #fbeaea;
  border: 1px solid #f5c2c2;
  color: #7a1f1f;
}

/* Barra filtros (igual estilo admin) */
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

.sistpec-form-group input {
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
  outline: none;
}

.sistpec-search-actions {
  display: flex;
  align-items: flex-end;
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

/* Responsive */
@media (max-width: 768px) {
  .sistpec-search-bar {
    grid-template-columns: 1fr;
  }
}
</style>
