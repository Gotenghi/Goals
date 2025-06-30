'use client'

import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'

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

interface GoalCardProps {
  goal: Goal
}

export default function GoalCard({ goal }: GoalCardProps) {
  const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0
  const isOnTrack = progress >= 25 // 3분기 기준 대략적인 진행률

  const formatNumber = (num: number) => {
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(1)}억`
    }
    if (num >= 10000) {
      return `${(num / 10000).toFixed(0)}만`
    }
    return num.toLocaleString()
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      {/* 상단 색상 바 */}
      <div className={`h-2 ${goal.color}`} />
      
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{goal.title}</h3>
            <p className="text-sm text-gray-600">{goal.description}</p>
          </div>
          <div className="flex items-center space-x-1">
            {isOnTrack ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
          </div>
        </div>

        {/* 진행률 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-gray-900">
              {progress.toFixed(1)}%
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isOnTrack 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isOnTrack ? '목표치 달성 중' : '주의 필요'}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full transition-all duration-700 ${goal.color}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatNumber(goal.current)} {goal.unit}</span>
            <span>{formatNumber(goal.target)} {goal.unit}</span>
          </div>
        </div>

        {/* 마감일 */}
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{goal.deadline}</span>
        </div>
      </div>
    </div>
  )
} 