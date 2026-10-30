<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Pencil, Trash2, Search, RefreshCw } from 'lucide-vue-next'
import AppModal from '../components/common/AppModal.vue'
import ConfirmModal from '../components/common/ConfirmModal.vue'
import { useToast } from '../composables/useToast'
import {
  listarClientes, crearCliente, actualizarCliente, eliminarCliente,
} from '../services/clientesService'
import { formatearFecha, nombreCompleto, iniciales } from '../utils/formato'

const toast = useToast()

// ---------- Lista ----------
const clientes = ref([])
const cargando = ref(false)
const errorCarga = ref('')
const busqueda = ref('')

const filtrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return clientes.value
  return clientes.value.filter((c) =>
    `${nombreCompleto(c.persona)} ${c.persona.correo}`.toLowerCase().includes(q),
  )
})

async function cargar() {
  if (cargando.value) return
  cargando.value = true
  errorCarga.value = ''
  try {
    clientes.value = await listarClientes()
  } catch (e) {
    errorCarga.value = e.userMessage
  } finally {
    cargando.value = false
  }
}
onMounted(cargar)

// ---------- Formulario ----------
const campos = [
  { clave: 'Pnombre', etiqueta: 'Primer nombre *' },
  { clave: 'Snombre', etiqueta: 'Segundo nombre' },
  { clave: 'Papellido', etiqueta: 'Primer apellido *' },
  { clave: 'Sapellido', etiqueta: 'Segundo apellido' },
  { clave: 'correo', etiqueta: 'Correo *', tipo: 'email', ancho: true },
  { clave: 'telefono', etiqueta: 'Teléfono', tipo: 'tel', ancho: true },
]
const vacio = () => ({ Pnombre: '', Snombre: '', Papellido: '', Sapellido: '', correo: '', telefono: '' })

const formAbierto = ref(false)
const editandoId = ref(null)
const guardando = ref(false)
const form = ref(vacio())
const errores = ref({})

function abrirNuevo() {
  editandoId.value = null
  form.value = vacio()
  errores.value = {}
  formAbierto.value = true
}

function abrirEditar(c) {
  const p = c.persona
  editandoId.value = c.idCliente
  form.value = {
    Pnombre: p.Pnombre,
    Snombre: p.Snombre ?? '',
    Papellido: p.Papellido,
    Sapellido: p.Sapellido ?? '',
    correo: p.correo,
    telefono: '', // la API no devuelve el teléfono actual
  }
  errores.value = {}
  formAbierto.value = true
}

function cerrarForm() {
  if (!guardando.value) formAbierto.value = false
}

function validar() {
  const f = form.value
  const e = {}
  if (!f.Pnombre.trim()) e.Pnombre = 'El primer nombre es obligatorio'
  if (!f.Papellido.trim()) e.Papellido = 'El primer apellido es obligatorio'
  if (!f.correo.trim()) e.correo = 'El correo es obligatorio'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo.trim())) e.correo = 'Correo no válido'
  errores.value = e
  return Object.keys(e).length === 0
}

function construirPayload() {
  const f = form.value
  const payload = {
    Pnombre: f.Pnombre.trim(),
    Papellido: f.Papellido.trim(),
    correo: f.correo.trim(),
  }
  for (const c of ['Snombre', 'Sapellido']) {
    const valor = f[c].trim()
    if (valor) payload[c] = valor
    else if (editandoId.value) payload[c] = null // al editar, vacío = borrar
  }
  if (f.telefono.trim()) payload.telefono = f.telefono.trim()
  return payload
}

async function guardar() {
  if (guardando.value || !validar()) return
  guardando.value = true
  try {
    if (editandoId.value) {
      await actualizarCliente(editandoId.value, construirPayload())
      toast.exito('Cliente actualizado')
    } else {
      await crearCliente(construirPayload())
      toast.exito('Cliente registrado')
    }
    formAbierto.value = false
    await cargar()
  } catch (e) {
    toast.error(e.userMessage)
  } finally {
    guardando.value = false
  }
}

// ---------- Eliminar ----------
const aEliminar = ref(null)
const eliminando = ref(false)
const mensajeEliminar = computed(() =>
  aEliminar.value
    ? `¿Eliminar a ${nombreCompleto(aEliminar.value.persona)}? Esta acción no se puede deshacer.`
    : '',
)

async function confirmarEliminar() {
  if (eliminando.value || !aEliminar.value) return
  eliminando.value = true
  try {
    await eliminarCliente(aEliminar.value.idCliente)
    toast.exito('Cliente eliminado')
    await cargar()
  } catch (e) {
    toast.error(e.userMessage)
  } finally {
    aEliminar.value = null
    eliminando.value = false
  }
}
</script>

<template>
  <div class="cabecera-pagina">
    <div>
      <h2>Clientes</h2>
      <p>{{ clientes.length }} registrados</p>
    </div>
    <div class="acciones">
      <label class="buscador">
        <Search :size="18" />
        <input v-model="busqueda" type="search" placeholder="Buscar por nombre o correo" />
      </label>
      <button class="btn btn-icono" :disabled="cargando" title="Actualizar" @click="cargar">
        <RefreshCw :size="18" />
      </button>
      <button class="btn btn-primario" @click="abrirNuevo">
        <Plus :size="18" /> Nuevo cliente
      </button>
    </div>
  </div>

  <section class="tarjeta">
    <div v-if="cargando && !clientes.length" class="estado-centro">
      <div class="spinner"></div>
      <p>Cargando clientes…</p>
      <small>Si el servidor estaba inactivo, puede tardar hasta un minuto en despertar.</small>
    </div>

    <div v-else-if="errorCarga" class="estado-centro">
      <p class="texto-error">{{ errorCarga }}</p>
      <button class="btn" @click="cargar">Reintentar</button>
    </div>

    <div v-else-if="!clientes.length" class="estado-centro">
      <p>Todavía no hay clientes registrados.</p>
      <button class="btn btn-primario" @click="abrirNuevo">Registrar el primero</button>
    </div>

    <div v-else-if="!filtrados.length" class="estado-centro">
      <p>Ningún cliente coincide con «{{ busqueda }}».</p>
    </div>

    <div v-else class="tabla-wrap">
      <table class="tabla">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Correo</th>
            <th class="oculto-movil">Registro</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtrados" :key="c.idCliente">
            <td>
              <div class="persona">
                <span class="avatar">{{ iniciales(c.persona) }}</span>
                <div>
                  <strong>{{ nombreCompleto(c.persona) }}</strong>
                  <small>ID {{ c.idCliente }}</small>
                </div>
              </div>
            </td>
            <td>{{ c.persona.correo }}</td>
            <td class="oculto-movil">{{ formatearFecha(c.persona.Fecha_registro) }}</td>
            <td class="col-acciones">
              <button class="btn btn-icono" title="Editar" @click="abrirEditar(c)">
                <Pencil :size="16" />
              </button>
              <button class="btn btn-icono" title="Eliminar" @click="aEliminar = c">
                <Trash2 :size="16" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <AppModal :abierto="formAbierto" :titulo="editandoId ? 'Editar cliente' : 'Nuevo cliente'" @cerrar="cerrarForm">
    <form class="grid-form" novalidate @submit.prevent="guardar">
      <div v-for="c in campos" :key="c.clave" class="campo" :class="{ ancho: c.ancho }">
        <label :for="`campo-${c.clave}`">{{ c.etiqueta }}</label>
        <input
          :id="`campo-${c.clave}`"
          v-model="form[c.clave]"
          :type="c.tipo ?? 'text'"
          :class="{ invalido: errores[c.clave] }"
          autocomplete="off"
        />
        <span v-if="errores[c.clave]" class="error-texto">{{ errores[c.clave] }}</span>
      </div>
      <small v-if="editandoId" class="ancho nota">
        El teléfono actual no se muestra: déjalo vacío si no quieres modificarlo.
      </small>
      <div class="acciones-modal ancho">
        <button type="button" class="btn" :disabled="guardando" @click="cerrarForm">Cancelar</button>
        <button type="submit" class="btn btn-primario" :disabled="guardando">
          {{ guardando ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </form>
  </AppModal>

  <ConfirmModal
    :abierto="!!aEliminar"
    titulo="Eliminar cliente"
    :mensaje="mensajeEliminar"
    :cargando="eliminando"
    @confirmar="confirmarEliminar"
    @cancelar="aEliminar = null"
  />
</template>

<style scoped>
.buscador {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--borde);
  background: var(--surface);
  color: var(--texto-suave);
}
.buscador input {
  border: none;
  background: transparent;
  color: var(--texto);
  font: inherit;
  padding: 0.6rem 0;
  min-width: 200px;
  outline: none;
}
.persona { display: flex; align-items: center; gap: 0.75rem; }
.persona small { display: block; color: var(--texto-suave); }
.avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--grad-1, var(--acento)), var(--grad-2, var(--acento)));
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
}
.col-acciones { white-space: nowrap; text-align: right; }
.col-acciones .btn + .btn { margin-left: 0.4rem; }
.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }
.ancho { grid-column: 1 / -1; }
.nota { color: var(--texto-suave); }

@media (max-width: 640px) {
  .oculto-movil { display: none; }
  .grid-form { grid-template-columns: 1fr; }
  .buscador, .buscador input { width: 100%; min-width: 0; }
  .acciones { width: 100%; }
}
</style>