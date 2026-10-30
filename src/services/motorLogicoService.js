import api from './api'

export const obtenerReglas = () => api.get('/motor-logico/reglas').then((r) => r.data)
export const obtenerRecomendaciones = (limite = 5) =>
  api.get('/motor-logico/recomendaciones', { params: { limite } }).then((r) => r.data)
export const obtenerRecomendacionIA = (solicitud, limite = 5) =>
  api.post('/motor-logico/ia', { solicitud, limite }).then((r) => r.data)
export const convertirSolicitudEnPedido = (solicitud, limite = 10) =>
  api.post('/motor-logico/ia/pedido', { solicitud, limite }).then((r) => r.data)
export const resumirVentasConIA = (datos) =>
  api.post('/motor-logico/ia/resumen-ventas', { datos }).then((r) => r.data)
export const priorizarInventarioConIA = (datos) =>
  api.post('/motor-logico/ia/alertas-inventario', { datos }).then((r) => r.data)
