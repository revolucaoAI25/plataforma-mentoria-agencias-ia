'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { StatusBadge, MentoriaBadge } from '@/components/ui/badge'
import { formatDateTime, getAccessibleMentoriaTypes, getMentoriaLabel } from '@/lib/utils'
import { Plus, MessageCircle } from 'lucide-react'
import type { MentoriaAccess, SupportTicket } from '@/types'

export function SupportClient({ tickets, access, userId }: {
  tickets: SupportTicket[]
  access: MentoriaAccess[]
  userId: string
}) {
  const [showNew, setShowNew] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mentoriaType, setMentoriaType] = useState('')
  const [replyContent, setReplyContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const types = getAccessibleMentoriaTypes(access)

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('support_tickets').insert({
      user_id: userId,
      title,
      description,
      mentoria_type: mentoriaType || null,
    })
    setLoading(false)
    setShowNew(false)
    setTitle('')
    setDescription('')
    router.refresh()
  }

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !replyContent.trim()) return
    setLoading(true)
    await supabase.from('ticket_replies').insert({
      ticket_id: selectedTicket.id,
      user_id: userId,
      content: replyContent.trim(),
      is_admin: false,
    })
    setLoading(false)
    setReplyContent('')
    router.refresh()
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowNew(true)}>
          <Plus size={16} />
          Nova Demanda
        </Button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
          <p>Nenhuma demanda aberta ainda.</p>
          <p className="text-sm mt-1">Clique em "Nova Demanda" para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="p-4 bg-surface border border-border rounded-xl cursor-pointer hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={ticket.status} />
                    {ticket.mentoria_type && <MentoriaBadge type={ticket.mentoria_type} />}
                  </div>
                  <p className="font-medium text-white">{ticket.title}</p>
                  <p className="text-sm text-text-muted mt-0.5">{formatDateTime(ticket.created_at)}</p>
                </div>
                <div className="text-xs text-text-muted flex-shrink-0">
                  {ticket.replies?.length || 0} respostas
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New ticket modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nova Demanda">
        <form onSubmit={createTicket} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">Título</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Descreva brevemente sua dúvida" required />
          </div>
          {types.length > 1 && (
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">Mentoria</label>
              <select
                value={mentoriaType}
                onChange={e => setMentoriaType(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Selecionar...</option>
                {types.map(t => <option key={t} value={t}>{getMentoriaLabel(t)}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">Descrição</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhe sua dúvida ou demanda..." rows={5} required />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar'}</Button>
          </div>
        </form>
      </Modal>

      {/* Ticket detail modal */}
      <Modal open={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={selectedTicket?.title || ''} className="max-w-2xl">
        {selectedTicket && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <StatusBadge status={selectedTicket.status} />
              {selectedTicket.mentoria_type && <MentoriaBadge type={selectedTicket.mentoria_type} />}
            </div>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">{selectedTicket.description}</p>

            {selectedTicket.replies && selectedTicket.replies.length > 0 && (
              <div className="space-y-4 mb-6 border-t border-border pt-4">
                {selectedTicket.replies.map(reply => (
                  <div key={reply.id} className={`flex gap-3 ${reply.is_admin ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${reply.is_admin ? 'bg-primary text-white' : 'bg-surface-2 text-text-secondary'}`}>
                      {reply.is_admin ? 'LM' : 'EU'}
                    </div>
                    <div className={`flex-1 p-3 rounded-lg text-sm ${reply.is_admin ? 'bg-surface-2 border border-border' : 'bg-primary-muted border border-primary/20'}`}>
                      <p className="font-medium mb-1 text-xs text-text-muted">{reply.is_admin ? 'Equipe' : 'Você'} · {formatDateTime(reply.created_at)}</p>
                      <p className="text-text-secondary leading-relaxed">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTicket.status !== 'closed' && (
              <form onSubmit={sendReply} className="border-t border-border pt-4 space-y-3">
                <Textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Adicionar informações..." rows={3} />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={loading || !replyContent.trim()}>
                    {loading ? 'Enviando...' : 'Responder'}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </Modal>
    </>
  )
}
