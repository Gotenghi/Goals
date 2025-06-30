'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Settings, Save, TrendingUp, Users, Target, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { loadFromLocalStorage, saveToLocalStorage, defaultGoals, defaultChannelMetrics } from '@/lib/utils'

interface Goal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  color: string
  description: string
  deadline: string
}

interface ChannelMetric {
  id: string
  metric_name: string
  target: number
  current: number
  unit: string
}



export default function AdminPage() {
  const [goals, setGoals] = useState<Goal[]>(defaultGoals)
  const [channelMetrics, setChannelMetrics] = useState<ChannelMetric[]>([
    { id: 'monthly_views', metric_name: '월간 조회수', target: 50000000, current: 0, unit: '회' },
    { id: 'daily_uploads', metric_name: '일일 발행량', target: 2.5, current: 0, unit: '개' },
    { id: 'subscribers', metric_name: '구독자 증가', target: 100000, current: 0, unit: '명' },
    { id: 'instagram', metric_name: '인스타 팔로워', target: 3200, current: 800, unit: '명' }
  ])
  const [message, setMessage] = useState('')

  // 컴포넌트 마운트 시 로컬스토리지에서 데이터 로드
  useEffect(() => {
    loadData()
  }, [])

  // 로컬스토리지에서 데이터 로드
  const loadData = () => {
    const savedGoals = loadFromLocalStorage('usso-goals', defaultGoals)
    const savedChannelMetrics = loadFromLocalStorage('usso-channel-metrics', defaultChannelMetrics)
    
    setGoals(savedGoals)
    
    // 채널 지표를 관리자 페이지 형식으로 변환
    const adminChannelMetrics = [
      { id: 'monthly_views', metric_name: '월간 조회수', target: savedChannelMetrics.monthlyViews.target, current: savedChannelMetrics.monthlyViews.current, unit: '회' },
      { id: 'daily_uploads', metric_name: '일일 발행량', target: savedChannelMetrics.dailyUploads.target, current: savedChannelMetrics.dailyUploads.current, unit: '개' },
      { id: 'subscribers', metric_name: '구독자 증가', target: savedChannelMetrics.subscribers.target, current: savedChannelMetrics.subscribers.current, unit: '명' },
      { id: 'instagram', metric_name: '인스타 팔로워', target: savedChannelMetrics.instagramFollowers.target, current: savedChannelMetrics.instagramFollowers.current, unit: '명' }
    ]
    setChannelMetrics(adminChannelMetrics)
  }



  // 목표 업데이트
  const updateGoal = (goalId: string, field: 'current' | 'target', value: number) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, [field]: value } : goal
    )
    setGoals(updatedGoals)
    saveToLocalStorage('usso-goals', updatedGoals)
    setMessage(`${goals.find(g => g.id === goalId)?.title} ${field === 'current' ? '현재값' : '목표값'}이 업데이트되었습니다!`)
    setTimeout(() => setMessage(''), 3000)
  }

  // 채널 지표 업데이트
  const updateChannelMetric = (metricId: string, field: 'current' | 'target', value: number) => {
    const updatedChannelMetrics = channelMetrics.map(metric => 
      metric.id === metricId ? { ...metric, [field]: value } : metric
    )
    setChannelMetrics(updatedChannelMetrics)
    
    // 메인 대시보드 형식으로 변환하여 저장
    const mainChannelMetrics = {
      monthlyViews: {
        target: updatedChannelMetrics.find(m => m.id === 'monthly_views')?.target || 50000000,
        current: updatedChannelMetrics.find(m => m.id === 'monthly_views')?.current || 0,
        unit: '회'
      },
      dailyUploads: {
        target: updatedChannelMetrics.find(m => m.id === 'daily_uploads')?.target || 2.5,
        current: updatedChannelMetrics.find(m => m.id === 'daily_uploads')?.current || 0,
        unit: '개'
      },
      subscribers: {
        target: updatedChannelMetrics.find(m => m.id === 'subscribers')?.target || 100000,
        current: updatedChannelMetrics.find(m => m.id === 'subscribers')?.current || 0,
        unit: '명'
      },
      instagramFollowers: {
        target: updatedChannelMetrics.find(m => m.id === 'instagram')?.target || 3200,
        current: updatedChannelMetrics.find(m => m.id === 'instagram')?.current || 800,
        unit: '명'
      }
    }
    saveToLocalStorage('usso-channel-metrics', mainChannelMetrics)
    
    setMessage(`${channelMetrics.find(m => m.id === metricId)?.metric_name} ${field === 'current' ? '현재값' : '목표값'}이 업데이트되었습니다!`)
    setTimeout(() => setMessage(''), 3000)
  }



  const formatNumber = (num: number) => {
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(1)}억`
    }
    if (num >= 10000) {
      return `${(num / 10000).toFixed(0)}만`
    }
    return num.toLocaleString()
  }

  // 데이터 초기화 기능
  const resetAllData = () => {
    setGoals(defaultGoals)
    const adminChannelMetrics = [
      { id: 'monthly_views', metric_name: '월간 조회수', target: defaultChannelMetrics.monthlyViews.target, current: defaultChannelMetrics.monthlyViews.current, unit: '회' },
      { id: 'daily_uploads', metric_name: '일일 발행량', target: defaultChannelMetrics.dailyUploads.target, current: defaultChannelMetrics.dailyUploads.current, unit: '개' },
      { id: 'subscribers', metric_name: '구독자 증가', target: defaultChannelMetrics.subscribers.target, current: defaultChannelMetrics.subscribers.current, unit: '명' },
      { id: 'instagram', metric_name: '인스타 팔로워', target: defaultChannelMetrics.instagramFollowers.target, current: defaultChannelMetrics.instagramFollowers.current, unit: '명' }
    ]
    setChannelMetrics(adminChannelMetrics)
    
    saveToLocalStorage('usso-goals', defaultGoals)
    saveToLocalStorage('usso-channel-metrics', defaultChannelMetrics)
    
    setMessage('모든 데이터가 초기화되었습니다!')
    setTimeout(() => setMessage(''), 3000)
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-usso-light via-white to-blue-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-usso-primary p-2 rounded-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-usso-dark">관리자 페이지</h1>
                <p className="text-gray-600">목표와 지표를 업데이트하세요</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="bg-usso-secondary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                대시보드로 돌아가기
              </Link>
              <button
                onClick={loadData}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>새로고침</span>
              </button>
              <button
                onClick={resetAllData}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 알림 메시지 */}
        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        {/* 수익 목표 업데이트 */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-usso-primary to-usso-secondary p-3 rounded-lg mr-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-usso-dark">수익 목표 업데이트</h2>
                <p className="text-gray-600">현재 달성한 수익을 입력하세요</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => {
                const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0
                return (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                      <span className="text-sm text-gray-500">{formatNumber(goal.target)} {goal.unit}</span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${goal.color} transition-all duration-500`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="text-right text-sm text-gray-600 mt-1">
                        {progress.toFixed(1)}%
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          현재 달성액 (원)
                        </label>
                        <input
                          type="number"
                          value={goal.current}
                          onChange={(e) => updateGoal(goal.id, 'current', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-usso-primary"
                          placeholder={`현재 ${goal.title}`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          목표액 (원)
                        </label>
                        <input
                          type="number"
                          value={goal.target}
                          onChange={(e) => updateGoal(goal.id, 'target', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-usso-primary"
                          placeholder={`목표 ${goal.title}`}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 채널 지표 업데이트 */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg mr-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-usso-dark">채널 지표 업데이트</h2>
                <p className="text-gray-600">현재 채널 성과를 입력하세요</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {channelMetrics.map((metric) => {
                const progress = metric.target > 0 ? (metric.current / metric.target) * 100 : 0
                return (
                  <div key={metric.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{metric.metric_name}</h3>
                      <span className="text-sm text-gray-500">
                        {metric.metric_name === '일일 발행량' 
                          ? metric.target.toFixed(1)
                          : formatNumber(metric.target)
                        } {metric.unit}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="text-right text-sm text-gray-600 mt-1">
                        {progress.toFixed(1)}%
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step={metric.metric_name === '일일 발행량' ? '0.1' : '1'}
                        value={metric.current}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value) || 0
                          setChannelMetrics(prev => prev.map(m => 
                            m.id === metric.id ? { ...m, current: newValue } : m
                          ))
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`현재 ${metric.metric_name}`}
                      />
                      <button
                        onClick={() => updateChannelMetric(metric.id, 'current', metric.current)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:opacity-90 flex items-center space-x-1"
                      >
                        <Save className="h-4 w-4" />
                        <span>저장</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>


      </main>
    </div>
  )
} 