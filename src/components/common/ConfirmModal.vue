<script setup>
import AppModal from './AppModal.vue'

defineProps({
  abierto: Boolean,
  titulo: { type: String, default: 'Confirmar' },
  mensaje: String,
  textoConfirmar: { type: String, default: 'Eliminar' },
  cargando: Boolean,
})
defineEmits(['confirmar', 'cancelar'])
</script>

<template>
  <AppModal :abierto="abierto" :titulo="titulo" @cerrar="$emit('cancelar')">
    <p class="mensaje">{{ mensaje }}</p>
    <div class="acciones-modal">
      <button class="btn" :disabled="cargando" @click="$emit('cancelar')">Cancelar</button>
      <button class="btn btn-peligro" :disabled="cargando" @click="$emit('confirmar')">
        {{ cargando ? 'Procesando...' : textoConfirmar }}
      </button>
    </div>
  </AppModal>
</template>

<style scoped>
.mensaje { margin: 0; line-height: 1.5; }
</style>