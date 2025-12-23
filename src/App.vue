<template>
  <v-app>
    <!-- NAVBAR -->
    <SistpecNavbar
      :is-logged-in="isLoggedIn"
      :current-menu="currentMenu"
      :menu-open="menuOpen"
      @toggle-menu="toggleNavbarMenu"
      @menu-click="handleMenuClick"
    />

    <!-- CONTENIDO PRINCIPAL -->
    <div class="main-content">
      <!-- LOGIN -->
      <LoginSistpec
        v-if="!isLoggedIn"
        v-model:usuario="formUsuario"
        v-model:password="formPassword"
        @submit="login"
      />

      <!-- PANEL DE BIENVENIDA POR ROL -->
      <WelcomePanel
        v-if="isLoggedIn && currentRole"
        :rol="currentRole"
      />

      <!-- MÓDULO SELECCIONADO -->
      <Modulo
        v-if="isLoggedIn && selectedModule"
        :titulo="currentModuleTitle"
        :codigo="selectedModule"
        :rol="currentRole"
      />
    </div>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';
import SistpecNavbar from './components/layout/SistpecNavbar.vue';
import LoginSistpec from './components/auth/LoginSistpec.vue';
import WelcomePanel from './components/panel/WelcomePanel.vue';
import Modulo from './components/modulos/Modulo.vue';

// ===== Configuración de menús por rol =====
const menusPorRol = {
  administrador: [
    { texto: 'Usuarios', modulo: 'adminAdministrarUsuarios' },
    { texto: 'Propietarios', modulo: 'adminAdministrarPropietarios' },
    { texto: 'UPP', modulo: 'adminAdministrarUPP' },
    { texto: 'Muestras', modulo: 'adminAdministrarMuestras' },
    { texto: 'Resultados', modulo: 'adminAdministrarResultados' },
    { texto: 'Cerrar Sesión', modulo: 'cerrarSesion', especial: true }
  ],
  responsableLaboratorio: [
    { texto: 'Número de caso', modulo: 'resplabAdminNumdeCaso' },
    { texto: 'Muestras', modulo: 'resplabAdminMuestra' },
    { texto: 'Resultados', modulo: 'resplabAdminResultados' },
    { texto: 'Hojas de resultados', modulo: 'resplabAdminHojaResultados' },
    { texto: 'Hoja de reporte', modulo: 'resplabAdminHojaReporte' },
    { texto: 'Cerrar Sesión', modulo: 'cerrarSesion', especial: true }
  ],
  recepcionista: [
    { texto: 'Número de caso', modulo: 'recepAdminNumCaso' },
    { texto: 'Muestras', modulo: 'recepAdminMuestras' },
    { texto: 'Resultados', modulo: 'recepAdminResultados' },
    { texto: 'Hojas de resultados', modulo: 'recepAdminHojasResultados' },
    { texto: 'Hoja de reporte', modulo: 'recepAdminHojaReporte' },
    { texto: 'Cerrar Sesión', modulo: 'cerrarSesion', especial: true }
  ],
  coordinador: [
  { texto: 'UPP', modulo: 'coordAdministrarUPP' },
  { texto: 'Resultados', modulo: 'coordAdministrarResultados' },
  { texto: 'Hoja de reporte', modulo: 'coordAdministrarHojaReporte' },
  { texto: 'Actividad de campo', modulo: 'coordAdministrarActividadCampo' },
  { texto: 'Cerrar Sesión', modulo: 'cerrarSesion', especial: true }
  ],

  mvzAutorizado: [
    { texto: 'hoja de reporte', modulo: 'mvzAdminHojaReporte' },
    { texto: 'Propietarios', modulo: 'mvzAdminPropietario' },
    { texto: 'UPP', modulo: 'mvzAdminUpp' },
    { texto: 'Número de caso', modulo: 'mvzAdminNumCaso' },
    { texto: 'Hojas de resultados', modulo: 'mvzAdminHojaResultados' },
    { texto: 'Cerrar Sesión', modulo: 'cerrarSesion', especial: true }
  ]
};

// Usuarios demo
const usuariosDemo = {
  admin:  { password: '1234', rol: 'administrador' },
  resplab:{ password: '1234', rol: 'responsableLaboratorio' },
  recep:  { password: 'abcd', rol: 'recepcionista' },
  coord:  { password: 'efgh', rol: 'coordinador' },
  mvz:    { password: '0000', rol: 'mvzAutorizado' }
};

// Estado
const formUsuario    = ref('');
const formPassword   = ref('');
const isLoggedIn     = ref(false);
const currentRole    = ref(null);
const menuOpen       = ref(false);
const selectedModule = ref(null);

// Menú actual
const currentMenu = computed(() => menusPorRol[currentRole.value] || []);

// Título del módulo actual
const currentModuleTitle = computed(() => {
  if (!selectedModule.value) return '';
  const menu = currentMenu.value.find(item => item.modulo === selectedModule.value);
  return menu ? menu.texto : selectedModule.value;
});

// Métodos
function login() {
  const usuario = formUsuario.value.trim();
  const pwd     = formPassword.value;

  const data = usuariosDemo[usuario];
  if (data && data.password === pwd) {
    currentRole.value     = data.rol;
    isLoggedIn.value      = true;
    menuOpen.value        = false;
    formPassword.value    = '';
    selectedModule.value  = null;
  } else {
    alert('Usuario o contraseña incorrectos');
  }
}

function logout() {
  isLoggedIn.value     = false;
  currentRole.value    = null;
  formUsuario.value    = '';
  formPassword.value   = '';
  menuOpen.value       = false;
  selectedModule.value = null;
}

function toggleNavbarMenu() {
  menuOpen.value = !menuOpen.value;
}

function handleMenuClick(item) {
  if (item.especial && item.modulo === 'cerrarSesion') {
    logout();
  } else {
    abrirModulo(item.modulo);
  }
}

function abrirModulo(nombreModulo) {
  selectedModule.value = nombreModulo;
}
</script>
