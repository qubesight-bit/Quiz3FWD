'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  FileText,
  Search,
  Bell,
  LogOut,
  HardHat,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/materiales', label: 'Materiales', icon: Package },
  { href: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight },
  { href: '/ordenes', label: 'Órdenes de Compra', icon: FileText },
  { href: '/trazabilidad', label: 'Trazabilidad', icon: Search },
  { href: '/alertas', label: 'Alertas', icon: Bell },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const rol = (session?.user as any)?.rol ?? ''
  const rolLabels: Record<string, string> = {
    ADMIN: 'Administrador',
    JEFATURA_AREA: 'Jefatura de Área',
    JEFATURA_COMPRAS: 'Jefatura de Compras',
    GERENCIA_FINANCIERA: 'Gerencia Financiera',
    GERENCIA_GENERAL: 'Gerencia General',
    BODEGUERO: 'Bodeguero',
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <HardHat className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-display text-sm font-bold tracking-tight">Del Valle S.A.</h2>
          <p className="text-xs text-muted-foreground">Control de Inventario</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t pt-4 mt-4 space-y-3">
        <div className="px-2">
          <p className="text-sm font-medium truncate">{session?.user?.name ?? 'Usuario'}</p>
          <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
          <Badge variant="outline" className="mt-1 text-xs">{rolLabels[rol] ?? rol}</Badge>
        </div>
        <button
          onClick={() => signOut({ redirectTo: '/login' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" /> Cerrar Sesión
        </button>
      </div>
    </>
  )
}
