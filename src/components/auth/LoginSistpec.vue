<template>
  <main id="loginMain">
    <section id="login">
      <div class="titulo-sistema">
        <h1>CEFPP</h1>
        <h2>VERACRUZ</h2>
      </div>

      <div class="nombre-sistema">
        <h4>Sistema de Dictámenes en Especies Pecuarias (SISTPEC)</h4>
      </div>

      <div class="inicio-sesion">
        <h2>Iniciar Sesión</h2>
      </div>

      <form @submit.prevent="$emit('submit')">
        <input
          type="text"
          id="usuario"
          placeholder="Nombre de Usuario"
          :value="usuario"
          @input="$emit('update:usuario', $event.target.value)"
          required
        />
        <input
          type="password"
          id="password"
          placeholder="Contraseña"
          :value="password"
          @input="$emit('update:password', $event.target.value)"
          required
        />
        <button type="submit">
          Entrar
        </button>
      </form>

      <div class="version-sistema">
        <h3>Versión 1.0</h3>
      </div>
    </section>
  </main>
</template>

<script setup>
defineProps({
  usuario: { type: String, default: '' },
  password: { type: String, default: '' }
});

defineEmits(['update:usuario', 'update:password', 'submit']);
</script>

