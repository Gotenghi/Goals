'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Eye, Users, Clock, Play, DollarSign, MousePointer, BarChart3 } from 'lucide-react'

interface ChannelMetricsProps {
  data: {
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
  }
  isClient: boolean
  formatNumber: (num: number) => string
  formatWatchTime: (minutes: number) => string
  getGrowthColor: (rate: number | null | undefined) => string
  getGrowthIcon: (rate: number | null | undefined) => JSX.Element | null
}

export default function ChannelMetrics({ 
  data, 
  isClient, 
  formatNumber, 
  formatWatchTime, 
  getGrowthColor, 
  getGrowthIcon 
}: ChannelMetricsProps) {
  const [animatedValues, setAnimatedValues] = useState({
    views: 0,
    watchTime: 0,
    subscribers: 0,
    revenue: 0
  })

  useEffect(() => {
    if (!isClient || !data) return

    const animateValue = (start: number, end: number, duration: number, callback: (value: number) => void) => {
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3) // easeOut cubic
        const current = start + (end - start) * easeProgress
        callback(Math.round(current))
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }

    // 애니메이션 실행
    animateValue(0, data.analytics.monthlyTotals.views, 2000, (value) => 
      setAnimatedValues(prev => ({ ...prev, views: value }))
    )
    animateValue(0, data.analytics.monthlyTotals.watchTimeMinutes, 2200, (value) => 
      setAnimatedValues(prev => ({ ...prev, watchTime: value }))
    )
    animateValue(0, data.channelStats.subscriberCount, 1800, (value) => 
      setAnimatedValues(prev => ({ ...prev, subscribers: value }))
    )
    animateValue(0, data.analytics.monthlyTotals.revenue, 2400, (value) => 
      setAnimatedValues(prev => ({ ...prev, revenue: value }))
    )
  }, [isClient, data])

  if (!data) return null

  const metrics = [
    {
      title: '월간 조회수',
      value: isClient ? formatNumber(animatedValues.views) : formatNumber(data.analytics.monthlyTotals.views),
      growth: data.analytics.growthRates?.views,
      icon: <Eye className="h-8 w-8" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50/90 to-blue-100/80',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200/60',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      title: '시청 시간',
      value: isClient ? formatWatchTime(animatedValues.watchTime) : formatWatchTime(data.analytics.monthlyTotals.watchTimeMinutes),
      growth: data.analytics.growthRates?.watchTime,
      icon: <Clock className="h-8 w-8" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-gradient-to-br from-green-50/90 to-green-100/80',
      textColor: 'text-green-700',
      borderColor: 'border-green-200/60',
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      title: '구독자 수',
      value: isClient ? formatNumber(animatedValues.subscribers) : formatNumber(data.channelStats.subscriberCount),
      growth: data.analytics.growthRates?.subscribers,
      icon: <Users className="h-8 w-8" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50/90 to-purple-100/80',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200/60',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      title: '월간 수익',
      value: isClient ? `$${animatedValues.revenue.toLocaleString()}` : `$${data.analytics.monthlyTotals.revenue.toLocaleString()}`,
      growth: null,
      icon: <DollarSign className="h-8 w-8" />,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-gradient-to-br from-yellow-50/90 to-yellow-100/80',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200/60',
      iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600'
    }
  ]

  const additionalMetrics = [
    {
      title: '평균 시청 지속 시간',
      value: `${data.analytics.monthlyTotals.averageViewDurationMinutes.toFixed(1)}분`,
      growth: data.analytics.growthRates?.averageViewDuration,
      icon: <Play className="h-5 w-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50/90 to-orange-100/80',
      borderColor: 'border-orange-200/60'
    },
    {
      title: '클릭률',
      value: `${(data.analytics.monthlyTotals.clickThroughRate * 100).toFixed(2)}%`,
      growth: null,
      icon: <MousePointer className="h-5 w-5" />,
      color: 'text-indigo-600',
      bgColor: 'bg-gradient-to-br from-indigo-50/90 to-indigo-100/80',
      borderColor: 'border-indigo-200/60'
    },
    {
      title: '노출 수',
      value: formatNumber(data.analytics.monthlyTotals.impressions),
      growth: null,
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'text-pink-600',
      bgColor: 'bg-gradient-to-br from-pink-50/90 to-pink-100/80',
      borderColor: 'border-pink-200/60'
    },
    {
      title: '동영상 수',
      value: formatNumber(data.channelStats.videoCount),
      growth: null,
      icon: <Play className="h-5 w-5" />,
      color: 'text-teal-600',
      bgColor: 'bg-gradient-to-br from-teal-50/90 to-teal-100/80',
      borderColor: 'border-teal-200/60'
    }
  ]

  return (
    <div className="space-y-8">
      {/* 메인 지표 카드들 - 향상된 디자인 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={metric.title} className="card hover-lift group" style={{ animationDelay: `${index * 100}ms` }}>
            <div className={`${metric.bgColor} backdrop-blur-sm rounded-xl p-6 mb-6 border ${metric.borderColor}`}>
              <div className="flex items-center justify-between">
                <div className={`icon-container ${metric.iconBg} text-white shadow-glow`}>
                  {metric.icon}
                </div>
                {metric.growth !== null && metric.growth !== undefined && (
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm border border-white/30 ${getGrowthColor(metric.growth)}`}>
                    {getGrowthIcon(metric.growth)}
                    <span className="text-sm font-semibold">
                      {metric.growth > 0 ? '+' : ''}{metric.growth.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 pb-6">
              <p className="body-small text-neutral-600 mb-2">{metric.title}</p>
              <p className="text-3xl font-bold text-neutral-900 group-hover:scale-105 transition-transform duration-300">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 추가 지표들 - 개선된 레이아웃 */}
      <div className="card p-8">
        <h3 className="heading-4 mb-6 flex items-center space-x-3">
          <div className="icon-container bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-glow">
            <BarChart3 className="h-6 w-6" />
          </div>
          <span>상세 지표</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {additionalMetrics.map((metric, index) => (
            <div key={metric.title} className={`p-6 rounded-xl ${metric.bgColor} backdrop-blur-sm border ${metric.borderColor} hover-lift transition-all duration-300`}>
              <div className="flex items-center space-x-4">
                <div className={`${metric.color} p-3 bg-white/70 rounded-xl backdrop-blur-sm shadow-soft`}>
                  {metric.icon}
                </div>
                <div className="flex-1">
                  <p className="body-small text-neutral-600 mb-1">{metric.title}</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-neutral-900 text-lg">{metric.value}</p>
                    {metric.growth !== null && metric.growth !== undefined && (
                      <div className={`flex items-center space-x-1 ${getGrowthColor(metric.growth)}`}>
                        {getGrowthIcon(metric.growth)}
                        <span className="text-xs font-semibold">
                          {metric.growth > 0 ? '+' : ''}{metric.growth.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 구독자 상세 분석 - 향상된 시각적 디자인 */}
      {data.analytics.subscriberDetails && (
        <div className="card p-8">
          <h3 className="heading-4 mb-6 flex items-center space-x-3">
            <div className="icon-container bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-glow">
              <Users className="h-6 w-6" />
            </div>
            <span>구독자 상세 분석</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="font-semibold text-neutral-900 text-lg">이번 달</h4>
              <div className="space-y-4">
                <div className="card p-4 bg-gradient-to-r from-green-50/90 to-green-100/80 border-green-200/60 hover-lift">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-800">신규 구독자</span>
                    <span className="text-xl font-bold text-green-700">
                      +{formatNumber(data.analytics.subscriberDetails.current.gained)}
                    </span>
                  </div>
                </div>
                <div className="card p-4 bg-gradient-to-r from-red-50/90 to-red-100/80 border-red-200/60 hover-lift">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-red-800">구독 취소</span>
                    <span className="text-xl font-bold text-red-700">
                      -{formatNumber(data.analytics.subscriberDetails.current.lost)}
                    </span>
                  </div>
                </div>
                <div className="card p-4 bg-gradient-to-r from-blue-50/90 to-blue-100/80 border-blue-200/60 hover-lift">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-800">순증가</span>
                    <span className="text-xl font-bold text-blue-700">
                      {data.analytics.subscriberDetails.current.net > 0 ? '+' : ''}
                      {formatNumber(data.analytics.subscriberDetails.current.net)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="font-semibold text-neutral-900 text-lg">지난 달</h4>
              <div className="space-y-4">
                <div className="card p-4 bg-gradient-to-r from-neutral-50/90 to-neutral-100/80 border-neutral-200/60 hover-lift">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-neutral-700">신규 구독자</span>
                    <span className="text-xl font-bold text-neutral-800">
                      +{formatNumber(data.analytics.subscriberDetails.previous.gained)}
                    </span>
                  </div>
                </div>
                <div className="card p-4 bg-gradient-to-r from-neutral-50/90 to-neutral-100/80 border-neutral-200/60 hover-lift">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-neutral-700">구독 취소</span>
                    <span className="text-xl font-bold text-neutral-800">
                      -{formatNumber(data.analytics.subscriberDetails.previous.lost)}
                    </span>
                  </div>
                </div>
                <div className="card p-4 bg-gradient-to-r from-neutral-50/90 to-neutral-100/80 border-neutral-200/60 hover-lift">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-neutral-700">순증가</span>
                    <span className="text-xl font-bold text-neutral-800">
                      {data.analytics.subscriberDetails.previous.net > 0 ? '+' : ''}
                      {formatNumber(data.analytics.subscriberDetails.previous.net)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 채널 인사이트 - 현대적인 디자인 */}
      <div className="card p-8">
        <h3 className="heading-4 mb-6 flex items-center space-x-3">
          <div className="icon-container bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-glow">
            <TrendingUp className="h-6 w-6" />
          </div>
          <span>채널 인사이트</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-8 text-center bg-gradient-to-br from-blue-50/90 to-indigo-50/80 border-blue-200/60 hover-lift">
            <div className="icon-container bg-gradient-to-br from-blue-500 to-blue-600 text-white w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-glow">
              <Eye className="h-8 w-8" />
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-3">
              {((data.analytics.monthlyTotals.views / data.channelStats.videoCount) || 0).toFixed(0)}
            </div>
            <div className="body-base text-blue-700 font-medium">동영상당 평균 조회수</div>
          </div>
          <div className="card p-8 text-center bg-gradient-to-br from-green-50/90 to-emerald-50/80 border-green-200/60 hover-lift">
            <div className="icon-container bg-gradient-to-br from-green-500 to-green-600 text-white w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-glow">
              <MousePointer className="h-8 w-8" />
            </div>
            <div className="text-4xl font-bold text-green-600 mb-3">
              {(data.analytics.monthlyTotals.clickThroughRate * 100).toFixed(1)}%
            </div>
            <div className="body-base text-green-700 font-medium">클릭률</div>
          </div>
          <div className="card p-8 text-center bg-gradient-to-br from-purple-50/90 to-violet-50/80 border-purple-200/60 hover-lift">
            <div className="icon-container bg-gradient-to-br from-purple-500 to-purple-600 text-white w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-glow">
              <Clock className="h-8 w-8" />
            </div>
            <div className="text-4xl font-bold text-purple-600 mb-3">
              {((data.analytics.monthlyTotals.watchTimeMinutes / data.analytics.monthlyTotals.views) || 0).toFixed(1)}분
            </div>
            <div className="body-base text-purple-700 font-medium">평균 시청 시간</div>
          </div>
        </div>
      </div>
    </div>
  )
} 