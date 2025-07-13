import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Supabase 클라이언트 확인
    if (!supabase) {
      console.log('Supabase 클라이언트가 초기화되지 않았습니다. 환경 변수를 확인하세요.')
      return NextResponse.json({ 
        error: 'Supabase 설정이 필요합니다',
        sections: [],
        message: 'Supabase 환경 변수 설정이 필요합니다'
      }, { status: 500 })
    }

    // 모든 활성 섹션 조회
    const { data: sections, error: sectionsError } = await supabase
      .from('goal_sections')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true })

    if (sectionsError) {
      console.error('목표 섹션 조회 실패:', sectionsError)
      return NextResponse.json({ 
        error: '목표 섹션 조회 실패',
        details: sectionsError.message,
        sections: []
      }, { status: 500 })
    }

    // 섹션이 없으면 기본 섹션 생성
    if (!sections || sections.length === 0) {
      console.log('목표 섹션이 없습니다. 기본 섹션을 생성합니다.')
      
      const defaultSection = {
        id: crypto.randomUUID(),
        title: '2025년 3분기 목표',
        description: '웃소 채널의 핵심 목표 및 성과 지표',
        is_active: true,
        order: 1
      }

      const { data: newSection, error: createError } = await supabase
        .from('goal_sections')
        .insert(defaultSection)
        .select()
        .single()

      if (createError) {
        console.error('기본 섹션 생성 실패:', createError)
        return NextResponse.json({ 
          error: '기본 섹션 생성 실패',
          details: createError.message,
          sections: []
        }, { status: 500 })
      }

      return NextResponse.json({
        sections: [{
          ...newSection,
          goals: []
        }]
      })
    }

    // 각 섹션별로 목표 및 하위 목표 조회
    const sectionsWithGoals = await Promise.all(
      sections.map(async (section) => {
        const { data: goals, error: goalsError } = await supabase
          .from('goals')
          .select(`
            *,
            sub_goals (
              id,
              title,
              target,
              current,
              unit,
              priority,
              completed,
              deadline,
              description,
              sort_order
            )
          `)
          .eq('section_id', section.id)
          .order('sort_order', { ascending: true })

        if (goalsError) {
          console.error(`섹션 ${section.id}의 목표 조회 실패:`, goalsError)
          return {
            ...section,
            goals: []
          }
        }

        // 하위 목표 정렬
        const sortedGoals = goals?.map(goal => ({
          ...goal,
          sub_goals: goal.sub_goals?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
        })) || []

        return {
          ...section,
          goals: sortedGoals
        }
      })
    )

    return NextResponse.json({
      sections: sectionsWithGoals
    })

  } catch (error) {
    console.error('목표 API 오류:', error)
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      sections: []
    }, { status: 500 })
  }
}

// 숫자 값을 정수로 변환하는 헬퍼 함수
function toInteger(value: any): number {
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : Math.floor(parsed)
  }
  if (typeof value === 'number') {
    return Math.floor(value)
  }
  return 0
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/goals 요청 받음')
    
    // Supabase 클라이언트 확인
    if (!supabase) {
      console.error('❌ Supabase 클라이언트가 없습니다')
      return NextResponse.json({ 
        error: 'Supabase 설정이 필요합니다',
        details: 'Supabase 환경 변수를 확인해주세요'
      }, { status: 500 })
    }

    const body = await request.json()
    console.log('📝 요청 본문:', JSON.stringify(body, null, 2))
    const { type, data } = body

    if (type === 'section') {
      console.log('📦 섹션 처리 시작')
      
      // 목표 섹션 생성/수정
      const sectionData = {
        title: data.title || '새 목표 섹션',
        description: data.description || '',
        is_active: data.is_active !== undefined ? data.is_active : true,
        order: data.order || 1
      }

      console.log('📦 섹션 데이터:', sectionData)

      // ID가 있으면 수정, 없으면 생성
      let section, error
      if (data.id) {
        console.log('🔄 기존 섹션 업데이트:', data.id)
        const result = await supabase
          .from('goal_sections')
          .update(sectionData)
          .eq('id', data.id)
          .select()
          .single()
        section = result.data
        error = result.error
      } else {
        console.log('➕ 새 섹션 생성')
        const newId = crypto.randomUUID()
        console.log('🆔 생성된 ID:', newId)
        
        const result = await supabase
          .from('goal_sections')
          .insert({
            id: newId,
            ...sectionData
          })
          .select()
          .single()
        section = result.data
        error = result.error
      }

      if (error) {
        console.error('❌ 목표 섹션 저장 실패:', error)
        return NextResponse.json({ 
          error: '목표 섹션 저장 실패',
          details: error.message,
          supabaseError: error
        }, { status: 500 })
      }

      console.log('✅ 섹션 저장 성공:', section)
      return NextResponse.json({ section })

    } else if (type === 'goal') {
      console.log('🎯 목표 처리 시작')
      
      // 먼저 section_id가 유효한지 확인
      if (!data.section_id) {
        console.error('❌ section_id 누락')
        return NextResponse.json({ 
          error: '목표 섹션을 선택해주세요',
          details: 'section_id가 필요합니다'
        }, { status: 400 })
      }

      console.log('🔍 섹션 존재 여부 확인:', data.section_id)
      const { data: sectionExists } = await supabase
        .from('goal_sections')
        .select('id')
        .eq('id', data.section_id)
        .single()

      if (!sectionExists) {
        console.error('❌ 섹션이 존재하지 않음:', data.section_id)
        return NextResponse.json({ 
          error: '유효하지 않은 목표 섹션입니다',
          details: '선택한 목표 섹션이 존재하지 않습니다'
        }, { status: 400 })
      }
      
      console.log('✅ 섹션 존재 확인됨')

      // 목표 생성/수정
      const goalData = {
        section_id: data.section_id,
        title: data.title || '새 목표',
        target: toInteger(data.target),
        current: toInteger(data.current || 0),
        unit: data.unit || '개',
        color: data.color || 'bg-blue-500',
        icon_type: data.icon_type || 'target',
        category: data.category || '기타',
        description: data.description || '',
        deadline: data.deadline || null,
        expanded: data.expanded || false,
        sort_order: data.sort_order || 0
      }

      let goal, error
      if (data.id) {
        const result = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', data.id)
          .select()
          .single()
        goal = result.data
        error = result.error
      } else {
        const result = await supabase
          .from('goals')
          .insert({
            id: crypto.randomUUID(),
            ...goalData
          })
          .select()
          .single()
        goal = result.data
        error = result.error
      }

      if (error) {
        console.error('목표 저장 실패:', error)
        return NextResponse.json({ 
          error: '목표 저장 실패',
          details: error.message
        }, { status: 500 })
      }

      return NextResponse.json({ goal })

    } else if (type === 'sub_goal') {
      // 먼저 goal_id가 유효한지 확인
      if (!data.goal_id) {
        return NextResponse.json({ 
          error: '상위 목표를 선택해주세요',
          details: 'goal_id가 필요합니다'
        }, { status: 400 })
      }

      const { data: goalExists } = await supabase
        .from('goals')
        .select('id')
        .eq('id', data.goal_id)
        .single()

      if (!goalExists) {
        return NextResponse.json({ 
          error: '유효하지 않은 상위 목표입니다',
          details: '선택한 상위 목표가 존재하지 않습니다'
        }, { status: 400 })
      }

      // 하위 목표 생성/수정
      const subGoalData = {
        goal_id: data.goal_id,
        title: data.title || '새 하위 목표',
        target: toInteger(data.target),
        current: toInteger(data.current || 0),
        unit: data.unit || '개',
        priority: data.priority || 'medium',
        completed: data.completed || false,
        deadline: data.deadline || null,
        description: data.description || '',
        sort_order: data.sort_order || 0
      }

      let subGoal, error
      if (data.id) {
        const result = await supabase
          .from('sub_goals')
          .update(subGoalData)
          .eq('id', data.id)
          .select()
          .single()
        subGoal = result.data
        error = result.error
      } else {
        const result = await supabase
          .from('sub_goals')
          .insert({
            id: crypto.randomUUID(),
            ...subGoalData
          })
          .select()
          .single()
        subGoal = result.data
        error = result.error
      }

      if (error) {
        console.error('하위 목표 저장 실패:', error)
        return NextResponse.json({ 
          error: '하위 목표 저장 실패',
          details: error.message
        }, { status: 500 })
      }

      return NextResponse.json({ subGoal })

    } else {
      return NextResponse.json({ 
        error: '잘못된 요청 타입',
        details: 'type은 section, goal, sub_goal 중 하나여야 합니다'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('목표 생성/수정 API 오류:', error)
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Supabase 클라이언트 확인
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Supabase 설정이 필요합니다',
        details: 'Supabase 환경 변수를 확인해주세요'
      }, { status: 500 })
    }

    const body = await request.json()
    const { type, id, data } = body

    if (!id) {
      return NextResponse.json({ 
        error: 'ID가 필요합니다',
        details: '수정할 항목의 ID를 제공해주세요'
      }, { status: 400 })
    }

    if (type === 'goal') {
      // 목표 수정
      const goalData = {
        title: data.title,
        target: toInteger(data.target),
        current: toInteger(data.current),
        unit: data.unit,
        color: data.color,
        icon_type: data.icon_type,
        category: data.category,
        description: data.description,
        deadline: data.deadline,
        expanded: data.expanded,
        sort_order: data.sort_order
      }

      const { data: goal, error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('목표 수정 실패:', error)
        return NextResponse.json({ 
          error: '목표 수정 실패',
          details: error.message
        }, { status: 500 })
      }

      return NextResponse.json({ goal })

    } else if (type === 'sub_goal') {
      // 하위 목표 수정
      const subGoalData = {
        title: data.title,
        target: toInteger(data.target),
        current: toInteger(data.current),
        unit: data.unit,
        priority: data.priority,
        completed: data.completed,
        deadline: data.deadline,
        description: data.description,
        sort_order: data.sort_order
      }

      const { data: subGoal, error } = await supabase
        .from('sub_goals')
        .update(subGoalData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('하위 목표 수정 실패:', error)
        return NextResponse.json({ 
          error: '하위 목표 수정 실패',
          details: error.message
        }, { status: 500 })
      }

      return NextResponse.json({ subGoal })

    } else if (type === 'section') {
      // 섹션 수정
      const sectionData = {
        title: data.title,
        description: data.description,
        is_active: data.is_active,
        order: data.order
      }

      const { data: section, error } = await supabase
        .from('goal_sections')
        .update(sectionData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('섹션 수정 실패:', error)
        return NextResponse.json({ 
          error: '섹션 수정 실패',
          details: error.message
        }, { status: 500 })
      }

      return NextResponse.json({ section })

    } else {
      return NextResponse.json({ 
        error: '잘못된 요청 타입',
        details: 'type은 goal, sub_goal 또는 section이어야 합니다'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('목표 수정 API 오류:', error)
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Supabase 클라이언트 확인
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Supabase 설정이 필요합니다',
        details: 'Supabase 환경 변수를 확인해주세요'
      }, { status: 500 })
    }

    const body = await request.json()
    const { type, id } = body

    if (!type || !id) {
      return NextResponse.json({ 
        error: '타입과 ID가 필요합니다',
        details: 'type과 id를 제공해주세요'
      }, { status: 400 })
    }

    if (type === 'section') {
      // 섹션 삭제 (관련된 모든 목표와 하위 목표도 함께 삭제됨)
      const { error } = await supabase
        .from('goal_sections')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('섹션 삭제 실패:', error)
        return NextResponse.json({ 
          error: '섹션 삭제 실패',
          details: error.message
        }, { status: 500 })
      }

      return NextResponse.json({ message: '섹션이 삭제되었습니다' })

    } else if (type === 'goal') {
      // 목표 삭제 (하위 목표도 자동 삭제됨)
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('목표 삭제 실패:', error)
        return NextResponse.json({ 
          error: '목표 삭제 실패',
          details: error.message
        }, { status: 500 })
      }

      return NextResponse.json({ message: '목표가 삭제되었습니다' })

    } else if (type === 'sub_goal') {
      // 하위 목표 삭제
      const { error } = await supabase
        .from('sub_goals')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('하위 목표 삭제 실패:', error)
        return NextResponse.json({ 
          error: '하위 목표 삭제 실패',
          details: error.message
        }, { status: 500 })
      }

      return NextResponse.json({ message: '하위 목표가 삭제되었습니다' })

    } else {
      return NextResponse.json({ 
        error: '잘못된 요청 타입',
        details: 'type은 section, goal 또는 sub_goal이어야 합니다'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('삭제 API 오류:', error)
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
} 