<template>
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

    <h3 class="subtitulo">Consultar resultados de laboratorio</h3>

    <div class="sistpec-info-box">
      <p class="sistpec-info-text">
        Para realizar la consulta de resultados, es obligatorio capturar
        <strong>al menos un criterio de búsqueda</strong>.
      </p>
    </div>

    <!-- BARRA DE FILTROS -->
    <div class="sistpec-search-bar">
      <div class="sistpec-form-group">
        <label>Número de caso</label>
        <input
          v-model="filtros.numero_caso"
          type="text"
          placeholder="Ej. BR25-001"
        />
      </div>

      <div class="sistpec-form-group">
        <label>Número de arete o muestra</label>
        <input
          v-model="filtros.identificador_arete_muestra"
          type="text"
          placeholder="Ej. 3011520001 o MX25-0001"
        />
      </div>

      <div class="sistpec-form-group">
        <label>UPP</label>
        <input
          v-model="filtros.upp"
          type="text"
          placeholder="Nombre o clave UPP"
        />
      </div>

      <div class="sistpec-form-group">
        <label>MVZ que registró</label>
        <input
          v-model="filtros.mvz"
          type="text"
          placeholder="Nombre del MVZ"
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

      <!-- RANGO FECHA REGISTRO -->
      <div class="sistpec-form-group sistpec-form-group-inline rango-fecha">
        <label>Fecha de registro (caso)</label>
        <div class="sistpec-form-inline-inputs">
          <input
            v-model="filtros.fecha_registro_desde"
            type="date"
          />
          <span class="vigencia-sep">a</span>
          <input
            v-model="filtros.fecha_registro_hasta"
            type="date"
          />
        </div>
      </div>

      <!-- RANGO FECHA RESULTADO -->
      <div class="sistpec-form-group sistpec-form-group-inline rango-fecha">
        <label>Fecha de carga de resultados</label>
        <div class="sistpec-form-inline-inputs">
          <input
            v-model="filtros.fecha_resultado_desde"
            type="date"
          />
          <span class="vigencia-sep">a</span>
          <input
            v-model="filtros.fecha_resultado_hasta"
            type="date"
          />
        </div>
      </div>

      <div class="sistpec-form-group">
        <label>Resultado</label>
        <select v-model="filtros.resultado">
          <option value="">Todos</option>
          <option value="POSITIVO">Positivos</option>
          <option value="NEGATIVO">Negativos</option>
        </select>
      </div>

      <!-- BOTONES: OCUPAN TODA LA FILA Y SE ALINEAN A LA IZQUIERDA -->
      <div class="sistpec-form-group sistpec-search-actions sistpec-search-actions-full">
        <button
          type="button"
          class="sistpec-btn-primary"
          @click="buscarResultados"
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

    <!-- TABLA DE RESULTADOS -->
    <div class="sistpec-table-wrapper" v-if="seBusco">
      <table class="sistpec-table">
        <thead>
          <tr>
            <th>Número de caso</th>
            <th>Arete / Muestra</th>
            <th>UPP</th>
            <th>Propietario</th>
            <th>MVZ</th>
            <th>Fecha registro</th>
            <th>Fecha resultado</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in resultadosFiltrados" :key="r.id">
            <td>{{ r.numero_caso }}</td>
            <td>
              <div class="col-compact">
                <span v-if="r.numero_arete"><strong>Arete:</strong> {{ r.numero_arete }}</span>
                <span v-if="r.numero_muestra"><strong>Muestra:</strong> {{ r.numero_muestra }}</span>
              </div>
            </td>
            <td>{{ r.upp }}</td>
            <td>{{ r.propietario }}</td>
            <td>{{ r.mvz }}</td>
            <td>{{ r.fecha_registro }}</td>
            <td>{{ r.fecha_resultado }}</td>
            <td>
              <span
                class="badge"
                :class="r.resultado === 'POSITIVO' ? 'badge--positivo' : 'badge--negativo'"
              >
                {{ r.resultado }}
              </span>
            </td>
          </tr>
          <tr v-if="resultadosFiltrados.length === 0">
            <td colspan="8" class="sin-resultados">
              No se encontraron resultados con los criterios de búsqueda.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="sin-resultados sin-busqueda">
      Capture al menos un filtro y presione <strong>BUSCAR</strong> para mostrar los resultados.
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

// Filtros
const filtros = ref({
  numero_caso: '',
  identificador_arete_muestra: '',
  upp: '',
  mvz: '',
  propietario: '',
  fecha_registro_desde: '',
  fecha_registro_hasta: '',
  fecha_resultado_desde: '',
  fecha_resultado_hasta: '',
  resultado: '' // POSITIVO | NEGATIVO | ''
});

// Datos demo
const resultadosDemoTabla = ref([
  {
    id: 1,
    numero_caso: 'BR25-001',
    numero_arete: '3011520001',
    numero_muestra: 'MX25-0001',
    upp: 'UPP-VER-001',
    propietario: 'Ganadera San Gabriel',
    mvz: 'MVZ Juan Pérez',
    fecha_registro: '2025-03-01',
    fecha_resultado: '2025-03-05',
    resultado: 'POSITIVO'
  },
  {
    id: 2,
    numero_caso: 'BR25-002',
    numero_arete: '3011520002',
    numero_muestra: 'MX25-0002',
    upp: 'UPP-VER-002',
    propietario: 'Rancho La Gloria',
    mvz: 'MVZ María García',
    fecha_registro: '2025-03-02',
    fecha_resultado: '2025-03-06',
    resultado: 'NEGATIVO'
  },
  {
    id: 3,
    numero_caso: 'BR25-003',
    numero_arete: '3011520003',
    numero_muestra: 'MX25-0003',
    upp: 'UPP-VER-003',
    propietario: 'Productores Unidos',
    mvz: 'MVZ Carlos Hernández',
    fecha_registro: '2025-03-05',
    fecha_resultado: '2025-03-08',
    resultado: 'POSITIVO'
  }
]);

const resultadosFiltrados = computed(() => {
  const f = filtros.value;

  return resultadosDemoTabla.value.filter((r) => {
    // Número de caso
    if (
      f.numero_caso &&
      !r.numero_caso.toLowerCase().includes(f.numero_caso.toLowerCase())
    ) {
      return false;
    }

    // Arete / muestra
    if (f.identificador_arete_muestra) {
      const idTexto = `${r.numero_arete || ''} ${r.numero_muestra || ''}`.toLowerCase();
      if (!idTexto.includes(f.identificador_arete_muestra.toLowerCase())) {
        return false;
      }
    }

    // UPP
    if (f.upp && !r.upp.toLowerCase().includes(f.upp.toLowerCase())) {
      return false;
    }

    // MVZ
    if (f.mvz && !r.mvz.toLowerCase().includes(f.mvz.toLowerCase())) {
      return false;
    }

    // Propietario
    if (
      f.propietario &&
      !r.propietario.toLowerCase().includes(f.propietario.toLowerCase())
    ) {
      return false;
    }

    // Rango fecha de registro
    if (f.fecha_registro_desde && r.fecha_registro < f.fecha_registro_desde) {
      return false;
    }
    if (f.fecha_registro_hasta && r.fecha_registro > f.fecha_registro_hasta) {
      return false;
    }

    // Rango fecha de resultado
    if (
      f.fecha_resultado_desde &&
      r.fecha_resultado < f.fecha_resultado_desde
    ) {
      return false;
    }
    if (
      f.fecha_resultado_hasta &&
      r.fecha_resultado > f.fecha_resultado_hasta
    ) {
      return false;
    }

    // Resultado POSITIVO / NEGATIVO
    if (f.resultado && r.resultado !== f.resultado) {
      return false;
    }

    return true;
  });
});

function buscarResultados() {
  errores.value = [];
  mensajeExito.value = '';
  seBusco.value = false;

  // Validar que exista al menos un filtro
  const hayAlgunFiltro = Object.values(filtros.value).some((v) =>
    String(v).trim() !== ''
  );

  if (!hayAlgunFiltro) {
    errores.value.push(
      'Debe capturar al menos un criterio de búsqueda para consultar resultados.'
    );
    return;
  }

  seBusco.value = true;

  if (resultadosFiltrados.value.length) {
    mensajeExito.value = `Se encontraron ${resultadosFiltrados.value.length} resultado(s) que coinciden con la búsqueda.`;
  } else {
    mensajeExito.value = '';
  }
}

function limpiarFiltros() {
  filtros.value = {
    numero_caso: '',
    identificador_arete_muestra: '',
    upp: '',
    mvz: '',
    propietario: '',
    fecha_registro_desde: '',
    fecha_registro_hasta: '',
    fecha_resultado_desde: '',
    fecha_resultado_hasta: '',
    resultado: ''
  };
  errores.value = [];
  mensajeExito.value = '';
  seBusco.value = false;
}
</script>

<style scoped>
.modulo-contenido {
  margin-top: 10px;
}

/* Subtítulo */
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

/* grupo inline para rangos de fecha */
.sistpec-form-group-inline .sistpec-form-inline-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* cada input de fecha ocupa el mismo espacio y no se monta */
.sistpec-form-inline-inputs input {
  flex: 1;
  min-width: 0;
}

.rango-fecha {
  grid-column: span 2; /* les damos más ancho */
}

.vigencia-sep {
  font-size: 14px;
  color: #666;
}

/* Botones de búsqueda */
.sistpec-search-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

/* Que los botones ocupen toda la fila y queden a la izquierda */
.sistpec-search-actions-full {
  grid-column: 1 / -1;
  justify-content: flex-start;
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

.col-compact {
  display: flex;
  flex-direction: column;
  gap: 2px;
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

.badge--positivo {
  background-color: #e1f3e1;
  color: #225522;
}

.badge--negativo {
  background-color: #fbeaea;
  color: #7a1f1f;
}

/* Responsive */
@media (max-width: 768px) {
  .sistpec-search-bar {
    grid-template-columns: 1fr;
  }

  .rango-fecha {
    grid-column: span 1;
  }

  .sistpec-search-actions-full {
    grid-column: span 1;
  }
}
</style>
