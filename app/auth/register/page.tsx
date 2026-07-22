import { Metadata } from 'next'
import RegisterForm from './RegisterForm'

export const metadata: Metadata = {
  title: 'Create Account | Sincere Emotion',
  description: 'Create your account to access digital guides and track orders',
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </main>
  )
}