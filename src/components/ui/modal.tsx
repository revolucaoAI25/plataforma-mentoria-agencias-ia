'use client'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-surface border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl', className)}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold text-text-primary tracking-tight">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function FormField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest block mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  )
}

export function SelectField({ label, value, onChange, children, hint }: {
  label: string; value: string; onChange: (v: string) => void; children: React.ReactNode; hint?: string
}) {
  return (
    <FormField label={label} hint={hint}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg bg-surface-2 border border-border text-text-primary text-sm font-medium focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
      >
        {children}
      </select>
    </FormField>
  )
}
