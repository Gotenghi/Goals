import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 디버깅을 위한 로그
if (typeof window !== 'undefined') {
  console.log('Supabase URL 설정됨:', !!supabaseUrl)
  console.log('Supabase Anon Key 설정됨:', !!supabaseAnonKey)
}

// Supabase 설정이 있는 경우에만 클라이언트 생성
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Non-null assertion을 위한 타입 가드
export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check your environment variables.')
  }
  return supabase
}

// Supabase 사용 가능 여부 확인
export const isSupabaseEnabled = !!supabase

if (typeof window !== 'undefined') {
  console.log('Supabase 클라이언트 활성화됨:', isSupabaseEnabled)
}

// 데이터베이스 타입 정의
export interface Goal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  color: string
  description: string
  deadline: string
  created_at?: string
  updated_at?: string
}

export interface ChannelMetric {
  id: string
  metric_name: string
  target: number
  current: number
  unit: string
  date: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  status: 'active' | 'warning' | 'inactive'
}

export interface Task {
  id: string
  member_id: string
  title: string
  progress: number
  status: 'completed' | 'in-progress' | 'pending'
  priority: 'high' | 'medium' | 'low'
} 