import api from './api'

export const checkHealth = () => api.get('/health').then((r) => r.data)
export const checkHealthDb = () => api.get('/health/db').then((r) => r.data)