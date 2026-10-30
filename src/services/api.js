import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000, // Render puede tardar ~50 s en despertar
  headers: { 'Content-Type': 'application/json' },
})

function extraerMensaje(error) {
  if (error.code === 'ECONNABORTED') {
    return 'El servidor tardó demasiado en responder. Intenta de nuevo.'
  }
  if (!error.response) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión.'
  }
  const detail = error.response.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => `${d.loc?.slice(1).join('.')}: ${d.msg}`).join(' | ')
  }
  return `Error ${error.response.status}`
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage = extraerMensaje(error)
    return Promise.reject(error)
  },
)

export default api