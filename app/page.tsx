'use client'

import { useState, useEffect } from 'react'
import { Monitor, BarChart3, TrendingUp, MessageCircle, Sparkles, TrendingDown, Eye, Users, Clock, Play, Youtube, ExternalLink, Target, Award, DollarSign } from 'lucide-react'
import Link from 'next/link'
import TabNavigation from './components/TabNavigation'
import WideDashboard from './components/WideDashboard'
import EnhancedChannelMetrics from './components/EnhancedChannelMetrics'
import ChannelMetrics from './components/ChannelMetrics'
import TeamProgress from './components/TeamProgress'
import ShortLongFormAnalysis from './components/ShortLongFormAnalysis'
import CommentAnalysis from './components/CommentAnalysis'
import MotivationSystem from './components/MotivationSystem'
import GoalManager from './components/GoalManager'

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
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [data, setData] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState('main-dashboard')
  
  // 2025년 3분기 목표 상태
  const [quarterlyGoals, setQuarterlyGoals] = useState<Goal[]>([])
  const [goalsSectionTitle, setGoalsSectionTitle] = useState('2025년 3분기 목표')

  // API에서 목표 데이터 로드
  const loadQuarterlyGoalsFromAPI = async () => {
    try {
      const response = await fetch('/api/goals')
      const result = await response.json()
      
      if (response.ok) {
        return {
          title: result.section?.title || '2025년 3분기 목표',
          goals: result.goals?.map((goal: any) => ({
            id: goal.id,
            title: goal.title,
            target: goal.target,
            current: goal.current,
            unit: goal.unit,
            color: goal.color,
            iconType: goal.icon_type,
            category: goal.category,
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
          })) || []
        }
      } else {
        console.error('목표 데이터 로드 실패:', result.error)
        return getDefaultQuarterlyGoals()
      }
    } catch (error) {
      console.error('목표 API 호출 실패:', error)
      return getDefaultQuarterlyGoals()
    }
  }

  const getDefaultQuarterlyGoals = () => {
    const defaultGoals: Goal[] = [
      {
        id: '1',
        title: '월간 조회수 200만',
        target: 2000000,
        current: 1250000,
        unit: '회',
        color: 'from-blue-500 to-blue-600',
        iconType: 'eye',
        category: '조회수',
        subGoals: [
          {
            id: '1-1',
            title: '신규 콘텐츠 기획 10개',
            target: 10,
            current: 7,
            unit: '개',
            deadline: '2025-03-15',
            priority: 'high',
            completed: false,
            description: '트렌드에 맞는 새로운 콘텐츠 아이디어 발굴 및 기획'
          },
          {
            id: '1-2',
            title: '썸네일 CTR 8% 달성',
            target: 8,
            current: 6.2,
            unit: '%',
            deadline: '2025-03-31',
            priority: 'medium',
            completed: false,
            description: '썸네일 A/B 테스트를 통한 클릭률 개선'
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
    return { title: '2025년 3분기 목표', goals: defaultGoals }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchData()
    setIsClient(true)
    
    // 3분기 목표 초기화
    const initializeQuarterlyGoals = async () => {
      const goalsData = await loadQuarterlyGoalsFromAPI()
      setGoalsSectionTitle(goalsData.title)
      setQuarterlyGoals(goalsData.goals)
      
      // 기본 데이터가 없으면 샘플 데이터로 초기화 (저장은 하지 않음)
      if (goalsData.goals.length === 0) {
        const defaultData = getDefaultQuarterlyGoals()
        setQuarterlyGoals(defaultData.goals)
        setGoalsSectionTitle(defaultData.title)
        // 자동 저장 비활성화 - UI만 업데이트
        // await saveQuarterlyGoalsToAPI(defaultData.goals, defaultData.title)
      }
    }
    
    initializeQuarterlyGoals()
  }, [])

  // 목표 데이터 저장
  const saveQuarterlyGoalsToAPI = async (goals: Goal[], title: string) => {
    console.log('📝 saveQuarterlyGoalsToAPI 호출됨 (비활성화)', { goals: goals.length, title })
    // 자동 저장 비활성화 - API 호출하지 않음
    return
    
    try {
      // 섹션 제목 저장
      await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'section',
          data: {
            title: title,
            description: '웃소 채널의 핵심 목표 및 성과 지표',
            is_active: true
          }
        })
      })

      // 각 목표와 하위 목표를 개별적으로 저장
      for (const goal of goals) {
        // 메인 목표 저장
        await fetch('/api/goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'goal',
            data: {
              id: goal.id,
              section_id: '550e8400-e29b-41d4-a716-446655440000',
              title: goal.title,
              target: goal.target,
              current: goal.current,
              unit: goal.unit,
              color: goal.color,
              icon_type: goal.iconType,
              category: goal.category,
              description: goal.title,
              deadline: '2025-03-31',
              expanded: goal.expanded || false,
              sort_order: parseInt(goal.id) || 0
            }
          })
        })
        
        // 하위 목표들 저장
        if (goal.subGoals?.length) {
          for (const subGoal of goal.subGoals!) {
            await fetch('/api/goals', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
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
              })
            })
          }
        }
      }
    } catch (error) {
      console.error('목표 저장 API 호출 실패:', error)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/youtube/analytics')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || '데이터를 가져오는데 실패했습니다')
      }
      
      setData(result)
      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(1)}억`
    }
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}만`
    }
    return num.toLocaleString()
  }

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    if (hours >= 10000) {
      return `${(hours / 10000).toFixed(1)}만시간`
    }
    return `${hours.toLocaleString()}시간`
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

  const handleGoalsUpdate = async (goals: Goal[]) => {
    setQuarterlyGoals(goals)
    // 자동 저장 비활성화 - UI만 업데이트
    // await saveQuarterlyGoalsToAPI(goals, goalsSectionTitle)
  }

  const handleGoalsSectionTitleUpdate = async (title: string) => {
    setGoalsSectionTitle(title)
    
    // 자동 저장 비활성화 - UI만 업데이트
    /*
    try {
      await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'section',
          data: {
            title: title,
            description: '웃소 채널의 핵심 목표 및 성과 지표',
            is_active: true
          }
        })
      })
    } catch (error) {
      console.error('섹션 제목 저장 API 호출 실패:', error)
    }
    */
  }

  // 탭 설정 - 각 탭의 고유한 역할을 명확히 구분
  const tabs = [
    {
      id: 'main-dashboard',
      label: '통합 대시보드',
      icon: <Monitor className="h-4 w-4" />,
      description: '분기별 목표와 핵심 지표를 한눈에 파악하는 메인 대시보드',
      badge: 'MAIN'
    },
    {
      id: 'overview',
      label: '성과 개요',
      icon: <BarChart3 className="h-4 w-4" />,
      description: '채널의 핵심 성과 지표만 간결하게 요약',
      badge: 'SIMPLE'
    },
    {
      id: 'team-progress',
      label: '팀 진행률',
      icon: <Users className="h-4 w-4" />,
      description: '팀원별 역할과 기여도, 협업 현황 관리',
    },
    {
      id: 'analytics',
      label: '상세 분석',
      icon: <TrendingUp className="h-4 w-4" />,
      description: '숏폼/롱폼 비교, 채널 세부 분석 및 트렌드',
    },
    {
      id: 'community',
      label: '댓글 분석',
      icon: <MessageCircle className="h-4 w-4" />,
      description: '댓글 감정 분석, 피드백 인사이트 및 커뮤니티 관리',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-neutral-200 border-t-usso-primary mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Youtube className="h-8 w-8 text-usso-primary animate-pulse" />
              </div>
            </div>
            <h3 className="heading-4 mt-6 mb-2">데이터를 불러오는 중...</h3>
            <p className="body-base">최신 YouTube 분석 데이터를 가져오고 있습니다</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="card max-w-md mx-auto p-8">
              <div className="icon-container bg-danger-100 text-danger-600 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="heading-4 text-danger-700 mb-2">데이터 로드 실패</h3>
              <p className="body-base text-danger-600 mb-6">{error}</p>
              <button 
                onClick={fetchData}
                className="btn-primary w-full"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>다시 시도</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { analytics, channelStats } = data
  const { monthlyTotals, growthRates } = analytics

  // 통합 대시보드 탭 컨텐츠 (메인 대시보드 - WideDashboard 사용)
  const renderMainDashboardTab = () => (
    <div className="w-full animate-in">
      <WideDashboard />
    </div>
  )

  // 성과 개요 탭 컨텐츠 - 간결한 핵심 지표만 표시
  const renderOverviewTab = () => (
    <div className="space-y-8 animate-in">
      {/* 채널 성과 요약 - 핵심 지표만 */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="icon-container bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-glow">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="heading-2 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                채널 성과 요약
              </h2>
              <p className="body-base text-neutral-600 mt-1">핵심 성과 지표 한눈에 보기</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="badge-success">
              <div className="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
              실시간 연동
            </div>
            <div className="text-right">
              <p className="body-small text-neutral-500">최종 업데이트</p>
              <p className="font-semibold text-neutral-800">{new Date().toLocaleString('ko-KR')}</p>
            </div>
          </div>
        </div>
        
        {/* 핵심 지표 그리드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/60">
            <div className="icon-container bg-gradient-to-br from-blue-500 to-blue-600 text-white w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-glow">
              <Eye className="h-8 w-8" />
            </div>
            <div className="text-3xl font-bold text-blue-700 mb-2">{formatNumber(monthlyTotals.views)}</div>
            <div className="body-base text-blue-600 font-medium">월간 조회수</div>
            {growthRates?.views !== null && growthRates?.views !== undefined ? (
              <div className={`flex items-center justify-center space-x-1 mt-2 ${getGrowthColor(growthRates.views)}`}>
                {getGrowthIcon(growthRates.views)}
                <span className="text-sm font-medium">{growthRates.views > 0 ? '+' : ''}{growthRates.views.toFixed(1)}%</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-1 mt-2 text-neutral-500">
                <span className="text-sm font-medium">데이터 없음</span>
              </div>
            )}
          </div>

          <div className="card p-6 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200/60">
            <div className="icon-container bg-gradient-to-br from-green-500 to-green-600 text-white w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-glow">
              <Users className="h-8 w-8" />
            </div>
            <div className="text-3xl font-bold text-green-700 mb-2">{formatNumber(channelStats.subscriberCount)}</div>
            <div className="body-base text-green-600 font-medium">구독자 수</div>
            {growthRates?.subscribers !== null && growthRates?.subscribers !== undefined ? (
              <div className={`flex items-center justify-center space-x-1 mt-2 ${getGrowthColor(growthRates.subscribers)}`}>
                {getGrowthIcon(growthRates.subscribers)}
                <span className="text-sm font-medium">{growthRates.subscribers > 0 ? '+' : ''}{growthRates.subscribers.toFixed(1)}%</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-1 mt-2 text-neutral-500">
                <span className="text-sm font-medium">데이터 없음</span>
              </div>
            )}
          </div>

          <div className="card p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/60">
            <div className="icon-container bg-gradient-to-br from-purple-500 to-purple-600 text-white w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-glow">
              <Clock className="h-8 w-8" />
            </div>
            <div className="text-3xl font-bold text-purple-700 mb-2">{formatWatchTime(monthlyTotals.watchTimeMinutes)}</div>
            <div className="body-base text-purple-600 font-medium">시청 시간</div>
            {growthRates?.watchTime !== null && growthRates?.watchTime !== undefined ? (
              <div className={`flex items-center justify-center space-x-1 mt-2 ${getGrowthColor(growthRates.watchTime)}`}>
                {getGrowthIcon(growthRates.watchTime)}
                <span className="text-sm font-medium">{growthRates.watchTime > 0 ? '+' : ''}{growthRates.watchTime.toFixed(1)}%</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-1 mt-2 text-neutral-500">
                <span className="text-sm font-medium">데이터 없음</span>
              </div>
            )}
          </div>

          <div className="card p-6 text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200/60">
            <div className="icon-container bg-gradient-to-br from-yellow-500 to-yellow-600 text-white w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-glow">
              <DollarSign className="h-8 w-8" />
            </div>
            <div className="text-3xl font-bold text-yellow-700 mb-2">${monthlyTotals.revenue.toLocaleString()}</div>
            <div className="body-base text-yellow-600 font-medium">월간 수익</div>
            <div className="flex items-center justify-center space-x-1 mt-2 text-neutral-500">
              <span className="text-sm font-medium">수익 데이터 제한</span>
            </div>
          </div>
        </div>

        {/* 성과 인사이트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200/60">
            <div className="flex items-center space-x-3 mb-4">
              <div className="icon-container bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="heading-4 text-indigo-800">성장 지표</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-indigo-700">평균 시청률</span>
                <span className="font-bold text-indigo-800">{monthlyTotals.averageViewDurationMinutes.toFixed(1)}분</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-indigo-700">클릭률</span>
                <span className="font-bold text-indigo-800">{(monthlyTotals.clickThroughRate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-indigo-700">총 동영상</span>
                <span className="font-bold text-indigo-800">{formatNumber(channelStats.videoCount)}개</span>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200/60">
            <div className="flex items-center space-x-3 mb-4">
              <div className="icon-container bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="heading-4 text-emerald-800">이달의 성과</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-emerald-700">총 조회수</span>
                <span className="font-bold text-emerald-800">{formatNumber(channelStats.viewCount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-700">일평균 조회수</span>
                <span className="font-bold text-emerald-800">{formatNumber(Math.floor(monthlyTotals.views / 30))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-700">노출 수</span>
                <span className="font-bold text-emerald-800">{formatNumber(monthlyTotals.impressions)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // 기존 탭들 (디자인 통일성 개선)
  const renderAnalyticsTab = () => (
    <div className="space-y-8 animate-in">
      <div className="card p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="icon-container bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-glow">
            <BarChart3 className="h-8 w-8" />
          </div>
          <div>
            <h2 className="heading-2 bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              상세 채널 분석
            </h2>
            <p className="body-base text-neutral-600 mt-1">심층 데이터 분석 및 트렌드</p>
          </div>
        </div>
        <EnhancedChannelMetrics />
      </div>

      <div className="card p-8">
        <ShortLongFormAnalysis />
      </div>
    </div>
  )

  const renderCommunityTab = () => (
    <div className="space-y-8 animate-in">
      <div className="card p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="icon-container bg-gradient-to-br from-green-500 to-green-600 text-white shadow-glow">
            <MessageCircle className="h-8 w-8" />
          </div>
          <div>
            <h2 className="heading-2 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              댓글 분석 시스템
            </h2>
            <p className="body-base text-neutral-600 mt-1">시청자 반응 및 피드백 분석</p>
          </div>
        </div>
        <CommentAnalysis />
      </div>
    </div>
  )

  const renderTeamProgressTab = () => (
    <div className="animate-in">
      <TeamProgress />
    </div>
  )

  // 탭별 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'main-dashboard':
        return renderMainDashboardTab()
      case 'overview':
        return renderOverviewTab()
      case 'team-progress':
        return renderTeamProgressTab()
      case 'analytics':
        return renderAnalyticsTab()
      case 'community':
        return renderCommunityTab()
      default:
        return renderMainDashboardTab()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* 헤더 섹션 - 디자인 통일성 개선 */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-neutral-200/50 shadow-soft sticky top-0 z-40">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="icon-container bg-gradient-to-br from-usso-primary to-usso-primary/80 text-white shadow-glow">
                <Youtube className="h-8 w-8" />
              </div>
              <div>
                <h1 className="heading-3 bg-gradient-to-r from-usso-primary to-purple-600 bg-clip-text text-transparent">
                  웃소 유튜브 통합 대시보드
                </h1>
                <p className="body-small text-neutral-600">분기별 목표 및 채널 성과 통합 모니터링</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="badge-success">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse"></div>
                실시간 연동
              </div>
              <div className="text-right">
                <p className="body-small text-neutral-500">현재 시각</p>
                <p className="font-semibold text-neutral-800">
                  {currentTime.toLocaleTimeString('ko-KR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <TabNavigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 메인 컨텐츠 */}
      <main className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>
    </div>
  )
} 