'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Profile } from '@/types'

export function ProfileClient({ profile, email }: { profile: Profile | null, email: string }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    instagram: profile?.instagram || '',
    city: profile?.city || '',
    niche: profile?.niche || '',
    main_promise: profile?.main_promise || '',
    portfolio_url: profile?.portfolio_url || '',
  })
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [msg, setMsg] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('profiles').update(form).eq('id', profile?.id)
    setMsg('Perfil atualizado com sucesso.')
    setSaving(false)
    router.refresh()
    setTimeout(() => setMsg(''), 3000)
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPw(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setMsg('Erro ao alterar senha.')
    else { setMsg('Senha alterada com sucesso.'); setPassword('') }
    setChangingPw(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [key]: e.target.value }))
  })

  const initials = form.full_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <div className="space-y-6">
      {msg && (
        <div className="p-3 bg-primary-muted border border-primary/30 rounded-lg text-sm text-primary-light">{msg}</div>
      )}

      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-border">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
            {initials}
          </div>
          <div>
            <p className="text-xl font-semibold">{form.full_name || 'Sem nome'}</p>
            <p className="text-text-secondary text-sm">{email}</p>
            <p className="text-xs text-primary uppercase tracking-widest mt-1">{profile?.role === 'admin' ? 'Administrador' : 'Aluno'}</p>
          </div>
        </div>

        <form onSubmit={saveProfile}>
          <h3 className="font-semibold mb-4">Informações</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-widest block mb-1.5">Nome Completo</label>
              <Input {...field('full_name')} placeholder="Seu nome" />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-widest block mb-1.5">Instagram</label>
              <Input {...field('instagram')} placeholder="@usuario" />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-widest block mb-1.5">Telefone / WhatsApp</label>
              <Input {...field('phone')} placeholder="+55 (11) 99999-9999" />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-widest block mb-1.5">Cidade</label>
              <Input {...field('city')} placeholder="São Paulo, SP" />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-widest block mb-1.5">Nicho de Atuação</label>
              <Input {...field('niche')} placeholder="Ex: Agências de Marketing" />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-widest block mb-1.5">Promessa Principal</label>
              <Input {...field('main_promise')} placeholder="Ex: Escalar agências com IA" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-text-muted uppercase tracking-widest block mb-1.5">Portfólio (URL)</label>
              <Input {...field('portfolio_url')} placeholder="https://seusite.com" type="url" />
            </div>
          </div>
          <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar Alterações'}</Button>
        </form>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Alterar Senha</h3>
        <form onSubmit={changePassword} className="flex gap-3">
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nova senha (mínimo 6 caracteres)"
            minLength={6}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary" disabled={changingPw || password.length < 6}>
            {changingPw ? 'Alterando...' : 'Alterar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
