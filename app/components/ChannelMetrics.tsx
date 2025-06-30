'use client'

import { Eye, Upload, Users, Instagram, Youtube, TrendingUp } from 'lucide-react'

interface ChannelMetricsProps {
  metrics: {
    monthlyViews: {
      target: number
      current: number
      unit: string
    }
    dailyUploads: {
      target: number
      current: number
      unit: string
    }
    subscribers: {
      target: number
      current: number
      unit: string
    }
    instagramFollowers: {
      target: number
      current: number
      unit: string
    }
  }
}

export default function ChannelMetrics({ metrics }: ChannelMetricsProps) {
  const formatNumber = (num: number) => {
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

  const getProgress = (current: number, target: number) => {
    return target > 0 ? (current / target) * 100 : 0
  }

  const metricCards = [
    {
      title: '월간 조회수',
      icon: Eye,
      ...metrics.monthlyViews,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: '일일 발행량',
      icon: Upload,
      ...metrics.dailyUploads,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: '구독자 증가',
      icon: Users,
      ...metrics.subscribers,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: '인스타 팔로워',
      icon: Instagram,
      ...metrics.instagramFollowers,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-usso-primary to-usso-secondary p-3 rounded-lg mr-4">
          <Youtube className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-usso-dark">웃소 채널 지표</h2>
          <p className="text-gray-600">2025년 3분기 채널 성과 목표</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => {
          const progress = getProgress(metric.current, metric.target)
          const Icon = metric.icon
          
          return (
            <div key={index} className={`${metric.bgColor} rounded-lg p-4 border border-gray-100`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                  <Icon className={`h-5 w-5 ${metric.iconColor}`} />
                </div>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </div>
              
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-700 mb-1">{metric.title}</h3>
                <div className="text-2xl font-bold text-gray-900">
                  {metric.title === '일일 발행량' 
                    ? metric.current.toFixed(1)
                    : formatNumber(metric.current)
                  }
                  <span className="text-sm font-normal text-gray-600 ml-1">
                    / {metric.title === '일일 발행량' 
                      ? metric.target.toFixed(1)
                      : formatNumber(metric.target)
                    } {metric.unit}
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-white rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${metric.color} transition-all duration-500`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              
              <div className="mt-2 text-right">
                <span className="text-xs font-medium text-gray-600">
                  {progress.toFixed(1)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 주요 목표 요약 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-usso-light to-blue-50 rounded-lg">
        <h3 className="font-semibold text-usso-dark mb-2">📋 주요 채널 목표</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-usso-primary rounded-full mr-2" />
            <span>웃소 영상: 주 3회 → 주 4회 발행</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-usso-secondary rounded-full mr-2" />
            <span>숏폼: 주 7회 → 주 10회 발행</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-usso-accent rounded-full mr-2" />
            <span>롱폼:숏폼 비율 6:4 유지</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
            <span>일일 조회수 166만회 목표</span>
          </div>
        </div>
      </div>
    </div>
  )
} 