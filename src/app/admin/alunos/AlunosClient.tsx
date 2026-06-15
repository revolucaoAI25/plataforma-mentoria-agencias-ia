'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Pencil, Users } from 'lucide-react'
import type { Profile, MentoriaAccess } from '@/types'

const ACCESS_OPTIONS: { value: MentoriaAccess; label: string }[] = [
  { value: 'COMERCIAL', label: 'Mentoria Comercial' },
  { value: 'ENTREGA', label: 'Mentoria de Entrega' },
  { value: 'COMPLETA', label: 'Mentoria Completa (ambas)' },
]

export function AlunosClient({ profiles }: { profiles: Profile[] }) {
  const [editing, setEditing] = useState<Profile | null>(null)
  const [form, setForm] = useState<{ full_name: string; role: string; mentoria_access: MentoriaAccess[] }>({ full_name: '', role: 'student', mentoria_access: [] })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const openEdit = (p: Profile) => {
    setEditing(p)
    setForm({ full_name: p.full_name || '', role: p.role, mentoria_access: p.mentoria_access || [] })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setLoading(true)
    await supabase.from('profiles').update(form).eq('id', editing.id)
    setLoading(false)
    setEditing(null)
    router.refresh()
  }

  const toggleAccess = (val: MentoriaAccess) => {
    setForm(f => ({
      ...f,
      mentoria_access: f.mentoria_access.includes(val)
        ? f.mentoria_access.filter(a => a !== val)
        : [...f.mentoria_access, val]
    }))
  }

  const filtered = profiles.filter(p =>
    (p.full_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="mb-6">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar aluno..." className="max-w-sm" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p>Nenhum aluno encontrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-text-muted uppercase tracking-widest border-b border-border">
                <th className="text-left py-3 px-4">Nome</th>
                <th className="text-left py-3 px-4">Acesso</th>
                <th className="text-left py-3 px-4">Perfil</th>
                <th className="text-left py-3 px-4">Desde</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-border hover:bg-surface-2 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
                        {p.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="font-medium text-white">{p.full_name || 'Sem nome'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {(p.mentoria_access || []).length === 0
                        ? <Badge variant="gray">Sem acesso</Badge>
                        : (p.mentoria_access || []).map(a => (
                            <Badge key={a} variant={a === 'COMERCIAL' ? 'green' : a === 'ENTREGA' ? 'blue' : 'gray'}>{a}</Badge>
                          ))
                      }
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={p.role === 'admin' ? 'green' : 'gray'}>{p.role === 'admin' ? 'Admin' : 'Aluno'}</Badge>
                  </td>
                  <td className="py-3 px-4 text-text-muted text-sm">{formatDate(p.created_at)}</td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Aluno">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">Nome</label>
            <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">Perfil</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="student">Aluno</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-2">Acesso às Mentorias</label>
            <div className="space-y-2">
              {ACCESS_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.mentoria_access.includes(opt.value)}
                    onChange={() => toggleAccess(opt.value)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-white">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
