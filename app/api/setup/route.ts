import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')

    if (!table) {
      return NextResponse.json({ error: '테이블 이름이 필요합니다' }, { status: 400 })
    }

    // 개별 테이블 존재 여부 확인
    if (!supabase) {
      return NextResponse.json({
        table,
        exists: false,
        error: 'Supabase 클라이언트가 초기화되지 않았습니다'
      })
    }

    try {
      const { error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      return NextResponse.json({
        table,
        exists: !error
      })
    } catch (err) {
      return NextResponse.json({
        table,
        exists: false
      })
    }
  } catch (error) {
    console.error('테이블 상태 확인 오류:', error)
    return NextResponse.json({ 
      error: '테이블 상태 확인 실패',
      table: '',
      exists: false
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Supabase 클라이언트 확인
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Supabase 설정이 필요합니다',
        message: 'NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 .env.local에 설정하세요'
      }, { status: 500 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'check_tables') {
      // 테이블 존재 여부 확인
      const tables = [
        'goal_sections',
        'goals', 
        'sub_goals',
        'team_members',
        'team_goals',
        'achievement_definitions',
        'achievement_records'
      ]

      const tableStatus: {[key: string]: boolean} = {}
      
      for (const table of tables) {
        try {
          // 테이블에서 count 쿼리를 실행하여 존재 여부 확인
          const { error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
          
          tableStatus[table] = !error
        } catch (err) {
          tableStatus[table] = false
        }
      }

      return NextResponse.json({
        message: '테이블 상태 확인 완료',
        tables: tableStatus,
        allTablesExist: Object.values(tableStatus).every(Boolean)
      })

    } else if (action === 'create_sample_data') {
      // 샘플 데이터 생성
      try {
        // 1. 기존 데이터 정리
        console.log('기존 데이터 정리 중...')
        
        // 순서가 중요함 - 외래 키 제약 조건 때문에 역순으로 삭제
        await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('achievement_records').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('achievement_definitions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('team_goals').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('channel_metrics').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('sub_goals').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('goals').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('goal_sections').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        
        console.log('기존 데이터 정리 완료')
        console.log('샘플 데이터 생성 시작...')

        // 2. 목표 섹션 생성
        const { data: section, error: sectionError } = await supabase
          .from('goal_sections')
          .insert({
            id: crypto.randomUUID(),
            title: '2025년 3분기 목표',
            description: '2025년 3분기 주요 수익 목표',
            is_active: true
          })
          .select()
          .single()

        if (sectionError) {
          console.error('목표 섹션 생성 실패:', sectionError)
          throw new Error(`목표 섹션 생성 실패: ${sectionError.message}`)
        }

        console.log('목표 섹션 생성 완료:', section.id)

        // 3. 목표 데이터 생성
        const goals = [
          {
            id: crypto.randomUUID(),
            section_id: section.id,
            title: '애드센스 수익',
            target: 264000000,
            current: 0,
            unit: '원',
            color: 'bg-red-500',
            icon_type: 'target',
            category: '수익',
            description: '3억 3천만원에서 20% 하향 조정',
            deadline: '2025년 3분기',
            sort_order: 1
          },
          {
            id: crypto.randomUUID(),
            section_id: section.id,
            title: '광고 수익',
            target: 75000000,
            current: 0,
            unit: '원',
            color: 'bg-blue-500',
            icon_type: 'trending-up',
            category: '수익',
            description: '광고 협찬 및 브랜딩',
            deadline: '2025년 3분기',
            sort_order: 2
          },
          {
            id: crypto.randomUUID(),
            section_id: section.id,
            title: '인세 수익',
            target: 80000000,
            current: 0,
            unit: '원',
            color: 'bg-green-500',
            icon_type: 'book',
            category: '수익',
            description: '책읽는 코뿔소 4000만 + 미래엔 4000만',
            deadline: '2025년 3분기',
            sort_order: 3
          },
          {
            id: crypto.randomUUID(),
            section_id: section.id,
            title: '상품 판매',
            target: 50000000,
            current: 0,
            unit: '원',
            color: 'bg-purple-500',
            icon_type: 'shopping-cart',
            category: '수익',
            description: '굿즈 및 상품 판매',
            deadline: '2025년 3분기',
            sort_order: 4
          }
        ]

        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .insert(goals)
          .select()

        if (goalsError) {
          console.error('목표 생성 실패:', goalsError)
          throw new Error(`목표 생성 실패: ${goalsError.message}`)
        }

        console.log('목표 생성 완료:', goalsData.length, '개')

        // 4. 채널 지표 생성
        const channelMetrics = [
          { id: crypto.randomUUID(), metric_name: '월간 조회수', target: 50000000, current: 0, unit: '회' },
          { id: crypto.randomUUID(), metric_name: '일일 발행량', target: 25, current: 0, unit: '개' },
          { id: crypto.randomUUID(), metric_name: '구독자 증가', target: 100000, current: 0, unit: '명' },
          { id: crypto.randomUUID(), metric_name: '인스타 팔로워', target: 3200, current: 800, unit: '명' }
        ]

        const { error: metricsError } = await supabase
          .from('channel_metrics')
          .insert(channelMetrics)

        if (metricsError) {
          console.error('채널 지표 생성 실패:', metricsError)
          throw new Error(`채널 지표 생성 실패: ${metricsError.message || JSON.stringify(metricsError)}`)
        }

        console.log('채널 지표 생성 완료')

        // 5. 팀원 생성
        const teamMembers = [
          { id: crypto.randomUUID(), name: '우디', role: '콘텐츠 기획', avatar: '🎬', level: 5, xp: 2800, max_xp: 3000, weekly_goals_completed: 8, weekly_goals_total: 10, videos_created: 45, views_generated: 12500000, engagement_rate: 8.5, rank: 1, is_online: true, status: 'active' },
          { id: crypto.randomUUID(), name: '민보', role: '영상 제작', avatar: '🎥', level: 4, xp: 2200, max_xp: 2500, weekly_goals_completed: 7, weekly_goals_total: 9, videos_created: 38, views_generated: 10200000, engagement_rate: 7.8, rank: 2, is_online: true, status: 'active' },
          { id: crypto.randomUUID(), name: '하지', role: '숏폼 제작', avatar: '📱', level: 6, xp: 3200, max_xp: 3500, weekly_goals_completed: 9, weekly_goals_total: 10, videos_created: 52, views_generated: 8900000, engagement_rate: 9.2, rank: 3, is_online: false, status: 'active' },
          { id: crypto.randomUUID(), name: '단하', role: '편집', avatar: '✂️', level: 3, xp: 1800, max_xp: 2000, weekly_goals_completed: 5, weekly_goals_total: 8, videos_created: 28, views_generated: 6700000, engagement_rate: 6.4, rank: 4, is_online: true, status: 'warning' },
          { id: crypto.randomUUID(), name: '승끼', role: '콘텐츠 제작', avatar: '🎭', level: 4, xp: 2400, max_xp: 2500, weekly_goals_completed: 6, weekly_goals_total: 8, videos_created: 35, views_generated: 9100000, engagement_rate: 7.6, rank: 5, is_online: true, status: 'active' },
          { id: crypto.randomUUID(), name: '최맹', role: '기술 & 분석', avatar: '📊', level: 5, xp: 2900, max_xp: 3000, weekly_goals_completed: 8, weekly_goals_total: 9, videos_created: 25, views_generated: 5800000, engagement_rate: 8.9, rank: 6, is_online: true, status: 'active' },
          { id: crypto.randomUUID(), name: '이브', role: '출판 & 인세', avatar: '📚', level: 4, xp: 2100, max_xp: 2500, weekly_goals_completed: 7, weekly_goals_total: 8, videos_created: 15, views_generated: 4200000, engagement_rate: 7.2, rank: 7, is_online: false, status: 'active' },
          { id: crypto.randomUUID(), name: '고탱', role: '광고 영업', avatar: '💼', level: 3, xp: 1600, max_xp: 2000, weekly_goals_completed: 4, weekly_goals_total: 7, videos_created: 12, views_generated: 3500000, engagement_rate: 6.8, rank: 8, is_online: true, status: 'warning' },
          { id: crypto.randomUUID(), name: '지다', role: '상품 개발', avatar: '🛍️', level: 4, xp: 2300, max_xp: 2500, weekly_goals_completed: 6, weekly_goals_total: 8, videos_created: 18, views_generated: 4800000, engagement_rate: 7.4, rank: 9, is_online: true, status: 'active' },
          { id: crypto.randomUUID(), name: '혜경', role: 'SNS 마케팅', avatar: '📸', level: 5, xp: 2700, max_xp: 3000, weekly_goals_completed: 8, weekly_goals_total: 9, videos_created: 22, views_generated: 6300000, engagement_rate: 8.1, rank: 10, is_online: true, status: 'active' }
        ]

        const { data: membersData, error: membersError } = await supabase
          .from('team_members')
          .insert(teamMembers)
          .select()

        if (membersError) {
          console.error('팀원 생성 실패:', membersError)
          throw new Error(`팀원 생성 실패: ${membersError.message || JSON.stringify(membersError)}`)
        }

        console.log('팀원 생성 완료:', membersData.length, '명')

        // 6. 팀 목표 생성
        const teamGoals = [
          { id: crypto.randomUUID(), title: '월간 콘텐츠 제작', description: '매월 200개 이상의 콘텐츠 제작', progress: 156, target: 200, deadline: '2025-12-31', category: '콘텐츠', reward: '팀 회식' },
          { id: crypto.randomUUID(), title: '구독자 성장', description: '연말까지 구독자 100만 달성', progress: 850000, target: 1000000, deadline: '2025-12-31', category: '성장', reward: '보너스 지급' },
          { id: crypto.randomUUID(), title: '수익 목표 달성', description: '분기별 수익 목표 100% 달성', progress: 75, target: 100, deadline: '2025-09-30', category: '수익', reward: '개인별 인센티브' }
        ]

        const { error: teamGoalsError } = await supabase
          .from('team_goals')
          .insert(teamGoals)

        if (teamGoalsError) {
          console.error('팀 목표 생성 실패:', teamGoalsError)
          throw new Error(`팀 목표 생성 실패: ${teamGoalsError.message || JSON.stringify(teamGoalsError)}`)
        }

        console.log('팀 목표 생성 완료')

        // 7. 업적 정의 생성
        const achievements = [
          { id: crypto.randomUUID(), achievement_id: 'first_goal', title: '첫 목표 달성', description: '첫 번째 목표를 달성했습니다!', icon: 'Target', type: 'milestone', threshold: 1, rarity: 'common' },
          { id: crypto.randomUUID(), achievement_id: 'goal_master', title: '목표 마스터', description: '10개의 목표를 달성했습니다!', icon: 'Trophy', type: 'milestone', threshold: 10, rarity: 'rare' },
          { id: crypto.randomUUID(), achievement_id: 'speed_demon', title: '스피드 데몬', description: '1주일 내에 목표를 달성했습니다!', icon: 'Zap', type: 'speed', threshold: 1, rarity: 'epic' },
          { id: crypto.randomUUID(), achievement_id: 'team_player', title: '팀 플레이어', description: '팀 목표에 기여했습니다!', icon: 'Users', type: 'collaboration', threshold: 1, rarity: 'common' },
          { id: crypto.randomUUID(), achievement_id: 'revenue_hero', title: '수익 영웅', description: '수익 목표를 달성했습니다!', icon: 'DollarSign', type: 'revenue', threshold: 1000000, rarity: 'rare' }
        ]

        const { error: achievementsError } = await supabase
          .from('achievement_definitions')
          .insert(achievements)

        if (achievementsError) {
          console.error('업적 정의 생성 실패:', achievementsError)
          throw new Error(`업적 정의 생성 실패: ${achievementsError.message || JSON.stringify(achievementsError)}`)
        }

        console.log('업적 정의 생성 완료')

        // 8. 업적 기록 생성
        const achievementRecords = [
          { id: crypto.randomUUID(), achievement_id: 'first_goal', unlocked: true, current_value: 1, unlocked_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
          { id: crypto.randomUUID(), achievement_id: 'team_player', unlocked: true, current_value: 5, unlocked_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
          { id: crypto.randomUUID(), achievement_id: 'revenue_hero', unlocked: false, current_value: 750000, unlocked_at: null },
          { id: crypto.randomUUID(), achievement_id: 'goal_master', unlocked: false, current_value: 3, unlocked_at: null },
          { id: crypto.randomUUID(), achievement_id: 'speed_demon', unlocked: false, current_value: 0, unlocked_at: null }
        ]

        const { error: recordsError } = await supabase
          .from('achievement_records')
          .insert(achievementRecords)

        if (recordsError) {
          console.error('업적 기록 생성 실패:', recordsError)
          throw new Error(`업적 기록 생성 실패: ${recordsError.message || JSON.stringify(recordsError)}`)
        }

        console.log('업적 기록 생성 완료')

        // 9. 작업 데이터 생성 (팀원 ID와 연결)
        if (membersData && membersData.length > 0) {
          const tasks = [
            // 우디 (0)
            { id: crypto.randomUUID(), member_id: membersData[0].id, title: '콘텐츠 기획서 작성', progress: 80, status: 'in-progress', priority: 'high' },
            { id: crypto.randomUUID(), member_id: membersData[0].id, title: '다음 주 촬영 스케줄 조정', progress: 100, status: 'completed', priority: 'medium' },
            // 민보 (1)
            { id: crypto.randomUUID(), member_id: membersData[1].id, title: '메인 채널 영상 편집', progress: 60, status: 'in-progress', priority: 'high' },
            { id: crypto.randomUUID(), member_id: membersData[1].id, title: '썸네일 디자인 완료', progress: 100, status: 'completed', priority: 'medium' },
            // 하지 (2)
            { id: crypto.randomUUID(), member_id: membersData[2].id, title: '숏폼 10개 제작', progress: 90, status: 'in-progress', priority: 'high' },
            { id: crypto.randomUUID(), member_id: membersData[2].id, title: '인스타 릴스 업로드', progress: 100, status: 'completed', priority: 'low' },
            // 단하 (3)
            { id: crypto.randomUUID(), member_id: membersData[3].id, title: '영상 편집 완료', progress: 40, status: 'in-progress', priority: 'medium' },
            { id: crypto.randomUUID(), member_id: membersData[3].id, title: '편집 프로그램 업데이트', progress: 0, status: 'pending', priority: 'low' },
            // 승끼 (4)
            { id: crypto.randomUUID(), member_id: membersData[4].id, title: '게스트 섭외', progress: 70, status: 'in-progress', priority: 'medium' },
            { id: crypto.randomUUID(), member_id: membersData[4].id, title: '대본 검토', progress: 100, status: 'completed', priority: 'high' },
            // 최맹 (5)
            { id: crypto.randomUUID(), member_id: membersData[5].id, title: '분석 리포트 작성', progress: 85, status: 'in-progress', priority: 'high' },
            { id: crypto.randomUUID(), member_id: membersData[5].id, title: '대시보드 업데이트', progress: 100, status: 'completed', priority: 'medium' },
            // 이브 (6)
            { id: crypto.randomUUID(), member_id: membersData[6].id, title: '출판사 미팅', progress: 50, status: 'in-progress', priority: 'medium' },
            { id: crypto.randomUUID(), member_id: membersData[6].id, title: '원고 검토', progress: 100, status: 'completed', priority: 'high' },
            // 고탱 (7)
            { id: crypto.randomUUID(), member_id: membersData[7].id, title: '광고주 제안서 작성', progress: 30, status: 'in-progress', priority: 'high' },
            { id: crypto.randomUUID(), member_id: membersData[7].id, title: '계약서 검토', progress: 0, status: 'pending', priority: 'medium' },
            // 지다 (8)
            { id: crypto.randomUUID(), member_id: membersData[8].id, title: '굿즈 샘플 확인', progress: 75, status: 'in-progress', priority: 'medium' },
            { id: crypto.randomUUID(), member_id: membersData[8].id, title: '온라인 스토어 업데이트', progress: 100, status: 'completed', priority: 'low' },
            // 혜경 (9)
            { id: crypto.randomUUID(), member_id: membersData[9].id, title: 'SNS 콘텐츠 제작', progress: 95, status: 'in-progress', priority: 'high' },
            { id: crypto.randomUUID(), member_id: membersData[9].id, title: '인플루언서 협업', progress: 100, status: 'completed', priority: 'medium' }
          ]

          const { error: tasksError } = await supabase
            .from('tasks')
            .insert(tasks)

          if (tasksError) {
            console.error('작업 생성 실패:', tasksError)
            // 작업 생성 실패는 치명적이지 않으므로 경고만 출력
            console.warn('작업 데이터 생성을 건너뜁니다.')
          } else {
            console.log('작업 생성 완료')
          }
        }

        return NextResponse.json({
          message: '샘플 데이터가 성공적으로 생성되었습니다',
          success: true,
          details: {
            section_id: section.id,
            goals_count: goalsData.length,
            members_count: membersData.length
          }
        })

      } catch (error) {
        console.error('샘플 데이터 생성 실패:', error)
        return NextResponse.json({ 
          error: '샘플 데이터 생성 중 오류가 발생했습니다',
          details: error instanceof Error ? error.message : '알 수 없는 오류'
        }, { status: 500 })
      }

    } else {
      return NextResponse.json({ 
        error: '잘못된 액션입니다',
        details: 'action은 check_tables 또는 create_sample_data여야 합니다'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('설정 API 오류:', error)
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
} 