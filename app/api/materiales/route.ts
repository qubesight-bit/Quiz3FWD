export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcStockSeguridad, calcPuntoReorden, calcStockActual, estadoMaterial } from '@/lib/inventario'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const materiales = await prisma.material.findMany({ orderBy: { codigo: 'asc' } })
    const result = await Promise.all(
      materiales.map(async (m: any) => {
        const stockActual = await calcStockActual(m.id)
        const ss = calcStockSeguridad(m.demandaMaxDia, m.demandaPromDia, m.tiempoEntregaDias)
        const pr = calcPuntoReorden(m.demandaPromDia, m.tiempoEntregaDias, ss)
        const estado = estadoMaterial(stockActual, pr)
        return {
          id: m.id,
          codigo: m.codigo,
          nombre: m.nombre,
          unidad: m.unidad,
          demandaPromDia: m.demandaPromDia,
          demandaMaxDia: m.demandaMaxDia,
          tiempoEntregaDias: m.tiempoEntregaDias,
          stockMaximo: m.stockMaximo,
          ubicacion: m.ubicacion,
          stockActual,
          stockSeguridad: ss,
          puntoReorden: pr,
          estado,
        }
      })
    )
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await req.json()
    const { codigo, nombre, unidad, demandaPromDia, demandaMaxDia, tiempoEntregaDias, stockMaximo, ubicacion } = body ?? {}
    if (!codigo || !nombre || !unidad) {
      return NextResponse.json({ error: 'Campos requeridos: codigo, nombre, unidad' }, { status: 400 })
    }
    const material = await prisma.material.create({
      data: {
        codigo, nombre, unidad,
        demandaPromDia: Number(demandaPromDia) || 0,
        demandaMaxDia: Number(demandaMaxDia) || 0,
        tiempoEntregaDias: Number(tiempoEntregaDias) || 1,
        stockMaximo: stockMaximo ? Number(stockMaximo) : null,
        ubicacion: ubicacion || 'Bodega Principal',
      },
    })
    return NextResponse.json(material, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 })
  }
}
