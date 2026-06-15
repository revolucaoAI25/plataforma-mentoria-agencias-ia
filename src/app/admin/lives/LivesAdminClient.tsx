'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { MentoriaBadge, StatusBadge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { Plus, Pencil, Trash2 } from 'lucide-react'

type Live = { id: string; mentoria_type: string; title: string; description: string | null; status: string; scheduled_at: string; panda_video_id: string | null }

const empty = { mentoria_type: 'COMERCIAL', title: '', description: '', status: 'scheduled', scheduled_at: '', panda_video_id: '' }

export function LivesAdminClient({ lives }: { lives: Live[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Live | null>(null)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true) }
  const openEdit = (l: Live) => {
    setEditing(l)
    setForm({ mentoria_type: l.mentoria_type, title: l.title, description: l.description || '', status: l.status, scheduled_at: l.scheduled_at.slice(0, 16), panda_video_id: l.panda_video_id || '' })
    setShowForm(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, panda_video_id: form.panda_video_id || null, description: form.description || null }
    if (editing) {
      await supabase.from('lives').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('lives').insert(payload)
    }
    setLoading(false)
    setShowForm(false)
    router.refresh()
  }

  const remove = async (id: string) => {
    if (!confirm('Remover live?')) return
    await supabase.from('lives').delete().eq('id', id)
    router.refresh()
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={openCreate}><Plus size={16} /> Nova Live</Button>
      </div>

      <div className="space-y-3">
        {lives.map(l => (
          <div key={l.id} className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={l.status} />
                <MentoriaBadge type={l.mentoria_type} />
                <span className="text-xs text-text-muted">{formatDateTime(l.scheduled_at)}</span>
              </div>
              <p className="font-medium text-white">{l.title}</p>
              {l.panda_video_id && <p className="text-xs text-text-muted mt-0.5">Video ID: {l.panda_video_id}</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => openEdit(l)}><Pencil size={14} /></Button>
              <Button size="sm" variant="danger" onClick={() => remove(l.id)}><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
        {lives.length === 0 && <p className="text-text-secondary text-sm text-center py-10">Nenhuma live cadastrada.</p>}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Live' : 'Nova Live'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">Mentoria</label>
              <select value={form.mentoria_type} onChange={e => setForm(f => ({ ...f, mentoria_type: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="COMERCIAL">Mentoria Comercial</option>
                <option value="ENTREGA">Mentoria de Entrega</option>
                <option value="AMBAS">Todas as Mentorias</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="scheduled">Agendada</option>
                <option value="completed">Finalizada</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">Título</label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">Data e Hora</label>
            <Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} required />
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">Descrição</label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">Panda Video ID (gravação)</label>
            <Input value={form.panda_video_id} onChange={e => setForm(f => ({ ...f, panda_video_id: e.target.value }))} placeholder="Deixe vazio se ainda não gravou" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
