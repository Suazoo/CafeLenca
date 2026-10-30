import { ref } from 'vue'

const toasts = ref([])
let contador = 0

function mostrar(mensaje, tipo, ms) {
  const t = { id: ++contador, mensaje, tipo }
  toasts.value.push(t)
  setTimeout(() => {
    toasts.value = toasts.value.filter((x) => x.id !== t.id)
  }, ms)
}

export function useToast() {
  return {
    toasts,
    exito: (mensaje) => mostrar(mensaje, 'exito', 3500),
    error: (mensaje) => mostrar(mensaje, 'error', 6000),
  }
}