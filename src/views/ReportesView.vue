<script setup>
import { computed, onMounted, ref } from 'vue'
import { BarChart3, CalendarDays, Download, RefreshCw, Sparkles, TrendingUp } from 'lucide-vue-next'
import { obtenerReporteVentas } from '../services/reportesService'
import { resumirVentasConIA } from '../services/motorLogicoService'
import { useToast } from '../composables/useToast'

const reporte = ref({ cantidad_facturas: 0, total_ventas: 0, ventas_por_dia: [] })
const desde = ref('')
const hasta = ref('')
const cargando = ref(false)
const error = ref('')
const resumenIA = ref(null)
const consultandoIA = ref(false)
const toast = useToast()
const moneda = (v) => new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(Number(v))
const maximo = computed(() => Math.max(...reporte.value.ventas_por_dia.map((v) => Number(v.total)), 1))
const barras = computed(() => reporte.value.ventas_por_dia.map((v) => ({ ...v, alto: Math.max(8, (Number(v.total) / maximo.value) * 100), fechaTexto: new Date(`${v.fecha}T12:00:00`).toLocaleDateString('es-HN', { day: '2-digit', month: 'short' }) })))

async function cargar() {
  cargando.value = true; error.value = ''
  try { reporte.value = await obtenerReporteVentas(desde.value, hasta.value) } catch (e) { error.value = e.userMessage } finally { cargando.value = false }
}
function limpiar() { desde.value = ''; hasta.value = ''; cargar() }
async function analizarConIA() {
  consultandoIA.value = true
  try { resumenIA.value = await resumirVentasConIA(reporte.value); toast.exito('Resumen generado por IA') } catch (e) { toast.error(e.userMessage) } finally { consultandoIA.value = false }
}
onMounted(cargar)
</script>

<template>
  <div class="cabecera-pagina"><div><p class="eyebrow">Analítica del negocio</p><h2>Reportes</h2><p>Consulta el comportamiento de tus ventas por período.</p></div><button class="btn" :disabled="cargando" @click="cargar"><RefreshCw :size="17" /> Actualizar</button></div>
  <section class="tarjeta filtros"><div class="campo"><label for="desde"><CalendarDays :size="15" /> Desde</label><input id="desde" v-model="desde" type="date" /></div><div class="campo"><label for="hasta"><CalendarDays :size="15" /> Hasta</label><input id="hasta" v-model="hasta" type="date" /></div><button class="btn btn-primario" :disabled="cargando" @click="cargar">Generar reporte</button><button class="btn" @click="limpiar">Limpiar</button></section>
  <div v-if="error" class="alerta-error">{{ error }}</div>
  <div class="reporte-metricas"><article class="reporte-metrica"><span class="reporte-icono ventas"><TrendingUp :size="20" /></span><div><small>Total de ventas</small><strong>{{ moneda(reporte.total_ventas) }}</strong><span>En el período seleccionado</span></div></article><article class="reporte-metrica"><span class="reporte-icono facturas"><BarChart3 :size="20" /></span><div><small>Facturas emitidas</small><strong>{{ reporte.cantidad_facturas }}</strong><span>Transacciones registradas</span></div></article></div>
  <section class="tarjeta grafico"><div class="panel-titulo"><div><h3>Ventas por día</h3><p>Visualización del total facturado</p></div><div class="acciones"><Download :size="19" class="descarga" /><button class="btn btn-primario" :disabled="consultandoIA" @click="analizarConIA"><Sparkles :size="16" /> {{ consultandoIA ? 'Analizando…' : 'Analizar con IA' }}</button></div></div><div v-if="resumenIA" class="resumen-ia"><Sparkles :size="18" /><div><strong>{{ resumenIA.resumen }}</strong><p v-if="resumenIA.recomendacion">{{ resumenIA.recomendacion }}</p><ul><li v-for="punto in resumenIA.puntos_clave" :key="punto">{{ punto }}</li></ul></div></div><div v-if="cargando" class="estado-centro"><div class="spinner"></div><p>Generando reporte…</p></div><div v-else-if="!barras.length" class="estado-centro"><p>No hay ventas en el período seleccionado.</p></div><div v-else class="grafico-barras"><div v-for="barra in barras" :key="barra.fecha" class="barra-columna"><strong>{{ moneda(barra.total) }}</strong><i :style="{ height: `${barra.alto}%` }"></i><small>{{ barra.fechaTexto }}</small></div></div></section>
</template>

<style scoped>
.eyebrow { margin: 0 0 .25rem !important; color: var(--acento-2) !important; font-size: .75rem !important; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }.filtros { display: flex; align-items: flex-end; gap: .8rem; margin-bottom: 1.25rem; }.campo { display: grid; gap: .35rem; min-width: 180px; }.campo label { display: flex; align-items: center; gap: .3rem; color: var(--texto-suave); font-size: .78rem; font-weight: 600; }.campo input { padding: .6rem .7rem; border: 1px solid var(--borde); border-radius: 9px; background: var(--surface); color: var(--texto); font: inherit; }.reporte-metricas { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.25rem; }.reporte-metrica { display: flex; align-items: center; gap: .8rem; padding: 1.2rem; border: 1px solid var(--borde); border-radius: var(--radio); background: var(--surface); box-shadow: var(--sombra); }.reporte-icono { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; }.reporte-icono.ventas { color: var(--exito); background: #e2f2e7; }.reporte-icono.facturas { color: var(--acento-2); background: var(--surface-2); }.reporte-metrica small, .reporte-metrica span { display: block; color: var(--texto-suave); font-size: .78rem; }.reporte-metrica strong { display: block; margin: .2rem 0; font-size: 1.5rem; }.grafico { min-height: 330px; }.panel-titulo { display: flex; justify-content: space-between; }.panel-titulo h3 { margin: 0; }.panel-titulo p { margin: .25rem 0 0; color: var(--texto-suave); font-size: .8rem; }.descarga { color: var(--texto-suave); }.grafico-barras { display: flex; align-items: flex-end; justify-content: space-around; gap: 1rem; height: 220px; margin-top: 2rem; padding: 1rem 0 0; border-bottom: 1px solid var(--borde); }.barra-columna { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: .45rem; }.barra-columna strong { color: var(--texto-suave); font-size: .7rem; }.barra-columna i { width: min(52px, 70%); min-height: 8px; border-radius: 8px 8px 0 0; background: linear-gradient(180deg, var(--acento), var(--acento-2)); }.barra-columna small { color: var(--texto-suave); font-size: .72rem; }
.resumen-ia { display: flex; gap: .6rem; margin-top: 1rem; padding: .85rem; border-radius: 10px; background: #fff8ed; color: var(--acento-2); }.resumen-ia p { margin: .25rem 0; color: var(--texto-suave); }.resumen-ia ul { margin: .35rem 0 0; padding-left: 1.1rem; color: var(--texto-suave); font-size: .8rem; }
@media (max-width: 650px) { .filtros, .reporte-metricas { grid-template-columns: 1fr; flex-direction: column; align-items: stretch; }.campo { min-width: 0; }.grafico-barras { gap: .2rem; }.barra-columna strong { font-size: .6rem; } }
</style>
