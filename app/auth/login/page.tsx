import { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Login | Sincere Emotion',
  description: 'Sign in to access your digital guides and order history',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  )
}