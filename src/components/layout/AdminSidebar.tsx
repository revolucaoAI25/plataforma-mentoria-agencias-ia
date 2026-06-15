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
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-lg">
            LM
          </div>
          <div>
            <p className="font-semibold text-white text-sm leading-tight">Admin</p>
            <p className="text-xs text-primary font-medium tracking-widest uppercase">Painel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-muted text-primary-light border-l-2 border-primary'
                  : 'text-text-secondary hover:text-white hover:bg-surface-2'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <Link
          href="/aulas"
          className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-surface-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
          Área do Aluno
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-red-400 hover:bg-surface-2 rounded-lg transition-colors w-full"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
