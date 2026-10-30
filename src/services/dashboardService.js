import api from './api'

export const obtenerResumen = () => api.get('/dashboard/resumen').then((r) => r.data)
