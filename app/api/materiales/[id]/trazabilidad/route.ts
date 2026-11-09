export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const { id } = await params
    const material = await prisma.material.findUnique({ where: { id } })
    if (!material) return NextResponse.json({ error: 'Material no encontrado' }, { status: 404 })
    const movimientos = await prisma.movimiento.findMany({
      where: { materialId: id },
      include: { usuario: { select: { name: true, email: true } } },
      orderBy: { fecha: 'desc' },
    })
    return NextResponse.json({ material, movimientos })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 })
  }
}
