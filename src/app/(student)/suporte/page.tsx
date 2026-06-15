import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatusBadge, MentoriaBadge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { SupportClient } from './SupportClient'
import type { MentoriaAccess } from '@/types'

export default async function SuportePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('mentoria_access')
    .eq('id', user.id)
    .single()

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*, replies:ticket_replies(*, profiles(full_name))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const access = (profile?.mentoria_access || []) as MentoriaAccess[]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-xs text-primary font-medium tracking-widest uppercase mb-1">Ajuda</p>
        <h1 className="text-4xl font-bold text-white">Suporte</h1>
        <p className="text-text-secondary mt-2">Abra uma demanda e nossa equipe responderá em breve.</p>
      </div>

      <SupportClient tickets={tickets || []} access={access} userId={user.id} />
    </div>
  )
}
