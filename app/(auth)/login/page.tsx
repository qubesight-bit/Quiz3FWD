import { LoginForm } from './_components/login-form'
import { AuthLayout } from '@/components/layouts/auth-layout'

export default function LoginPage() {
  return (
    <AuthLayout title="Constructora Del Valle S.A." description="Ingrese al sistema de control de inventario">
      <LoginForm />
    </AuthLayout>
  )
}
