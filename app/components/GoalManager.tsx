'use client'

import React, { useState, useEffect } from 'react'
import { 
  Target, 
  Trophy, 
  Play, 
  Eye, 
  Users, 
  DollarSign, 
  Star, 
  Award, 
  Lightbulb,
  Edit3,
  Save,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface SubGoal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  deadline?: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  description?: string
}

interface Goal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  color: string
  iconType: string
  category: string
  subGoals?: SubGoal[]
  expanded?: boolean
  order?: number
}

interface GoalSection {
  id: string
  title: string
  description: string
  isActive: boolean
  order: number
  goals: Goal[]
}

interface GoalSectionManagerProps {
  section: GoalSection
  onSectionUpdate: (section: Partial<GoalSection>) => void
  onGoalsUpdate: (goals: Goal[]) => void
  onMoveGoalUp: (goalId: string) => void
  onMoveGoalDown: (goalId: string) => void
}

interface GoalManagerProps {
  goals: Goal[]
  onGoalsUpdate: (goals: Goal[]) => void
  sectionTitle: string
  onSectionTitleUpdate: (title: string) => void
}

const GoalSectionManager: React.FC<GoalSectionManagerProps> = ({ 
  section,
  onSectionUpdate,
  onGoalsUpdate,
  onMoveGoalUp,
  onMoveGoalDown
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [editingSectionTitle, setEditingSectionTitle] = useState(false)
  const [editingSectionDescription, setEditingSectionDescription] = useState(false)
  const [tempSectionTitle, setTempSectionTitle] = useState(section.title)
  const [tempSectionDescription, setTempSectionDescription] = useState(section.description)
  const [tempGoals, setTempGoals] = useState<Goal[]>(section.goals)
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set())

  useEffect(() => {
    setTempGoals(section.goals)
    setTempSectionTitle(section.title)
    setTempSectionDescription(section.description)
  }, [section])

  const handleEditGoal = (goalId: string) => {
    setEditingGoal(goalId)
    setIsEditing(true)
  }

  const handleSaveGoal = (goalId: string, updatedGoal: Partial<Goal>) => {
    const updatedGoals = tempGoals.map(goal => 
      goal.id === goalId ? { ...goal, ...updatedGoal } : goal
    )
    setTempGoals(updatedGoals)
    onGoalsUpdate(updatedGoals)
    setEditingGoal(null)
    setIsEditing(false)
  }

  const handleDeleteGoal = (goalId: string) => {
    const updatedGoals = tempGoals.filter(goal => goal.id !== goalId)
    setTempGoals(updatedGoals)
    onGoalsUpdate(updatedGoals)
  }

  const handleAddGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: '새 목표',
      target: 100,
      current: 0,
      unit: '개',
      color: 'from-neutral-500 to-neutral-600',
      iconType: 'target',
      category: '일반',
      order: tempGoals.length + 1,
      subGoals: [],
      expanded: false
    }
    const updatedGoals = [...tempGoals, newGoal]
    setTempGoals(updatedGoals)
    onGoalsUpdate(updatedGoals)
    setEditingGoal(newGoal.id)
    setIsEditing(true)
  }

  const handleAddSubGoal = (goalId: string) => {
    const newSubGoal: SubGoal = {
      id: `${goalId}-${Date.now()}`,
      title: '새 하위 목표',
      target: 10,
      current: 0,
      unit: '개',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'medium',
      completed: false,
      description: ''
    }

    const updatedGoals = tempGoals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          subGoals: [...(goal.subGoals || []), newSubGoal],
          expanded: true
        }
      }
      return goal
    })

    setTempGoals(updatedGoals)
    onGoalsUpdate(updatedGoals)
    setExpandedGoals(prev => new Set([...prev, goalId]))
  }

  const handleUpdateSubGoal = (goalId: string, subGoalId: string, updatedSubGoal: Partial<SubGoal>) => {
    const updatedGoals = tempGoals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          subGoals: goal.subGoals?.map(subGoal => 
            subGoal.id === subGoalId ? { ...subGoal, ...updatedSubGoal } : subGoal
          ) || []
        }
      }
      return goal
    })

    setTempGoals(updatedGoals)
    onGoalsUpdate(updatedGoals)
  }

  const handleDeleteSubGoal = (goalId: string, subGoalId: string) => {
    const updatedGoals = tempGoals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          subGoals: goal.subGoals?.filter(subGoal => subGoal.id !== subGoalId) || []
        }
      }
      return goal
    })

    setTempGoals(updatedGoals)
    onGoalsUpdate(updatedGoals)
  }

  const handleToggleExpanded = (goalId: string) => {
    const goal = tempGoals.find(g => g.id === goalId)
    if (goal) {
      const updatedGoals = tempGoals.map(g => 
        g.id === goalId ? { ...g, expanded: !g.expanded } : g
      )
      setTempGoals(updatedGoals)
      onGoalsUpdate(updatedGoals)
    }

    setExpandedGoals(prev => {
      const newSet = new Set(prev)
      if (newSet.has(goalId)) {
        newSet.delete(goalId)
      } else {
        newSet.add(goalId)
      }
      return newSet
    })
  }

  const handleSaveSectionTitle = () => {
    onSectionUpdate({ title: tempSectionTitle })
    setEditingSectionTitle(false)
  }

  const handleSaveSectionDescription = () => {
    onSectionUpdate({ description: tempSectionDescription })
    setEditingSectionDescription(false)
  }

  const getIconByKey = (key: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      target: <Target className="h-6 w-6" />,
      trophy: <Trophy className="h-6 w-6" />,
      play: <Play className="h-6 w-6" />,
      eye: <Eye className="h-6 w-6" />,
      users: <Users className="h-6 w-6" />,
      dollar: <DollarSign className="h-6 w-6" />,
      star: <Star className="h-6 w-6" />,
      award: <Award className="h-6 w-6" />,
      lightbulb: <Lightbulb className="h-6 w-6" />
    }
    return iconMap[key] || <Target className="h-6 w-6" />
  }

  const calculateOverallProgress = (goal: Goal) => {
    const mainProgress = (goal.current / goal.target) * 100
    
    if (!goal.subGoals || goal.subGoals.length === 0) {
      return mainProgress
    }

    const completedSubGoals = goal.subGoals.filter(subGoal => subGoal.completed).length
    const subGoalProgress = (completedSubGoals / goal.subGoals.length) * 100
    
    return (subGoalProgress * 0.6) + (mainProgress * 0.4)
  }

  const iconOptions = [
    { key: 'target', icon: <Target className="h-4 w-4" />, label: '타겟' },
    { key: 'eye', icon: <Eye className="h-4 w-4" />, label: '조회수' },
    { key: 'users', icon: <Users className="h-4 w-4" />, label: '구독자' },
    { key: 'dollar', icon: <DollarSign className="h-4 w-4" />, label: '수익' },
    { key: 'play', icon: <Play className="h-4 w-4" />, label: '재생' },
    { key: 'trophy', icon: <Trophy className="h-4 w-4" />, label: '트로피' },
    { key: 'star', icon: <Star className="h-4 w-4" />, label: '별점' },
    { key: 'award', icon: <Award className="h-4 w-4" />, label: '어워드' },
    { key: 'lightbulb', icon: <Lightbulb className="h-4 w-4" />, label: '아이디어' }
  ]

  const colorOptions = [
    { key: 'blue', value: 'from-blue-500 to-blue-600', label: '블루' },
    { key: 'red', value: 'from-red-500 to-red-600', label: '레드' },
    { key: 'green', value: 'from-green-500 to-green-600', label: '그린' },
    { key: 'purple', value: 'from-purple-500 to-purple-600', label: '퍼플' },
    { key: 'yellow', value: 'from-yellow-500 to-yellow-600', label: '옐로우' },
    { key: 'pink', value: 'from-pink-500 to-pink-600', label: '핑크' },
    { key: 'indigo', value: 'from-indigo-500 to-indigo-600', label: '인디고' },
    { key: 'orange', value: 'from-orange-500 to-orange-600', label: '오렌지' }
  ]

  return (
    <div className="border-2 border-dashed border-neutral-200 rounded-xl p-6 bg-neutral-50/30">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          {/* 섹션 제목 */}
          <div className="mb-3">
            {editingSectionTitle ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tempSectionTitle}
                  onChange={(e) => setTempSectionTitle(e.target.value)}
                  className="text-xl font-bold bg-transparent border-b-2 border-indigo-500 focus:outline-none focus:border-indigo-600 flex-1"
                  autoFocus
                />
                <button
                  onClick={handleSaveSectionTitle}
                  className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setTempSectionTitle(section.title)
                    setEditingSectionTitle(false)
                  }}
                  className="p-2 text-neutral-500 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-bold text-indigo-600">{section.title}</h3>
                <button
                  onClick={() => setEditingSectionTitle(true)}
                  className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* 섹션 설명 */}
          <div>
            {editingSectionDescription ? (
              <div className="flex items-center space-x-2">
                <textarea
                  value={tempSectionDescription}
                  onChange={(e) => setTempSectionDescription(e.target.value)}
                  className="bg-transparent border border-neutral-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500 flex-1 text-sm resize-none"
                  rows={2}
                  autoFocus
                />
                <button
                  onClick={handleSaveSectionDescription}
                  className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setTempSectionDescription(section.description)
                    setEditingSectionDescription(false)
                  }}
                  className="p-2 text-neutral-500 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <p className="text-neutral-600 text-sm">{section.description}</p>
                <button
                  onClick={() => setEditingSectionDescription(true)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                >
                  <Edit3 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={handleAddGoal}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>목표 추가</span>
        </button>
      </div>

      {/* 목표 목록 */}
      <div className="space-y-6">
        {tempGoals.map((goal, index) => (
                     <div key={goal.id} className="relative group">
             <GoalCard
              goal={goal}
              isEditing={editingGoal === goal.id}
              isExpanded={expandedGoals.has(goal.id) || goal.expanded || false}
              onEdit={() => handleEditGoal(goal.id)}
              onSave={(updatedGoal) => handleSaveGoal(goal.id, updatedGoal)}
              onDelete={() => handleDeleteGoal(goal.id)}
              onCancel={() => {
                setEditingGoal(null)
                setIsEditing(false)
              }}
              onToggleExpanded={() => handleToggleExpanded(goal.id)}
              onAddSubGoal={() => handleAddSubGoal(goal.id)}
              onUpdateSubGoal={(subGoalId, updatedSubGoal) => handleUpdateSubGoal(goal.id, subGoalId, updatedSubGoal)}
              onDeleteSubGoal={(subGoalId) => handleDeleteSubGoal(goal.id, subGoalId)}
              iconOptions={iconOptions}
              colorOptions={colorOptions}
              calculateOverallProgress={calculateOverallProgress}
            />
            
            {/* 목표 순서 변경 버튼 */}
            <div className="absolute right-2 top-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {index > 0 && (
                <button
                  onClick={() => onMoveGoalUp(goal.id)}
                  className="p-1 bg-white shadow-md rounded hover:bg-neutral-50 transition-colors"
                  title="위로 이동"
                >
                  <ArrowUp className="h-3 w-3 text-neutral-600" />
                </button>
              )}
              {index < tempGoals.length - 1 && (
                <button
                  onClick={() => onMoveGoalDown(goal.id)}
                  className="p-1 bg-white shadow-md rounded hover:bg-neutral-50 transition-colors"
                  title="아래로 이동"
                >
                  <ArrowDown className="h-3 w-3 text-neutral-600" />
                </button>
              )}
            </div>
          </div>
        ))}
        
        {tempGoals.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">목표가 없습니다</p>
            <p className="text-sm">새로운 목표를 추가해보세요!</p>
          </div>
        )}
      </div>
    </div>
  )
}

const iconOptions = [
  { key: 'lightbulb', icon: <Lightbulb className="h-6 w-6" />, label: '아이디어' },
  { key: 'dollar', icon: <DollarSign className="h-6 w-6" />, label: '수익' },
  { key: 'award', icon: <Award className="h-6 w-6" />, label: '성과' },
  { key: 'star', icon: <Star className="h-6 w-6" />, label: '품질' },
  { key: 'target', icon: <Target className="h-6 w-6" />, label: '목표' },
  { key: 'eye', icon: <Eye className="h-6 w-6" />, label: '조회수' },
  { key: 'users', icon: <Users className="h-6 w-6" />, label: '구독자' },
  { key: 'play', icon: <Play className="h-6 w-6" />, label: '재생' },
]

const colorOptions = [
  { key: 'usso-accent', value: 'from-usso-accent to-yellow-500', label: '웃소 악센트' },
  { key: 'success', value: 'from-success-500 to-success-600', label: '성공' },
  { key: 'info', value: 'from-info-500 to-info-600', label: '정보' },
  { key: 'usso-secondary', value: 'from-usso-secondary to-purple-500', label: '웃소 보조' },
  { key: 'warning', value: 'from-warning-500 to-warning-600', label: '경고' },
  { key: 'danger', value: 'from-danger-500 to-danger-600', label: '위험' },
]

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
}

const priorityLabels = {
  high: '높음',
  medium: '보통',
  low: '낮음'
}

const GoalManager: React.FC<GoalManagerProps> = ({ 
  goals, 
  onGoalsUpdate, 
  sectionTitle, 
  onSectionTitleUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [editingSectionTitle, setEditingSectionTitle] = useState(false)
  const [tempSectionTitle, setTempSectionTitle] = useState(sectionTitle)
  const [tempGoals, setTempGoals] = useState<Goal[]>(goals)
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set())

  const handleEditGoal = (goalId: string) => {
    setEditingGoal(goalId)
    setIsEditing(true)
  }

  const handleSaveGoal = (goalId: string, updatedGoal: Partial<Goal>) => {
    const updatedGoals = tempGoals.map(goal => 
      goal.id === goalId ? { ...goal, ...updatedGoal } : goal
    )
    setTempGoals(updatedGoals)
    onGoalsUpdate(updatedGoals)
    setEditingGoal(null)
    setIsEditing(false)
  }

  const handleDeleteGoal = (goalId: string) => {
    const updatedGoals = tempGoals.filter(goal => goal.id !== goalId)
    setTempGoals(updatedGoals)
    onGoalsUpdate(updatedGoals)
  }

  const handleAddGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: '새 목표',
      target: 100,
      current: 0,
      unit: '개',
      color: 'from-neutral-500 to-neutral-600',
      iconType: 'target',
      category: '일반',
      subGoals: [],
      expanded: false
    }
    const updatedGoals = [...tempGoals, newGoal]
    setTempGoals(updatedGoals)
    onGoalsUpdate(updatedGoals)
    setEditingGoal(newGoal.id)
    setIsEditing(true)
  }

  const handleAddSubGoal = (goalId: string) => {
    const newSubGoal: SubGoal = {
      id: Date.now().toString(),
      title: '새 하위 목표',
      target: 50,
      current: 0,
      unit: '개',
      priority: 'medium',
      completed: false,
      description: ''
    }
    
    const updatedGoals = tempGoals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          subGoals: [...(goal.subGoals || []), newSubGoal],
          expanded: true
        }
      }
      return goal
    })
    
    setTempGoals(updatedGoals)
    onGoalsUpdate(updatedGoals)
  }

  const handleUpdateSubGoal = (goalId: string, subGoalId: string, updatedSubGoal: Partial<SubGoal>) => {
    const updatedGoals = tempGoals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          subGoals: goal.subGoals?.map(subGoal => 
            subGoal.id === subGoalId ? { ...subGoal, ...updatedSubGoal } : subGoal
          )
        }
      }
      return goal
    })
    
    setTempGoals(updatedGoals)
    onGoalsUpdate(updatedGoals)
  }

  const handleDeleteSubGoal = (goalId: string, subGoalId: string) => {
    const updatedGoals = tempGoals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          subGoals: goal.subGoals?.filter(subGoal => subGoal.id !== subGoalId)
        }
      }
      return goal
    })
    
    setTempGoals(updatedGoals)
    onGoalsUpdate(updatedGoals)
  }

  const handleToggleExpanded = (goalId: string) => {
    setExpandedGoals(prev => {
      const newSet = new Set(prev)
      if (newSet.has(goalId)) {
        newSet.delete(goalId)
      } else {
        newSet.add(goalId)
      }
      return newSet
    })
  }

  const handleSaveSectionTitle = () => {
    onSectionTitleUpdate(tempSectionTitle)
    setEditingSectionTitle(false)
  }

  const getIconByKey = (key: string) => {
    switch (key) {
      case 'lightbulb': return <Lightbulb className="h-6 w-6" />
      case 'dollar': return <DollarSign className="h-6 w-6" />
      case 'award': return <Award className="h-6 w-6" />
      case 'star': return <Star className="h-6 w-6" />
      case 'target': return <Target className="h-6 w-6" />
      case 'eye': return <Eye className="h-6 w-6" />
      case 'users': return <Users className="h-6 w-6" />
      case 'play': return <Play className="h-6 w-6" />
      default: return <Target className="h-6 w-6" />
    }
  }

  const calculateOverallProgress = (goal: Goal) => {
    if (!goal.subGoals || goal.subGoals.length === 0) {
      return Math.min(100, (goal.current / goal.target) * 100)
    }
    
    const completedSubGoals = goal.subGoals.filter(sub => sub.completed).length
    const totalSubGoals = goal.subGoals.length
    const subGoalProgress = (completedSubGoals / totalSubGoals) * 100
    
    const mainProgress = Math.min(100, (goal.current / goal.target) * 100)
    
    // 하위 목표 완료도와 메인 목표 진행도를 조합 (6:4 비율)
    return (subGoalProgress * 0.6) + (mainProgress * 0.4)
  }

  return (
    <div className="space-y-6">
      {/* 섹션 제목 편집 */}
      <div className="flex items-center justify-between">
        {editingSectionTitle ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={tempSectionTitle}
              onChange={(e) => setTempSectionTitle(e.target.value)}
              className="text-2xl font-bold bg-transparent border-b-2 border-indigo-500 focus:outline-none focus:border-indigo-600"
              autoFocus
            />
            <button
              onClick={handleSaveSectionTitle}
              className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setTempSectionTitle(sectionTitle)
                setEditingSectionTitle(false)
              }}
              className="p-2 text-neutral-500 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <h2 className="heading-2 bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              {sectionTitle}
            </h2>
            <button
              onClick={() => setEditingSectionTitle(true)}
              className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <button
          onClick={handleAddGoal}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>목표 추가</span>
        </button>
      </div>

      {/* 목표 목록 */}
      <div className="space-y-6">
        {tempGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            isEditing={editingGoal === goal.id}
            isExpanded={expandedGoals.has(goal.id)}
            onEdit={() => handleEditGoal(goal.id)}
            onSave={(updatedGoal) => handleSaveGoal(goal.id, updatedGoal)}
            onDelete={() => handleDeleteGoal(goal.id)}
            onCancel={() => {
              setEditingGoal(null)
              setIsEditing(false)
            }}
            onToggleExpanded={() => handleToggleExpanded(goal.id)}
            onAddSubGoal={() => handleAddSubGoal(goal.id)}
            onUpdateSubGoal={(subGoalId, updatedSubGoal) => handleUpdateSubGoal(goal.id, subGoalId, updatedSubGoal)}
            onDeleteSubGoal={(subGoalId) => handleDeleteSubGoal(goal.id, subGoalId)}
            iconOptions={iconOptions}
            colorOptions={colorOptions}
            calculateOverallProgress={calculateOverallProgress}
          />
        ))}
      </div>
    </div>
  )
}

interface GoalCardProps {
  goal: Goal
  isEditing: boolean
  isExpanded: boolean
  onEdit: () => void
  onSave: (goal: Partial<Goal>) => void
  onDelete: () => void
  onCancel: () => void
  onToggleExpanded: () => void
  onAddSubGoal: () => void
  onUpdateSubGoal: (subGoalId: string, updatedSubGoal: Partial<SubGoal>) => void
  onDeleteSubGoal: (subGoalId: string) => void
  iconOptions: Array<{ key: string; icon: React.ReactNode; label: string }>
  colorOptions: Array<{ key: string; value: string; label: string }>
  calculateOverallProgress: (goal: Goal) => number
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  isEditing,
  isExpanded,
  onEdit,
  onSave,
  onDelete,
  onCancel,
  onToggleExpanded,
  onAddSubGoal,
  onUpdateSubGoal,
  onDeleteSubGoal,
  iconOptions,
  colorOptions,
  calculateOverallProgress
}) => {
  const [tempGoal, setTempGoal] = useState(goal)

  const handleSave = () => {
    onSave(tempGoal)
  }

  const getIconByKey = (key: string) => {
    switch (key) {
      case 'lightbulb': return <Lightbulb className="h-6 w-6" />
      case 'dollar': return <DollarSign className="h-6 w-6" />
      case 'award': return <Award className="h-6 w-6" />
      case 'star': return <Star className="h-6 w-6" />
      case 'target': return <Target className="h-6 w-6" />
      case 'eye': return <Eye className="h-6 w-6" />
      case 'users': return <Users className="h-6 w-6" />
      case 'play': return <Play className="h-6 w-6" />
      default: return <Target className="h-6 w-6" />
    }
  }

  const getProgressPercentage = (current: number, target: number): number => {
    return Math.min(100, (current / target) * 100)
  }

  if (isEditing) {
    return (
      <div className="card p-6 bg-gradient-surface border-2 border-indigo-300">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">제목</label>
            <input
              type="text"
              value={tempGoal.title}
              onChange={(e) => setTempGoal(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-usso-primary bg-white text-gray-900 placeholder-gray-500 text-sm font-medium"
              placeholder="목표 제목"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">카테고리</label>
            <input
              type="text"
              value={tempGoal.category}
              onChange={(e) => setTempGoal(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-usso-primary bg-white text-gray-900 placeholder-gray-500 text-sm"
              placeholder="카테고리"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">목표값</label>
              <input
                type="number"
                value={tempGoal.target}
                onChange={(e) => setTempGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-usso-primary bg-white text-gray-900 placeholder-gray-500 text-sm"
                placeholder="목표값"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">현재값</label>
              <input
                type="number"
                value={tempGoal.current}
                onChange={(e) => setTempGoal(prev => ({ ...prev, current: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-usso-primary bg-white text-gray-900 placeholder-gray-500 text-sm"
                placeholder="현재값"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">단위</label>
            <input
              type="text"
              value={tempGoal.unit}
              onChange={(e) => setTempGoal(prev => ({ ...prev, unit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-usso-primary bg-white text-gray-900 placeholder-gray-500 text-sm"
              placeholder="단위"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">아이콘</label>
            <div className="grid grid-cols-4 gap-2">
              {iconOptions.map((iconOption) => (
                <button
                  key={iconOption.key}
                  onClick={() => setTempGoal(prev => ({ 
                    ...prev, 
                    iconType: iconOption.key
                  }))}
                  className={`p-2 border rounded-lg hover:bg-neutral-50 flex items-center justify-center transition-colors ${
                    tempGoal.iconType === iconOption.key ? 'border-indigo-500 bg-indigo-50' : 'border-neutral-300'
                  }`}
                  title={iconOption.label}
                >
                  {iconOption.icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">색상</label>
            <div className="grid grid-cols-2 gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.key}
                  onClick={() => setTempGoal(prev => ({ ...prev, color: colorOption.value }))}
                  className={`p-3 rounded-lg bg-gradient-to-r ${colorOption.value} text-white text-xs font-medium transition-transform hover:scale-105`}
                >
                  {colorOption.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>저장</span>
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-3 py-2 bg-neutral-500 text-white rounded-lg hover:bg-neutral-600 transition-colors flex items-center justify-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>취소</span>
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const progress = calculateOverallProgress(goal)
  const hasSubGoals = goal.subGoals && goal.subGoals.length > 0
  const completedSubGoals = goal.subGoals?.filter(sub => sub.completed).length || 0

  return (
    <div className="card p-6 bg-gradient-surface hover-glow group">
      {/* 메인 목표 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className={`icon-container bg-gradient-to-r ${goal.color} text-white shadow-medium w-12 h-12 flex items-center justify-center`}>
            {getIconByKey(goal.iconType)}
          </div>
          <div>
            <h3 className="heading-3 text-neutral-900 mb-1">{goal.title}</h3>
            <p className="body-small text-neutral-600">{goal.category}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasSubGoals && (
            <button
              onClick={onToggleExpanded}
              className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          <button
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 메인 목표 진행률 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className="body-large text-neutral-700 mb-2">
            <span className="text-2xl font-bold text-neutral-900">{formatNumber(goal.current)}</span>
            <span className="text-neutral-500 text-lg"> / {formatNumber(goal.target)} {goal.unit}</span>
          </div>
          <div className="body-small text-neutral-600">메인 목표 진행률</div>
        </div>
        
        <div className="text-center">
          <div className={`text-3xl font-bold mb-2 ${
            progress >= 100 ? 'text-success-600' : 
            progress >= 75 ? 'text-info-600' : 
            progress >= 50 ? 'text-warning-600' : 'text-neutral-600'
          }`}>
            {progress.toFixed(1)}%
          </div>
          <div className="body-small text-neutral-600">전체 진행률</div>
        </div>
        
        {hasSubGoals && (
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-2">
              {completedSubGoals} / {goal.subGoals?.length}
            </div>
            <div className="body-small text-neutral-600">하위 목표 완료</div>
          </div>
        )}
      </div>

      {/* 진행률 바 */}
      <div className="mb-6">
        <div className="progress-bar h-4 mb-2">
          <div 
            className={`progress-fill h-full rounded-full transition-all duration-500 ${
              progress >= 100 ? 'bg-gradient-success' : 
              progress >= 75 ? 'bg-gradient-to-r from-info-500 to-info-600' : 
              progress >= 50 ? 'bg-gradient-to-r from-warning-500 to-warning-600' : 'bg-gradient-to-r from-neutral-400 to-neutral-500'
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          ></div>
        </div>
        
        {progress >= 100 ? (
          <div className="flex items-center justify-center space-x-2 text-success-600 bg-success-50 rounded-lg p-3">
            <Award className="h-5 w-5" />
            <span className="body-base font-semibold">목표 달성! 🎉</span>
          </div>
        ) : (
          <div className="text-center body-small text-neutral-600 bg-neutral-50 rounded-lg p-3">
            목표까지 <span className="font-semibold text-neutral-900">
              {formatNumber(goal.target - goal.current)} {goal.unit}
            </span> 남음
          </div>
        )}
      </div>

      {/* 하위 목표 관리 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="heading-4 text-neutral-800">하위 목표</h4>
        <button
          onClick={onAddSubGoal}
          className="flex items-center space-x-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>하위 목표 추가</span>
        </button>
      </div>

      {/* 하위 목표 목록 */}
      {hasSubGoals && isExpanded && (
        <div className="space-y-3 border-t border-neutral-200 pt-4">
          {goal.subGoals?.map((subGoal) => (
            <SubGoalItem
              key={subGoal.id}
              subGoal={subGoal}
              onUpdate={(updatedSubGoal) => onUpdateSubGoal(subGoal.id, updatedSubGoal)}
              onDelete={() => onDeleteSubGoal(subGoal.id)}
            />
          ))}
        </div>
      )}

      {!hasSubGoals && (
        <div className="text-center py-8 border-t border-neutral-200">
          <div className="text-neutral-400 mb-2">
            <Target className="h-8 w-8 mx-auto" />
          </div>
          <p className="body-small text-neutral-500 mb-3">아직 하위 목표가 없습니다</p>
          <button
            onClick={onAddSubGoal}
            className="text-indigo-600 hover:text-indigo-700 body-small font-medium"
          >
            첫 번째 하위 목표를 추가해보세요
          </button>
        </div>
      )}
    </div>
  )
}

interface SubGoalItemProps {
  subGoal: SubGoal
  onUpdate: (updatedSubGoal: Partial<SubGoal>) => void
  onDelete: () => void
}

const SubGoalItem: React.FC<SubGoalItemProps> = ({ subGoal, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [tempSubGoal, setTempSubGoal] = useState(subGoal)

  const handleSave = () => {
    onUpdate(tempSubGoal)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempSubGoal(subGoal)
    setIsEditing(false)
  }

  const handleToggleCompleted = () => {
    onUpdate({ completed: !subGoal.completed })
  }

  const getProgressPercentage = (current: number, target: number): number => {
    return Math.min(100, (current / target) * 100)
  }

  if (isEditing) {
    return (
      <div className="card p-4 bg-neutral-50 border border-neutral-200">
        <div className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">제목</label>
              <input
                type="text"
                value={tempSubGoal.title}
                onChange={(e) => setTempSubGoal(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 text-sm"
                placeholder="하위 목표 제목"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">마감일</label>
              <input
                type="date"
                value={tempSubGoal.deadline || ''}
                onChange={(e) => setTempSubGoal(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">목표값</label>
              <input
                type="number"
                value={tempSubGoal.target}
                onChange={(e) => setTempSubGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">현재값</label>
              <input
                type="number"
                value={tempSubGoal.current}
                onChange={(e) => setTempSubGoal(prev => ({ ...prev, current: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">단위</label>
              <input
                type="text"
                value={tempSubGoal.unit}
                onChange={(e) => setTempSubGoal(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">우선순위</label>
            <div className="flex space-x-2">
              {Object.entries(priorityLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTempSubGoal(prev => ({ ...prev, priority: key as 'high' | 'medium' | 'low' }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    tempSubGoal.priority === key 
                      ? priorityColors[key as keyof typeof priorityColors]
                      : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">설명</label>
            <textarea
              value={tempSubGoal.description || ''}
              onChange={(e) => setTempSubGoal(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 text-sm"
              rows={2}
              placeholder="하위 목표에 대한 설명을 입력하세요"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <Save className="h-3 w-3" />
              <span>저장</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-3 py-2 bg-neutral-500 text-white rounded-lg hover:bg-neutral-600 transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <X className="h-3 w-3" />
              <span>취소</span>
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors text-sm"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const progress = getProgressPercentage(subGoal.current, subGoal.target)
  const isOverdue = subGoal.deadline && new Date(subGoal.deadline) < new Date() && !subGoal.completed

  return (
    <div className={`card p-4 border transition-all hover:shadow-md ${
      subGoal.completed ? 'bg-success-50 border-success-200' : 'bg-white border-neutral-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={handleToggleCompleted}
            className={`mt-0.5 transition-colors ${
              subGoal.completed ? 'text-success-600' : 'text-neutral-400 hover:text-success-600'
            }`}
          >
            {subGoal.completed ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h5 className={`font-semibold ${subGoal.completed ? 'line-through text-neutral-500' : 'text-neutral-900'}`}>
                {subGoal.title}
              </h5>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[subGoal.priority]}`}>
                {priorityLabels[subGoal.priority]}
              </span>
              {isOverdue && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  지연
                </span>
              )}
            </div>
            
            {subGoal.description && (
              <p className="text-sm text-neutral-600 mb-2">{subGoal.description}</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-neutral-600">
              <span>
                {formatNumber(subGoal.current)} / {formatNumber(subGoal.target)} {subGoal.unit}
              </span>
              {subGoal.deadline && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(subGoal.deadline).toLocaleDateString('ko-KR')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className={`text-sm font-semibold ${
            progress >= 100 ? 'text-success-600' : 
            progress >= 75 ? 'text-info-600' : 
            progress >= 50 ? 'text-warning-600' : 'text-neutral-600'
          }`}>
            {progress.toFixed(0)}%
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
          >
            <Edit3 className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      {!subGoal.completed && (
        <div className="progress-bar h-2">
          <div 
            className={`progress-fill h-full rounded-full transition-all duration-300 ${
              progress >= 100 ? 'bg-gradient-success' : 
              progress >= 75 ? 'bg-gradient-to-r from-info-500 to-info-600' : 
              progress >= 50 ? 'bg-gradient-to-r from-warning-500 to-warning-600' : 'bg-gradient-to-r from-neutral-400 to-neutral-500'
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          ></div>
        </div>
      )}
    </div>
  )
}

export default GoalManager
export { GoalSectionManager } 