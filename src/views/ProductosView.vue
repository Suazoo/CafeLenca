<script setup>
import { computed, onMounted, ref } from 'vue'
import { CheckCircle2, Package, Pencil, Plus, RefreshCw, Search, XCircle } from 'lucide-vue-next'
import AppModal from '../components/common/AppModal.vue'
import { useToast } from '../composables/useToast'
import { actualizarProducto, crearProducto, listarProductos } from '../services/productosService'
import { listarCategorias } from '../services/categoriasService'

const toast = useToast()
const productos = ref([])
const categorias = ref([])
const cargando = ref(false)
const guardando = ref(false)
const errorCarga = ref('')
const busqueda = ref('')
const formAbierto = ref(false)
const editandoId = ref(null)
const errores = ref({})

const vacio = () => ({
  nombre: '',
  descripcion: '',
  precio: '',
  estado: '1',
  Categoria_idCategoria: null,
})
const form = ref(vacio())

const filtrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return productos.value
  return productos.value.filter((producto) =>
    `${producto.nombre} ${producto.descripcion ?? ''}`.toLowerCase().includes(q),
  )
})

const activos = computed(() => productos.value.filter((producto) => producto.estado === '1').length)

function moneda(valor) {
  return new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(Number(valor))
}

async function cargar() {
  if (cargando.value) return
  cargando.value = true
  errorCarga.value = ''
  try {
    productos.value = await listarProductos()
  } catch (e) {
    errorCarga.value = e.userMessage
  } finally {
    cargando.value = false
  }
}

async function cargarCategorias() {
  try {
    categorias.value = await listarCategorias()
  } catch (e) {
    toast.error(`No se pudieron cargar las categorías: ${e.userMessage}`)
  }
}

function abrirNuevo() {
  editandoId.value = null
  form.value = vacio()
  errores.value = {}
  formAbierto.value = true
}

function abrirEditar(producto) {
  editandoId.value = producto.idProducto
  form.value = {
    nombre: producto.nombre,
    descripcion: producto.descripcion ?? '',
    precio: producto.precio,
    estado: producto.estado,
    Categoria_idCategoria: producto.Categoria_idCategoria ?? null,
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
  if (!f.nombre.trim()) e.nombre = 'El nombre es obligatorio'
  if (!f.precio || Number(f.precio) <= 0) e.precio = 'Ingresa un precio mayor que cero'
  errores.value = e
  return !Object.keys(e).length
}

async function guardar() {
  if (guardando.value || !validar()) return
  guardando.value = true
  const datos = {
    nombre: form.value.nombre.trim(),
    descripcion: form.value.descripcion.trim() || null,
    precio: Number(form.value.precio),
    estado: form.value.estado,
    Categoria_idCategoria: form.value.Categoria_idCategoria
      ? Number(form.value.Categoria_idCategoria)
      : null,
  }
  try {
    if (editandoId.value) {
      await actualizarProducto(editandoId.value, datos)
      toast.exito('Producto actualizado')
    } else {
      await crearProducto(datos)
      toast.exito('Producto registrado')
    }
    formAbierto.value = false
    await cargar()
  } catch (e) {
    toast.error(e.userMessage)
  } finally {
    guardando.value = false
  }
}

async function cambiarEstado(producto) {
  try {
    await actualizarProducto(producto.idProducto, { estado: producto.estado === '1' ? '0' : '1' })
    toast.exito(producto.estado === '1' ? 'Producto desactivado' : 'Producto activado')
    await cargar()
  } catch (e) {
    toast.error(e.userMessage)
  }
}

onMounted(() => {
  cargar()
  cargarCategorias()
})
</script>

<template>
  <div class="cabecera-pagina">
    <div>
      <h2>Productos</h2>
      <p>{{ productos.length }} registrados · {{ activos }} activos</p>
    </div>
    <div class="acciones">
      <label class="buscador">
        <Search :size="18" />
        <input v-model="busqueda" type="search" placeholder="Buscar producto" />
      </label>
      <button class="btn btn-icono" :disabled="cargando" title="Actualizar" @click="cargar">
        <RefreshCw :size="18" />
      </button>
      <button class="btn btn-primario" @click="abrirNuevo">
        <Plus :size="18" /> Nuevo producto
      </button>
    </div>
  </div>

  <section class="tarjeta">
    <div v-if="cargando && !productos.length" class="estado-centro">
      <div class="spinner"></div>
      <p>Cargando productos…</p>
    </div>
    <div v-else-if="errorCarga" class="estado-centro">
      <p class="texto-error">{{ errorCarga }}</p>
      <button class="btn" @click="cargar">Reintentar</button>
    </div>
    <div v-else-if="!productos.length" class="estado-centro">
      <Package :size="36" />
      <p>Todavía no hay productos registrados.</p>
      <button class="btn btn-primario" @click="abrirNuevo">Registrar el primero</button>
    </div>
    <div v-else-if="!filtrados.length" class="estado-centro">
      <p>Ningún producto coincide con «{{ busqueda }}».</p>
    </div>
    <div v-else class="tabla-wrap">
      <table class="tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th class="oculto-movil">Descripción</th>
            <th>Precio</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in filtrados" :key="producto.idProducto">
            <td>
              <div class="producto">
                <span class="icono-producto"><Package :size="18" /></span>
                <div>
                  <strong>{{ producto.nombre }}</strong>
                  <small>ID {{ producto.idProducto }}</small>
                </div>
              </div>
            </td>
            <td class="oculto-movil descripcion">{{ producto.descripcion || 'Sin descripción' }}</td>
            <td>{{ moneda(producto.precio) }}</td>
            <td>
              <span class="estado" :class="producto.estado === '1' ? 'activo' : 'inactivo'">
                {{ producto.estado === '1' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="col-acciones">
              <button class="btn btn-icono" title="Editar" @click="abrirEditar(producto)">
                <Pencil :size="16" />
              </button>
              <button class="btn btn-icono" :title="producto.estado === '1' ? 'Desactivar' : 'Activar'" @click="cambiarEstado(producto)">
                <XCircle v-if="producto.estado === '1'" :size="16" />
                <CheckCircle2 v-else :size="16" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <AppModal :abierto="formAbierto" :titulo="editandoId ? 'Editar producto' : 'Nuevo producto'" @cerrar="cerrarForm">
    <form class="grid-form" novalidate @submit.prevent="guardar">
      <div class="campo ancho">
        <label for="producto-nombre">Nombre *</label>
        <input id="producto-nombre" v-model="form.nombre" :class="{ invalido: errores.nombre }" maxlength="45" autocomplete="off" />
        <span v-if="errores.nombre" class="error-texto">{{ errores.nombre }}</span>
      </div>
      <div class="campo ancho">
        <label for="producto-descripcion">Descripción</label>
        <textarea id="producto-descripcion" v-model="form.descripcion" maxlength="225" rows="3"></textarea>
      </div>
      <div class="campo">
        <label for="producto-precio">Precio *</label>
        <input id="producto-precio" v-model="form.precio" :class="{ invalido: errores.precio }" type="number" min="0.01" step="0.01" />
        <span v-if="errores.precio" class="error-texto">{{ errores.precio }}</span>
      </div>
      <div class="campo">
        <label for="producto-estado">Estado</label>
        <select id="producto-estado" v-model="form.estado">
          <option value="1">Activo</option>
          <option value="0">Inactivo</option>
        </select>
      </div>
      <div class="campo ancho">
        <label for="producto-categoria">Categoría</label>
        <select id="producto-categoria" v-model="form.Categoria_idCategoria">
          <option :value="null">Sin categoría</option>
          <option v-for="categoria in categorias" :key="categoria.idCategoria" :value="categoria.idCategoria">
            {{ categoria.nombre }}
          </option>
        </select>
      </div>
      <div class="acciones-modal ancho">
        <button type="button" class="btn" :disabled="guardando" @click="cerrarForm">Cancelar</button>
        <button type="submit" class="btn btn-primario" :disabled="guardando">
          {{ guardando ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </form>
  </AppModal>
</template>

<style scoped>
.buscador {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.8rem;
  border: 1px solid var(--borde);
  border-radius: 10px;
  background: var(--surface);
  color: var(--texto-suave);
}
.buscador input {
  min-width: 190px;
  padding: 0.6rem 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--texto);
  font: inherit;
}
.producto { display: flex; align-items: center; gap: 0.75rem; }
.producto small { display: block; color: var(--texto-suave); }
.icono-producto {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--surface-2);
  color: var(--acento-2);
}
.descripcion { max-width: 320px; color: var(--texto-suave); }
.estado {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}
.estado.activo { background: color-mix(in srgb, var(--exito) 15%, transparent); color: var(--exito); }
.estado.inactivo { background: color-mix(in srgb, var(--texto-suave) 15%, transparent); color: var(--texto-suave); }
.col-acciones { white-space: nowrap; text-align: right; }
.col-acciones .btn + .btn { margin-left: 0.4rem; }
.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }
.ancho { grid-column: 1 / -1; }
.campo textarea { resize: vertical; }

@media (max-width: 640px) {
  .oculto-movil { display: none; }
  .grid-form { grid-template-columns: 1fr; }
  .buscador, .buscador input { width: 100%; min-width: 0; }
  .acciones { width: 100%; }
}
</style>
