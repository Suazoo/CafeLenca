<script setup>
import { onMounted, ref } from 'vue'
import { FolderTree, Plus, RefreshCw } from 'lucide-vue-next'
import AppModal from '../components/common/AppModal.vue'
import { useToast } from '../composables/useToast'
import { crearCategoria, listarCategorias } from '../services/categoriasService'

const toast = useToast()
const categorias = ref([])
const cargando = ref(false)
const error = ref('')
const formAbierto = ref(false)
const guardando = ref(false)
const form = ref({ nombre: '', descripcion: '' })
async function cargar() { cargando.value = true; error.value = ''; try { categorias.value = await listarCategorias() } catch (e) { error.value = e.userMessage } finally { cargando.value = false } }
function abrirNuevo() { form.value = { nombre: '', descripcion: '' }; formAbierto.value = true }
async function guardar() { if (guardando.value || !form.value.nombre.trim()) { toast.error('Escribe el nombre de la categoría.'); return }; guardando.value = true; try { await crearCategoria({ nombre: form.value.nombre.trim(), descripcion: form.value.descripcion.trim() || null, estado: '1' }); toast.exito('Categoría creada correctamente'); formAbierto.value = false; await cargar() } catch (e) { toast.error(e.userMessage) } finally { guardando.value = false } }
onMounted(cargar)
</script>

<template>
  <div class="cabecera-pagina"><div><p class="eyebrow">Organización del catálogo</p><h2>Categorías</h2><p>{{ categorias.length }} categorías activas</p></div><div class="acciones"><button class="btn" :disabled="cargando" @click="cargar"><RefreshCw :size="17" /> Actualizar</button><button class="btn btn-primario" @click="abrirNuevo"><Plus :size="17" /> Nueva categoría</button></div></div>
  <section class="categoria-grid"><article v-for="categoria in categorias" :key="categoria.idCategoria" class="tarjeta categoria"><span class="categoria-icono"><FolderTree :size="21" /></span><div><h3>{{ categoria.nombre }}</h3><p>{{ categoria.descripcion || 'Sin descripción' }}</p></div><small>ID {{ categoria.idCategoria }}</small></article></section>
  <section v-if="error" class="tarjeta estado-centro"><p class="texto-error">{{ error }}</p><button class="btn" @click="cargar">Reintentar</button></section>
  <AppModal :abierto="formAbierto" titulo="Nueva categoría" @cerrar="formAbierto = false"><form class="form-categoria" @submit.prevent="guardar"><div class="campo"><label for="categoria-nombre">Nombre *</label><input id="categoria-nombre" v-model="form.nombre" maxlength="45" required /></div><div class="campo"><label for="categoria-descripcion">Descripción</label><textarea id="categoria-descripcion" v-model="form.descripcion" maxlength="225" rows="3"></textarea></div><div class="acciones-modal"><button type="button" class="btn" @click="formAbierto = false">Cancelar</button><button class="btn btn-primario" :disabled="guardando">{{ guardando ? 'Guardando…' : 'Crear categoría' }}</button></div></form></AppModal>
</template>

<style scoped>
.eyebrow { margin: 0 0 .25rem !important; color: var(--acento-2) !important; font-size: .75rem !important; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }.categoria-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }.categoria { display: grid; gap: .8rem; }.categoria-icono { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; background: var(--surface-2); color: var(--acento-2); }.categoria h3 { margin: 0; font-size: 1rem; }.categoria p { margin: .3rem 0 0; color: var(--texto-suave); font-size: .82rem; line-height: 1.4; }.categoria small { color: var(--texto-suave); font-size: .72rem; }.form-categoria { display: grid; gap: .9rem; }.campo { display: grid; gap: .3rem; }.campo label { color: var(--texto-suave); font-size: .8rem; font-weight: 600; }.campo input, .campo textarea { padding: .6rem .7rem; border: 1px solid var(--borde); border-radius: 9px; background: var(--surface); color: var(--texto); font: inherit; }.campo textarea { resize: vertical; }
@media (max-width: 800px) { .categoria-grid { grid-template-columns: repeat(2, 1fr); } } @media (max-width: 500px) { .categoria-grid { grid-template-columns: 1fr; } }
</style>
