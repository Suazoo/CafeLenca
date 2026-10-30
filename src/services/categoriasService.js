import api from './api'

export const listarCategorias = () => api.get('/categorias/').then((r) => r.data)
export const crearCategoria = (datos) => api.post('/categorias/', datos).then((r) => r.data)
