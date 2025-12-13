<template>
  <section>
    <header class="modulo-header">
      <h3 class="subtitulo">Administrar Resultados</h3>
      <p class="modulo-subtitle">
        Consultar resultados de laboratorio. Capture al menos un criterio de búsqueda.
      </p>
    </header>

    <div v-if="mostrarAlerta" class="modulo-alert modulo-alert--error">
      Debe capturar <strong>al menos un criterio de búsqueda</strong> para realizar la consulta.
    </div>

    <div class="sistpec-search-bar">
      <div class="sistpec-form-group">
        <label>Número de caso</label>
        <input v-model="filtros.caso" type="text" placeholder="Ej. BR25-001" />
      </div>

      <div class="sistpec-form-group">
        <label>Número de arete o muestra</label>
        <input v-model="filtros.areteOMuestra" type="text" placeholder="Ej. 3011520001 / MX25-0001" />
      </div>

      <div class="sistpec-form-group">
        <label>UPP</label>
        <input v-model="filtros.upp" type="text" placeholder="Clave o nombre UPP" />
      </div>

      <div class="sistpec-form-group">
        <label>MVZ que registró</label>
        <input v-model="filtros.mvz" type="text" placeholder="Nombre del MVZ" />
      </div>

      <div class="sistpec-form-group">
        <label>Propietario</label>
        <input v-model="filtros.propietario" type="text" placeholder="Nombre del propietario" />
      </div>

      <div class="sistpec-form-group">
        <label>Fecha de registro (caso)</label>
        <input v-model="filtros.fechaRegistro" type="date" />
      </div>

      <div class="sistpec-form-group">
        <label>Fecha de carga de resultados</label>
        <input v-model="filtros.fechaCarga" type="date" />
      </div>

      <div class="sistpec-form-group">
        <label>Resultado</label>
        <select v-model="filtros.resultado">
          <option value="">Todos</option>
          <option value="POSITIVO">POSITIVO</option>
          <option value="NEGATIVO">NEGATIVO</option>
        </select>
      </div>

      <div class="sistpec-form-group sistpec-search-actions">
        <button type="button" class="sistpec-btn-primary" @click="buscar">BUSCAR</button>
        <button type="button" class="sistpec-btn-secondary" @click="limpiar">LIMPIAR FILTROS</button>
      </div>
    </div>

    <div v-if="buscado" class="sistpec-table-wrapper">
      <table class="sistpec-table">
        <thead>
          <tr>
            <th>Núm. caso</th>
            <th>Arete/Muestra</th>
            <th>UPP</th>
            <th>MVZ</th>
            <th>Propietario</th>
            <th>F. registro</th>
            <th>F. carga</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in resultadosFiltrados" :key="r.id">
            <td>{{ r.caso }}</td>
            <td>{{ r.areteOMuestra }}</td>
            <td>{{ r.upp }}</td>
            <td>{{ r.mvz }}</td>
            <td>{{ r.propietario }}</td>
            <td>{{ r.fechaRegistro }}</td>
            <td>{{ r.fechaCarga }}</td>
            <td>
              <span class="badge" :class="r.resultado === 'POSITIVO' ? 'badge--inactivo' : 'badge--activo'">
                {{ r.resultado }}
              </span>
            </td>
          </tr>

          <tr v-if="resultadosFiltrados.length === 0">
            <td colspan="8" class="sin-resultados">
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

const filtros = ref({
  caso: '',
  areteOMuestra: '',
  upp: '',
  mvz: '',
  propietario: '',
  fechaRegistro: '',
  fechaCarga: '',
  resultado: ''
});

const buscado = ref(false);
const mostrarAlerta = ref(false);

const demo = ref([
  {
    id: 1,
    caso: 'BR25-001',
    areteOMuestra: '3011520001',
    upp: 'UPP-VER-001',
    mvz: 'MVZ Juan Pérez',
    propietario: 'Juan Pérez',
    fechaRegistro: '2025-12-01',
    fechaCarga: '2025-12-03',
    resultado: 'NEGATIVO'
  },
  {
    id: 2,
    caso: 'BR25-014',
    areteOMuestra: 'MX25-0007',
    upp: 'UPP-VER-014',
    mvz: 'MVZ Ana López',
    propietario: 'Ana López',
    fechaRegistro: '2025-12-02',
    fechaCarga: '2025-12-04',
    resultado: 'POSITIVO'
  }
]);

function hayAlMenosUnFiltro() {
  const f = filtros.value;
  return (
    f.caso.trim() ||
    f.areteOMuestra.trim() ||
    f.upp.trim() ||
    f.mvz.trim() ||
    f.propietario.trim() ||
    f.fechaRegistro ||
    f.fechaCarga ||
    f.resultado
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
  filtros.value = {
    caso: '',
    areteOMuestra: '',
    upp: '',
    mvz: '',
    propietario: '',
    fechaRegistro: '',
    fechaCarga: '',
    resultado: ''
  };
  buscado.value = false;
  mostrarAlerta.value = false;
}

const resultadosFiltrados = computed(() => {
  if (!buscado.value) return [];

  const f = filtros.value;
  const caso = f.caso.trim().toLowerCase();
  const am   = f.areteOMuestra.trim().toLowerCase();
  const upp  = f.upp.trim().toLowerCase();
  const mvz  = f.mvz.trim().toLowerCase();
  const prop = f.propietario.trim().toLowerCase();

  return demo.value.filter(r => {
    const okCaso = caso ? r.caso.toLowerCase().includes(caso) : true;
    const okAm   = am   ? r.areteOMuestra.toLowerCase().includes(am) : true;
    const okUpp  = upp  ? r.upp.toLowerCase().includes(upp) : true;
    const okMvz  = mvz  ? r.mvz.toLowerCase().includes(mvz) : true;
    const okProp = prop ? r.propietario.toLowerCase().includes(prop) : true;
    const okFR   = f.fechaRegistro ? r.fechaRegistro === f.fechaRegistro : true;
    const okFC   = f.fechaCarga ? r.fechaCarga === f.fechaCarga : true;
    const okRes  = f.resultado ? r.resultado === f.resultado : true;
    return okCaso && okAm && okUpp && okMvz && okProp && okFR && okFC && okRes;
  });
});
</script>

<style scoped>
.modulo-header { margin-bottom: 12px; text-align:left; }
.modulo-subtitle { margin:0; font-size:13px; color:#555; }
.subtitulo { font-size:18px; margin:10px 0 8px; color:#333; }

.modulo-alert { margin: 10px 0 14px; padding: 10px 14px; border-radius: 4px; font-size: 13px; }
.modulo-alert--error { background:#fbeaea; border:1px solid #f5c2c2; color:#7a1f1f; }

.sistpec-search-bar { display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap:12px; margin-bottom:16px; }
.sistpec-form-group { display:flex; flex-direction:column; gap:4px; }
.sistpec-form-group label { font-size:13px; font-weight:600; color:#444; }
.sistpec-form-group input, .sistpec-form-group select { padding:8px 10px; border-radius:4px; border:1px solid #ccc; font-size:14px; outline:none; }

.sistpec-search-actions { display:flex; align-items:flex-end; gap:8px; }
.sistpec-btn-primary { background:#2f6b32; color:#fff; border:none; padding:8px 18px; border-radius:4px; font-size:13px; font-weight:600; cursor:pointer; }
.sistpec-btn-primary:hover { background:#244e26; }
.sistpec-btn-secondary { background:#e0e0e0; color:#333; border:none; padding:8px 18px; border-radius:4px; font-size:13px; font-weight:600; cursor:pointer; }
.sistpec-btn-secondary:hover { background:#d0d0d0; }

.sistpec-table-wrapper { width:100%; overflow-x:auto; }
.sistpec-table { width:100%; border-collapse:collapse; font-size:13px; }
.sistpec-table thead { background:#7a061e; color:#fff; }
.sistpec-table th, .sistpec-table td { padding:8px 10px; border:1px solid #ddd; text-align:left; }
.sistpec-table tbody tr:nth-child(even) { background:#fafafa; }
.sin-resultados { text-align:center; color:#777; }

.badge { display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; }
.badge--activo { background:#e1f3e1; color:#225522; }
.badge--inactivo { background:#fbeaea; color:#7a1f1f; }

@media (max-width:768px){
  .sistpec-search-bar { grid-template-columns: 1fr; }
}
</style>
