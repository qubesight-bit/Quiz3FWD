export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcStockSeguridad, calcPuntoReorden, calcStockActual, estadoMaterial } from '@/lib/inventario'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    // Materiales con stock calculado
    const materiales = await prisma.material.findMany()
    const materialesConStock = await Promise.all(
      materiales.map(async (m: any) => {
        const stockActual = await calcStockActual(m.id)
        const ss = calcStockSeguridad(m.demandaMaxDia, m.demandaPromDia, m.tiempoEntregaDias)
        const pr = calcPuntoReorden(m.demandaPromDia, m.tiempoEntregaDias, ss)
        const estado = estadoMaterial(stockActual, pr)
        return { ...m, stockActual, stockSeguridad: ss, puntoReorden: pr, estado }
      })
    )

    // Conteos
    const alertasActivas = await prisma.alerta.count({ where: { resuelta: false } })
    const ocsPendientes = await prisma.ordenCompra.count({ where: { estado: 'PENDIENTE_APROBACION' } })
    const materialesBajoReorden = materialesConStock.filter((m: any) => m.estado === 'CRITICO').length

    // Duplicados
    const duplicados = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT a.id) as count
      FROM ordenes_compra a
      JOIN ordenes_compra b ON a.proveedor_id = b.proveedor_id AND a.id < b.id
      JOIN lineas_oc la ON la.orden_compra_id = a.id
      JOIN lineas_oc lb ON lb.orden_compra_id = b.id AND la.material_id = lb.material_id
      WHERE ABS(EXTRACT(EPOCH FROM (a.fecha - b.fecha)) / 86400) <= 3
        AND lb.cantidad BETWEEN la.cantidad * 0.8 AND la.cantidad * 1.2
    ` as any[]
    const numDuplicados = Number(duplicados?.[0]?.count ?? 0)

    // Alertas recientes
    const alertasRecientes = await prisma.alerta.findMany({
      where: { resuelta: false },
      include: { material: { select: { codigo: true, nombre: true } } },
      orderBy: { fecha: 'desc' },
      take: 5,
    })

    // Últimos movimientos
    const ultimosMovimientos = await prisma.movimiento.findMany({
      include: {
        material: { select: { codigo: true, nombre: true } },
        usuario: { select: { name: true } },
      },
      orderBy: { fecha: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      kpis: {
        totalMateriales: materiales.length,
        materialesBajoReorden,
        alertasActivas,
        ocsPendientes,
        numDuplicados,
      },
      materiales: materialesConStock,
      alertasRecientes,
      ultimosMovimientos,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 })
  }
}
