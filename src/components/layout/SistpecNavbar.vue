<template>
  <nav
    class="navbar"
    id="mainNavbar"
    v-if="isLoggedIn"
  >
    <div class="navbar-container">
      <div class="navbar-brand">
        <h1>CEFPP</h1>
        <h2>VERACRUZ</h2>
      </div>

      <button class="hamburguesa" @click="$emit('toggle-menu')">
        ☰ Menú
      </button>

      <ul
        id="navbarMenu"
        :class="['navbar-menu', { active: menuOpen }]"
      >
        <li
          v-for="item in currentMenu"
          :key="item.modulo"
        >
          <a
            href="#"
            @click.prevent="$emit('menu-click', item)"
          >
            {{ item.texto }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  isLoggedIn: { type: Boolean, required: true },
  currentMenu: { type: Array, required: true },
  menuOpen: { type: Boolean, required: true }
});

defineEmits(['toggle-menu', 'menu-click']);
</script>
