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

  <section class="modulo-contenido" ref="moduloContenidoRef">
    <!-- ALERTAS -->
    <div v-if="errores.length" class="modulo-alert modulo-alert--error">
      <ul>
        <li v-for="(e, i) in errores" :key="i">{{ e }}</li>
      </ul>
    </div>

    <div v-if="mensajeExito" class="modulo-alert modulo-alert--success">
      {{ mensajeExito }}
    </div>

    <!-- ====================== 1) REGISTRAR PROPIETARIO ====================== -->
    <div v-if="selectedAction === 'registrar'">
      <h3 class="subtitulo">Registrar</h3>

      <form class="sistpec-form" @submit.prevent="registrarPropietario">
        <div class="card-seccion">
          <div class="seccion-titulo">Datos generales</div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group">
              <label>CURP *</label>
              <input v-model.trim="formRegistro.curp" type="text" placeholder="Ej. RUMM690828HVZZNG03" />
            </div>

            <div class="sistpec-form-group">
              <label>Teléfono *</label>
              <input v-model.trim="formRegistro.telefono" type="text" placeholder="Ej. 228..." />
            </div>

            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Correo electrónico</label>
              <input v-model.trim="formRegistro.correo" type="email" placeholder="correo@ejemplo.com" />
            </div>
          </div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group">
              <label>Apellido paterno *</label>
              <input v-model.trim="formRegistro.apellido_paterno" type="text" />
            </div>
            <div class="sistpec-form-group">
              <label>Apellido materno</label>
              <input v-model.trim="formRegistro.apellido_materno" type="text" />
            </div>
            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Nombre(s) *</label>
              <input v-model.trim="formRegistro.nombres" type="text" />
            </div>
          </div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Domicilio *</label>
              <input v-model.trim="formRegistro.domicilio" type="text" placeholder="Calle, número, colonia..." />
            </div>
            <div class="sistpec-form-group">
              <label>Municipio *</label>
              <input v-model.trim="formRegistro.municipio" type="text" />
            </div>
            <div class="sistpec-form-group">
              <label>Localidad / Población *</label>
              <input v-model.trim="formRegistro.localidad" type="text" />
            </div>
          </div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group">
              <label>Código postal</label>
              <input v-model.trim="formRegistro.cp" type="text" />
            </div>
            <div class="sistpec-form-group">
              <label>Estado *</label>
              <input v-model.trim="formRegistro.estado" type="text" placeholder="Veracruz" />
            </div>
            <div class="sistpec-form-group">
              <label>Estatus</label>
              <input value="ACTIVO" type="text" disabled />
            </div>
          </div>
        </div>

        <div class="acciones-derecha">
          <button type="submit" class="btn-primary">GUARDAR</button>
          <button type="button" class="btn-secondary" @click="limpiarFormRegistro">LIMPIAR</button>
        </div>
      </form>
    </div>

    <!-- ====================== 2) CONSULTAR PROPIETARIOS ====================== -->
    <div v-if="selectedAction === 'consultar'">
      <h3 class="subtitulo">Consultar</h3>

      <div class="card-seccion">
        <div class="seccion-titulo">Filtros de búsqueda</div>

        <div class="sistpec-form-row row-4">
          <div class="sistpec-form-group">
            <label>CURP</label>
            <input v-model.trim="filtros.curp" type="text" placeholder="CURP" />
          </div>

          <div class="sistpec-form-group">
            <label>Nombre</label>
            <input v-model.trim="filtros.nombre" type="text" placeholder="Nombre / apellidos" />
          </div>

          <div class="sistpec-form-group">
            <label>Municipio</label>
            <input v-model.trim="filtros.municipio" type="text" placeholder="Municipio" />
          </div>

          <div class="sistpec-form-group">
            <label>Estatus</label>
            <select v-model="filtros.estatus">
              <option value="">Todos</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="FINADO">FINADO</option>
            </select>
          </div>
        </div>

        <div class="acciones-derecha">
          <button type="button" class="btn-primary" @click="buscarPropietarios">BUSCAR</button>
          <button type="button" class="btn-secondary" @click="limpiarFiltros">LIMPIAR</button>
        </div>
      </div>

      <div class="card-seccion" v-if="resultados.length">
        <div class="seccion-titulo">Resultados</div>

        <div class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th>CURP</th>
                <th>Nombre</th>
                <th>Municipio</th>
                <th>Estatus</th>
                <th>UPP asociadas</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in resultados" :key="p.id">
                <td>{{ p.curp }}</td>
                <td>{{ p.apellido_paterno }} {{ p.apellido_materno }} {{ p.nombres }}</td>
                <td>{{ p.municipio }}</td>
                <td>
                  <span class="badge" :class="p.estatus === 'ACTIVO' ? 'badge-ok' : 'badge-warn'">
                    {{ p.estatus }}
                  </span>
                </td>
                <td>{{ p.upps?.length || 0 }}</td>
                <td>
                  <button class="btn-mini" type="button" @click="seleccionarPropietario(p)">
                    VER
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Detalle seleccionado -->
        <div v-if="propSeleccionado" class="detalle">
          <h4 class="subtitulo2">Detalle del propietario</h4>

          <div class="detalle-grid">
            <div><b>CURP:</b> {{ propSeleccionado.curp }}</div>
            <div><b>Tel:</b> {{ propSeleccionado.telefono }}</div>
            <div style="grid-column: span 2;"><b>Correo:</b> {{ propSeleccionado.correo || '—' }}</div>

            <div><b>Apellido paterno:</b> {{ propSeleccionado.apellido_paterno }}</div>
            <div><b>Apellido materno:</b> {{ propSeleccionado.apellido_materno || '—' }}</div>
            <div style="grid-column: span 2;"><b>Nombre(s):</b> {{ propSeleccionado.nombres }}</div>

            <div style="grid-column: span 2;"><b>Domicilio:</b> {{ propSeleccionado.domicilio }}</div>
            <div><b>Municipio:</b> {{ propSeleccionado.municipio }}</div>
            <div><b>Localidad:</b> {{ propSeleccionado.localidad }}</div>

            <div><b>CP:</b> {{ propSeleccionado.cp || '—' }}</div>
            <div><b>Estado:</b> {{ propSeleccionado.estado }}</div>
            <div><b>Estatus:</b> {{ propSeleccionado.estatus }}</div>
          </div>

          <div class="card-seccion" style="margin-top: 12px;">
            <div class="seccion-titulo">UPP asociadas (solo lectura)</div>

            <div v-if="!propSeleccionado.upps?.length" class="hint">
              No hay UPP asociadas.
            </div>

            <ul v-else class="upp-list">
              <li v-for="u in propSeleccionado.upps" :key="u.clave">
                <b>{{ u.clave }}</b> — {{ u.nombre_predio }} ({{ u.municipio }})
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- ====================== 3) EDITAR PROPIETARIO ====================== -->
    <div v-if="selectedAction === 'editar'">
      <h3 class="subtitulo">Editar</h3>

      <div class="card-seccion">
        <div class="seccion-titulo">Buscar propietario</div>

        <div class="sistpec-form-row row-4">
          <div class="sistpec-form-group">
            <label>CURP *</label>
            <input v-model.trim="buscarEditar.curp" type="text" placeholder="CURP" />
          </div>

          <div class="acciones-derecha" style="grid-column: span 3;">
            <button type="button" class="btn-primary" @click="buscarParaEditar">BUSCAR</button>
            <button type="button" class="btn-secondary" @click="limpiarEdicion">LIMPIAR</button>
          </div>
        </div>
      </div>

      <div v-if="formEdicion.id" class="card-seccion">
        <div class="seccion-titulo">Datos del propietario</div>

        <form class="sistpec-form" @submit.prevent="guardarEdicion">
          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group">
              <label>CURP</label>
              <input :value="formEdicion.curp" type="text" disabled />
            </div>
            <div class="sistpec-form-group">
              <label>Teléfono *</label>
              <input v-model.trim="formEdicion.telefono" type="text" />
            </div>
            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Correo</label>
              <input v-model.trim="formEdicion.correo" type="email" />
            </div>
          </div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group">
              <label>Apellido paterno *</label>
              <input v-model.trim="formEdicion.apellido_paterno" type="text" />
            </div>
            <div class="sistpec-form-group">
              <label>Apellido materno</label>
              <input v-model.trim="formEdicion.apellido_materno" type="text" />
            </div>
            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Nombre(s) *</label>
              <input v-model.trim="formEdicion.nombres" type="text" />
            </div>
          </div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Domicilio *</label>
              <input v-model.trim="formEdicion.domicilio" type="text" />
            </div>
            <div class="sistpec-form-group">
              <label>Municipio *</label>
              <input v-model.trim="formEdicion.municipio" type="text" />
            </div>
            <div class="sistpec-form-group">
              <label>Localidad / Población *</label>
              <input v-model.trim="formEdicion.localidad" type="text" />
            </div>
          </div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group">
              <label>Código postal</label>
              <input v-model.trim="formEdicion.cp" type="text" />
            </div>
            <div class="sistpec-form-group">
              <label>Estado *</label>
              <input v-model.trim="formEdicion.estado" type="text" />
            </div>
            <div class="sistpec-form-group">
              <label>Estatus</label>
              <input :value="formEdicion.estatus" type="text" disabled />
            </div>
          </div>

          <div class="card-seccion" style="margin-top: 12px;">
            <div class="seccion-titulo">UPP asociadas (solo lectura)</div>

            <div v-if="!formEdicion.upps?.length" class="hint">
              No hay UPP asociadas.
            </div>

            <ul v-else class="upp-list">
              <li v-for="u in formEdicion.upps" :key="u.clave">
                <b>{{ u.clave }}</b> — {{ u.nombre_predio }} ({{ u.municipio }})
              </li>
            </ul>

            <div class="hint">
              El traslado de UPP se realiza en <b>Administrar UPP</b>.
            </div>
          </div>

          <div class="acciones-derecha">
            <button type="submit" class="btn-primary">GUARDAR CAMBIOS</button>
            <button type="button" class="btn-secondary" @click="limpiarEdicion">CANCELAR</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ====================== 4) ELIMINAR (LÓGICO) -> CAMBIAR A FINADO ====================== -->
    <div v-if="selectedAction === 'eliminar'">
      <h3 class="subtitulo">Cambiar estatus</h3>

      <div class="card-seccion">
        <div class="seccion-titulo">Buscar propietario</div>

        <div class="sistpec-form-row row-4">
          <div class="sistpec-form-group">
            <label>CURP *</label>
            <input v-model.trim="buscarBaja.curp" type="text" placeholder="CURP" />
          </div>

          <div class="acciones-derecha" style="grid-column: span 3;">
            <button type="button" class="btn-primary" @click="buscarParaBaja">BUSCAR</button>
            <button type="button" class="btn-secondary" @click="limpiarBaja">LIMPIAR</button>
          </div>
        </div>
      </div>

      <div v-if="propBaja.id" class="card-seccion">
        <div class="seccion-titulo">Confirmación</div>


        <div class="detalle-grid">
          <div><b>CURP:</b> {{ propBaja.curp }}</div>
          <div><b>Nombre:</b> {{ propBaja.apellido_paterno }} {{ propBaja.apellido_materno }} {{ propBaja.nombres }}</div>
          <div><b>Estatus actual:</b> {{ propBaja.estatus }}</div>
          <div><b>UPP asociadas:</b> {{ propBaja.upps?.length || 0 }}</div>
        </div>

        <div class="acciones-derecha">
          <button
            type="button"
            class="btn-danger"
            :disabled="propBaja.estatus === 'FINADO'"
            @click="confirmarBajaFinado"
          >
            CONFIRMAR FINADO
          </button>
          <button type="button" class="btn-secondary" @click="limpiarBaja">CANCELAR</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "MvzPropietariosModulo",

  data() {
    return {
      acciones: [
        {
          id: "registrar",
          label: "REGISTRAR",
          descripcion: "Registre un nuevo propietario.",
        },
        {
          id: "consultar",
          label: "CONSULTAR",
          descripcion: "Consulte propietarios.",
        },
        {
          id: "editar",
          label: "EDITAR",
          descripcion: "Edite los datos de un propietario existente.",
        },
        {
          id: "eliminar",
          label: "FINADO",
          descripcion:
            "Cambie el estatus del propietario.",
        },
      ],

      selectedAction: "consultar",
      errores: [],
      mensajeExito: "",
      moduloContenidoRef: null,

      // Mock DB
      propietariosDB: [
        {
          id: 1,
          curp: "RUMM690828HVZZNG03",
          apellido_paterno: "Ruiz",
          apellido_materno: "Mendoza",
          nombres: "Miguel Angel",
          telefono: "2282132079",
          correo: "soto95.cars@gmail.com",
          domicilio: "C. Niño Artillero s/n",
          municipio: "Ayahualulco",
          localidad: "Los Altos",
          cp: "91260",
          estado: "Veracruz",
          estatus: "ACTIVO",
          upps: [
            { clave: "30-025-1055-001", nombre_predio: "San Francisco", municipio: "Ayahualulco" },
          ],
        },
        {
          id: 2,
          curp: "AAAA000000HVZXXX00",
          apellido_paterno: "López",
          apellido_materno: "Pérez",
          nombres: "Juan",
          telefono: "2290000000",
          correo: "",
          domicilio: "Calle 1",
          municipio: "Xalapa",
          localidad: "Centro",
          cp: "91000",
          estado: "Veracruz",
          estatus: "FINADO",
          upps: [
            { clave: "30-999-0000-001", nombre_predio: "Rancho Ejemplo", municipio: "Xalapa" },
          ],
        },
      ],

      // Registrar
      formRegistro: this.formPropietarioVacio(),

      // Consultar
      filtros: { curp: "", nombre: "", municipio: "", estatus: "" },
      resultados: [],
      propSeleccionado: null,

      // Editar
      buscarEditar: { curp: "" },
      formEdicion: {},

      // Baja/Finado
      buscarBaja: { curp: "" },
      propBaja: {},
    };
  },

  computed: {
    descripcionAccionActual() {
      const a = this.acciones.find((x) => x.id === this.selectedAction);
      return a ? a.descripcion : "";
    },
  },

  mounted() {
    this.resultados = [...this.propietariosDB];
  },

  methods: {
    formPropietarioVacio() {
      return {
        curp: "",
        apellido_paterno: "",
        apellido_materno: "",
        nombres: "",
        telefono: "",
        correo: "",
        domicilio: "",
        municipio: "",
        localidad: "",
        cp: "",
        estado: "Veracruz",
      };
    },

    cambiarAccion(id) {
      this.selectedAction = id;
      this.errores = [];
      this.mensajeExito = "";
      // Reset selección
      this.propSeleccionado = null;
    },

    setError(msg) {
      if (!this.errores.includes(msg)) this.errores.push(msg);
    },

    setExito(msg) {
      this.mensajeExito = msg;
      setTimeout(() => (this.mensajeExito = ""), 3500);
    },

    // ================= REGISTRAR =================
    registrarPropietario() {
      this.errores = [];

      const f = this.formRegistro;
      if (!f.curp || !f.telefono || !f.apellido_paterno || !f.nombres || !f.domicilio || !f.municipio || !f.localidad || !f.estado) {
        this.setError("No puede haber campos obligatorios en blanco (*).");
        return;
      }

      const yaExiste = this.propietariosDB.some((p) => p.curp.toUpperCase() === f.curp.toUpperCase());
      if (yaExiste) {
        this.setError("El propietario ya existe (CURP duplicada).");
        return;
      }

      // TODO: API -> POST /propietarios
      const nuevo = {
        id: Date.now(),
        ...JSON.parse(JSON.stringify(f)),
        estatus: "ACTIVO",
        upps: [],
      };
      nuevo.curp = nuevo.curp.toUpperCase();
      this.propietariosDB.unshift(nuevo);

      this.setExito("Propietario registrado con éxito.");
      this.formRegistro = this.formPropietarioVacio();
    },

    limpiarFormRegistro() {
      this.errores = [];
      this.mensajeExito = "";
      this.formRegistro = this.formPropietarioVacio();
    },

    // ================= CONSULTAR =================
    buscarPropietarios() {
      this.errores = [];
      this.propSeleccionado = null;

      const { curp, nombre, municipio, estatus } = this.filtros;

      if (!curp && !nombre && !municipio && !estatus) {
        this.setError("Debe ingresar al menos un criterio de búsqueda o seleccionar un estatus.");
        return;
      }

      const curpN = (curp || "").trim().toUpperCase();
      const nombreN = (nombre || "").trim().toLowerCase();
      const muniN = (municipio || "").trim().toLowerCase();
      const estN = (estatus || "").trim().toUpperCase();

      // TODO: API -> GET /propietarios?...
      let res = [...this.propietariosDB];

      if (curpN) res = res.filter((p) => (p.curp || "").toUpperCase().includes(curpN));
      if (nombreN) {
        res = res.filter((p) =>
          `${p.apellido_paterno} ${p.apellido_materno} ${p.nombres}`.toLowerCase().includes(nombreN)
        );
      }
      if (muniN) res = res.filter((p) => (p.municipio || "").toLowerCase().includes(muniN));
      if (estN) res = res.filter((p) => (p.estatus || "").toUpperCase() === estN);

      if (!res.length) {
        this.setError("No se encontraron resultados con los criterios ingresados, favor de verificar.");
        this.resultados = [];
        return;
      }

      this.resultados = res;
      this.setExito(`Se encontraron ${res.length} resultado(s).`);
    },

    limpiarFiltros() {
      this.errores = [];
      this.mensajeExito = "";
      this.filtros = { curp: "", nombre: "", municipio: "", estatus: "" };
      this.resultados = [...this.propietariosDB];
      this.propSeleccionado = null;
    },

    seleccionarPropietario(p) {
      this.propSeleccionado = JSON.parse(JSON.stringify(p));
    },

    // ================= EDITAR =================
    buscarParaEditar() {
      this.errores = [];
      this.mensajeExito = "";

      const curp = (this.buscarEditar.curp || "").trim().toUpperCase();
      if (!curp) {
        this.setError("No puede haber campos en blanco. Ingrese CURP.");
        return;
      }

      // TODO: API -> GET /propietarios/:curp
      const p = this.propietariosDB.find((x) => (x.curp || "").toUpperCase() === curp);

      if (!p) {
        this.setError("No se pudo encontrar el propietario, favor de verificar.");
        return;
      }

      this.formEdicion = JSON.parse(JSON.stringify(p));
      this.setExito("Propietario cargado para edición.");
    },

    guardarEdicion() {
      this.errores = [];
      const f = this.formEdicion;

      if (!f.telefono || !f.apellido_paterno || !f.nombres || !f.domicilio || !f.municipio || !f.localidad || !f.estado) {
        this.setError("No puede haber campos obligatorios en blanco (*).");
        return;
      }

      // TODO: API -> PUT /propietarios/:id
      const idx = this.propietariosDB.findIndex((p) => p.id === f.id);
      if (idx === -1) {
        this.setError("No se pudo actualizar (registro no encontrado).");
        return;
      }

      // Importante: UPP se mantiene (solo lectura aquí)
      this.propietariosDB[idx] = {
        ...this.propietariosDB[idx],
        telefono: f.telefono,
        correo: f.correo,
        apellido_paterno: f.apellido_paterno,
        apellido_materno: f.apellido_materno,
        nombres: f.nombres,
        domicilio: f.domicilio,
        municipio: f.municipio,
        localidad: f.localidad,
        cp: f.cp,
        estado: f.estado,
      };

      this.setExito("Datos actualizados con éxito.");
      this.resultados = [...this.propietariosDB];
    },

    limpiarEdicion() {
      this.errores = [];
      this.mensajeExito = "";
      this.buscarEditar = { curp: "" };
      this.formEdicion = {};
    },

    // ================= BAJA (FINADO) =================
    buscarParaBaja() {
      this.errores = [];
      this.mensajeExito = "";
      this.propBaja = {};

      const curp = (this.buscarBaja.curp || "").trim().toUpperCase();
      if (!curp) {
        this.setError("No puede haber campos en blanco. Ingrese CURP.");
        return;
      }

      // TODO: API -> GET /propietarios/:curp
      const p = this.propietariosDB.find((x) => (x.curp || "").toUpperCase() === curp);

      if (!p) {
        this.setError("No se pudo encontrar el propietario, favor de verificar.");
        return;
      }

      this.propBaja = JSON.parse(JSON.stringify(p));
      this.setExito("Propietario encontrado.");
    },

    confirmarBajaFinado() {
      this.errores = [];
      if (!this.propBaja?.id) {
        this.setError("Seleccione un propietario antes de confirmar.");
        return;
      }
      if (this.propBaja.estatus === "FINADO") {
        this.setError("El propietario ya se encuentra en estatus FINADO.");
        return;
      }

      // TODO: API -> PATCH /propietarios/:id/estatus FINADO
      const idx = this.propietariosDB.findIndex((p) => p.id === this.propBaja.id);
      if (idx === -1) {
        this.setError("No se pudo actualizar el estatus (registro no encontrado).");
        return;
      }

      this.propietariosDB[idx].estatus = "FINADO";

      this.setExito("Estatus actualizado a FINADO.");
      this.propBaja = {};
      this.buscarBaja = { curp: "" };
      this.resultados = [...this.propietariosDB];
    },

    limpiarBaja() {
      this.errores = [];
      this.mensajeExito = "";
      this.buscarBaja = { curp: "" };
      this.propBaja = {};
    },
  },
};
</script>

<style scoped>
/* ==== Layout general  ==== */
.modulo-acciones {
  margin-bottom: 16px;
}

.modulo-acciones-titulo {
  display: inline-block;
  margin-bottom: 6px;
  font-weight: 700;
  font-size: 14px;
}

.modulo-acciones-botones {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

/* ===== BOTONES DE ACCIÓN  ===== */
.sistpec-btn-accion {
  border: 0;
  padding: 8px 14px;            
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;            
  line-height: 1.1;
  background: #1f5f2b;
  color: #fff;
}

.sistpec-btn-accion.active {
  outline: 2px solid rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

/* ===== RECUADRO VERDE ===== */
.sistpec-info-box {
  padding: 8px 12px;
  border-radius: 6px;
  background: #e3f6e6;
  border: 1px solid #bfe7c6;
}

.sistpec-info-text {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #1f5f2b;                
}

/* ===== CONTENIDO ===== */
.modulo-contenido {
  padding-bottom: 25px;
}

.subtitulo {
  margin: 10px 0 12px;
  font-size: 18px;
}

.subtitulo2 {
  margin: 12px 0 8px;
  font-size: 15px;
}

/* ===== ALERTAS ===== */
.modulo-alert {
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 10px;
  font-size: 13px;
}

.modulo-alert--error {
  background: #ffe8e8;
  border: 1px solid #ffbdbd;
}

.modulo-alert--success {
  background: #e8fff1;
  border: 1px solid #b9f0cf;
  color: #1f5f2b;
}

/* ===== TARJETAS ===== */
.card-seccion {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #eee;
  padding: 14px;
  margin-bottom: 12px;
}

.seccion-titulo {
  font-weight: 800;
  margin-bottom: 8px;
  font-size: 14px;
}

/* ===== FORMULARIOS ===== */
.sistpec-form-row {
  display: grid;
  gap: 10px;
  margin-bottom: 10px;
}

.row-4 {
  grid-template-columns: repeat(4, 1fr);
}

.sistpec-form-group label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 4px;
}

.sistpec-form-group input,
.sistpec-form-group select {
  width: 100%;
  padding: 8px 10px;             
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  font-size: 13px;
}

/* ===== BOTONES DE FORMULARIO ===== */
.acciones-derecha {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.btn-primary,
.btn-secondary,
.btn-danger,
.btn-mini {
  border: 0;
  border-radius: 6px;
  padding: 8px 14px;            
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

.btn-primary {
  background: #1f5f2b;
  color: #fff;
}

.btn-secondary {
  background: #dedede;
  color: #222;
}

.btn-danger {
  background: #a31414;
  color: #fff;
}

.btn-mini {
  background: #1f5f2b;
  color: #fff;
  padding: 6px 10px;
  font-size: 12px;
}

/* ===== TABLAS ===== */
.tabla-wrap {
  overflow: auto;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
}

.tabla th,
.tabla td {
  border: 1px solid #eee;
  padding: 8px;
  text-align: left;
  font-size: 13px;
}

.tabla th {
  background: #7a0f1c;
  color: #fff;
}

/* ===== BADGES ===== */
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 11px;
}

.badge-ok {
  background: #dff5e6;
  color: #1f5f2b;
}

.badge-warn {
  background: #fff1d8;
  color: #a65c00;
}

/* ===== DETALLE ===== */
.detalle {
  margin-top: 12px;
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  font-size: 13px;
  background: #fafafa;
  border: 1px solid #eee;
  padding: 12px;
  border-radius: 10px;
}

.upp-list {
  margin: 0;
  padding-left: 18px;
}

.hint {
  margin-top: 8px;
  font-size: 12px;
  color: #555;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1100px) {
  .row-4 {
    grid-template-columns: repeat(2, 1fr);
  }
  .detalle-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 650px) {
  .row-4 {
    grid-template-columns: 1fr;
  }
  .detalle-grid {
    grid-template-columns: 1fr;
  }
}

</style>
