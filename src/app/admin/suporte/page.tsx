export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { AdminSupportClient } from './AdminSupportClient'

export default async function AdminSuportePage() {
  const supabase = await createClient()
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*, profiles(full_name), replies:ticket_replies(*, profiles(full_name))')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs text-primary font-medium tracking-widest uppercase mb-1">Admin</p>
        <h1 className="text-4xl font-bold text-white">Suporte</h1>
      </div>
      <AdminSupportClient tickets={tickets || []} />
    </div>
  )
}
