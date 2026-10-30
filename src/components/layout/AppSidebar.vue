<script setup>
import {
  LayoutDashboard, Users, Package, ShoppingBag,
  Boxes, TrendingUp, Lightbulb, CalendarDays, Tags,
} from 'lucide-vue-next'
import logoCafeLenca from '../../assets/cafe-lenca-logo.png'

defineProps({ abierto: Boolean })
defineEmits(['cerrar'])

const enlaces = [
  { to: '/', texto: 'Dashboard', icono: LayoutDashboard },
  { to: '/clientes', texto: 'Clientes', icono: Users },
  { to: '/productos', texto: 'Productos', icono: Package },
  { to: '/pedidos', texto: 'Pedidos', icono: ShoppingBag },
  { to: '/inventario', texto: 'Inventario', icono: Boxes },
  { to: '/reservas', texto: 'Reservas', icono: CalendarDays },
  { to: '/categorias', texto: 'Categorías', icono: Tags },
  { to: '/reportes', texto: 'Reportes', icono: TrendingUp },
  { to: '/motor-logico', texto: 'Motor lógico', icono: Lightbulb },
]
</script>

<template>
  <div v-if="abierto" class="fondo" @click="$emit('cerrar')"></div>
  <aside class="sidebar" :class="{ abierto }">
    <div class="marca">
      <img class="logo" :src="logoCafeLenca" alt="Logo de Café Lenca" />
      <span class="nombre">Café Lenca</span>
    </div>
    <nav>
      <RouterLink
        v-for="e in enlaces"
        :key="e.to"
        :to="e.to"
        :title="e.texto"
        class="enlace"
        active-class="activo"
      >
        <component :is="e.icono" :size="20" />
        <span>{{ e.texto }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--sidebar-ancho);
  background: linear-gradient(180deg, var(--sidebar-1), var(--sidebar-2));
  color: #e8d9bf;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 20;
  transition: transform 0.25s ease;
}
.marca {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 1.4rem 1.25rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff3dd;
}
.logo {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 12px;
  object-fit: cover;
  object-position: center;
  background: #f7eee1;
  box-shadow: 0 4px 12px rgba(200, 135, 58, 0.4);
}
nav {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.5rem 0.8rem;
}
.enlace {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.75rem 0.95rem;
  border-radius: 12px;
  color: #d9c7a8;
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;
}
.enlace:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff3dd;
}
.enlace.activo {
  background: linear-gradient(135deg, #e0a050, #c8873a);
  color: #2b1a12;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(200, 135, 58, 0.35);
}
.fondo {
  display: none;
}

/* Tablet: menú compacto, solo iconos */
@media (min-width: 768px) and (max-width: 1099px) {
  .nombre,
  .enlace span {
    display: none;
  }
  .marca {
    justify-content: center;
    padding: 1.4rem 0;
  }
  .enlace {
    justify-content: center;
    padding: 0.8rem 0;
  }
  nav {
    padding: 0.5rem 0.6rem;
  }
}

/* Móvil: menú tipo cajón */
@media (max-width: 767px) {
  .sidebar {
    width: 270px;
    transform: translateX(-100%);
  }
  .sidebar.abierto {
    transform: translateX(0);
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
  }
  .fondo {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 15;
  }
}
</style>