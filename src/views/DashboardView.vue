<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowUpRight, CircleAlert, Coffee, CreditCard, Package, RefreshCw, ShoppingBag, Users } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { obtenerResumen } from '../services/dashboardService'
import { listarPedidos } from '../services/pedidosService'
import { listarInventario } from '../services/inventarioService'

const router = useRouter()
const cargando = ref(false)
const error = ref('')
const resumen = ref({ clientes: 0, productos: 0, pedidos: 0, reservas: 0, facturacion_total: 0 })
const pedidos = ref([])
const inventario = ref([])
const alertas = computed(() => inventario.value.filter((item) => item.stock_bajo))

const moneda = (valor) => new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(Number(valor))
const fecha = (valor) => valor ? new Date(valor).toLocaleDateString('es-HN', { day: '2-digit', month: 'short' }) : '—'
const estado = (valor) => ({ '1': 'Pendiente', '2': 'Preparando', '3': 'Listo', '4': 'Entregado', '0': 'Cancelado' }[valor] ?? valor)

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const [datos, listaPedidos, listaInventario] = await Promise.all([obtenerResumen(), listarPedidos(), listarInventario()])
    resumen.value = datos
    pedidos.value = listaPedidos
    inventario.value = listaInventario
  } catch (e) {
    error.value = e.userMessage
  } finally {
    cargando.value = false
  }
}
onMounted(cargar)
</script>

<template>
  <div class="dashboard">
    <div class="cabecera-pagina">
      <div>
        <p class="eyebrow">Resumen de operación</p>
        <h2>Buenos días, Café Lenca <span>☕</span></h2>
        <p>Esto es lo que está ocurriendo hoy en tu cafetería.</p>
      </div>
      <button class="btn" :disabled="cargando" @click="cargar"><RefreshCw :size="17" /> Actualizar</button>
    </div>

    <div v-if="error" class="alerta-error">{{ error }}</div>
    <div class="metricas">
      <article class="metrica">
        <span class="metrica-icono cafe"><Coffee :size="19" /></span>
        <div><small>Ventas acumuladas</small><strong>{{ moneda(resumen.facturacion_total) }}</strong><span>Facturación total</span></div>
        <ArrowUpRight :size="18" class="tendencia" />
      </article>
      <article class="metrica">
        <span class="metrica-icono pedidos"><ShoppingBag :size="19" /></span>
        <div><small>Pedidos</small><strong>{{ resumen.pedidos }}</strong><span>Registrados en el sistema</span></div>
      </article>
      <article class="metrica">
        <span class="metrica-icono clientes"><Users :size="19" /></span>
        <div><small>Clientes</small><strong>{{ resumen.clientes }}</strong><span>Clientes registrados</span></div>
      </article>
      <article class="metrica">
        <span class="metrica-icono productos"><Package :size="19" /></span>
        <div><small>Productos</small><strong>{{ resumen.productos }}</strong><span>En el catálogo</span></div>
      </article>
    </div>

    <div class="dashboard-grid">
      <section class="tarjeta panel">
        <div class="panel-titulo"><div><h3>Pedidos recientes</h3><p>Actividad de tus últimas órdenes</p></div><button class="enlace" @click="router.push('/pedidos')">Ver todos <ArrowUpRight :size="15" /></button></div>
        <div v-if="!pedidos.length" class="estado-centro"><p>No hay pedidos registrados.</p></div>
        <div v-else class="lista-pedidos">
          <div v-for="pedido in pedidos.slice(0, 5)" :key="pedido.idPedido" class="pedido-fila">
            <span class="pedido-icono"><Coffee :size="17" /></span>
            <div><strong>Pedido #{{ pedido.idPedido }}</strong><small>{{ fecha(pedido.fecha_pedido) }} · {{ pedido.detalles?.length ?? 0 }} productos</small></div>
            <span class="estado-pill">{{ estado(pedido.estado) }}</span>
            <strong class="total">{{ moneda(pedido.factura?.total ?? 0) }}</strong>
          </div>
        </div>
      </section>
      <section class="tarjeta panel">
        <div class="panel-titulo"><div><h3>Alertas de inventario</h3><p>Productos que necesitan atención</p></div><button class="enlace" @click="router.push('/inventario')">Ver inventario <ArrowUpRight :size="15" /></button></div>
        <div v-if="!alertas.length" class="estado-centro"><CircleAlert :size="26" /><p>Todo el inventario está en orden.</p></div>
        <div v-else class="alertas-lista">
          <div v-for="item in alertas" :key="item.idInventario" class="alerta-fila"><span class="alerta-icono"><CircleAlert :size="17" /></span><div><strong>{{ item.ingrediente.nombre }}</strong><small>Mínimo: {{ item.cantidad_minima }} {{ item.ingrediente.unidad_medida }}</small></div><b>{{ item.cantidad_actual }} {{ item.ingrediente.unidad_medida }}</b></div>
        </div>
      </section>
    </div>

    <section class="acciones-rapidas">
      <button class="accion-rapida" @click="router.push('/productos')"><Package :size="21" /><span><b>Gestionar productos</b><small>Actualiza tu catálogo</small></span><ArrowUpRight :size="17" /></button>
      <button class="accion-rapida" @click="router.push('/pedidos')"><CreditCard :size="21" /><span><b>Crear un pedido</b><small>Registra una nueva venta</small></span><ArrowUpRight :size="17" /></button>
    </section>
  </div>
</template>

<style scoped>
.dashboard { display: grid; gap: 1.25rem; }
.eyebrow { margin: 0 0 .25rem !important; color: var(--acento-2) !important; font-size: .75rem !important; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.cabecera-pagina h2 { font-size: 1.75rem; }
.cabecera-pagina h2 span { color: var(--acento); }
.metricas { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.metrica { display: flex; align-items: flex-start; gap: .75rem; padding: 1.15rem; background: var(--surface); border: 1px solid var(--borde); border-radius: var(--radio); box-shadow: var(--sombra); }
.metrica-icono, .pedido-icono, .alerta-icono { display: grid; place-items: center; flex: 0 0 auto; width: 38px; height: 38px; border-radius: 11px; }
.metrica-icono.cafe { background: #f5e5d1; color: #a3612f; }.metrica-icono.pedidos { background: #e9e2f5; color: #76599c; }.metrica-icono.clientes { background: #dceee5; color: #438263; }.metrica-icono.productos { background: #f5e8bc; color: #a77a1e; }
.metrica div { min-width: 0; }.metrica small, .metrica span { display: block; color: var(--texto-suave); font-size: .75rem; }.metrica strong { display: block; margin: .2rem 0; font-size: 1.35rem; }.tendencia { margin-left: auto; color: var(--exito); }
.dashboard-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 1.25rem; }.panel { min-width: 0; }.panel-titulo { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: .85rem; }.panel h3 { margin: 0; font-size: 1rem; }.panel-titulo p { margin: .25rem 0 0; color: var(--texto-suave); font-size: .8rem; }.enlace { display: inline-flex; align-items: center; gap: .2rem; border: 0; background: none; color: var(--acento-2); cursor: pointer; font: inherit; font-size: .8rem; font-weight: 600; }
.lista-pedidos, .alertas-lista { display: grid; gap: .35rem; }.pedido-fila, .alerta-fila { display: flex; align-items: center; gap: .7rem; padding: .7rem .45rem; border-bottom: 1px solid var(--borde); }.pedido-fila:last-child, .alerta-fila:last-child { border-bottom: 0; }.pedido-icono { width: 34px; height: 34px; background: var(--surface-2); color: var(--acento-2); }.pedido-fila div, .alerta-fila div { flex: 1; min-width: 0; }.pedido-fila strong, .alerta-fila strong { display: block; font-size: .84rem; }.pedido-fila small, .alerta-fila small { color: var(--texto-suave); font-size: .75rem; }.estado-pill { padding: .25rem .55rem; border-radius: 99px; background: #f8edcf; color: #966d1a; font-size: .7rem; white-space: nowrap; }.total { font-size: .82rem !important; }.alerta-icono { width: 34px; height: 34px; color: var(--aviso); background: #fff3d4; }.alerta-fila b { color: var(--error); font-size: .8rem; white-space: nowrap; }
.acciones-rapidas { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }.accion-rapida { display: flex; align-items: center; gap: .8rem; padding: 1rem 1.15rem; border: 1px solid var(--borde); border-radius: var(--radio); background: var(--surface); color: var(--texto); text-align: left; cursor: pointer; }.accion-rapida > svg:first-child { color: var(--acento-2); }.accion-rapida span { flex: 1; }.accion-rapida b, .accion-rapida small { display: block; }.accion-rapida small { margin-top: .2rem; color: var(--texto-suave); font-size: .78rem; }
@media (max-width: 950px) { .metricas { grid-template-columns: repeat(2, 1fr); }.dashboard-grid { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .metricas, .acciones-rapidas { grid-template-columns: 1fr; }.cabecera-pagina h2 { font-size: 1.4rem; } .pedido-fila .estado-pill { display: none; } }
</style>
