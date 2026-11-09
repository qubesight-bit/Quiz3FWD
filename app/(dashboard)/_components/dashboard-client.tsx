'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Package, AlertTriangle, FileText, Copy, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { FadeIn, SlideIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'

interface DashboardData {
  kpis: {
    totalMateriales: number
    materialesBajoReorden: number
    alertasActivas: number
    ocsPendientes: number
    numDuplicados: number
  }
  materiales: any[]
  alertasRecientes: any[]
  ultimosMovimientos: any[]
}

function estadoBadge(estado: string) {
  switch (estado) {
    case 'CRITICO':
      return <Badge variant="destructive" className="text-xs">Crítico</Badge>
    case 'ALERTA':
      return <Badge className="bg-amber-500 text-white text-xs hover:bg-amber-600">Alerta</Badge>
    default:
      return <Badge className="bg-emerald-500 text-white text-xs hover:bg-emerald-600">OK</Badge>
  }
}

function KpiCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold font-display tracking-tight mt-1 ${color}`}>{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-')}/10`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!data?.kpis) return <p className="text-muted-foreground">Error cargando datos</p>

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Dashboard de Inventario</h1>
          <p className="text-muted-foreground">Resumen general del estado de materiales y compras</p>
        </div>
      </FadeIn>

      <Stagger staggerDelay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem>
            <KpiCard title="Total Materiales" value={data.kpis.totalMateriales} icon={Package} color="text-primary" />
          </StaggerItem>
          <StaggerItem>
            <KpiCard title="Alertas de Reorden" value={data.kpis.materialesBajoReorden} icon={AlertTriangle} color="text-destructive" />
          </StaggerItem>
          <StaggerItem>
            <KpiCard title="OCs Pendientes" value={data.kpis.ocsPendientes} icon={FileText} color="text-amber-500" />
          </StaggerItem>
          <StaggerItem>
            <KpiCard title="Duplicados Detectados" value={data.kpis.numDuplicados} icon={Copy} color="text-orange-500" />
          </StaggerItem>
        </div>
      </Stagger>

      <SlideIn from="bottom" delay={0.2}>
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-display">Estado de Stock por Material</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Stock Actual</TableHead>
                  <TableHead className="text-right">Stock Seg.</TableHead>
                  <TableHead className="text-right">Punto Reorden</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.materiales ?? []).map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-sm">{m.codigo}</TableCell>
                    <TableCell className="font-medium">{m.nombre}</TableCell>
                    <TableCell className="text-right font-mono">{m.stockActual?.toLocaleString?.('es-CR') ?? m.stockActual} {m.unidad}</TableCell>
                    <TableCell className="text-right font-mono">{m.stockSeguridad?.toLocaleString?.('es-CR') ?? m.stockSeguridad}</TableCell>
                    <TableCell className="text-right font-mono">{m.puntoReorden?.toLocaleString?.('es-CR') ?? m.puntoReorden}</TableCell>
                    <TableCell>{estadoBadge(m.estado)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </SlideIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SlideIn from="left" delay={0.3}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" /> Alertas Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(data.alertasRecientes ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin alertas activas</p>
              ) : (
                <div className="space-y-3">
                  {(data.alertasRecientes ?? []).map((a: any) => (
                    <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`h-2 w-2 rounded-full mt-2 ${a.tipo === 'REORDEN' ? 'bg-destructive' : a.tipo === 'DUPLICADO' ? 'bg-amber-500' : 'bg-orange-500'}`} />
                      <div>
                        <p className="text-sm font-medium">{a.material?.nombre ?? 'Material'}</p>
                        <p className="text-xs text-muted-foreground">{a.mensaje}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </SlideIn>

        <SlideIn from="right" delay={0.3}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-primary" /> Últimos Movimientos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(data.ultimosMovimientos ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin movimientos recientes</p>
              ) : (
                <div className="space-y-3">
                  {(data.ultimosMovimientos ?? []).map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      {m.tipo === 'ENTRADA' ? (
                        <ArrowDownCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <ArrowUpCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.material?.nombre ?? 'Material'}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.tipo} • {m.cantidad} • {m.documentoOrigen ?? 'Sin doc.'}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        <SafeDate date={m.fecha} options={{ dateStyle: 'short' }} />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </div>
  )
}

function ArrowLeftRight(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...(props ?? {})}>
      <path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" />
    </svg>
  )
}
