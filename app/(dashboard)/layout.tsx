import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layouts/app-shell'
import { SidebarNav } from './_components/sidebar-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return (
    <AppShell sidebar={<SidebarNav />}>
      {children}
    </AppShell>
  )
}
