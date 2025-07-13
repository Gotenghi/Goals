'use client'

import { useState, useEffect } from 'react'
import { Youtube, Monitor, BarChart3, TrendingUp, TrendingDown, MessageCircle, Sparkles, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import WideDashboard from '../components/WideDashboard'
import TabNavigation from '../components/TabNavigation'
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

export default function SimpleDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [data, setData] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

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
      id: 'dashboard',
      label: '와이드 대시보드',
      icon: <Monitor className="h-4 w-4" />,
    },
    {
      id: 'metrics',
      label: '핵심 지표',
      icon: <BarChart3 className="h-4 w-4" />,
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
  ]

  // 탭별 컨텐츠 렌더링
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-red-500 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Youtube className="h-6 w-6 text-red-500 animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mt-4 mb-2">데이터를 불러오는 중...</h3>
            <p className="text-gray-600">최신 YouTube 분석 데이터를 가져오고 있습니다</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="bg-red-100 text-red-600 w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">데이터 로드 실패</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={fetchData}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      )
    }

    if (!data) return null

    switch (activeTab) {
      case 'dashboard':
        return <WideDashboard />
      
      case 'metrics':
        return (
          <div className="space-y-8">
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
      
      case 'analytics':
        return (
          <div className="space-y-8">
            {/* 상세 채널 분석 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-3 rounded-xl">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">상세 채널 분석</h2>
                  <p className="text-gray-600 mt-1">심층 데이터 분석 및 트렌드</p>
                </div>
              </div>
              <EnhancedChannelMetrics />
            </div>

            {/* 숏폼/롱폼 분석 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <ShortLongFormAnalysis />
            </div>
          </div>
        )
      
      case 'community':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <CommentAnalysis />
            </div>
          </div>
        )
      
      case 'team-progress':
        return (
          <div className="space-y-8">
            <TeamProgress />
          </div>
        )
      
      case 'achievements':
        return (
          <div className="space-y-8">
            <MotivationSystem data={{
              channelStats: data?.channelStats,
              monthlyTotals: data?.analytics.monthlyTotals,
              growthRates: data?.analytics.growthRates,
              isAuthenticated: data?.isAuthenticated || false
            }} />
          </div>
        )
      
      default:
        return <WideDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 페이지 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
                <Youtube className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Simple YouTube 대시보드</h1>
                <p className="text-gray-600">실시간 채널 성과 분석</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>메인 대시보드</span>
              </Link>
              <div className="text-right">
                <p className="text-sm text-gray-500">마지막 업데이트</p>
                <p className="font-semibold text-gray-800">{new Date().toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <TabNavigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 탭 컨텐츠 */}
      {activeTab === 'dashboard' ? (
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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