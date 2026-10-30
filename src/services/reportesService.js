import api from './api'

export const obtenerReporteVentas = (desde, hasta) =>
  api.get('/reportes/ventas', { params: { desde: desde || undefined, hasta: hasta || undefined } }).then((r) => r.data)
