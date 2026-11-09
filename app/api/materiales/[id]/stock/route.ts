export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcStockSeguridad, calcPuntoReorden, calcStockActual, estadoMaterial } from '@/lib/inventario'
import { auth } from '@/auth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const { id } = await params
    const m = await prisma.material.findUnique({ where: { id } })
    if (!m) return NextResponse.json({ error: 'Material no encontrado' }, { status: 404 })
    const stockActual = await calcStockActual(m.id)
    const ss = calcStockSeguridad(m.demandaMaxDia, m.demandaPromDia, m.tiempoEntregaDias)
    const pr = calcPuntoReorden(m.demandaPromDia, m.tiempoEntregaDias, ss)
    return NextResponse.json({
      ...m,
      stockActual,
      stockSeguridad: ss,
      puntoReorden: pr,
      estado: estadoMaterial(stockActual, pr),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 })
  }
}
