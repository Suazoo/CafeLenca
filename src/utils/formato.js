const fmtMoneda = new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' })
export const formatearMoneda = (v) => fmtMoneda.format(Number(v) || 0)

export function formatearFecha(iso) {
  if (!iso) return '—'
  // La API devuelve fechas sin zona horaria (hora UTC): se marcan como UTC para mostrarlas en hora local
  const conZona = /(Z|[+-]\d{2}:\d{2})$/.test(iso) ? iso : `${iso}Z`
  return new Intl.DateTimeFormat('es-HN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(conZona))
}

export const nombreCompleto = (p) =>
  [p.Pnombre, p.Snombre, p.Papellido, p.Sapellido].filter(Boolean).join(' ')

export const iniciales = (p) => `${p.Pnombre[0] ?? ''}${p.Papellido[0] ?? ''}`.toUpperCase()