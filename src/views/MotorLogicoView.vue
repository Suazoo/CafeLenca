<script setup>
import { computed, onMounted, ref } from 'vue'
import { CheckCircle2, Coffee, Lightbulb, RefreshCw, Send, Sparkles } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'
import { obtenerRecomendacionIA, obtenerRecomendaciones, obtenerReglas } from '../services/motorLogicoService'

const toast = useToast()
const reglas = ref([])
const recomendaciones = ref([])
const solicitud = ref('')
const limite = ref(5)
const cargando = ref(false)
const error = ref('')
const enviada = ref(false)
const consultandoIA = ref(false)
const respuestaIA = ref('')
const iaActiva = ref(false)

const moneda = (valor) => new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(Number(valor))

const sugerencias = computed(() => {
  const consulta = solicitud.value.trim().toLowerCase()
  if (!consulta) return recomendaciones.value
  const palabras = consulta.split(/\s+/).filter((palabra) => palabra.length > 2)
  const coincidencias = recomendaciones.value.filter((producto) => {
    const texto = `${producto.nombre} ${producto.descripcion ?? ''}`.toLowerCase()
    return palabras.some((palabra) => texto.includes(palabra))
  })
  return coincidencias.length ? coincidencias : recomendaciones.value
})

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const [datosReglas, datosRecomendaciones] = await Promise.all([
      obtenerReglas(),
      obtenerRecomendaciones(limite.value),
    ])
    reglas.value = datosReglas.reglas ?? []
    recomendaciones.value = datosRecomendaciones
  } catch (e) {
    error.value = e.userMessage
  } finally {
    cargando.value = false
  }
}

function enviarSolicitud() {
  enviada.value = true
  if (!solicitud.value.trim()) {
    toast.error('Escribe lo que el cliente está buscando.')
    return
  }
  consultarIA()
}

async function consultarIA() {
  consultandoIA.value = true
  try {
    const resultado = await obtenerRecomendacionIA(solicitud.value.trim(), limite.value)
    recomendaciones.value = resultado.productos
    respuestaIA.value = resultado.mensaje
    iaActiva.value = true
    toast.exito('El motor lógico validó el catálogo y la IA preparó la sugerencia.')
  } catch (e) {
    iaActiva.value = false
    respuestaIA.value = ''
    toast.error(`${e.userMessage} Se mantienen las recomendaciones del motor lógico.`)
  } finally {
    consultandoIA.value = false
  }
}

function limpiarSolicitud() {
  solicitud.value = ''
  enviada.value = false
  respuestaIA.value = ''
  iaActiva.value = false
}

onMounted(cargar)
</script>

<template>
  <div class="cabecera-pagina">
    <div>
      <p class="eyebrow">Asistente de ventas</p>
      <h2>Motor lógico</h2>
      <p>Convierte lo que pide el cliente en opciones disponibles del catálogo.</p>
    </div>
    <button class="btn" :disabled="cargando" @click="cargar">
      <RefreshCw :size="17" /> Actualizar
    </button>
  </div>

  <div v-if="error" class="alerta-error">{{ error }}</div>

  <section class="solicitud tarjeta">
    <div class="solicitud-intro">
      <span class="solicitud-icono"><Sparkles :size="23" /></span>
      <div>
        <h3>¿Qué está buscando el cliente?</h3>
        <p>Escribe una descripción, preferencia o producto. Por ejemplo: «Quiero algo dulce con café».</p>
      </div>
    </div>
    <textarea
      v-model="solicitud"
      rows="3"
      placeholder="El cliente quiere..."
      aria-label="Solicitud del cliente"
      @keydown.ctrl.enter="enviarSolicitud"
    ></textarea>
    <div class="solicitud-acciones">
      <small>Ctrl + Enter para procesar</small>
      <div>
        <button v-if="solicitud" class="btn" @click="limpiarSolicitud">Limpiar</button>
        <button class="btn btn-primario" :disabled="consultandoIA" @click="enviarSolicitud">
          <Send :size="16" /> {{ consultandoIA ? 'Consultando IA…' : 'Recomendar' }}
        </button>
      </div>
    </div>
  </section>

  <div class="motor-grid">
    <section class="tarjeta recomendaciones">
      <div class="panel-titulo">
        <div>
          <h3><Lightbulb :size="18" /> Recomendaciones</h3>
          <p>{{ enviada && solicitud ? 'Opciones relacionadas con la solicitud' : 'Sugerencias activas por disponibilidad y precio' }}</p>
        </div>
        <select v-model.number="limite" aria-label="Cantidad de recomendaciones" @change="cargar">
          <option :value="3">3</option>
          <option :value="5">5</option>
          <option :value="10">10</option>
        </select>
      </div>
      <div v-if="respuestaIA" class="respuesta-ia">
        <Sparkles :size="17" />
        <div><strong>{{ iaActiva ? 'Sugerencia inteligente' : 'Motor lógico' }}</strong><p>{{ respuestaIA }}</p></div>
      </div>
      <div v-if="cargando" class="estado-centro"><div class="spinner"></div><p>Analizando disponibilidad…</p></div>
      <div v-else-if="!sugerencias.length" class="estado-centro"><p>No hay recomendaciones disponibles.</p></div>
      <div v-else class="productos-recomendados">
        <article v-for="(producto, indice) in sugerencias" :key="producto.idProducto" class="producto-recomendado">
          <span class="numero">{{ indice + 1 }}</span>
          <span class="producto-icono"><Coffee :size="19" /></span>
          <div class="producto-info">
            <strong>{{ producto.nombre }}</strong>
            <p>{{ producto.descripcion }}</p>
            <small>{{ producto.motivo }}</small>
          </div>
          <b>{{ moneda(producto.precio) }}</b>
        </article>
      </div>
    </section>

    <section class="tarjeta reglas">
      <div class="panel-titulo">
        <div>
          <h3><CheckCircle2 :size="18" /> Reglas activas</h3>
          <p>Condiciones utilizadas por el motor</p>
        </div>
      </div>
      <ol>
        <li v-for="regla in reglas" :key="regla">{{ regla }}</li>
      </ol>
      <div class="nota-motor">
        <Lightbulb :size="17" />
        <p>Las recomendaciones consideran productos activos, disponibilidad e inventario configurado.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.eyebrow { margin: 0 0 .25rem !important; color: var(--acento-2) !important; font-size: .75rem !important; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.solicitud { margin-bottom: 1.25rem; }
.solicitud-intro { display: flex; align-items: center; gap: .8rem; margin-bottom: 1rem; }
.solicitud-icono { display: grid; place-items: center; width: 43px; height: 43px; flex: 0 0 auto; border-radius: 13px; background: #f5e5d1; color: var(--acento-2); }
.solicitud h3, .panel-titulo h3 { display: flex; align-items: center; gap: .4rem; margin: 0; font-size: 1rem; }
.solicitud-intro p, .panel-titulo p { margin: .25rem 0 0; color: var(--texto-suave); font-size: .82rem; }
.solicitud textarea { width: 100%; padding: .8rem; border: 1px solid var(--borde); border-radius: 10px; outline: none; resize: vertical; background: var(--surface-2); color: var(--texto); font: inherit; }
.solicitud textarea:focus { border-color: var(--acento); outline: 2px solid color-mix(in srgb, var(--acento) 25%, transparent); }
.solicitud-acciones { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: .8rem; }
.solicitud-acciones small { color: var(--texto-suave); font-size: .75rem; }
.solicitud-acciones div { display: flex; gap: .5rem; }
.motor-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 1.25rem; }
.panel-titulo { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: .9rem; }
.panel-titulo select { padding: .4rem .5rem; border: 1px solid var(--borde); border-radius: 8px; background: var(--surface); color: var(--texto); }
.respuesta-ia { display: flex; gap: .55rem; margin-bottom: .8rem; padding: .75rem; border: 1px solid #e8d2b2; border-radius: 10px; background: #fff8ed; color: var(--acento-2); }
.respuesta-ia strong, .respuesta-ia p { display: block; }
.respuesta-ia p { margin: .2rem 0 0; color: var(--texto-suave); font-size: .78rem; line-height: 1.4; }
.productos-recomendados { display: grid; gap: .35rem; }
.producto-recomendado { display: flex; align-items: center; gap: .65rem; padding: .75rem .4rem; border-bottom: 1px solid var(--borde); }
.producto-recomendado:last-child { border-bottom: 0; }
.numero { width: 22px; color: var(--texto-suave); font-size: .75rem; text-align: center; }
.producto-icono { display: grid; place-items: center; width: 37px; height: 37px; flex: 0 0 auto; border-radius: 10px; background: var(--surface-2); color: var(--acento-2); }
.producto-info { min-width: 0; flex: 1; }
.producto-info strong, .producto-info p, .producto-info small { display: block; }
.producto-info strong { font-size: .85rem; }
.producto-info p { overflow: hidden; margin: .15rem 0; color: var(--texto-suave); font-size: .76rem; text-overflow: ellipsis; white-space: nowrap; }
.producto-info small { color: var(--acento-2); font-size: .7rem; }
.producto-recomendado > b { white-space: nowrap; font-size: .82rem; }
.reglas ol { display: grid; gap: .8rem; margin: 0; padding-left: 1.35rem; color: var(--texto); }
.reglas li { padding-left: .25rem; line-height: 1.45; font-size: .86rem; }
.nota-motor { display: flex; gap: .55rem; margin-top: 1.25rem; padding: .8rem; border-radius: 10px; background: var(--surface-2); color: var(--acento-2); }
.nota-motor p { margin: 0; color: var(--texto-suave); font-size: .76rem; line-height: 1.4; }
@media (max-width: 850px) { .motor-grid { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .solicitud-acciones { align-items: stretch; flex-direction: column; }.solicitud-acciones div { justify-content: flex-end; }.producto-recomendado > b { align-self: flex-start; } }
</style>
