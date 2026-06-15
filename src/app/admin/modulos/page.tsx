import { createClient } from '@/lib/supabase/server'
import { ModulosClient } from './ModulosClient'

export default async function ModulosPage() {
  const supabase = await createClient()
  const { data: modules } = await supabase
    .from('modules')
    .select('*, lessons(id)')
    .order('mentoria_type')
    .order('order_index')

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs text-primary font-medium tracking-widest uppercase mb-1">Admin</p>
        <h1 className="text-4xl font-bold text-white">Módulos</h1>
      </div>
      <ModulosClient modules={modules || []} />
    </div>
  )
}
