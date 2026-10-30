import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { titulo: 'Dashboard' } },
  { path: '/clientes', name: 'clientes', component: () => import('../views/ClientesView.vue'), meta: { titulo: 'Clientes' } },
  { path: '/productos', name: 'productos', component: () => import('../views/ProductosView.vue'), meta: { titulo: 'Productos' } },
  { path: '/pedidos', name: 'pedidos', component: () => import('../views/PedidosView.vue'), meta: { titulo: 'Pedidos y facturación' } },
  { path: '/inventario', name: 'inventario', component: () => import('../views/InventarioView.vue'), meta: { titulo: 'Inventario' } },
  { path: '/facturacion', redirect: '/pedidos' },
  { path: '/reservas', name: 'reservas', component: () => import('../views/ReservasView.vue'), meta: { titulo: 'Reservas' } },
  { path: '/categorias', name: 'categorias', component: () => import('../views/CategoriasView.vue'), meta: { titulo: 'Categorías' } },
  { path: '/reportes', name: 'reportes', component: () => import('../views/ReportesView.vue'), meta: { titulo: 'Reportes' } },
  { path: '/motor-logico', name: 'motor-logico', component: () => import('../views/MotorLogicoView.vue'), meta: { titulo: 'Motor lógico' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})