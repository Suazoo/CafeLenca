<script setup>
import { CircleCheck, CircleAlert } from 'lucide-vue-next'
import { useToast } from '../../composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.tipo">
        <CircleCheck v-if="t.tipo === 'exito'" :size="20" />
        <CircleAlert v-else :size="20" />
        <span>{{ t.mensaje }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  z-index: 100;
  max-width: min(380px, calc(100vw - 2rem));
}
.toast {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--borde);
  border-left: 5px solid var(--exito);
  box-shadow: var(--sombra);
}
.toast.error { border-left-color: var(--error); }
.toast.exito svg { color: var(--exito); }
.toast.error svg { color: var(--error); }
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>