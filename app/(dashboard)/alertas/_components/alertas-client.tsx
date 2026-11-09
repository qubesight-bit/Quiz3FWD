'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle, AlertTriangle, Copy, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'

const tipoAlertaConfig: Record<string, { icon: any; color: string; label: string }> = {
  REORDEN: { icon: AlertTriangle, color: 'text-destructive', label: 'Reorden' },
  DUPLICADO: { icon: Copy, color: 'text-amber-500', label: 'Duplicado' },
  SOBREPRECIO: { icon: DollarSign, color: 'text-orange-500', label: 'Sobreprecio' },
}

export function AlertasClient() {
  const [alertas, setAlertas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAlertas = useCallback(() => {
    setLoading(true)
    fetch('/api/alertas/reorden')
      .then((r) => r.json())
      .then((d) => setAlertas(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchAlertas() }, [fetchAlertas])

  const handleResolver = async (id: string) => {
    try {
      const res = await fetch(`/api/alertas/${id}/resolver`, { method: 'PUT' })
      if (!res.ok) { toast.error('Error'); return }
      toast.success('Alerta marcada como resuelta')
      fetchAlertas()
    } catch { toast.error('Error') }
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Alertas</h1>
          <p className="text-muted-foreground">Alertas activas de reorden, duplicados y sobreprecios</p>
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : (alertas ?? []).length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-lg">Sin alertas activas</h3>
            <p className="text-muted-foreground">Todos los materiales están dentro de los parámetros normales</p>
          </CardContent>
        </Card>
      ) : (
        <Stagger staggerDelay={0.05}>
          <div className="space-y-3">
            {(alertas ?? []).map((a: any) => {
              const config = tipoAlertaConfig[a.tipo] ?? tipoAlertaConfig.REORDEN
              const Icon = config.icon
              return (
                <StaggerItem key={a.id}>
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${config.color.replace('text-', 'bg-')}/10 flex-shrink-0`}>
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{config.label}</Badge>
                            <span className="text-xs text-muted-foreground">
                              <SafeDate date={a.fecha} options={{ dateStyle: 'medium' }} />
                            </span>
                          </div>
                          <p className="text-sm font-medium">{a.material?.nombre ?? 'Material'} ({a.material?.codigo})</p>
                          <p className="text-sm text-muted-foreground mt-1">{a.mensaje}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleResolver(a.id)} className="flex-shrink-0">
                          <CheckCircle className="h-4 w-4 mr-1" /> Resolver
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              )
            })}
          </div>
        </Stagger>
      )}
    </div>
  )
}
