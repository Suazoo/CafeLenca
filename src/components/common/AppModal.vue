<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({ abierto: Boolean, titulo: String })
const emit = defineEmits(['cerrar'])

function alTeclear(e) {
  if (e.key === 'Escape' && props.abierto) emit('cerrar')
}
onMounted(() => window.addEventListener('keydown', alTeclear))
onBeforeUnmount(() => window.removeEventListener('keydown', alTeclear))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="abierto" class="overlay" @click.self="emit('cerrar')">
        <div class="modal" role="dialog" aria-modal="true" :aria-label="titulo">
          <header>
            <h3>{{ titulo }}</h3>
            <button class="cerrar" aria-label="Cerrar" @click="emit('cerrar')">
              <X :size="20" />
            </button>
          </header>
          <div class="cuerpo"><slot /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
}
.modal {
  width: min(560px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  background: var(--surface);
  color: var(--texto);
  border: 1px solid var(--borde);
  border-radius: var(--radio);
  box-shadow: var(--sombra);
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--borde);
}
h3 { margin: 0; font-size: 1.1rem; }
.cerrar {
  display: grid;
  place-items: center;
  background: none;
  border: none;
  color: var(--texto-suave);
  cursor: pointer;
  padding: 0.25rem;
}
.cuerpo { padding: 1.25rem; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: scale(0.96) translateY(8px); }
</style>