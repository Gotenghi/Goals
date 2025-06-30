'use client'

import { User, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface TeamMember {
  name: string
  role: string
  avatar: string
  tasks: Task[]
  status: 'active' | 'warning' | 'inactive'
}

interface Task {
  title: string
  progress: number
  status: 'completed' | 'in-progress' | 'pending'
  priority: 'high' | 'medium' | 'low'
}

export default function TeamProgress() {
  const teamMembers: TeamMember[] = [
    {
      name: '우디',
      role: '콘텐츠 기획',
      avatar: '🎬',
      status: 'active',
      tasks: [
        { title: '대중적 관심사 콘텐츠 기획', progress: 75, status: 'in-progress', priority: 'high' },
        { title: '영상 간 연계성 스토리텔링', progress: 60, status: 'in-progress', priority: 'high' },
        { title: '이슈 탐색 및 기획', progress: 80, status: 'in-progress', priority: 'medium' }
      ]
    },
    {
      name: '민보',
      role: '영상 제작',
      avatar: '🎥',
      status: 'active',
      tasks: [
        { title: '주 3회 영상 제작', progress: 65, status: 'in-progress', priority: 'high' },
        { title: '편집량 최적화', progress: 45, status: 'in-progress', priority: 'medium' },
        { title: '롱폼 시청 지속시간 개선', progress: 30, status: 'pending', priority: 'medium' }
      ]
    },
    {
      name: '하지',
      role: '숏폼 제작',
      avatar: '📱',
      status: 'active',
      tasks: [
        { title: '주 7회 숏폼 제작', progress: 85, status: 'in-progress', priority: 'high' },
        { title: 'SNS 플랫폼별 최적화', progress: 70, status: 'in-progress', priority: 'medium' },
        { title: '숏폼 도달률 증대', progress: 55, status: 'in-progress', priority: 'high' }
      ]
    },
    {
      name: '단하',
      role: '편집',
      avatar: '✂️',
      status: 'warning',
      tasks: [
        { title: '편집 워크플로우 개선', progress: 40, status: 'in-progress', priority: 'medium' },
        { title: '이탈률 감소 편집', progress: 25, status: 'pending', priority: 'high' },
        { title: '편집량 정량화 시스템', progress: 15, status: 'pending', priority: 'low' }
      ]
    },
    {
      name: '승끼',
      role: '콘텐츠 제작',
      avatar: '🎭',
      status: 'active',
      tasks: [
        { title: '콘텐츠 다양성 확보', progress: 60, status: 'in-progress', priority: 'medium' },
        { title: '캐릭터 영향력 증대', progress: 50, status: 'in-progress', priority: 'medium' },
        { title: '멤버 추가 호출 방안', progress: 20, status: 'pending', priority: 'low' }
      ]
    },
    {
      name: '최맹',
      role: '기술 & 분석',
      avatar: '📊',
      status: 'active',
      tasks: [
        { title: '채널 지표 분석', progress: 90, status: 'in-progress', priority: 'high' },
        { title: '경쟁 채널 모니터링', progress: 70, status: 'in-progress', priority: 'medium' },
        { title: '데이터 기반 최적화', progress: 65, status: 'in-progress', priority: 'high' }
      ]
    },
    {
      name: '이브',
      role: '출판 & 인세',
      avatar: '📚',
      status: 'active',
      tasks: [
        { title: '저자 사인회 이벤트 기획', progress: 80, status: 'in-progress', priority: 'high' },
        { title: '책읽는 코뿔소 프로모션', progress: 60, status: 'in-progress', priority: 'medium' },
        { title: '미래엔 연계 콘텐츠', progress: 45, status: 'in-progress', priority: 'medium' }
      ]
    },
    {
      name: '고탱',
      role: '광고 영업',
      avatar: '💼',
      status: 'warning',
      tasks: [
        { title: '광고 파트너십 확대', progress: 35, status: 'in-progress', priority: 'high' },
        { title: '브랜딩 협찬 유치', progress: 25, status: 'pending', priority: 'high' },
        { title: '광고 수익 최적화', progress: 30, status: 'in-progress', priority: 'medium' }
      ]
    },
    {
      name: '지다',
      role: '상품 개발',
      avatar: '🛍️',
      status: 'active',
      tasks: [
        { title: '굿즈 2,000세트 준비', progress: 70, status: 'in-progress', priority: 'high' },
        { title: '캐릭터 상품 기획', progress: 55, status: 'in-progress', priority: 'medium' },
        { title: '객단가 2.5만원 달성', progress: 40, status: 'in-progress', priority: 'high' }
      ]
    },
    {
      name: '혜경',
      role: 'SNS 마케팅',
      avatar: '📸',
      status: 'active',
      tasks: [
        { title: '인스타 3,200명 목표', progress: 45, status: 'in-progress', priority: 'high' },
        { title: '팔로워 2,400명 증가', progress: 35, status: 'in-progress', priority: 'high' },
        { title: 'SNS 콘텐츠 기획', progress: 65, status: 'in-progress', priority: 'medium' }
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-500" />
      case 'pending': return <AlertCircle className="h-4 w-4 text-orange-500" />
      default: return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-usso-primary to-usso-secondary p-3 rounded-lg mr-4">
          <User className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-usso-dark">팀별 진행 상황</h2>
          <p className="text-gray-600">2025년 3분기 목표 달성을 위한 개별 과제</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teamMembers.map((member, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* 멤버 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{member.avatar}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                {member.status === 'active' ? '활발' : member.status === 'warning' ? '주의' : '비활성'}
              </span>
            </div>

            {/* 과제 목록 */}
            <div className="space-y-3">
              {member.tasks.map((task, taskIndex) => (
                <div key={taskIndex} className={`border-l-4 ${getPriorityColor(task.priority)} bg-gray-50 p-3 rounded-r-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{task.title}</span>
                    {getTaskStatusIcon(task.status)}
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-gradient-to-r from-usso-primary to-usso-secondary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{task.progress}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-medium ${
                      task.priority === 'high' ? 'text-red-600' :
                      task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'} 우선순위
                    </span>
                    <span className="text-gray-500">
                      {task.status === 'completed' ? '완료' : 
                       task.status === 'in-progress' ? '진행중' : '대기중'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 팀 전체 현황 요약 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-usso-light to-blue-50 rounded-lg">
        <h3 className="font-semibold text-usso-dark mb-3">🎯 팀 전체 현황</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {teamMembers.filter(m => m.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">활발한 멤버</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {teamMembers.filter(m => m.status === 'warning').length}
            </div>
            <div className="text-sm text-gray-600">주의 필요</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {teamMembers.reduce((total, member) => 
                total + member.tasks.filter(task => task.status === 'in-progress').length, 0
              )}
            </div>
            <div className="text-sm text-gray-600">진행중 과제</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-usso-primary">
              {Math.round(
                teamMembers.reduce((total, member) => 
                  total + member.tasks.reduce((sum, task) => sum + task.progress, 0) / member.tasks.length, 0
                ) / teamMembers.length
              )}%
            </div>
            <div className="text-sm text-gray-600">평균 진행률</div>
          </div>
        </div>
      </div>
    </div>
  )
} 