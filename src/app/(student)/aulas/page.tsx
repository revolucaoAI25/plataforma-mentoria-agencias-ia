export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAccessibleMentoriaTypes, getMentoriaLabel } from '@/lib/utils'
import { MentoriaBadge } from '@/components/ui/badge'
import { BookOpen, Clock, CheckCircle, ChevronRight } from 'lucide-react'
import type { MentoriaAccess, MentoriaType, Module, Lesson } from '@/types'

export default async function AulasPage() {
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

  const { data: modules } = await supabase
    .from('modules')
    .select('*, lessons(id, title, order_index, duration_minutes, is_published, mentoria_type)')
    .in('mentoria_type', mentoriaTypes.length > 0 ? mentoriaTypes : ['__none__'])
    .order('order_index')

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)

  const completedIds = new Set((progress || []).map(p => p.lesson_id))
  const showMultiple = mentoriaTypes.length > 1

  const grouped = mentoriaTypes.reduce((acc, type) => {
    acc[type] = (modules || []).filter(m => m.mentoria_type === type)
    return acc
  }, {} as Record<string, Module[]>)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-8 pt-10 pb-8 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-muted/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-2">Biblioteca</p>
          <h1 className="text-4xl font-black text-text-primary tracking-tight mb-2">Conteúdos</h1>
          <p className="text-text-secondary text-sm">Trilhas estratégicas para construir, operar e escalar sua agência.</p>
        </div>
      </div>

      <div className="px-8 py-8 max-w-5xl mx-auto">
        {mentoriaTypes.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-text-muted" />
            </div>
            <p className="text-text-secondary font-medium">Nenhuma mentoria disponível</p>
            <p className="text-text-muted text-sm mt-1">Entre em contato com o suporte para obter acesso.</p>
          </div>
        )}

        {mentoriaTypes.map(type => (
          <div key={type} className="mb-12">
            {showMultiple && (
              <div className="flex items-center gap-3 mb-6">
                <div className="w-0.5 h-5 bg-primary rounded-full" />
                <h2 className="text-lg font-bold text-text-primary tracking-tight">{getMentoriaLabel(type)}</h2>
                <MentoriaBadge type={type} />
              </div>
            )}
            {!showMultiple && (
              <div className="flex items-center gap-3 mb-6">
                <div className="w-0.5 h-5 bg-primary rounded-full" />
                <h2 className="text-lg font-bold text-text-primary tracking-tight">Módulos</h2>
              </div>
            )}

            {(grouped[type] || []).length === 0 ? (
              <p className="text-text-muted text-sm pl-4">Nenhum módulo disponível ainda.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(grouped[type] || []).map((mod: Module & { lessons?: Lesson[] }, idx: number) => {
                  const lessons = (mod.lessons || []).filter(l => l.is_published)
                  const completed = lessons.filter(l => completedIds.has(l.id)).length
                  const pct = lessons.length ? Math.round((completed / lessons.length) * 100) : 0

                  return (
                    <Link key={mod.id} href={`/modulos/${mod.id}`} className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-200 hover:shadow-[0_0_24px_rgba(34,197,94,0.07)]">
                      <div className="h-28 bg-gradient-to-br from-surface-3 via-surface-2 to-surface relative overflow-hidden flex items-end p-5">
                        <div className="absolute top-4 right-5 opacity-10 group-hover:opacity-20 transition-opacity">
                          <div className="w-16 h-16 rounded-full border-2 border-primary" />
                        </div>
                        <span className="text-5xl font-black text-primary/30 group-hover:text-primary/50 transition-colors leading-none">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-text-primary text-sm mb-1.5 leading-snug">{mod.title}</h3>
                        {mod.description && (
                          <p className="text-text-muted text-xs mb-4 line-clamp-2 leading-relaxed">{mod.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-text-muted mb-3">
                          <span className="flex items-center gap-1.5">
                            <BookOpen size={11} />
                            {lessons.length} {lessons.length === 1 ? 'aula' : 'aulas'}
                          </span>
                          <span className="text-primary font-semibold">{pct}%</span>
                        </div>
                        <div className="w-full h-0.5 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {/* All lessons */}
        {mentoriaTypes.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-0.5 h-5 bg-border rounded-full" />
              <h2 className="text-lg font-bold text-text-primary tracking-tight">Todas as Aulas</h2>
            </div>
            <AllLessonsList mentoriaTypes={mentoriaTypes} completedIds={completedIds} showMentoria={showMultiple} />
          </div>
        )}
      </div>
    </div>
  )
}

async function AllLessonsList({ mentoriaTypes, completedIds, showMentoria }: {
  mentoriaTypes: MentoriaType[]
  completedIds: Set<string>
  showMentoria: boolean
}) {
  const supabase = await createClient()
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*, module:modules(title)')
    .in('mentoria_type', mentoriaTypes)
    .eq('is_published', true)
    .order('mentoria_type')
    .order('order_index')

  if (!lessons?.length) return (
    <p className="text-text-muted text-sm pl-4">Nenhuma aula disponível ainda.</p>
  )

  return (
    <div className="space-y-1">
      {lessons.map((lesson, i) => {
        const done = completedIds.has(lesson.id)
        return (
          <Link
            key={lesson.id}
            href={`/aulas/${lesson.id}`}
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-surface-2 border border-transparent hover:border-border transition-all group"
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${done ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/40'}`}>
              {done && <CheckCircle size={11} className="text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors truncate">{lesson.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{(lesson as any).module?.title}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {showMentoria && <MentoriaBadge type={lesson.mentoria_type} />}
              {lesson.duration_minutes && (
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Clock size={10} />
                  {lesson.duration_minutes}min
                </span>
              )}
              <span className="text-text-muted text-xs">#{String(i + 1).padStart(2, '0')}</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
