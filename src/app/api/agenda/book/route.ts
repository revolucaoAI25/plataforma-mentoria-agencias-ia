import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { slotId } = await request.json()
  if (!slotId) return NextResponse.json({ error: 'slotId obrigatório' }, { status: 400 })

  // Check slot exists and is active
  const { data: slot } = await supabase.from('mentoring_slots').select('*').eq('id', slotId).eq('is_active', true).single()
  if (!slot) return NextResponse.json({ error: 'Horário não encontrado ou inativo' }, { status: 404 })

  // Check slot not already booked
  const { data: existing } = await supabase.from('mentoring_bookings').select('id').eq('slot_id', slotId).eq('status', 'confirmed').single()
  if (existing) return NextResponse.json({ error: 'Este horário já foi reservado' }, { status: 409 })

  // Check quota
  const { data: quota } = await supabase.from('mentoring_quotas').select('*').eq('user_id', user.id).single()
  const quotaAmount = quota?.quota_amount ?? 1
  const quotaPeriod = quota?.quota_period ?? 'total'

  const { data: userBookings } = await supabase
    .from('mentoring_bookings')
    .select('id, slot:mentoring_slots(starts_at)')
    .eq('user_id', user.id)
    .eq('status', 'confirmed')

  const now = new Date()
  let usedCount = 0
  const bkgs = userBookings || []

  if (quotaPeriod === 'total') {
    usedCount = bkgs.length
  } else if (quotaPeriod === 'monthly') {
    usedCount = bkgs.filter(b => {
      const slotData = b.slot as unknown as { starts_at: string } | null
      const d = new Date(slotData?.starts_at || '')
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
  } else if (quotaPeriod === 'semester') {
    const semStart = now.getMonth() < 6 ? 0 : 6
    usedCount = bkgs.filter(b => {
      const slotData = b.slot as unknown as { starts_at: string } | null
      const d = new Date(slotData?.starts_at || '')
      return d.getFullYear() === now.getFullYear() && d.getMonth() >= semStart && d.getMonth() < semStart + 6
    }).length
  } else if (quotaPeriod === 'yearly') {
    usedCount = bkgs.filter(b => {
      const slotData = b.slot as unknown as { starts_at: string } | null
      const d = new Date(slotData?.starts_at || '')
      return d.getFullYear() === now.getFullYear()
    }).length
  }

  if (usedCount >= quotaAmount) {
    const periodLabel = quotaPeriod === 'total' ? 'no total' : quotaPeriod === 'monthly' ? 'neste mês' : quotaPeriod === 'semester' ? 'neste semestre' : 'neste ano'
    return NextResponse.json({ error: `Cota esgotada. Você já usou ${usedCount} de ${quotaAmount} sessão(ões) ${periodLabel}.` }, { status: 403 })
  }

  // Create booking
  const { error } = await supabase.from('mentoring_bookings').insert({
    slot_id: slotId,
    user_id: user.id,
    status: 'confirmed',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
