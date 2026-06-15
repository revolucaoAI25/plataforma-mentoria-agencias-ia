export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { AlunosClient } from './AlunosClient'

export default async function AlunosPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs text-primary font-medium tracking-widest uppercase mb-1">Admin</p>
        <h1 className="text-4xl font-bold text-white">Alunos</h1>
      </div>
      <AlunosClient profiles={profiles || []} />
    </div>
  )
}
