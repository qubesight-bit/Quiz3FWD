import { SignupForm } from './_components/signup-form'
import { AuthLayout } from '@/components/layouts/auth-layout'

export default function SignupPage() {
  return (
    <AuthLayout title="Registro" description="Cree una cuenta para acceder al sistema">
      <SignupForm />
    </AuthLayout>
  )
}
