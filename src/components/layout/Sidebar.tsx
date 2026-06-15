'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, Radio, MessageCircle, User, LogOut, Shield } from 'lucide-react'
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

  const initials = profile?.full_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <aside className="w-64 h-screen bg-surface border-r border-border flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center font-black text-white text-sm tracking-tight glow-green-sm flex-shrink-0">
            LM
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight tracking-tight">Lucas Magalhães</p>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-primary opacity-80">Revolução AI</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-text-muted tracking-[0.15em] uppercase px-3 pt-2 pb-3">Sua Jornada</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
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

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-0.5">
        {profile?.role === 'admin' && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary-muted rounded-lg transition-colors"
          >
            <Shield size={13} />
            Painel Admin
          </Link>
        )}
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div className="w-7 h-7 rounded-full bg-primary-muted border border-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">{profile?.full_name || 'Usuário'}</p>
            <p className="text-[10px] text-text-muted capitalize">{profile?.role === 'admin' ? 'Administrador' : 'Aluno'}</p>
          </div>
          <button onClick={handleLogout} className="text-text-muted hover:text-red-400 transition-colors flex-shrink-0" title="Sair">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
