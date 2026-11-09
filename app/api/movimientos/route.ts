export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcStockActual, calcStockSeguridad, calcPuntoReorden } from '@/lib/inventario'
import { auth } from '@/auth'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const materialId = searchParams.get('materialId')
    const where = materialId ? { materialId } : {}
    const movimientos = await prisma.movimiento.findMany({
      where,
      include: {
        material: { select: { codigo: true, nombre: true, unidad: true } },
        usuario: { select: { name: true } },
      },
      orderBy: { fecha: 'desc' },
      take: 100,
    })
    return NextResponse.json(movimientos)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const body = await req.json()
    const { materialId, tipo, cantidad, documentoOrigen, notas, ubicacionOrigen, ubicacionDestino } = body ?? {}
    if (!materialId || !tipo || !cantidad) {
      return NextResponse.json({ error: 'Campos requeridos: materialId, tipo, cantidad' }, { status: 400 })
    }
    if (!['ENTRADA', 'SALIDA', 'TRASLADO', 'AJUSTE'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }
    const material = await prisma.material.findUnique({ where: { id: materialId } })
    if (!material) return NextResponse.json({ error: 'Material no encontrado' }, { status: 404 })

    const movimiento = await prisma.movimiento.create({
      data: {
        materialId,
        tipo,
        cantidad: Number(cantidad),
        fecha: new Date(),
        usuarioId: (session.user as any).id,
        documentoOrigen: documentoOrigen || null,
        notas: notas || null,
        ubicacionOrigen: ubicacionOrigen || null,
        ubicacionDestino: ubicacionDestino || material.ubicacion,
      },
    })

    // Verificar si stock cae bajo PR → generar alerta
    const stockActual = await calcStockActual(materialId)
    const ss = calcStockSeguridad(material.demandaMaxDia, material.demandaPromDia, material.tiempoEntregaDias)
    const pr = calcPuntoReorden(material.demandaPromDia, material.tiempoEntregaDias, ss)
    if (stockActual <= pr) {
      const alertaExistente = await prisma.alerta.findFirst({
        where: { materialId, tipo: 'REORDEN', resuelta: false },
      })
      if (!alertaExistente) {
        await prisma.alerta.create({
          data: {
            materialId,
            tipo: 'REORDEN',
            mensaje: `Stock de ${material.nombre} (${stockActual} ${material.unidad}) bajo punto de reorden (${pr} ${material.unidad})`,
          },
        })
      }
    }
    return NextResponse.json(movimiento, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 })
  }
}
