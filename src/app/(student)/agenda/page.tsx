export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AgendaClient } from './AgendaClient'

export default async function AgendaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch lives
  const { data: lives } = await supabase
    .from('lives')
    .select('id, title, scheduled_at, status, mentoria_type')
    .eq('status', 'scheduled')
    .order('scheduled_at')

  // Fetch all active slots
  const { data: slots } = await supabase
    .from('mentoring_slots')
    .select('*')
    .eq('is_active', true)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at')

  // Fetch user bookings (confirmed)
  const { data: bookings } = await supabase
    .from('mentoring_bookings')
    .select('*, slot:mentoring_slots(*)')
    .eq('user_id', user.id)
    .eq('status', 'confirmed')

  // Fetch user quota
  const { data: quota } = await supabase
    .from('mentoring_quotas')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Compute used count based on period
  const bookedSlotIds = new Set((bookings || []).map(b => b.slot_id))
  const now = new Date()
  let usedCount = 0
  const allBookings = bookings || []

  if (!quota || quota.quota_period === 'total') {
    usedCount = allBookings.length
  } else if (quota.quota_period === 'monthly') {
    usedCount = allBookings.filter(b => {
      const d = new Date(b.slot?.starts_at || b.created_at)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
  } else if (quota.quota_period === 'semester') {
    const semStart = now.getMonth() < 6 ? 0 : 6
    usedCount = allBookings.filter(b => {
      const d = new Date(b.slot?.starts_at || b.created_at)
      return d.getFullYear() === now.getFullYear() && d.getMonth() >= semStart && d.getMonth() < semStart + 6
    }).length
  } else if (quota.quota_period === 'yearly') {
    usedCount = allBookings.filter(b => {
      const d = new Date(b.slot?.starts_at || b.created_at)
      return d.getFullYear() === now.getFullYear()
    }).length
  }

  const quotaAmount = quota?.quota_amount ?? 1
  const quotaPeriod = quota?.quota_period ?? 'total'
  const hasQuota = usedCount < quotaAmount

  return (
    <AgendaClient
      lives={lives || []}
      slots={slots || []}
      bookings={bookings || []}
      bookedSlotIds={Array.from(bookedSlotIds)}
      usedCount={usedCount}
      quotaAmount={quotaAmount}
      quotaPeriod={quotaPeriod}
      hasQuota={hasQuota}
      userId={user.id}
    />
  )
}
