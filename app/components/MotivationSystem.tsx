'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Star, Target, TrendingUp, Award, Zap, Heart, Users, Eye, Clock, Sparkles, Crown, Medal, Edit3, Save, X, Plus, Calendar, DollarSign } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface Achievement {
  id: string
  title: string
  description: string
  iconName: string
  type: 'milestone' | 'streak' | 'growth' | 'quality' | 'achievement' | 'consistency' | 'revenue' | 'engagement'
  target_value: number
  current: number
  unlocked: boolean
  unlockedAt?: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface MotivationData {
  channelStats?: {
    subscriberCount: number
    viewCount: number
    videoCount: number
  }
  monthlyTotals?: {
    views: number
    watchTimeMinutes: number
    averageViewDurationMinutes: number
    revenue: number
    clickThroughRate: number
  }
  growthRates?: {
    views: number | null
    watchTime: number | null
    subscribers: number | null
  }
  isAuthenticated: boolean
}

interface MotivationSystemProps {
  data: MotivationData
}

const MotivationSystem: React.FC<MotivationSystemProps> = ({ data }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [showCelebration, setShowCelebration] = useState<string | null>(null)
  const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<string | null>(null)

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-neutral-400 to-neutral-600'
      case 'rare': return 'from-info-500 to-info-600'
      case 'epic': return 'from-usso-secondary to-purple-600'
      case 'legendary': return 'from-usso-accent to-usso-primary'
      default: return 'from-neutral-400 to-neutral-600'
    }
  }

  const getRarityBorder = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-neutral-300'
      case 'rare': return 'border-info-300'
      case 'epic': return 'border-usso-secondary/50'
      case 'legendary': return 'border-usso-primary/50'
      default: return 'border-neutral-300'
    }
  }

  const getRarityBadge = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'badge-info'
      case 'rare': return 'badge-info'
      case 'epic': return 'badge-warning'
      case 'legendary': return 'badge-success'
      default: return 'badge-info'
    }
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Users': return <Users className="h-6 w-6" />
      case 'Star': return <Star className="h-6 w-6" />
      case 'Medal': return <Medal className="h-6 w-6" />
      case 'Crown': return <Crown className="h-6 w-6" />
      case 'Trophy': return <Trophy className="h-6 w-6" />
      case 'Eye': return <Eye className="h-6 w-6" />
      case 'TrendingUp': return <TrendingUp className="h-6 w-6" />
      case 'Heart': return <Heart className="h-6 w-6" />
      case 'Calendar': return <Calendar className="h-6 w-6" />
      case 'DollarSign': return <DollarSign className="h-6 w-6" />
      case 'Handshake': return <Users className="h-6 w-6" /> // Handshake 대체
      case 'Zap': return <Zap className="h-6 w-6" />
      default: return <Target className="h-6 w-6" />
    }
  }

  // API에서 업적 데이터 로드
  const loadAchievementsFromAPI = async () => {
    try {
      const response = await fetch('/api/achievements')
      const result = await response.json()
      
      if (response.ok) {
        return result.achievements?.map((achievement: any) => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: getIconComponent(achievement.icon),
          type: achievement.type,
          target_value: achievement.target_value,
          rarity: achievement.rarity,
          unlocked: achievement.unlocked,
          current: achievement.current,
          unlockedAt: achievement.unlockedAt
        })) || []
      } else {
        console.error('업적 데이터 로드 실패:', result.error)
        return getDefaultAchievements()
      }
    } catch (error) {
      console.error('업적 API 호출 실패:', error)
      return getDefaultAchievements()
    }
  }

  const getDefaultAchievements = () => {
    return [
      {
        id: 'subscribers_100k',
        title: '첫 번째 이정표',
        description: '10만 구독자 달성',
        iconName: 'Users',
        type: 'milestone' as const,
        target_value: 100000,
        rarity: 'common' as const,
        unlocked: false,
        current: 67500,
        unlockedAt: undefined
      },
      {
        id: 'subscribers_500k',
        title: '인플루언서',
        description: '50만 구독자 달성',
        iconName: 'Star',
        type: 'milestone' as const,
        target_value: 500000,
        rarity: 'rare' as const,
        unlocked: false,
        current: 67500,
        unlockedAt: undefined
      },
      {
        id: 'subscribers_1m',
        title: '실버 플레이 버튼',
        description: '100만 구독자 달성',
        iconName: 'Medal',
        type: 'milestone' as const,
        target_value: 1000000,
        rarity: 'epic' as const,
        unlocked: false,
        current: 67500,
        unlockedAt: undefined
      },
      {
        id: 'views_1m',
        title: '첫 백만 뷰',
        description: '단일 영상 100만 조회수 달성',
        iconName: 'Eye',
        type: 'achievement' as const,
        target_value: 1000000,
        rarity: 'common' as const,
        unlocked: true,
        current: 1250000,
        unlockedAt: new Date('2024-12-15T10:30:00Z')
      },
      {
        id: 'consistency_30',
        title: '꾸준함의 힘',
        description: '30일 연속 업로드',
        iconName: 'Calendar',
        type: 'consistency' as const,
        target_value: 30,
        rarity: 'common' as const,
        unlocked: true,
        current: 45,
        unlockedAt: new Date('2024-12-01T00:00:00Z')
      },
      {
        id: 'revenue_1k',
        title: '첫 수익',
        description: '월 수익 $1,000 달성',
        iconName: 'DollarSign',
        type: 'revenue' as const,
        target_value: 1000,
        rarity: 'common' as const,
        unlocked: true,
        current: 3200,
        unlockedAt: new Date('2024-11-20T00:00:00Z')
      }
    ]
  }

  // 업적 데이터 저장
  const saveAchievementsToAPI = async (achievementsData: Achievement[]) => {
    try {
      for (const achievement of achievementsData) {
        // 업적 기록 업데이트
        await fetch('/api/achievements', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            achievement_id: achievement.id,
            current_value: achievement.current,
            unlocked: achievement.unlocked
          })
        })
      }
    } catch (error) {
      console.error('업적 저장 API 호출 실패:', error)
    }
  }

  // 실제 데이터 기반 업적 업데이트
  useEffect(() => {
    const initializeAchievements = async () => {
      const achievementsData = await loadAchievementsFromAPI()
      setAchievements(achievementsData)
      
      // 기본 데이터가 없으면 샘플 데이터로 초기화하고 저장
      if (achievementsData.length === 0) {
        const defaultAchievements = getDefaultAchievements()
        setAchievements(defaultAchievements)
        await saveAchievementsToAPI(defaultAchievements)
      }
    }
    
    initializeAchievements()
  }, [])

  // 실제 데이터로 업적 업데이트
  useEffect(() => {
    if (!data.channelStats || !data.monthlyTotals) return

    const updateAchievements = async () => {
      const { channelStats, monthlyTotals, growthRates } = data

      const updatedAchievements = achievements.map(achievement => {
        let currentValue = achievement.current
        let unlocked = achievement.unlocked

        // 구독자 관련 업적
        if (achievement.id.startsWith('subscribers_') && channelStats) {
          currentValue = channelStats.subscriberCount
          unlocked = currentValue >= achievement.target_value
        }
        // 조회수 관련 업적 (최고 영상 기준)
        else if (achievement.id.startsWith('views_') && monthlyTotals) {
          // 실제 최고 조회수 영상 데이터가 있다면 사용
          currentValue = Math.max(monthlyTotals.views, achievement.current)
          unlocked = currentValue >= achievement.target_value
        }
        // 수익 관련 업적
        else if (achievement.id.startsWith('revenue_') && monthlyTotals) {
          currentValue = monthlyTotals.revenue
          unlocked = currentValue >= achievement.target_value
        }
        // 참여도 관련 업적
        else if (achievement.id.startsWith('engagement_') && monthlyTotals) {
          currentValue = monthlyTotals.clickThroughRate * 100 // CTR을 참여도로 사용
          unlocked = currentValue >= achievement.target_value
        }
        // 일관성 관련 업적 (업로드 연속성)
        else if (achievement.id.startsWith('consistency_')) {
          // 실제 업로드 연속성 데이터가 있다면 사용, 없으면 기존 값 유지
          currentValue = achievement.current
          unlocked = currentValue >= achievement.target_value
        }

        return {
          ...achievement,
          current: currentValue,
          unlocked: unlocked,
          unlockedAt: unlocked && !achievement.unlocked ? new Date() : achievement.unlockedAt
        }
      })

      setAchievements(updatedAchievements)
      await saveAchievementsToAPI(updatedAchievements)
    }

    updateAchievements()
  }, [data, achievements.length]) // achievements.length를 의존성에 추가하여 초기 로드 후에만 실행

  // 업적 편집 함수
  const handleEditAchievement = async (achievementId: string, updates: Partial<Achievement>) => {
    const updatedAchievements = achievements.map(achievement =>
      achievement.id === achievementId ? { ...achievement, ...updates } : achievement
    )
    setAchievements(updatedAchievements)
    await saveAchievementsToAPI(updatedAchievements)
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length
  const completionRate = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0

  // 다음 달성 가능한 업적
  const nextAchievements = achievements
    .filter(a => !a.unlocked)
    .sort((a, b) => {
      const progressA = a.current / a.target_value
      const progressB = b.current / b.target_value
      return progressB - progressA
    })
    .slice(0, 3)

  return (
    <div className="p-8 animate-in">
      {/* 축하 효과 */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-bounce-in">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-glow">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 업적 달성!</h3>
            <p className="text-gray-600 mb-6">새로운 업적을 해금했습니다!</p>
            <button
              onClick={() => setShowCelebration(null)}
              className="px-6 py-3 bg-gradient-to-r from-usso-primary to-usso-primary/80 text-white rounded-lg hover:from-usso-primary/90 hover:to-usso-primary/70 transition-all"
            >
              계속하기
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="icon-container bg-gradient-to-br from-usso-primary to-usso-primary/80 text-white shadow-glow">
            <Trophy className="h-8 w-8" />
          </div>
          <div>
            <h3 className="heading-2 bg-gradient-to-r from-usso-primary to-usso-primary/80 bg-clip-text text-transparent">
              성취 시스템
            </h3>
            <p className="body-base text-neutral-600">팀의 성장과 성과를 축하합니다</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isEditMode 
                ? 'bg-success-600 text-white hover:bg-success-700' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isEditMode ? (
              <>
                <Save className="h-4 w-4" />
                <span>저장 완료</span>
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4" />
                <span>관리자 편집</span>
              </>
            )}
          </button>
          <div className="text-right">
            <div className="body-small text-neutral-600">업적 달성률</div>
            <div className="heading-4 text-usso-primary">
              {unlockedCount}/{totalCount} ({completionRate.toFixed(1)}%)
            </div>
          </div>
          <div className={`badge-${data.isAuthenticated ? 'success' : 'warning'}`}>
            {data.isAuthenticated ? '✅ 실제 데이터' : '⚠️ Mock 데이터'}
          </div>
        </div>
      </div>

      {/* 전체 진행률 */}
      <div className="card p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="heading-4 text-neutral-800">전체 진행률</span>
          <span className="heading-4 text-usso-primary">{completionRate.toFixed(1)}%</span>
        </div>
        <div className="progress-bar h-4">
          <div 
            className="progress-fill bg-gradient-to-r from-usso-primary to-usso-secondary"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="body-small text-neutral-600">{unlockedCount}개 달성</span>
          <span className="body-small text-neutral-600">{totalCount - unlockedCount}개 남음</span>
        </div>
      </div>

      {/* 최근 해금된 업적 */}
      {recentUnlocks.length > 0 && (
        <div className="card p-6 mb-8 bg-gradient-to-r from-usso-accent/10 to-usso-primary/10 border-usso-primary/20">
          <h4 className="heading-4 text-usso-primary mb-4 flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            최근 달성한 업적
          </h4>
          <div className="space-y-3">
            {recentUnlocks.map(achievement => (
              <div key={achievement.id} className="flex items-center space-x-4 animate-slide-up">
                <div className={`icon-container bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white shadow-medium`}>
                  {getIconComponent(achievement.iconName)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="heading-4 text-neutral-900">{achievement.title}</p>
                    <span className={getRarityBadge(achievement.rarity)}>
                      {achievement.rarity.toUpperCase()}
                    </span>
                  </div>
                  <p className="body-small text-neutral-600">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 다음 목표 업적 */}
      <div className="mb-8">
        <h4 className="heading-4 text-neutral-800 mb-6 flex items-center">
          <Target className="h-5 w-5 mr-2 text-usso-secondary" />
          다음 달성 목표
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {nextAchievements.map((achievement, index) => {
            const progress = Math.min(100, (achievement.current / achievement.target_value) * 100)
            const remaining = achievement.target_value - achievement.current
            
            return (
              <div 
                key={achievement.id} 
                className={`card-interactive p-6 border-2 ${getRarityBorder(achievement.rarity)} hover-glow`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`icon-container bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white shadow-medium`}>
                    {getIconComponent(achievement.iconName)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="heading-4 text-neutral-900">{achievement.title}</h5>
                      <span className={getRarityBadge(achievement.rarity)}>
                        {achievement.rarity}
                      </span>
                    </div>
                    <p className="body-small text-neutral-600">{achievement.description}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="body-small text-neutral-700">
                      {formatNumber(achievement.current)} / {formatNumber(achievement.target_value)}
                    </span>
                    <span className="body-small font-bold text-usso-primary">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <p className="body-small text-neutral-500">
                  {formatNumber(remaining)} 남음
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 모든 업적 목록 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h4 className="heading-4 text-neutral-800 flex items-center">
            <Award className="h-5 w-5 mr-2 text-usso-secondary" />
            모든 업적
          </h4>
          {isEditMode && (
            <button
              onClick={() => {
                const newAchievement: Achievement = {
                  id: `custom_${Date.now()}`,
                  title: '새 업적',
                  description: '새로운 업적 설명',
                  iconName: 'Target',
                  type: 'milestone',
                  target_value: 100,
                  current: 0,
                  unlocked: false,
                  rarity: 'common'
                }
                const updatedAchievements = [...achievements, newAchievement]
                setAchievements(updatedAchievements)
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span>업적 추가</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <div 
              key={achievement.id} 
              className={`achievement-card card-interactive p-6 border-2 transition-all duration-300 relative group ${
                achievement.unlocked 
                  ? `${getRarityBorder(achievement.rarity)} bg-gradient-surface shadow-medium hover-glow achievement-unlocked animate-bounce-in` 
                  : 'border-neutral-200 bg-neutral-50 opacity-60 hover:opacity-80'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {isEditMode && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingAchievement(editingAchievement === achievement.id ? null : achievement.id)}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              )}

              {editingAchievement === achievement.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={achievement.title}
                    onChange={(e) => {
                      const updated = achievements.map(a => 
                        a.id === achievement.id ? { ...a, title: e.target.value } : a
                      )
                      setAchievements(updated)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-usso-primary bg-white text-gray-900 placeholder-gray-500 text-sm"
                    placeholder="업적 제목"
                  />
                  <textarea
                    value={achievement.description}
                    onChange={(e) => {
                      const updated = achievements.map(a => 
                        a.id === achievement.id ? { ...a, description: e.target.value } : a
                      )
                      setAchievements(updated)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-usso-primary bg-white text-gray-900 placeholder-gray-500 text-sm resize-none"
                    rows={2}
                    placeholder="업적 설명"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={achievement.target_value}
                      onChange={(e) => {
                        const updated = achievements.map(a => 
                          a.id === achievement.id ? { ...a, target_value: parseInt(e.target.value) || 0 } : a
                        )
                        setAchievements(updated)
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-usso-primary bg-white text-gray-900 placeholder-gray-500 text-sm"
                      placeholder="목표값"
                    />
                    <select
                      value={achievement.rarity}
                      onChange={(e) => {
                        const updated = achievements.map(a => 
                          a.id === achievement.id ? { ...a, rarity: e.target.value as 'common' | 'rare' | 'epic' | 'legendary' } : a
                        )
                        setAchievements(updated)
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-usso-primary bg-white text-gray-900 text-sm"
                    >
                      <option value="common">일반</option>
                      <option value="rare">희귀</option>
                      <option value="epic">영웅</option>
                      <option value="legendary">전설</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`icon-container text-white ${
                      achievement.unlocked 
                        ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} shadow-medium` 
                        : 'bg-neutral-400'
                    } relative`}>
                      {getIconComponent(achievement.iconName)}
                      {achievement.unlocked && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full flex items-center justify-center">
                          <Trophy className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className={`heading-4 ${achievement.unlocked ? 'text-neutral-900' : 'text-neutral-500'}`}>
                          {achievement.title}
                        </h5>
                        {achievement.unlocked && (
                          <span className={getRarityBadge(achievement.rarity)}>
                            {achievement.rarity === 'common' ? '일반' : 
                             achievement.rarity === 'rare' ? '희귀' : 
                             achievement.rarity === 'epic' ? '영웅' : '전설'}
                          </span>
                        )}
                      </div>
                      <p className={`body-small ${achievement.unlocked ? 'text-neutral-600' : 'text-neutral-400'}`}>
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <div className="text-success-500 animate-pulse">
                        <Crown className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  
                  {!achievement.unlocked && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="body-small text-neutral-500">
                          {formatNumber(achievement.current)} / {formatNumber(achievement.target_value)}
                        </span>
                        <span className={`body-small font-bold ${
                          (achievement.current / achievement.target_value) * 100 >= 90 
                            ? 'text-orange-500 animate-pulse' 
                            : 'text-usso-primary'
                        }`}>
                          {Math.min(100, (achievement.current / achievement.target_value) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="progress-bar h-3 mb-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div 
                          className={`progress-fill h-full rounded-full relative overflow-hidden transition-all duration-500 ${
                            (achievement.current / achievement.target_value) * 100 >= 90 
                              ? 'bg-gradient-to-r from-orange-400 to-red-500 animate-glow' 
                              : (achievement.current / achievement.target_value) * 100 >= 75 
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                                : (achievement.current / achievement.target_value) * 100 >= 50 
                                  ? 'bg-gradient-to-r from-blue-400 to-purple-500' 
                                  : 'bg-gradient-to-r from-gray-400 to-gray-500'
                          }`}
                          style={{ width: `${Math.min(100, (achievement.current / achievement.target_value) * 100)}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="body-small text-neutral-400">
                          {formatNumber(achievement.target_value - achievement.current)} 남음
                        </span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                i < Math.floor((achievement.current / achievement.target_value) * 5)
                                  ? (achievement.current / achievement.target_value) * 100 >= 90 
                                    ? 'bg-orange-500 animate-pulse' 
                                    : 'bg-usso-primary'
                                  : 'bg-neutral-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {(achievement.current / achievement.target_value) * 100 >= 90 && (
                        <div className="mt-2 text-center">
                          <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 text-xs font-medium rounded-full animate-pulse">
                            <Zap className="h-3 w-3 mr-1" />
                            거의 달성!
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-success-50 to-success-100 rounded-lg border border-success-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="h-4 w-4 text-success-600" />
                          <span className="body-small font-medium text-success-700">
                            달성 완료!
                          </span>
                        </div>
                        <span className="body-small text-success-600">
                          {achievement.unlockedAt.toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {achievement.unlocked && (
                    <div className="mt-3 flex items-center justify-center">
                      <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-full">
                        <Medal className="h-4 w-4 text-yellow-600" />
                        <span className="text-xs font-bold text-yellow-700">달성됨</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 동기부여 메시지 */}
      <div className="card p-6 mt-8 bg-gradient-to-r from-usso-primary/5 to-usso-secondary/5 border-usso-primary/20">
        <div className="flex items-center space-x-4">
          <div className="icon-container bg-gradient-to-r from-usso-primary to-usso-secondary text-white shadow-glow animate-pulse-slow">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h5 className="heading-4 text-usso-primary">오늘도 웃소와 함께! 🎉</h5>
            <p className="body-base text-neutral-700 mt-1">
              {unlockedCount === 0 
                ? "첫 번째 업적 달성까지 조금만 더 힘내세요!" 
                : unlockedCount < totalCount / 2
                ? "좋은 페이스입니다! 계속 성장해나가요!"
                : unlockedCount < totalCount * 0.8
                ? "대단해요! 이미 많은 업적을 달성했습니다!"
                : "거의 다 왔어요! 모든 업적 달성까지 조금만 더!"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MotivationSystem 