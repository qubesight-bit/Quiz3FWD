'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Package, Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { FadeIn } from '@/components/ui/animate'

function estadoBadge(estado: string) {
  switch (estado) {
    case 'CRITICO': return <Badge variant="destructive">Crítico</Badge>
    case 'ALERTA': return <Badge className="bg-amber-500 text-white hover:bg-amber-600">Alerta</Badge>
    default: return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">OK</Badge>
  }
}

export function MaterialesClient() {
  const [materiales, setMateriales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewMaterial, setShowNewMaterial] = useState(false)
  const [showMovimiento, setShowMovimiento] = useState<string | null>(null)
  const [newMaterial, setNewMaterial] = useState({ codigo: '', nombre: '', unidad: 'unidades', demandaPromDia: '', demandaMaxDia: '', tiempoEntregaDias: '', stockMaximo: '' })
  const [movForm, setMovForm] = useState({ tipo: 'ENTRADA', cantidad: '', documentoOrigen: '', notas: '' })

  const fetchMateriales = useCallback(() => {
    setLoading(true)
    fetch('/api/materiales')
      .then((r) => r.json())
      .then((d) => setMateriales(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchMateriales() }, [fetchMateriales])

  const handleCreateMaterial = async () => {
    try {
      const res = await fetch('/api/materiales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d?.error ?? 'Error'); return }
      toast.success('Material creado')
      setShowNewMaterial(false)
      setNewMaterial({ codigo: '', nombre: '', unidad: 'unidades', demandaPromDia: '', demandaMaxDia: '', tiempoEntregaDias: '', stockMaximo: '' })
      fetchMateriales()
    } catch { toast.error('Error al crear material') }
  }

  const handleMovimiento = async () => {
    if (!showMovimiento) return
    try {
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: showMovimiento, ...movForm }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d?.error ?? 'Error'); return }
      toast.success('Movimiento registrado')
      setShowMovimiento(null)
      setMovForm({ tipo: 'ENTRADA', cantidad: '', documentoOrigen: '', notas: '' })
      fetchMateriales()
    } catch { toast.error('Error') }
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight">Materiales</h1>
            <p className="text-muted-foreground">Inventario de materiales con stock calculado automáticamente</p>
          </div>
          <Dialog open={showNewMaterial} onOpenChange={setShowNewMaterial}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Nuevo Material</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Agregar Material</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Código</Label><Input value={newMaterial.codigo} onChange={(e: any) => setNewMaterial({...newMaterial, codigo: e.target.value})} placeholder="MAT-005" /></div>
                  <div><Label>Unidad</Label><Input value={newMaterial.unidad} onChange={(e: any) => setNewMaterial({...newMaterial, unidad: e.target.value})} /></div>
                </div>
                <div><Label>Nombre</Label><Input value={newMaterial.nombre} onChange={(e: any) => setNewMaterial({...newMaterial, nombre: e.target.value})} placeholder="Nombre del material" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Demanda Prom/día</Label><Input type="number" value={newMaterial.demandaPromDia} onChange={(e: any) => setNewMaterial({...newMaterial, demandaPromDia: e.target.value})} /></div>
                  <div><Label>Demanda Máx/día</Label><Input type="number" value={newMaterial.demandaMaxDia} onChange={(e: any) => setNewMaterial({...newMaterial, demandaMaxDia: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Tiempo Entrega (días)</Label><Input type="number" value={newMaterial.tiempoEntregaDias} onChange={(e: any) => setNewMaterial({...newMaterial, tiempoEntregaDias: e.target.value})} /></div>
                  <div><Label>Stock Máximo</Label><Input type="number" value={newMaterial.stockMaximo} onChange={(e: any) => setNewMaterial({...newMaterial, stockMaximo: e.target.value})} /></div>
                </div>
                <Button onClick={handleCreateMaterial} className="w-full">Guardar Material</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </FadeIn>

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Stock Actual</TableHead>
                <TableHead className="text-right">SS</TableHead>
                <TableHead className="text-right">PR</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Cargando...</TableCell></TableRow>
              ) : (materiales ?? []).map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-sm">{m.codigo}</TableCell>
                  <TableCell className="font-medium">{m.nombre}</TableCell>
                  <TableCell className="text-right font-mono">{m.stockActual} {m.unidad}</TableCell>
                  <TableCell className="text-right font-mono">{m.stockSeguridad}</TableCell>
                  <TableCell className="text-right font-mono">{m.puntoReorden}</TableCell>
                  <TableCell>{estadoBadge(m.estado)}</TableCell>
                  <TableCell>
                    <Dialog open={showMovimiento === m.id} onOpenChange={(o: boolean) => { if (!o) setShowMovimiento(null); else setShowMovimiento(m.id) }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">+ Movimiento</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Registrar Movimiento - {m.nombre}</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <div>
                            <Label>Tipo</Label>
                            <Select value={movForm.tipo} onValueChange={(v: string) => setMovForm({...movForm, tipo: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ENTRADA">Entrada</SelectItem>
                                <SelectItem value="SALIDA">Salida</SelectItem>
                                <SelectItem value="TRASLADO">Traslado</SelectItem>
                                <SelectItem value="AJUSTE">Ajuste</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div><Label>Cantidad</Label><Input type="number" value={movForm.cantidad} onChange={(e: any) => setMovForm({...movForm, cantidad: e.target.value})} /></div>
                          <div><Label>Documento Origen</Label><Input value={movForm.documentoOrigen} onChange={(e: any) => setMovForm({...movForm, documentoOrigen: e.target.value})} placeholder="OC-XXXX o VS-XXX" /></div>
                          <div><Label>Notas</Label><Input value={movForm.notas} onChange={(e: any) => setMovForm({...movForm, notas: e.target.value})} /></div>
                          <Button onClick={handleMovimiento} className="w-full">Registrar</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
