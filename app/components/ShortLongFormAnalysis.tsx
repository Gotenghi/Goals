'use client'

import React, { useState, useEffect } from 'react'
import { Play, Clock, Eye, TrendingUp, BarChart3 } from 'lucide-react'
import { formatNumber, formatDuration, getCachedData, setCachedData, CACHE_DURATION } from '@/lib/utils'

interface Video {
  id: string
  title: string
  views: number
  publishedAt: string
  thumbnail: string
  duration: number
  isShortForm: boolean
  durationFormatted: string
  watchTime?: number
}

interface APIResponse {
  analytics: {
    shortFormVideos: Video[]
    longFormVideos: Video[]
    monthlyTotals: {
      views: number
      watchTimeMinutes: number
      averageViewDurationMinutes: number
    }
  }
  isAuthenticated: boolean
  message?: string
  error?: string
}

const ShortLongFormAnalysis = () => {
  const [data, setData] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'short' | 'long'>('short')
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (forceRefresh = false) => {
    const CACHE_KEY = 'youtube_short_long_form_data'
    
    // 강제 새로고침이 아닌 경우, 캐시된 데이터 확인
    if (!forceRefresh) {
      const cachedData = getCachedData<APIResponse>(CACHE_KEY)
      if (cachedData) {
        console.log('📋 캐시된 데이터 사용 중... (ShortLongFormAnalysis)')
        setData(cachedData)
        setLoading(false) // 캐시된 데이터 사용시에도 로딩 상태 해제
        
        if (cachedData.error) {
          setError(cachedData.error)
        } else {
          setError(null)
        }
        return
      }
    }
    
    try {
      setLoading(true)
      const response = await fetch('/api/youtube/analytics')
      const result = await response.json()
      setData(result)
      
      // 성공적인 응답인 경우에만 캐시에 저장
      if (result.analytics && (result.analytics.shortFormVideos || result.analytics.longFormVideos)) {
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
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const calculateMetrics = (videos: Video[]) => {
    if (!videos.length) return { totalViews: 0, avgViews: 0, totalVideos: 0, avgDuration: 0 }
    
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0)
    const avgViews = totalViews / videos.length
    const avgDuration = videos.reduce((sum, video) => sum + video.duration, 0) / videos.length
    
    return {
      totalViews,
      avgViews,
      totalVideos: videos.length,
      avgDuration
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="flex space-x-4 mb-6">
            <div className="h-10 bg-gray-200 rounded w-20"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="text-center text-red-500">
          데이터를 불러올 수 없습니다.
          <button 
            onClick={fetchData}
            className="ml-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  const { analytics, isAuthenticated } = data
  const shortFormMetrics = calculateMetrics(analytics.shortFormVideos)
  const longFormMetrics = calculateMetrics(analytics.longFormVideos)
  const currentVideos = activeTab === 'short' ? analytics.shortFormVideos : analytics.longFormVideos
  const currentMetrics = activeTab === 'short' ? shortFormMetrics : longFormMetrics

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">📊 숏폼 vs 롱폼 분석</h3>
        
        {/* 인증 상태 표시 */}
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isAuthenticated
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isAuthenticated ? '✅ 실제 데이터' : '⚠️ Mock 데이터'}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('short')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'short'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📱 숏폼 ({shortFormMetrics.totalVideos}개)
        </button>
        <button
          onClick={() => setActiveTab('long')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'long'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🎬 롱폼 ({longFormMetrics.totalVideos}개)
        </button>
      </div>

      {/* 메트릭 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">총 조회수</p>
              <p className="text-xl font-bold text-blue-900">
                {formatNumber(currentMetrics.totalViews)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">평균 조회수</p>
              <p className="text-xl font-bold text-green-900">
                {formatNumber(Math.floor(currentMetrics.avgViews))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">평균 길이</p>
              <p className="text-xl font-bold text-purple-900">
                {formatDuration(Math.floor(currentMetrics.avgDuration))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 비교 인사이트 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">📈 성과 비교</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">숏폼 평균 조회수</span>
              <span className="font-semibold">{formatNumber(Math.floor(shortFormMetrics.avgViews))}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ 
                  width: `${Math.min(100, (shortFormMetrics.avgViews / Math.max(shortFormMetrics.avgViews, longFormMetrics.avgViews)) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">롱폼 평균 조회수</span>
              <span className="font-semibold">{formatNumber(Math.floor(longFormMetrics.avgViews))}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ 
                  width: `${Math.min(100, (longFormMetrics.avgViews / Math.max(shortFormMetrics.avgViews, longFormMetrics.avgViews)) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 영상 목록 */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-4">
          {activeTab === 'short' ? '📱 최근 숏폼 영상' : '🎬 최근 롱폼 영상'}
        </h4>
        
        {currentVideos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {activeTab === 'short' ? '숏폼 영상이 없습니다.' : '롱폼 영상이 없습니다.'}
          </div>
        ) : (
          <div className="space-y-3">
            {currentVideos.slice(0, 5).map((video, index) => (
              <div key={video.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center">
                    <Play className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {video.title}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatNumber(video.views)} 조회수</span>
                    <span>{video.durationFormatted}</span>
                    <span>{new Date(video.publishedAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-medium text-gray-900">
                    #{index + 1}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    video.isShortForm 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {video.isShortForm ? '숏폼' : '롱폼'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShortLongFormAnalysis 