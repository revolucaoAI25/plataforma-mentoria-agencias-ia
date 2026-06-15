'use client'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed select-none',
          {
            'bg-primary hover:bg-primary-hover text-white shadow-[0_0_12px_rgba(34,197,94,0.25)] hover:shadow-[0_0_20px_rgba(34,197,94,0.35)]': variant === 'primary',
            'bg-surface-2 border border-border hover:border-border hover:bg-surface-3 text-text-primary': variant === 'secondary',
            'bg-transparent border border-border hover:border-primary/40 hover:bg-surface-2 text-text-secondary hover:text-text-primary': variant === 'outline',
            'hover:bg-surface-2 text-text-secondary hover:text-text-primary': variant === 'ghost',
            'bg-red-950/50 border border-red-900/40 hover:bg-red-900/30 text-red-400': variant === 'danger',
          },
          {
            'h-7 px-3 text-xs': size === 'sm',
            'h-9 px-4 text-sm': size === 'md',
            'h-11 px-6 text-sm tracking-wide': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
export { Button }
