'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatDateTime } from '@/lib/utils'
import type { LessonComment } from '@/types'

export function LessonComments({ lessonId, initialComments, userId }: {
  lessonId: string
  initialComments: LessonComment[]
  userId: string
}) {
  const [comments, setComments] = useState(initialComments)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    const { data, error } = await supabase
      .from('lesson_comments')
      .insert({ lesson_id: lessonId, user_id: userId, content: content.trim() })
      .select('*, profiles(full_name)')
      .single()

    if (!error && data) {
      setComments(prev => [...prev, data as LessonComment])
      setContent('')
    }
    setLoading(false)
  }

  return (
    <div>
      <h3 className="font-semibold text-white mb-4">Comentários ({comments.length})</h3>

      <form onSubmit={handleSubmit} className="mb-6">
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Deixe seu comentário ou dúvida..."
          rows={3}
          className="mb-3"
        />
        <Button type="submit" size="sm" disabled={loading || !content.trim()}>
          {loading ? 'Enviando...' : 'Comentar'}
        </Button>
      </form>

      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-text-muted text-sm">Seja o primeiro a comentar.</p>
        )}
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
              {comment.profiles?.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">{comment.profiles?.full_name || 'Usuário'}</span>
                <span className="text-xs text-text-muted">{formatDateTime(comment.created_at)}</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
