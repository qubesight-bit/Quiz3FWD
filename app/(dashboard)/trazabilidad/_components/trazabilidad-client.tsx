'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Wrench, Package } from 'lucide-react'
import { FadeIn } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'

const tipoIcons: Record<string, any> = {
  ENTRADA: ArrowDownCircle,
  SALIDA: ArrowUpCircle,
  TRASLADO: ArrowLeftRight,
  AJUSTE: Wrench,
}
const tipoColors: Record<string, string> = {
  ENTRADA: 'text-emerald-500',
  SALIDA: 'text-destructive',
  TRASLADO: 'text-blue-500',
  AJUSTE: 'text-amber-500',
}

export function TrazabilidadClient() {
  const [materiales, setMateriales] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [trazabilidad, setTrazabilidad] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/materiales')
      .then((r) => r.json())
      .then((d) => setMateriales(Array.isArray(d) ? d : []))
      .catch(console.error)
  }, [])

  const fetchTrazabilidad = useCallback((id: string) => {
    if (!id) return
    setLoading(true)
    fetch(`/api/materiales/${id}/trazabilidad`)
      .then((r) => r.json())
      .then((d) => setTrazabilidad(d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    fetchTrazabilidad(id)
  }

  const selectedMat = materiales.find((m: any) => m.id === selectedId)

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Trazabilidad</h1>
          <p className="text-muted-foreground">Consulte el historial completo de movimientos por material</p>
        </div>
      </FadeIn>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 max-w-md">
              <Select value={selectedId} onValueChange={handleSelect}>
                <SelectTrigger><SelectValue placeholder="Seleccione un material para ver su trazabilidad" /></SelectTrigger>
                <SelectContent>
                  {(materiales ?? []).map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>{m.codigo} - {m.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedMat && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {selectedMat.nombre}
              <Badge variant="outline" className="ml-2">{selectedMat.codigo}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Stock Actual</p>
                <p className="text-lg font-bold font-mono">{selectedMat.stockActual} {selectedMat.unidad}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Stock Seguridad</p>
                <p className="text-lg font-bold font-mono">{selectedMat.stockSeguridad}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Punto Reorden</p>
                <p className="text-lg font-bold font-mono">{selectedMat.puntoReorden}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Estado</p>
                <div className="mt-1">
                  {selectedMat.estado === 'CRITICO' ? <Badge variant="destructive">Crítico</Badge> :
                   selectedMat.estado === 'ALERTA' ? <Badge className="bg-amber-500 text-white">Alerta</Badge> :
                   <Badge className="bg-emerald-500 text-white">OK</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && <p className="text-center text-muted-foreground py-8">Cargando historial...</p>}

      {trazabilidad?.movimientos && !loading && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-display">Historial de Movimientos ({(trazabilidad.movimientos ?? []).length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(trazabilidad.movimientos ?? []).map((m: any) => {
                  const Icon = tipoIcons[m.tipo] ?? ArrowDownCircle
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${tipoColors[m.tipo] ?? ''}`} />
                          <span>{m.tipo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{m.cantidad}</TableCell>
                      <TableCell className="font-mono text-sm">{m.documentoOrigen ?? '-'}</TableCell>
                      <TableCell className="text-sm">{m.ubicacionOrigen ?? '-'}</TableCell>
                      <TableCell className="text-sm">{m.ubicacionDestino ?? '-'}</TableCell>
                      <TableCell className="text-sm">{m.usuario?.name ?? '-'}</TableCell>
                      <TableCell><SafeDate date={m.fecha} options={{ dateStyle: 'short' }} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{m.notas ?? '-'}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
