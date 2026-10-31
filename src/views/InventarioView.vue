<script setup>
import { computed, onMounted, ref } from 'vue'
import { AlertTriangle, CheckCircle2, Package, Pencil, RefreshCw, Search, Sparkles } from 'lucide-vue-next'
import AppModal from '../components/common/AppModal.vue'
import { useToast } from '../composables/useToast'
import { actualizarStock, listarInventario } from '../services/inventarioService'
import { priorizarInventarioConIA } from '../services/motorLogicoService'

const toast = useToast()
const items = ref([])
const busqueda = ref('')
const cargando = ref(false)
const error = ref('')
const editando = ref(null)
const cantidad = ref('')
const guardando = ref(false)
const consultandoIA = ref(false)
const analisisIA = ref(null)
const filtrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  return q ? items.value.filter((i) => i.ingrediente.nombre.toLowerCase().includes(q)) : items.value
})
const bajos = computed(() => items.value.filter((i) => i.stock_bajo).length)
const porcentaje = (item) => Math.min(100, Math.round((Number(item.cantidad_actual) / Number(item.cantidad_minima || 1)) * 100))
const unidad = (item) => item.ingrediente.unidad_medida

async function cargar() {
  cargando.value = true; error.value = ''
  try { items.value = await listarInventario() } catch (e) { error.value = e.userMessage } finally { cargando.value = false }
}
function abrirEditar(item) { editando.value = item; cantidad.value = item.cantidad_actual }
async function guardar() {
  if (!editando.value || !cantidad.value || Number(cantidad.value) <= 0) return
  guardando.value = true
  try { await actualizarStock(editando.value.idInventario, cantidad.value); toast.exito('Existencia actualizada'); editando.value = null; await cargar() } catch (e) { toast.error(e.userMessage) } finally { guardando.value = false }
}
async function analizarInventario() {
  consultandoIA.value = true
  try {
    analisisIA.value = await priorizarInventarioConIA({
      alertas: items.value.filter((item) => item.stock_bajo),
    })
    toast.exito('Alertas priorizadas por IA')
  } catch (e) { toast.error(e.userMessage) } finally { consultandoIA.value = false }
}
onMounted(cargar)
</script>

<template>
  <div class="cabecera-pagina">
    <div><p class="eyebrow">Control de existencias</p><h2>Inventario</h2><p>{{ items.length }} ingredientes registrados · {{ bajos }} necesitan atención</p></div>
    <div class="acciones"><button class="btn" :disabled="cargando" @click="cargar"><RefreshCw :size="17" /> Actualizar</button><button class="btn btn-primario" :disabled="consultandoIA || !bajos" @click="analizarInventario"><Sparkles :size="16" /> {{ consultandoIA ? 'Analizando…' : 'Priorizar con IA' }}</button></div>
  </div>
  <section v-if="analisisIA" class="tarjeta analisis-ia"><Sparkles :size="18" /><div><strong>{{ analisisIA.resumen }}</strong><div v-for="alerta in analisisIA.alertas" :key="alerta.ingrediente" class="ia-alerta"><b>{{ alerta.ingrediente }}</b><span>{{ alerta.prioridad }} · {{ alerta.accion }}</span></div></div></section>
  <div class="inventario-resumen">
    <div class="resumen-card"><Package :size="20" /><span><small>Total de ingredientes</small><strong>{{ items.length }}</strong></span></div>
    <div class="resumen-card alerta"><AlertTriangle :size="20" /><span><small>Stock bajo</small><strong>{{ bajos }}</strong></span></div>
    <div class="resumen-card ok"><CheckCircle2 :size="20" /><span><small>Existencias normales</small><strong>{{ items.length - bajos }}</strong></span></div>
  </div>
  <section class="tarjeta">
    <div class="barra"><label class="buscador"><Search :size="18" /><input v-model="busqueda" type="search" placeholder="Buscar ingrediente" /></label></div>
    <div v-if="cargando && !items.length" class="estado-centro"><div class="spinner"></div><p>Cargando inventario…</p></div>
    <div v-else-if="error" class="estado-centro"><p class="texto-error">{{ error }}</p><button class="btn" @click="cargar">Reintentar</button></div>
    <div v-else class="tabla-wrap"><table class="tabla"><thead><tr><th>Ingrediente</th><th>Existencia</th><th>Nivel</th><th>Estado</th><th></th></tr></thead><tbody>
      <tr v-for="item in filtrados" :key="item.idInventario"><td><div class="ingrediente"><span class="ingrediente-icono"><Package :size="17" /></span><div><strong>{{ item.ingrediente.nombre }}</strong><small>Unidad: {{ unidad(item) }}</small></div></div></td><td><strong>{{ item.cantidad_actual }} {{ unidad(item) }}</strong><small class="bloque">Mínimo: {{ item.cantidad_minima }} {{ unidad(item) }}</small></td><td class="nivel"><div class="barra-nivel"><i :class="{ bajo: item.stock_bajo }" :style="{ width: `${porcentaje(item)}%` }"></i></div><small>{{ porcentaje(item) }}%</small></td><td><span class="estado" :class="item.stock_bajo ? 'bajo' : 'normal'">{{ item.stock_bajo ? 'Stock bajo' : 'Normal' }}</span></td><td><button class="btn btn-icono" title="Actualizar existencia" @click="abrirEditar(item)"><Pencil :size="16" /></button></td></tr>
    </tbody></table></div>
  </section>
  <AppModal :abierto="!!editando" titulo="Actualizar existencia" @cerrar="editando = null">
    <form class="form-stock" @submit.prevent="guardar"><p>Actualiza la cantidad disponible de <strong>{{ editando?.ingrediente.nombre }}</strong>.</p><div class="campo"><label for="cantidad">Cantidad actual ({{ editando ? unidad(editando) : '' }})</label><input id="cantidad" v-model="cantidad" type="number" min="0.01" step="0.001" required /></div><div class="acciones-modal"><button type="button" class="btn" @click="editando = null">Cancelar</button><button class="btn btn-primario" :disabled="guardando">{{ guardando ? 'Guardando…' : 'Actualizar' }}</button></div></form>
  </AppModal>
</template>

<style scoped>
.eyebrow { margin: 0 0 .25rem !important; color: var(--acento-2) !important; font-size: .75rem !important; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }.inventario-resumen { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.25rem; }.resumen-card { display: flex; align-items: center; gap: .75rem; padding: 1rem 1.15rem; border: 1px solid var(--borde); border-radius: var(--radio); background: var(--surface); }.resumen-card svg { color: var(--acento-2); }.resumen-card.alerta svg { color: var(--aviso); }.resumen-card.ok svg { color: var(--exito); }.resumen-card small, .resumen-card strong { display: block; }.resumen-card small { color: var(--texto-suave); font-size: .78rem; }.resumen-card strong { margin-top: .2rem; font-size: 1.3rem; }.barra { margin-bottom: 1rem; }.buscador { display: flex; align-items: center; gap: .5rem; width: min(360px, 100%); padding: 0 .8rem; border: 1px solid var(--borde); border-radius: 10px; color: var(--texto-suave); }.buscador input { width: 100%; padding: .6rem 0; border: 0; outline: 0; background: transparent; color: var(--texto); font: inherit; }.ingrediente { display: flex; align-items: center; gap: .7rem; }.ingrediente-icono { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; background: var(--surface-2); color: var(--acento-2); }.ingrediente small, .bloque { display: block; color: var(--texto-suave); font-size: .75rem; }.nivel { min-width: 130px; }.barra-nivel { width: 100%; height: 7px; border-radius: 99px; background: var(--surface-2); overflow: hidden; }.barra-nivel i { display: block; height: 100%; border-radius: inherit; background: var(--exito); }.barra-nivel i.bajo { background: var(--error); }.nivel small { color: var(--texto-suave); font-size: .72rem; }.estado { display: inline-block; padding: .28rem .6rem; border-radius: 99px; font-size: .72rem; font-weight: 600; }.estado.normal { background: #e2f2e7; color: var(--exito); }.estado.bajo { background: #fbe4df; color: var(--error); }.form-stock p { margin-top: 0; line-height: 1.5; color: var(--texto-suave); }
.analisis-ia { display: flex; gap: .6rem; margin-bottom: 1.25rem; color: var(--acento-2); }.analisis-ia strong { display: block; }.ia-alerta { display: flex; gap: .8rem; margin-top: .55rem; font-size: .8rem; }.ia-alerta span { color: var(--texto-suave); }
@media (max-width: 700px) { .inventario-resumen { grid-template-columns: 1fr; }.nivel { display: none; } }
</style>
