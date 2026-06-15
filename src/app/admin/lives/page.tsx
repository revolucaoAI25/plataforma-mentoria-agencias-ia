import { createClient } from '@/lib/supabase/server'
import { LivesAdminClient } from './LivesAdminClient'

export default async function LivesAdminPage() {
  const supabase = await createClient()
  const { data: lives } = await supabase
    .from('lives')
    .select('*')
    .order('scheduled_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs text-primary font-medium tracking-widest uppercase mb-1">Admin</p>
        <h1 className="text-4xl font-bold text-white">Lives</h1>
      </div>
      <LivesAdminClient lives={lives || []} />
    </div>
  )
}
