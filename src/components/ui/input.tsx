import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full h-10 px-3 rounded-lg bg-surface-2 border border-border text-text-primary placeholder:text-text-muted text-sm font-medium focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all duration-150',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
export { Input }
