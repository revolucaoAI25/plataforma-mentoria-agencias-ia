'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Radio, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MentoriaBadge } from '@/components/ui/badge'

type Live = { id: string; title: string; scheduled_at: string; status: string; mentoria_type: string }
type Slot = { id: string; starts_at: string; duration_minutes: number }
type Booking = { id: string; slot_id: string; slot?: Slot; status: string }

const PERIOD_LABELS: Record<string, string> = {
  total: 'no total',
  monthly: 'este mês',
  semester: 'neste semestre',
  yearly: 'este ano',
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDateFull(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

export function AgendaClient({ lives, slots, bookings, bookedSlotIds, usedCount, quotaAmount, quotaPeriod, hasQuota, userId }: {
  lives: Live[]
  slots: Slot[]
  bookings: Booking[]
  bookedSlotIds: string[]
  usedCount: number
  quotaAmount: number
  quotaPeriod: string
  hasQuota: boolean
  userId: string
}) {
  const router = useRouter()
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null)
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // userId is used for future personalization
  void userId

  const bookedSet = new Set(bookedSlotIds)
  const bookingBySlot = Object.fromEntries(bookings.map(b => [b.slot_id, b]))
  void bookingBySlot

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelectedDate(null)
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1)
  const lastDay = new Date(viewYear, viewMonth + 1, 0)
  const startPad = firstDay.getDay()
  const totalCells = Math.ceil((startPad + lastDay.getDate()) / 7) * 7
  const cells: (Date | null)[] = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startPad + 1
    cells.push(dayNum >= 1 && dayNum <= lastDay.getDate() ? new Date(viewYear, viewMonth, dayNum) : null)
  }

  const eventsForDay = (d: Date) => {
    const livesOnDay = lives.filter(l => sameDay(new Date(l.scheduled_at), d))
    const slotsOnDay = slots.filter(s => sameDay(new Date(s.starts_at), d))
    const myBookingsOnDay = bookings.filter(b => b.slot && sameDay(new Date(b.slot.starts_at), d))
    return { livesOnDay, slotsOnDay, myBookingsOnDay }
  }

  const selectedEvents = selectedDate ? eventsForDay(selectedDate) : null

  const doBook = async () => {
    if (!bookingSlotId) return
    setLoading(true); setError('')
    const res = await fetch('/api/agenda/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId: bookingSlotId }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erro ao agendar'); setLoading(false); return }
    setBookingSlotId(null); setLoading(false); router.refresh()
  }

  const doCancel = async () => {
    if (!cancelBookingId) return
    setLoading(true); setError('')
    const res = await fetch('/api/agenda/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: cancelBookingId }),
    })
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Erro ao cancelar'); setLoading(false); return }
    setCancelBookingId(null); setLoading(false); router.refresh()
  }

  const pct = quotaAmount > 0 ? Math.min(100, Math.round((usedCount / quotaAmount) * 100)) : 100

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-8 pt-10 pb-8 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-muted/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-2">Agenda</p>
          <h1 className="text-4xl font-black text-text-primary tracking-tight mb-2">Minha Agenda</h1>
          <p className="text-text-secondary text-sm">Lives em grupo e mentorias individuais agendadas.</p>
        </div>
      </div>

      <div className="px-8 py-8 max-w-5xl mx-auto">
        {/* Quota bar */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">Mentorias individuais</p>
              <p className="text-xs text-text-muted mt-0.5">
                {usedCount} de {quotaAmount} sessão{quotaAmount !== 1 ? 'es' : ''} usada{usedCount !== 1 ? 's' : ''} {PERIOD_LABELS[quotaPeriod] || ''}
              </p>
            </div>
            <div className={`text-sm font-bold px-3 py-1 rounded-lg ${hasQuota ? 'text-primary bg-primary-muted' : 'text-text-muted bg-surface-3'}`}>
              {hasQuota ? `${quotaAmount - usedCount} disponível${quotaAmount - usedCount !== 1 ? 'is' : ''}` : 'Cota esgotada'}
            </div>
          </div>
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              {/* Month nav */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-surface-2 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <p className="text-sm font-bold text-text-primary">{MONTHS[viewMonth]} {viewYear}</p>
                <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-surface-2 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border">
                {DAYS.map(d => (
                  <div key={d} className="py-2 text-center text-[10px] font-semibold text-text-muted uppercase tracking-widest">{d}</div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7">
                {cells.map((date, idx) => {
                  if (!date) return <div key={idx} className="h-14 border-b border-r border-border last:border-r-0" />
                  const { livesOnDay, slotsOnDay, myBookingsOnDay } = eventsForDay(date)
                  const hasEvents = livesOnDay.length + slotsOnDay.length + myBookingsOnDay.length > 0
                  const isToday = sameDay(date, now)
                  const isSelected = selectedDate && sameDay(date, selectedDate)
                  const isPast = date < new Date(now.getFullYear(), now.getMonth(), now.getDate())
                  const availableSlots = slotsOnDay.filter(s => !bookedSet.has(s.id))

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(isSelected ? null : date)}
                      className={`h-14 border-b border-r border-border last:border-r-0 p-1.5 flex flex-col items-center transition-colors ${
                        isSelected ? 'bg-primary-muted' : isToday ? 'bg-surface-2' : isPast ? 'opacity-40' : 'hover:bg-surface-2'
                      }`}
                    >
                      <span className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-primary text-white font-bold' : isSelected ? 'text-primary' : 'text-text-secondary'
                      }`}>{date.getDate()}</span>
                      {hasEvents && (
                        <div className="flex gap-0.5 flex-wrap justify-center">
                          {myBookingsOnDay.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          {livesOnDay.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                          {availableSlots.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-surface-3 border border-border" />}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-3 px-1">
              <div className="flex items-center gap-1.5 text-xs text-text-muted"><div className="w-2 h-2 rounded-full bg-primary" />Mentoria individual</div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted"><div className="w-2 h-2 rounded-full bg-blue-400" />Live em grupo</div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted"><div className="w-2 h-2 rounded-full bg-surface-3 border border-border" />Horário disponível</div>
            </div>

            {/* Selected day events */}
            {selectedDate && selectedEvents && (
              <div className="mt-6 bg-surface border border-border rounded-xl p-5">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-4 capitalize">
                  {formatDateFull(selectedDate.toISOString())}
                </p>
                {selectedEvents.livesOnDay.length === 0 && selectedEvents.slotsOnDay.length === 0 && selectedEvents.myBookingsOnDay.length === 0 && (
                  <p className="text-text-muted text-sm">Nenhum evento neste dia.</p>
                )}
                <div className="space-y-2">
                  {/* My bookings */}
                  {selectedEvents.myBookingsOnDay.map(b => b.slot && (
                    <div key={b.id} className="flex items-center gap-3 p-3 bg-primary-muted border border-primary/20 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary">Mentoria individual confirmada</p>
                        <p className="text-xs text-text-muted">{formatTime(b.slot.starts_at)} · {b.slot.duration_minutes} min</p>
                      </div>
                      <button
                        onClick={() => setCancelBookingId(b.id)}
                        className="text-xs text-text-muted hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-950/20"
                      >
                        Cancelar
                      </button>
                    </div>
                  ))}
                  {/* Lives */}
                  {selectedEvents.livesOnDay.map(l => (
                    <div key={l.id} className="flex items-center gap-3 p-3 bg-surface-2 border border-border rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-text-primary">{l.title}</p>
                          <MentoriaBadge type={l.mentoria_type} />
                        </div>
                        <p className="text-xs text-text-muted">{formatTime(l.scheduled_at)} · Live em grupo</p>
                      </div>
                    </div>
                  ))}
                  {/* Available slots */}
                  {selectedEvents.slotsOnDay.filter(s => !bookedSet.has(s.id)).map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-3 bg-surface-2 border border-border rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-surface-3 border border-border flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-secondary">Horário disponível</p>
                        <p className="text-xs text-text-muted">{formatTime(s.starts_at)} · {s.duration_minutes} min</p>
                      </div>
                      {hasQuota ? (
                        <Button size="sm" onClick={() => setBookingSlotId(s.id)}>Agendar</Button>
                      ) : (
                        <span className="text-xs text-text-muted bg-surface-3 px-2 py-1 rounded">Sem cota</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upcoming sidebar */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Próximos eventos</p>
            {bookings.length === 0 && lives.length === 0 && (
              <p className="text-text-muted text-sm">Nenhum evento agendado.</p>
            )}
            {bookings.filter(b => b.slot && new Date(b.slot.starts_at) >= now).slice(0, 5).map(b => b.slot && (
              <div key={b.id} className="bg-surface border border-primary/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <User size={12} className="text-primary" />
                  <p className="text-xs font-semibold text-primary">Mentoria Individual</p>
                </div>
                <p className="text-sm font-medium text-text-primary">
                  {new Date(b.slot.starts_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </p>
                <p className="text-xs text-text-muted">{formatTime(b.slot.starts_at)} · {b.slot.duration_minutes} min</p>
              </div>
            ))}
            {lives.slice(0, 3).map(l => (
              <div key={l.id} className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Radio size={12} className="text-blue-400" />
                  <p className="text-xs font-semibold text-blue-400">Live em grupo</p>
                </div>
                <p className="text-sm font-medium text-text-primary line-clamp-1">{l.title}</p>
                <p className="text-xs text-text-muted">
                  {new Date(l.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · {formatTime(l.scheduled_at)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Book confirm modal */}
      {bookingSlotId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setBookingSlotId(null)} />
          <div className="relative bg-surface border border-border rounded-xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-base font-bold text-text-primary mb-2">Confirmar agendamento</h2>
            {(() => { const s = slots.find(sl => sl.id === bookingSlotId); return s ? (
              <p className="text-sm text-text-secondary mb-6">
                {new Date(s.starts_at).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {formatTime(s.starts_at)} · {s.duration_minutes} min
              </p>
            ) : null })()}
            {error && <p className="text-red-400 text-sm mb-4 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setBookingSlotId(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={doBook} disabled={loading}>{loading ? 'Agendando...' : 'Confirmar'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirm modal */}
      {cancelBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCancelBookingId(null)} />
          <div className="relative bg-surface border border-border rounded-xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-base font-bold text-text-primary mb-2">Cancelar mentoria?</h2>
            <p className="text-sm text-text-secondary mb-6">Esta ação libera o horário para outros alunos. Você poderá agendar novamente se tiver cota disponível.</p>
            {error && <p className="text-red-400 text-sm mb-4 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setCancelBookingId(null)}>Voltar</Button>
              <Button variant="danger" className="flex-1" onClick={doCancel} disabled={loading}>{loading ? 'Cancelando...' : 'Cancelar sessão'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
