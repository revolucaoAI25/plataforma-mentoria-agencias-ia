'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal, FormField, SelectField } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { formatDate, getMentoriaLabel } from '@/lib/utils'
import { Pencil, UserPlus, Search } from 'lucide-react'
import type { Profile, MentoriaAccess } from '@/types'

const ACCESS_OPTIONS: { value: MentoriaAccess; label: string }[] = [
  { value: 'COMERCIAL', label: 'Mentoria Comercial' },
  { value: 'ENTREGA', label: 'Mentoria de Entrega' },
  { value: 'COMPLETA', label: 'Mentoria Completa (ambas)' },
]

export function AlunosClient({ profiles }: { profiles: Profile[] }) {
  const [editing, setEditing] = useState<Profile | null>(null)
  const [creating, setCreating] = useState(false)
  const [editForm, setEditForm] = useState<{ full_name: string; role: string; mentoria_access: MentoriaAccess[] }>({ full_name: '', role: 'student', mentoria_access: [] })
  const [newForm, setNewForm] = useState({ email: '', password: '', full_name: '', role: 'student', mentoria_access: [] as MentoriaAccess[] })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const openEdit = (p: Profile) => {
    setEditing(p)
    setEditForm({ full_name: p.full_name || '', role: p.role, mentoria_access: p.mentoria_access || [] })
  }

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setLoading(true)
    await supabase.from('profiles').update(editForm).eq('id', editing.id)
    setLoading(false)
    setEditing(null)
    router.refresh()
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newForm),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Erro ao criar usuário')
      setLoading(false)
      return
    }
    setLoading(false)
    setCreating(false)
    setNewForm({ email: '', password: '', full_name: '', role: 'student', mentoria_access: [] })
    router.refresh()
  }

  const toggleAccess = (val: MentoriaAccess, form: MentoriaAccess[], setForm: (f: any) => void) => {
    setForm((prev: any) => ({
      ...prev,
      mentoria_access: prev.mentoria_access.includes(val)
        ? prev.mentoria_access.filter((a: string) => a !== val)
        : [...prev.mentoria_access, val]
    }))
  }

  const filtered = profiles.filter(p =>
    (p.full_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const SelectNative = ({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: {value: string, label: string}[] }) => (
    <FormField label={label}>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg bg-surface-2 border border-border text-text-primary text-sm font-medium focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </FormField>
  )

  const AccessCheckboxes = ({ access, onChange }: { access: MentoriaAccess[], onChange: (v: MentoriaAccess) => void }) => (
    <FormField label="Acesso às Mentorias">
      <div className="space-y-2 mt-1">
        {ACCESS_OPTIONS.map(opt => (
          <label key={opt.value} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-surface-3 transition-colors">
            <input
              type="checkbox"
              checked={access.includes(opt.value)}
              onChange={() => onChange(opt.value)}
              className="w-4 h-4 rounded accent-primary"
            />
            <span className="text-sm text-text-primary">{opt.label}</span>
          </label>
        ))}
      </div>
    </FormField>
  )

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar aluno..." className="pl-9 w-64" />
        </div>
        <Button onClick={() => setCreating(true)}>
          <UserPlus size={14} />
          Novo Aluno
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <p>Nenhum aluno encontrado.</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-2">
              <tr className="text-[10px] font-semibold text-text-muted uppercase tracking-widest border-b border-border">
                <th className="text-left py-3 px-4">Aluno</th>
                <th className="text-left py-3 px-4">Acesso</th>
                <th className="text-left py-3 px-4">Perfil</th>
                <th className="text-left py-3 px-4">Desde</th>
                <th className="py-3 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-surface-2 transition-colors ${i % 2 === 0 ? '' : 'bg-surface/50'}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-muted border border-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        {p.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-sm font-medium text-text-primary">{p.full_name || <span className="text-text-muted italic">Sem nome</span>}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {(p.mentoria_access || []).length === 0
                        ? <Badge variant="gray">Sem acesso</Badge>
                        : (p.mentoria_access || []).map(a => (
                            <Badge key={a} variant={a === 'COMERCIAL' ? 'green' : a === 'ENTREGA' ? 'blue' : 'gray'}>
                              {a === 'COMPLETA' ? 'Completa' : a === 'COMERCIAL' ? 'Comercial' : 'Entrega'}
                            </Badge>
                          ))
                      }
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={p.role === 'admin' ? 'green' : 'gray'}>{p.role === 'admin' ? 'Admin' : 'Aluno'}</Badge>
                  </td>
                  <td className="py-3 px-4 text-text-muted text-sm">{formatDate(p.created_at)}</td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil size={13} /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create user modal */}
      <Modal open={creating} onClose={() => { setCreating(false); setError('') }} title="Novo Aluno">
        <form onSubmit={createUser} className="space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">{error}</p>}
          <FormField label="Nome Completo">
            <Input value={newForm.full_name} onChange={e => setNewForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Nome do aluno" />
          </FormField>
          <FormField label="Email">
            <Input type="email" value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" required />
          </FormField>
          <FormField label="Senha Inicial" hint="O aluno poderá alterar depois no perfil">
            <Input type="password" value={newForm.password} onChange={e => setNewForm(f => ({ ...f, password: e.target.value }))} placeholder="Mínimo 6 caracteres" minLength={6} required />
          </FormField>
          <SelectNative
            label="Perfil"
            value={newForm.role}
            onChange={v => setNewForm(f => ({ ...f, role: v }))}
            options={[{ value: 'student', label: 'Aluno' }, { value: 'admin', label: 'Administrador' }]}
          />
          <AccessCheckboxes
            access={newForm.mentoria_access}
            onChange={v => toggleAccess(v, newForm.mentoria_access, setNewForm)}
          />
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setCreating(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Criando...' : 'Criar Aluno'}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Aluno">
        <form onSubmit={saveEdit} className="space-y-4">
          <FormField label="Nome Completo">
            <Input value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} />
          </FormField>
          <SelectNative
            label="Perfil"
            value={editForm.role}
            onChange={v => setEditForm(f => ({ ...f, role: v }))}
            options={[{ value: 'student', label: 'Aluno' }, { value: 'admin', label: 'Administrador' }]}
          />
          <AccessCheckboxes
            access={editForm.mentoria_access}
            onChange={v => toggleAccess(v, editForm.mentoria_access, setEditForm)}
          />
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
