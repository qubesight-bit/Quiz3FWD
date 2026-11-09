export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nivelAprobacion } from '@/lib/inventario'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const ordenes = await prisma.ordenCompra.findMany({
      include: {
        proveedor: { select: { nombre: true, codigo: true } },
        lineas: {
          include: { material: { select: { codigo: true, nombre: true, unidad: true } } },
        },
        aprobadoPor: { select: { name: true } },
      },
      orderBy: { fecha: 'desc' },
    })
    return NextResponse.json(ordenes)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const body = await req.json()
    const { numeroOC, fecha, area, proveedorId, lineas } = body ?? {}
    if (!numeroOC || !area || !proveedorId || !lineas?.length) {
      return NextResponse.json({ error: 'Campos requeridos' }, { status: 400 })
    }
    const montoTotal = (lineas as any[]).reduce(
      (sum: number, l: any) => sum + (Number(l.cantidad) * Number(l.precioUnitario)),
      0
    )
    const nivel = nivelAprobacion(montoTotal)
    const orden = await prisma.ordenCompra.create({
      data: {
        numeroOC,
        fecha: fecha ? new Date(fecha) : new Date(),
        area,
        proveedorId,
        montoTotal,
        nivelAprobacionReq: nivel as any,
        lineas: {
          create: (lineas as any[]).map((l: any) => ({
            materialId: l.materialId,
            cantidad: Number(l.cantidad),
            precioUnitario: Number(l.precioUnitario),
            precioContrato: l.precioContrato ? Number(l.precioContrato) : null,
          })),
        },
      },
      include: { lineas: true },
    })
    return NextResponse.json(orden, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 })
  }
}
