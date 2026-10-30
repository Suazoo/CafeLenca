<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppTopbar from './components/layout/AppTopbar.vue'
import AppFooter from './components/layout/AppFooter.vue'
import ToastHost from './components/common/ToastHost.vue'

const route = useRoute()
const menuAbierto = ref(false)

watch(() => route.fullPath, () => {
  menuAbierto.value = false
})
</script>

<template>
  <div class="layout">
    <AppSidebar :abierto="menuAbierto" @cerrar="menuAbierto = false" />
    <div class="contenido">
      <AppTopbar :titulo="route.meta.titulo" @toggle-menu="menuAbierto = !menuAbierto" />
      <main class="pagina">
        <RouterView />
      </main>
      <AppFooter />
    </div>
  </div>
  <ToastHost />
</template>


<style scoped>
.contenido {
  margin-left: var(--sidebar-ancho);
  min-width: 0;
}
.pagina {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

@media (max-width: 767px) {
  .pagina {
    padding: 1rem;
  }
}
</style>