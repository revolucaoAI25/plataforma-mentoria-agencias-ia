'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { StatusBadge, MentoriaBadge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import type { SupportTicket } from '@/types'

export function AdminSupportClient({ tickets }: { tickets: SupportTicket[] }) {
  const [selected, setSelected] = useState<SupportTicket | null>(null)
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('open')
  const router = useRouter()
  const supabase = createClient()

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected || !reply.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('ticket_replies').insert({ ticket_id: selected.id, user_id: user!.id, content: reply.trim(), is_admin: true })
    await supabase.from('support_tickets').update({ status: 'answered' }).eq('id', selected.id)
    setLoading(false)
    setReply('')
    setSelected(null)
    router.refresh()
  }

  const changeStatus = async (id: string, status: string) => {
    await supabase.from('support_tickets').update({ status }).eq('id', id)
    router.refresh()
  }

  const filtered = tickets.filter(t => filter === 'all' || t.status === filter)

  return (
    <>
      <div className="flex gap-2 mb-6">
        {['open', 'answered', 'closed', 'all'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:text-white'}`}>
            {s === 'open' ? 'Abertos' : s === 'answered' ? 'Respondidos' : s === 'closed' ? 'Fechados' : 'Todos'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(t => (
          <div key={t.id} className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl">
            <div className="flex-1 cursor-pointer" onClick={() => setSelected(t)}>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={t.status} />
                {t.mentoria_type && <MentoriaBadge type={t.mentoria_type} />}
                <span className="text-xs text-text-muted">{(t as any).profiles?.full_name}</span>
              </div>
              <p className="font-medium text-white">{t.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{formatDateTime(t.created_at)}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {t.status !== 'closed' && (
                <Button size="sm" variant="ghost" onClick={() => changeStatus(t.id, 'closed')}>Fechar</Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => setSelected(t)}>Ver</Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-text-secondary text-sm text-center py-10">Nenhum ticket nesta categoria.</p>}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title || ''} className="max-w-2xl">
        {selected && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <StatusBadge status={selected.status} />
              {selected.mentoria_type && <MentoriaBadge type={selected.mentoria_type} />}
              <span className="text-sm text-text-muted">{(selected as any).profiles?.full_name}</span>
            </div>
            <div className="bg-surface-2 rounded-lg p-4 mb-4">
              <p className="text-sm text-text-secondary leading-relaxed">{selected.description}</p>
            </div>

            {selected.replies && selected.replies.length > 0 && (
              <div className="space-y-3 mb-4">
                {selected.replies.map(r => (
                  <div key={r.id} className={`p-3 rounded-lg text-sm border ${r.is_admin ? 'bg-primary-muted border-primary/20' : 'bg-surface-2 border-border'}`}>
                    <p className="text-xs text-text-muted mb-1">{r.is_admin ? '✦ Equipe' : (selected as any).profiles?.full_name} · {formatDateTime(r.created_at)}</p>
                    <p className="text-white leading-relaxed">{r.content}</p>
                  </div>
                ))}
              </div>
            )}

            {selected.status !== 'closed' && (
              <form onSubmit={sendReply} className="space-y-3 border-t border-border pt-4">
                <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Sua resposta..." rows={4} />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => { changeStatus(selected.id, 'closed'); setSelected(null) }}>Fechar ticket</Button>
                  <Button type="submit" disabled={loading || !reply.trim()}>{loading ? 'Enviando...' : 'Responder'}</Button>
                </div>
              </form>
            )}
          </>
        )}
      </Modal>
    </>
  )
}
