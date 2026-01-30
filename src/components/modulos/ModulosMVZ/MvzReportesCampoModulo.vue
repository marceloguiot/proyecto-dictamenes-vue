<!-- MvzReportesCampoModulo -->
<template>
  <!-- Barra de acciones -->
  <section class="modulo-acciones">
    <span class="modulo-acciones-titulo">Acciones disponibles</span>

    <div class="modulo-acciones-botones">
      <button
        v-for="accion in acciones"
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
      <p class="sistpec-info-text">{{ descripcionAccionActual }}</p>
    </div>
  </section>

  <section class="modulo-contenido">
    <h2 class="subtitulo">Administrar hoja de reporte</h2>
    <p class="subtitulo-secundario">Seleccione la acción que desea realizar en el módulo.</p>

    <!-- Mensajes (estilo del sistema) -->
    <div v-if="errores.length" class="modulo-alert modulo-alert--error">
      <ul>
        <li v-for="(e, idx) in errores" :key="idx">{{ e }}</li>
      </ul>
    </div>
    <div v-if="mensajeExito" class="modulo-alert modulo-alert--success">{{ mensajeExito }}</div>

    <!-- CAPTURAR -->
    <div v-if="selectedAction === 'capturar'" class="accion-area">
      <h3 class="subtitulo-secundario">Captura Hoja de Control</h3>

      <div class="sistpec-card">
        <div class="sistpec-card-header">
          <h4>Encabezado</h4>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Tipo de prueba TB</label>
            <div class="radios">
              <label><input type="radio" value="PLIEGUE_CAUDAL" v-model="formHoja.tb_tipo_prueba" /> Pliegue caudal</label>
              <label><input type="radio" value="CERVICAL_SIMPLE" v-model="formHoja.tb_tipo_prueba" /> Cervical simple</label>
            </div>
          </div>

          <div class="sistpec-form-group">
            <label>Folio TB (opcional)</label>
            <input v-model="formHoja.folio_tb" type="text" placeholder="Ej. 12345" />
          </div>

          <div class="sistpec-form-group">
            <label>CC No. (Folio hoja campo)</label>
            <input v-model="formHoja.cc_no" type="text" placeholder="Ej. 5409818" />
          </div>

          <div class="sistpec-form-group">
            <label>Estatus</label>
            <input :value="'EDITABLE'" type="text" disabled />
          </div>
        </div>
      </div>

      <!-- I) Propietario -->
      <div class="sistpec-card">
        <div class="sistpec-card-header">
          <h4>I) Datos del propietario</h4>
        </div>

        <div class="sistpec-form-row sistpec-form-row-3">
          <div class="sistpec-form-group">
            <label>CURP</label>
            <input
              v-model="formHoja.prop.curp"
              type="text"
              placeholder="Ej. RUMM690828HVZZNG03"
              @blur="autocompletarPropietario"
            />
            <small class="hint">
              Si existe en BD, se autocompletará al salir del campo.
              <span v-if="propLoading"> (Consultando...)</span>
            </small>
          </div>

          <div class="sistpec-form-group">
            <label>Teléfono</label>
            <input v-model="formHoja.prop.telefono" type="text" placeholder="Ej. 228..." />
          </div>

          <div class="sistpec-form-group">
            <label>Correo electrónico</label>
            <input v-model="formHoja.prop.correo" type="email" placeholder="correo@ejemplo.com" />
          </div>
        </div>

        <div class="sistpec-form-row sistpec-form-row-3">
          <div class="sistpec-form-group">
            <label>Apellido paterno</label>
            <input v-model="formHoja.prop.apellido_paterno" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>Apellido materno</label>
            <input v-model="formHoja.prop.apellido_materno" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>Nombre(s)</label>
            <input v-model="formHoja.prop.nombres" type="text" />
          </div>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Calle</label>
            <input v-model="formHoja.prop.domicilio" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>Municipio</label>
            <input v-model="formHoja.prop.municipio" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>Localidad</label>
            <input v-model="formHoja.prop.localidad" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>C.P.</label>
            <input v-model="formHoja.prop.cp" type="text" />
          </div>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Estado</label>
            <input v-model="formHoja.prop.estado" type="text" />
          </div>
        </div>
      </div>

      <!-- II) UPP -->
      <div class="sistpec-card">
        <div class="sistpec-card-header">
          <h4>II) Datos de la UPP</h4>
        </div>

        <div class="sistpec-form-row sistpec-form-row-3">
          <div class="sistpec-form-group">
            <label>Clave UPP</label>
            <input
              v-model="formHoja.upp.clave"
              type="text"
              placeholder="Ej. 30-025-1055-001"
              @blur="autocompletarUpp"
            />
            <small class="hint">
              Si existe en BD, se autocompletará al salir del campo.
              <span v-if="uppLoading"> (Consultando...)</span>
            </small>
          </div>

          <div class="sistpec-form-group">
            <label>Nombre del predio</label>
            <input v-model="formHoja.upp.nombre_predio" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>Calle</label>
            <input v-model="formHoja.upp.domicilio" type="text" />
          </div>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Municipio</label>
            <input v-model="formHoja.upp.municipio" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>Localidad</label>
            <input v-model="formHoja.upp.localidad" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>C.P.</label>
            <input v-model="formHoja.upp.cp" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>Estado</label>
            <input v-model="formHoja.upp.estado" type="text" />
          </div>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Latitud</label>
            <input v-model="formHoja.upp.latitud" type="text" />
          </div>

          <div class="sistpec-form-group">
            <label>Longitud</label>
            <input v-model="formHoja.upp.longitud" type="text" />
          </div>
        </div>
      </div>

      <!-- III) Resumen -->
      <div class="sistpec-card">
        <div class="sistpec-card-header">
          <h4>III) Resumen</h4>
        </div>

        <div class="sistpec-form-row sistpec-form-row-3">
          <div class="sistpec-form-group">
            <label>Motivo de prueba</label>
            <select v-model="formHoja.prueba.motivo">
              <option value="">Seleccione</option>
              <option v-for="op in opcionesMotivoPrueba" :key="op" :value="op">{{ op }}</option>
            </select>
          </div>

          <div class="sistpec-form-group">
            <label>Fin zootécnico</label>
            <select v-model="formHoja.prueba.fin_zootecnico">
              <option value="">Seleccione</option>
              <option value="Leche">Leche</option>
              <option value="Carne">Carne</option>
              <option value="Mixto">Mixto</option>
            </select>
          </div>

          <div class="sistpec-form-group">
            <label>Tipo de identificación</label>
            <select v-model="formHoja.prueba.tipo_identificacion">
              <option value="">Seleccione</option>
              <option value="Arete">Arete</option>
              <option value="Tatuaje">Tatuaje</option>
              <option value="Otro">Otro</option>
            </select>

            <div v-if="formHoja.prueba.tipo_identificacion === 'Otro'" class="otro-wrap">
              <label>Especifique</label>
              <input
                v-model="formHoja.prueba.tipo_identificacion_otro"
                type="text"
                placeholder="Escriba el tipo de identificación..."
              />
            </div>
          </div>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Negativos (TB)</label>
            <input v-model.number="formHoja.resumen.negativos.tb" type="number" min="0" />
          </div>
          <div class="sistpec-form-group">
            <label>Negativos (BR)</label>
            <input v-model.number="formHoja.resumen.negativos.br" type="number" min="0" />
          </div>
          <div class="sistpec-form-group">
            <label>Reactores (TB)</label>
            <input v-model.number="formHoja.resumen.reactores.tb" type="number" min="0" />
          </div>
          <div class="sistpec-form-group">
            <label>Reactores (BR)</label>
            <input v-model.number="formHoja.resumen.reactores.br" type="number" min="0" />
          </div>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>Total probados (TB)</label>
            <input v-model.number="formHoja.resumen.total_probados.tb" type="number" min="0" />
          </div>
          <div class="sistpec-form-group">
            <label>Total probados (BR)</label>
            <input v-model.number="formHoja.resumen.total_probados.br" type="number" min="0" />
          </div>
          <div class="sistpec-form-group">
            <label>Total del hato (TB)</label>
            <input v-model.number="formHoja.resumen.total_hato.tb" type="number" min="0" />
          </div>
          <div class="sistpec-form-group">
            <label>Total del hato (BR)</label>
            <input v-model.number="formHoja.resumen.total_hato.br" type="number" min="0" />
          </div>
        </div>

        <!-- Tuberculosis (opcional) -->
        <div class="sistpec-subcard">
          <h5>Tuberculosis (opcional)</h5>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Fecha de inyección</label>
              <input v-model="formHoja.tb.fecha_inyeccion" type="date" />
            </div>
            <div class="sistpec-form-group">
              <label>Hora de inyección</label>
              <input v-model="formHoja.tb.hora_inyeccion" type="time" />
            </div>
            <div class="sistpec-form-group">
              <label>Fecha de lectura</label>
              <input v-model="formHoja.tb.fecha_lectura" type="date" />
            </div>
            <div class="sistpec-form-group">
              <label>Hora de lectura</label>
              <input v-model="formHoja.tb.hora_lectura" type="time" />
            </div>
          </div>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Dosis</label>
              <select v-model="formHoja.tb.dosis">
                <option value="">Seleccione</option>
                <option value="10">10</option>
                <option value="50">50</option>
              </select>
            </div>
            <div class="sistpec-form-group">
              <label>No. de lote</label>
              <input v-model="formHoja.tb.lote" type="text" />
            </div>
            <div class="sistpec-form-group">
              <label>Fecha de caducidad</label>
              <input v-model="formHoja.tb.caducidad" type="date" />
            </div>
          </div>

          <div class="sistpec-form-row">
            <div class="sistpec-form-group">
              <label>Fecha seguimiento vacuna (opcional)</label>
              <input v-model="formHoja.tb.fecha_seguimiento" type="date" />
            </div>
            <div class="sistpec-form-group">
              <label>Resultado vacuna (opcional)</label>
              <input v-model="formHoja.tb.resultado_vacuna" type="text" />
            </div>
          </div>
        </div>
      </div>

      <!-- IV) Animales -->
      <div class="sistpec-card">
        <div class="sistpec-card-header">
          <h4>IV) Animales</h4>
        </div>

        <div class="sistpec-table-wrapper">
          <table class="sistpec-table">
            <thead>
              <tr>
                <th style="width:70px;">I</th>
                <th>No. arete / identificación</th>
                <th>Especie</th>
                <th>Raza</th>
                <th style="width:140px;">Edad (meses)</th>
                <th style="width:90px;">Sexo</th>
                <th style="width:160px;">Fierro</th>
                <th style="width:140px;">Acción</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(a, idx) in formHoja.animales" :key="idx">
                <td>{{ a.inc_tipo }}</td>
                <td>{{ a.arete }}</td>
                <td>{{ a.especie }}</td>
                <td>{{ a.raza }}</td>
                <td>{{ edadActualMeses(a) }}</td>
                <td>{{ a.sexo }}</td>
                <td>{{ a.fierro }}</td>
                <td>
                  <button type="button" class="sistpec-btn-secondary sistpec-btn-sm" @click="eliminarAnimal(idx)">
                    Eliminar
                  </button>
                </td>
              </tr>

              <tr>
                <td>
                  <select v-model="animalTmp.inc_tipo">
                    <option value="">—</option>
                    <option value="RA">RA</option>
                    <option value="IN">IN</option>
                    <option value="IC">IC</option>
                  </select>
                  <small class="hint">Opcional</small>
                </td>

                <td>
                  <input v-model="animalTmp.arete" type="text" placeholder="Ej. 750123..." />
                </td>

                <td>
                  <select v-model="animalTmp.especie" @change="onChangeEspecieTmp">
                    <option value="">Seleccione</option>
                    <option value="OVINO">Ovino</option>
                    <option value="CAPRINO">Caprino</option>
                    <option value="BOVINO">Bovino</option>
                  </select>
                </td>

                <td>
                  <select v-model="animalTmp.raza" :disabled="!animalTmp.especie">
                    <option value="">Seleccione</option>
                    <option v-for="r in razasDisponiblesTmp" :key="r" :value="r">{{ r }}</option>
                  </select>
                </td>

                <td>
                  <input v-model.number="animalTmp.edad_meses_registro" type="number" min="0" placeholder="0" />
                  <small class="hint">Entero (meses)</small>
                </td>

                <td>
                  <select v-model="animalTmp.sexo">
                    <option value="">—</option>
                    <option value="H">H</option>
                    <option value="M">M</option>
                  </select>
                </td>

                <td>
                  <input v-model="animalTmp.fierro" type="text" placeholder="(opcional)" />
                </td>

                <td>
                  <button type="button" class="sistpec-btn-primary sistpec-btn-sm" @click="agregarAnimal">
                    Agregar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="hint" style="margin-top:10px;">
          La columna <b>I</b> es opcional (RA: rearetado, IN: incremento natural, IC: incremento por compra). Fierro es opcional.
        </p>
      </div>

      <div class="sistpec-form-actions">
        <button type="button" class="sistpec-btn-primary" @click="guardarHoja" :disabled="saving">
          {{ saving ? 'Guardando...' : 'Guardar' }}
        </button>
        <button type="button" class="sistpec-btn-secondary" @click="limpiarFormHoja" :disabled="saving">Limpiar</button>
      </div>
    </div>

    <!-- CONSULTAR -->
    <div v-if="selectedAction === 'consultar'" class="accion-area">
      <h3 class="subtitulo-secundario">Consultar hojas</h3>

      <div class="sistpec-card">
        <div class="sistpec-card-header">
          <h4>Filtros</h4>
        </div>

        <div class="sistpec-form-row">
          <div class="sistpec-form-group">
            <label>CC No.</label>
            <input v-model="filtros.cc_no" type="text" placeholder="Ej. 5409818" />
          </div>
          <div class="sistpec-form-group">
            <label>CURP propietario</label>
            <input v-model="filtros.curp" type="text" placeholder="Ej. RUMM..." />
          </div>
          <div class="sistpec-form-group">
            <label>UPP</label>
            <input v-model="filtros.upp" type="text" placeholder="Ej. 30-025-1055-001" />
          </div>
          <div class="sistpec-form-group">
            <label>Estatus</label>
            <select v-model="filtros.estatus">
              <option value="TODOS">Todos</option>
              <option value="EDITABLE">Editable</option>
              <option value="CERRADA">Cerrada</option>
            </select>
          </div>
        </div>

        <div class="sistpec-form-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscarHojas" :disabled="listLoading">
            {{ listLoading ? 'Buscando...' : 'Buscar' }}
          </button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarFiltros" :disabled="listLoading">Limpiar</button>
        </div>
      </div>

      <!-- Botones de descarga -->
      <div v-if="resultados.length > 0" class="sistpec-export-actions">
        <button type="button" class="sistpec-btn-export sistpec-btn-excel" @click="descargarExcel">
          DESCARGAR EXCEL
        </button>
        <button type="button" class="sistpec-btn-export sistpec-btn-pdf" @click="descargarPDF">
          DESCARGAR PDF
        </button>
      </div>

      <div class="sistpec-table-wrapper" v-if="resultados.length">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>CC No.</th>
              <th>Propietario</th>
              <th>UPP</th>
              <th>Animales</th>
              <th>Número de caso</th>
              <th>Estatus</th>
              <th style="width:220px;">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in resultados" :key="h.id">
              <td>{{ h.cc_no }}</td>
              <td>{{ nombreProp(h) }}</td>
              <td>{{ h.upp?.clave || '—' }}</td>
              <td>{{ (h.animales || []).length }}</td>
              <td>{{ h.numero_caso_asignado ? (h.numero_caso || '—') : '—' }}</td>
              <td>
                <span class="badge" :class="h.numero_caso_asignado ? 'badge--inactivo' : 'badge--activo'">
                  {{ h.numero_caso_asignado ? 'CERRADA' : 'EDITABLE' }}
                </span>
              </td>
              <td>
                <button type="button" class="sistpec-btn-secondary sistpec-btn-sm" @click="verDetalle(h)">Ver</button>
                <button
                  type="button"
                  class="sistpec-btn-primary sistpec-btn-sm"
                  @click="iniciarEdicion(h)"
                  :disabled="h.numero_caso_asignado"
                  title="Solo editable si no tiene número de caso"
                >
                  Editar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="sin-resultados">Sin resultados. Ajuste los filtros y busque.</p>

      <div v-if="detalle" class="sistpec-edit-panel">
        <h4>Detalle</h4>

        <div class="detalle-grid">
          <div><span class="lbl">CC No.:</span> {{ detalle.cc_no }}</div>
          <div><span class="lbl">UPP:</span> {{ detalle.upp?.clave || '—' }}</div>
          <div><span class="lbl">Propietario:</span> {{ nombreProp(detalle) }}</div>
          <div><span class="lbl">Animales:</span> {{ (detalle.animales || []).length }}</div>
          <div><span class="lbl">Estatus:</span> {{ detalle.numero_caso_asignado ? 'CERRADA' : 'EDITABLE' }}</div>
          <div><span class="lbl">Número de caso:</span> {{ detalle.numero_caso_asignado ? (detalle.numero_caso || '—') : '—' }}</div>
        </div>
      </div>
    </div>

    <!-- EDITAR -->
    <div v-if="selectedAction === 'editar'" class="accion-area">
      <h3 class="subtitulo-secundario">Editar</h3>
      <p class="hint">Seleccione una hoja en “Consultar” y pulse “Editar”.</p>
      <p class="hint">
        (En esta versión dejamos el flujo de edición preparado, pero primero aseguramos guardar/consultar/autocompletar al 100%.)
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import api from "@/services/api";

/* =========================================================
   IMPORTANTe:
   - Idealmente este id_usuario debe salir del login/token.
   Esta como constante por el momento
========================================================= */
const mvzUserId = 1;

/* loading flags */
const uppLoading = ref(false);
const propLoading = ref(false);
const saving = ref(false);
const listLoading = ref(false);

/* catálogo de opciones Motivo de prueba */
const opcionesMotivoPrueba = [
  "Tarjeta al 8%",
  "Tarjeta al 3%",
  "Rivanol",
  "Fijación del complemento",
  "Gel de agar"
];

/* Acciones */
const acciones = [
  { id: "capturar", label: "CAPTURAR", descripcion: "Capture los datos de la hoja de control de campo correspondientes al MVZ." },
  { id: "consultar", label: "CONSULTAR", descripcion: "Consulte hojas por CC No., propietario o UPP." },
  { id: "editar", label: "EDITAR", descripcion: "Edite hojas en estatus editable (sin número de caso)." }
];

const selectedAction = ref("capturar");
const descripcionAccionActual = computed(() => acciones.find(a => a.id === selectedAction.value)?.descripcion || "");

const errores = ref([]);
const mensajeExito = ref("");

/* ===================== Catálogos razas ===================== */
const RAZAS = {
  CAPRINO: [
    "ALPINA AMERICANA","ALPINA FRANCESA","ALPINA SUIZA","ANGLO NUBIA","BOER","CRIOLLA","GRANADINA",
    "MANCHA AMERICANA","MURCIANA","NUBIA","SAANEN","TOGGENBURG"
  ],
  OVINO: [
    "BLACKBELLY","COLUMBIA","CORREDALE","CRIOLLA","CHEVIOT","DORSET HORN","FRISONA DEL ESTE","HAMPSHIRE",
    "KARAKUL","KATAHDIN","LINCOLN","MERINO AMERICANO","OXFORD","PANAMA","PELIBUEY TABASCO","RAMBOUILLET",
    "ROMANOV","SAINT CROIX","SANTA CRUZ","SOUTHDOWN","SROPSHIRE","SUFFOLK","TUNEZ","CHAROLLAIS","ILE DE FRANCE",
    "SANTA CRUZ","TEXEL","DAMARA","DORSET POLLED","RIDEAU ARCOTT"
  ],
  BOVINO: [
    "ANGUS","BEEFMASTER","BELGIAN BLUE","BLONDE D'AQUITAINE","BRAFORD","BRAHMAN","BRAHMENTAL","BRANGUS",
    "BUFFALO (BUBALIS BUBALIS)","CANADIENNE","CHARRAY","CHAROLAIS","CHI-ANGUS","CHIANINA","DANS JERSEY",
    "DEVON","DEXTER","FRIESIAN (BELGIUM)","FRIESIAN (DUTCH)","GUERNSEY","GUZERA","GYR","HEREFORD (BLACK)",
    "HEREFORD","HIGHLAND (SCOTCHEM HIGHLAND)","HOLSTEIN","INDO BRAZIL","JERSEY","LIDIA","LIMOUSIN",
    "LINCOLN RED","MEXICAN CORRIENTE","MONTBELIARD","NELLOR","NORMANDY"
  ]
};

const animalTmp = reactive({
  inc_tipo: "",
  arete: "",
  especie: "",
  raza: "",
  edad_meses_registro: null,
  sexo: "",
  fierro: ""
});

const razasDisponiblesTmp = computed(() => {
  const esp = animalTmp.especie;
  if (!esp) return [];
  return RAZAS[esp] || [];
});

function onChangeEspecieTmp() {
  animalTmp.raza = "";
}

/* ===================== Form ===================== */
function nuevoForm() {
  return {
    cc_no: "",
    folio_tb: "",
    tb_tipo_prueba: "",
    prop: {
      id_propietario: null,
      curp: "",
      apellido_paterno: "",
      apellido_materno: "",
      nombres: "",
      telefono: "",
      domicilio: "",
      municipio: "",
      localidad: "",
      cp: "",
      estado: "",
      correo: ""
    },
    upp: {
      id_upp: null,
      clave: "",
      nombre_predio: "",
      latitud: "",
      longitud: "",
      domicilio: "",
      municipio: "",
      localidad: "",
      cp: "",
      estado: ""
    },
    prueba: { motivo: "", fin_zootecnico: "", tipo_identificacion: "", tipo_identificacion_otro: "" },
    resumen: {
      negativos: { tb: 0, br: 0 },
      reactores: { tb: 0, br: 0 },
      total_probados: { tb: 0, br: 0 },
      total_hato: { tb: 0, br: 0 }
    },
    tb: {
      fecha_inyeccion: "",
      hora_inyeccion: "",
      fecha_lectura: "",
      hora_lectura: "",
      dosis: "",
      lote: "",
      caducidad: "",
      fecha_seguimiento: "",
      resultado_vacuna: ""
    },
    animales: []
  };
}
const formHoja = reactive(nuevoForm());

/* Limpia “especifique” cuando ya no es “Otro” */
watch(
  () => formHoja.prueba.tipo_identificacion,
  (val) => {
    if (val !== "Otro") formHoja.prueba.tipo_identificacion_otro = "";
  }
);

/* ===================== Helpers ===================== */
function normalizeCurp(v) {
  return String(v || "").trim().toUpperCase();
}
function normalizeUpp(v) {
  return String(v || "").trim().toUpperCase();
}
function cambiarAccion(id) {
  selectedAction.value = id;
  mensajeExito.value = "";
  errores.value = [];
}

/* ===================== Autocompletar (Propietario) ===================== */
async function autocompletarPropietario() {
  const curp = normalizeCurp(formHoja.prop.curp);
  formHoja.prop.curp = curp;
  if (!curp) return;

  propLoading.value = true;
  errores.value = [];
  try {
    const { data } = await api.get("/api/propietarios/por-curp", { params: { curp } });

    // Esperado del backend (recomendado):
    // { id_propietario, curp, apellido_paterno, apellido_materno, nombres, telefono, correo, domicilio, municipio, localidad, cp, estado }
    formHoja.prop.id_propietario = data.id_propietario ?? null;
    formHoja.prop.apellido_paterno = data.apellido_paterno || "";
    formHoja.prop.apellido_materno = data.apellido_materno || "";
    formHoja.prop.nombres = data.nombres || "";
    formHoja.prop.telefono = data.telefono || "";
    formHoja.prop.correo = data.correo || "";
    formHoja.prop.domicilio = data.domicilio || "";
    formHoja.prop.municipio = data.municipio || "";
    formHoja.prop.localidad = data.localidad || "";
    formHoja.prop.cp = data.cp || "";
    formHoja.prop.estado = data.estado || "";
  } catch (e) {
    const status = e?.response?.status;
    if (status === 404) {
      // No existe → dejar que capture normal (solo limpiamos lo demás, conservando CURP)
      formHoja.prop.id_propietario = null;
      formHoja.prop.apellido_paterno = "";
      formHoja.prop.apellido_materno = "";
      formHoja.prop.nombres = "";
      formHoja.prop.telefono = "";
      formHoja.prop.correo = "";
      formHoja.prop.domicilio = "";
      formHoja.prop.municipio = "";
      formHoja.prop.localidad = "";
      formHoja.prop.cp = "";
      formHoja.prop.estado = "";
    } else {
      errores.value = [`Error consultando propietario: ${e?.response?.data?.detail || "Servidor no disponible"}`];
    }
  } finally {
    propLoading.value = false;
  }
}

/* ===================== Autocompletar (UPP) ===================== */
async function autocompletarUpp() {
  const clave = normalizeUpp(formHoja.upp.clave);
  formHoja.upp.clave = clave;
  if (!clave) return;

  uppLoading.value = true;
  errores.value = [];
  try {
    const { data } = await api.get("/api/upp/por-clave", { params: { clave } });

    // Conserva clave y rellena lo demás desde BD
    formHoja.upp.id_upp = data.id_upp ?? null;
    formHoja.upp.nombre_predio = data.nombre_predio || "";
    formHoja.upp.domicilio = data.domicilio || "";
    formHoja.upp.municipio = data.municipio || "";
    formHoja.upp.localidad = data.localidad || "";
    formHoja.upp.cp = data.codigo_postal || data.cp || "";
    formHoja.upp.estado = data.estado || "";
    formHoja.upp.latitud = data.latitud ?? "";
    formHoja.upp.longitud = data.longitud ?? "";
  } catch (e) {
    const status = e?.response?.status;
    if (status === 404) {
      // No existe → dejar que capture normal (solo limpiamos lo demás, conservando CLAVE)
      formHoja.upp.id_upp = null;
      formHoja.upp.nombre_predio = "";
      formHoja.upp.domicilio = "";
      formHoja.upp.municipio = "";
      formHoja.upp.localidad = "";
      formHoja.upp.cp = "";
      formHoja.upp.estado = "";
      formHoja.upp.latitud = "";
      formHoja.upp.longitud = "";
    } else {
      errores.value = [`Error consultando UPP: ${e?.response?.data?.detail || "Servidor no disponible"}`];
    }
  } finally {
    uppLoading.value = false;
  }
}

/* ===================== Animales (agregar 1 a 1) ===================== */
function edadActualMeses(a) {
  const n = Number(a.edad_meses_registro);
  return Number.isFinite(n) ? n : "";
}

function agregarAnimal() {
  errores.value = [];
  const inc = (animalTmp.inc_tipo || "").toUpperCase().trim();
  if (inc && !["RA", "IN", "IC"].includes(inc)) errores.value.push("Columna I solo permite RA, IN o IC (o vacío).");
  if (!String(animalTmp.arete || "").trim()) errores.value.push("Capture No. arete / identificación.");
  if (!String(animalTmp.especie || "").trim()) errores.value.push("Seleccione especie.");
  if (!String(animalTmp.raza || "").trim()) errores.value.push("Seleccione raza.");
  if (!String(animalTmp.sexo || "").trim()) errores.value.push("Seleccione sexo.");

  const em = animalTmp.edad_meses_registro;
  if (em === null || em === "" || !Number.isInteger(Number(em)) || Number(em) < 0) errores.value.push("Edad debe ser entero (meses).");

  const areteN = String(animalTmp.arete || "").trim().toLowerCase();
  if (areteN && formHoja.animales.some(x => String(x.arete || "").trim().toLowerCase() === areteN)) {
    errores.value.push("Ese arete ya está capturado en la hoja.");
  }

  if (errores.value.length) return;

  formHoja.animales.push({
    inc_tipo: inc,
    arete: String(animalTmp.arete || "").trim(),
    especie: String(animalTmp.especie || "").trim(),
    raza: String(animalTmp.raza || "").trim(),
    edad_meses_registro: Number(animalTmp.edad_meses_registro),
    sexo: String(animalTmp.sexo || "").trim().toUpperCase(),
    fierro: String(animalTmp.fierro || "").trim()
  });

  animalTmp.inc_tipo = "";
  animalTmp.arete = "";
  animalTmp.especie = "";
  animalTmp.raza = "";
  animalTmp.edad_meses_registro = null;
  animalTmp.sexo = "";
  animalTmp.fierro = "";
}

function eliminarAnimal(idx) {
  formHoja.animales.splice(idx, 1);
}

/* ===================== Guardar ===================== */
function validarCaptura() {
  errores.value = [];

  if (!String(formHoja.cc_no || "").trim()) errores.value.push("CC No. es obligatorio.");
  if (!String(formHoja.tb_tipo_prueba || "").trim()) errores.value.push("Seleccione tipo de prueba TB.");

  const p = formHoja.prop;
  if (!String(p.curp || "").trim()) errores.value.push("CURP es obligatorio.");
  if (!String(p.apellido_paterno || "").trim()) errores.value.push("Apellido paterno es obligatorio.");
  if (!String(p.apellido_materno || "").trim()) errores.value.push("Apellido materno es obligatorio.");
  if (!String(p.nombres || "").trim()) errores.value.push("Nombre(s) es obligatorio.");

  const u = formHoja.upp;
  if (!String(u.clave || "").trim()) errores.value.push("UPP (clave) es obligatorio.");
  if (!String(u.nombre_predio || "").trim()) errores.value.push("Nombre del predio es obligatorio.");

  const pr = formHoja.prueba;
  if (!String(pr.motivo || "").trim()) errores.value.push("Motivo de prueba es obligatorio.");
  if (!String(pr.fin_zootecnico || "").trim()) errores.value.push("Fin zootécnico es obligatorio.");
  if (!String(pr.tipo_identificacion || "").trim()) errores.value.push("Tipo de identificación es obligatorio.");
  if (pr.tipo_identificacion === "Otro" && !String(pr.tipo_identificacion_otro || "").trim()) {
    errores.value.push("Especifique el tipo de identificación (Otro).");
  }

  if (!Array.isArray(formHoja.animales) || formHoja.animales.length === 0) {
    errores.value.push("Agregue al menos un animal.");
  }

  // TB opcional: si capturan algo, exigir completo
  const tb = formHoja.tb || {};
  const tbCapturada =
    !!String(tb.fecha_inyeccion || "").trim() ||
    !!String(tb.hora_inyeccion || "").trim() ||
    !!String(tb.fecha_lectura || "").trim() ||
    !!String(tb.hora_lectura || "").trim() ||
    !!String(tb.dosis || "").trim() ||
    !!String(tb.lote || "").trim() ||
    !!String(tb.caducidad || "").trim();

  if (tbCapturada) {
    if (!tb.fecha_inyeccion) errores.value.push("TB: fecha de inyección es obligatoria si se captura TB.");
    if (!tb.hora_inyeccion) errores.value.push("TB: hora de inyección es obligatoria si se captura TB.");
    if (!tb.fecha_lectura) errores.value.push("TB: fecha de lectura es obligatoria si se captura TB.");
    if (!tb.hora_lectura) errores.value.push("TB: hora de lectura es obligatoria si se captura TB.");
    if (!tb.dosis) errores.value.push("TB: dosis es obligatoria si se captura TB.");
    if (!tb.lote) errores.value.push("TB: lote es obligatorio si se captura TB.");
    if (!tb.caducidad) errores.value.push("TB: caducidad es obligatoria si se captura TB.");
  }

  return errores.value.length === 0;
}

function limpiarFormHoja() {
  Object.assign(formHoja, nuevoForm());
  errores.value = [];
  mensajeExito.value = "";
}

async function guardarHoja() {
  mensajeExito.value = "";
  errores.value = [];
  if (!validarCaptura()) return;

  saving.value = true;
  try {
    // Normalizaciones mínimas
    formHoja.prop.curp = normalizeCurp(formHoja.prop.curp);
    formHoja.upp.clave = normalizeUpp(formHoja.upp.clave);

    const payload = {
      // En BD se guardará como folio = CC No.
      folio: String(formHoja.cc_no || "").trim(),
      // Guardamos TODO como JSON
      contenido: JSON.parse(JSON.stringify(formHoja)),
      // Quién captura
      id_usuario: mvzUserId
    };

    await api.post("/api/hoja-reporte", payload);

    mensajeExito.value = "Hoja registrada en BD.";
    limpiarFormHoja();
  } catch (e) {
    errores.value = [`Error guardando hoja: ${e?.response?.data?.detail || "Servidor no disponible"}`];
  } finally {
    saving.value = false;
  }
}

/* ===================== Consultar ===================== */
const filtros = reactive({ cc_no: "", curp: "", upp: "", estatus: "TODOS" });
const resultados = ref([]);
const detalle = ref(null);

function nombreProp(h) {
  const p = h?.prop || {};
  return `${p.apellido_paterno || ""} ${p.apellido_materno || ""} ${p.nombres || ""}`.trim() || "—";
}

function limpiarFiltros() {
  filtros.cc_no = "";
  filtros.curp = "";
  filtros.upp = "";
  filtros.estatus = "TODOS";
  resultados.value = [];
  detalle.value = null;
}

function verDetalle(h) {
  detalle.value = h;
}

function iniciarEdicion(h) {
  detalle.value = h;
  selectedAction.value = "editar";
  mensajeExito.value = "";
  errores.value = [];
}

async function buscarHojas() {
  listLoading.value = true;
  errores.value = [];
  mensajeExito.value = "";
  detalle.value = null;

  try {
    const params = {
      cc_no: String(filtros.cc_no || "").trim(),
      curp: String(filtros.curp || "").trim(),
      upp: String(filtros.upp || "").trim(),
      estatus: String(filtros.estatus || "TODOS")
    };

    const { data } = await api.get("/api/hoja-reporte", { params });

    // Esperado del backend:
    // data = [{ id_reporte, folio, contenido, fecha }]
    resultados.value = (Array.isArray(data) ? data : []).map(r => {
      const contenido = r.contenido || {};
      return {
        id: r.id_reporte ?? r.id ?? null,
        cc_no: r.folio ?? contenido.cc_no ?? "",
        ...contenido,
        // fallback si un día se agregan estos flags en backend:
        numero_caso_asignado: contenido.numero_caso_asignado ?? false,
        numero_caso: contenido.numero_caso ?? ""
      };
    });
  } catch (e) {
    errores.value = [`Error consultando hojas: ${e?.response?.data?.detail || "Servidor no disponible"}`];
  } finally {
    listLoading.value = false;
  }
}

/* ===================== Descargar Excel / PDF ===================== */
function descargarExcel() {
  const datos = resultados.value;
  if (datos.length === 0) return;

  const encabezados = ['CC No.', 'Propietario', 'UPP', 'Animales', 'Número de caso', 'Estatus'];
  const filas = datos.map(h => [
    h.cc_no || '',
    nombreProp(h),
    h.upp?.clave || '',
    (h.animales || []).length,
    h.numero_caso_asignado ? (h.numero_caso || '') : '',
    h.numero_caso_asignado ? 'CERRADA' : 'EDITABLE'
  ]);

  const bom = '\uFEFF';
  const csv = [encabezados, ...filas]
    .map(fila => fila.map(celda => `"${String(celda).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hojas_campo_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function descargarPDF() {
  const datos = resultados.value;
  if (datos.length === 0) return;

  const filasHTML = datos.map(h => `
    <tr>
      <td>${h.cc_no || ''}</td>
      <td>${nombreProp(h)}</td>
      <td>${h.upp?.clave || ''}</td>
      <td>${(h.animales || []).length}</td>
      <td>${h.numero_caso_asignado ? (h.numero_caso || '') : ''}</td>
      <td><span class="badge ${h.numero_caso_asignado ? 'cerrada' : 'editable'}">${h.numero_caso_asignado ? 'CERRADA' : 'EDITABLE'}</span></td>
    </tr>
  `).join('');

  const tablaHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Hojas de Campo</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background-color: #7a061e; color: #fff; padding: 8px; text-align: left; }
        td { padding: 8px; border: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #fafafa; }
        .badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
        .editable { background: #e1f3e1; color: #225522; }
        .cerrada { background: #fbeaea; color: #7a1f1f; }
        @media print {
          body { padding: 0; }
          @page { margin: 1cm; }
        }
      </style>
    </head>
    <body>
      <h1>Hojas de Campo - SISTPEC</h1>
      <table>
        <thead>
          <tr>
            <th>CC No.</th>
            <th>Propietario</th>
            <th>UPP</th>
            <th>Animales</th>
            <th>Número de caso</th>
            <th>Estatus</th>
          </tr>
        </thead>
        <tbody>
          ${filasHTML}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const ventana = window.open('', '_blank');
  ventana.document.write(tablaHTML);
  ventana.document.close();
}
</script>

<style scoped>
/* ===== Estilo general SISTPEC ===== */
.modulo-acciones { margin-bottom: 20px; }
.modulo-acciones-titulo { display:block; font-size:14px; margin-bottom:8px; color:#333; font-weight:700; }
.modulo-acciones-botones { display:flex; flex-wrap:wrap; gap:6px; }

.sistpec-btn-accion{
  border:none; padding:8px 14px; font-size:12px; font-weight:700;
  text-transform:uppercase; border-radius:4px; cursor:pointer;
  background:#2f6b32; color:#fff; letter-spacing:0.4px;
}
.sistpec-btn-accion.active{ background:#244e26; }

.sistpec-info-box{
  margin-top:10px; padding:10px 14px; border-radius:4px;
  background:#e1f3e1; border:1px solid #c3e6c3;
}
.sistpec-info-text{ margin:0; font-size:13px; color:#225522; }

.modulo-contenido { margin-top: 10px; font-family: Arial, Helvetica, sans-serif; }
.subtitulo { font-size:18px; margin:10px 0 6px; color:#333; }
.subtitulo-secundario { font-size:14px; margin:6px 0 16px; color:#666; }

.modulo-alert{ margin-bottom:12px; padding:10px 14px; border-radius:4px; font-size:13px; }
.modulo-alert--error{ background:#fbeaea; border:1px solid #f5c2c2; color:#7a1f1f; }
.modulo-alert--success{ background:#e1f3e1; border:1px solid #c3e6c3; color:#225522; font-weight:700; }

.sistpec-card{
  border:1px solid #ddd; border-radius:4px; padding:12px 12px; margin:12px 0; background:#fff;
}
.sistpec-card-header{
  border-bottom:1px solid #eee; padding-bottom:8px; margin-bottom:12px;
}
.sistpec-card-header h4{ margin:0; font-size:14px; color:#333; }

.sistpec-subcard{
  margin-top:12px; padding:10px; border-radius:4px;
  border:1px dashed #ccc; background:#fafafa;
}
.sistpec-subcard h5{ margin:0 0 10px; font-size:13px; color:#333; }

.sistpec-form-row{ display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap:12px; }
.sistpec-form-row-3{ grid-template-columns: repeat(3, minmax(0, 1fr)); }

.sistpec-form-group{ display:flex; flex-direction:column; gap:4px; }
.sistpec-form-group label{ font-size:13px; font-weight:700; color:#444; }
.sistpec-form-group input,
.sistpec-form-group select{
  padding:8px 10px; border-radius:4px; border:1px solid #ccc; font-size:14px; outline:none;
}
.sistpec-form-group input:focus,
.sistpec-form-group select:focus{
  border-color:#2f6b32;
  box-shadow:0 0 0 1px rgba(47, 107, 50, 0.15);
}

.radios{ display:flex; gap:12px; flex-wrap:wrap; padding-top:6px; }
.hint{ color:#777; font-size:12px; margin-top:4px; }

.otro-wrap{ margin-top:8px; }
.otro-wrap label{ font-size:13px; font-weight:700; color:#444; margin-bottom:4px; }

.sistpec-form-actions{
  display:flex; justify-content:flex-end; gap:8px; margin-top:10px;
}

.sistpec-btn-primary{
  background:#2f6b32; color:#fff; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:800; cursor:pointer;
}
.sistpec-btn-primary:hover{ background:#244e26; }
.sistpec-btn-primary:disabled{ opacity:.5; cursor:not-allowed; }

.sistpec-btn-secondary{
  background:#e0e0e0; color:#333; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:800; cursor:pointer;
}
.sistpec-btn-secondary:hover{ background:#d0d0d0; }
.sistpec-btn-secondary:disabled{ opacity:.5; cursor:not-allowed; }

.sistpec-btn-sm{ padding:6px 12px; font-size:12px; }

.sistpec-table-wrapper{ width:100%; overflow-x:auto; }
.sistpec-table{ width:100%; border-collapse:collapse; font-size:13px; }
.sistpec-table thead{ background:#7a061e; color:#fff; }
.sistpec-table th, .sistpec-table td{ padding:8px 10px; border:1px solid #ddd; text-align:left; }
.sistpec-table tbody tr:nth-child(even){ background:#fafafa; }

.badge{ display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:800; }
.badge--activo{ background:#e1f3e1; color:#225522; border:1px solid #c3e6c3; }
.badge--inactivo{ background:#fbeaea; color:#7a1f1f; border:1px solid #f5c2c2; }

.sistpec-edit-panel{ margin-top:20px; padding-top:10px; border-top:1px dashed #ccc; }
.detalle-grid{
  display:grid; grid-template-columns: repeat(2, minmax(0, 1fr));
  gap:8px 12px; font-size:13px;
}
.lbl{ font-weight:800; color:#444; }
.sin-resultados{ text-align:center; color:#777; }

/* Botones de exportación */
.sistpec-export-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.sistpec-btn-export {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.sistpec-btn-excel {
  background-color: #217346;
  color: #fff;
}

.sistpec-btn-excel:hover {
  background-color: #1a5c38;
}

.sistpec-btn-pdf {
  background-color: #c42b1c;
  color: #fff;
}

.sistpec-btn-pdf:hover {
  background-color: #a32315;
}

@media (max-width: 768px) {
  .sistpec-form-row { grid-template-columns: 1fr; }
  .sistpec-form-row-3 { grid-template-columns: 1fr; }
  .detalle-grid { grid-template-columns: 1fr; }
}
</style>
