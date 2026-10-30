import api from './api'

export const listarProductos = () => api.get('/productos/').then((r) => r.data)
export const listarProductosDisponibles = () => api.get('/productos/disponibles').then((r) => r.data)
export const crearProducto = (datos) => api.post('/productos/', datos).then((r) => r.data)
export const actualizarProducto = (id, datos) => api.patch(`/productos/${id}`, datos).then((r) => r.data)
export const obtenerProductoDisponible = (id) => api.get(`/productos/${id}`).then((r) => r.data)