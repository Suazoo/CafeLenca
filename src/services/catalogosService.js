import api from './api'

export const listarMesas = () => api.get('/catalogos/mesas').then((r) => r.data)
export const listarMetodosPago = () => api.get('/catalogos/metodos-pago').then((r) => r.data)
export const listarEmpleados = () => api.get('/catalogos/empleados').then((r) => r.data)
