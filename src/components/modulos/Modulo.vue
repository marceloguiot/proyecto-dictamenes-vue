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

    <!-- Aquí se inyecta dinámicamente el módulo correspondiente -->
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
import { computed, defineProps, ref, watch, nextTick } from 'vue';

// IMPORTAMOS LOS MÓDULOS
import AdminUsuariosModulo from './AdminUsuariosModulo.vue';
import AdminPropietariosModulo from './AdminPropietariosModulo.vue';
// Más adelante podrás importar otros módulos:
// import AdminUppModulo from './AdminUppModulo.vue';
// import AdminMuestrasModulo from './AdminMuestrasModulo.vue';
// etc.

const props = defineProps({
  titulo: { type: String, required: true },
  codigo: { type: String, required: true },
  rol:    { type: String, required: true }
});

// Mapa: código de módulo -> componente Vue
const componentMap = {
  adminAdministrarUsuarios: AdminUsuariosModulo,
  adminAdministrarPropietarios: AdminPropietariosModulo
  // adminAdministrarUPP: AdminUppModulo,
  // adminAdministrarMuestras: AdminMuestrasModulo,
  // ...
};

// Componente actual según el código recibido desde el navbar/panel
const currentComponent = computed(() => componentMap[props.codigo] || null);

// Referencia al panel para hacer scroll automático
const moduloPanelRef = ref(null);

/**
 * Cuando cambia el código del módulo (es decir, cuando haces clic
 * en la barra de navegación), se hace scroll suave hasta este panel.
 */
watch(
  () => props.codigo,
  async () => {
    await nextTick(); // esperamos a que el DOM se actualice

    if (!moduloPanelRef.value) return;

    const navbarOffset = 80; // altura aproximada de la barra superior
    const y =
      moduloPanelRef.value.getBoundingClientRect().top +
      window.scrollY -
      navbarOffset;

    window.scrollTo({
      top: y,
      behavior: 'smooth'
    });
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
