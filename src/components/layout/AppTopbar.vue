<script setup>
import { Menu, Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '../../composables/useTheme'

defineProps({ titulo: String })
defineEmits(['toggle-menu'])

const { tema, alternar } = useTheme()
</script>

<template>
  <header class="topbar">
    <button class="icono btn-menu" aria-label="Abrir menú" @click="$emit('toggle-menu')">
      <Menu :size="22" />
    </button>
    <h1>{{ titulo }}</h1>
    <button
      class="icono"
      :aria-label="tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      :title="tema === 'dark' ? 'Modo claro' : 'Modo oscuro'"
      @click="alternar"
    >
      <Sun v-if="tema === 'dark'" :size="20" />
      <Moon v-else :size="20" />
    </button>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 64px;
  padding: 0 1.5rem;
  background: color-mix(in srgb, var(--surface) 85%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--borde);
  position: sticky;
  top: 0;
  z-index: 10;
}
h1 {
  margin: 0;
  margin-right: auto;
  font-size: 1.3rem;
  color: var(--texto);
}
.icono {
  display: inline-grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--borde);
  background: var(--surface-2);
  color: var(--acento-2);
  cursor: pointer;
  transition: transform 0.15s ease;
}
.icono:hover {
  transform: translateY(-1px);
}
.btn-menu {
  display: none;
}

@media (max-width: 767px) {
  .topbar {
    padding: 0 1rem;
  }
  .btn-menu {
    display: inline-grid;
  }
}
</style>