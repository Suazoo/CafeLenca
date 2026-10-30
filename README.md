# Cafe Lenca - Frontend

Frontend administrativo desarrollado con Vue 3 y Vite para gestionar productos, clientes,
pedidos, facturacion, inventario, reservas, categorias, reportes y el motor logico.

## Iniciar el frontend

```powershell
npm install
npm run dev
```


## Motor logico e IA

La pantalla **Motor logico** permite escribir lo que solicita el cliente, por ejemplo:

```text
Quiero algo dulce y barato para acompanar el cafe
```

El frontend envia la solicitud al backend mediante:

```text
POST /motor-logico/ia
```

El backend valida primero los productos con sus reglas de negocio y luego usa Gemini como
complemento para interpretar la preferencia del cliente. La API key de Gemini nunca se guarda
en este frontend; permanece como secreto en el backend de Render.

Si la IA no responde, la pantalla mantiene las recomendaciones normales del motor logico.

### Utilidades de IA disponibles

Ademas del motor logico principal, el frontend incluye estas utilidades:

- **Asistente de pedidos**, en **Pedidos**. Convierte una solicitud escrita en una
  propuesta de productos y cantidades usando el catalogo validado:
  `POST /motor-logico/ia/pedido`.
- **Resumen inteligente de ventas**, en **Reportes**. Analiza el reporte cargado y
  muestra un resumen, puntos clave y una recomendacion:
  `POST /motor-logico/ia/resumen-ventas`.
- **Priorizacion de inventario**, en **Inventario**. Ordena las alertas de stock bajo
  y propone una accion:
  `POST /motor-logico/ia/alertas-inventario`.

Las tres funciones consultan al backend; la clave de Gemini nunca se expone en el
navegador. Si la IA no esta disponible, las pantallas mantienen sus datos normales
y muestran el error mediante una notificacion.

La integracion se encuentra en:

- `src/views/MotorLogicoView.vue`
- `src/views/PedidosView.vue`
- `src/views/ReportesView.vue`
- `src/views/InventarioView.vue`
- `src/services/motorLogicoService.js`
