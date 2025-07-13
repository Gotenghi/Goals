'use client'

import { useState, useEffect } from 'react'
import { Monitor, BarChart3, TrendingUp, MessageCircle, Sparkles, TrendingDown, Eye, Users, Clock, Play, Youtube, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import TabNavigation from '../components/TabNavigation'
import WideDashboard from '../components/WideDashboard'
import EnhancedChannelMetrics from '../components/EnhancedChannelMetrics'
import ChannelMetrics from '../components/ChannelMetrics'
import TeamProgress from '../components/TeamProgress'
import ShortLongFormAnalysis from '../components/ShortLongFormAnalysis'
import CommentAnalysis from '../components/CommentAnalysis'
import MotivationSystem from '../components/MotivationSystem'

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

export default function TempDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [data, setData] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState('wide-dashboard')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchData()
    setIsClient(true)
  }, [])

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

  // 탭 설정
  const tabs = [
    {
      id: 'wide-dashboard',
      label: '와이드 대시보드',
      icon: <Monitor className="h-4 w-4" />,
    },
    {
      id: 'dashboard',
      label: '핵심 지표',
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      id: 'team-progress',
      label: '팀 진행률',
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: 'achievements',
      label: '성취 시스템',
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      id: 'analytics',
      label: '상세 분석',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      id: 'community',
      label: '댓글 분석',
      icon: <MessageCircle className="h-4 w-4" />,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-neutral-200 border-t-usso-primary mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-usso-primary animate-pulse" />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  // 대시보드 탭 컨텐츠
  const renderDashboardTab = () => (
    <div className="space-y-8 animate-in">
      <ChannelMetrics 
        data={data}
        isClient={isClient}
        formatNumber={formatNumber}
        formatWatchTime={formatWatchTime}
        getGrowthColor={getGrowthColor}
        getGrowthIcon={getGrowthIcon}
      />
    </div>
  )

  // 분석 탭 컨텐츠
  const renderAnalyticsTab = () => (
    <div className="space-y-8 animate-in">
      {/* 상세 채널 분석 */}
      <div className="card p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="icon-container bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="heading-3">상세 채널 분석</h2>
            <p className="body-base text-neutral-600 mt-1">심층 데이터 분석 및 트렌드</p>
          </div>
        </div>
        <EnhancedChannelMetrics />
      </div>

      {/* 숏폼/롱폼 분석 */}
      <div className="card p-8">
        <ShortLongFormAnalysis />
      </div>
    </div>
  )

  // 커뮤니티 탭 컨텐츠
  const renderCommunityTab = () => (
    <div className="space-y-8 animate-in">
      {/* 댓글 분석 시스템 */}
      <div className="card p-8">
        <CommentAnalysis />
      </div>
    </div>
  )

  // 팀 진행률 탭 컨텐츠
  const renderTeamProgressTab = () => (
    <div className="space-y-8 animate-in">
      <TeamProgress />
    </div>
  )

  // 성취 시스템 탭 컨텐츠
  const renderAchievementsTab = () => (
    <div className="space-y-8 animate-in">
      <MotivationSystem data={{
        channelStats: data?.channelStats,
        monthlyTotals: data?.analytics.monthlyTotals,
        growthRates: data?.analytics.growthRates,
        isAuthenticated: data?.isAuthenticated || false
      }} />
    </div>
  )

  // 와이드 대시보드 탭 컨텐츠
  const renderWideDashboardTab = () => (
    <div className="w-full animate-in">
      <WideDashboard />
    </div>
  )

  // 탭별 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'wide-dashboard':
        return renderWideDashboardTab()
      case 'dashboard':
        return renderDashboardTab()
      case 'team-progress':
        return renderTeamProgressTab()
      case 'achievements':
        return renderAchievementsTab()
      case 'analytics':
        return renderAnalyticsTab()
      case 'community':
        return renderCommunityTab()
      default:
        return renderWideDashboardTab()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* 🎯 페이지 헤더 */}
      <div className="bg-white/80 backdrop-blur-lg shadow-soft border-b border-neutral-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="icon-primary shadow-glow">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a2.872 2.872 0 0 0-2.02-2.04C19.646 3.64 12 3.64 12 3.64s-7.646 0-9.478.506a2.872 2.872 0 0 0-2.02 2.04C0 8.047 0 12 0 12s0 3.953.502 5.814a2.872 2.872 0 0 0 2.02 2.04C4.354 20.36 12 20.36 12 20.36s7.646 0 9.478-.506a2.872 2.872 0 0 0 2.02-2.04C24 15.953 24 12 24 12s0-3.953-.502-5.814zM9.75 15.568V8.432L15.818 12l-6.068 3.568z"/>
                </svg>
              </div>
              <div>
                <h1 className="heading-2 bg-gradient-to-r from-usso-dark to-neutral-700 bg-clip-text text-transparent">
                  웃소 대시보드 (임시)
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="body-base text-neutral-600">{channelStats.title}</p>
                  <div className="w-1 h-1 bg-neutral-400 rounded-full"></div>
                  <span className="body-small text-neutral-500">실시간 분석</span>
                  <div className="badge-success">
                    <div className="w-2 h-2 bg-success-500 rounded-full mr-1"></div>
                    Live
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 shadow-md"
              >
                <Youtube className="h-4 w-4" />
                <span>새 메인 대시보드</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
              <div className="text-right">
                <p className="body-small text-neutral-500">마지막 업데이트</p>
                <p className="heading-4 text-neutral-800">{new Date().toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📱 탭 네비게이션 */}
      <TabNavigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 📊 탭 컨텐츠 */}
      {activeTab === 'wide-dashboard' ? (
        <div className="w-full">
          {renderTabContent()}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderTabContent()}
        </div>
      )}
    </div>
  )
} 