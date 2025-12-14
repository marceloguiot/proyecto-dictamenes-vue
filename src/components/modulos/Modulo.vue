<template>
  <!-- Panel que contiene cualquier módulo (usuarios, propietarios, etc.) -->
  <section
    v-if="currentComponent"
    class="modulo-panel"
    ref="moduloPanelRef"
  >
    <header class="modulo-header">
      <h2 class="modulo-title">{{ titulo }}</h2>
      <p class="modulo-subtitle">
        Seleccione la acción que desea realizar en el módulo.
      </p>
    </header>

    <!-- Se inyecta dinámicamente el módulo correspondiente -->
    <component
      :is="currentComponent"
      :codigo="codigo"
      :rol="rol"
    />
  </section>

  <!-- Fallback por si el código de módulo no existe en el mapa -->
  <section
    v-else
    class="modulo-panel modulo-panel--empty"
    ref="moduloPanelRef"
  >
    <p>No se encontró el módulo seleccionado.</p>
  </section>
</template>

<script setup>
import { computed, defineProps, ref, watch, nextTick, onMounted } from 'vue';

// =======================
// IMPORTAR LOS MÓDULOS
// =======================

// --- ADMINISTRADOR ---
import AdminUsuariosModulo from './ModulosAdministrador/AdminUsuariosModulo.vue';
import AdminPropietariosModulo from './ModulosAdministrador/AdminPropietariosModulo.vue';
import AdminUppModulo from './ModulosAdministrador/AdminUppModulo.vue';
import AdminMuestrasModulo from './ModulosAdministrador/AdminMuestrasModulo.vue';
import AdminResultadosModulo from './ModulosAdministrador/AdminResultadosModulo.vue';

// --- COORDINADOR ---
import CoordUppModulo from './ModulosCoordinador/CoordUppModulo.vue';
import CoordResultadosModulo from './ModulosCoordinador/CoordResultadosModulo.vue';
import CoordHojaReporteModulo from './ModulosCoordinador/CoordHojaReporteModulo.vue';
import CoordActividadCampoModulo from './ModulosCoordinador/CoordActividadCampoModulo.vue';

const props = defineProps({
  titulo: { type: String, required: true },
  codigo: { type: String, required: true },
  rol:    { type: String, required: true }
});

// Mapa: código de módulo -> componente Vue
const componentMap = {
  // ===== ADMINISTRADOR =====
  adminAdministrarUsuarios: AdminUsuariosModulo,
  adminAdministrarPropietarios: AdminPropietariosModulo,
  adminAdministrarUPP: AdminUppModulo,
  adminAdministrarMuestras: AdminMuestrasModulo,
  adminAdministrarResultados: AdminResultadosModulo,

  // ===== COORDINADOR =====
  coordAdministrarUPP: CoordUppModulo,
  coordAdministrarResultados: CoordResultadosModulo,
  coordAdministrarHojaReporte: CoordHojaReporteModulo,
  coordAdministrarActividadCampo: CoordActividadCampoModulo,
};

// Componente actual según el código recibido desde el navbar/panel
const currentComponent = computed(() => componentMap[props.codigo] || null);

// Referencia al panel para hacer scroll automático
const moduloPanelRef = ref(null);

function scrollAlPanel() {
  nextTick(() => {
    if (!moduloPanelRef.value) return;

    const navbarOffset = 80; // altura aproximada de la barra superior fija
    const y =
      moduloPanelRef.value.getBoundingClientRect().top +
      window.scrollY -
      navbarOffset;

    window.scrollTo({
      top: y,
      behavior: 'smooth'
    });
  });
}


onMounted(() => {
  scrollAlPanel();
});

watch(
  () => props.codigo,
  () => {
    scrollAlPanel();
  }
);

watch(
  () => currentComponent.value,
  () => {
    scrollAlPanel();
  }
);
</script>

<style scoped>
.modulo-panel {
  margin-top: 20px;
  padding: 30px;
  border-radius: 12px;
  background: linear-gradient(145deg, #ffffff 0%, #f0f4f7 100%);
  box-shadow: 0 0 12px rgba(8, 8, 8, 0.25);
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.modulo-header {
  margin-bottom: 20px;
  text-align: left;
}

.modulo-title {
  margin: 0 0 4px 0;
  font-size: 20px;
  color: #7a061e;
}

.modulo-subtitle {
  margin: 0;
  font-size: 13px;
  color: #555;
}

.modulo-panel--empty {
  text-align: center;
  font-size: 14px;
  color: #777;
}

/* Responsive */
@media (max-width: 768px) {
  .modulo-panel {
    padding: 20px 16px;
    margin-top: 16px;
  }

  .modulo-title {
    font-size: 18px;
  }
}
</style>

