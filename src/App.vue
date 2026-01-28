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
// ==================== EMPIEZAN CAMBIOS ====================
// Se agregó el import del servicio de autenticación
// ==================== EMPIEZAN CAMBIOS ====================
import { ref, computed } from 'vue';
import SistpecNavbar from './components/layout/SistpecNavbar.vue';
import LoginSistpec from './components/auth/LoginSistpec.vue';
import WelcomePanel from './components/panel/WelcomePanel.vue';
import Modulo from './components/modulos/Modulo.vue';
import { authService } from './services/api';
// ==================== TERMINAN CAMBIOS ====================

// ===== Configuración de menús por rol =====
const menusPorRol = {
  ADMIN: [
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
    { texto: 'Hoja de reporte', modulo: 'mvzAdminHojaReporte' },
    { texto: 'Propietarios', modulo: 'mvzAdminPropietario' },
    { texto: 'UPP', modulo: 'mvzAdminUpp' },
    { texto: 'Número de caso', modulo: 'mvzAdminNumCaso' },
    { texto: 'Hojas de resultados', modulo: 'mvzAdminHojaResultados' },
    { texto: 'Cerrar Sesión', modulo: 'cerrarSesion', especial: true }
  ]
};

// ==================== EMPIEZAN CAMBIOS ====================
// Se eliminó usuariosDemo y se agregó currentUser para almacenar datos del usuario autenticado
// ==================== EMPIEZAN CAMBIOS ====================

// Estado
const formUsuario    = ref('');
const formPassword   = ref('');
const isLoggedIn     = ref(false);
const currentRole    = ref(null);
const currentUser    = ref(null); // Nuevo: datos del usuario autenticado
const menuOpen       = ref(false);
const selectedModule = ref(null);
// ==================== TERMINAN CAMBIOS ====================

// Menú actual
const currentMenu = computed(() => menusPorRol[currentRole.value] || []);

// Título del módulo actual
const currentModuleTitle = computed(() => {
  if (!selectedModule.value) return '';
  const menu = currentMenu.value.find(item => item.modulo === selectedModule.value);
  return menu ? menu.texto : selectedModule.value;
});

// ==================== EMPIEZAN CAMBIOS ====================
// Función login modificada para usar el servicio de autenticación del backend
// ==================== EMPIEZAN CAMBIOS ====================
async function login() {
  const usuario = formUsuario.value.trim();
  const pwd     = formPassword.value;

  if (!usuario || !pwd) {
    alert('Por favor ingrese usuario y contraseña');
    return;
  }

  try {
    // Llamada al backend
    const response = await authService.login({
      nombre_usuario: usuario,
      password: pwd
    });

    // Si el login es exitoso
    if (response.data.success && response.data.usuario) {
      const userData = response.data.usuario;

      currentUser.value     = userData;
      currentRole.value     = userData.rol;
      isLoggedIn.value      = true;
      menuOpen.value        = false;
      formPassword.value    = '';
      selectedModule.value  = null;

      console.log('Login exitoso:', userData);
    } else {
      alert('Error de autenticación');
    }
  } catch (error) {
    console.error('Error en login:', error);

    // Manejo de errores específicos
    if (error.response) {
      // El servidor respondió con un código de error
      const status = error.response.status;
      const detail = error.response.data?.detail || 'Error desconocido';

      if (status === 401) {
        alert('Usuario o contraseña incorrectos');
      } else if (status === 403) {
        alert(detail); // Usuario inactivo o vigencia expirada
      } else {
        alert(`Error: ${detail}`);
      }
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      alert('No se pudo conectar con el servidor. Verifique que el backend esté ejecutándose.');
    } else {
      // Algo pasó al configurar la petición
      alert('Error al procesar la solicitud');
    }
  }
}
// ==================== TERMINAN CAMBIOS ====================

// ==================== EMPIEZAN CAMBIOS ====================
// Función logout modificada para llamar al backend (opcional)
// ==================== EMPIEZAN CAMBIOS ====================
async function logout() {
  try {
    // Llamada opcional al backend para cerrar sesión
    await authService.logout();
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  } finally {
    // Limpiar estado local siempre
    isLoggedIn.value     = false;
    currentRole.value    = null;
    currentUser.value    = null;
    formUsuario.value    = '';
    formPassword.value   = '';
    menuOpen.value       = false;
    selectedModule.value = null;
  }
}
// ==================== TERMINAN CAMBIOS ====================

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
