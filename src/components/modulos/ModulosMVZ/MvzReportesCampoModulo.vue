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

    <!-- ====================== 1) CAPTURAR HOJA CONTROL (SENASICA + SECCIÓN IV MVZ) ====================== -->
    <div v-if="selectedAction === 'capturar'">
      <h3 class="subtitulo">Captura Hoja de Control</h3>

      <form class="sistpec-form" @submit.prevent="guardarHoja">
        <!-- Encabezado TB / CC -->
        <div class="card-seccion">
          <div class="seccion-titulo">Encabezado</div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group">
              <label>Tipo de prueba BR</label>
              <div class="radio-col">
                <label class="radio-item">
                  <input type="radio" value="PLIEGUE_CAUDAL" v-model="formHoja.tb_tipo_prueba" />
                  Pliegue caudal
                </label>
                <label class="radio-item">
                  <input type="radio" value="CERVICAL_SIMPLE" v-model="formHoja.tb_tipo_prueba" />
                  Cervical simple
                </label>
              </div>
            </div>

            <div class="sistpec-form-group">
              <label>Folio BR (opcional)</label>
              <input v-model="formHoja.folio_tb" type="text" placeholder="Ej. 12345" />
            </div>

            <div class="sistpec-form-group">
              <label>CC No. (Folio hoja campo)</label>
              <input v-model="formHoja.cc_no" type="text" placeholder="Ej. 5409818" />
            </div>

            <div class="sistpec-form-group">
              <label>Estatus</label>
              <input :value="formHoja.numero_caso_asignado ? 'BLOQUEADA' : 'EDITABLE'" type="text" disabled />
            </div>
          </div>
        </div>

        <!-- I) Propietario -->
        <div class="card-seccion">
          <div class="seccion-titulo">I) Datos del propietario</div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group">
              <label>CURP</label>
              <input
                v-model="formHoja.prop.curp"
                type="text"
                placeholder="Ej. RUMM690828HVZZNG03"
                @blur="autocargarPropietario"
              />
              <small class="hint" :class="propEncontrado ? 'ok' : ''">
                {{ propEncontrado ? 'Propietario encontrado ✅' : 'Si existe, se autocompletará al salir del campo.' }}
              </small>
            </div>

            <div class="sistpec-form-group">
              <label>Teléfono</label>
              <input v-model="formHoja.prop.telefono" type="text" placeholder="Ej. 228..." :disabled="propLock" />
            </div>

            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Correo electrónico</label>
              <input v-model="formHoja.prop.correo" type="text" placeholder="correo@ejemplo.com" :disabled="propLock" />
            </div>
          </div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group">
              <label>Apellido paterno</label>
              <input v-model="formHoja.prop.apellido_paterno" type="text" :disabled="propLock" />
            </div>
            <div class="sistpec-form-group">
              <label>Apellido materno</label>
              <input v-model="formHoja.prop.apellido_materno" type="text" :disabled="propLock" />
            </div>
            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Nombre(s)</label>
              <input v-model="formHoja.prop.nombres" type="text" :disabled="propLock" />
            </div>
          </div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Domicilio</label>
              <input v-model="formHoja.prop.domicilio" type="text" :disabled="propLock" />
            </div>
            <div class="sistpec-form-group">
              <label>Municipio</label>
              <input v-model="formHoja.prop.municipio" type="text" :disabled="propLock" />
            </div>
            <div class="sistpec-form-group">
              <label>Localidad / Población</label>
              <input v-model="formHoja.prop.localidad" type="text" :disabled="propLock" />
            </div>
          </div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group">
              <label>Código postal</label>
              <input v-model="formHoja.prop.cp" type="text" :disabled="propLock" />
            </div>
            <div class="sistpec-form-group">
              <label>Estado</label>
              <input v-model="formHoja.prop.estado" type="text" :disabled="propLock" />
            </div>

            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Edición propietario</label>
              <div class="inline-actions">
                <button type="button" class="sistpec-btn-secondary" @click="propLock = false">Editar manualmente</button>
                <button type="button" class="sistpec-btn-secondary" @click="autocargarPropietario">
                  Buscar CURP
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- II) UPP -->
        <div class="card-seccion">
          <div class="seccion-titulo">II) Unidad de Producción (UPP / PSG)</div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group">
              <label>Clave UPP / PSG</label>
              <input
                v-model="formHoja.upp.clave"
                type="text"
                placeholder="Ej. 30-025-1055-001"
                @blur="autocargarUpp"
              />
              <small class="hint" :class="uppEncontrada ? 'ok' : ''">
                {{ uppEncontrada ? 'UPP encontrada ✅' : 'Si existe, se autocompletará al salir del campo.' }}
              </small>
            </div>

            <div class="sistpec-form-group" style="grid-column: span 3;">
              <label>Nombre de la unidad / predio</label>
              <input v-model="formHoja.upp.nombre_predio" type="text" :disabled="uppLock" />
            </div>
          </div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group">
              <label>Latitud (opcional)</label>
              <input v-model="formHoja.upp.latitud" type="text" placeholder="Ej. 19.249141" :disabled="uppLock" />
            </div>
            <div class="sistpec-form-group">
              <label>Longitud (opcional)</label>
              <input v-model="formHoja.upp.longitud" type="text" placeholder="Ej. -97.200479" :disabled="uppLock" />
            </div>

            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Domicilio</label>
              <input v-model="formHoja.upp.domicilio" type="text" :disabled="uppLock" />
            </div>
          </div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group">
              <label>Municipio</label>
              <input v-model="formHoja.upp.municipio" type="text" :disabled="uppLock" />
            </div>
            <div class="sistpec-form-group">
              <label>Localidad / Población</label>
              <input v-model="formHoja.upp.localidad" type="text" :disabled="uppLock" />
            </div>
            <div class="sistpec-form-group">
              <label>Código postal</label>
              <input v-model="formHoja.upp.cp" type="text" :disabled="uppLock" />
            </div>
            <div class="sistpec-form-group">
              <label>Estado</label>
              <input v-model="formHoja.upp.estado" type="text" :disabled="uppLock" />
            </div>
          </div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Edición UPP</label>
              <div class="inline-actions">
                <button type="button" class="sistpec-btn-secondary" @click="uppLock = false">Editar manualmente</button>
                <button type="button" class="sistpec-btn-secondary" @click="autocargarUpp">Buscar UPP</button>
              </div>
            </div>

            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Observaciones (opcional)</label>
              <input v-model="formHoja.observaciones" type="text" placeholder="Notas" />
            </div>
          </div>
        </div>

        <!-- III) Prueba -->
        <div class="card-seccion">
          <div class="seccion-titulo">III) Datos de la prueba</div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Motivo de la prueba (Brucelosis)</label>
              <select v-model="formHoja.prueba.motivo">
                <option value="" disabled>Seleccione</option>
                <option>Tarjeta al 8%</option>
                <option>Tarjeta al 3%</option>
                <option>Rivanol</option>
                <option>Fijación de complemento</option>
                <option>Gel de agar</option>
              </select>
            </div>

            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Fin zootécnico (solo una opción)</label>
              <div class="radio-row">
                <label class="radio-item">
                  <input type="radio" value="Leche" v-model="formHoja.prueba.fin_zootecnico" />
                  Leche
                </label>
                <label class="radio-item">
                  <input type="radio" value="Carne" v-model="formHoja.prueba.fin_zootecnico" />
                  Carne
                </label>
                <label class="radio-item">
                  <input type="radio" value="Mixto" v-model="formHoja.prueba.fin_zootecnico" />
                  Mixto
                </label>
              </div>
            </div>
          </div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Tipo de identificación</label>
              <div class="radio-row">
                <label class="radio-item">
                  <input type="radio" value="Arete" v-model="formHoja.prueba.tipo_identificacion" />
                  Arete
                </label>
                <label class="radio-item">
                  <input type="radio" value="Tatuaje" v-model="formHoja.prueba.tipo_identificacion" />
                  Tatuaje
                </label>
                <label class="radio-item">
                  <input type="radio" value="Otro" v-model="formHoja.prueba.tipo_identificacion" />
                  Otro
                </label>
              </div>
            </div>

            <!-- ✅ SOLO aparece si selecciona "Otro" -->
            <div v-if="formHoja.prueba.tipo_identificacion === 'Otro'" class="sistpec-form-group" style="grid-column: span 2;">
              <label>Especifique</label>
              <input
                v-model="formHoja.prueba.tipo_identificacion_otro"
                type="text"
                placeholder="Escriba el tipo de identificación"
              />
            </div>
          </div>

          <!-- Resumen TB/BR -->
          <div class="resumen-box">
            <div class="resumen-titulo">Resumen (captura numérica TB / BR)</div>

            <div class="sistpec-table-wrapper">
              <table class="sistpec-table">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th style="width:140px;">TB</th>
                    <th style="width:140px;">BR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Negativos</td>
                    <td><input class="input-inline" v-model.number="formHoja.resumen.negativos.tb" type="number" min="0" /></td>
                    <td><input class="input-inline" v-model.number="formHoja.resumen.negativos.br" type="number" min="0" /></td>
                  </tr>
                  <tr>
                    <td>Reactores</td>
                    <td><input class="input-inline" v-model.number="formHoja.resumen.reactores.tb" type="number" min="0" /></td>
                    <td><input class="input-inline" v-model.number="formHoja.resumen.reactores.br" type="number" min="0" /></td>
                  </tr>
                  <tr>
                    <td>Total probados</td>
                    <td><input class="input-inline" v-model.number="formHoja.resumen.total_probados.tb" type="number" min="0" /></td>
                    <td><input class="input-inline" v-model.number="formHoja.resumen.total_probados.br" type="number" min="0" /></td>
                  </tr>
                  <tr>
                    <td>Total del hato</td>
                    <td><input class="input-inline" v-model.number="formHoja.resumen.total_hato.tb" type="number" min="0" /></td>
                    <td><input class="input-inline" v-model.number="formHoja.resumen.total_hato.br" type="number" min="0" /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <small class="hint">
              Nota: “Tuberculosis” se incluye, pero puede quedar vacío si solo se trabajará Brucelosis.
            </small>
          </div>

          <!-- Tuberculosis (opcional) -->
          <div class="tb-opcional">
            <div class="resumen-titulo">Tuberculosis (opcional)</div>

            <div class="sistpec-form-row row-4">
              <div class="sistpec-form-group">
                <label>Fecha de inyección</label>
                <input v-model="formHoja.tb.fecha_inyeccion" type="date" />
              </div>
              <div class="sistpec-form-group">
                <label>Hora</label>
                <input v-model="formHoja.tb.hora_inyeccion" type="time" />
              </div>
              <div class="sistpec-form-group">
                <label>Fecha de lectura</label>
                <input v-model="formHoja.tb.fecha_lectura" type="date" />
              </div>
              <div class="sistpec-form-group">
                <label>Hora</label>
                <input v-model="formHoja.tb.hora_lectura" type="time" />
              </div>
            </div>

            <div class="sistpec-form-row row-4">
              <div class="sistpec-form-group">
                <label>Dosis</label>
                <div class="radio-row">
                  <label class="radio-item">
                    <input type="radio" value="10" v-model="formHoja.tb.dosis" />
                    10
                  </label>
                  <label class="radio-item">
                    <input type="radio" value="50" v-model="formHoja.tb.dosis" />
                    50
                  </label>
                </div>
              </div>

              <div class="sistpec-form-group">
                <label>No. de lote</label>
                <input v-model="formHoja.tb.lote" type="text" placeholder="Ej. 4820A..." />
              </div>

              <div class="sistpec-form-group">
                <label>Fecha de caducidad</label>
                <input v-model="formHoja.tb.caducidad" type="date" />
              </div>

              <div class="sistpec-form-group">
                <label>Resultado laboratorio (seguimiento)</label>
                <input v-model="formHoja.tb.resultado_lab" type="text" placeholder="Opcional" />
              </div>
            </div>

            <div class="sistpec-form-row row-4">
              <div class="sistpec-form-group">
                <label>Fecha seguimiento vacuna</label>
                <input v-model="formHoja.tb.fecha_seguimiento" type="date" />
              </div>
              <div class="sistpec-form-group" style="grid-column: span 3;">
                <label>Resultado seguimiento</label>
                <input v-model="formHoja.tb.resultado_seguimiento" type="text" placeholder="Opcional" />
              </div>
            </div>
          </div>
        </div>

        <!-- IV) Resultados / Animales (CAPTURA MVZ) -->
        <div class="card-seccion">
          <div class="seccion-titulo">IV) Animales (captura MVZ)</div>

          <div class="sistpec-form-actions" style="justify-content:flex-end;">
            <button type="button" class="sistpec-btn-secondary" @click="agregarFilaAnimal">+ Agregar animal</button>
          </div>

          <div class="sistpec-table-wrapper">
            <table class="sistpec-table">
              <thead>
                <tr>
                  <th style="width:40px;">#</th>
                  <th style="width:90px;">I</th>
                  <th>Arete</th>
                  <th style="width:160px;">Especie</th>
                  <th style="width:170px;">Edad (meses)</th>
                  <th style="width:180px;">Raza</th>
                  <th style="width:120px;">Sexo</th>
                  <th style="width:220px;">Fierro (opcional)</th>
                  <th style="width:110px;">Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(a, idx) in formHoja.animales" :key="a._key">
                  <td>{{ idx + 1 }}</td>

                  <!-- ✅ I (opcional): RA/IN/IC -->
                  <td>
                    <select v-model="formHoja.animales[idx].inc_tipo" class="input-inline">
                      <option value="">—</option>
                      <option value="RA">RA</option>
                      <option value="IN">IN</option>
                      <option value="IC">IC</option>
                    </select>
                  </td>

                  <td>
                    <input
                      v-model="formHoja.animales[idx].arete"
                      type="text"
                      class="input-inline"
                      placeholder="Ej. 3064155716"
                    />
                  </td>

                  <td>
                    <select v-model="formHoja.animales[idx].especie" class="input-inline">
                      <option value="" disabled>Seleccione</option>
                      <option value="Bovino">Bovino</option>
                      <option value="Caprino">Caprino</option>
                      <option value="Ovino">Ovino</option>
                    </select>
                  </td>

                  <td>
                    <div class="edad-box">
                      <input
                        v-model.number="formHoja.animales[idx].edad_meses_registro"
                        type="number"
                        min="0"
                        class="input-inline"
                        placeholder="Meses (base)"
                        @change="marcarEdadRegistro(formHoja.animales[idx])"
                      />
                      <small class="hint ok">Actual: {{ edadActualMeses(formHoja.animales[idx]) }}</small>
                    </div>
                  </td>

                  <td>
                    <input
                      v-model="formHoja.animales[idx].raza"
                      type="text"
                      class="input-inline"
                      placeholder="String (ej. HF)"
                    />
                  </td>

                  <td>
                    <select v-model="formHoja.animales[idx].sexo" class="input-inline">
                      <option value="" disabled>—</option>
                      <option value="H">H</option>
                      <option value="M">M</option>
                    </select>
                  </td>

                  <td>
                    <input
                      v-model="formHoja.animales[idx].fierro"
                      type="text"
                      class="input-inline"
                      placeholder="Opcional"
                    />
                  </td>

                  <td>
                    <button type="button" class="sistpec-btn-danger sistpec-btn-sm" @click="quitarFilaAnimal(idx)">
                      QUITAR
                    </button>
                  </td>
                </tr>

                <tr v-if="formHoja.animales.length === 0">
                  <td colspan="9" class="sin-resultados">Agregue al menos un animal (aretes).</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="sistpec-info-box">
            <p class="sistpec-info-text">
              Columna <strong>I</strong> es opcional:
              <strong>RA</strong>=Rearetado, <strong>IN</strong>=Incremento natural, <strong>IC</strong>=Incremento por compra.
            </p>
          </div>
        </div>

        <div class="sistpec-form-actions">
          <button type="submit" class="sistpec-btn-primary">GUARDAR HOJA</button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarFormHoja">LIMPIAR</button>
        </div>

      </form>
    </div>

    <!-- ====================== 2) CONSULTAR HOJAS ====================== -->
    <div v-else-if="selectedAction === 'consultar'">
      <h3 class="subtitulo">Consultar</h3>

      <div class="sistpec-search-bar">
        <div class="sistpec-form-group">
          <label>CC No.</label>
          <input v-model="filtrosCons.cc_no" type="text" placeholder="Ej. 5409818" />
        </div>

        <div class="sistpec-form-group">
          <label>UPP (clave)</label>
          <input v-model="filtrosCons.upp" type="text" placeholder="Ej. 30-025..." />
        </div>

        <div class="sistpec-form-group">
          <label>CURP propietario</label>
          <input v-model="filtrosCons.curp" type="text" placeholder="Ej. RUMM..." />
        </div>

        <div class="sistpec-form-group">
          <label>Con número de caso</label>
          <select v-model="filtrosCons.con_caso">
            <option value="">Todos</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <div class="sistpec-search-bar fechas-bar">
        <div class="sistpec-form-group sistpec-form-group-inline">
          <label>Fecha (inyección TB) (opcional)</label>
          <div class="sistpec-form-inline-inputs">
            <input v-model="filtrosCons.fecha_inicio" type="date" />
            <span class="vigencia-sep">a</span>
            <input v-model="filtrosCons.fecha_fin" type="date" />
          </div>
        </div>

        <div class="sistpec-form-group sistpec-search-actions">
          <button type="button" class="sistpec-btn-primary" @click="buscarConsultar">BUSCAR</button>
          <button type="button" class="sistpec-btn-secondary" @click="limpiarConsultar">LIMPIAR</button>
        </div>
      </div>

      <div v-if="buscadoCons" class="sistpec-table-wrapper">
        <table class="sistpec-table">
          <thead>
            <tr>
              <th>CC No.</th>
              <th>UPP</th>
              <th>CURP</th>
              <th>Motivo</th>
              <th>Total animales</th>
              <th>Número de caso</th>
              <th>Estatus edición</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="h in hojasConsultadas" :key="h.id">
              <td>{{ h.cc_no }}</td>
              <td>{{ h.upp?.clave || '—' }}</td>
              <td>{{ h.prop?.curp || '—' }}</td>
              <td>{{ h.prueba?.motivo || '—' }}</td>
              <td>{{ (h.animales || []).length }}</td>
              <td>{{ h.numero_caso || '-' }}</td>
              <td>
                <span class="badge" :class="h.numero_caso_asignado ? 'badge--inactivo' : 'badge--activo'">
                  {{ h.numero_caso_asignado ? 'BLOQUEADA' : 'EDITABLE' }}
                </span>
              </td>
              <td>
                <div class="acciones">
                  <button type="button" class="sistpec-btn-secondary sistpec-btn-sm" @click="verDetalle(h)">
                    VER
                  </button>

                  <button
                    type="button"
                    class="sistpec-btn-secondary sistpec-btn-sm"
                    :disabled="h.numero_caso_asignado"
                    @click="abrirEdicionHoja(h)"
                    title="Solo antes de asignar número de caso."
                  >
                    EDITAR
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="hojasConsultadas.length === 0">
              <td colspan="8" class="sin-resultados">No se encontraron hojas con esos criterios.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- detalle -->
      <div v-if="detalleHoja" class="sistpec-edit-panel">
        <h4 class="subtitulo-secundario">Detalle: CC {{ detalleHoja.cc_no }}</h4>

        <div class="detalle-grid">
          <div><span class="lbl">CURP:</span> {{ detalleHoja.prop?.curp || '—' }}</div>
          <div><span class="lbl">Propietario:</span> {{ propietarioNombrePorCurp(detalleHoja.prop?.curp) }}</div>
          <div><span class="lbl">UPP:</span> {{ detalleHoja.upp?.clave || '—' }}</div>
          <div><span class="lbl">Predio:</span> {{ detalleHoja.upp?.nombre_predio || '—' }}</div>
          <div><span class="lbl">Motivo:</span> {{ detalleHoja.prueba?.motivo || '—' }}</div>
          <div><span class="lbl">Fin zootécnico:</span> {{ detalleHoja.prueba?.fin_zootecnico || '—' }}</div>

          <div style="grid-column: span 2;">
            <span class="lbl">Animales:</span>
            <div class="sistpec-table-wrapper" style="margin-top:6px;">
              <table class="sistpec-table">
                <thead>
                  <tr>
                    <th style="width:60px;">I</th>
                    <th>Arete</th>
                    <th>Especie</th>
                    <th>Edad actual</th>
                    <th>Raza</th>
                    <th>Sexo</th>
                    <th>Fierro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(a, i) in (detalleHoja.animales || [])" :key="i">
                    <td>{{ a.inc_tipo || '—' }}</td>
                    <td>{{ a.arete || '—' }}</td>
                    <td>{{ a.especie || '—' }}</td>
                    <td>{{ edadActualMeses(a) }}</td>
                    <td>{{ a.raza || '—' }}</td>
                    <td>{{ a.sexo || '—' }}</td>
                    <td>{{ a.fierro || '—' }}</td>
                  </tr>
                  <tr v-if="(detalleHoja.animales || []).length === 0">
                    <td colspan="7" class="sin-resultados">Sin animales capturados.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="sistpec-form-actions">
          <button type="button" class="sistpec-btn-secondary" @click="detalleHoja = null">CERRAR</button>
        </div>
      </div>
    </div>

    <!-- ====================== 3) EDITAR HOJA (ANTES DE CASO) ====================== -->
    <div v-else-if="selectedAction === 'editar'">
      <h3 class="subtitulo">Editar</h3>

      <div v-if="!hojaEditando" class="modulo-alert modulo-alert--error">
        Seleccione una hoja desde <strong>CONSULTAR</strong> para editar.
      </div>

      <form v-else class="sistpec-form" @submit.prevent="guardarEdicionHoja">
        <div class="card-seccion">
          <div class="seccion-titulo">Encabezado</div>

          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group">
              <label>CC No.</label>
              <input v-model="hojaEditando.cc_no" type="text" />
            </div>
            <div class="sistpec-form-group">
              <label>Folio TB (opcional)</label>
              <input v-model="hojaEditando.folio_tb" type="text" />
            </div>
            <div class="sistpec-form-group">
              <label>Tipo de prueba TB</label>
              <select v-model="hojaEditando.tb_tipo_prueba">
                <option value="">—</option>
                <option value="PLIEGUE_CAUDAL">Pliegue caudal</option>
                <option value="CERVICAL_SIMPLE">Cervical simple</option>
              </select>
            </div>
            <div class="sistpec-form-group">
              <label>CURP</label>
              <input v-model="hojaEditando.prop.curp" type="text" />
            </div>
          </div>
        </div>

        <div class="card-seccion">
          <div class="seccion-titulo">UPP</div>
          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group">
              <label>Clave UPP / PSG</label>
              <input v-model="hojaEditando.upp.clave" type="text" />
            </div>
            <div class="sistpec-form-group" style="grid-column: span 3;">
              <label>Predio</label>
              <input v-model="hojaEditando.upp.nombre_predio" type="text" />
            </div>
          </div>
        </div>

        <div class="card-seccion">
          <div class="seccion-titulo">Prueba</div>
          <div class="sistpec-form-row row-4">
            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Motivo</label>
              <select v-model="hojaEditando.prueba.motivo">
                <option value="" disabled>Seleccione</option>
                <option>Tarjeta al 8%</option>
                <option>Tarjeta al 3%</option>
                <option>Rivanol</option>
                <option>Fijación de complemento</option>
                <option>Gel de agar</option>
              </select>
            </div>
            <div class="sistpec-form-group" style="grid-column: span 2;">
              <label>Fin zootécnico</label>
              <select v-model="hojaEditando.prueba.fin_zootecnico">
                <option value="" disabled>Seleccione</option>
                <option>Leche</option>
                <option>Carne</option>
                <option>Mixto</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Editar animales también (sección IV) -->
        <div class="card-seccion">
          <div class="seccion-titulo">IV) Animales</div>

          <div class="sistpec-form-actions" style="justify-content:flex-end;">
            <button type="button" class="sistpec-btn-secondary" @click="agregarFilaAnimalEdicion">+ Agregar animal</button>
          </div>

          <div class="sistpec-table-wrapper">
            <table class="sistpec-table">
              <thead>
                <tr>
                  <th style="width:40px;">#</th>
                  <th style="width:90px;">I</th>
                  <th>Arete</th>
                  <th style="width:160px;">Especie</th>
                  <th style="width:170px;">Edad (meses)</th>
                  <th style="width:180px;">Raza</th>
                  <th style="width:120px;">Sexo</th>
                  <th style="width:220px;">Fierro</th>
                  <th style="width:110px;">Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(a, idx) in hojaEditando.animales" :key="a._key || idx">
                  <td>{{ idx + 1 }}</td>

                  <td>
                    <select v-model="hojaEditando.animales[idx].inc_tipo" class="input-inline">
                      <option value="">—</option>
                      <option value="RA">RA</option>
                      <option value="IN">IN</option>
                      <option value="IC">IC</option>
                    </select>
                  </td>

                  <td><input v-model="hojaEditando.animales[idx].arete" type="text" class="input-inline" /></td>

                  <td>
                    <select v-model="hojaEditando.animales[idx].especie" class="input-inline">
                      <option value="" disabled>Seleccione</option>
                      <option value="Bovino">Bovino</option>
                      <option value="Caprino">Caprino</option>
                      <option value="Ovino">Ovino</option>
                    </select>
                  </td>

                  <td>
                    <div class="edad-box">
                      <input
                        v-model.number="hojaEditando.animales[idx].edad_meses_registro"
                        type="number"
                        min="0"
                        class="input-inline"
                        @change="marcarEdadRegistro(hojaEditando.animales[idx])"
                      />
                      <small class="hint ok">Actual: {{ edadActualMeses(hojaEditando.animales[idx]) }}</small>
                    </div>
                  </td>

                  <td><input v-model="hojaEditando.animales[idx].raza" type="text" class="input-inline" /></td>

                  <td>
                    <select v-model="hojaEditando.animales[idx].sexo" class="input-inline">
                      <option value="" disabled>—</option>
                      <option value="H">H</option>
                      <option value="M">M</option>
                    </select>
                  </td>

                  <td><input v-model="hojaEditando.animales[idx].fierro" type="text" class="input-inline" /></td>

                  <td>
                    <button type="button" class="sistpec-btn-danger sistpec-btn-sm" @click="quitarFilaAnimalEdicion(idx)">
                      QUITAR
                    </button>
                  </td>
                </tr>

                <tr v-if="(hojaEditando.animales || []).length === 0">
                  <td colspan="9" class="sin-resultados">Sin animales.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="sistpec-form-actions">
          <button type="submit" class="sistpec-btn-primary">GUARDAR CAMBIOS</button>
          <button type="button" class="sistpec-btn-secondary" @click="cancelarEdicionHoja">CANCELAR</button>
        </div>
      </form>
    </div>

    <!-- fallback -->
    <div v-else>
      <h3 class="subtitulo">Acción no disponible</h3>
      <p>El contenido para esta acción aún está en desarrollo.</p>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';

defineProps({
  codigo: { type: String, required: false, default: '' },
  rol: { type: String, required: false, default: 'MVZ' }
});

/* ===================== Scroll ===================== */
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

/* ===================== Acciones ===================== */
const acciones = [
  { id: 'capturar', label: 'CAPTURAR' },
  { id: 'consultar', label: 'CONSULTAR' },
  { id: 'editar', label: 'EDITAR' }
];

const selectedAction = ref('capturar');
const errores = ref([]);
const mensajeExito = ref('');

function cambiarAccion(id) {
  selectedAction.value = id;
  scrollAlContenido();
}

const descripcionAccionActual = computed(() => {
  switch (selectedAction.value) {
    case 'capturar':
      return 'Capture los datos de la hoja de control de campo correspondientes al MVZ.';
    case 'consultar':
      return 'Consulte hojas por CC, UPP, CURP y si tiene número de caso.';
    case 'editar':
      return 'Edite hoja solo si NO tiene número de caso asignado.';
    default:
      return '';
  }
});

watch(
  () => selectedAction.value,
  () => {
    errores.value = [];
    mensajeExito.value = '';
  }
);

/* ===================== DEMO: MVZ actual ===================== */
const mvzUserId = 10;

/* ===================== DEMO DATA: Propietarios ===================== */
const propietariosDemo = ref([
  {
    id: 1,
    mvz_user_id: 10,
    curp: 'RUMM690828HVZZNG03',
    apellido_paterno: 'Ruiz',
    apellido_materno: 'Mendoza',
    nombres: 'Miguel Ángel',
    telefono: '2821312079',
    domicilio: 'C. Niño Artillero s/n',
    municipio: 'Ayahualulco',
    localidad: 'Los Altos',
    cp: '91260',
    estado: 'Veracruz',
    correo: 'soto95.cars@gmail.com'
  }
]);

function propietarioNombrePorCurp(curp) {
  const c = String(curp || '').trim().toUpperCase();
  if (!c) return '—';
  const p = propietariosDemo.value.find(x => String(x.curp || '').toUpperCase() === c);
  if (!p) return '—';
  return `${p.apellido_paterno || ''} ${p.apellido_materno || ''} ${p.nombres || ''}`.trim();
}

function buscarPropPorCurp(curp) {
  const c = String(curp || '').trim().toUpperCase();
  if (!c) return null;
  return propietariosDemo.value.find(x => String(x.curp || '').toUpperCase() === c) || null;
}

/* ===================== DEMO DATA: UPP ===================== */
const uppDemo = ref([
  {
    id: 101,
    mvz_user_id: 10,
    clave: '30-025-1055-001',
    nombre_predio: 'San Francisco',
    latitud: '19.249141',
    longitud: '-97.200479',
    domicilio: 'Calle Ayuntamiento s/n',
    municipio: 'Ayahualulco',
    localidad: 'Ayahualulco',
    cp: '91260',
    estado: 'Veracruz'
  }
]);

function buscarUppPorClave(clave) {
  const c = String(clave || '').trim().toUpperCase();
  if (!c) return null;
  return uppDemo.value.find(x => String(x.clave || '').toUpperCase() === c) || null;
}

/* ===================== DEMO DATA: hojas control ===================== */
const hojasDemo = ref([
  {
    id: 5001,
    mvz_user_id: 10,
    cc_no: '5409818',
    folio_tb: '',
    tb_tipo_prueba: 'PLIEGUE_CAUDAL',
    numero_caso_asignado: false,
    numero_caso: '',
    observaciones: '',
    prop: {
      curp: 'RUMM690828HVZZNG03',
      apellido_paterno: 'Ruiz',
      apellido_materno: 'Mendoza',
      nombres: 'Miguel Ángel',
      telefono: '2821312079',
      domicilio: 'C. Niño Artillero s/n',
      municipio: 'Ayahualulco',
      localidad: 'Los Altos',
      cp: '91260',
      estado: 'Veracruz',
      correo: 'soto95.cars@gmail.com'
    },
    upp: {
      clave: '30-025-1055-001',
      nombre_predio: 'San Francisco',
      latitud: '19.249141',
      longitud: '-97.200479',
      domicilio: 'Calle Ayuntamiento s/n',
      municipio: 'Ayahualulco',
      localidad: 'Ayahualulco',
      cp: '91260',
      estado: 'Veracruz'
    },
    prueba: {
      motivo: 'Tarjeta al 8%',
      fin_zootecnico: 'Leche',
      tipo_identificacion: 'Arete',
      tipo_identificacion_otro: ''
    },
    resumen: {
      negativos: { tb: 0, br: 0 },
      reactores: { tb: 0, br: 0 },
      total_probados: { tb: 0, br: 0 },
      total_hato: { tb: 0, br: 0 }
    },
    tb: {
      fecha_inyeccion: '',
      hora_inyeccion: '',
      fecha_lectura: '',
      hora_lectura: '',
      dosis: '',
      lote: '',
      caducidad: '',
      fecha_seguimiento: '',
      resultado_seguimiento: '',
      resultado_lab: ''
    },
    animales: []
  }
]);

/* ===================== Form Hoja ===================== */
const propEncontrado = ref(false);
const uppEncontrada = ref(false);
const propLock = ref(false);
const uppLock = ref(false);

const formHoja = ref(nuevoFormHoja());

function nuevoAnimal() {
  return {
    _key: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    inc_tipo: '', // I (opcional): RA/IN/IC
    arete: '',
    especie: '',
    edad_meses_registro: null,
    fecha_registro_edad: new Date().toISOString().slice(0, 10),
    raza: '',
    sexo: '',
    fierro: ''
  };
}

function nuevoFormHoja() {
  return {
    cc_no: '',
    folio_tb: '',
    tb_tipo_prueba: '',
    numero_caso_asignado: false,
    numero_caso: '',
    observaciones: '',
    prop: {
      curp: '',
      apellido_paterno: '',
      apellido_materno: '',
      nombres: '',
      telefono: '',
      domicilio: '',
      municipio: '',
      localidad: '',
      cp: '',
      estado: '',
      correo: ''
    },
    upp: {
      clave: '',
      nombre_predio: '',
      latitud: '',
      longitud: '',
      domicilio: '',
      municipio: '',
      localidad: '',
      cp: '',
      estado: ''
    },
    prueba: {
      motivo: '',
      fin_zootecnico: '',
      tipo_identificacion: '',
      tipo_identificacion_otro: ''
    },
    resumen: {
      negativos: { tb: null, br: null },
      reactores: { tb: null, br: null },
      total_probados: { tb: null, br: null },
      total_hato: { tb: null, br: null }
    },
    tb: {
      fecha_inyeccion: '',
      hora_inyeccion: '',
      fecha_lectura: '',
      hora_lectura: '',
      dosis: '',
      lote: '',
      caducidad: '',
      fecha_seguimiento: '',
      resultado_seguimiento: '',
      resultado_lab: ''
    },
    animales: []
  };
}

watch(
  () => formHoja.value.prueba.tipo_identificacion,
  (val) => {
    //  si cambia a algo que no sea "Otro", limpiamos el campo
    if (val !== 'Otro') formHoja.value.prueba.tipo_identificacion_otro = '';
  }
);

function limpiarFormHoja() {
  formHoja.value = nuevoFormHoja();
  propEncontrado.value = false;
  uppEncontrada.value = false;
  propLock.value = false;
  uppLock.value = false;
}

function autocargarPropietario() {
  propEncontrado.value = false;

  const p = buscarPropPorCurp(formHoja.value.prop.curp);
  if (!p) return;

  propEncontrado.value = true;
  propLock.value = true;

  formHoja.value.prop.apellido_paterno = p.apellido_paterno || '';
  formHoja.value.prop.apellido_materno = p.apellido_materno || '';
  formHoja.value.prop.nombres = p.nombres || '';
  formHoja.value.prop.telefono = p.telefono || '';
  formHoja.value.prop.domicilio = p.domicilio || '';
  formHoja.value.prop.municipio = p.municipio || '';
  formHoja.value.prop.localidad = p.localidad || '';
  formHoja.value.prop.cp = p.cp || '';
  formHoja.value.prop.estado = p.estado || '';
  formHoja.value.prop.correo = p.correo || '';
}

function autocargarUpp() {
  uppEncontrada.value = false;

  const u = buscarUppPorClave(formHoja.value.upp.clave);
  if (!u) return;

  uppEncontrada.value = true;
  uppLock.value = true;

  formHoja.value.upp.nombre_predio = u.nombre_predio || '';
  formHoja.value.upp.latitud = u.latitud || '';
  formHoja.value.upp.longitud = u.longitud || '';
  formHoja.value.upp.domicilio = u.domicilio || '';
  formHoja.value.upp.municipio = u.municipio || '';
  formHoja.value.upp.localidad = u.localidad || '';
  formHoja.value.upp.cp = u.cp || '';
  formHoja.value.upp.estado = u.estado || '';
}

function agregarFilaAnimal() {
  formHoja.value.animales.push(nuevoAnimal());
}

function quitarFilaAnimal(idx) {
  formHoja.value.animales.splice(idx, 1);
}

function marcarEdadRegistro(animal) {
  if (!animal) return;
  if (!animal.fecha_registro_edad) animal.fecha_registro_edad = new Date().toISOString().slice(0, 10);
}

function monthsDiff(fromISO, toISO) {
  try {
    const a = new Date(fromISO);
    const b = new Date(toISO);
    let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    if (b.getDate() < a.getDate()) months -= 1;
    return Math.max(0, months);
  } catch {
    return 0;
  }
}

function edadActualMeses(animal) {
  if (!animal) return 0;
  const base = Number(animal.edad_meses_registro);
  if (!Number.isFinite(base) || base < 0) return 0;
  const fr = animal.fecha_registro_edad || new Date().toISOString().slice(0, 10);
  const hoy = new Date().toISOString().slice(0, 10);
  return base + monthsDiff(fr, hoy);
}

function validarNumerico(n) {
  if (n === null || n === undefined || n === '') return true;
  return Number.isFinite(Number(n)) && Number(n) >= 0 && Number.isInteger(Number(n));
}

function guardarHoja() {
  errores.value = [];
  mensajeExito.value = '';

  const f = formHoja.value;

  // Obligatorios principales
  if (!String(f.cc_no || '').trim()) errores.value.push('Capture el CC No. (folio de hoja de control).');
  if (!String(f.prop.curp || '').trim()) errores.value.push('Capture la CURP del propietario.');
  if (!String(f.upp.clave || '').trim()) errores.value.push('Capture la clave UPP / PSG.');
  if (!String(f.prueba.motivo || '').trim()) errores.value.push('Seleccione el motivo de la prueba.');
  if (!String(f.prueba.fin_zootecnico || '').trim()) errores.value.push('Seleccione el fin zootécnico.');
  if (!String(f.prueba.tipo_identificacion || '').trim()) errores.value.push('Seleccione el tipo de identificación.');

  if (f.prueba.tipo_identificacion === 'Otro' && !String(f.prueba.tipo_identificacion_otro || '').trim()) {
    errores.value.push('En “Tipo de identificación = Otro”, debe especificar el texto.');
  }

  // Validación numérica resumen
  const rs = f.resumen;
  const checks = [
    rs.negativos.tb, rs.negativos.br,
    rs.reactores.tb, rs.reactores.br,
    rs.total_probados.tb, rs.total_probados.br,
    rs.total_hato.tb, rs.total_hato.br
  ];
  if (checks.some(x => !validarNumerico(x))) {
    errores.value.push('En el Resumen TB/BR solo se permiten números enteros (>=0).');
  }

  // Sección IV: al menos 1 animal
  if (!Array.isArray(f.animales) || f.animales.length === 0) {
    errores.value.push('Agregue al menos un animal (arete).');
  } else {
    // validar filas
    for (let i = 0; i < f.animales.length; i++) {
      const a = f.animales[i];
      if (!String(a.arete || '').trim()) errores.value.push(`Fila ${i + 1}: capture arete.`);
      if (!String(a.especie || '').trim()) errores.value.push(`Fila ${i + 1}: seleccione especie.`);
      if (!String(a.sexo || '').trim()) errores.value.push(`Fila ${i + 1}: seleccione sexo (H/M).`);

      const em = a.edad_meses_registro;
      if (em === null || em === '' || !Number.isInteger(Number(em)) || Number(em) < 0) {
        errores.value.push(`Fila ${i + 1}: edad debe ser número entero (meses).`);
      }
      // I (RA/IN/IC) es opcional, no se valida como obligatorio
    }

    // duplicados de arete dentro de la hoja
    const aretes = f.animales.map(x => String(x.arete || '').trim()).filter(Boolean);
    const set = new Set(aretes.map(x => x.toLowerCase()));
    if (set.size !== aretes.length) errores.value.push('Hay aretes duplicados dentro de la hoja.');
  }

  // Duplicado CC No.
  const cc = String(f.cc_no).trim();
  const existe = hojasDemo.value.some(h => h.mvz_user_id === mvzUserId && String(h.cc_no || '').trim() === cc);
  if (existe) errores.value.push('Ese CC No. ya existe (registrado por usted).');

  if (errores.value.length) return;

  // DEMO: alta/actualización propietario si no existe
  const curp = String(f.prop.curp || '').trim().toUpperCase();
  const pExist = buscarPropPorCurp(curp);
  if (!pExist) {
    propietariosDemo.value.push({
      id: Date.now(),
      mvz_user_id: mvzUserId,
      curp,
      apellido_paterno: String(f.prop.apellido_paterno || '').trim(),
      apellido_materno: String(f.prop.apellido_materno || '').trim(),
      nombres: String(f.prop.nombres || '').trim(),
      telefono: String(f.prop.telefono || '').trim(),
      domicilio: String(f.prop.domicilio || '').trim(),
      municipio: String(f.prop.municipio || '').trim(),
      localidad: String(f.prop.localidad || '').trim(),
      cp: String(f.prop.cp || '').trim(),
      estado: String(f.prop.estado || '').trim(),
      correo: String(f.prop.correo || '').trim()
    });
  }

  // DEMO: alta UPP si no existe
  const clave = String(f.upp.clave || '').trim().toUpperCase();
  const uExist = buscarUppPorClave(clave);
  if (!uExist) {
    uppDemo.value.push({
      id: Date.now() + 1,
      mvz_user_id: mvzUserId,
      clave,
      nombre_predio: String(f.upp.nombre_predio || '').trim(),
      latitud: String(f.upp.latitud || '').trim(),
      longitud: String(f.upp.longitud || '').trim(),
      domicilio: String(f.upp.domicilio || '').trim(),
      municipio: String(f.upp.municipio || '').trim(),
      localidad: String(f.upp.localidad || '').trim(),
      cp: String(f.upp.cp || '').trim(),
      estado: String(f.upp.estado || '').trim()
    });
  }

  // Guardar hoja
  hojasDemo.value.push({
    id: Date.now() + 10,
    mvz_user_id: mvzUserId,
    ...JSON.parse(JSON.stringify(f)),
    cc_no: cc,
    prop: { ...f.prop, curp },
    upp: { ...f.upp, clave },
    numero_caso_asignado: false,
    numero_caso: ''
  });

  mensajeExito.value = 'Hoja registrada.';
  limpiarFormHoja();
}

/* ===================== Consultar ===================== */
const filtrosCons = ref({
  cc_no: '',
  upp: '',
  curp: '',
  con_caso: '',
  fecha_inicio: '',
  fecha_fin: ''
});

const buscadoCons = ref(false);
const detalleHoja = ref(null);

function buscarConsultar() {
  buscadoCons.value = true;
  errores.value = [];
  mensajeExito.value = '';
}

function limpiarConsultar() {
  filtrosCons.value = { cc_no: '', upp: '', curp: '', con_caso: '', fecha_inicio: '', fecha_fin: '' };
  buscadoCons.value = false;
  detalleHoja.value = null;
  errores.value = [];
  mensajeExito.value = '';
}

const hojasConsultadas = computed(() => {
  if (!buscadoCons.value) return [];
  const f = filtrosCons.value;

  const cc = f.cc_no.trim();
  const upp = f.upp.trim().toLowerCase();
  const curp = f.curp.trim().toUpperCase();
  const conCaso = f.con_caso;
  const ini = f.fecha_inicio;
  const fin = f.fecha_fin;

  return hojasDemo.value
    .filter(h => h.mvz_user_id === mvzUserId)
    .filter(h => (cc ? String(h.cc_no || '').includes(cc) : true))
    .filter(h => (upp ? String(h.upp?.clave || '').toLowerCase().includes(upp) : true))
    .filter(h => (curp ? String(h.prop?.curp || '').toUpperCase().includes(curp) : true))
    .filter(h => {
      if (!conCaso) return true;
      return conCaso === 'si' ? h.numero_caso_asignado : !h.numero_caso_asignado;
    })
    .filter(h => {
      let ok = true;
      if (ini) ok = ok && String(h.tb?.fecha_inyeccion || '') >= ini;
      if (fin) ok = ok && String(h.tb?.fecha_inyeccion || '') <= fin;
      return ok;
    });
});

function verDetalle(h) {
  detalleHoja.value = JSON.parse(JSON.stringify(h));
}

/* ===================== Editar ===================== */
const hojaEditando = ref(null);

function abrirEdicionHoja(h) {
  errores.value = [];
  mensajeExito.value = '';
  if (h.numero_caso_asignado) return errores.value.push('La hoja ya tiene número de caso. No es editable.');
  hojaEditando.value = JSON.parse(JSON.stringify(h));
  hojaEditando.value.animales = hojaEditando.value.animales || [];
  selectedAction.value = 'editar';
}

function cancelarEdicionHoja() {
  hojaEditando.value = null;
  selectedAction.value = 'consultar';
}

function agregarFilaAnimalEdicion() {
  if (!hojaEditando.value) return;
  hojaEditando.value.animales.push(nuevoAnimal());
}

function quitarFilaAnimalEdicion(idx) {
  if (!hojaEditando.value) return;
  hojaEditando.value.animales.splice(idx, 1);
}

function guardarEdicionHoja() {
  errores.value = [];
  mensajeExito.value = '';
  if (!hojaEditando.value) return errores.value.push('No hay hoja seleccionada.');
  if (hojaEditando.value.numero_caso_asignado) return errores.value.push('La hoja ya tiene número de caso. No es editable.');

  if (!String(hojaEditando.value.cc_no || '').trim()) errores.value.push('CC No. es obligatorio.');
  if (!String(hojaEditando.value.prop?.curp || '').trim()) errores.value.push('CURP es obligatoria.');
  if (!String(hojaEditando.value.upp?.clave || '').trim()) errores.value.push('Clave UPP es obligatoria.');
  if (!String(hojaEditando.value.prueba?.motivo || '').trim()) errores.value.push('Motivo es obligatorio.');
  if (!String(hojaEditando.value.prueba?.fin_zootecnico || '').trim()) errores.value.push('Fin zootécnico es obligatorio.');

  // validar animales
  const list = hojaEditando.value.animales || [];
  if (list.length === 0) errores.value.push('Agregue al menos un animal.');
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (!String(a.arete || '').trim()) errores.value.push(`Fila ${i + 1}: capture arete.`);
    if (!String(a.especie || '').trim()) errores.value.push(`Fila ${i + 1}: seleccione especie.`);
    if (!String(a.sexo || '').trim()) errores.value.push(`Fila ${i + 1}: seleccione sexo.`);
    const em = a.edad_meses_registro;
    if (em === null || em === '' || !Number.isInteger(Number(em)) || Number(em) < 0) {
      errores.value.push(`Fila ${i + 1}: edad debe ser entero (meses).`);
    }
  }
  const aretes = list.map(x => String(x.arete || '').trim()).filter(Boolean);
  const set = new Set(aretes.map(x => x.toLowerCase()));
  if (set.size !== aretes.length) errores.value.push('Hay aretes duplicados dentro de la hoja.');

  if (errores.value.length) return;

  // evitar duplicar CC con otro registro
  const cc = String(hojaEditando.value.cc_no).trim();
  const existe = hojasDemo.value.some(h =>
    h.mvz_user_id === mvzUserId &&
    h.id !== hojaEditando.value.id &&
    String(h.cc_no || '').trim() === cc
  );
  if (existe) return errores.value.push('Ya existe otra hoja con ese CC No. (registrada por usted).');

  const idx = hojasDemo.value.findIndex(x => x.id === hojaEditando.value.id);
  if (idx === -1) return errores.value.push('No se encontró la hoja para actualizar.');

  hojasDemo.value[idx] = JSON.parse(JSON.stringify(hojaEditando.value));
  mensajeExito.value = 'Hoja actualizada (DEMO).';
  hojaEditando.value = null;
  selectedAction.value = 'consultar';
}
</script>

<style scoped>
/* Header acciones */
.modulo-acciones { margin-bottom: 20px; }
.modulo-acciones-titulo { display:block; font-size:14px; margin-bottom:8px; color:#333; font-weight:900; }
.modulo-acciones-botones { display:flex; flex-wrap:wrap; gap:6px; }

/* Botones */
.sistpec-btn-accion{
  border:none; padding:8px 14px; font-size:12px; font-weight:900;
  text-transform:uppercase; border-radius:4px; cursor:pointer;
  background:#2f6b32; color:#fff; letter-spacing:0.4px;
}
.sistpec-btn-accion.active{ background:#244e26; }

/* Contenido */
.modulo-contenido { margin-top: 10px; }
.subtitulo { font-size:18px; margin:10px 0 15px; color:#333; }
.subtitulo-secundario { font-size:16px; margin:16px 0 10px; color:#333; }

/* Info */
.sistpec-info-box{
  margin-top:10px; padding:10px 14px; border-radius:4px;
  background:#e1f3e1; border:1px solid #c3e6c3;
}
.sistpec-info-text{ margin:0; font-size:13px; color:#225522; }

/* Alertas */
.modulo-alert{ margin-bottom:12px; padding:10px 14px; border-radius:4px; font-size:13px; }
.modulo-alert--error{ background:#fbeaea; border:1px solid #f5c2c2; color:#7a1f1f; }
.modulo-alert--success{ background:#e1f3e1; border:1px solid #c3e6c3; color:#225522; }

/* Cards / secciones */
.card-seccion{
  border:1px solid #e5e5e5;
  border-radius:6px;
  padding:12px 12px 6px;
  background:#fff;
}
.seccion-titulo{
  font-weight:900;
  color:#333;
  margin-bottom:10px;
  border-left:4px solid #7a061e;
  padding-left:10px;
}

/* Form */
.sistpec-form{ display:flex; flex-direction:column; gap:16px; }
.sistpec-form-row{ display:grid; gap:12px; }
.row-4{ grid-template-columns: repeat(4, minmax(0, 1fr)); }

.sistpec-form-group{ display:flex; flex-direction:column; gap:4px; min-width:0; }
.sistpec-form-group label{ font-size:13px; font-weight:900; color:#444; }
.sistpec-form-group input,
.sistpec-form-group select{
  padding:8px 10px; border-radius:4px; border:1px solid #ccc;
  font-size:14px; outline:none; min-width:0;
}
.sistpec-form-group input:focus,
.sistpec-form-group select:focus{
  border-color:#2f6b32;
  box-shadow:0 0 0 1px rgba(47, 107, 50, 0.15);
}

.hint{ font-size:12px; color:#666; margin-top:2px; }
.hint.ok{ color:#225522; font-weight:700; }

/* radios */
.radio-row{ display:flex; gap:14px; flex-wrap:wrap; padding:6px 0 2px; }
.radio-col{ display:flex; flex-direction:column; gap:8px; padding:6px 0 2px; }
.radio-item{ display:flex; align-items:center; gap:8px; font-size:13px; color:#333; }

/* inline actions */
.inline-actions{ display:flex; gap:8px; flex-wrap:wrap; }

/* Resumen */
.resumen-box{
  margin-top:8px;
  padding:10px;
  border:1px dashed #cfcfcf;
  border-radius:6px;
  background:#fafafa;
}
.resumen-titulo{
  font-weight:900;
  margin-bottom:8px;
  color:#333;
}

.tb-opcional{
  margin-top:12px;
  padding:10px;
  border:1px dashed #cfcfcf;
  border-radius:6px;
  background:#fff;
}

/* Actions */
.sistpec-form-actions{ display:flex; justify-content:flex-end; gap:8px; flex-wrap:wrap; }

.sistpec-btn-primary{
  background:#2f6b32; color:#fff; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:900; cursor:pointer;
}
.sistpec-btn-primary:hover{ background:#244e26; }
.sistpec-btn-primary:disabled{ opacity:.55; cursor:not-allowed; }

.sistpec-btn-secondary{
  background:#e0e0e0; color:#333; border:none;
  padding:8px 18px; border-radius:4px;
  font-size:13px; font-weight:900; cursor:pointer;
}
.sistpec-btn-secondary:hover{ background:#d0d0d0; }

.sistpec-btn-danger{
  background:#7a061e; color:#fff; border:none;
  padding:6px 14px; border-radius:4px;
  font-size:12px; font-weight:900; cursor:pointer;
}
.sistpec-btn-danger:hover{ background:#5a0416; }
.sistpec-btn-sm{ padding:5px 10px; font-size:11px; }

/* filtros grid */
.sistpec-search-bar{
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap:12px;
  margin-bottom:16px;
  align-items:end;
}
.fechas-bar{
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items:end;
}
.fechas-bar .sistpec-search-actions{
  grid-column: 2 / 3;
  justify-self: end;
  align-self: end;
  display:flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}
.fechas-bar .sistpec-search-actions .sistpec-btn-primary,
.fechas-bar .sistpec-search-actions .sistpec-btn-secondary{
  width: 220px;
}

/* tabla */
.sistpec-table-wrapper{ width:100%; overflow-x:auto; }
.sistpec-table{ width:100%; border-collapse:collapse; font-size:13px; }
.sistpec-table thead{ background:#7a061e; color:#fff; }
.sistpec-table th, .sistpec-table td{ padding:8px 10px; border:1px solid #ddd; text-align:left; vertical-align:top; }
.sistpec-table tbody tr:nth-child(even){ background:#fafafa; }
.sin-resultados{ text-align:center; color:#777; }

.input-inline{
  width:100%;
  padding:8px 10px;
  border-radius:4px;
  border:1px solid #ccc;
  font-size:14px;
  outline:none;
  min-width:0;
}

.sistpec-edit-panel{ margin-top:20px; padding-top:10px; border-top:1px dashed #ccc; }

.badge{ display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:900; }
.badge--activo{ background:#e1f3e1; color:#225522; border:1px solid #c3e6c3; }
.badge--inactivo{ background:#fbeaea; color:#7a1f1f; border:1px solid #f5c2c2; }

.detalle-grid{
  display:grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap:8px 12px;
  font-size:13px;
}
.lbl{ font-weight:900; color:#444; }

.vigencia-sep{ font-size:14px; color:#666; }

.acciones{ display:flex; gap:6px; flex-wrap:wrap; }

.edad-box{ display:flex; flex-direction:column; gap:4px; }

/* responsive */
@media (max-width: 768px) {
  .sistpec-search-bar { grid-template-columns: 1fr; }
  .fechas-bar { grid-template-columns: 1fr; }
  .fechas-bar .sistpec-search-actions{
    grid-column: auto;
    justify-self: stretch;
    align-self: stretch;
    margin-top: 6px;
  }
  .fechas-bar .sistpec-search-actions .sistpec-btn-primary,
  .fechas-bar .sistpec-search-actions .sistpec-btn-secondary{
    width: 100%;
  }

  .row-4 { grid-template-columns: 1fr; }
  .detalle-grid { grid-template-columns: 1fr; }
}
</style>
