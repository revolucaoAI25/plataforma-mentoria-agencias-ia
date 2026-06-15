import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'blue' | 'yellow' | 'gray' | 'red'
  className?: string
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        {
          'bg-primary-muted text-primary-light': variant === 'green',
          'bg-blue-900/40 text-blue-400': variant === 'blue',
          'bg-yellow-900/40 text-yellow-400': variant === 'yellow',
          'bg-zinc-800 text-text-secondary': variant === 'gray',
          'bg-red-900/40 text-red-400': variant === 'red',
        },
        className
      )}
    >
      {children}
    </span>
  )
}

export function MentoriaBadge({ type }: { type: string }) {
  if (type === 'COMERCIAL') return <Badge variant="green">Comercial</Badge>
  if (type === 'ENTREGA') return <Badge variant="blue">Entrega</Badge>
  if (type === 'AMBAS') return <Badge variant="gray">Todas</Badge>
  return null
}

export function StatusBadge({ status }: { status: string }) {
  if (status === 'open') return <Badge variant="yellow">Aberto</Badge>
  if (status === 'answered') return <Badge variant="green">Respondido</Badge>
  if (status === 'closed') return <Badge variant="gray">Fechado</Badge>
  if (status === 'scheduled') return <Badge variant="blue">Agendada</Badge>
  if (status === 'completed') return <Badge variant="gray">Finalizada</Badge>
  return null
}
