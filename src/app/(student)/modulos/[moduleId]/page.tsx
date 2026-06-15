export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getMentoriaLabel } from '@/lib/utils'
import { MentoriaBadge } from '@/components/ui/badge'
import { CheckCircle, Clock, ArrowLeft, BookOpen, Lock } from 'lucide-react'

export default async function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('mentoria_access, role')
    .eq('id', user.id)
    .single()

  const { data: mod } = await supabase
    .from('modules')
    .select('*')
    .eq('id', moduleId)
    .single()

  if (!mod) notFound()

  // Access check for non-admins
  if (profile?.role !== 'admin') {
    const access = profile?.mentoria_access || []
    const hasAccess = access.includes('COMPLETA') || access.includes(mod.mentoria_type)
    if (!hasAccess) redirect('/aulas')
  }

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .eq('is_published', true)
    .order('order_index')

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .in('lesson_id', (lessons || []).map(l => l.id))

  const completedIds = new Set((progress || []).map(p => p.lesson_id))
  const published = (lessons || []).filter(l => l.panda_video_id)
  const completed = published.filter(l => completedIds.has(l.id)).length
  const pct = published.length ? Math.round((completed / published.length) * 100) : 0

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-8 pt-10 pb-8 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-muted/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <Link href="/aulas" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-4">
            <ArrowLeft size={12} />
            Conteúdos
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <MentoriaBadge type={mod.mentoria_type} />
            <p className="text-xs text-text-muted">{getMentoriaLabel(mod.mentoria_type)}</p>
          </div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">{mod.title}</h1>
          {mod.description && <p className="text-text-secondary text-sm leading-relaxed">{mod.description}</p>}
          <div className="flex items-center gap-6 mt-5">
            <span className="flex items-center gap-1.5 text-sm text-text-muted">
              <BookOpen size={13} />
              {(lessons || []).length} aulas
            </span>
            <div className="flex items-center gap-3 flex-1 max-w-48">
              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-semibold text-primary">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson list */}
      <div className="px-8 py-8 max-w-3xl mx-auto">
        {(lessons || []).length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p>Nenhuma aula disponível neste módulo ainda.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {(lessons || []).map((lesson, i) => {
              const done = completedIds.has(lesson.id)
              const comingSoon = !lesson.panda_video_id
              return (
                <Link
                  key={lesson.id}
                  href={`/aulas/${lesson.id}`}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-surface-2 border border-transparent hover:border-border transition-all group"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${done ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/40'}`}>
                    {done ? <CheckCircle size={13} className="text-white" /> : (
                      <span className="text-[10px] font-bold text-text-muted">{String(i + 1).padStart(2, '0')}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">{lesson.title}</p>
                    {lesson.description && (
                      <p className="text-xs text-text-muted mt-0.5 truncate">{lesson.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {comingSoon ? (
                      <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-950/40 px-2 py-0.5 rounded font-medium">
                        <Clock size={10} />Em Breve
                      </span>
                    ) : lesson.duration_minutes ? (
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock size={10} />
                        {lesson.duration_minutes}min
                      </span>
                    ) : null}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
