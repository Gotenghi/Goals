'use client'

import React, { useState, useEffect } from 'react'
import { MessageCircle, Heart, TrendingUp, Lightbulb, Users, BarChart3, Clock, Star, ThumbsUp, Sparkles } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { formatNumber, getCachedData, setCachedData, CACHE_DURATION } from '@/lib/utils'

interface Comment {
  id: string
  text: string
  author: string
  authorProfileImageUrl: string
  likeCount: number
  publishedAt: string
  videoId: string
  videoTitle: string
  isPositive?: boolean
  hasRequest?: boolean
  keywords?: string[]
}

interface CommentAnalysisData {
  todaysHighlights: Comment[]
  ideaRequests: Comment[]
  recentComments: Comment[]
  sentimentStats: {
    positive: number
    neutral: number
    negative: number
    total: number
  }
  topKeywords: Array<{
    keyword: string
    count: number
  }>
  isAuthenticated?: boolean
  needsReAuth?: boolean
  error?: string
  message?: string
}

const CommentAnalysis = () => {
  const [data, setData] = useState<CommentAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'highlights' | 'ideas' | 'sentiment'>('highlights')
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (forceRefresh = false) => {
    const CACHE_KEY = 'youtube_comments_data'
    
    // 강제 새로고침이 아닌 경우, 캐시된 데이터 확인
    if (!forceRefresh) {
      const cachedData = getCachedData<CommentAnalysisData>(CACHE_KEY)
      if (cachedData) {
        console.log('📋 캐시된 데이터 사용 중... (CommentAnalysis)')
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
      const response = await fetch('/api/youtube/comments')
      const result = await response.json()
      setData(result)
      
      // 성공적인 응답인 경우에만 캐시에 저장
      if (result.recentComments && result.sentimentStats) {
        setCachedData(CACHE_KEY, result, CACHE_DURATION.YOUTUBE_COMMENTS)
      }
      
      if (result.error) {
        setError(result.error)
      } else {
        setError(null)
      }
    } catch (err) {
      console.error('댓글 데이터 로드 실패:', err)
      setError('댓글 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    return `${Math.floor(diffInHours / 24)}일 전`
  }



  // 감정 분석 차트 데이터
  const sentimentChartData = data ? [
    { name: '긍정', value: data.sentimentStats.positive, color: '#22C55E' },
    { name: '중립', value: data.sentimentStats.neutral, color: '#6B7280' },
    { name: '부정', value: data.sentimentStats.negative, color: '#EF4444' }
  ] : []

  if (loading) {
    return (
      <div className="card p-8 animate-in">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-neutral-200 rounded-xl"></div>
            <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
          <div className="flex space-x-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-neutral-200 rounded-xl w-32"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card p-8">
        <div className="text-center">
          <div className="icon-container bg-danger-100 text-danger-600 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <MessageCircle className="h-8 w-8" />
          </div>
          <h3 className="heading-4 text-danger-700 mb-2">데이터 로드 실패</h3>
          <p className="body-base text-danger-600 mb-6">댓글 데이터를 불러올 수 없습니다.</p>
          <button 
            onClick={fetchData}
            className="btn-primary"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>다시 시도</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 animate-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="icon-container bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-glow">
            <MessageCircle className="h-8 w-8" />
          </div>
          <div>
            <h3 className="heading-2 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
              댓글 분석 시스템
            </h3>
            <p className="body-base text-neutral-600">시청자 피드백 및 감정 분석</p>
          </div>
        </div>
        
        {/* 인증 상태 표시 */}
        <div className={`badge-${data.isAuthenticated ? 'success' : 'warning'}`}>
          {data.isAuthenticated ? '✅ 실제 데이터' : '⚠️ Mock 데이터'}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="card p-4 mb-6 bg-gradient-to-r from-danger-50 to-danger-100 border-danger-200">
          <div className="flex items-center space-x-3">
            <div className="icon-container bg-danger-500 text-white">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="body-base text-danger-700">{error}</p>
          </div>
        </div>
      )}

      {/* 댓글 통계 카드 */}
      <div className="grid-metrics mb-8">
        <div className="metric-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50">
          <div className="icon-container bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-3">
            <MessageCircle className="h-6 w-6" />
            </div>
          <div className="metric-value text-purple-700">
                {formatNumber(data.sentimentStats.total)}
          </div>
          <div className="metric-label text-purple-600">총 댓글</div>
          <div className="body-small text-purple-500 mt-1">분석된 댓글 수</div>
        </div>

        <div className="metric-card bg-gradient-to-br from-success-50 to-success-100 border-success-200/50">
          <div className="icon-success mb-3">
            <Heart className="h-6 w-6" />
            </div>
          <div className="metric-value text-success-700">
                {data.todaysHighlights.length}
          </div>
          <div className="metric-label text-success-600">오늘의 하이라이트</div>
          <div className="body-small text-success-500 mt-1">긍정적인 댓글</div>
        </div>

        <div className="metric-card bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200/50">
          <div className="icon-container bg-gradient-to-br from-warning-500 to-warning-600 text-white mb-3">
            <Lightbulb className="h-6 w-6" />
            </div>
          <div className="metric-value text-warning-700">
                {data.ideaRequests.length}
          </div>
          <div className="metric-label text-warning-600">아이디어 요청</div>
          <div className="body-small text-warning-500 mt-1">콘텐츠 제안</div>
        </div>

        <div className="metric-card bg-gradient-to-br from-info-50 to-info-100 border-info-200/50">
          <div className="icon-container bg-gradient-to-br from-info-500 to-info-600 text-white mb-3">
            <TrendingUp className="h-6 w-6" />
            </div>
          <div className="metric-value text-info-700">
                {data.sentimentStats.total > 0 
                  ? Math.round((data.sentimentStats.positive / data.sentimentStats.total) * 100)
                  : 0}%
          </div>
          <div className="metric-label text-info-600">긍정 비율</div>
          <div className="body-small text-info-500 mt-1">전체 댓글 대비</div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="card p-2 mb-8">
        <div className="flex space-x-1">
        <button
          onClick={() => setActiveTab('highlights')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'highlights'
                ? 'bg-gradient-to-r from-usso-primary to-usso-primary/90 text-white shadow-medium'
                : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
          }`}
        >
          ⭐ 오늘의 하이라이트
        </button>
        <button
          onClick={() => setActiveTab('ideas')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'ideas'
                ? 'bg-gradient-to-r from-usso-primary to-usso-primary/90 text-white shadow-medium'
                : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
          }`}
        >
          💡 아이디어 창고
        </button>
        <button
          onClick={() => setActiveTab('sentiment')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'sentiment'
                ? 'bg-gradient-to-r from-usso-primary to-usso-primary/90 text-white shadow-medium'
                : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
          }`}
        >
          📊 감정 분석
        </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === 'highlights' && (
        <div className="animate-slide-up">
          <div className="flex items-center space-x-3 mb-6">
            <div className="icon-container bg-gradient-to-br from-warning-500 to-warning-600 text-white">
              <Star className="h-6 w-6" />
            </div>
            <h4 className="heading-3 text-neutral-800">팀원들에게 동기부여가 되는 댓글</h4>
          </div>
          
          {data.todaysHighlights.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="icon-container bg-neutral-100 text-neutral-400 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8" />
              </div>
              <h5 className="heading-4 text-neutral-600 mb-2">오늘 하이라이트 댓글이 없습니다</h5>
              <p className="body-base text-neutral-500">긍정적인 댓글이 들어오면 여기에 표시됩니다!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {data.todaysHighlights.map((comment, index) => (
                <div 
                  key={comment.id} 
                  className="card-interactive p-6 bg-gradient-to-r from-warning-50/50 to-warning-100/50 border-warning-200/50 hover-glow"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="icon-container bg-gradient-to-r from-warning-500 to-warning-600 text-white">
                        <span className="font-bold">#{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="heading-4 text-neutral-900">{comment.author}</span>
                        <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
                        <span className="body-small text-neutral-500">{formatTimeAgo(comment.publishedAt)}</span>
                        <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
                        <span className="body-small text-info-600 font-medium">{comment.videoTitle}</span>
                      </div>
                      <p className="body-base text-neutral-800 mb-4 leading-relaxed">{comment.text}</p>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <ThumbsUp className="h-4 w-4 text-neutral-500" />
                          <span className="body-small text-neutral-600 font-medium">{comment.likeCount}</span>
                        </div>
                        {comment.keywords && comment.keywords.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="body-small text-neutral-500">키워드:</span>
                            <div className="flex space-x-2">
                            {comment.keywords.slice(0, 3).map(keyword => (
                                <span key={keyword} className="badge-warning">
                                {keyword}
                              </span>
                            ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ideas' && (
        <div className="animate-slide-up">
          <div className="flex items-center space-x-3 mb-6">
            <div className="icon-container bg-gradient-to-br from-info-500 to-info-600 text-white">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h4 className="heading-3 text-neutral-800">시청자 아이디어 요청 모음</h4>
          </div>
          
          {data.ideaRequests.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="icon-container bg-neutral-100 text-neutral-400 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Lightbulb className="h-8 w-8" />
              </div>
              <h5 className="heading-4 text-neutral-600 mb-2">아이디어 요청 댓글이 없습니다</h5>
              <p className="body-base text-neutral-500">"해주세요", "원해요" 등의 키워드가 포함된 댓글이 여기에 표시됩니다!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {data.ideaRequests.map((comment, index) => (
                <div 
                  key={comment.id} 
                  className="card-interactive p-6 bg-gradient-to-r from-info-50/50 to-info-100/50 border-info-200/50 hover-glow"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="icon-container bg-gradient-to-r from-info-500 to-info-600 text-white">
                        <Lightbulb className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="heading-4 text-neutral-900">{comment.author}</span>
                        <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
                        <span className="body-small text-neutral-500">{formatTimeAgo(comment.publishedAt)}</span>
                        <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
                        <span className="body-small text-info-600 font-medium">{comment.videoTitle}</span>
                      </div>
                      <p className="body-base text-neutral-800 mb-4 leading-relaxed">{comment.text}</p>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <ThumbsUp className="h-4 w-4 text-neutral-500" />
                          <span className="body-small text-neutral-600 font-medium">{comment.likeCount}</span>
                        </div>
                        {comment.keywords && comment.keywords.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="body-small text-neutral-500">키워드:</span>
                            <div className="flex space-x-2">
                            {comment.keywords.slice(0, 3).map(keyword => (
                                <span key={keyword} className="badge-info">
                                {keyword}
                              </span>
                            ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sentiment' && (
        <div className="animate-slide-up">
          <div className="flex items-center space-x-3 mb-6">
            <div className="icon-container bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h4 className="heading-3 text-neutral-800">댓글 감정 분석 & 키워드</h4>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 감정 분석 차트 */}
            <div className="card p-6">
              <h5 className="heading-4 text-neutral-800 mb-6 flex items-center">
                <div className="icon-container bg-gradient-to-br from-success-500 to-success-600 text-white mr-3">
                  <Heart className="h-5 w-5" />
                </div>
                감정 분포
              </h5>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value}개`, name]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                {sentimentChartData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full shadow-soft" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="body-small text-neutral-700 font-medium">{item.name}</span>
                    <span className="body-small text-neutral-500">({item.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 인기 키워드 */}
            <div className="card p-6">
              <h5 className="heading-4 text-neutral-800 mb-6 flex items-center">
                <div className="icon-container bg-gradient-to-br from-usso-secondary to-purple-600 text-white mr-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                인기 키워드 TOP 10
              </h5>
              {data.topKeywords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="icon-container bg-neutral-100 text-neutral-400 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <p className="body-base text-neutral-500">키워드 데이터가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.topKeywords.slice(0, 8).map((keyword, index) => (
                    <div 
                      key={keyword.keyword} 
                      className="flex items-center justify-between p-3 bg-gradient-surface rounded-xl hover-lift"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                          index < 3 ? 'bg-gradient-to-r from-usso-primary to-usso-primary/80' :
                          index < 6 ? 'bg-gradient-to-r from-usso-secondary to-usso-secondary/80' :
                          'bg-gradient-to-r from-neutral-400 to-neutral-500'
                        }`}>
                          #{index + 1}
                        </div>
                        <span className="heading-4 text-neutral-800">{keyword.keyword}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 progress-bar h-3">
                          <div 
                            className={`progress-fill ${
                              index < 3 ? 'bg-gradient-to-r from-usso-primary to-usso-primary/80' :
                              index < 6 ? 'bg-gradient-to-r from-usso-secondary to-usso-secondary/80' :
                              'bg-gradient-to-r from-neutral-400 to-neutral-500'
                            }`}
                            style={{ 
                              width: `${Math.min(100, (keyword.count / Math.max(...data.topKeywords.map(k => k.count))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="body-small text-neutral-600 font-semibold w-8 text-right">{keyword.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommentAnalysis 