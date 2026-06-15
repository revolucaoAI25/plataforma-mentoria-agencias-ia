import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PandaEmbed } from '@/components/lessons/VideoPlayer'
import { LessonComments } from '@/components/lessons/LessonComments'
import { CompleteButton } from '@/components/lessons/CompleteButton'
import { MentoriaBadge } from '@/components/ui/badge'
import { CheckCircle, FileText, Link as LinkIcon, ArrowLeft } from 'lucide-react'
import { getMentoriaLabel } from '@/lib/utils'
import type { LessonComment } from '@/types'

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, module:modules(*), materials:lesson_materials(*), comments:lesson_comments(*, profiles(full_name))')
    .eq('id', lessonId)
    .single()

  if (!lesson) notFound()

  const { data: progressRow } = await supabase
    .from('lesson_progress')
    .select('id')
    .eq('lesson_id', lessonId)
    .eq('user_id', user.id)
    .single()

  const completed = !!progressRow

  // Sibling lessons in same module
  const { data: siblings } = await supabase
    .from('lessons')
    .select('id, title, order_index')
    .eq('module_id', lesson.module_id)
    .eq('is_published', true)
    .order('order_index')

  const { data: siblingProgress } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .in('lesson_id', (siblings || []).map(s => s.id))

  const siblingCompletedIds = new Set((siblingProgress || []).map(p => p.lesson_id))

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
          <p className="text-primary font-medium uppercase tracking-widest">{getMentoriaLabel(lesson.mentoria_type)}</p>
          <span>/</span>
          <p>{lesson.module?.title}</p>
        </div>

        <div className="flex items-start justify-between mb-6">
          <h1 className="text-3xl font-bold text-white leading-tight">{lesson.title}</h1>
          <Link href="/aulas" className="flex items-center gap-1 text-sm text-text-secondary hover:text-white transition-colors flex-shrink-0 ml-4">
            <ArrowLeft size={14} />
            Conteúdos
          </Link>
        </div>

        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <PandaEmbed videoId={lesson.panda_video_id || ''} />

            <div className="flex items-center gap-3 mt-4 mb-6">
              <MentoriaBadge type={lesson.mentoria_type} />
              <CompleteButton lessonId={lessonId} completed={completed} />
            </div>

            {lesson.description && (
              <div className="mb-8">
                <h3 className="font-semibold text-white mb-3">Sobre esta aula</h3>
                <p className="text-text-secondary leading-relaxed text-sm whitespace-pre-wrap">{lesson.description}</p>
              </div>
            )}

            {lesson.materials?.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-white mb-3">Materiais</h3>
                <div className="space-y-2">
                  {lesson.materials.map((mat: any) => (
                    <a
                      key={mat.id}
                      href={mat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary/40 transition-colors group"
                    >
                      {mat.type === 'pdf' || mat.type === 'file' ? (
                        <FileText size={16} className="text-primary flex-shrink-0" />
                      ) : (
                        <LinkIcon size={16} className="text-primary flex-shrink-0" />
                      )}
                      <span className="text-sm text-white group-hover:text-primary-light transition-colors">{mat.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-8">
              <LessonComments
                lessonId={lessonId}
                initialComments={(lesson.comments || []) as LessonComment[]}
                userId={user.id}
              />
            </div>
          </div>

          {/* Sidebar — module lessons */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-surface border border-border rounded-xl p-4 sticky top-8">
              <p className="text-xs font-medium text-primary uppercase tracking-widest mb-1">{getMentoriaLabel(lesson.mentoria_type)}</p>
              <p className="text-sm font-semibold text-white mb-1">{lesson.module?.title}</p>
              <p className="text-xs text-text-muted mb-4">
                {siblingCompletedIds.size} de {siblings?.length || 0} aulas concluídas
              </p>
              <div className="w-full h-1 bg-border rounded-full mb-4">
                <div
                  className="h-1 bg-primary rounded-full"
                  style={{ width: `${siblings?.length ? (siblingCompletedIds.size / siblings.length) * 100 : 0}%` }}
                />
              </div>
              <div className="space-y-1">
                {(siblings || []).map(s => {
                  const isCurrent = s.id === lessonId
                  const isDone = siblingCompletedIds.has(s.id)
                  return (
                    <Link
                      key={s.id}
                      href={`/aulas/${s.id}`}
                      className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${isCurrent ? 'bg-primary-muted text-primary-light' : 'hover:bg-surface-2 text-text-secondary hover:text-white'}`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-primary border-primary' : isCurrent ? 'border-primary' : 'border-border'}`}>
                        {isDone && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <span className="truncate">{s.title}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
