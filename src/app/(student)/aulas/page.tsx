import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAccessibleMentoriaTypes, getMentoriaLabel } from '@/lib/utils'
import { MentoriaBadge } from '@/components/ui/badge'
import { BookOpen, Clock, CheckCircle } from 'lucide-react'
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
    .in('mentoria_type', mentoriaTypes)
    .order('order_index')

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)

  const completedIds = new Set((progress || []).map(p => p.lesson_id))

  const grouped = mentoriaTypes.reduce((acc, type) => {
    acc[type] = (modules || []).filter(m => m.mentoria_type === type)
    return acc
  }, {} as Record<string, Module[]>)

  const showMultiple = mentoriaTypes.length > 1

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-xs text-primary font-medium tracking-widest uppercase mb-1">Biblioteca</p>
        <h1 className="text-4xl font-bold text-white">Conteúdos</h1>
        <p className="text-text-secondary mt-2">Trilhas estratégicas para construir, operar e escalar sua agência.</p>
      </div>

      {mentoriaTypes.length === 0 && (
        <div className="text-center py-20 text-text-secondary">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
          <p>Você ainda não tem acesso a nenhuma mentoria.</p>
          <p className="text-sm mt-1">Entre em contato com o suporte.</p>
        </div>
      )}

      {mentoriaTypes.map(type => (
        <div key={type} className="mb-12">
          {showMultiple && (
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold">{getMentoriaLabel(type)}</h2>
              <MentoriaBadge type={type} />
            </div>
          )}
          {!showMultiple && <h2 className="text-xl font-bold mb-6">Módulos</h2>}

          {(grouped[type] || []).length === 0 ? (
            <p className="text-text-secondary text-sm">Nenhum módulo disponível ainda.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(grouped[type] || []).map((mod: Module & { lessons?: Lesson[] }, idx: number) => {
                const lessons = (mod.lessons || []).filter(l => l.is_published)
                const completed = lessons.filter(l => completedIds.has(l.id)).length
                const pct = lessons.length ? Math.round((completed / lessons.length) * 100) : 0

                return (
                  <div key={mod.id} className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-colors group">
                    <div className="h-32 bg-gradient-to-br from-surface-2 to-background flex items-end p-5">
                      <span className="text-5xl font-bold text-primary/60 group-hover:text-primary/80 transition-colors">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-1 leading-tight">{mod.title}</h3>
                      {mod.description && (
                        <p className="text-text-secondary text-sm mb-4 line-clamp-2">{mod.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} />
                          {lessons.length} aulas
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle size={12} />
                          {completed}/{lessons.length}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-border rounded-full">
                        <div
                          className="h-1 bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-text-muted mt-1">{pct}% concluído</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}

      {/* Aulas section */}
      <div className="mt-8 border-t border-border pt-8">
        <h2 className="text-xl font-bold mb-6">Todas as Aulas</h2>
        <AllLessonsList mentoriaTypes={mentoriaTypes} completedIds={completedIds} />
      </div>
    </div>
  )
}

async function AllLessonsList({ mentoriaTypes, completedIds }: { mentoriaTypes: MentoriaType[], completedIds: Set<string> }) {
  const supabase = await createClient()
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*, module:modules(title, mentoria_type)')
    .in('mentoria_type', mentoriaTypes)
    .eq('is_published', true)
    .order('order_index')

  if (!lessons?.length) return <p className="text-text-secondary text-sm">Nenhuma aula disponível.</p>

  return (
    <div className="space-y-2">
      {lessons.map(lesson => (
        <Link
          key={lesson.id}
          href={`/aulas/${lesson.id}`}
          className="flex items-center gap-4 p-4 bg-surface border border-border rounded-lg hover:border-primary/40 transition-colors group"
        >
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${completedIds.has(lesson.id) ? 'bg-primary border-primary' : 'border-border'}`}>
            {completedIds.has(lesson.id) && <CheckCircle size={14} className="text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white group-hover:text-primary-light transition-colors truncate">{lesson.title}</p>
            <p className="text-xs text-text-muted">{(lesson as any).module?.title}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <MentoriaBadge type={lesson.mentoria_type} />
            {lesson.duration_minutes && (
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Clock size={12} />
                {lesson.duration_minutes}min
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
