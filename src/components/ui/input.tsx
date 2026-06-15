import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full h-10 px-3 rounded-lg bg-surface border border-border text-white placeholder:text-text-muted text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
export { Input }
