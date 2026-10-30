import api from './api'

export const listarReservas = () => api.get('/reservas/').then((r) => r.data)
export const crearReserva = (datos) => api.post('/reservas/', datos).then((r) => r.data)
