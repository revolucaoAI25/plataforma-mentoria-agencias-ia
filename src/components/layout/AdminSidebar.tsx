'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, BookOpen, Layers, Radio, Users, MessageCircle, LogOut, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/modulos', label: 'Módulos', icon: Layers },
  { href: '/admin/aulas', label: 'Aulas', icon: BookOpen },
  { href: '/admin/lives', label: 'Lives', icon: Radio },
  { href: '/admin/alunos', label: 'Alunos', icon: Users },
  { href: '/admin/suporte', label: 'Suporte', icon: MessageCircle },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 h-screen bg-surface border-r border-border flex flex-col fixed left-0 top-0 z-40">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center font-black text-white text-sm tracking-tight glow-green-sm flex-shrink-0">
            LM
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight tracking-tight">Painel Admin</p>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-primary opacity-80">Revolução AI</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-text-muted tracking-[0.15em] uppercase px-3 pt-2 pb-3">Gestão</p>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary-muted text-primary border-l-2 border-primary pl-[10px]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
              )}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-0.5">
        <Link href="/aulas" className="flex items-center gap-3 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors">
          <ArrowLeft size={13} />
          Área do Aluno
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-xs text-text-secondary hover:text-red-400 hover:bg-surface-2 rounded-lg transition-colors w-full">
          <LogOut size={13} />
          Sair
        </button>
      </div>
    </aside>
  )
}
