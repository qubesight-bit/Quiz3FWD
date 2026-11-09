'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Wrench } from 'lucide-react'
import { toast } from 'sonner'
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

export function MovimientosClient() {
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [materiales, setMateriales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ materialId: '', tipo: 'ENTRADA', cantidad: '', documentoOrigen: '', notas: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/movimientos').then((r) => r.json()),
      fetch('/api/materiales').then((r) => r.json()),
    ])
      .then(([movs, mats]) => {
        setMovimientos(Array.isArray(movs) ? movs : [])
        setMateriales(Array.isArray(mats) ? mats : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.materialId || !form.cantidad) { toast.error('Complete los campos requeridos'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d?.error ?? 'Error'); return }
      toast.success('Movimiento registrado')
      setForm({ materialId: '', tipo: 'ENTRADA', cantidad: '', documentoOrigen: '', notas: '' })
      fetchData()
    } catch { toast.error('Error') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Movimientos de Inventario</h1>
          <p className="text-muted-foreground">Registre entradas, salidas, traslados y ajustes de materiales</p>
        </div>
      </FadeIn>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <h3 className="font-display font-semibold mb-4">Registrar Movimiento</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <Label>Material</Label>
              <Select value={form.materialId} onValueChange={(v: string) => setForm({...form, materialId: v})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {(materiales ?? []).map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>{m.codigo} - {m.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v: string) => setForm({...form, tipo: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SALIDA">Salida</SelectItem>
                  <SelectItem value="TRASLADO">Traslado</SelectItem>
                  <SelectItem value="AJUSTE">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Cantidad</Label><Input type="number" value={form.cantidad} onChange={(e: any) => setForm({...form, cantidad: e.target.value})} required /></div>
            <div><Label>Documento</Label><Input value={form.documentoOrigen} onChange={(e: any) => setForm({...form, documentoOrigen: e.target.value})} placeholder="OC-XXXX" /></div>
            <Button type="submit" loading={submitting}>Registrar</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Cargando...</TableCell></TableRow>
              ) : (movimientos ?? []).map((m: any) => {
                const Icon = tipoIcons[m.tipo] ?? ArrowDownCircle
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${tipoColors[m.tipo] ?? ''}`} />
                        <span className="text-sm">{m.tipo}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{m.material?.nombre ?? ''}</TableCell>
                    <TableCell className="text-right font-mono">{m.cantidad}</TableCell>
                    <TableCell className="font-mono text-sm">{m.documentoOrigen ?? '-'}</TableCell>
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
    </div>
  )
}
