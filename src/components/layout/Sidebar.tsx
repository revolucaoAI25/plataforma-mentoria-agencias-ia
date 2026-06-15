'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, Radio, MessageCircle, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

const navItems = [
  { href: '/aulas', label: 'Aulas', icon: BookOpen },
  { href: '/lives', label: 'Lives', icon: Radio },
  { href: '/suporte', label: 'Suporte', icon: MessageCircle },
  { href: '/perfil', label: 'Perfil', icon: User },
]

export function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 h-screen bg-surface border-r border-border flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-lg">
            LM
          </div>
          <div>
            <p className="font-semibold text-white text-sm leading-tight">Lucas Magalhães</p>
            <p className="text-xs text-primary font-medium tracking-widest uppercase">Mentoria</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs text-text-muted font-medium uppercase tracking-widest px-3 pb-2">Sua Jornada</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
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

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'Usuário'}</p>
            <p className="text-xs text-text-muted capitalize">{profile?.role === 'admin' ? 'Administrador' : 'Aluno'}</p>
          </div>
        </div>
        {profile?.role === 'admin' && (
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-surface-2 rounded-lg transition-colors mb-1"
          >
            Área Admin
          </Link>
        )}
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
