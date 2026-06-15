export type MentoriaType = 'COMERCIAL' | 'ENTREGA'
export type MentoriaAccess = 'COMERCIAL' | 'ENTREGA' | 'COMPLETA'

export interface Profile {
  id: string
  full_name: string | null
  role: 'student' | 'admin'
  mentoria_access: MentoriaAccess[]
  phone: string | null
  instagram: string | null
  city: string | null
  niche: string | null
  main_promise: string | null
  portfolio_url: string | null
  avatar_url: string | null
  created_at: string
}

export interface Module {
  id: string
  mentoria_type: MentoriaType
  title: string
  description: string | null
  order_index: number
  created_at: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  module_id: string
  mentoria_type: MentoriaType
  title: string
  description: string | null
  panda_video_id: string | null
  order_index: number
  duration_minutes: number | null
  is_published: boolean
  created_at: string
  module?: Module
  materials?: LessonMaterial[]
  comments?: LessonComment[]
  completed?: boolean
}

export interface LessonMaterial {
  id: string
  lesson_id: string
  title: string
  type: 'pdf' | 'link' | 'file'
  url: string
  created_at: string
}

export interface LessonComment {
  id: string
  lesson_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: { full_name: string | null }
}

export interface Live {
  id: string
  mentoria_type: MentoriaType | 'AMBAS'
  title: string
  description: string | null
  status: 'scheduled' | 'completed'
  scheduled_at: string
  panda_video_id: string | null
  created_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  mentoria_type: MentoriaType | null
  title: string
  description: string
  status: 'open' | 'answered' | 'closed'
  created_at: string
  profiles?: { full_name: string | null }
  replies?: TicketReply[]
}

export interface TicketReply {
  id: string
  ticket_id: string
  user_id: string
  content: string
  is_admin: boolean
  created_at: string
  profiles?: { full_name: string | null }
}
