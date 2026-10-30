import api from './api'

export const listarPedidos = () => api.get('/pedidos/').then((r) => r.data)
export const crearPedido = (datos) => api.post('/pedidos/', datos).then((r) => r.data)
export const actualizarEstadoPedido = (id, estado) =>
  api.patch(`/pedidos/${id}/estado`, { estado }).then((r) => r.data)
export const descargarFactura = (id) => api.get(`/pedidos/${id}/factura/pdf`, { responseType: 'blob' })
