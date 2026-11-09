// Funciones de lógica de negocio para el sistema de inventario

import { prisma } from '@/lib/prisma'

/** Stock de seguridad: SS = (demanda_max - demanda_prom) × tiempo_entrega */
export function calcStockSeguridad(demandaMax: number, demandaProm: number, tiempoEntrega: number): number {
  return (demandaMax - demandaProm) * tiempoEntrega
}

/** Punto de reorden: PR = demanda_prom × tiempo_entrega + SS */
export function calcPuntoReorden(demandaProm: number, tiempoEntrega: number, ss: number): number {
  return demandaProm * tiempoEntrega + ss
}

/** Calcula stock actual de un material sumando movimientos */
export async function calcStockActual(materialId: string): Promise<number> {
  const entradas = await prisma.movimiento.aggregate({
    where: { materialId, tipo: { in: ['ENTRADA', 'AJUSTE'] } },
    _sum: { cantidad: true },
  })
  const salidas = await prisma.movimiento.aggregate({
    where: { materialId, tipo: 'SALIDA' },
    _sum: { cantidad: true },
  })
  return (entradas._sum.cantidad ?? 0) - (salidas._sum.cantidad ?? 0)
}

/** Estado del material basado en stock actual vs PR */
export function estadoMaterial(stockActual: number, pr: number): 'CRITICO' | 'ALERTA' | 'OK' {
  if (stockActual <= pr) return 'CRITICO'
  if (stockActual <= pr * 1.2) return 'ALERTA'
  return 'OK'
}

/** Matriz de aprobación: determina nivel según monto total */
export function nivelAprobacion(monto: number): string {
  if (monto <= 250000) return 'JEFATURA_AREA'
  if (monto <= 2000000) return 'JEFATURA_COMPRAS'
  if (monto <= 10000000) return 'GERENCIA_FINANCIERA'
  return 'GERENCIA_GENERAL'
}

/** Verifica si el rol del usuario puede aprobar un nivel dado */
export function puedeAprobar(rolUsuario: string, nivelReq: string): boolean {
  const jerarquia: Record<string, number> = {
    'JEFATURA_AREA': 1,
    'JEFATURA_COMPRAS': 2,
    'GERENCIA_FINANCIERA': 3,
    'GERENCIA_GENERAL': 4,
    'ADMIN': 5,
  }
  return (jerarquia[rolUsuario] ?? 0) >= (jerarquia[nivelReq] ?? 99)
}

/** Formatea colones */
export function formatColones(monto: number): string {
  return `₡${monto.toLocaleString('es-CR')}`
}
