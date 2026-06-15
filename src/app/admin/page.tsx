import { createClient } from '@/lib/supabase/server'
import { Users, BookOpen, MessageCircle, Radio } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: students },
    { count: lessons },
    { count: openTickets },
    { count: lives },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
    supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('lives').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Alunos', value: students || 0, icon: Users, color: 'text-blue-400' },
    { label: 'Aulas', value: lessons || 0, icon: BookOpen, color: 'text-primary' },
    { label: 'Lives', value: lives || 0, icon: Radio, color: 'text-purple-400' },
    { label: 'Tickets Abertos', value: openTickets || 0, icon: MessageCircle, color: 'text-yellow-400' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs text-primary font-medium tracking-widest uppercase mb-1">Painel</p>
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-surface border border-border rounded-xl p-6">
            <div className={`${stat.color} mb-3`}>
              <stat.icon size={24} />
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-text-secondary text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
