export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { puedeAprobar } from '@/lib/inventario'
import { auth } from '@/auth'

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const { id } = await params
    const rol = (session.user as any).rol
    const orden = await prisma.ordenCompra.findUnique({ where: { id } })
    if (!orden) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    if (!puedeAprobar(rol, orden.nivelAprobacionReq)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }
    const updated = await prisma.ordenCompra.update({
      where: { id },
      data: { estado: 'RECHAZADA', aprobadoPorId: (session.user as any).id },
    })
    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 })
  }
}
