<script setup>
import { computed, onMounted, ref } from 'vue'
import { Coffee, Download, Eye, Plus, RefreshCw, Search, ShoppingBag, Sparkles } from 'lucide-vue-next'
import AppModal from '../components/common/AppModal.vue'
import { useToast } from '../composables/useToast'
import { crearPedido, actualizarEstadoPedido, descargarFactura, listarPedidos } from '../services/pedidosService'
import { listarClientes } from '../services/clientesService'
import { listarMesas, listarMetodosPago } from '../services/catalogosService'
import { listarProductosDisponibles } from '../services/productosService'
import { convertirSolicitudEnPedido } from '../services/motorLogicoService'

const toast = useToast()
const pedidos = ref([])
const productos = ref([])
const clientes = ref([])
const mesas = ref([])
const metodosPago = ref([])
const busqueda = ref('')
const filtro = ref('todos')
const cargando = ref(false)
const guardando = ref(false)
const error = ref('')
const detalle = ref(null)
const formAbierto = ref(false)
const estados = { '1': 'Pendiente', '2': 'Preparando', '3': 'Listo', '4': 'Entregado', '0': 'Cancelado' }
const form = ref({ Cliente_idCliente: null, Mesa_idMesa: null, MetodoPago_idMetodoPago: null, descuento: 0, detalles: [] })
const linea = ref({ Producto_idProducto: '', cantidad: 1 })
const solicitudIA = ref('')
const propuestaIA = ref(null)
const consultandoIA = ref(false)

const filtrados = computed(() => pedidos.value.filter((p) => {
  const q = busqueda.value.trim().toLowerCase()
  return (!q || String(p.idPedido).includes(q) || p.detalles?.some((d) => d.nombre_producto.toLowerCase().includes(q))) &&
    (filtro.value === 'todos' || p.estado === filtro.value)
}))
const moneda = (v) => new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(Number(v))
const fecha = (v) => v ? new Date(v).toLocaleString('es-HN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const nombreCliente = (cliente) => `${cliente.persona.Pnombre} ${cliente.persona.Papellido}`
const productoSeleccionado = computed(() => productos.value.find((p) => p.idProducto === Number(linea.value.Producto_idProducto)))
const subtotalEstimado = computed(() => form.value.detalles.reduce((total, item) => total + Number(item.precio) * item.cantidad, 0))

async function cargar() {
  cargando.value = true; error.value = ''
  try { pedidos.value = await listarPedidos() } catch (e) { error.value = e.userMessage } finally { cargando.value = false }
}
async function cargarCatalogos() {
  try {
    const [disponibles, listaClientes, listaMesas, listaMetodos] = await Promise.all([
      listarProductosDisponibles(), listarClientes(), listarMesas(), listarMetodosPago(),
    ])
    productos.value = disponibles
    clientes.value = listaClientes
    mesas.value = listaMesas
    metodosPago.value = listaMetodos
  } catch (e) { toast.error(`No se pudieron cargar los catálogos: ${e.userMessage}`) }
}
function abrirNuevo() {
  form.value = { Cliente_idCliente: null, Mesa_idMesa: null, MetodoPago_idMetodoPago: null, descuento: 0, detalles: [] }
  linea.value = { Producto_idProducto: '', cantidad: 1 }
  formAbierto.value = true
}
function agregarLinea() {
  if (!productoSeleccionado.value || Number(linea.value.cantidad) < 1) return
  const existente = form.value.detalles.find((item) => item.Producto_idProducto === productoSeleccionado.value.idProducto)
  if (existente) existente.cantidad += Number(linea.value.cantidad)
  else form.value.detalles.push({ Producto_idProducto: productoSeleccionado.value.idProducto, nombre: productoSeleccionado.value.nombre, precio: productoSeleccionado.value.precio, cantidad: Number(linea.value.cantidad) })
  linea.value = { Producto_idProducto: '', cantidad: 1 }
}
function quitarLinea(index) { form.value.detalles.splice(index, 1) }
async function guardar() {
  if (guardando.value || !form.value.detalles.length) { toast.error('Agrega al menos un producto al pedido.'); return }
  guardando.value = true
  try {
    const pedido = await crearPedido({ Cliente_idCliente: form.value.Cliente_idCliente || null, Mesa_idMesa: form.value.Mesa_idMesa || null, MetodoPago_idMetodoPago: form.value.MetodoPago_idMetodoPago || null, descuento: Number(form.value.descuento) || 0, detalles: form.value.detalles.map(({ Producto_idProducto, cantidad }) => ({ Producto_idProducto, cantidad })) })
    toast.exito(`Pedido #${pedido.idPedido} creado correctamente`)
    formAbierto.value = false
    await cargar()
  } catch (e) { toast.error(e.userMessage) } finally { guardando.value = false }
}
async function cambiarEstado(p, estado) { try { await actualizarEstadoPedido(p.idPedido, estado); toast.exito('Estado actualizado'); await cargar() } catch (e) { toast.error(e.userMessage) } }
async function sugerirPedido() {
  if (!solicitudIA.value.trim()) { toast.error('Describe lo que desea el cliente.'); return }
  consultandoIA.value = true
  try { propuestaIA.value = await convertirSolicitudEnPedido(solicitudIA.value.trim()); toast.exito('La IA preparó una propuesta basada en el catálogo validado.') } catch (e) { toast.error(e.userMessage) } finally { consultandoIA.value = false }
}
async function descargar(pedido) {
  try { const response = await descargarFactura(pedido.idPedido); const url = URL.createObjectURL(response.data); const a = document.createElement('a'); a.href = url; a.download = `${pedido.factura.numero_factura}.pdf`; a.click(); URL.revokeObjectURL(url) } catch (e) { toast.error(e.userMessage) }
}
onMounted(() => { cargar(); cargarCatalogos() })
</script>

<template>
  <div class="cabecera-pagina">
    <div><p class="eyebrow">Operación diaria</p><h2>Pedidos y facturación</h2><p>{{ pedidos.length }} órdenes · crea pedidos y descarga sus facturas</p></div>
    <div class="acciones"><button class="btn" :disabled="cargando" @click="cargar"><RefreshCw :size="17" /> Actualizar</button><button class="btn btn-primario" @click="abrirNuevo"><Plus :size="17" /> Nuevo pedido</button></div>
  </div>
  <section class="tarjeta asistente-pedido"><div><h3><Sparkles :size="18" /> Asistente de pedido</h3><p>Describe lo que desea el cliente y genera una propuesta.</p></div><div class="asistente-controles"><input v-model="solicitudIA" placeholder="Ej. Algo dulce y barato para acompañar el café" @keydown.enter="sugerirPedido" /><button class="btn btn-primario" :disabled="consultandoIA" @click="sugerirPedido"><Sparkles :size="16" /> {{ consultandoIA ? 'Analizando…' : 'Sugerir' }}</button></div><div v-if="propuestaIA" class="propuesta-ia"><p>{{ propuestaIA.mensaje }}</p><span v-for="producto in propuestaIA.productos" :key="producto.idProducto">{{ producto.cantidad }} × {{ producto.nombre }}</span></div></section>
  <section class="tarjeta">
    <div class="toolbar"><label class="buscador"><Search :size="18" /><input v-model="busqueda" type="search" placeholder="Buscar por número o producto" /></label><label class="select-filtro">Estado <select v-model="filtro"><option value="todos">Todos</option><option v-for="(nombre, id) in estados" :key="id" :value="id">{{ nombre }}</option></select></label></div>
    <div v-if="cargando && !pedidos.length" class="estado-centro"><div class="spinner"></div><p>Cargando pedidos…</p></div><div v-else-if="error" class="estado-centro"><p class="texto-error">{{ error }}</p><button class="btn" @click="cargar">Reintentar</button></div><div v-else-if="!filtrados.length" class="estado-centro"><ShoppingBag :size="32" /><p>No hay pedidos que mostrar.</p><button class="btn btn-primario" @click="abrirNuevo">Crear el primero</button></div><div v-else class="tabla-wrap"><table class="tabla"><thead><tr><th>Pedido</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody><tr v-for="pedido in filtrados" :key="pedido.idPedido"><td><div class="pedido"><span class="pedido-icono"><Coffee :size="17" /></span><strong>#{{ pedido.idPedido }}</strong></div></td><td class="fecha">{{ fecha(pedido.fecha_pedido) }}</td><td>{{ pedido.detalles?.reduce((total, d) => total + d.cantidad, 0) ?? 0 }} artículos</td><td><strong>{{ moneda(pedido.factura?.total ?? 0) }}</strong></td><td><select class="estado-select" :value="pedido.estado" @change="cambiarEstado(pedido, $event.target.value)"><option v-for="(nombre, id) in estados" :key="id" :value="id">{{ nombre }}</option></select></td><td class="acciones-tabla"><button class="btn btn-icono" title="Ver detalle" @click="detalle = pedido"><Eye :size="16" /></button><button v-if="pedido.factura" class="btn btn-icono" title="Descargar factura" @click="descargar(pedido)"><Download :size="16" /></button></td></tr></tbody></table></div>
  </section>
  <AppModal :abierto="formAbierto" titulo="Crear pedido" @cerrar="formAbierto = false">
    <form class="pedido-form" @submit.prevent="guardar">
      <div class="grid-form"><div class="campo"><label for="cliente">Cliente</label><select id="cliente" v-model="form.Cliente_idCliente"><option :value="null">Consumidor general</option><option v-for="cliente in clientes" :key="cliente.idCliente" :value="cliente.idCliente">{{ nombreCliente(cliente) }}</option></select></div><div class="campo"><label for="mesa">Mesa</label><select id="mesa" v-model="form.Mesa_idMesa"><option :value="null">Sin mesa</option><option v-for="mesa in mesas" :key="mesa.idMesa" :value="mesa.idMesa">Mesa {{ mesa.numero }} · {{ mesa.capacidad }} personas</option></select></div><div class="campo"><label for="metodo">Método de pago</label><select id="metodo" v-model="form.MetodoPago_idMetodoPago"><option :value="null">Pendiente</option><option v-for="metodo in metodosPago" :key="metodo.idMetodoPago" :value="metodo.idMetodoPago">{{ metodo.nombre }}</option></select></div><div class="campo"><label for="descuento">Descuento</label><input id="descuento" v-model="form.descuento" type="number" min="0" step="0.01" /></div></div>
      <div class="agregar-linea"><div class="campo producto-campo"><label for="producto">Producto</label><select id="producto" v-model="linea.Producto_idProducto" required><option value="" disabled>Selecciona un producto</option><option v-for="producto in productos" :key="producto.idProducto" :value="producto.idProducto">{{ producto.nombre }} · {{ moneda(producto.precio) }}</option></select></div><div class="campo cantidad-campo"><label for="cantidad">Cantidad</label><input id="cantidad" v-model="linea.cantidad" type="number" min="1" max="1000" /></div><button type="button" class="btn btn-primario agregar-btn" @click="agregarLinea"><Plus :size="16" /> Agregar</button></div>
      <div class="lineas"><p v-if="!form.detalles.length" class="vacio-lineas">Agrega productos para armar el pedido.</p><div v-for="(item, index) in form.detalles" :key="item.Producto_idProducto" class="linea"><div><strong>{{ item.nombre }}</strong><small>{{ item.cantidad }} × {{ moneda(item.precio) }}</small></div><b>{{ moneda(item.cantidad * item.precio) }}</b><button type="button" class="quitar" @click="quitarLinea(index)">Quitar</button></div></div>
      <div class="pedido-total"><span>Subtotal estimado</span><strong>{{ moneda(subtotalEstimado) }}</strong></div><div class="acciones-modal"><button type="button" class="btn" :disabled="guardando" @click="formAbierto = false">Cancelar</button><button class="btn btn-primario" :disabled="guardando">{{ guardando ? 'Creando…' : 'Crear pedido' }}</button></div>
    </form>
  </AppModal>
  <AppModal :abierto="!!detalle" :titulo="`Pedido #${detalle?.idPedido ?? ''}`" @cerrar="detalle = null"><div v-if="detalle" class="detalle-pedido"><p class="texto-suave">{{ fecha(detalle.fecha_pedido) }}</p><div v-for="item in detalle.detalles" :key="item.Producto_idProducto" class="linea"><div><strong>{{ item.nombre_producto }}</strong><small>{{ item.cantidad }} × {{ moneda(item.precio_unitario) }}</small></div><b>{{ moneda(item.importe) }}</b></div><div class="total-final"><span>Total</span><strong>{{ moneda(detalle.factura?.total ?? 0) }}</strong></div></div></AppModal>
</template>

<style scoped>
.eyebrow { margin: 0 0 .25rem !important; color: var(--acento-2) !important; font-size: .75rem !important; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }.buscador { display: flex; align-items: center; gap: .5rem; width: min(390px, 100%); padding: 0 .8rem; border: 1px solid var(--borde); border-radius: 10px; color: var(--texto-suave); }.buscador input { width: 100%; padding: .6rem 0; border: 0; outline: 0; background: transparent; color: var(--texto); font: inherit; }.select-filtro { display: flex; align-items: center; gap: .5rem; color: var(--texto-suave); font-size: .8rem; }.select-filtro select, .estado-select, .campo select, .campo input { padding: .55rem .6rem; border: 1px solid var(--borde); border-radius: 8px; background: var(--surface); color: var(--texto); font: inherit; }.pedido { display: flex; align-items: center; gap: .6rem; }.pedido-icono { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: var(--surface-2); color: var(--acento-2); }.fecha, .texto-suave { color: var(--texto-suave); font-size: .82rem; }.acciones-tabla { white-space: nowrap; }.acciones-tabla .btn + .btn { margin-left: .35rem; }.pedido-form { display: grid; gap: 1rem; }.grid-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: .8rem; }.campo { display: grid; gap: .3rem; }.campo label { color: var(--texto-suave); font-size: .78rem; font-weight: 600; }.agregar-linea { display: grid; grid-template-columns: 1fr 100px auto; align-items: end; gap: .6rem; }.agregar-btn { height: 38px; }.lineas { min-height: 60px; padding: .3rem .7rem; border: 1px solid var(--borde); border-radius: 10px; }.linea { display: flex; align-items: center; justify-content: space-between; gap: .8rem; padding: .65rem 0; border-bottom: 1px solid var(--borde); }.linea:last-child { border-bottom: 0; }.linea strong, .linea small { display: block; }.linea small { margin-top: .15rem; color: var(--texto-suave); }.vacio-lineas { margin: .8rem 0; color: var(--texto-suave); font-size: .8rem; text-align: center; }.quitar { border: 0; background: none; color: var(--error); cursor: pointer; font: inherit; font-size: .75rem; }.pedido-total { display: flex; justify-content: space-between; padding-top: .2rem; font-size: 1rem; }.detalle-pedido .texto-suave { margin-top: 0; }.total-final { display: flex; justify-content: space-between; padding-top: 1rem; font-size: 1.05rem; }
@media (max-width: 650px) { .toolbar { align-items: stretch; flex-direction: column; }.grid-form, .agregar-linea { grid-template-columns: 1fr; }.agregar-btn { width: fit-content; }.acciones { width: 100%; } }
.asistente-pedido { display: grid; gap: .7rem; margin-bottom: 1.25rem; }
.asistente-pedido h3 { display: flex; align-items: center; gap: .4rem; margin: 0; }
.asistente-pedido p { margin: .25rem 0 0; color: var(--texto-suave); font-size: .8rem; }
.asistente-controles { display: flex; gap: .6rem; }
.asistente-controles input { flex: 1; min-width: 0; padding: .65rem .75rem; border: 1px solid var(--borde); border-radius: 9px; background: var(--surface); color: var(--texto); font: inherit; }
.propuesta-ia { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; padding: .7rem; border-radius: 9px; background: #fff8ed; color: var(--acento-2); }
.propuesta-ia p { flex-basis: 100%; margin: 0; }
.propuesta-ia span { padding: .3rem .55rem; border-radius: 99px; background: var(--surface); font-size: .78rem; }
</style>
