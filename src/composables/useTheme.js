import { ref } from 'vue'

const CLAVE = 'cafe-lenca-tema'

function temaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado === 'dark' || guardado === 'light') return guardado
  } catch {
    // localStorage no disponible: se usa la preferencia del sistema
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Estado a nivel de módulo: compartido por todos los componentes
const tema = ref(temaInicial())

function aplicar() {
  document.documentElement.dataset.theme = tema.value
}
aplicar()

export function useTheme() {
  function alternar() {
    tema.value = tema.value === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(CLAVE, tema.value)
    } catch {
      // se ignora: el tema funciona igual en esta sesión
    }
    aplicar()
  }
  return { tema, alternar }
}