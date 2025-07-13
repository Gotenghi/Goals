'use client'

import { Settings, Target, Trophy, Edit3, Save, Plus, Trash2, Users, Database, AlertCircle, CheckCircle, RefreshCw, Sparkles, Zap, PlayCircle, TrendingUp, Award, Star, ChevronUp, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

interface Goal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  color: string
  iconType: string
  category: string
  description: string
  deadline: string
  expanded: boolean
  sort_order: number
}

interface GoalSection {
  id: string
  title: string
  description: string
  is_active: boolean
  order: number
  goals: Goal[]
}

interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  status: string
  level: number
  xp: number
  weekly_goals_completed: number
  weekly_goals_total: number
  videos_created?: number
  views_generated?: number
  engagement_rate?: number
}

interface Achievement {
  id: string
  achievement_id?: string // 업적 텍스트 ID
  title: string
  description: string
  icon: string
  category?: string
  target_value?: number // optional로 변경하여 undefined 허용
  tier: string
  is_active?: boolean
  row?: number // 정렬 순서
  // 업적 달성 기록 관련 필드 추가
  unlocked?: boolean
  current_value?: number
  unlocked_at?: string | null
  record_id?: string | null
}

interface PresetGoal {
  title: string
  target: number
  unit: string
  color: string
  iconType: string
  category: string
  description: string
}

interface PresetAchievement {
  title: string
  description: string
  icon: string
  category: string
  target_value: number
  tier: string
}

interface PresetTask {
  title: string
  category: string
  priority: 'high' | 'medium' | 'low'
  description: string
}

// 웃소 전용 프리셋 데이터
const YOUTUBE_GOAL_PRESETS: { [key: string]: PresetGoal[] } = {
  '조회수 목표': [
    { title: '일일 조회수 150만', target: 1500000, unit: '회', color: 'from-red-500 to-red-600', iconType: 'eye', category: '조회수', description: '하루 평균 조회수 150만 회 달성' },
    { title: '주간 조회수 1000만', target: 10000000, unit: '회', color: 'from-red-500 to-red-600', iconType: 'eye', category: '조회수', description: '주간 총 조회수 1000만 회 달성' },
    { title: '월간 조회수 5000만', target: 50000000, unit: '회', color: 'from-red-500 to-red-600', iconType: 'eye', category: '조회수', description: '월간 총 조회수 5000만 회 달성' },
    { title: '분기 조회수 1억 5천만', target: 150000000, unit: '회', color: 'from-red-600 to-red-700', iconType: 'eye', category: '조회수', description: '분기 총 조회수 1억 5천만 회 달성' },
  ],
  '구독자 성장': [
    { title: '200만 구독자 달성', target: 2000000, unit: '명', color: 'from-orange-500 to-orange-600', iconType: 'users', category: '구독자', description: '총 구독자 200만 명 달성' },
    { title: '월간 구독자 10만 증가', target: 100000, unit: '명', color: 'from-orange-500 to-orange-600', iconType: 'users', category: '구독자', description: '한 달 동안 구독자 10만 명 순증' },
    { title: '주간 구독자 2만 증가', target: 20000, unit: '명', color: 'from-orange-400 to-orange-500', iconType: 'users', category: '구독자', description: '일주일 동안 구독자 2만 명 순증' },
    { title: '일일 구독자 3천 증가', target: 3000, unit: '명', color: 'from-orange-400 to-orange-500', iconType: 'users', category: '구독자', description: '하루 평균 구독자 3천 명 순증' },
  ],
  '콘텐츠 제작': [
    { title: '일일 발행량 25개', target: 25, unit: '개', color: 'from-blue-500 to-blue-600', iconType: 'play', category: '콘텐츠', description: '하루 평균 25개 콘텐츠 발행' },
    { title: '주간 숏폼 100개', target: 100, unit: '개', color: 'from-blue-500 to-blue-600', iconType: 'play', category: '콘텐츠', description: '일주일 동안 숏폼 100개 제작' },
    { title: '월간 롱폼 30개', target: 30, unit: '개', color: 'from-blue-600 to-blue-700', iconType: 'play', category: '콘텐츠', description: '한 달 동안 롱폼 영상 30개 제작' },
    { title: '분기 총 콘텐츠 2000개', target: 2000, unit: '개', color: 'from-blue-600 to-blue-700', iconType: 'play', category: '콘텐츠', description: '분기 총 2000개 콘텐츠 제작' },
  ],
  '수익 목표': [
    { title: '애드센스 월 2.2억', target: 220000000, unit: '원', color: 'from-green-500 to-green-600', iconType: 'dollar', category: '수익', description: '애드센스 월간 수익 2억 2천만원' },
    { title: '광고 수익 월 2500만', target: 25000000, unit: '원', color: 'from-green-500 to-green-600', iconType: 'dollar', category: '수익', description: '광고 협찬 월간 수익 2500만원' },
    { title: '인세 수익 월 2700만', target: 27000000, unit: '원', color: 'from-green-600 to-green-700', iconType: 'dollar', category: '수익', description: '책 인세 월간 수익 2700만원' },
    { title: '상품 판매 월 1700만', target: 17000000, unit: '원', color: 'from-green-400 to-green-500', iconType: 'dollar', category: '수익', description: '굿즈 및 상품 월간 판매액 1700만원' },
  ],
  '상호작용 목표': [
    { title: '일일 좋아요 50만', target: 500000, unit: '개', color: 'from-pink-500 to-pink-600', iconType: 'star', category: '상호작용', description: '하루 평균 좋아요 50만 개' },
    { title: '주간 댓글 10만', target: 100000, unit: '개', color: 'from-pink-500 to-pink-600', iconType: 'star', category: '상호작용', description: '일주일 총 댓글 10만 개' },
    { title: '월간 공유 20만', target: 200000, unit: '개', color: 'from-pink-400 to-pink-500', iconType: 'star', category: '상호작용', description: '한 달 총 공유 20만 번' },
    { title: '커뮤니티 활성도 90%', target: 90, unit: '%', color: 'from-pink-600 to-pink-700', iconType: 'star', category: '상호작용', description: '커뮤니티 참여도 90% 유지' },
  ],
  '품질 지표': [
    { title: '평균 시청시간 8분', target: 8, unit: '분', color: 'from-purple-500 to-purple-600', iconType: 'target', category: '품질', description: '영상 평균 시청시간 8분 달성' },
    { title: '완주율 75%', target: 75, unit: '%', color: 'from-purple-500 to-purple-600', iconType: 'target', category: '품질', description: '영상 완주율 75% 달성' },
    { title: 'CTR 12%', target: 12, unit: '%', color: 'from-purple-400 to-purple-500', iconType: 'target', category: '품질', description: '썸네일 클릭률 12% 달성' },
    { title: '구독 전환율 8%', target: 8, unit: '%', color: 'from-purple-600 to-purple-700', iconType: 'target', category: '품질', description: '시청자 구독 전환율 8% 달성' },
  ]
}

const YOUTUBE_ACHIEVEMENT_PRESETS: { [key: string]: PresetAchievement[] } = {
  '조회수 마일스톤': [
    { title: '첫 100만 조회', description: '첫 번째 영상이 100만 조회수를 달성했습니다!', icon: '🎯', category: '조회수', target_value: 1000000, tier: 'bronze' },
    { title: '1000만 조회 마스터', description: '단일 영상으로 1000만 조회수를 달성했습니다!', icon: '🔥', category: '조회수', target_value: 10000000, tier: 'silver' },
    { title: '1억 조회 레전드', description: '단일 영상으로 1억 조회수를 달성했습니다!', icon: '💎', category: '조회수', target_value: 100000000, tier: 'gold' },
    { title: '10억 조회 신화', description: '누적 조회수 10억을 달성했습니다!', icon: '👑', category: '조회수', target_value: 1000000000, tier: 'platinum' },
  ],
  '구독자 달성': [
    { title: '10만 구독자 실버버튼', description: '구독자 10만 명을 달성하여 실버버튼을 획득했습니다!', icon: '🥈', category: '구독자', target_value: 100000, tier: 'silver' },
    { title: '100만 구독자 골드버튼', description: '구독자 100만 명을 달성하여 골드버튼을 획득했습니다!', icon: '🥇', category: '구독자', target_value: 1000000, tier: 'gold' },
    { title: '1000만 구독자 다이아몬드', description: '구독자 1000만 명을 달성하여 다이아몬드버튼을 획득했습니다!', icon: '💎', category: '구독자', target_value: 10000000, tier: 'platinum' },
    { title: '200만 구독자 달성', description: '목표했던 200만 구독자를 달성했습니다!', icon: '🎉', category: '구독자', target_value: 2000000, tier: 'gold' },
  ],
  '콘텐츠 제작': [
    { title: '첫 영상 업로드', description: '첫 번째 영상을 성공적으로 업로드했습니다!', icon: '🎬', category: '콘텐츠', target_value: 1, tier: 'bronze' },
    { title: '100개 영상 제작', description: '총 100개의 영상을 제작했습니다!', icon: '📹', category: '콘텐츠', target_value: 100, tier: 'bronze' },
    { title: '500개 영상 크리에이터', description: '총 500개의 영상을 제작한 진정한 크리에이터입니다!', icon: '🎭', category: '콘텐츠', target_value: 500, tier: 'silver' },
    { title: '1000개 영상 마스터', description: '총 1000개의 영상을 제작한 콘텐츠 마스터입니다!', icon: '🏆', category: '콘텐츠', target_value: 1000, tier: 'gold' },
  ],
  '수익 달성': [
    { title: '첫 수익 발생', description: '첫 번째 수익이 발생했습니다!', icon: '💰', category: '수익', target_value: 1000, tier: 'bronze' },
    { title: '월 100만원 달성', description: '월간 수익 100만원을 달성했습니다!', icon: '💵', category: '수익', target_value: 1000000, tier: 'bronze' },
    { title: '월 1000만원 달성', description: '월간 수익 1000만원을 달성했습니다!', icon: '💳', category: '수익', target_value: 10000000, tier: 'silver' },
    { title: '월 1억원 달성', description: '월간 수익 1억원을 달성한 최고 수익 크리에이터입니다!', icon: '🏦', category: '수익', target_value: 100000000, tier: 'gold' },
  ],
  '특별 업적': [
    { title: '급상승 동영상', description: '급상승 동영상 목록에 진입했습니다!', icon: '🚀', category: '특별', target_value: 1, tier: 'silver' },
    { title: '트렌딩 1위', description: '트렌딩 1위를 달성했습니다!', icon: '👑', category: '특별', target_value: 1, tier: 'gold' },
    { title: '완주율 90% 달성', description: '영상 완주율 90%를 달성했습니다!', icon: '⭐', category: '특별', target_value: 90, tier: 'silver' },
    { title: '연속 업로드 30일', description: '30일 연속으로 영상을 업로드했습니다!', icon: '🔥', category: '특별', target_value: 30, tier: 'bronze' },
  ]
}

const YOUTUBE_TASK_PRESETS: { [key: string]: PresetTask[] } = {
  '콘텐츠 기획': [
    { title: '주간 트렌드 분석', category: '기획', priority: 'high', description: '이번 주 유튜브 트렌드와 키워드 분석' },
    { title: '콘텐츠 아이디어 10개 발굴', category: '기획', priority: 'high', description: '새로운 콘텐츠 아이디어 10개 발굴 및 검증' },
    { title: '시청자 피드백 분석', category: '기획', priority: 'medium', description: '댓글과 피드백을 분석하여 개선점 도출' },
    { title: '경쟁 채널 분석', category: '기획', priority: 'medium', description: '동일 카테고리 인기 채널 분석 및 벤치마킹' },
    { title: '키워드 리서치', category: '기획', priority: 'high', description: 'SEO 최적화를 위한 키워드 리서치' },
  ],
  '영상 제작': [
    { title: '롱폼 영상 촬영', category: '제작', priority: 'high', description: '메인 채널용 롱폼 영상 촬영' },
    { title: '숏폼 5개 제작', category: '제작', priority: 'high', description: '일일 숏폼 5개 제작 및 업로드' },
    { title: '썸네일 디자인 제작', category: '제작', priority: 'high', description: '클릭률 높은 썸네일 디자인 제작' },
    { title: '영상 편집 및 후보정', category: '제작', priority: 'high', description: '촬영한 영상의 편집 및 후보정 작업' },
    { title: '자막 및 캡션 추가', category: '제작', priority: 'medium', description: '접근성 향상을 위한 자막 및 캡션 추가' },
  ],
  '마케팅 & 홍보': [
    { title: 'SEO 최적화', category: '마케팅', priority: 'high', description: '제목, 설명, 태그 SEO 최적화' },
    { title: 'SNS 홍보 포스팅', category: '마케팅', priority: 'medium', description: '인스타그램, 틱톡 등 SNS 홍보' },
    { title: '커뮤니티 탭 관리', category: '마케팅', priority: 'medium', description: '유튜브 커뮤니티 탭 콘텐츠 업로드' },
    { title: '댓글 및 소통 관리', category: '마케팅', priority: 'high', description: '시청자와의 소통 및 댓글 관리' },
    { title: '협업 및 콜라보 기획', category: '마케팅', priority: 'low', description: '다른 크리에이터와의 협업 기획' },
  ],
  '데이터 분석': [
    { title: '유튜브 애널리틱스 분석', category: '분석', priority: 'high', description: '채널 성과 데이터 분석 및 리포트 작성' },
    { title: '시청자 행동 패턴 분석', category: '분석', priority: 'medium', description: '시청자 행동 패턴 및 선호도 분석' },
    { title: '수익 분석 및 최적화', category: '분석', priority: 'high', description: '수익 구조 분석 및 최적화 방안 도출' },
    { title: '경쟁사 성과 분석', category: '분석', priority: 'low', description: '경쟁 채널의 성과 및 전략 분석' },
    { title: '트렌드 예측 분석', category: '분석', priority: 'medium', description: '다음 주/월 트렌드 예측 및 대응책 수립' },
  ]
}

export default function AdminPage() {
  const [goalSections, setGoalSections] = useState<GoalSection[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activeTab, setActiveTab] = useState<'database' | 'goals' | 'team' | 'achievements' | 'presets'>('database')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 프리셋 관련 상태
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<'goals' | 'achievements' | 'tasks'>('goals')
  const [applyingPreset, setApplyingPreset] = useState(false)

  // 데이터베이스 상태
  const [dbStatus, setDbStatus] = useState<{[key: string]: boolean}>({})
  const [dbLoading, setDbLoading] = useState(false)
  const [allTablesExist, setAllTablesExist] = useState(false)

  // 한글 입력 IME 처리를 위한 상태
  const [isComposing, setIsComposing] = useState(false)
  
  // Debounce를 위한 타이머 참조
  const debounceTimers = useRef<{[key: string]: NodeJS.Timeout}>({})

  // 편집 상태 관리
  const [editingSections, setEditingSections] = useState<{[key: string]: { title: boolean, description: boolean }}>({})
  const [tempValues, setTempValues] = useState<{[key: string]: { title: string, description: string }}>({})

  const [achievementEditStates, setAchievementEditStates] = useState<{ [key: string]: boolean }>({})
  const [achievementTempValues, setAchievementTempValues] = useState<{ [key: string]: Achievement }>({})

  const [teamMemberEditStates, setTeamMemberEditStates] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  useEffect(() => {
    if (allTablesExist) {
      loadAllData()
    }
  }, [allTablesExist])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => {
        if (timer) clearTimeout(timer)
      })
    }
  }, [])

  const checkDatabaseStatus = async () => {
    setDbLoading(true)
    try {
      const tables = [
        'goal_sections', 
        'goals', 
        'sub_goals',
        'team_members', 
        'team_goals',
        'achievement_definitions',
        'achievement_records'
      ]
      const status: {[key: string]: boolean} = {}
      
      for (const table of tables) {
        try {
          const response = await fetch(`/api/setup?table=${table}`)
          const data = await response.json()
          status[table] = data.exists
        } catch (error) {
          console.error(`${table} 확인 실패:`, error)
          status[table] = false
        }
      }
      
      setDbStatus(status)
      setAllTablesExist(Object.values(status).every(exists => exists))
    } catch (error) {
      console.error('데이터베이스 상태 확인 실패:', error)
      setError('데이터베이스 상태를 확인할 수 없습니다.')
    } finally {
      setDbLoading(false)
      setLoading(false)
    }
  }

  const initializeDatabase = async () => {
    setDbLoading(true)
    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        alert('데이터베이스가 성공적으로 초기화되었습니다!')
        await checkDatabaseStatus()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || '데이터베이스 초기화 실패')
      }
    } catch (error: any) {
      console.error('데이터베이스 초기화 오류:', error)
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      alert(`데이터베이스 초기화 중 오류가 발생했습니다: ${errorMessage}`)
    } finally {
      setDbLoading(false)
    }
  }

  const loadAllData = async () => {
    setLoading(true)
    try {
      // 섹션과 목표 데이터 통합 로드
      const response = await fetch('/api/goals')
      if (response.ok) {
        const data = await response.json()
        const sections = data.sections?.map((section: any) => ({
          id: section.id,
          title: section.title,
          description: section.description || '',
          is_active: section.is_active || true,
          order: section.order || 0,
          goals: section.goals?.map((goal: any) => ({
            id: goal.id,
            title: goal.title,
            target: goal.target,
            current: goal.current,
            unit: goal.unit,
            color: goal.color,
            category: goal.category,
            description: goal.description,
            deadline: goal.deadline,
            expanded: goal.expanded || false,
            sort_order: goal.sort_order || 0
          })).sort((a: Goal, b: Goal) => a.sort_order - b.sort_order) || []
        })).sort((a: GoalSection, b: GoalSection) => a.order - b.order) || []
        
        setGoalSections(sections)
      }

      // 팀 멤버 데이터 로드
      const teamResponse = await fetch('/api/team')
      if (teamResponse.ok) {
        const teamData = await teamResponse.json()
        setTeamMembers(teamData.teamMembers || [])
      }

      // 업적 데이터 로드 (정의 + 달성 기록 통합)
      const achievementsResponse = await fetch('/api/achievements')
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json()
        // 업적 정의 처리 (기록은 기본값으로)
        const processedAchievements = achievementsData.achievements?.map((achievement: any) => ({
          ...achievement,
          achievement_id: achievement.achievement_id, // 텍스트 ID 포함
          unlocked: achievement.unlocked || false,
          current_value: achievement.current_value || 0,
          unlocked_at: achievement.unlocked_at || null,
          record_id: achievement.record_id || null
        })) || []
        setAchievements(processedAchievements)
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error)
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 프리셋 적용 함수들
  const applyGoalPresets = async (categoryName: string) => {
    if (!YOUTUBE_GOAL_PRESETS[categoryName]) return

    setApplyingPreset(true)
    try {
      // 새 섹션 생성
      const sectionResponse = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'section',
          data: {
            title: `🎯 ${categoryName}`,
            description: `웃소 ${categoryName} 프리셋이 적용된 섹션입니다`,
            is_active: true,
            order: goalSections.length + 1
          }
        })
      })

      if (!sectionResponse.ok) throw new Error('섹션 생성 실패')
      
      const sectionResult = await sectionResponse.json()
      const sectionId = sectionResult.section.id

      // 프리셋 목표들 추가
      const goals = YOUTUBE_GOAL_PRESETS[categoryName]
      for (let i = 0; i < goals.length; i++) {
        const goal = goals[i]
        await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'goal',
            data: {
              ...goal,
              section_id: sectionId,
              icon_type: goal.iconType,
              deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3개월 후
              expanded: false,
              sort_order: i,
              current: 0
            }
          })
        })
      }

      await loadAllData()
      alert(`${categoryName} 프리셋이 성공적으로 적용되었습니다!`)
    } catch (error) {
      console.error('프리셋 적용 오류:', error)
      alert('프리셋 적용 중 오류가 발생했습니다.')
    } finally {
      setApplyingPreset(false)
    }
  }

  const applyAchievementPresets = async (categoryName: string) => {
    if (!YOUTUBE_ACHIEVEMENT_PRESETS[categoryName]) return

    setApplyingPreset(true)
    try {
      const achievementsToAdd = YOUTUBE_ACHIEVEMENT_PRESETS[categoryName]
      // 현재 최대 row 값 구하기
      const maxRow = Math.max(...achievements.map(a => a.row || 0), 0)
      
      for (let i = 0; i < achievementsToAdd.length; i++) {
        const achievement = achievementsToAdd[i]
        const newId = crypto.randomUUID()
        const response = await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'achievement_definition',
            data: {
              id: newId,
              achievement_id: `${achievement.category.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // 고유한 텍스트 ID
              title: achievement.title,
              description: achievement.description,
              icon: achievement.icon,
              target_value: achievement.target_value,
              tier: achievement.tier,
              row: maxRow + i + 1 // 순차적으로 row 값 할당
            }
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('업적 생성 실패:', errorData)
          throw new Error(`업적 ${achievement.title} 생성 실패: ${errorData.error || '알 수 없는 오류'}`)
        }
      }

      await loadAllData()
      alert(`${categoryName} 업적 프리셋이 성공적으로 적용되었습니다!`)
    } catch (error) {
      console.error('업적 프리셋 적용 오류:', error)
      alert(`업적 프리셋 적용 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setApplyingPreset(false)
    }
  }

  // 기존 함수들 (공간 절약을 위해 주요 부분만 표시)
  const addSection = async () => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'section',
          data: {
            title: '새 섹션',
            description: '새로운 목표 섹션입니다',
            is_active: true,
            order: goalSections.length + 1
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        const newSection: GoalSection = {
          ...result.section,
          goals: []
        }
        setGoalSections([...goalSections, newSection])
      } else {
        const errorData = await response.json()
        console.error('API 오류:', errorData)
        throw new Error('섹션 추가 실패')
      }
    } catch (error) {
      console.error('섹션 추가 오류:', error)
      alert('섹션 추가 중 오류가 발생했습니다.')
    }
  }

  const updateSection = async (sectionId: string, field: string, value: string | boolean) => {
    try {
      setGoalSections(prev => prev.map(section => 
        section.id === sectionId ? { ...section, [field]: value } : section
      ))

      const section = goalSections.find(s => s.id === sectionId)
      if (!section) return

      const updatedSection = { ...section, [field]: value }

      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'section',
          id: sectionId,
          data: updatedSection
        })
      })

      if (!response.ok) {
        // API 실패 시 로컬 상태 되돌리기
        setGoalSections(prev => prev.map(s => 
          s.id === sectionId ? section : s
        ))
        throw new Error('섹션 업데이트 실패')
      }
    } catch (error) {
      console.error('섹션 업데이트 오류:', error)
    }
  }

  const deleteSection = async (sectionId: string) => {
    if (!confirm('정말로 이 섹션과 모든 목표를 삭제하시겠습니까?')) return

    try {
      const response = await fetch('/api/goals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'section',
          id: sectionId
        })
      })

      if (response.ok) {
        setGoalSections(goalSections.filter(s => s.id !== sectionId))
      } else {
        throw new Error('섹션 삭제 실패')
      }
    } catch (error) {
      console.error('섹션 삭제 오류:', error)
      alert('섹션 삭제 중 오류가 발생했습니다.')
    }
  }

  const updateGoal = async (sectionId: string, goalId: string, field: string, value: string | number) => {
    try {
      // 로컬 상태 즉시 업데이트
      setGoalSections(prev => prev.map(section => 
        section.id === sectionId
          ? {
              ...section,
              goals: section.goals.map(goal => 
                goal.id === goalId ? { ...goal, [field]: value } : goal
              )
            }
          : section
      ))

      // 한글 입력 중일 때는 API 호출 지연
      if (isComposing && typeof value === 'string') {
        return
      }

      // 이전 타이머 취소
      const timerKey = `goal-${goalId}-${field}`
      if (debounceTimers.current[timerKey]) {
        clearTimeout(debounceTimers.current[timerKey])
      }

      // 새 타이머 설정 (500ms 지연)
      debounceTimers.current[timerKey] = setTimeout(async () => {
        const section = goalSections.find(s => s.id === sectionId)
        const goal = section?.goals.find(g => g.id === goalId)
        if (!goal) return

        const updatedGoal = { ...goal, [field]: value }
        
        const response = await fetch('/api/goals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'goal',
            id: goalId,
            data: {
              ...updatedGoal,
              icon_type: updatedGoal.iconType,
              section_id: sectionId
            }
          })
        })

        if (!response.ok) {
          // API 실패 시 로컬 상태 되돌리기
          setGoalSections(prev => prev.map(s => 
            s.id === sectionId
              ? {
                  ...s,
                  goals: s.goals.map(g => 
                    g.id === goalId ? goal : g
                  )
                }
              : s
          ))
          throw new Error('목표 업데이트 실패')
        }
      }, 500)

    } catch (error) {
      console.error('목표 업데이트 오류:', error)
    }
  }

  const addGoal = async (sectionId: string) => {
    try {
      const section = goalSections.find(s => s.id === sectionId)
      if (!section) return

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'goal',
          data: {
            title: '새 목표',
            target: 100,
            current: 0,
            unit: '개',
            color: 'bg-blue-500',
            icon_type: 'target',
            category: '일반',
            description: '새로운 목표입니다.',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            expanded: false,
            sort_order: section.goals.length,
            section_id: sectionId
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        const newGoal: Goal = {
          ...result.goal,
          iconType: result.goal.icon_type
        }
        setGoalSections(prev => prev.map(s => 
          s.id === sectionId 
            ? { ...s, goals: [...s.goals, newGoal] }
            : s
        ))
      } else {
        const errorData = await response.json()
        console.error('API 오류:', errorData)
        throw new Error('목표 추가 실패')
      }
    } catch (error) {
      console.error('목표 추가 오류:', error)
      alert('목표 추가 중 오류가 발생했습니다.')
    }
  }

  const deleteGoal = async (sectionId: string, goalId: string) => {
    if (!confirm('정말로 이 목표를 삭제하시겠습니까?')) return

    try {
      const response = await fetch('/api/goals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'goal',
          id: goalId
        })
      })

      if (response.ok) {
        setGoalSections(prev => prev.map(section => 
          section.id === sectionId 
            ? { ...section, goals: section.goals.filter(g => g.id !== goalId) }
            : section
        ))
      } else {
        throw new Error('목표 삭제 실패')
      }
    } catch (error) {
      console.error('목표 삭제 오류:', error)
      alert('목표 삭제 중 오류가 발생했습니다.')
    }
  }

  const updateTeamMember = async (memberId: string, field: string, value: string | number) => {
    try {
      // 로컬 상태 즉시 업데이트 (자동 저장 비활성화)
      setTeamMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { ...member, [field]: value }
          : member
      ))

      // 자동 저장 완전 비활성화 - UI만 업데이트
      // 저장 버튼을 통해서만 저장하도록 변경

    } catch (error) {
      console.error('팀원 업데이트 오류:', error)
    }
  }

  const saveTeamMember = async (memberId: string) => {
    try {
      const member = teamMembers.find(m => m.id === memberId)
      if (!member) return

      // 데이터베이스 필드에 맞게 변환 (실제 존재하는 필드만)
      const memberData = {
        id: member.id,
        name: member.name,
        role: member.role,
        avatar: member.avatar,
        status: member.status,
        level: member.level,
        xp: member.xp,
        tasks_completed: member.weekly_goals_completed || 0,
        tasks_total: member.weekly_goals_total || 10
      }

      console.log('💾 저장할 팀원 데이터:', memberData)

      const response = await fetch('/api/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'team_member',
          id: memberId,
          data: memberData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ 팀원 저장 응답 오류:', errorData)
        throw new Error('팀원 저장 실패')
      }

      // 저장 성공 표시
      setTeamMemberEditStates(prev => ({ ...prev, [memberId]: false }))
      alert('팀원 정보가 성공적으로 저장되었습니다!')

    } catch (error) {
      console.error('팀원 저장 오류:', error)
      alert('팀원 정보 저장 중 오류가 발생했습니다.')
    }
  }

  const saveAllTeamMembers = async () => {
    try {
      for (const member of teamMembers) {
        // 데이터베이스 필드에 맞게 변환 (실제 존재하는 필드만)
        const memberData = {
          id: member.id,
          name: member.name,
          role: member.role,
          avatar: member.avatar,
          status: member.status,
          level: member.level,
          xp: member.xp,
          tasks_completed: member.weekly_goals_completed || 0,
          tasks_total: member.weekly_goals_total || 10
        }

        console.log('💾 일괄 저장할 팀원 데이터:', memberData)

        const response = await fetch('/api/team', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'team_member',
            id: member.id,
            data: memberData
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('❌ 팀원 일괄 저장 응답 오류:', errorData)
          throw new Error(`팀원 ${member.name} 저장 실패`)
        }
      }

      // 모든 편집 상태 초기화
      setTeamMemberEditStates({})
      alert('모든 팀원 정보가 성공적으로 저장되었습니다!')

    } catch (error) {
      console.error('팀원 일괄 저장 오류:', error)
      alert('일부 팀원 정보 저장 중 오류가 발생했습니다.')
    }
  }

  const updateAchievement = async (achievementId: string, field: string, value: string | number | boolean) => {
    try {
      // 로컬 상태 즉시 업데이트 (자동 저장 비활성화)
      setAchievements(prev => prev.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, [field]: value }
          : achievement
      ))

      // 자동 저장 완전 비활성화 - UI만 업데이트
      // 저장 버튼을 통해서만 저장하도록 변경

    } catch (error) {
      console.error('업적 업데이트 오류:', error)
    }
  }

  const saveAchievement = async (achievementId: string) => {
    try {
      const achievement = achievements.find(a => a.id === achievementId)
      if (!achievement) return

      // 단일 테이블에 모든 업적 정보 저장 (매우 간단!)
      const response = await fetch('/api/achievements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: achievementId,
          // 업적 정의 필드들
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category || '',
          target_value: achievement.target_value || 0,
          tier: achievement.tier,
          row: achievement.row || 1,
          is_active: achievement.is_active ?? true,
          // 진행 상황 필드들 (같은 테이블에!)
          current_value: achievement.current_value || 0,
          unlocked: achievement.unlocked || false,
          unlocked_at: achievement.unlocked ? (achievement.unlocked_at || new Date().toISOString()) : null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '업적 저장 실패')
      }

      // 저장 성공 표시
      setAchievementEditStates(prev => ({ ...prev, [achievementId]: false }))
      console.log('업적 저장 성공:', achievement.title)

    } catch (error) {
      console.error('업적 저장 오류:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      alert(`업적 저장 중 오류가 발생했습니다: ${errorMessage}`)
    }
  }

  const saveAllAchievements = async () => {
    try {
      let successCount = 0
      let errorCount = 0

      for (const achievement of achievements) {
        try {
          // 단일 테이블에 모든 업적 정보 저장 (매우 간단!)
          const response = await fetch('/api/achievements', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: achievement.id,
              // 업적 정의 필드들
              title: achievement.title,
              description: achievement.description,
              icon: achievement.icon,
              category: achievement.category || '',
              target_value: achievement.target_value || 0,
              tier: achievement.tier,
              row: achievement.row || 1,
              is_active: achievement.is_active ?? true,
              // 진행 상황 필드들 (같은 테이블에!)
              current_value: achievement.current_value || 0,
              unlocked: achievement.unlocked || false,
              unlocked_at: achievement.unlocked ? (achievement.unlocked_at || new Date().toISOString()) : null
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || '업적 저장 실패')
          }

          successCount++
          console.log('업적 저장 성공:', achievement.title)

        } catch (error) {
          console.error(`업적 ${achievement.title} 저장 실패:`, error)
          errorCount++
        }
      }

      // 모든 편집 상태 초기화
      setAchievementEditStates({})
      
      if (errorCount === 0) {
        alert(`모든 업적이 성공적으로 저장되었습니다! (${successCount}개)`)
      } else {
        alert(`저장 완료: 성공 ${successCount}개, 실패 ${errorCount}개`)
      }

    } catch (error) {
      console.error('업적 일괄 저장 오류:', error)
      alert('업적 일괄 저장 중 오류가 발생했습니다.')
    }
  }

  const addTeamMember = async () => {
    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'team_member',
          data: {
            id: crypto.randomUUID(),
            name: '새 팀원',
            role: '팀원',
            avatar: '👤',
            status: 'active',
            level: 1,
            xp: 0,
            weekly_goals_completed: 0,
            weekly_goals_total: 5,
            videos_created: 0,
            views_generated: 0,
            engagement_rate: 0
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        const newMember: TeamMember = result.member
        setTeamMembers([...teamMembers, newMember])
      } else {
        const errorData = await response.json()
        console.error('API 오류:', errorData)
        throw new Error(errorData.error || '팀원 추가 실패')
      }
    } catch (error) {
      console.error('팀원 추가 오류:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      alert('팀원 추가 중 오류가 발생했습니다: ' + errorMessage)
    }
  }

  const deleteTeamMember = async (memberId: string) => {
    if (!confirm('정말로 이 팀원을 삭제하시겠습니까?')) return

    try {
      const response = await fetch('/api/team', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: memberId
        })
      })

      if (response.ok) {
        setTeamMembers(teamMembers.filter(m => m.id !== memberId))
      } else {
        throw new Error('팀원 삭제 실패')
      }
    } catch (error) {
      console.error('팀원 삭제 오류:', error)
      alert('팀원 삭제 중 오류가 발생했습니다.')
    }
  }

  const addAchievement = async () => {
    try {
      const newId = crypto.randomUUID()
      // 새 업적은 마지막 순서에 추가
      const maxRow = Math.max(...achievements.map(a => a.row || 0), 0)
      const newRow = maxRow + 1
      
      const newAchievement: Achievement = {
        id: newId,
        achievement_id: `achievement_${Date.now()}`, // 고유한 텍스트 ID 생성
        title: '새 업적',
        description: '새로운 업적입니다.',
        icon: '🏆',
        category: '일반',
        target_value: 100,
        tier: 'bronze',
        is_active: true,
        row: newRow,
        unlocked: false,
        current_value: 0
      }

      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'achievement_definition',
          data: newAchievement
        })
      })

      if (response.ok) {
        setAchievements([...achievements, newAchievement])
      } else {
        throw new Error('업적 추가 실패')
      }
    } catch (error) {
      console.error('업적 추가 오류:', error)
      alert('업적 추가 중 오류가 발생했습니다.')
    }
  }

  const deleteAchievement = async (achievementId: string) => {
    if (!confirm('정말로 이 업적을 삭제하시겠습니까?')) {
      return
    }

    try {
      // 단일 테이블에서 삭제 (매우 간단!)
      const response = await fetch(`/api/achievements?id=${achievementId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '업적 삭제 실패')
      }

      // 로컬 상태에서 제거
      setAchievements(prev => prev.filter(achievement => achievement.id !== achievementId))
      console.log('업적 삭제 성공')

    } catch (error) {
      console.error('업적 삭제 오류:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      alert(`업적 삭제 중 오류가 발생했습니다: ${errorMessage}`)
    }
  }

  // 업적 순서 변경 함수들
  const moveAchievementUp = async (achievementId: string) => {
    const currentIndex = achievements.findIndex(a => a.id === achievementId)
    if (currentIndex <= 0) return

    const currentAchievement = achievements[currentIndex]
    const previousAchievement = achievements[currentIndex - 1]

    const currentRow = currentAchievement.row || currentIndex + 1
    const previousRow = previousAchievement.row || currentIndex

    try {
      // 두 업적의 row 값을 교체
      await fetch('/api/achievements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'achievement_definition',
          id: currentAchievement.id,
          field: 'row',
          value: previousRow
        })
      })

      await fetch('/api/achievements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'achievement_definition',
          id: previousAchievement.id,
          field: 'row',
          value: currentRow
        })
      })

      // 상태 업데이트
      const newAchievements = [...achievements]
      newAchievements[currentIndex] = { ...currentAchievement, row: previousRow }
      newAchievements[currentIndex - 1] = { ...previousAchievement, row: currentRow }
      
      // row 값으로 다시 정렬
      newAchievements.sort((a, b) => (a.row || 0) - (b.row || 0))
      setAchievements(newAchievements)
      
    } catch (error) {
      console.error('업적 순서 변경 오류:', error)
      alert('업적 순서 변경 중 오류가 발생했습니다.')
    }
  }

  const moveAchievementDown = async (achievementId: string) => {
    const currentIndex = achievements.findIndex(a => a.id === achievementId)
    if (currentIndex >= achievements.length - 1) return

    const currentAchievement = achievements[currentIndex]
    const nextAchievement = achievements[currentIndex + 1]

    const currentRow = currentAchievement.row || currentIndex + 1
    const nextRow = nextAchievement.row || currentIndex + 2

    try {
      // 두 업적의 row 값을 교체
      await fetch('/api/achievements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'achievement_definition',
          id: currentAchievement.id,
          field: 'row',
          value: nextRow
        })
      })

      await fetch('/api/achievements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'achievement_definition',
          id: nextAchievement.id,
          field: 'row',
          value: currentRow
        })
      })

      // 상태 업데이트
      const newAchievements = [...achievements]
      newAchievements[currentIndex] = { ...currentAchievement, row: nextRow }
      newAchievements[currentIndex + 1] = { ...nextAchievement, row: currentRow }
      
      // row 값으로 다시 정렬
      newAchievements.sort((a, b) => (a.row || 0) - (b.row || 0))
      setAchievements(newAchievements)
      
    } catch (error) {
      console.error('업적 순서 변경 오류:', error)
      alert('업적 순서 변경 중 오류가 발생했습니다.')
    }
  }

  // 한글 입력 IME 이벤트 핸들러
  const handleCompositionStart = () => setIsComposing(true)
  const handleCompositionEnd = () => setIsComposing(false)

  // 한글 입력 필드 최적화를 위한 공통 속성 (업데이트)
  const koreanInputProps = {
    autoComplete: "off" as const,
    spellCheck: false,
    lang: "ko",
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd
  }

  if (loading && allTablesExist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">웃소 관리자 설정</h1>
                <p className="text-gray-600">게임화된 성과 트래킹 시스템 관리</p>
              </div>
            </div>
            <Link 
              href="/"
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              대시보드로 돌아가기
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('database')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'database'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Database className="w-5 h-5 inline mr-2" />
                데이터베이스
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'presets'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Sparkles className="w-5 h-5 inline mr-2" />
                웃소 프리셋
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'goals'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Target className="w-5 h-5 inline mr-2" />
                목표 관리
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'team'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                팀 관리
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'achievements'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trophy className="w-5 h-5 inline mr-2" />
                업적 관리
              </button>
            </nav>
          </div>
        </div>

        {/* 웃소 프리셋 탭 */}
        {activeTab === 'presets' && (
          <div className="space-y-8">
            {/* 프리셋 소개 */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-xl">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">🎯 웃소 전용 프리셋</h2>
                  <p className="text-gray-600">유튜브 채널에 최적화된 목표, 업적, 작업을 원클릭으로 적용하세요!</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4 border border-red-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-5 w-5 text-red-500" />
                    <span className="font-semibold text-gray-900">목표 프리셋</span>
                  </div>
                  <p className="text-sm text-gray-600">조회수, 구독자, 콘텐츠 제작 등 다양한 목표 템플릿</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-orange-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Trophy className="h-5 w-5 text-orange-500" />
                    <span className="font-semibold text-gray-900">업적 프리셋</span>
                  </div>
                  <p className="text-sm text-gray-600">마일스톤 달성을 축하하는 게임화된 업적 시스템</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-yellow-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold text-gray-900">작업 프리셋</span>
                  </div>
                  <p className="text-sm text-gray-600">효율적인 콘텐츠 제작을 위한 작업 템플릿</p>
                </div>
              </div>
            </div>

            {/* 프리셋 카테고리 선택 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">프리셋 카테고리</h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedPresetCategory('goals')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedPresetCategory === 'goals'
                        ? 'bg-white text-red-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Target className="w-4 h-4 inline mr-2" />
                    목표
                  </button>
                  <button
                    onClick={() => setSelectedPresetCategory('achievements')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedPresetCategory === 'achievements'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Trophy className="w-4 h-4 inline mr-2" />
                    업적
                  </button>
                  <button
                    onClick={() => setSelectedPresetCategory('tasks')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedPresetCategory === 'tasks'
                        ? 'bg-white text-yellow-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Zap className="w-4 h-4 inline mr-2" />
                    작업
                  </button>
                </div>
              </div>

              {/* 목표 프리셋 */}
              {selectedPresetCategory === 'goals' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(YOUTUBE_GOAL_PRESETS).map(([categoryName, goals]) => (
                    <div key={categoryName} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-lg">
                            <Target className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">{categoryName}</h4>
                        </div>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                          {goals.length}개 목표
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {goals.slice(0, 3).map((goal, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="text-gray-700">{goal.title}</span>
                          </div>
                        ))}
                        {goals.length > 3 && (
                          <div className="text-xs text-gray-500 ml-4">
                            +{goals.length - 3}개 더...
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => applyGoalPresets(categoryName)}
                        disabled={applyingPreset}
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {applyingPreset ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>적용 중...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>프리셋 적용</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 업적 프리셋 */}
              {selectedPresetCategory === 'achievements' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(YOUTUBE_ACHIEVEMENT_PRESETS).map(([categoryName, achievements]) => (
                    <div key={categoryName} className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-lg">
                            <Trophy className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">{categoryName}</h4>
                        </div>
                        <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
                          {achievements.length}개 업적
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {achievements.slice(0, 3).map((achievement, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <span className="text-lg">{achievement.icon}</span>
                            <span className="text-gray-700">{achievement.title}</span>
                          </div>
                        ))}
                        {achievements.length > 3 && (
                          <div className="text-xs text-gray-500 ml-6">
                            +{achievements.length - 3}개 더...
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => applyAchievementPresets(categoryName)}
                        disabled={applyingPreset}
                        className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {applyingPreset ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>적용 중...</span>
                          </>
                        ) : (
                          <>
                            <Award className="w-4 h-4" />
                            <span>업적 적용</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 작업 프리셋 */}
              {selectedPresetCategory === 'tasks' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(YOUTUBE_TASK_PRESETS).map(([categoryName, tasks]) => (
                    <div key={categoryName} className="bg-gradient-to-br from-yellow-50 to-green-50 rounded-xl p-6 border border-yellow-200 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-r from-yellow-500 to-green-500 p-2 rounded-lg">
                            <Zap className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">{categoryName}</h4>
                        </div>
                        <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                          {tasks.length}개 작업
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        {tasks.map((task, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              task.priority === 'high' ? 'bg-red-400' :
                              task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                            }`}></div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 text-sm">{task.title}</h5>
                              <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <PlayCircle className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-800">개발 예정</span>
                        </div>
                        <p className="text-xs text-blue-600">
                          작업 프리셋 적용 기능은 다음 업데이트에서 제공될 예정입니다.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 데이터베이스 탭 */}
        {activeTab === 'database' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">데이터베이스 상태</h2>
              <button
                onClick={checkDatabaseStatus}
                disabled={dbLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${dbLoading ? 'animate-spin' : ''}`} />
                <span>새로고침</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {Object.entries(dbStatus).map(([table, exists]) => (
                <div key={table} className={`p-4 rounded-lg border ${exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center space-x-2">
                    {exists ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium">{table}</span>
                  </div>
                  <p className={`text-sm mt-1 ${exists ? 'text-green-600' : 'text-red-600'}`}>
                    {exists ? '존재함' : '존재하지 않음'}
                  </p>
                </div>
              ))}
            </div>

            {!allTablesExist && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-yellow-800">일부 데이터베이스 테이블이 존재하지 않습니다</span>
                </div>
                <p className="text-yellow-700 mt-1">
                  시스템을 사용하기 전에 데이터베이스를 초기화해주세요.
                </p>
              </div>
            )}

            <button
              onClick={initializeDatabase}
              disabled={dbLoading}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center space-x-2"
            >
              <Database className="w-5 h-5" />
              <span>{dbLoading ? '초기화 중...' : '데이터베이스 초기화'}</span>
            </button>
          </div>
        )}

        {/* 목표 관리 탭 */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            {!allTablesExist ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-yellow-800 mb-2">데이터베이스가 초기화되지 않았습니다</h3>
                <p className="text-yellow-700 mb-4">목표를 관리하기 전에 데이터베이스를 초기화해주세요.</p>
                <button
                  onClick={() => setActiveTab('database')}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                >
                  데이터베이스 탭으로 이동
                </button>
              </div>
            ) : (
              <>
                {/* 섹션 관리 헤더 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">목표 섹션 관리</h2>
                    <button
                      onClick={addSection}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>섹션 추가</span>
                    </button>
                  </div>
                  
                  {goalSections.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">등록된 섹션이 없습니다</p>
                      <p className="text-sm">새로운 목표 섹션을 추가해보세요!</p>
                    </div>
                  )}
                </div>

                {/* 각 섹션별 관리 */}
                {goalSections.map((section) => (
                  <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {/* 섹션 헤더 */}
                    <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
                      <div className="flex-1 space-y-3">
                        {/* 섹션 제목 */}
                        <div>
                          {editingSections[section.id]?.title ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={tempValues[section.id]?.title || ''}
                                onChange={(e) => setTempValues(prev => ({
                                  ...prev,
                                  [section.id]: { ...prev[section.id], title: e.target.value }
                                }))}
                                className="flex-1 text-xl font-bold border-b-2 border-blue-500 bg-transparent focus:outline-none"
                                autoFocus
                                {...koreanInputProps}
                              />
                              <button
                                onClick={() => {
                                  updateSection(section.id, 'title', tempValues[section.id]?.title || section.title)
                                  setEditingSections(prev => ({
                                    ...prev,
                                    [section.id]: { ...prev[section.id], title: false }
                                  }))
                                }}
                                className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-3">
                              <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                              <button
                                onClick={() => {
                                  setTempValues(prev => ({
                                    ...prev,
                                    [section.id]: { ...prev[section.id], title: section.title }
                                  }))
                                  setEditingSections(prev => ({
                                    ...prev,
                                    [section.id]: { ...prev[section.id], title: true }
                                  }))
                                }}
                                className="text-gray-400 hover:text-blue-600 p-1 rounded"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* 섹션 설명 */}
                        <div>
                          {editingSections[section.id]?.description ? (
                            <div className="flex items-start space-x-2">
                              <textarea
                                value={tempValues[section.id]?.description || ''}
                                onChange={(e) => setTempValues(prev => ({
                                  ...prev,
                                  [section.id]: { ...prev[section.id], description: e.target.value }
                                }))}
                                className="flex-1 border border-gray-300 rounded-lg p-2 text-sm resize-none focus:outline-none focus:border-blue-500"
                                rows={2}
                                autoFocus
                                {...koreanInputProps}
                              />
                              <button
                                onClick={() => {
                                  updateSection(section.id, 'description', tempValues[section.id]?.description || section.description)
                                  setEditingSections(prev => ({
                                    ...prev,
                                    [section.id]: { ...prev[section.id], description: false }
                                  }))
                                }}
                                className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-start space-x-2">
                              <p className="text-gray-600 text-sm flex-1">{section.description}</p>
                              <button
                                onClick={() => {
                                  setTempValues(prev => ({
                                    ...prev,
                                    [section.id]: { ...prev[section.id], description: section.description }
                                  }))
                                  setEditingSections(prev => ({
                                    ...prev,
                                    [section.id]: { ...prev[section.id], description: true }
                                  }))
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 섹션 액션 버튼들 */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => addGoal(section.id)}
                          className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2 text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>목표 추가</span>
                        </button>
                        <button
                          onClick={() => deleteSection(section.id)}
                          className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center space-x-2 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>섹션 삭제</span>
                        </button>
                      </div>
                    </div>

                    {/* 섹션 내 목표 목록 */}
                    <div className="space-y-4">
                      {section.goals.map((goal) => (
                        <div key={goal.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                              <input
                                type="text"
                                value={goal.title}
                                onChange={(e) => updateGoal(section.id, goal.id, 'title', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                                placeholder="목표 제목을 입력하세요"
                                {...koreanInputProps}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">목표값</label>
                              <input
                                type="number"
                                value={goal.target}
                                onChange={(e) => updateGoal(section.id, goal.id, 'target', parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">현재값</label>
                              <input
                                type="number"
                                value={goal.current}
                                onChange={(e) => updateGoal(section.id, goal.id, 'current', parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">단위</label>
                              <input
                                type="text"
                                value={goal.unit}
                                onChange={(e) => updateGoal(section.id, goal.id, 'unit', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                                placeholder="단위를 입력하세요 (예: 개, 시간)"
                                {...koreanInputProps}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                              <input
                                type="text"
                                value={goal.category}
                                onChange={(e) => updateGoal(section.id, goal.id, 'category', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                                placeholder="카테고리를 입력하세요"
                                {...koreanInputProps}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
                              <input
                                type="date"
                                value={goal.deadline || ''}
                                onChange={(e) => updateGoal(section.id, goal.id, 'deadline', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                            <textarea
                              value={goal.description || ''}
                              onChange={(e) => updateGoal(section.id, goal.id, 'description', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                              rows={2}
                              placeholder="목표에 대한 설명을 입력하세요"
                              {...koreanInputProps}
                            />
                          </div>
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => deleteGoal(section.id, goal.id)}
                              className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>삭제</span>
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {section.goals.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">이 섹션에 목표가 없습니다</p>
                          <p className="text-xs">목표 추가 버튼을 클릭해서 새 목표를 추가해보세요</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* 팀 관리 탭 */}
        {activeTab === 'team' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {!allTablesExist ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-yellow-800 mb-2">데이터베이스가 초기화되지 않았습니다</h3>
                <p className="text-yellow-700 mb-4">팀을 관리하기 전에 데이터베이스를 초기화해주세요.</p>
                <button
                  onClick={() => setActiveTab('database')}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                >
                  데이터베이스 탭으로 이동
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">팀 관리</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={saveAllTeamMembers}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>모두 저장</span>
                    </button>
                    <button
                      onClick={addTeamMember}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>팀원 추가</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className={`border rounded-lg p-4 ${teamMemberEditStates[member.id] ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => {
                              updateTeamMember(member.id, 'name', e.target.value)
                              setTeamMemberEditStates(prev => ({ ...prev, [member.id]: true }))
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                            placeholder="팀원 이름을 입력하세요"
                            {...koreanInputProps}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
                          <input
                            type="text"
                            value={member.role}
                            onChange={(e) => {
                              updateTeamMember(member.id, 'role', e.target.value)
                              setTeamMemberEditStates(prev => ({ ...prev, [member.id]: true }))
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                            placeholder="역할을 입력하세요"
                            {...koreanInputProps}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                          <select
                            value={member.status}
                            onChange={(e) => {
                              updateTeamMember(member.id, 'status', e.target.value)
                              setTeamMemberEditStates(prev => ({ ...prev, [member.id]: true }))
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                          >
                            <option value="active">활성</option>
                            <option value="busy">바쁨</option>
                            <option value="away">자리비움</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">레벨</label>
                          <input
                            type="number"
                            value={member.level}
                            onChange={(e) => {
                              updateTeamMember(member.id, 'level', parseInt(e.target.value))
                              setTeamMemberEditStates(prev => ({ ...prev, [member.id]: true }))
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">경험치</label>
                          <input
                            type="number"
                            value={member.xp}
                            onChange={(e) => {
                              updateTeamMember(member.id, 'xp', parseInt(e.target.value))
                              setTeamMemberEditStates(prev => ({ ...prev, [member.id]: true }))
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">완료된 주간 목표</label>
                          <input
                            type="number"
                            value={member.weekly_goals_completed}
                            onChange={(e) => {
                              updateTeamMember(member.id, 'weekly_goals_completed', parseInt(e.target.value))
                              setTeamMemberEditStates(prev => ({ ...prev, [member.id]: true }))
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex space-x-2">
                          {teamMemberEditStates[member.id] && (
                            <button
                              onClick={() => saveTeamMember(member.id)}
                              className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                            >
                              <Save className="w-4 h-4" />
                              <span>저장</span>
                            </button>
                          )}
                          {teamMemberEditStates[member.id] && (
                            <span className="text-sm text-blue-600 font-medium flex items-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                              편집 중
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => deleteTeamMember(member.id)}
                          className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>삭제</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      등록된 팀 멤버가 없습니다.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* 업적 관리 탭 */}
        {activeTab === 'achievements' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {!allTablesExist ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-yellow-800 mb-2">데이터베이스가 초기화되지 않았습니다</h3>
                <p className="text-yellow-700 mb-4">업적을 관리하기 전에 데이터베이스를 초기화해주세요.</p>
                <button
                  onClick={() => setActiveTab('database')}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                >
                  데이터베이스 탭으로 이동
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">업적 관리</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={saveAllAchievements}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>모두 저장</span>
                    </button>
                    <button
                      onClick={addAchievement}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>업적 추가</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className={`border rounded-lg p-4 ${achievementEditStates[achievement.id] ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                      {/* 업적 정의 필드들 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                          <input
                            type="text"
                            value={achievement.title}
                            onChange={(e) => {
                              updateAchievement(achievement.id, 'title', e.target.value)
                              setAchievementEditStates(prev => ({ ...prev, [achievement.id]: true }))
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                            placeholder="업적 제목을 입력하세요"
                            {...koreanInputProps}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">아이콘</label>
                          <input
                            type="text"
                            value={achievement.icon}
                            onChange={(e) => {
                              updateAchievement(achievement.id, 'icon', e.target.value)
                              setAchievementEditStates(prev => ({ ...prev, [achievement.id]: true }))
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                            placeholder="이모지를 입력하세요 (예: 🏆)"
                            {...koreanInputProps}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                          <input
                            type="text"
                            value={achievement.category || ''}
                            onChange={(e) => {
                              updateAchievement(achievement.id, 'category', e.target.value)
                              setAchievementEditStates(prev => ({ ...prev, [achievement.id]: true }))
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                            placeholder="카테고리를 입력하세요"
                            {...koreanInputProps}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">목표값</label>
                          <input
                            type="number"
                            value={achievement.target_value || 0}
                            onChange={(e) => {
                              updateAchievement(achievement.id, 'target_value', parseInt(e.target.value) || 0)
                              setAchievementEditStates(prev => ({ ...prev, [achievement.id]: true }))
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">등급</label>
                          <select
                            value={achievement.tier}
                            onChange={(e) => {
                              updateAchievement(achievement.id, 'tier', e.target.value)
                              setAchievementEditStates(prev => ({ ...prev, [achievement.id]: true }))
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          >
                            <option value="bronze">브론즈</option>
                            <option value="silver">실버</option>
                            <option value="gold">골드</option>
                            <option value="platinum">플래티넘</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">활성화</label>
                          <select
                            value={(achievement.is_active ?? true).toString()}
                            onChange={(e) => {
                              updateAchievement(achievement.id, 'is_active', e.target.value === 'true')
                              setAchievementEditStates(prev => ({ ...prev, [achievement.id]: true }))
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                          >
                            <option value="true">활성</option>
                            <option value="false">비활성</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* 업적 달성 상태 필드들 */}
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="text-sm font-medium text-yellow-800 mb-3 flex items-center">
                          <Trophy className="w-4 h-4 mr-2" />
                          달성 상태 관리
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">달성 상태</label>
                            <select
                              value={achievement.unlocked ? 'true' : 'false'}
                              onChange={(e) => {
                                updateAchievement(achievement.id, 'unlocked', e.target.value === 'true')
                                setAchievementEditStates(prev => ({ ...prev, [achievement.id]: true }))
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                            >
                              <option value="false">미달성</option>
                              <option value="true">달성</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              현재값 / 목표값 ({achievement.target_value || 0})
                            </label>
                            <input
                              type="number"
                              value={achievement.current_value || 0}
                              onChange={(e) => {
                                updateAchievement(achievement.id, 'current_value', parseInt(e.target.value) || 0)
                                setAchievementEditStates(prev => ({ ...prev, [achievement.id]: true }))
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">달성일시 (선택사항)</label>
                            <input
                              type="datetime-local"
                              value={achievement.unlocked_at ? new Date(achievement.unlocked_at).toISOString().slice(0, 16) : ''}
                              onChange={(e) => {
                                updateAchievement(achievement.id, 'unlocked_at', e.target.value ? new Date(e.target.value).toISOString() : null)
                                setAchievementEditStates(prev => ({ ...prev, [achievement.id]: true }))
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                              disabled={!achievement.unlocked}
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              achievement.unlocked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {achievement.unlocked ? '🏆 달성완료' : '⏳ 진행중'}
                            </span>
                            <span className="text-sm text-gray-600">
                              진행률: {Math.round(((achievement.current_value || 0) / (achievement.target_value || 1)) * 100)}%
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              // 달성 상태 토글 + 현재 시각으로 달성일시 자동 설정
                              const isUnlocked = !achievement.unlocked
                              updateAchievement(achievement.id, 'unlocked', isUnlocked)
                              if (isUnlocked) {
                                updateAchievement(achievement.id, 'unlocked_at', new Date().toISOString())
                                updateAchievement(achievement.id, 'current_value', achievement.target_value || 0)
                              } else {
                                updateAchievement(achievement.id, 'unlocked_at', null)
                              }
                              setAchievementEditStates(prev => ({ ...prev, [achievement.id]: true }))
                            }}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              achievement.unlocked 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {achievement.unlocked ? '달성 취소' : '즉시 달성'}
                          </button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                        <textarea
                          value={achievement.description || ''}
                          onChange={(e) => {
                            updateAchievement(achievement.id, 'description', e.target.value)
                            setAchievementEditStates(prev => ({ ...prev, [achievement.id]: true }))
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                          rows={2}
                          placeholder="업적에 대한 설명을 입력하세요"
                          {...koreanInputProps}
                        />
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          {achievementEditStates[achievement.id] && (
                            <button
                              onClick={() => saveAchievement(achievement.id)}
                              className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                            >
                              <Save className="w-4 h-4" />
                              <span>저장</span>
                            </button>
                          )}
                          {achievementEditStates[achievement.id] && (
                            <span className="text-sm text-blue-600 font-medium flex items-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                              편집 중
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* 순서 변경 버튼들 */}
                          <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
                            <button
                              onClick={() => moveAchievementUp(achievement.id)}
                              disabled={achievements.findIndex(a => a.id === achievement.id) === 0}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
                              title="위로 이동"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <div className="text-xs text-gray-500 px-2">
                              {(achievement.row || achievements.findIndex(a => a.id === achievement.id) + 1)}
                            </div>
                            <button
                              onClick={() => moveAchievementDown(achievement.id)}
                              disabled={achievements.findIndex(a => a.id === achievement.id) === achievements.length - 1}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg"
                              title="아래로 이동"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => deleteAchievement(achievement.id)}
                            className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>삭제</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {achievements.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      등록된 업적이 없습니다.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 