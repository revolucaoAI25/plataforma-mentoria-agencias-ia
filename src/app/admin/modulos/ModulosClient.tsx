'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { MentoriaBadge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2 } from 'lucide-react'

type Module = { id: string; mentoria_type: string; title: string; description: string | null; order_index: number; lessons?: any[] }

const empty = { mentoria_type: 'COMERCIAL', title: '', description: '', order_index: 0 }

export function ModulosClient({ modules }: { modules: Module[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Module | null>(null)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true) }
  const openEdit = (m: Module) => { setEditing(m); setForm({ mentoria_type: m.mentoria_type, title: m.title, description: m.description || '', order_index: m.order_index }); setShowForm(true) }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (editing) {
      await supabase.from('modules').update(form).eq('id', editing.id)
    } else {
      await supabase.from('modules').insert(form)
    }
    setLoading(false)
    setShowForm(false)
    router.refresh()
  }

  const remove = async (id: string) => {
    if (!confirm('Remover módulo? Todas as aulas serão removidas.')) return
    await supabase.from('modules').delete().eq('id', id)
    router.refresh()
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={openCreate}><Plus size={16} /> Novo Módulo</Button>
      </div>

      <div className="space-y-3">
        {modules.map(m => (
          <div key={m.id} className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MentoriaBadge type={m.mentoria_type} />
                <span className="text-xs text-text-muted">Ordem: {m.order_index}</span>
              </div>
              <p className="font-medium text-white">{m.title}</p>
              {m.description && <p className="text-sm text-text-secondary mt-0.5 line-clamp-1">{m.description}</p>}
            </div>
            <div className="text-xs text-text-muted mr-4">{m.lessons?.length || 0} aulas</div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => openEdit(m)}><Pencil size={14} /></Button>
              <Button size="sm" variant="danger" onClick={() => remove(m.id)}><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
        {modules.length === 0 && <p className="text-text-secondary text-sm text-center py-10">Nenhum módulo cadastrado.</p>}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Módulo' : 'Novo Módulo'}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">Mentoria</label>
            <select value={form.mentoria_type} onChange={e => setForm(f => ({ ...f, mentoria_type: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="COMERCIAL">Mentoria Comercial</option>
              <option value="ENTREGA">Mentoria de Entrega</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">Título</label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">Descrição</label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">Ordem</label>
            <Input type="number" value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: Number(e.target.value) }))} />
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
