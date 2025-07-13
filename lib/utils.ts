import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatNumber = (num: number) => {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}억`
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}만`
  }
  return num.toLocaleString()
}

export const formatWatchTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  if (hours >= 10000) {
    return `${(hours / 10000).toFixed(1)}만시간`
  }
  return `${hours.toLocaleString()}시간`
}

// YouTube API 캐싱 유틸리티
export interface CachedData<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export const CACHE_DURATION = {
  YOUTUBE_ANALYTICS: 2 * 60 * 60 * 1000, // 2시간
  YOUTUBE_COMMENTS: 4 * 60 * 60 * 1000, // 4시간
  YOUTUBE_CHANNEL: 6 * 60 * 60 * 1000,  // 6시간
}

export const getCachedData = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    
    const parsedCache: CachedData<T> = JSON.parse(cached)
    const now = Date.now()
    
    if (now > parsedCache.expiresAt) {
      localStorage.removeItem(key)
      return null
    }
    
    return parsedCache.data
  } catch (error) {
    console.error('캐시 데이터 읽기 실패:', error)
    return null
  }
}

export const setCachedData = <T>(key: string, data: T, duration: number = CACHE_DURATION.YOUTUBE_ANALYTICS): void => {
  if (typeof window === 'undefined') return
  
  try {
    const now = Date.now()
    const cachedData: CachedData<T> = {
      data,
      timestamp: now,
      expiresAt: now + duration
    }
    
    localStorage.setItem(key, JSON.stringify(cachedData))
  } catch (error) {
    console.error('캐시 데이터 저장 실패:', error)
  }
}

export const clearCachedData = (key: string): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('캐시 데이터 삭제 실패:', error)
  }
}

export const isCacheValid = (key: string): boolean => {
  if (typeof window === 'undefined') return false
  
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return false
    
    const parsedCache: CachedData<any> = JSON.parse(cached)
    return Date.now() < parsedCache.expiresAt
  } catch (error) {
    return false
  }
}

export const getCacheInfo = (key: string): { isValid: boolean; remainingTime: number } | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    
    const parsedCache: CachedData<any> = JSON.parse(cached)
    const now = Date.now()
    const remainingTime = parsedCache.expiresAt - now
    
    return {
      isValid: remainingTime > 0,
      remainingTime: Math.max(0, remainingTime)
    }
  } catch (error) {
    return null
  }
}

// 영상 길이 포맷팅 유틸리티 함수
export function formatDuration(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || isNaN(seconds)) {
    return '0:00'
  }
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// 성장률 색상 유틸리티 함수
export function getGrowthColor(rate: number): string {
  if (rate > 0) return 'text-success-600'
  if (rate < 0) return 'text-danger-600'
  return 'text-neutral-600'
}

// 성장률 아이콘 유틸리티 함수 (React 컴포넌트는 별도 처리 필요)
export function getGrowthDirection(rate: number): 'up' | 'down' | 'neutral' {
  if (rate > 0) return 'up'
  if (rate < 0) return 'down'
  return 'neutral'
}

// 진행률 계산 함수
export function calculateProgress(current: number, target: number): number {
  return target > 0 ? (current / target) * 100 : 0
}

// 날짜 포맷팅 함수
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 진행률에 따른 상태 반환
export function getProgressStatus(progress: number): 'success' | 'warning' | 'danger' {
  if (progress >= 75) return 'success'
  if (progress >= 50) return 'warning'
  return 'danger'
}

// 색상 클래스 반환
export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'success':
      return 'bg-green-100 text-green-800'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800'
    case 'danger':
    case 'inactive':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// 로컬스토리지에서 데이터 저장/불러오기
export const saveToLocalStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

export const loadFromLocalStorage = (key: string, defaultValue: any) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error)
      return defaultValue
    }
  }
  return defaultValue
}

// 기본 목표 데이터
export const defaultGoals = [
  {
    id: 'adsense',
    title: '애드센스 수익',
    target: 264000000,
    current: 0,
    unit: '원',
    color: 'bg-usso-primary',
    description: '3억 3천만원에서 20% 하향 조정',
    deadline: '2025년 3분기'
  },
  {
    id: 'ads',
    title: '광고 수익',
    target: 75000000,
    current: 0,
    unit: '원',
    color: 'bg-usso-secondary',
    description: '광고 협찬 및 브랜딩',
    deadline: '2025년 3분기'
  },
  {
    id: 'royalty',
    title: '인세 수익',
    target: 80000000,
    current: 0,
    unit: '원',
    color: 'bg-usso-accent',
    description: '책읽는 코뿔소 4000만 + 미래엔 4000만',
    deadline: '2025년 3분기'
  },
  {
    id: 'product',
    title: '상품 판매',
    target: 50000000,
    current: 0,
    unit: '원',
    color: 'bg-purple-500',
    description: '굿즈 및 상품 판매',
    deadline: '2025년 3분기'
  }
]

// 기본 채널 지표 데이터
export const defaultChannelMetrics = {
  monthlyViews: {
    target: 50000000,
    current: 0,
    unit: '회'
  },
  dailyUploads: {
    target: 2.5,
    current: 0,
    unit: '개'
  },
  subscribers: {
    target: 100000,
    current: 0,
    unit: '명'
  },
  instagramFollowers: {
    target: 3200,
    current: 800,
    unit: '명'
  }
}