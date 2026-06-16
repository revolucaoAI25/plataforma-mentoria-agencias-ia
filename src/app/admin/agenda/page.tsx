export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AgendaAdminClient } from './AgendaAdminClient'

export default async function AdminAgendaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/aulas')

  const { data: slots } = await supabase
    .from('mentoring_slots')
    .select('*, booking:mentoring_bookings(id, status, user_id, profiles(full_name))')
    .eq('is_active', true)
    .order('starts_at')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'student')
    .order('full_name')

  const { data: quotas } = await supabase.from('mentoring_quotas').select('*')

  return <AgendaAdminClient slots={slots || []} profiles={profiles || []} quotas={quotas || []} />
}
