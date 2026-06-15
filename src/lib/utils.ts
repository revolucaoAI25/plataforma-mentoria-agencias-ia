import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MentoriaAccess, MentoriaType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAccessibleMentoriaTypes(access: MentoriaAccess[]): MentoriaType[] {
  if (access.includes('COMPLETA')) return ['COMERCIAL', 'ENTREGA']
  const types: MentoriaType[] = []
  if (access.includes('COMERCIAL')) types.push('COMERCIAL')
  if (access.includes('ENTREGA')) types.push('ENTREGA')
  return types
}

export function getMentoriaLabel(type: string): string {
  const labels: Record<string, string> = {
    COMERCIAL: 'Mentoria Comercial — Agência de IA',
    ENTREGA: 'Mentoria de Desenvolvimento e Entrega de Agentes de IA',
    COMPLETA: 'Mentoria Completa',
    AMBAS: 'Todas as Mentorias',
  }
  return labels[type] || type
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
