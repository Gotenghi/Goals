'use client'

import { useState, useEffect } from 'react'
import GoalCard from './components/GoalCard'
import ChannelMetrics from './components/ChannelMetrics'
import TeamProgress from './components/TeamProgress'
import { Target, TrendingUp, Users, DollarSign, Settings } from 'lucide-react'
import Link from 'next/link'
import { loadFromLocalStorage, defaultGoals, defaultChannelMetrics } from '@/lib/utils'

// 목표 데이터 타입 정의
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

export default function Dashboard() {
  const [goals, setGoals] = useState<Goal[]>(defaultGoals)
  const [channelMetrics, setChannelMetrics] = useState(defaultChannelMetrics)

  // 컴포넌트 마운트 시 로컬스토리지에서 데이터 로드
  useEffect(() => {
    const savedGoals = loadFromLocalStorage('usso-goals', defaultGoals)
    const savedChannelMetrics = loadFromLocalStorage('usso-channel-metrics', defaultChannelMetrics)
    
    setGoals(savedGoals)
    setChannelMetrics(savedChannelMetrics)
  }, [])

  // 총 목표 금액 계산
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0)
  const totalCurrent = goals.reduce((sum, goal) => sum + goal.current, 0)
  const totalProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-usso-light via-white to-blue-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-usso-primary p-2 rounded-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-usso-dark">웃소 목표 대시보드</h1>
                <p className="text-gray-600">2025년 3분기 목표 추적 시스템</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin"
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 shadow-md flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span className="font-medium">관리자</span>
              </Link>
              <div className="text-right">
                <p className="text-sm text-gray-500">마지막 업데이트</p>
                <p className="text-lg font-semibold">{new Date().toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 전체 진행률 카드 */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-usso-primary to-usso-secondary p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-usso-dark">전체 목표 진행률</h2>
                  <p className="text-gray-600">총 {(totalTarget / 100000000).toFixed(1)}억원 목표</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-usso-primary">
                  {totalProgress.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">
                  {(totalCurrent / 100000000).toFixed(1)}억 / {(totalTarget / 100000000).toFixed(1)}억
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-usso-primary to-usso-secondary h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(totalProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 수익 목표 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>

        {/* 채널 지표 */}
        <div className="mb-8">
          <ChannelMetrics metrics={channelMetrics} />
        </div>

        {/* 팀별 진행 상황 */}
        <div className="mb-8">
          <TeamProgress />
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-usso-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-semibold mb-2">웃소 화이팅! 🚀</p>
          <p className="text-gray-400">함께 목표를 달성해봅시다!</p>
        </div>
      </footer>
    </div>
  )
} 