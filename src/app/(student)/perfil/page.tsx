export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-xs text-primary font-medium tracking-widest uppercase mb-1">Conta</p>
        <h1 className="text-4xl font-bold text-white">Perfil</h1>
        <p className="text-text-secondary mt-2">Sua identidade dentro da plataforma.</p>
      </div>
      <ProfileClient profile={profile} email={user.email || ''} />
    </div>
  )
}
