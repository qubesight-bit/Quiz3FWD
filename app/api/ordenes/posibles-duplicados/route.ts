export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

/**
 * Regla de detección de duplicados:
 * Dos OC se consideran posibles duplicados cuando:
 * 1. Mismo proveedor
 * 2. Mismo material (al menos una línea con el mismo material)
 * 3. Cantidad dentro del ±20%
 * 4. Diferencia de fecha ≤ 3 días
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const duplicados = await prisma.$queryRaw`
      SELECT
        a.id AS oc_a_id,
        a.numero_oc AS oc_a_numero,
        a.fecha AS oc_a_fecha,
        b.id AS oc_b_id,
        b.numero_oc AS oc_b_numero,
        b.fecha AS oc_b_fecha,
        p.nombre AS proveedor,
        m.nombre AS material,
        la.cantidad AS cantidad_a,
        lb.cantidad AS cantidad_b,
        ABS(EXTRACT(DAY FROM (a.fecha - b.fecha))) AS dias_diferencia
      FROM ordenes_compra a
      JOIN ordenes_compra b ON a.proveedor_id = b.proveedor_id AND a.id < b.id
      JOIN lineas_oc la ON la.orden_compra_id = a.id
      JOIN lineas_oc lb ON lb.orden_compra_id = b.id AND la.material_id = lb.material_id
      JOIN proveedores p ON p.id = a.proveedor_id
      JOIN materiales m ON m.id = la.material_id
      WHERE ABS(EXTRACT(EPOCH FROM (a.fecha - b.fecha)) / 86400) <= 3
        AND lb.cantidad BETWEEN la.cantidad * 0.8 AND la.cantidad * 1.2
      ORDER BY a.fecha DESC
    ` as any[]

    return NextResponse.json(duplicados ?? [])
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 })
  }
}
