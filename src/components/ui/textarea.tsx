import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-3 py-2 rounded-lg bg-surface border border-border text-white placeholder:text-text-muted text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-none',
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'
export { Textarea }
