'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export function CompleteButton({ lessonId, completed }: { lessonId: string, completed: boolean }) {
  const [done, setDone] = useState(completed)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    if (!done) {
      await supabase.from('lesson_progress').upsert({ lesson_id: lessonId })
      setDone(true)
    } else {
      await supabase.from('lesson_progress').delete().eq('lesson_id', lessonId)
      setDone(false)
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <Button
      onClick={toggle}
      disabled={loading}
      variant={done ? 'secondary' : 'primary'}
      className="gap-2"
    >
      <CheckCircle size={16} />
      {done ? 'Concluída' : 'Marcar como concluída'}
    </Button>
  )
}
