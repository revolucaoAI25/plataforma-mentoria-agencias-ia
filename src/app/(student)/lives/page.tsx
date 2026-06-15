import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAccessibleMentoriaTypes } from '@/lib/utils'
import { MentoriaBadge, StatusBadge } from '@/components/ui/badge'
import { Calendar, Play, Clock } from 'lucide-react'
import type { MentoriaAccess, MentoriaType, Live } from '@/types'
import { PandaEmbed } from '@/components/lessons/VideoPlayer'

function formatLiveDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).toUpperCase()
}

export default async function LivesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('mentoria_access, role')
    .eq('id', user.id)
    .single()

  const access = (profile?.mentoria_access || []) as MentoriaAccess[]
  const mentoriaTypes = profile?.role === 'admin'
    ? ['COMERCIAL', 'ENTREGA'] as MentoriaType[]
    : getAccessibleMentoriaTypes(access)

  const { data: lives } = await supabase
    .from('lives')
    .select('*')
    .or(`mentoria_type.in.(${mentoriaTypes.join(',')}),mentoria_type.eq.AMBAS`)
    .order('scheduled_at', { ascending: false })

  const scheduled = (lives || []).filter(l => l.status === 'scheduled')
  const completed = (lives || []).filter(l => l.status === 'completed')

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-xs text-primary font-medium tracking-widest uppercase mb-1">Sessões Privadas</p>
        <h1 className="text-4xl font-bold text-white">Aulas Ao Vivo</h1>
        <p className="text-text-secondary mt-2">Encontros estratégicos com o mentor. Diagnósticos, breakdowns e implementação acompanhada.</p>
      </div>

      {/* Próximas */}
      {scheduled.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Próximas Sessões</h2>
          <div className="space-y-3">
            {scheduled.map(live => (
              <div key={live.id} className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-primary uppercase tracking-widest">Próxima Sessão</span>
                    <span className="text-xs text-text-muted">{formatLiveDate(live.scheduled_at)}</span>
                  </div>
                  <p className="font-semibold text-white">{live.title}</p>
                  {live.description && <p className="text-sm text-text-secondary mt-0.5">{live.description}</p>}
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  <MentoriaBadge type={live.mentoria_type} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gravações */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Gravações</h2>
        {completed.length === 0 ? (
          <div className="text-center py-16 text-text-secondary">
            <Play size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhuma gravação disponível ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completed.map(live => (
              <div key={live.id} className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status="completed" />
                        <MentoriaBadge type={live.mentoria_type} />
                        <span className="text-xs text-text-muted">{formatLiveDate(live.scheduled_at)}</span>
                      </div>
                      <h3 className="font-semibold text-white">{live.title}</h3>
                      {live.description && <p className="text-sm text-text-secondary mt-1">{live.description}</p>}
                    </div>
                  </div>
                  {live.panda_video_id && <PandaEmbed videoId={live.panda_video_id} />}
                  {!live.panda_video_id && (
                    <div className="w-full aspect-video bg-surface-2 rounded-lg flex items-center justify-center">
                      <p className="text-text-muted text-sm">Gravação em processamento...</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
