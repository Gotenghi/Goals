'use client'

import { useState, useEffect } from 'react'
import { Users, Trophy, Star, Target, TrendingUp, Award, Crown, Zap, Medal, ChevronRight, BarChart3, PlayCircle, Eye, DollarSign, Heart, MessageCircle, Share, Flame, Sparkles, Timer, Calendar, Gamepad2 } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  level: number
  xp: number
  maxXp: number
  achievements: string[]
  weeklyGoals: {
    completed: number
    total: number
  }
  stats: {
    videosCreated: number
    viewsGenerated: number
    engagementRate: number
  }
  rank: number
  isOnline: boolean
  status: string
  tasks_completed?: number
  tasks_total?: number
}

interface TeamGoal {
  id: string
  title: string
  description: string
  progress: number
  target: number
  deadline: string
  category: 'views' | 'subscribers' | 'engagement' | 'content' | 'revenue'
  reward: string
  priority: 'high' | 'medium' | 'low'
  icon: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  unlocked: boolean
  progress: number
  target: number
  category: string
}

export default function TeamProgress() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamGoals, setTeamGoals] = useState<TeamGoal[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'members' | 'goals' | 'achievements'>('overview')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 팀 멤버 데이터 로드
      const teamResponse = await fetch('/api/team?type=team_member')
      if (teamResponse.ok) {
        const teamData = await teamResponse.json()
        
        if (teamData?.teamMembers && Array.isArray(teamData.teamMembers)) {
          const processedMembers = teamData.teamMembers.map((member: any, index: number) => ({
            id: member.id || `member-${index}`,
            name: member.name || '익명',
            role: member.role || '팀원',
            avatar: member.avatar || '👤',
            level: member.level || 1,
            xp: member.xp || 0,
            maxXp: (member.level || 1) * 1000,
            achievements: member.achievements || [],
            weeklyGoals: {
              completed: member.tasks_completed || member.weekly_goals_completed || 0,
              total: member.tasks_total || member.weekly_goals_total || 10
            },
            stats: {
              videosCreated: member.videos_created || 0,
              viewsGenerated: member.views_generated || 0,
              engagementRate: member.engagement_rate || 0
            },
            rank: index + 1,
            isOnline: member.status === 'active',
            status: member.status || 'active',
            tasks_completed: member.tasks_completed || 0,
            tasks_total: member.tasks_total || 10
          }))
          
          setTeamMembers(processedMembers)
        }
      }

      // 팀 목표 데이터 로드
      const goalsResponse = await fetch('/api/team?type=team_goal')
      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json()
        
        if (goalsData?.teamGoals && Array.isArray(goalsData.teamGoals)) {
          const processedGoals = goalsData.teamGoals.map((goal: any) => ({
            id: goal.id,
            title: goal.title,
            description: goal.description || '',
            progress: goal.progress || 0,
            target: goal.target || 100,
            deadline: goal.deadline || '',
            category: goal.category || 'content',
            reward: goal.reward || '🎉 축하합니다!',
            priority: 'high',
            icon: getCategoryIcon(goal.category)
          }))
          
          setTeamGoals(processedGoals)
        }
      }

      // 업적 데이터 로드
      const achievementsResponse = await fetch('/api/achievements?type=records')
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json()
        
        if (achievementsData?.achievements && Array.isArray(achievementsData.achievements)) {
          const processedAchievements = achievementsData.achievements.map((achievement: any) => ({
            id: achievement.id,
            title: achievement.title,
            description: achievement.description || '',
            icon: achievement.icon || '🏆',
            tier: achievement.tier || 'bronze',
            unlocked: achievement.unlocked || false,
            progress: achievement.current_value || 0,
            target: achievement.target_value || 100,
            category: achievement.category || '일반'
          }))
          
          setAchievements(processedAchievements)
        }
      }

    } catch (error) {
      console.error('데이터 로드 실패:', error)
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'views': return '👁️'
      case 'subscribers': return '👥'
      case 'engagement': return '❤️'
      case 'content': return '🎬'
      case 'revenue': return '💰'
      default: return '🎯'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-orange-400 to-orange-600'
      case 'silver': return 'from-gray-400 to-gray-600'
      case 'gold': return 'from-yellow-400 to-yellow-600'
      case 'platinum': return 'from-purple-400 to-purple-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateTeamStats = () => {
    if (teamMembers.length === 0) return { totalXP: 0, averageLevel: 0, onlineCount: 0, totalTasks: 0 }
    
    const totalXP = teamMembers.reduce((sum, member) => sum + member.xp, 0)
    const averageLevel = teamMembers.reduce((sum, member) => sum + member.level, 0) / teamMembers.length
    const onlineCount = teamMembers.filter(member => member.isOnline).length
    const totalTasks = teamMembers.reduce((sum, member) => sum + member.weeklyGoals.completed, 0)
    
    return { totalXP, averageLevel, onlineCount, totalTasks }
  }

  const teamStats = calculateTeamStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">웃소 팀 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-red-500 mb-4">
            <Trophy className="h-16 w-16 mx-auto opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">데이터 로드 실패</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* 헤더 */}
      <div className="bg-white shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  🎯 웃소 팀 진행률
                </h1>
                <p className="text-gray-600">게임화된 성과 트래킹 대시보드</p>
              </div>
            </div>
            
            {/* 실시간 통계 */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{teamMembers.length}</div>
                <div className="text-xs text-gray-500">총 팀원</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{teamStats.onlineCount}</div>
                <div className="text-xs text-gray-500">온라인</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round(teamStats.averageLevel)}</div>
                <div className="text-xs text-gray-500">평균 레벨</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="border-b border-orange-200 bg-white rounded-t-xl">
            <nav className="-mb-px flex space-x-8 px-6 py-4">
              <button
                onClick={() => setSelectedTab('overview')}
                className={`py-2 px-4 border-b-2 font-medium text-sm rounded-lg transition-all ${
                  selectedTab === 'overview'
                    ? 'border-red-500 text-red-600 bg-red-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-5 h-5 inline mr-2" />
                오버뷰
              </button>
              <button
                onClick={() => setSelectedTab('members')}
                className={`py-2 px-4 border-b-2 font-medium text-sm rounded-lg transition-all ${
                  selectedTab === 'members'
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                팀원 현황
              </button>
              <button
                onClick={() => setSelectedTab('goals')}
                className={`py-2 px-4 border-b-2 font-medium text-sm rounded-lg transition-all ${
                  selectedTab === 'goals'
                    ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Target className="w-5 h-5 inline mr-2" />
                팀 목표
              </button>
              <button
                onClick={() => setSelectedTab('achievements')}
                className={`py-2 px-4 border-b-2 font-medium text-sm rounded-lg transition-all ${
                  selectedTab === 'achievements'
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Trophy className="w-5 h-5 inline mr-2" />
                업적
              </button>
            </nav>
          </div>
        </div>

        {/* 오버뷰 탭 */}
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* 팀 성과 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">총 경험치</p>
                    <p className="text-3xl font-bold">{formatNumber(teamStats.totalXP)}</p>
                    <p className="text-red-100 text-xs mt-1">XP</p>
                  </div>
                  <Zap className="h-10 w-10 text-red-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">완료된 작업</p>
                    <p className="text-3xl font-bold">{teamStats.totalTasks}</p>
                    <p className="text-orange-100 text-xs mt-1">개</p>
                  </div>
                  <Medal className="h-10 w-10 text-orange-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">평균 레벨</p>
                    <p className="text-3xl font-bold">{Math.round(teamStats.averageLevel)}</p>
                    <p className="text-yellow-100 text-xs mt-1">Level</p>
                  </div>
                  <Crown className="h-10 w-10 text-yellow-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">온라인 팀원</p>
                    <p className="text-3xl font-bold">{teamStats.onlineCount}</p>
                    <p className="text-green-100 text-xs mt-1">/ {teamMembers.length}명</p>
                  </div>
                  <Users className="h-10 w-10 text-green-200" />
                </div>
              </div>
            </div>

            {/* 최근 업적 및 목표 현황 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 최근 달성 업적 */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Trophy className="h-6 w-6 text-purple-500 mr-2" />
                    최근 달성 업적
                  </h3>
                  <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                    {achievements.filter(a => a.unlocked).length}개 달성
                  </div>
                </div>
                
                <div className="space-y-4">
                  {achievements.filter(a => a.unlocked).slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className={`p-4 rounded-lg bg-gradient-to-r ${getTierColor(achievement.tier)} text-white`}>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-bold">{achievement.title}</h4>
                          <p className="text-sm opacity-90">{achievement.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-medium">
                            {achievement.tier.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {achievements.filter(a => a.unlocked).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>아직 달성한 업적이 없습니다</p>
                      <p className="text-sm">열심히 활동해서 첫 업적을 달성해보세요!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 진행 중인 목표 */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Target className="h-6 w-6 text-blue-500 mr-2" />
                    진행 중인 목표
                  </h3>
                  <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    {teamGoals.length}개 진행
                  </div>
                </div>
                
                <div className="space-y-4">
                  {teamGoals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{goal.icon}</span>
                          <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                        </div>
                        <span className="text-sm text-gray-500">
                          {Math.round((goal.progress / goal.target) * 100)}%
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (goal.progress / goal.target) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{formatNumber(goal.progress)} / {formatNumber(goal.target)}</span>
                        <span>{goal.deadline}</span>
                      </div>
                    </div>
                  ))}
                  
                  {teamGoals.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>진행 중인 팀 목표가 없습니다</p>
                      <p className="text-sm">관리자 페이지에서 새 목표를 추가해보세요!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 팀원 현황 탭 */}
        {selectedTab === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-200">
                {/* 팀원 헤더 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                        {member.avatar}
                      </div>
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                    {member.status === 'active' ? '활성' : member.status === 'warning' ? '주의' : '비활성'}
                  </div>
                </div>

                {/* 레벨 및 XP */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">레벨 {member.level}</span>
                    <span className="text-sm text-gray-500">{member.xp} / {member.maxXp} XP</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(member.xp / member.maxXp) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* 주간 목표 진행률 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">주간 작업</span>
                    <span className="text-sm text-gray-500">
                      {member.weeklyGoals.completed} / {member.weeklyGoals.total}
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (member.weeklyGoals.completed / member.weeklyGoals.total) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* 성과 지표 */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <PlayCircle className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                    <div className="text-xs font-medium text-blue-700">{member.stats.videosCreated}</div>
                    <div className="text-xs text-blue-500">영상</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2">
                    <Eye className="h-4 w-4 text-red-500 mx-auto mb-1" />
                    <div className="text-xs font-medium text-red-700">{formatNumber(member.stats.viewsGenerated)}</div>
                    <div className="text-xs text-red-500">조회수</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2">
                    <Heart className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                    <div className="text-xs font-medium text-purple-700">{member.stats.engagementRate}%</div>
                    <div className="text-xs text-purple-500">참여율</div>
                  </div>
                </div>

                {/* 업적 배지 */}
                {member.achievements.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">최근 업적</p>
                    <div className="flex flex-wrap gap-1">
                      {member.achievements.slice(0, 3).map((achievement, index) => (
                        <span key={index} className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                          🏆
                        </span>
                      ))}
                      {member.achievements.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          +{member.achievements.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {teamMembers.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">팀원이 없습니다</h3>
                <p className="text-gray-500">관리자 페이지에서 팀원을 추가해주세요.</p>
              </div>
            )}
          </div>
        )}

        {/* 팀 목표 탭 */}
        {selectedTab === 'goals' && (
          <div className="space-y-6">
            {teamGoals.map((goal) => (
              <div key={goal.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl">
                      {goal.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{goal.title}</h3>
                      <p className="text-gray-600">{goal.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {goal.category}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {goal.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {Math.round((goal.progress / goal.target) * 100)}%
                    </div>
                    <p className="text-sm text-gray-500">완료율</p>
                  </div>
                </div>

                {/* 진행률 바 */}
                <div className="mb-4">
                  <div className="bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500 relative"
                      style={{ width: `${Math.min(100, (goal.progress / goal.target) * 100)}%` }}
                    >
                      {goal.progress >= goal.target && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Crown className="h-3 w-3 text-yellow-700" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{formatNumber(goal.progress)}</span> / {formatNumber(goal.target)}
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-600">보상: {goal.reward}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {teamGoals.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">설정된 팀 목표가 없습니다</h3>
                <p className="text-gray-500">관리자 페이지에서 새로운 팀 목표를 추가해주세요.</p>
              </div>
            )}
          </div>
        )}

        {/* 업적 탭 */}
        {selectedTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`rounded-xl shadow-lg p-6 border transition-all duration-200 ${
                achievement.unlocked 
                  ? `bg-gradient-to-br ${getTierColor(achievement.tier)} text-white shadow-xl` 
                  : 'bg-white border-gray-200 hover:shadow-xl'
              }`}>
                <div className="text-center">
                  <div className={`text-4xl mb-4 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  
                  <h3 className={`text-lg font-bold mb-2 ${achievement.unlocked ? 'text-white' : 'text-gray-900'}`}>
                    {achievement.title}
                  </h3>
                  
                  <p className={`text-sm mb-4 ${achievement.unlocked ? 'text-white opacity-90' : 'text-gray-600'}`}>
                    {achievement.description}
                  </p>

                  {!achievement.unlocked && (
                    <div className="mb-4">
                      <div className="bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {achievement.progress} / {achievement.target}
                      </p>
                    </div>
                  )}

                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    achievement.unlocked
                      ? 'bg-white bg-opacity-20 text-white'
                      : `bg-gradient-to-r ${getTierColor(achievement.tier)} text-white`
                  }`}>
                    {achievement.tier.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
            
            {achievements.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">업적이 없습니다</h3>
                <p className="text-gray-500">관리자 페이지에서 업적을 추가해주세요.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 