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
    <div className="min-h-screen bg-background diagonal-bg flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] border-r border-border p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-muted/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black text-white text-base glow-green-sm">
              LM
            </div>
            <div>
              <p className="font-bold text-white text-sm tracking-tight">Lucas Magalhães</p>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-primary">Revolução</p>
            </div>
          </div>

          <div>
            <p className="text-4xl font-black text-white leading-tight tracking-tight mb-4">
              A máquina<br />de aquisição<br /><span className="text-primary">começa aqui.</span>
            </p>
            <p className="text-text-secondary text-sm leading-relaxed">
              Acesse sua plataforma de mentoria e construa uma operação de vendas escalável.
            </p>
          </div>
        </div>

        <div className="relative space-y-4">
          {['Módulos estratégicos estruturados', 'Lives ao vivo gravadas', 'Suporte direto com a equipe'].map(item => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <p className="text-sm text-text-secondary">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black text-white glow-green-sm">
              LM
            </div>
            <div>
              <p className="font-bold text-white text-sm">Lucas Magalhães</p>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-primary">Revolução</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-black text-white tracking-tight mb-1">Entrar</h1>
            <p className="text-text-secondary text-sm">Use suas credenciais de acesso para entrar na plataforma.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest block mb-2">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest block mb-2">Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-900/40 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar na plataforma'}
            </Button>
          </form>

          <p className="text-center text-text-muted text-xs mt-8">
            Problemas de acesso?{' '}
            <span className="text-text-secondary">Entre em contato com o suporte.</span>
          </p>
        </div>
      </div>
    </div>
  )
}
