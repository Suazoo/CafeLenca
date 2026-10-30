<script setup>
import { computed, onMounted, ref } from 'vue'
import { CalendarDays, Plus, RefreshCw } from 'lucide-vue-next'
import AppModal from '../components/common/AppModal.vue'
import { useToast } from '../composables/useToast'
import { listarClientes } from '../services/clientesService'
import { listarMesas } from '../services/catalogosService'
import { crearReserva, listarReservas } from '../services/reservasService'

const toast = useToast()
const reservas = ref([])
const clientes = ref([])
const mesas = ref([])
const cargando = ref(false)
const guardando = ref(false)
const error = ref('')
const formAbierto = ref(false)
const form = ref({ fecha_reserva: '', cantidad_persona: 1, Cliente_idCliente: '', Mesa_idMesa: null })
const estados = { '1': 'Confirmada', '0': 'Cancelada' }
const activas = computed(() => reservas.value.filter((reserva) => reserva.estado === '1').length)
const nombreCliente = (cliente) => `${cliente.persona.Pnombre} ${cliente.persona.Papellido}`
const fecha = (valor) => new Date(valor).toLocaleString('es-HN', { dateStyle: 'medium', timeStyle: 'short' })
const mesa = (id) => mesas.value.find((item) => item.idMesa === id)

async function cargar() {
  cargando.value = true; error.value = ''
  try { reservas.value = await listarReservas() } catch (e) { error.value = e.userMessage } finally { cargando.value = false }
}
async function cargarCatalogos() {
  try { [clientes.value, mesas.value] = await Promise.all([listarClientes(), listarMesas()]) } catch (e) { toast.error(`No se pudieron cargar los catálogos: ${e.userMessage}`) }
}
function abrirNuevo() { form.value = { fecha_reserva: '', cantidad_persona: 1, Cliente_idCliente: '', Mesa_idMesa: null }; formAbierto.value = true }
async function guardar() {
  if (guardando.value || !form.value.fecha_reserva || !form.value.Cliente_idCliente) { toast.error('Completa la fecha y el cliente de la reserva.'); return }
  guardando.value = true
  try { await crearReserva({ ...form.value, cantidad_persona: Number(form.value.cantidad_persona), Cliente_idCliente: Number(form.value.Cliente_idCliente), Mesa_idMesa: form.value.Mesa_idMesa ? Number(form.value.Mesa_idMesa) : null }); toast.exito('Reserva creada correctamente'); formAbierto.value = false; await cargar() } catch (e) { toast.error(e.userMessage) } finally { guardando.value = false }
}
onMounted(() => { cargar(); cargarCatalogos() })
</script>

<template>
  <div class="cabecera-pagina"><div><p class="eyebrow">Atención en el local</p><h2>Reservas</h2><p>{{ reservas.length }} registradas · {{ activas }} confirmadas</p></div><div class="acciones"><button class="btn" :disabled="cargando" @click="cargar"><RefreshCw :size="17" /> Actualizar</button><button class="btn btn-primario" @click="abrirNuevo"><Plus :size="17" /> Nueva reserva</button></div></div>
  <section class="tarjeta"><div v-if="cargando && !reservas.length" class="estado-centro"><div class="spinner"></div><p>Cargando reservas…</p></div><div v-else-if="error" class="estado-centro"><p class="texto-error">{{ error }}</p><button class="btn" @click="cargar">Reintentar</button></div><div v-else-if="!reservas.length" class="estado-centro"><CalendarDays :size="34" /><p>Aún no hay reservas.</p><button class="btn btn-primario" @click="abrirNuevo">Crear la primera</button></div><div v-else class="tabla-wrap"><table class="tabla"><thead><tr><th>Reserva</th><th>Cliente</th><th>Fecha y hora</th><th>Personas</th><th>Mesa</th><th>Estado</th></tr></thead><tbody><tr v-for="reserva in reservas" :key="reserva.idReserva"><td><strong>#{{ reserva.idReserva }}</strong></td><td>Cliente #{{ reserva.Cliente_idCliente }}</td><td>{{ fecha(reserva.fecha_reserva) }}</td><td>{{ reserva.cantidad_persona }}</td><td>{{ mesa(reserva.Mesa_idMesa)?.numero ? `Mesa ${mesa(reserva.Mesa_idMesa).numero}` : 'Sin mesa' }}</td><td><span class="estado" :class="reserva.estado === '1' ? 'confirmada' : 'cancelada'">{{ estados[reserva.estado] ?? reserva.estado }}</span></td></tr></tbody></table></div></section>
  <AppModal :abierto="formAbierto" titulo="Nueva reserva" @cerrar="formAbierto = false"><form class="grid-form" @submit.prevent="guardar"><div class="campo ancho"><label for="reserva-cliente">Cliente *</label><select id="reserva-cliente" v-model="form.Cliente_idCliente" required><option value="" disabled>Selecciona un cliente</option><option v-for="cliente in clientes" :key="cliente.idCliente" :value="cliente.idCliente">{{ nombreCliente(cliente) }}</option></select></div><div class="campo"><label for="reserva-fecha">Fecha y hora *</label><input id="reserva-fecha" v-model="form.fecha_reserva" type="datetime-local" required /></div><div class="campo"><label for="reserva-personas">Personas *</label><input id="reserva-personas" v-model="form.cantidad_persona" type="number" min="1" max="50" required /></div><div class="campo ancho"><label for="reserva-mesa">Mesa</label><select id="reserva-mesa" v-model="form.Mesa_idMesa"><option :value="null">Asignar después</option><option v-for="mesaItem in mesas" :key="mesaItem.idMesa" :value="mesaItem.idMesa">Mesa {{ mesaItem.numero }} · {{ mesaItem.capacidad }} personas</option></select></div><div class="acciones-modal ancho"><button type="button" class="btn" @click="formAbierto = false">Cancelar</button><button class="btn btn-primario" :disabled="guardando">{{ guardando ? 'Guardando…' : 'Crear reserva' }}</button></div></form></AppModal>
</template>

<style scoped>
.eyebrow { margin: 0 0 .25rem !important; color: var(--acento-2) !important; font-size: .75rem !important; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }.grid-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: .9rem; }.ancho { grid-column: 1 / -1; }.campo { display: grid; gap: .3rem; }.campo label { color: var(--texto-suave); font-size: .8rem; font-weight: 600; }.campo input, .campo select { padding: .6rem .7rem; border: 1px solid var(--borde); border-radius: 9px; background: var(--surface); color: var(--texto); font: inherit; }.estado { display: inline-block; padding: .25rem .6rem; border-radius: 99px; font-size: .72rem; font-weight: 600; }.confirmada { background: #e2f2e7; color: var(--exito); }.cancelada { background: #fbe4df; color: var(--error); }
@media (max-width: 600px) { .grid-form { grid-template-columns: 1fr; } }
</style>
