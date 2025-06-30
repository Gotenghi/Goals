import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 숫자 포맷팅 함수
export function formatNumber(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}억`
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(0)}만`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toLocaleString()
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