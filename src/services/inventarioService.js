import api from './api'

export const listarInventario = () => api.get('/inventario/').then((r) => r.data)
export const actualizarStock = (id, cantidad) =>
  api.patch(`/inventario/${id}`, { cantidad_actual: Number(cantidad) }).then((r) => r.data)
