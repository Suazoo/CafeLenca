<script setup>
import { onMounted, ref } from 'vue'
import { Download, FileText, RefreshCw } from 'lucide-vue-next'
import { listarPedidos, descargarFactura } from '../services/pedidosService'
import { useToast } from '../composables/useToast'

const toast = useToast()
const pedidos = ref([])
const cargando = ref(false)
const error = ref('')
const moneda = (v) => new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(Number(v))
const fecha = (v) => v ? new Date(v).toLocaleDateString('es-HN', { dateStyle: 'medium' }) : '—'
async function cargar() { cargando.value = true; error.value = ''; try { pedidos.value = (await listarPedidos()).filter((p) => p.factura) } catch (e) { error.value = e.userMessage } finally { cargando.value = false } }
async function descargar(pedido) { try { const response = await descargarFactura(pedido.idPedido); const url = URL.createObjectURL(response.data); const a = document.createElement('a'); a.href = url; a.download = `${pedido.factura.numero_factura}.pdf`; a.click(); URL.revokeObjectURL(url) } catch (e) { toast.error(e.userMessage) } }
onMounted(cargar)
</script>

<template>
  <div class="cabecera-pagina"><div><p class="eyebrow">Documentos de venta</p><h2>Facturación</h2><p>{{ pedidos.length }} facturas emitidas</p></div><button class="btn" :disabled="cargando" @click="cargar"><RefreshCw :size="17" /> Actualizar</button></div>
  <div class="factura-resumen tarjeta"><FileText :size="23" /><div><small>Total facturado</small><strong>{{ moneda(pedidos.reduce((total, p) => total + Number(p.factura.total), 0)) }}</strong></div></div>
  <section class="tarjeta"><div v-if="cargando" class="estado-centro"><div class="spinner"></div><p>Cargando facturas…</p></div><div v-else-if="error" class="estado-centro"><p class="texto-error">{{ error }}</p><button class="btn" @click="cargar">Reintentar</button></div><div v-else-if="!pedidos.length" class="estado-centro"><FileText :size="32" /><p>Aún no hay facturas emitidas.</p></div><div v-else class="tabla-wrap"><table class="tabla"><thead><tr><th>Factura</th><th>Pedido</th><th>Fecha</th><th>Subtotal</th><th>Impuesto</th><th>Total</th><th></th></tr></thead><tbody><tr v-for="pedido in pedidos" :key="pedido.factura.idFactura"><td><strong>{{ pedido.factura.numero_factura }}</strong></td><td>#{{ pedido.idPedido }}</td><td>{{ fecha(pedido.factura.fecha_emision) }}</td><td>{{ moneda(pedido.factura.subtotal) }}</td><td>{{ moneda(pedido.factura.impuesto) }}</td><td><strong>{{ moneda(pedido.factura.total) }}</strong></td><td><button class="btn btn-icono" title="Descargar PDF" @click="descargar(pedido)"><Download :size="16" /></button></td></tr></tbody></table></div></section>
</template>

<style scoped>
.eyebrow { margin: 0 0 .25rem !important; color: var(--acento-2) !important; font-size: .75rem !important; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }.factura-resumen { display: flex; align-items: center; gap: .8rem; width: fit-content; min-width: 220px; margin-bottom: 1.25rem; color: var(--acento-2); }.factura-resumen small, .factura-resumen strong { display: block; }.factura-resumen small { color: var(--texto-suave); font-size: .78rem; }.factura-resumen strong { margin-top: .2rem; color: var(--texto); font-size: 1.35rem; }
</style>
