'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal, FormField } from '@/components/ui/modal'
import { Plus, Trash2, Pencil } from 'lucide-react'

type SlotBooking = { id: string; status: string; user_id: string; profiles?: { full_name: string | null } | null }
type Slot = {
  id: string; starts_at: string; duration_minutes: number; is_active: boolean
  booking?: SlotBooking | SlotBooking[] | null
}
type Profile = { id: string; full_name: string | null; role: string }
type Quota = { id: string; user_id: string; quota_amount: number; quota_period: string }

const PERIOD_OPTIONS = [
  { value: 'total', label: 'Total (sem limite de período)' },
  { value: 'monthly', label: 'Por mês' },
  { value: 'semester', label: 'Por semestre' },
  { value: 'yearly', label: 'Por ano' },
]

const DURATION_OPTIONS = [
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' },
]

function formatSlotDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}
function formatSlotTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function getConfirmedBooking(booking: SlotBooking | SlotBooking[] | null | undefined): SlotBooking | null {
  if (!booking) return null
  if (Array.isArray(booking)) return booking.find(b => b.status === 'confirmed') || null
  return booking.status === 'confirmed' ? booking : null
}

export function AgendaAdminClient({ slots, profiles, quotas }: { slots: Slot[]; profiles: Profile[]; quotas: Quota[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [showSlotForm, setShowSlotForm] = useState(false)
  const [slotDate, setSlotDate] = useState('')
  const [slotTime, setSlotTime] = useState('')
  const [slotDuration, setSlotDuration] = useState(60)
  const [slotLoading, setSlotLoading] = useState(false)

  const [editingQuota, setEditingQuota] = useState<Profile | null>(null)
  const [quotaForm, setQuotaForm] = useState({ quota_amount: 1, quota_period: 'total' })
  const [quotaLoading, setQuotaLoading] = useState(false)

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slotDate || !slotTime) return
    setSlotLoading(true)
    const starts_at = new Date(`${slotDate}T${slotTime}:00`).toISOString()
    await supabase.from('mentoring_slots').insert({ starts_at, duration_minutes: slotDuration })
    setSlotLoading(false)
    setShowSlotForm(false)
    setSlotDate(''); setSlotTime('')
    router.refresh()
  }

  const removeSlot = async (id: string) => {
    if (!confirm('Remover este horário? Agendamentos existentes serão cancelados.')) return
    await supabase.from('mentoring_slots').update({ is_active: false }).eq('id', id)
    router.refresh()
  }

  const openEditQuota = (p: Profile) => {
    const existing = quotas.find(q => q.user_id === p.id)
    setQuotaForm({ quota_amount: existing?.quota_amount ?? 1, quota_period: existing?.quota_period ?? 'total' })
    setEditingQuota(p)
  }

  const saveQuota = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingQuota) return
    setQuotaLoading(true)
    await supabase.from('mentoring_quotas').upsert({
      user_id: editingQuota.id,
      quota_amount: quotaForm.quota_amount,
      quota_period: quotaForm.quota_period,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    setQuotaLoading(false)
    setEditingQuota(null)
    router.refresh()
  }

  const quotaMap = Object.fromEntries(quotas.map(q => [q.user_id, q]))

  return (
    <>
      <div className="p-8 max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-1">Admin</p>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Agenda</h1>
        </div>

        {/* Slots section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary">Horários Disponíveis</h2>
              <p className="text-xs text-text-muted mt-0.5">Horários que os alunos podem reservar para mentoria individual</p>
            </div>
            <Button onClick={() => setShowSlotForm(true)}><Plus size={14} />Novo Horário</Button>
          </div>

          <div className="border border-border rounded-xl overflow-hidden">
            {slots.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-10">Nenhum horário cadastrado.</p>
            ) : (
              <table className="w-full">
                <thead className="bg-surface-2">
                  <tr className="text-[10px] font-semibold text-text-muted uppercase tracking-widest border-b border-border">
                    <th className="text-left py-3 px-4">Data e hora</th>
                    <th className="text-left py-3 px-4">Duração</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="py-3 px-4 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((s, i) => {
                    const confirmed = getConfirmedBooking(s.booking)
                    return (
                      <tr key={s.id} className={`border-b border-border last:border-0 hover:bg-surface-2 transition-colors ${i % 2 === 0 ? '' : 'bg-surface/50'}`}>
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-text-primary">{formatSlotDate(s.starts_at)}</p>
                          <p className="text-xs text-text-muted">{formatSlotTime(s.starts_at)}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-secondary">{s.duration_minutes} min</td>
                        <td className="py-3 px-4">
                          {confirmed ? (
                            <div>
                              <span className="text-xs font-medium px-2 py-0.5 rounded text-primary bg-primary-muted">Reservado</span>
                              <p className="text-xs text-text-muted mt-0.5">{confirmed.profiles?.full_name || 'Aluno'}</p>
                            </div>
                          ) : (
                            <span className="text-xs font-medium px-2 py-0.5 rounded text-text-muted bg-surface-3">Disponível</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Button size="sm" variant="danger" onClick={() => removeSlot(s.id)}><Trash2 size={13} /></Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Quotas section */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-text-primary">Cotas por Aluno</h2>
            <p className="text-xs text-text-muted mt-0.5">Defina quantas mentorias individuais cada aluno pode agendar</p>
          </div>

          <div className="border border-border rounded-xl overflow-hidden">
            {profiles.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-10">Nenhum aluno cadastrado.</p>
            ) : (
              <table className="w-full">
                <thead className="bg-surface-2">
                  <tr className="text-[10px] font-semibold text-text-muted uppercase tracking-widest border-b border-border">
                    <th className="text-left py-3 px-4">Aluno</th>
                    <th className="text-left py-3 px-4">Cota</th>
                    <th className="py-3 px-4 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p, i) => {
                    const q = quotaMap[p.id]
                    const period = PERIOD_OPTIONS.find(o => o.value === (q?.quota_period ?? 'total'))
                    return (
                      <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-surface-2 transition-colors ${i % 2 === 0 ? '' : 'bg-surface/50'}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-primary-muted border border-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                              {p.full_name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span className="text-sm font-medium text-text-primary">{p.full_name || 'Sem nome'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {q ? (
                            <span className="text-sm text-text-secondary">
                              {q.quota_amount} sessão{q.quota_amount !== 1 ? 'ões' : ''} <span className="text-text-muted">{period?.label}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-text-muted italic">Padrão (1 no total)</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Button size="sm" variant="ghost" onClick={() => openEditQuota(p)}><Pencil size={13} /></Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {/* Add slot modal */}
      <Modal open={showSlotForm} onClose={() => setShowSlotForm(false)} title="Novo Horário Disponível">
        <form onSubmit={addSlot} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Data">
              <Input type="date" value={slotDate} onChange={e => setSlotDate(e.target.value)} required />
            </FormField>
            <FormField label="Hora">
              <Input type="time" value={slotTime} onChange={e => setSlotTime(e.target.value)} required />
            </FormField>
          </div>
          <FormField label="Duração">
            <select value={slotDuration} onChange={e => setSlotDuration(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg bg-surface-2 border border-border text-text-primary text-sm font-medium focus:outline-none focus:border-primary/60 transition-all">
              {DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setShowSlotForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={slotLoading}>{slotLoading ? 'Salvando...' : 'Criar Horário'}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit quota modal */}
      <Modal open={!!editingQuota} onClose={() => setEditingQuota(null)} title={`Cota — ${editingQuota?.full_name || 'Aluno'}`}>
        <form onSubmit={saveQuota} className="space-y-4">
          <FormField label="Quantidade de sessões">
            <Input
              type="number"
              min={1}
              value={quotaForm.quota_amount}
              onChange={e => setQuotaForm(f => ({ ...f, quota_amount: Number(e.target.value) }))}
              required
            />
          </FormField>
          <FormField label="Período">
            <select value={quotaForm.quota_period} onChange={e => setQuotaForm(f => ({ ...f, quota_period: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg bg-surface-2 border border-border text-text-primary text-sm font-medium focus:outline-none focus:border-primary/60 transition-all">
              {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
          <p className="text-xs text-text-muted bg-surface-2 p-3 rounded-lg">
            Ex: 2 sessões por mês = o aluno pode agendar até 2 mentorias individuais a cada mês calendário.
          </p>
          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setEditingQuota(null)}>Cancelar</Button>
            <Button type="submit" disabled={quotaLoading}>{quotaLoading ? 'Salvando...' : 'Salvar Cota'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
