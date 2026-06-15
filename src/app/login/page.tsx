'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou senha inválidos.')
      setLoading(false)
    } else {
      router.push('/aulas')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4">
            LM
          </div>
          <h1 className="text-2xl font-bold text-white">Lucas Magalhães</h1>
          <p className="text-text-secondary text-sm mt-1 tracking-widest uppercase font-medium text-primary">Mentoria</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-8">
          <h2 className="text-lg font-semibold mb-1">Entrar na plataforma</h2>
          <p className="text-text-secondary text-sm mb-6">Use suas credenciais de acesso.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          Problemas de acesso? Entre em contato com o suporte.
        </p>
      </div>
    </div>
  )
}
