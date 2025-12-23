<template>
  <section
    v-if="panel.id"
    :id="panel.id"
  >
    <img
      src="/img/logo.png"
      alt="CEFPP Veracruz"
      class="logo-panel"
    />
    <h2>{{ panel.titulo }}</h2>
    <h3>Seleccione la actividad que desea realizar</h3>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  rol: { type: String, required: true }
});

const panel = computed(() => {
  switch (props.rol) {
    case 'administrador':
      return {
        id: 'adminPanel',
        titulo: 'Administrador - SISTPEC'
      };
    case 'responsableLaboratorio':
      return {
        id: 'responsablelabPanel',
        titulo: 'Responsable de laboratorio - SISTPEC'
      };
    case 'recepcionista':
      return {
        id: 'recepcionistaPanel',
        titulo: 'Recepcionista - SISTPEC'
      };
    case 'coordinador':
      return {
        id: 'coordinadorPanel',
        titulo: 'Coordinador - SISTPEC'
      };
    case 'mvzAutorizado':
      return {
        id: 'mvzPanel',
        titulo: 'MVZ - SISTPEC'
      };
    default:
      return {
        id: '',
        titulo: ''
      };
  }
});
</script>
