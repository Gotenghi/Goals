'use client'

import React, { useState, useEffect } from 'react'
import { X, Play, Eye, Clock, ThumbsUp, MessageCircle, Share2, TrendingUp, Calendar, BarChart3, Target, Zap, AlertCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { formatNumber, formatDuration } from '@/lib/utils'

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
  likes?: number
  comments?: number
  shares?: number
}

interface VideoDetailModalProps {
  video: Video | null
  isOpen: boolean
  onClose: () => void
}

const VideoDetailModal: React.FC<VideoDetailModalProps> = ({ video, isOpen, onClose }) => {
  const [detailData, setDetailData] = useState<any>(null)
  const [loading, setLoading] = useState(false)



  const calculateEngagementRate = (video: Video): number => {
    // 실제 좋아요/댓글 수가 있으면 사용, 없으면 추정값 사용
    const likes = video.likes || Math.floor(video.views * 0.02)
    const comments = video.comments || Math.floor(video.views * 0.005)
    return ((likes + comments) / video.views) * 100
  }

  const calculateViewsPerDay = (video: Video): number => {
    const publishedDate = new Date(video.publishedAt)
    const now = new Date()
    const daysSincePublished = Math.max(1, Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)))
    return video.views / daysSincePublished
  }

  // Mock 상세 데이터 생성 (실제로는 API에서 가져올 데이터)
  const generateMockDetailData = (video: Video) => {
    const days = 30
    const data = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      
      // 시청 지속 시간 데이터 (영상 길이 대비 퍼센테이지)
      const retentionData = []
      const segments = Math.min(20, Math.floor(video.duration / 5)) // 5초마다 또는 최대 20개 구간
      
      for (let j = 0; j <= segments; j++) {
        const timePoint = (j / segments) * video.duration
        let retention = 100 - (j * (Math.random() * 3 + 2)) // 점진적 감소
        
        // 영상 초반과 끝부분에서 더 큰 변화
        if (j < 3) retention = 100 - (j * Math.random() * 5)
        if (j > segments * 0.8) retention = Math.max(10, retention - Math.random() * 20)
        
        retentionData.push({
          time: Math.floor(timePoint),
          timeFormatted: formatDuration(Math.floor(timePoint)),
          retention: Math.max(5, retention)
        })
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(video.views * (0.6 + Math.random() * 0.4) / days),
        watchTime: Math.floor(Math.random() * 1000 + 500),
        retention: retentionData
      })
    }
    
    return {
      dailyStats: data,
      retentionCurve: data[data.length - 1].retention,
      averageViewDuration: video.duration * (0.3 + Math.random() * 0.4),
      peakRetentionPoint: {
        time: Math.floor(video.duration * (0.1 + Math.random() * 0.3)),
        retention: 85 + Math.random() * 10
      }
    }
  }

  useEffect(() => {
    if (video && isOpen) {
      setLoading(true)
      // 실제로는 API 호출
      setTimeout(() => {
        setDetailData(generateMockDetailData(video))
        setLoading(false)
      }, 1000)
    }
  }, [video, isOpen])

  if (!isOpen || !video) return null

  const engagementRate = calculateEngagementRate(video)
  const viewsPerDay = calculateViewsPerDay(video)
  const publishedDate = new Date(video.publishedAt)
  const daysSincePublished = Math.floor((new Date().getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              video.isShortForm 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {video.isShortForm ? '📱 숏폼' : '🎬 롱폼'}
            </div>
            <h2 className="text-xl font-bold text-gray-900">영상 상세 분석</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* API 제한사항 안내 */}
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">YouTube API 제한사항</h4>
                <p className="text-sm text-amber-700 mt-1">
                  개별 영상의 상세 분석 데이터(일별 성과, 시청 지속률 등)는 YouTube Analytics API에서 제공하지 않습니다. 
                  현재는 기본 통계 정보만 표시됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 영상 기본 정보 */}
          <div className="mb-6">
            <div className="flex items-start space-x-4">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-32 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">게시일:</span>
                    <p className="font-medium">{publishedDate.toLocaleDateString('ko-KR')}</p>
                    <p className="text-xs text-gray-500">{daysSincePublished}일 전</p>
                  </div>
                  <div>
                    <span className="text-gray-600">영상 길이:</span>
                    <p className="font-medium">{video.durationFormatted}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">일평균 조회수:</span>
                    <p className="font-medium">{formatNumber(viewsPerDay)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">참여율 (추정):</span>
                    <p className="font-medium">{engagementRate.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 핵심 지표 카드 - 실제 데이터 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">조회수</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(video.views)}</p>
              <p className="text-xs text-blue-600">✅ 실제 데이터</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">시청시간</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {video.watchTime ? formatNumber(video.watchTime / 60) : '추정값'}
              </p>
              <p className="text-xs text-green-600">⚠️ 추정 데이터</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ThumbsUp className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">좋아요</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {video.likes ? formatNumber(video.likes) : formatNumber(Math.floor(video.views * 0.02))}
              </p>
              <p className="text-xs text-purple-600">
                {video.likes ? '✅ 실제 데이터' : '⚠️ 추정 데이터'}
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MessageCircle className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">댓글</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {video.comments ? formatNumber(video.comments) : formatNumber(Math.floor(video.views * 0.005))}
              </p>
              <p className="text-xs text-orange-600">
                {video.comments ? '✅ 실제 데이터' : '⚠️ 추정 데이터'}
              </p>
            </div>
          </div>

          {/* 성과 분석 (실제 데이터 기반) */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 성과 분석</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatNumber(viewsPerDay)}
                </div>
                <p className="text-sm text-gray-600">일평균 조회수</p>
                <div className={`text-xs mt-1 ${viewsPerDay > 50000 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {viewsPerDay > 50000 ? '🔥 높은 성과' : '📈 성장 중'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {engagementRate.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">참여율 (추정)</p>
                <div className={`text-xs mt-1 ${engagementRate > 2 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {engagementRate > 2 ? '💪 높은 참여도' : '🎯 개선 여지'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {daysSincePublished}일
                </div>
                <p className="text-sm text-gray-600">게시 경과일</p>
                <div className={`text-xs mt-1 ${daysSincePublished < 7 ? 'text-blue-600' : 'text-gray-600'}`}>
                  {daysSincePublished < 7 ? '🆕 최신 콘텐츠' : '📚 기존 콘텐츠'}
                </div>
              </div>
            </div>
          </div>

          {/* 콘텐츠 유형별 인사이트 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              💡 {video.isShortForm ? '숏폼' : '롱폼'} 콘텐츠 인사이트
            </h4>
            <div className="space-y-3">
              {video.isShortForm ? (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-800">숏폼 최적화 팁</p>
                      <p className="text-sm text-gray-600">첫 3초 내 강한 훅으로 시청자 관심 끌기</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-800">참여도 향상</p>
                      <p className="text-sm text-gray-600">트렌드 해시태그와 음악 활용하기</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-800">알고리즘 최적화</p>
                      <p className="text-sm text-gray-600">빠른 편집과 시각적 임팩트 중요</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-800">롱폼 최적화 팁</p>
                      <p className="text-sm text-gray-600">명확한 구조와 섹션 구분으로 시청 유지</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-800">시청 지속성</p>
                      <p className="text-sm text-gray-600">중간중간 흥미 요소와 질문 던지기</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-800">가치 제공</p>
                      <p className="text-sm text-gray-600">깊이 있는 정보와 실용적 팁 제공</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 향후 개선 계획 */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">🔮 향후 개선 계획</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• YouTube Studio 데이터 연동 검토</li>
              <li>• 서드파티 분석 도구 연동 고려</li>
              <li>• 채널 전체 평균과의 비교 분석 추가</li>
              <li>• 경쟁사 벤치마킹 기능 검토</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoDetailModal 