export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const alertas = await prisma.alerta.findMany({
      where: { resuelta: false },
      include: { material: { select: { codigo: true, nombre: true, unidad: true } } },
      orderBy: { fecha: 'desc' },
    })
    return NextResponse.json(alertas)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 })
  }
}
