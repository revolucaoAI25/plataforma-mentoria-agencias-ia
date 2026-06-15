'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal, FormField } from '@/components/ui/modal'
import { MentoriaBadge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Paperclip, Link as LinkIcon, FileText, X, Clock } from 'lucide-react'

type Lesson = {
  id: string; module_id: string; mentoria_type: string; title: string
  description: string | null; panda_video_id: string | null; order_index: number
  duration_minutes: number | null; is_published: boolean
  module?: { title: string; mentoria_type: string }
  materials?: Material[]
}
type Module = { id: string; title: string; mentoria_type: string }
type Material = { id: string; lesson_id: string; title: string; type: string; url: string }
type MaterialDraft = { title: string; type: string; url: string }

const emptyLesson = { module_id: '', mentoria_type: 'COMERCIAL', title: '', description: '', panda_video_id: '', order_index: 0, duration_minutes: '' as string | number, is_published: true }
const emptyMaterial = { title: '', type: 'link', url: '' }

export function AulasAdminClient({ lessons, modules }: { lessons: Lesson[]; modules: Module[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Lesson | null>(null)
  const [form, setForm] = useState(emptyLesson)
  const [draftMaterials, setDraftMaterials] = useState<MaterialDraft[]>([])
  const [matDraftForm, setMatDraftForm] = useState(emptyMaterial)
  const [managingMaterials, setManagingMaterials] = useState<Lesson | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [matForm, setMatForm] = useState(emptyMaterial)
  const [loading, setLoading] = useState(false)
  const [matLoading, setMatLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const openCreate = () => {
    setEditing(null)
    setForm(emptyLesson)
    setDraftMaterials([])
    setMatDraftForm(emptyMaterial)
    setShowForm(true)
  }

  const openEdit = (l: Lesson) => {
    setEditing(l)
    setForm({ module_id: l.module_id, mentoria_type: l.mentoria_type, title: l.title, description: l.description || '', panda_video_id: l.panda_video_id || '', order_index: l.order_index, duration_minutes: l.duration_minutes || '', is_published: l.is_published })
    setDraftMaterials([])
    setMatDraftForm(emptyMaterial)
    setShowForm(true)
  }

  const openMaterials = async (l: Lesson) => {
    setManagingMaterials(l)
    const { data } = await supabase.from('lesson_materials').select('*').eq('lesson_id', l.id).order('created_at')
    setMaterials(data || [])
  }

  const addDraftMaterial = () => {
    if (!matDraftForm.title || !matDraftForm.url) return
    setDraftMaterials(prev => [...prev, { ...matDraftForm }])
    setMatDraftForm(emptyMaterial)
  }

  const removeDraftMaterial = (idx: number) => {
    setDraftMaterials(prev => prev.filter((_, i) => i !== idx))
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null, panda_video_id: (form.panda_video_id as string).trim() || null, description: (form.description as string).trim() || null }
    if (editing) {
      await supabase.from('lessons').update(payload).eq('id', editing.id)
      // Insert any new draft materials for edited lesson
      if (draftMaterials.length > 0) {
        await supabase.from('lesson_materials').insert(draftMaterials.map(m => ({ lesson_id: editing.id, ...m })))
      }
    } else {
      const { data: newLesson } = await supabase.from('lessons').insert(payload).select().single()
      if (newLesson && draftMaterials.length > 0) {
        await supabase.from('lesson_materials').insert(draftMaterials.map(m => ({ lesson_id: newLesson.id, ...m })))
      }
    }
    setLoading(false)
    setShowForm(false)
    router.refresh()
  }

  const remove = async (id: string) => {
    if (!confirm('Remover aula? Os materiais e comentários também serão removidos.')) return
    await supabase.from('lessons').delete().eq('id', id)
    router.refresh()
  }

  const addMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!managingMaterials) return
    setMatLoading(true)
    const { data } = await supabase.from('lesson_materials').insert({ lesson_id: managingMaterials.id, ...matForm }).select().single()
    if (data) setMaterials(prev => [...prev, data])
    setMatForm(emptyMaterial)
    setMatLoading(false)
  }

  const removeMaterial = async (id: string) => {
    await supabase.from('lesson_materials').delete().eq('id', id)
    setMaterials(prev => prev.filter(m => m.id !== id))
  }

  const filteredModules = modules.filter(m => m.mentoria_type === form.mentoria_type)

  const typeIcon = (type: string) => type === 'pdf' || type === 'file' ? <FileText size={13} className="text-primary" /> : <LinkIcon size={13} className="text-primary" />

  const isComingSoon = (l: Lesson) => l.is_published && !l.panda_video_id

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={openCreate}><Plus size={14} />Nova Aula</Button>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        {lessons.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-12">Nenhuma aula cadastrada.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-surface-2">
              <tr className="text-[10px] font-semibold text-text-muted uppercase tracking-widest border-b border-border">
                <th className="text-left py-3 px-4">Aula</th>
                <th className="text-left py-3 px-4">Panda Video ID</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="py-3 px-4 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((l, i) => (
                <tr key={l.id} className={`border-b border-border last:border-0 hover:bg-surface-2 transition-colors ${i % 2 === 0 ? '' : 'bg-surface/50'}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      <MentoriaBadge type={l.mentoria_type} />
                      <span className="text-xs text-text-muted">{(l as any).module?.title}</span>
                      <span className="text-xs text-text-muted">#{l.order_index}</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{l.title}</p>
                    {l.duration_minutes && <p className="text-xs text-text-muted mt-0.5">{l.duration_minutes} min</p>}
                  </td>
                  <td className="py-3 px-4">
                    {l.panda_video_id
                      ? <span className="text-xs font-mono text-text-secondary bg-surface-3 px-2 py-1 rounded">{l.panda_video_id.slice(0, 20)}...</span>
                      : <span className="text-xs text-text-muted italic">Sem vídeo</span>
                    }
                  </td>
                  <td className="py-3 px-4">
                    {isComingSoon(l) ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded text-yellow-400 bg-yellow-950/40 flex items-center gap-1 w-fit">
                        <Clock size={10} />Em Breve
                      </span>
                    ) : (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${l.is_published ? 'text-primary bg-primary-muted' : 'text-text-muted bg-surface-3'}`}>
                        {l.is_published ? 'Publicada' : 'Oculta'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => openMaterials(l)} title="Materiais"><Paperclip size={13} /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(l)}><Pencil size={13} /></Button>
                      <Button size="sm" variant="danger" onClick={() => remove(l.id)}><Trash2 size={13} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Lesson form */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Aula' : 'Nova Aula'} className="max-w-2xl">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mentoria">
              <select value={form.mentoria_type} onChange={e => setForm(f => ({ ...f, mentoria_type: e.target.value, module_id: '' }))}
                className="w-full h-10 px-3 rounded-lg bg-surface-2 border border-border text-text-primary text-sm font-medium focus:outline-none focus:border-primary/60 transition-all">
                <option value="COMERCIAL">Mentoria Comercial</option>
                <option value="ENTREGA">Mentoria de Entrega</option>
              </select>
            </FormField>
            <FormField label="Módulo">
              <select value={form.module_id} onChange={e => setForm(f => ({ ...f, module_id: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg bg-surface-2 border border-border text-text-primary text-sm font-medium focus:outline-none focus:border-primary/60 transition-all" required>
                <option value="">Selecionar módulo...</option>
                {filteredModules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Título da Aula">
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Aula 01 — O Modelo de Aquisição" required />
          </FormField>
          <FormField label="Panda Video ID" hint="Cole o ID do vídeo. Deixe em branco para marcar a aula como Em Breve.">
            <Input value={form.panda_video_id as string} onChange={e => setForm(f => ({ ...f, panda_video_id: e.target.value }))} placeholder="Ex: 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d" className="font-mono text-xs" />
          </FormField>
          <FormField label="Descrição">
            <Textarea value={form.description as string} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Sobre o que é essa aula..." />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ordem">
              <Input type="number" value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: Number(e.target.value) }))} />
            </FormField>
            <FormField label="Duração (minutos)">
              <Input type="number" value={form.duration_minutes as string} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} placeholder="Ex: 45" />
            </FormField>
          </div>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-surface-3 transition-colors">
            <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4 rounded accent-primary" />
            <div>
              <p className="text-sm font-medium text-text-primary">Aula publicada</p>
              <p className="text-xs text-text-muted">
                {form.is_published && !(form.panda_video_id as string).trim()
                  ? 'Aparece como "Em Breve" (sem vídeo)'
                  : 'Visível para os alunos na biblioteca'}
              </p>
            </div>
          </label>

          {/* Inline materials */}
          <div className="border border-border rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-2">
              <Paperclip size={12} />Materiais
            </p>
            {draftMaterials.length > 0 && (
              <div className="space-y-2">
                {draftMaterials.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 bg-surface-2 border border-border rounded-lg">
                    {typeIcon(m.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{m.title}</p>
                      <p className="text-xs text-text-muted truncate">{m.url}</p>
                    </div>
                    <button type="button" onClick={() => removeDraftMaterial(idx)} className="text-text-muted hover:text-red-400 transition-colors flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {editing && (
              <p className="text-xs text-text-muted">Materiais existentes são gerenciados pelo ícone <Paperclip size={10} className="inline" /> na tabela.</p>
            )}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Input value={matDraftForm.title} onChange={e => setMatDraftForm(f => ({ ...f, title: e.target.value }))} placeholder="Nome do material" className="text-sm" />
              </div>
              <select value={matDraftForm.type} onChange={e => setMatDraftForm(f => ({ ...f, type: e.target.value }))}
                className="h-10 px-3 rounded-lg bg-surface-2 border border-border text-text-primary text-sm font-medium focus:outline-none focus:border-primary/60 transition-all">
                <option value="link">Link</option>
                <option value="pdf">PDF</option>
                <option value="file">Arquivo</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Input value={matDraftForm.url} onChange={e => setMatDraftForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." className="flex-1 text-sm" />
              <Button type="button" size="sm" variant="ghost" onClick={addDraftMaterial}><Plus size={13} />Adicionar</Button>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Criar Aula'}</Button>
          </div>
        </form>
      </Modal>

      {/* Materials modal */}
      <Modal open={!!managingMaterials} onClose={() => setManagingMaterials(null)} title={`Materiais — ${managingMaterials?.title || ''}`} className="max-w-xl">
        <div className="space-y-4">
          {materials.length > 0 && (
            <div className="space-y-2 mb-4">
              {materials.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-surface-2 border border-border rounded-lg">
                  {typeIcon(m.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{m.title}</p>
                    <p className="text-xs text-text-muted truncate">{m.url}</p>
                  </div>
                  <button onClick={() => removeMaterial(m.id)} className="text-text-muted hover:text-red-400 transition-colors flex-shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {materials.length === 0 && (
            <p className="text-text-muted text-sm text-center py-4">Nenhum material adicionado.</p>
          )}

          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">Adicionar Material</p>
            <form onSubmit={addMaterial} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Input value={matForm.title} onChange={e => setMatForm(f => ({ ...f, title: e.target.value }))} placeholder="Nome do material" required />
                </div>
                <select value={matForm.type} onChange={e => setMatForm(f => ({ ...f, type: e.target.value }))}
                  className="h-10 px-3 rounded-lg bg-surface-2 border border-border text-text-primary text-sm font-medium focus:outline-none focus:border-primary/60 transition-all">
                  <option value="link">Link</option>
                  <option value="pdf">PDF</option>
                  <option value="file">Arquivo</option>
                </select>
              </div>
              <Input value={matForm.url} onChange={e => setMatForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." required />
              <Button type="submit" size="sm" disabled={matLoading} className="w-full">
                <Plus size={13} />{matLoading ? 'Adicionando...' : 'Adicionar Material'}
              </Button>
            </form>
          </div>
        </div>
      </Modal>
    </>
  )
}
