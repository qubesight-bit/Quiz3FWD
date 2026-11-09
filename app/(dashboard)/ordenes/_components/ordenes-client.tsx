'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle, XCircle, AlertTriangle, FileText, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { FadeIn } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { useSession } from 'next-auth/react'

function estadoOCBadge(estado: string) {
  switch (estado) {
    case 'APROBADA': return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Aprobada</Badge>
    case 'RECHAZADA': return <Badge variant="destructive">Rechazada</Badge>
    default: return <Badge className="bg-amber-500 text-white hover:bg-amber-600">Pendiente</Badge>
  }
}

const nivelLabels: Record<string, string> = {
  JEFATURA_AREA: 'Jefatura de Área',
  JEFATURA_COMPRAS: 'Jefatura de Compras',
  GERENCIA_FINANCIERA: 'Gerencia Financiera',
  GERENCIA_GENERAL: 'Gerencia General',
}

export function OrdenesClient() {
  const { data: session } = useSession()
  const [ordenes, setOrdenes] = useState<any[]>([])
  const [duplicados, setDuplicados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/ordenes').then((r) => r.json()),
      fetch('/api/ordenes/posibles-duplicados').then((r) => r.json()),
    ])
      .then(([ords, dups]) => {
        setOrdenes(Array.isArray(ords) ? ords : [])
        setDuplicados(Array.isArray(dups) ? dups : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const duplicadoIds = new Set<string>()
  ;(duplicados ?? []).forEach((d: any) => {
    if (d.oc_a_id) duplicadoIds.add(d.oc_a_id)
    if (d.oc_b_id) duplicadoIds.add(d.oc_b_id)
  })

  const handleAprobar = async (id: string) => {
    try {
      const res = await fetch(`/api/ordenes/${id}/aprobar`, { method: 'PUT' })
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d?.error ?? 'Error'); return }
      toast.success('Orden aprobada')
      fetchData()
    } catch { toast.error('Error') }
  }

  const handleRechazar = async (id: string) => {
    try {
      const res = await fetch(`/api/ordenes/${id}/rechazar`, { method: 'PUT' })
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d?.error ?? 'Error'); return }
      toast.success('Orden rechazada')
      fetchData()
    } catch { toast.error('Error') }
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Órdenes de Compra</h1>
          <p className="text-muted-foreground">Gestión y aprobación de órdenes de compra con detección de duplicados</p>
        </div>
      </FadeIn>

      {(duplicados ?? []).length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Copy className="h-5 w-5 text-orange-500" />
              <h3 className="font-display font-semibold text-orange-700 dark:text-orange-400">Posibles Duplicados Detectados</h3>
            </div>
            <div className="space-y-2">
              {(duplicados ?? []).map((d: any, i: number) => (
                <div key={i} className="text-sm p-2 bg-white dark:bg-card rounded">
                  <span className="font-mono font-medium">{d.oc_a_numero}</span> y <span className="font-mono font-medium">{d.oc_b_numero}</span>
                  {' '}— {d.proveedor}, {d.material}, cantidades {d.cantidad_a}/{d.cantidad_b}, diferencia {Number(d.dias_diferencia ?? 0).toFixed(0)} días
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Regla:</strong> Mismo proveedor, mismo material, cantidad ±20%, fechas ≤3 días
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead># OC</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Materiales</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Nivel Aprobación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Sobreprecio</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Cargando...</TableCell></TableRow>
              ) : (ordenes ?? []).map((oc: any) => {
                const isDup = duplicadoIds.has(oc.id)
                const hasSobreprecio = (oc.lineas ?? []).some((l: any) => l.precioContrato && l.precioUnitario > l.precioContrato)
                return (
                  <TableRow key={oc.id} className={isDup ? 'bg-orange-50 dark:bg-orange-950/10' : ''}>
                    <TableCell className="font-mono font-medium">
                      {isDup && <Copy className="h-3 w-3 text-orange-500 inline mr-1" />}
                      {oc.numeroOC}
                    </TableCell>
                    <TableCell><SafeDate date={oc.fecha} options={{ dateStyle: 'short' }} /></TableCell>
                    <TableCell>{oc.area}</TableCell>
                    <TableCell>{oc.proveedor?.nombre ?? ''}</TableCell>
                    <TableCell className="text-sm">
                      {(oc.lineas ?? []).map((l: any) => (
                        <div key={l.id}>{l.material?.nombre} x {l.cantidad}</div>
                      ))}
                    </TableCell>
                    <TableCell className="text-right font-mono">₡{oc.montoTotal?.toLocaleString?.('es-CR') ?? oc.montoTotal}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{nivelLabels[oc.nivelAprobacionReq] ?? oc.nivelAprobacionReq}</Badge></TableCell>
                    <TableCell>{estadoOCBadge(oc.estado)}</TableCell>
                    <TableCell>
                      {hasSobreprecio ? (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Sí
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {oc.estado === 'PENDIENTE_APROBACION' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => handleAprobar(oc.id)}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Aprobar
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleRechazar(oc.id)}>
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {oc.estado !== 'PENDIENTE_APROBACION' && (
                        <span className="text-xs text-muted-foreground">{oc.aprobadoPor?.name ?? '-'}</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <h3 className="font-display font-semibold mb-3">Matriz de Aprobación</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rango de Monto</TableHead>
                <TableHead>Nivel Requerido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow><TableCell>Hasta ₡250,000</TableCell><TableCell>Jefatura del Área</TableCell></TableRow>
              <TableRow><TableCell>₡250,001 - ₡2,000,000</TableCell><TableCell>Jefatura de Compras</TableCell></TableRow>
              <TableRow><TableCell>₡2,000,001 - ₡10,000,000</TableCell><TableCell>Gerencia Financiera</TableCell></TableRow>
              <TableRow><TableCell>Más de ₡10,000,000</TableCell><TableCell>Gerencia General</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
