'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Eye, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Youtube, 
  Play,
  Calendar,
  BarChart3
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
import { 
  YouTubeAnalytics, 
  YouTubeChannelStats, 
  YouTubeVideo,
  fetchYouTubeAnalytics, 
  fetchChannelStats, 
  formatViewCount, 
  formatWatchTime 
} from '@/lib/youtube-client'
import VideoDetailModal from './VideoDetailModal'
import { formatNumber, getCachedData, setCachedData, CACHE_DURATION } from '@/lib/utils'

interface VideoData {
  id: string
  title: string
  views?: number
  watchTime?: number
  publishedAt: string
  thumbnail?: string
}

interface AnalyticsData {
  dailyViews: { date: string; views: number }[]
  dailyWatchTime: { date: string; watchTime: number }[]
  topVideosByViews: VideoData[]
  topVideosByWatchTime: VideoData[]
}

interface ChannelStats {
  subscriberCount: number
  viewCount: number
  videoCount: number
  title: string
}

interface APIResponse {
  analytics: AnalyticsData
  channelStats: ChannelStats
  isAuthenticated: boolean
  needsReAuth?: boolean
  message?: string
  error?: string
}

const EnhancedChannelMetrics = () => {
  const [data, setData] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'views' | 'watchTime'>('views')
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchData = async (showRefreshIndicator = false, forceRefresh = false) => {
    const CACHE_KEY = 'youtube_enhanced_analytics_data'
    
    // 강제 새로고침이 아닌 경우, 캐시된 데이터 확인
    if (!forceRefresh) {
      const cachedData = getCachedData<APIResponse>(CACHE_KEY)
      if (cachedData) {
        console.log('📋 캐시된 데이터 사용 중... (EnhancedChannelMetrics)')
        setData(cachedData)
        setLastUpdated(new Date())
        setLoading(false) // 캐시된 데이터 사용시에도 로딩 상태 해제
        setIsRefreshing(false)
        
        if (cachedData.error) {
          setError(cachedData.error)
        } else {
          setError(null)
        }
        return
      }
    }
    
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }
      
      const response = await fetch('/api/youtube/analytics')
      const result = await response.json()
      
      // 디버깅을 위한 로그 출력
      console.log('🔍 API 응답 상태:', {
        isAuthenticated: result.isAuthenticated,
        needsReAuth: result.needsReAuth,
        message: result.message,
        error: result.error,
        dailyViewsCount: result.analytics?.dailyViews?.length || 0,
        dailyWatchTimeCount: result.analytics?.dailyWatchTime?.length || 0,
        topVideosCount: result.analytics?.topVideosByViews?.length || 0,
        channelTitle: result.channelStats?.title
      })
      
      setData(result)
      setLastUpdated(new Date())
      
      // 성공적인 응답인 경우에만 캐시에 저장
      if (result.analytics && result.channelStats) {
        setCachedData(CACHE_KEY, result, CACHE_DURATION.YOUTUBE_ANALYTICS)
      }
      
      if (result.error) {
        setError(result.error)
      } else {
        setError(null)
      }
    } catch (err) {
      console.error('데이터 로드 실패:', err)
      setError('데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    // 자동 새로고침 제거 - YouTube API 데이터는 일간 단위로 업데이트되므로 불필요
  }, [])



  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}시간 ${mins}분`
    }
    return `${mins}분`
  }

  const handleAuthenticate = () => {
    window.location.href = '/api/auth/callback'
  }

  const handleManualRefresh = () => {
    fetchData(true, true) // 강제 새로고침
  }

  const getAuthStatusMessage = () => {
    if (!data) return ''
    
    if (data.isAuthenticated) {
      if (data.message?.includes('토큰 갱신')) {
        return '✅ 토큰이 자동으로 갱신되었습니다'
      }
      return '✅ 실제 YouTube 데이터 연동 중'
    } else if (data.needsReAuth) {
      return '🔄 재인증이 필요합니다'
    } else {
      return '⚠️ YouTube 인증이 필요합니다'
    }
  }

  const handleVideoClick = (video: VideoData) => {
    // VideoData를 Video 형식으로 변환
    const convertedVideo = {
      id: video.id,
      title: video.title,
      views: video.views || 0,
      publishedAt: video.publishedAt,
      thumbnail: video.thumbnail || '/api/placeholder/120/90',
      duration: 0, // API에서 제공하지 않음
      isShortForm: false, // 기본값
      durationFormatted: '0:00', // 기본값
      watchTime: video.watchTime
    }
    setSelectedVideo(convertedVideo)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedVideo(null)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="text-center text-red-500">
          데이터를 불러올 수 없습니다.
          <button 
            onClick={() => fetchData()}
            className="ml-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  const { analytics, channelStats, isAuthenticated, needsReAuth, message } = data

  // 월간 데이터 계산 (안전한 접근)
  const monthlyViews = analytics?.dailyViews?.reduce((sum, day) => sum + day.views, 0) || 0
  const monthlyWatchTime = analytics?.dailyWatchTime?.reduce((sum, day) => sum + day.watchTime, 0) || 0

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {isRefreshing && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>
          
          {/* 간소화된 컨트롤 */}
          <div className="flex items-center gap-3">
            {/* 수동 새로고침 버튼 */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              {isRefreshing ? '업데이트 중...' : '새로고침'}
            </button>
            
            {/* 인증 문제시에만 표시 */}
            {(!isAuthenticated || needsReAuth) && (
              <button
                onClick={handleAuthenticate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                YouTube 연동
              </button>
            )}
          </div>
        </div>

        {/* 데이터 소스 상태 표시 */}
        <div className={`mb-4 p-3 rounded-lg ${
          isAuthenticated
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium">
                {isAuthenticated ? '✅ 실제 YouTube 데이터' : '⚠️ Mock 데이터 사용 중'}
              </span>
              <span className="text-xs mt-1">
                {isAuthenticated 
                  ? `채널: ${channelStats.title} | 마지막 업데이트: ${lastUpdated?.toLocaleTimeString('ko-KR')}`
                  : 'YouTube 인증 후 실제 데이터를 확인하세요'
                }
              </span>
              {message && (
                <span className="text-xs mt-1 opacity-75">
                  {message}
                </span>
              )}
            </div>
            {!isAuthenticated && (
              <button
                onClick={handleAuthenticate}
                className="text-sm underline hover:no-underline"
              >
                연동하기
              </button>
            )}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* 그래프 탭 */}
        <div className="mb-4">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('views')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'views'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              조회수 추이
            </button>
            <button
              onClick={() => setActiveTab('watchTime')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'watchTime'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              시청시간 추이
            </button>
          </div>
        </div>

        {/* 그래프 */}
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeTab === 'views' ? (analytics?.dailyViews || []) : (analytics?.dailyWatchTime || [])}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                formatter={(value: number) => [
                  activeTab === 'views' ? formatNumber(value) : `${formatNumber(value)}시간`,
                  activeTab === 'views' ? '조회수' : '시청시간'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey={activeTab === 'views' ? 'views' : 'watchTime'}
                stroke={activeTab === 'views' ? '#3B82F6' : '#8B5CF6'}
                strokeWidth={2}
                dot={{ fill: activeTab === 'views' ? '#3B82F6' : '#8B5CF6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 상위 영상 섹션 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 조회수 기준 상위 영상 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">상위 영상 (조회수)</h3>
            <div className="space-y-3">
              {(analytics?.topVideosByViews || []).slice(0, 5).map((video, index) => (
                <div 
                  key={video.id} 
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors" title={video.title}>
                      {video.title}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-blue-600 font-semibold">
                        {formatNumber(video.views || 0)} 회
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(video.publishedAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 시청시간 기준 상위 영상 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">상위 영상 (시청시간)</h3>
            <div className="space-y-3">
              {(analytics?.topVideosByWatchTime || []).slice(0, 5).map((video, index) => (
                <div 
                  key={video.id} 
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-purple-600">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate hover:text-purple-600 transition-colors" title={video.title}>
                      {video.title}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-purple-600 font-semibold">
                        {formatDuration(video.watchTime || 0)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(video.publishedAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 영상 상세 분석 모달 */}
      <VideoDetailModal 
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}

export default EnhancedChannelMetrics 