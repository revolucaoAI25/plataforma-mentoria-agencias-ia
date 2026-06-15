'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { MentoriaBadge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'

type Lesson = { id: string; module_id: string; mentoria_type: string; title: string; description: string | null; panda_video_id: string | null; order_index: number; duration_minutes: number | null; is_published: boolean; module?: { title: string; mentoria_type: string } }
type Module = { id: string; title: string; mentoria_type: string }

const empty = { module_id: '', mentoria_type: 'COMERCIAL', title: '', description: '', panda_video_id: '', order_index: 0, duration_minutes: '' as string | number, is_published: true }

export function AulasAdminClient({ lessons, modules }: { lessons: Lesson[], modules: Module[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Lesson | null>(null)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true) }
  const openEdit = (l: Lesson) => {
    setEditing(l)
    setForm({ module_id: l.module_id, mentoria_type: l.mentoria_type, title: l.title, description: l.description || '', panda_video_id: l.panda_video_id || '', order_index: l.order_index, duration_minutes: l.duration_minutes || '', is_published: l.is_published })
    setShowForm(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null }
    if (editing) {
      await supabase.from('lessons').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('lessons').insert(payload)
    }
    setLoading(false)
    setShowForm(false)
    router.refresh()
  }

  const remove = async (id: string) => {
    if (!confirm('Remover aula?')) return
    await supabase.from('lessons').delete().eq('id', id)
    router.refresh()
  }

  const filteredModules = modules.filter(m => m.mentoria_type === form.mentoria_type)

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={openCreate}><Plus size={16} /> Nova Aula</Button>
      </div>

      <div className="space-y-2">
        {lessons.map(l => (
          <div key={l.id} className={`flex items-center gap-4 p-4 bg-surface border rounded-xl ${l.is_published ? 'border-border' : 'border-border opacity-60'}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MentoriaBadge type={l.mentoria_type} />
                <span className="text-xs text-text-muted">{(l as any).module?.title}</span>
                <span className="text-xs text-text-muted">#{l.order_index}</span>
                {!l.is_published && <span className="text-xs text-yellow-500">Oculta</span>}
              </div>
              <p className="font-medium text-white">{l.title}</p>
              {l.panda_video_id && <p className="text-xs text-text-muted mt-0.5">ID: {l.panda_video_id}</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => openEdit(l)}><Pencil size={14} /></Button>
              <Button size="sm" variant="danger" onClick={() => remove(l.id)}><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
        {lessons.length === 0 && <p className="text-text-secondary text-sm text-center py-10">Nenhuma aula cadastrada.</p>}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Aula' : 'Nova Aula'} className="max-w-2xl">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">Mentoria</label>
              <select value={form.mentoria_type} onChange={e => setForm(f => ({ ...f, mentoria_type: e.target.value, module_id: '' }))}
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="COMERCIAL">Mentoria Comercial</option>
                <option value="ENTREGA">Mentoria de Entrega</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">Módulo</label>
              <select value={form.module_id} onChange={e => setForm(f => ({ ...f, module_id: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary" required>
                <option value="">Selecionar...</option>
                {filteredModules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">Título</label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">Panda Video ID</label>
            <Input value={form.panda_video_id} onChange={e => setForm(f => ({ ...f, panda_video_id: e.target.value }))} placeholder="ID ou URL do vídeo no Panda Video" />
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">Descrição</label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">Ordem</label>
              <Input type="number" value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">Duração (minutos)</label>
              <Input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} placeholder="Ex: 45" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4 rounded" />
            <span className="text-sm text-text-secondary">Publicada (visível para alunos)</span>
          </label>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
