import { createClient } from '@/lib/supabase/server'
import { AulasAdminClient } from './AulasAdminClient'

export default async function AulasAdminPage() {
  const supabase = await createClient()
  const [{ data: lessons }, { data: modules }] = await Promise.all([
    supabase.from('lessons').select('*, module:modules(title, mentoria_type)').order('mentoria_type').order('order_index'),
    supabase.from('modules').select('id, title, mentoria_type').order('order_index'),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs text-primary font-medium tracking-widest uppercase mb-1">Admin</p>
        <h1 className="text-4xl font-bold text-white">Aulas</h1>
      </div>
      <AulasAdminClient lessons={lessons || []} modules={modules || []} />
    </div>
  )
}
