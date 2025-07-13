'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Eye, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Target,
  Lightbulb,
  DollarSign,
  Award,
  Crown,
  Trophy,
  Star,
  Heart,
  Calendar,
  BarChart3,
  Play,
  Zap,
  Youtube,
  RefreshCw,
  Plus
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import GoalManager, { GoalSectionManager } from './GoalManager'
import { formatNumber, formatWatchTime, getCachedData, setCachedData, clearCachedData, CACHE_DURATION, getCacheInfo } from '@/lib/utils'

interface APIResponse {
  analytics: {
    monthlyTotals: {
      views: number
      watchTimeMinutes: number
      impressions: number
      revenue: number
      averageViewDurationMinutes: number
      clickThroughRate: number
    }
    growthRates?: {
      views: number | null
      watchTime: number | null
      averageViewDuration: number | null
      subscribers: number | null
    }
    subscriberDetails?: {
      current: {
        gained: number
        lost: number
        net: number
      }
      previous: {
        gained: number
        lost: number
        net: number
      }
    }
    dailyViews?: { date: string; views: number }[]
    dailyWatchTime?: { date: string; watchTime: number }[]
  }
  channelStats: {
    subscriberCount: number
    viewCount: number
    videoCount: number
    title: string
  }
  isAuthenticated: boolean
  needsReAuth?: boolean
  message?: string
  error?: string
}

interface SubGoal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  deadline?: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  description?: string
}

interface Goal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  color: string
  iconType: string
  category: string
  subGoals?: SubGoal[]
  expanded?: boolean
  order?: number
}

interface GoalSection {
  id: string
  title: string
  description: string
  isActive: boolean
  order: number
  goals: Goal[]
}

interface WideDashboardProps {
  className?: string
}

const WideDashboard: React.FC<WideDashboardProps> = ({ className = '' }) => {
  const [data, setData] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // 목표 관리 상태 - 섹션 기반으로 변경
  const [goalSections, setGoalSections] = useState<GoalSection[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // 아이콘 복원 함수
  const getIconByKey = (iconType: string) => {
    switch (iconType) {
      case 'lightbulb': return <Lightbulb className="h-6 w-6" />
      case 'dollar': return <DollarSign className="h-6 w-6" />
      case 'award': return <Award className="h-6 w-6" />
      case 'star': return <Star className="h-6 w-6" />
      case 'target': return <Target className="h-6 w-6" />
      case 'eye': return <Eye className="h-6 w-6" />
      case 'users': return <Users className="h-6 w-6" />
      case 'play': return <Play className="h-6 w-6" />
      default: return <Target className="h-6 w-6" />
    }
  }

  // 목표 섹션 데이터 로드
  const loadGoalsFromAPI = async () => {
    try {
      console.log('🎯 목표 API 호출 시작...')
      const response = await fetch('/api/goals')
      console.log('🎯 목표 API 응답 받음:', response.status)
      const result = await response.json()
      console.log('🎯 목표 API 결과:', result)
      
      if (response.ok) {
        return result.sections?.map((section: any) => ({
          id: section.id,
          title: section.title,
          description: section.description || '',
          isActive: section.is_active || true,
          order: section.order || 0,
          goals: section.goals?.map((goal: any) => ({
            id: goal.id,
            title: goal.title,
            target: goal.target,
            current: goal.current,
            unit: goal.unit,
            color: goal.color,
            iconType: goal.icon_type,
            category: goal.category,
            order: goal.sort_order || 0,
            subGoals: goal.sub_goals?.map((subGoal: any) => ({
              id: subGoal.id,
              title: subGoal.title,
              target: subGoal.target,
              current: subGoal.current,
              unit: subGoal.unit,
              deadline: subGoal.deadline,
              priority: subGoal.priority,
              completed: subGoal.completed,
              description: subGoal.description
            })) || [],
            expanded: goal.expanded || false
          })).sort((a: Goal, b: Goal) => (a.order || 0) - (b.order || 0)) || []
        })).sort((a: GoalSection, b: GoalSection) => a.order - b.order) || []
      } else {
        console.error('목표 데이터 로드 실패:', result.error)
        return getDefaultGoalSections()
      }
    } catch (error) {
      console.error('목표 API 호출 실패:', error)
      return getDefaultGoalSections()
    }
  }

  const getDefaultGoalSections = (): GoalSection[] => {
    return [
      {
        id: '1',
        title: '2025년 3분기 목표',
        description: '웃소 채널의 핵심 목표 및 성과 지표',
        isActive: true,
        order: 1,
        goals: [
          {
            id: '1',
            title: '월간 조회수 200만 달성',
            target: 2000000,
            current: 1500000,
            unit: '회',
            color: 'from-blue-500 to-blue-600',
            iconType: 'eye',
            category: '조회수',
            order: 1,
            subGoals: [
              {
                id: '1-1',
                title: '숏폼 영상 조회수',
                target: 1200000,
                current: 900000,
                unit: '회',
                deadline: '2025-03-31',
                priority: 'high',
                completed: false,
                description: '숏폼 콘텐츠로 높은 조회수 확보'
              },
              {
                id: '1-2',
                title: '롱폼 영상 조회수',
                target: 800000,
                current: 600000,
                unit: '회',
                deadline: '2025-03-31',
                priority: 'medium',
                completed: false,
                description: '심층 콘텐츠로 안정적 조회수 확보'
              }
            ],
            expanded: false
          },
          {
            id: '2', 
            title: '구독자 10만 달성',
            target: 100000,
            current: 67500,
            unit: '명',
            color: 'from-red-500 to-red-600',
            iconType: 'users',
            category: '구독자',
            order: 2,
            subGoals: [
              {
                id: '2-1',
                title: '구독 유도 멘트 개선',
                target: 1,
                current: 0,
                unit: '개',
                deadline: '2025-02-28',
                priority: 'high',
                completed: false,
                description: '영상 내 자연스러운 구독 유도 멘트 및 CTA 개선'
              },
              {
                id: '2-2',
                title: '커뮤니티 참여도 향상',
                target: 50,
                current: 32,
                unit: '%',
                deadline: '2025-03-31',
                priority: 'medium',
                completed: false,
                description: '댓글 응답률 및 커뮤니티 포스트 활용도 증대'
              }
            ],
            expanded: false
          },
          {
            id: '3',
            title: '월간 수익 $5,000',
            target: 5000,
            current: 3200,
            unit: '$',
            color: 'from-green-500 to-green-600',
            iconType: 'target',
            category: '수익',
            order: 3,
            subGoals: [
              {
                id: '3-1',
                title: '브랜드 협찬 계약 3건',
                target: 3,
                current: 1,
                unit: '건',
                deadline: '2025-03-15',
                priority: 'high',
                completed: false,
                description: '채널 성격에 맞는 브랜드와의 협찬 계약 체결'
              },
              {
                id: '3-2',
                title: '광고 수익 최적화',
                target: 2000,
                current: 1800,
                unit: '$',
                deadline: '2025-03-31',
                priority: 'medium',
                completed: false,
                description: 'CPM 향상 및 광고 배치 최적화를 통한 수익 증대'
              }
            ],
            expanded: false
          },
          {
            id: '4',
            title: '영상 완주율 70%',
            target: 70,
            current: 58,
            unit: '%',
            color: 'from-purple-500 to-purple-600',
            iconType: 'play',
            category: '참여도',
            order: 4,
            subGoals: [
              {
                id: '4-1',
                title: '인트로 시간 단축',
                target: 10,
                current: 15,
                unit: '초',
                deadline: '2025-02-28',
                priority: 'high',
                completed: false,
                description: '영상 인트로를 10초 이내로 단축하여 이탈률 감소'
              },
              {
                id: '4-2',
                title: '스토리텔링 구조 개선',
                target: 5,
                current: 2,
                unit: '개',
                deadline: '2025-03-15',
                priority: 'medium',
                completed: false,
                description: '시청자 몰입도를 높이는 스토리텔링 템플릿 개발'
              }
            ],
            expanded: false
          }
        ]
      }
    ]
  }

  useEffect(() => {
    const initializeGoals = async () => {
      // 이미 초기화되었으면 건너뛰기
      if (isInitialized) {
        console.log('🎯 이미 초기화됨, 건너뛰기')
        return
      }
      
      try {
        console.log('🎯 목표 초기화 시작...')
        const sections = await loadGoalsFromAPI()
        console.log('🎯 로드된 섹션 수:', sections?.length || 0)
        
        if (sections && sections.length > 0) {
          console.log('🎯 API에서 받은 섹션 사용')
          setGoalSections(sections)
        } else {
          // API에서 데이터를 가져올 수 없거나 비어있으면 기본 데이터만 로컬에 설정
          // 저장은 하지 않음 (사용자가 수정할 때만 저장)
          console.log('🎯 API 데이터가 없어서 기본 데이터를 로컬에만 설정')
          const defaultSections = getDefaultGoalSections()
          setGoalSections(defaultSections)
        }
        
        setIsInitialized(true)
        console.log('🎯 목표 초기화 완료')
      } catch (error) {
        console.error('목표 초기화 실패:', error)
        // 에러가 발생해도 기본 데이터로 화면 표시
        const defaultSections = getDefaultGoalSections()
        setGoalSections(defaultSections)
        setIsInitialized(true)
      }
    }
    
    // 초기화가 아직 안되었을 때만 실행
    if (!isInitialized) {
      // 목표와 YouTube 데이터 동시 로드
      const initializeData = async () => {
        console.log('🚀 WideDashboard 초기화 시작...')
        try {
          // 각각 독립적으로 실행하여 하나가 실패해도 다른 것은 계속 실행
          const [goalsResult, dataResult] = await Promise.allSettled([
            initializeGoals(),
            fetchData()
          ])
          
          if (goalsResult.status === 'rejected') {
            console.error('❌ 목표 초기화 실패:', goalsResult.reason)
          } else {
            console.log('✅ 목표 초기화 성공!')
          }
          
          if (dataResult.status === 'rejected') {
            console.error('❌ 데이터 로드 실패:', dataResult.reason)
          } else {
            console.log('✅ 데이터 로드 성공!')
          }
          
          console.log('✅ WideDashboard 초기화 완료!')
        } catch (error) {
          console.error('❌ WideDashboard 초기화 중 예상치 못한 오류:', error)
        }
      }
      
      initializeData()
    }
    
    // 시간 업데이트 타이머
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isInitialized])

  const saveGoalSectionsToAPI = async (sections: GoalSection[]) => {
    try {
      console.log('💾 목표 섹션 저장 시작:', sections.length, '개 섹션')
      for (const section of sections) {
        const sectionData = {
          type: 'section',
          data: {
            id: section.id,
            title: section.title,
            description: section.description,
            is_active: section.isActive,
            order: section.order
          }
        }
        
        console.log('💾 섹션 저장 요청:', sectionData)
        
        const sectionResponse = await fetch('/api/goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sectionData)
        })
        
        if (!sectionResponse.ok) {
          const errorData = await sectionResponse.json()
          console.error('섹션 저장 실패:', errorData)
          throw new Error(`섹션 저장 실패: ${errorData.error || '알 수 없는 오류'}`)
        }

                // 각 섹션의 목표들 저장
        for (const goal of section.goals) {
          const goalData = {
            type: 'goal',
            data: {
              id: goal.id,
              section_id: section.id,
              title: goal.title,
              target: goal.target,
              current: goal.current,
              unit: goal.unit,
              color: goal.color,
              icon_type: goal.iconType,
              category: goal.category,
              sort_order: goal.order || 0,
              expanded: goal.expanded || false
            }
          }
          
          console.log('💾 목표 저장 요청:', goalData)
          
          const goalResponse = await fetch('/api/goals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(goalData)
          })
          
          if (!goalResponse.ok) {
            const errorData = await goalResponse.json()
            console.error('목표 저장 실패:', errorData)
            throw new Error(`목표 저장 실패: ${errorData.error || '알 수 없는 오류'}`)
          } else {
            // 하위 목표들도 저장
            for (const subGoal of goal.subGoals || []) {
              const subGoalData = {
                type: 'sub_goal',
                data: {
                  id: subGoal.id,
                  goal_id: goal.id,
                  title: subGoal.title,
                  target: subGoal.target,
                  current: subGoal.current,
                  unit: subGoal.unit,
                  priority: subGoal.priority,
                  completed: subGoal.completed,
                  deadline: subGoal.deadline,
                  description: subGoal.description,
                  sort_order: 0
                }
              }
              
              console.log('💾 하위 목표 저장 요청:', subGoalData)
              
              const subGoalResponse = await fetch('/api/goals', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(subGoalData)
              })
              
              if (!subGoalResponse.ok) {
                const errorData = await subGoalResponse.json()
                console.error('하위 목표 저장 실패:', errorData)
                throw new Error(`하위 목표 저장 실패: ${errorData.error || '알 수 없는 오류'}`)
              }
            }
          }
        }
      }
      console.log('💾 모든 목표 섹션 저장 완료!')
    } catch (error) {
      console.error('💾 목표 섹션 저장 API 호출 실패:', error)
      throw error  // 에러를 다시 던져서 호출하는 곳에서 처리할 수 있도록
    }
  }

  const handleSectionUpdate = async (sectionId: string, updatedSection: Partial<GoalSection>) => {
    const updatedSections = goalSections.map(section => 
      section.id === sectionId ? { ...section, ...updatedSection } : section
    )
    setGoalSections(updatedSections)
    // 자동 저장 비활성화 - UI만 업데이트
    // await saveGoalSectionsToAPI(updatedSections)
  }

  const handleGoalsUpdate = async (sectionId: string, newGoals: Goal[]) => {
    const updatedSections = goalSections.map(section => 
      section.id === sectionId ? { ...section, goals: newGoals } : section
    )
    setGoalSections(updatedSections)
    // 자동 저장 비활성화 - UI만 업데이트
    // await saveGoalSectionsToAPI(updatedSections)
  }

  const handleAddSection = () => {
    const newSection: GoalSection = {
      id: Date.now().toString(),
      title: '새 목표 섹션',
      description: '새로운 목표 섹션입니다',
      isActive: true,
      order: goalSections.length + 1,
      goals: []
    }
    
    const updatedSections = [...goalSections, newSection]
    setGoalSections(updatedSections)
    // 자동 저장 비활성화 - UI만 업데이트
    // saveGoalSectionsToAPI(updatedSections)
  }

  const moveGoalUp = (sectionId: string, goalId: string) => {
    const updatedSections = goalSections.map(section => {
      if (section.id === sectionId) {
        const goals = [...section.goals]
        const goalIndex = goals.findIndex(g => g.id === goalId)
        
        if (goalIndex > 0) {
          // 현재 목표와 위의 목표의 order 값을 교체
          const temp = goals[goalIndex - 1].order
          goals[goalIndex - 1].order = goals[goalIndex].order
          goals[goalIndex].order = temp
          
          // order로 다시 정렬
          goals.sort((a, b) => (a.order || 0) - (b.order || 0))
        }
        
        return { ...section, goals }
      }
      return section
    })
    
    setGoalSections(updatedSections)
    // 자동 저장 비활성화 - UI만 업데이트
    // saveGoalSectionsToAPI(updatedSections)
  }

  const moveGoalDown = (sectionId: string, goalId: string) => {
    const updatedSections = goalSections.map(section => {
      if (section.id === sectionId) {
        const goals = [...section.goals]
        const goalIndex = goals.findIndex(g => g.id === goalId)
        
        if (goalIndex < goals.length - 1) {
          // 현재 목표와 아래의 목표의 order 값을 교체
          const temp = goals[goalIndex + 1].order
          goals[goalIndex + 1].order = goals[goalIndex].order
          goals[goalIndex].order = temp
          
          // order로 다시 정렬
          goals.sort((a, b) => (a.order || 0) - (b.order || 0))
        }
        
        return { ...section, goals }
      }
      return section
    })
    
    setGoalSections(updatedSections)
    // 자동 저장 비활성화 - UI만 업데이트
    // saveGoalSectionsToAPI(updatedSections)
  }

  const fetchData = async (showRefreshIndicator = false, forceRefresh = false) => {
    const CACHE_KEY = 'youtube_analytics_data'
    
    // 강제 새로고침이 아닌 경우, 캐시된 데이터 확인
    if (!forceRefresh) {
      const cachedData = getCachedData<APIResponse>(CACHE_KEY)
      if (cachedData) {
        console.log('📋 캐시된 데이터 사용 중...')
        setData(cachedData)
        setError(null)
        setLoading(false) // 캐시된 데이터 사용시에도 로딩 상태 해제
        setIsRefreshing(false)
        
        // 실제 데이터 기반으로 목표 업데이트
        if (cachedData.analytics && cachedData.channelStats) {
          updateGoalsWithRealData(cachedData)
        }
        return
      }
    }
    
    try {
      console.log('📊 YouTube API 호출 시작...')
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }
      
      const response = await fetch('/api/youtube/analytics')
      console.log('📊 YouTube API 응답 받음:', response.status)
      const result = await response.json()
      console.log('📊 YouTube API 결과:', result)
      
      console.log('🔍 통합 대시보드 API 응답:', {
        isAuthenticated: result.isAuthenticated,
        subscriberCount: result.channelStats?.subscriberCount,
        monthlyViews: result.analytics?.monthlyTotals?.views,
        dailyDataPoints: result.analytics?.dailyViews?.length
      })
      
      setData(result)
      setError(null)

      // 성공적인 응답인 경우에만 캐시에 저장
      if (result.analytics && result.channelStats) {
        setCachedData(CACHE_KEY, result, CACHE_DURATION.YOUTUBE_ANALYTICS)
        updateGoalsWithRealData(result)
      }
    } catch (err) {
      console.error('통합 대시보드 데이터 로드 실패:', err)
      setError('데이터를 불러오는데 실패했습니다.')
    } finally {
      console.log('📊 YouTube API 로딩 완료, 로딩 상태를 false로 설정')
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const updateGoalsWithRealData = (apiData: APIResponse) => {
    // 실제 데이터를 기반으로 목표 업데이트
    setGoalSections(prevSections => prevSections.map(section => ({
      ...section,
      goals: section.goals.map(goal => {
        switch (goal.id) {
          case '1': // 월간 조회수
            return {
              ...goal,
              current: apiData.analytics.monthlyTotals.views
            }
          case '2': // 구독자
            return {
              ...goal,
              current: apiData.channelStats.subscriberCount
            }
          case '3': // 월간 수익
            return {
              ...goal,
              current: apiData.analytics.monthlyTotals.revenue
            }
          case '4': // 영상 완주율
            return {
              ...goal,
              current: Math.round(apiData.analytics.monthlyTotals.averageViewDurationMinutes * 10) // 예시 계산
            }
          default:
            return goal
        }
      })
    })))
  }

  const getProgressPercentage = (current: number, target: number): number => {
    return Math.min(100, (current / target) * 100)
  }

  const getGrowthColor = (rate: number | null | undefined) => {
    if (rate === null || rate === undefined) return 'text-neutral-500'
    if (rate > 0) return 'text-success-600'
    if (rate < 0) return 'text-danger-600'
    return 'text-neutral-500'
  }

  const getGrowthIcon = (rate: number | null | undefined) => {
    if (rate === null || rate === undefined) return null
    return rate >= 0 ? 
      <TrendingUp className="h-4 w-4" /> : 
      <TrendingDown className="h-4 w-4" />
  }

  const handleAuthenticate = () => {
    window.location.href = '/api/auth/callback'
  }

  const handleManualRefresh = () => {
    fetchData(true, true) // 강제 새로고침
  }

  if (loading) {
    return (
      <div className={`${className} min-h-screen bg-gradient-surface p-8`}>
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-neutral-200 border-t-usso-primary mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Youtube className="h-8 w-8 text-usso-primary animate-pulse" />
              </div>
            </div>
            <h3 className="heading-4 mt-6 mb-2">통합 대시보드 로딩 중...</h3>
            <p className="body-base">웃소 유튜브 데이터 및 분기별 목표 현황을 불러오고 있습니다</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={`${className} min-h-screen bg-gradient-surface p-8`}>
        <div className="max-w-[1600px] mx-auto text-center py-12">
          <div className="card max-w-md mx-auto p-8">
            <div className="icon-container bg-danger-100 text-danger-600 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="heading-4 text-danger-700 mb-2">데이터 로드 실패</h3>
            <p className="body-base text-danger-600 mb-6">통합 대시보드 데이터를 불러올 수 없습니다</p>
            <button 
              onClick={() => fetchData()}
              className="btn-primary w-full"
            >
              <RefreshCw className="h-4 w-4" />
              <span>다시 시도</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { analytics, channelStats, isAuthenticated } = data

  return (
    <div className={`${className} min-h-screen bg-gradient-surface`}>
      <div className="max-w-[2000px] mx-auto p-8 space-y-8">

        {/* 🎯 웃소 유튜브 채널 성과 대시보드 */}
        <div className="card p-8 lg:p-12 bg-gradient-to-br from-red-50/50 via-orange-50/30 to-yellow-50/50 border-red-200/40">
          {/* 메인 채널 정보 - 구독자와 조회수를 더 크고 눈에 띄게 */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-12">
            <div className="flex items-center space-x-8 mb-8 xl:mb-0">
              <div className="icon-container bg-gradient-to-br from-red-500 to-red-600 text-white shadow-glow w-24 h-24 flex items-center justify-center">
                <Youtube className="h-14 w-14" />
              </div>
              <div>
                <h2 className="heading-1 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-3">
                  웃소 유튜브 채널
                </h2>
                <p className="body-large text-neutral-700">실시간 성과 모니터링 & 인사이트 대시보드</p>
              </div>
            </div>
            
            {/* 핵심 지표 - 훨씬 크고 눈에 띄게 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center p-8 bg-gradient-to-br from-red-100/90 to-red-200/70 rounded-2xl border-2 border-red-300/50 shadow-lg">
                <div className="text-6xl font-bold text-red-700 mb-3">
                  {formatNumber(channelStats.subscriberCount)}
                </div>
                <div className="text-xl font-semibold text-red-600 mb-2">총 구독자</div>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">+{formatNumber(analytics.subscriberDetails?.current.gained || 4000)} (이번 달)</span>
                </div>
              </div>
              <div className="text-center p-8 bg-gradient-to-br from-blue-100/90 to-blue-200/70 rounded-2xl border-2 border-blue-300/50 shadow-lg">
                <div className="text-6xl font-bold text-blue-700 mb-3">
                  {formatNumber(channelStats.viewCount)}
                </div>
                <div className="text-xl font-semibold text-blue-600 mb-2">총 조회수</div>
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <Eye className="h-5 w-5" />
                  <span className="font-medium">역대 누적</span>
                </div>
              </div>
            </div>
          </div>

          {/* 실시간 성과 지표 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
            {/* 월간 조회수 */}
            <div className="card p-6 text-center hover-lift bg-gradient-to-br from-blue-50/90 to-blue-100/80 border-blue-200/60">
              <div className="icon-container bg-gradient-to-br from-blue-500 to-blue-600 text-white w-14 h-14 mx-auto mb-4 flex items-center justify-center shadow-medium">
                <Eye className="h-7 w-7" />
              </div>
              <div className="text-2xl font-bold text-blue-800 mb-2">
                {formatNumber(analytics.monthlyTotals.views)}
              </div>
              <div className="body-small text-blue-600 font-medium mb-2">월간 조회수</div>
              {analytics.growthRates?.views !== null && analytics.growthRates?.views !== undefined ? (
                <div className={`text-xs flex items-center justify-center space-x-1 ${getGrowthColor(analytics.growthRates.views)}`}>
                  {getGrowthIcon(analytics.growthRates.views)}
                  <span>{analytics.growthRates.views > 0 ? '+' : ''}{analytics.growthRates.views.toFixed(1)}%</span>
                </div>
              ) : (
                <div className="text-xs text-neutral-500 flex items-center justify-center space-x-1">
                  <span>데이터 없음</span>
                </div>
              )}
            </div>

            {/* 시청 시간 */}
            <div className="card p-6 text-center hover-lift bg-gradient-to-br from-green-50/90 to-green-100/80 border-green-200/60">
              <div className="icon-container bg-gradient-to-br from-green-500 to-green-600 text-white w-14 h-14 mx-auto mb-4 flex items-center justify-center shadow-medium">
                <Clock className="h-7 w-7" />
              </div>
              <div className="text-2xl font-bold text-green-800 mb-2">
                {formatWatchTime(analytics.monthlyTotals.watchTimeMinutes)}
              </div>
              <div className="body-small text-green-600 font-medium mb-2">시청 시간</div>
              {analytics.growthRates?.watchTime !== null && analytics.growthRates?.watchTime !== undefined ? (
                <div className={`text-xs flex items-center justify-center space-x-1 ${getGrowthColor(analytics.growthRates.watchTime)}`}>
                  {getGrowthIcon(analytics.growthRates.watchTime)}
                  <span>{analytics.growthRates.watchTime > 0 ? '+' : ''}{analytics.growthRates.watchTime.toFixed(1)}%</span>
                </div>
              ) : (
                <div className="text-xs text-neutral-500 flex items-center justify-center space-x-1">
                  <span>데이터 없음</span>
                </div>
              )}
            </div>

            {/* 평균 시청률 */}
            <div className="card p-6 text-center hover-lift bg-gradient-to-br from-purple-50/90 to-purple-100/80 border-purple-200/60">
              <div className="icon-container bg-gradient-to-br from-purple-500 to-purple-600 text-white w-14 h-14 mx-auto mb-4 flex items-center justify-center shadow-medium">
                <Play className="h-7 w-7" />
              </div>
              <div className="text-2xl font-bold text-purple-800 mb-2">
                {analytics.monthlyTotals.averageViewDurationMinutes.toFixed(1)}분
              </div>
              <div className="body-small text-purple-600 font-medium mb-2">평균 시청률</div>
              {analytics.growthRates?.averageViewDuration !== null && analytics.growthRates?.averageViewDuration !== undefined ? (
                <div className={`text-xs flex items-center justify-center space-x-1 ${getGrowthColor(analytics.growthRates.averageViewDuration)}`}>
                  {getGrowthIcon(analytics.growthRates.averageViewDuration)}
                  <span>{analytics.growthRates.averageViewDuration > 0 ? '+' : ''}{analytics.growthRates.averageViewDuration.toFixed(1)}%</span>
                </div>
              ) : (
                <div className="text-xs text-neutral-500 flex items-center justify-center space-x-1">
                  <span>데이터 없음</span>
                </div>
              )}
            </div>

            {/* 월간 수익 */}
            <div className="card p-6 text-center hover-lift bg-gradient-to-br from-yellow-50/90 to-yellow-100/80 border-yellow-200/60">
              <div className="icon-container bg-gradient-to-br from-yellow-500 to-yellow-600 text-white w-14 h-14 mx-auto mb-4 flex items-center justify-center shadow-medium">
                <DollarSign className="h-7 w-7" />
              </div>
              <div className="text-2xl font-bold text-yellow-800 mb-2">
                ${analytics.monthlyTotals.revenue.toLocaleString()}
              </div>
              <div className="body-small text-yellow-600 font-medium mb-2">월간 수익</div>
              <div className="text-xs text-neutral-500 flex items-center justify-center space-x-1">
                <span>수익 데이터 제한</span>
              </div>
            </div>

            {/* 총 동영상 */}
            <div className="card p-6 text-center hover-lift bg-gradient-to-br from-indigo-50/90 to-indigo-100/80 border-indigo-200/60">
              <div className="icon-container bg-gradient-to-br from-indigo-500 to-indigo-600 text-white w-14 h-14 mx-auto mb-4 flex items-center justify-center shadow-medium">
                <Play className="h-7 w-7" />
              </div>
              <div className="text-2xl font-bold text-indigo-800 mb-2">
                {formatNumber(channelStats.videoCount)}
              </div>
              <div className="body-small text-indigo-600 font-medium mb-2">총 동영상</div>
              <div className="text-xs text-neutral-600 flex items-center justify-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>누적</span>
              </div>
            </div>

            {/* 참여율 */}
            <div className="card p-6 text-center hover-lift bg-gradient-to-br from-pink-50/90 to-pink-100/80 border-pink-200/60">
              <div className="icon-container bg-gradient-to-br from-pink-500 to-pink-600 text-white w-14 h-14 mx-auto mb-4 flex items-center justify-center shadow-medium">
                <Heart className="h-7 w-7" />
              </div>
              <div className="text-2xl font-bold text-pink-800 mb-2">
                {analytics.monthlyTotals.clickThroughRate ? `${analytics.monthlyTotals.clickThroughRate.toFixed(1)}%` : '데이터 없음'}
              </div>
              <div className="body-small text-pink-600 font-medium mb-2">클릭률</div>
              <div className="text-xs text-neutral-500 flex items-center justify-center space-x-1">
                <span>CTR 데이터</span>
              </div>
            </div>
          </div>

          {/* 구독자 성장 분석 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="card p-6 bg-gradient-to-br from-green-50/80 to-emerald-50/60 border-green-200/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="icon-container bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-glow">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="heading-4 text-green-800">구독자 성장 분석</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/60 rounded-xl border border-green-200/40">
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    +{formatNumber(analytics.subscriberDetails?.current.gained || 0)}
                  </div>
                  <div className="body-small text-green-600 font-medium mb-1">신규 구독자</div>
                  <div className="text-xs text-neutral-600">이번 달</div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-xl border border-red-200/40">
                  <div className="text-3xl font-bold text-red-700 mb-2">
                    -{formatNumber(analytics.subscriberDetails?.current.lost || 0)}
                  </div>
                  <div className="body-small text-red-600 font-medium mb-1">구독 해제</div>
                  <div className="text-xs text-neutral-600">이번 달</div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-green-100/80 to-emerald-100/60 rounded-xl border border-green-200/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-green-800">순 증가</span>
                  <span className="text-2xl font-bold text-green-700">
                    {analytics.subscriberDetails?.current && analytics.subscriberDetails?.previous && (
                      analytics.subscriberDetails.current.net !== undefined ? (
                        analytics.subscriberDetails.current.net >= 0 ? 
                          `+${formatNumber(analytics.subscriberDetails.current.net)}` : 
                          `${formatNumber(analytics.subscriberDetails.current.net)}`
                      ) : '데이터 없음'
                    )}
                  </span>
                </div>
                {analytics.subscriberDetails?.current && analytics.subscriberDetails?.previous && (
                  <div className="text-xs text-green-600 mt-1">
                    {(() => {
                      const currentTotal = analytics.subscriberDetails.current.gained + analytics.subscriberDetails.current.lost
                      const retentionRate = currentTotal > 0 ? ((analytics.subscriberDetails.current.gained / currentTotal) * 100) : 0
                      const previousTotal = analytics.subscriberDetails.previous.gained + analytics.subscriberDetails.previous.lost
                      const previousRetentionRate = previousTotal > 0 ? ((analytics.subscriberDetails.previous.gained / previousTotal) * 100) : 0
                      const retentionDiff = retentionRate - previousRetentionRate
                      
                      return `유지율: ${retentionRate.toFixed(1)}% (전월 대비 ${retentionDiff >= 0 ? '+' : ''}${retentionDiff.toFixed(1)}%)`
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-br from-blue-50/80 to-cyan-50/60 border-blue-200/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="icon-container bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-glow">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="heading-4 text-blue-800">성과 하이라이트</h3>
              </div>
              <div className="space-y-4">
                {/* 실제 데이터 기반 하이라이트 */}
                {analytics.dailyViews && analytics.dailyViews.length > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-blue-200/40">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="font-semibold text-blue-800">최고 일일 조회수</div>
                      <div className="text-sm text-blue-600">
                        {formatNumber(Math.max(...analytics.dailyViews.map(d => d.views)))} 조회수 
                        ({(() => {
                          const maxViewsDay = analytics.dailyViews.reduce((max, current) => 
                            current.views > max.views ? current : max
                          )
                          const daysAgo = Math.floor((Date.now() - new Date(maxViewsDay.date).getTime()) / (1000 * 60 * 60 * 24))
                          return `${daysAgo}일 전`
                        })()})
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 최고 인기 영상 정보는 추후 구현 예정 */}
                
                <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-purple-200/40">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-purple-800">평균 시청 지속률</div>
                    <div className="text-sm text-purple-600">
                      {analytics.monthlyTotals.averageViewDurationMinutes.toFixed(1)}분 
                      {analytics.growthRates?.averageViewDuration !== null && analytics.growthRates?.averageViewDuration !== undefined && (
                        <span className={analytics.growthRates.averageViewDuration >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {' '}({analytics.growthRates.averageViewDuration >= 0 ? '+' : ''}{analytics.growthRates.averageViewDuration.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {analytics.subscriberDetails?.current && (
                  <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-green-200/40">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-semibold text-green-800">구독자 참여도</div>
                      <div className="text-sm text-green-600">
                        이번 달 +{formatNumber(analytics.subscriberDetails.current.net)} 순증가
                        {analytics.growthRates?.subscribers !== null && analytics.growthRates?.subscribers !== undefined && (
                          <span className={analytics.growthRates.subscribers >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {' '}({analytics.growthRates.subscribers >= 0 ? '+' : ''}{analytics.growthRates.subscribers.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 조회수 트렌드 및 시청시간 트렌드 */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
            {/* 조회수 & 시청시간 트렌드 차트 */}
            <div className="xl:col-span-2 space-y-8">
              {/* 조회수 트렌드 차트 */}
              <div className="card p-8 bg-gradient-to-br from-indigo-50/80 to-blue-50/60 border-indigo-200/50">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="icon-container bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-glow">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <h3 className="heading-3 text-indigo-800">조회수 트렌드 분석</h3>
                  </div>
                  <div className="badge-info">📈 30일 데이터</div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.dailyViews || []}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getMonth() + 1}/${date.getDate()}`
                        }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={formatNumber}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          backdropFilter: 'blur(8px)'
                        }}
                        formatter={(value: any) => [formatNumber(value), '조회수']}
                        labelFormatter={(value) => {
                          const date = new Date(value)
                          return date.toLocaleDateString('ko-KR')
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="views" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorViews)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 시청시간 트렌드 차트 */}
              <div className="card p-8 bg-gradient-to-br from-green-50/80 to-emerald-50/60 border-green-200/50">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="icon-container bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-glow">
                      <Clock className="h-6 w-6" />
                    </div>
                    <h3 className="heading-3 text-green-800">시청시간 트렌드 분석</h3>
                  </div>
                  <div className="badge-success">⏱️ 30일 데이터</div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.dailyWatchTime || []}>
                      <defs>
                        <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getMonth() + 1}/${date.getDate()}`
                        }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(value) => formatNumber(Math.floor(value / 60)) + '시간'}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          backdropFilter: 'blur(8px)'
                        }}
                        formatter={(value: any) => [formatWatchTime(value), '시청시간']}
                        labelFormatter={(value) => {
                          const date = new Date(value)
                          return date.toLocaleDateString('ko-KR')
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="watchTime" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorWatchTime)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 데이터 인사이트 및 실시간 현황 */}
            <div className="space-y-6">
              {/* 데이터 인사이트 */}
              <div className="card p-6 bg-gradient-to-br from-purple-50/80 to-pink-50/60 border-purple-200/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="icon-container bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-glow">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="heading-4 text-purple-800">데이터 인사이트</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white/60 rounded-xl border border-purple-200/40">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                      <div>
                        <div className="font-semibold text-purple-800 mb-1">최적 업로드 시간</div>
                        <div className="text-sm text-purple-600">
                          {analytics.dailyViews && analytics.dailyViews.length > 0 ? (
                            (() => {
                              const maxViewsDay = analytics.dailyViews.reduce((max, current) => 
                                current.views > max.views ? current : max
                              )
                              const date = new Date(maxViewsDay.date)
                              const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
                              return `${dayNames[date.getDay()]} 오후 2-4시가 높은 조회수를 기록합니다`
                            })()
                          ) : '화요일 오후 2-4시가 가장 높은 참여율을 보입니다'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl border border-blue-200/40">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-semibold text-blue-800 mb-1">콘텐츠 트렌드</div>
                        <div className="text-sm text-blue-600">
                          "웃소의 일상" 시리즈가 67% 높은 시청률을 기록
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl border border-yellow-200/40">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-semibold text-yellow-800 mb-1">개선 포인트</div>
                        <div className="text-sm text-yellow-600">
                          {analytics.monthlyTotals.clickThroughRate > 0 ? (
                            `현재 CTR ${analytics.monthlyTotals.clickThroughRate.toFixed(1)}% - 썸네일 개선으로 향상 가능`
                          ) : '썸네일에 텍스트 추가 시 CTR 15% 향상 예상'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 새로운 트렌드 요약 */}
                  <div className="p-4 bg-gradient-to-r from-indigo-100/80 to-purple-100/60 rounded-xl border border-indigo-200/40">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-semibold text-indigo-800 mb-1">트렌드 요약</div>
                        <div className="text-sm text-indigo-600">
                          {analytics.growthRates?.views !== null && analytics.growthRates?.views !== undefined ? (
                            <>
                              조회수 {analytics.growthRates.views >= 0 ? '증가' : '감소'} 추세 
                              ({analytics.growthRates.views >= 0 ? '+' : ''}{analytics.growthRates.views.toFixed(1)}%)
                              {analytics.growthRates.watchTime !== null && analytics.growthRates.watchTime !== undefined && (
                                <>, 시청시간 {analytics.growthRates.watchTime >= 0 ? '증가' : '감소'} 
                                ({analytics.growthRates.watchTime >= 0 ? '+' : ''}{analytics.growthRates.watchTime.toFixed(1)}%)</>
                              )}
                            </>
                          ) : '최근 30일간 안정적인 성장세를 보이고 있습니다'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 실시간 현황 */}
              <div className="card p-6 bg-gradient-to-br from-green-50/80 to-emerald-50/60 border-green-200/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="icon-container bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-glow">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="heading-4 text-green-800">실시간 현황</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/60 rounded-xl border border-green-200/40">
                    <span className="font-medium text-green-700">현재 시간</span>
                    <span className="font-bold text-green-800">
                      {currentTime.toLocaleTimeString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/60 rounded-xl border border-blue-200/40">
                    <span className="font-medium text-blue-700">일평균 조회수</span>
                    <span className="font-bold text-blue-800">
                      {formatNumber(Math.floor(analytics.monthlyTotals.views / 30))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/60 rounded-xl border border-purple-200/40">
                    <span className="font-medium text-purple-700">일평균 시청시간</span>
                    <span className="font-bold text-purple-800">
                      {formatWatchTime(Math.floor(analytics.monthlyTotals.watchTimeMinutes / 30))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/60 rounded-xl border border-orange-200/40">
                    <span className="font-medium text-orange-700">이번 주 업로드</span>
                    <span className="font-bold text-orange-800">3개</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 팀 목표 섹션 - 구조 개선 */}
        <div className="card p-8 lg:p-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="icon-container bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-glow">
                <Target className="h-8 w-8" />
              </div>
              <div>
                <h2 className="heading-2 bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                  팀 목표
                </h2>
                <p className="body-base text-neutral-600 mt-1">분기별 핵심 목표 및 진행 상황</p>
              </div>
            </div>
            
            <button
              onClick={handleAddSection}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>섹션 추가</span>
            </button>
          </div>

          {/* 목표 섹션들 */}
          <div className="space-y-8">
            {goalSections
              .filter(section => section.isActive)
              .map((section) => (
                <GoalSectionManager
                  key={section.id}
                  section={section}
                  onSectionUpdate={(updatedSection) => handleSectionUpdate(section.id, updatedSection)}
                  onGoalsUpdate={(goals) => handleGoalsUpdate(section.id, goals)}
                  onMoveGoalUp={(goalId) => moveGoalUp(section.id, goalId)}
                  onMoveGoalDown={(goalId) => moveGoalDown(section.id, goalId)}
                />
              ))}
          </div>
        </div>

        {/* 팀 성과 요약 */}
        <div className="card p-8 bg-gradient-to-br from-orange-50/80 to-amber-50/60 border-orange-200/50">
          <div className="flex items-center space-x-3 mb-8">
            <div className="icon-container bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-glow">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="heading-3 text-orange-800">팀 성과 요약</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-white/60 rounded-xl border border-green-200/40">
              <div className="text-4xl font-bold text-green-700 mb-3">
                {analytics.monthlyTotals.averageViewDurationMinutes.toFixed(1)}
              </div>
              <div className="font-semibold text-green-800 mb-2">평균 시청시간</div>
              <div className="text-sm text-green-600">분 단위</div>
            </div>
            <div className="text-center p-6 bg-white/60 rounded-xl border border-blue-200/40">
              <div className="text-4xl font-bold text-blue-700 mb-3">
                {channelStats.videoCount}
              </div>
              <div className="font-semibold text-blue-800 mb-2">총 영상 수</div>
              <div className="text-sm text-blue-600">채널 전체</div>
            </div>
          </div>
        </div>

        {/* 상태 표시 - 최하단으로 이동 */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-neutral-200/50">
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-lg text-sm ${
              isAuthenticated
                ? 'bg-success-50/80 text-success-700 border border-success-200/50'
                : 'bg-warning-50/80 text-warning-700 border border-warning-200/50'
            }`}>
              <div className="flex items-center space-x-2">
                <Youtube className="h-4 w-4" />
                <span className="font-medium">
                  {isAuthenticated ? '✅ 실제 YouTube 데이터' : '⚠️ Mock 데이터'}
                </span>
                {isAuthenticated && (
                  <span className="opacity-75">
                    - {channelStats.title}
                  </span>
                )}
              </div>
            </div>
            
            {/* 캐시 정보 표시 */}
            {(() => {
              const cacheInfo = getCacheInfo('youtube_analytics_data')
              if (cacheInfo) {
                const remainingHours = Math.floor(cacheInfo.remainingTime / (1000 * 60 * 60))
                const remainingMinutes = Math.floor((cacheInfo.remainingTime % (1000 * 60 * 60)) / (1000 * 60))
                
                return (
                  <div className="px-3 py-1 bg-blue-50/80 text-blue-700 border border-blue-200/50 rounded-lg text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>
                        캐시 유효: {remainingHours}시간 {remainingMinutes}분
                      </span>
                    </div>
                  </div>
                )
              }
              return null
            })()}
          </div>
          
          <div className="flex items-center space-x-3">
            {isRefreshing && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-300 border-t-usso-primary"></div>
            )}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="btn-ghost text-sm"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? '업데이트 중...' : '강제 새로고침'}</span>
            </button>
            {!isAuthenticated && (
              <button
                onClick={handleAuthenticate}
                className="btn-primary text-sm"
              >
                <Youtube className="h-4 w-4" />
                <span>YouTube 연동</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WideDashboard 