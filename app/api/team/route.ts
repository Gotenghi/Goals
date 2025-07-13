import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Supabase 클라이언트 확인
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Supabase 설정이 필요합니다',
        teamMembers: [],
        teamGoals: [],
        message: 'Supabase 환경 변수 설정이 필요합니다'
      }, { status: 500 })
    }

    // 팀원 정보 조회
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: true })

    if (membersError) {
      console.error('팀원 조회 실패:', membersError)
      console.error('팀원 조회 오류 상세:', JSON.stringify(membersError, null, 2))
      return NextResponse.json({ error: '팀원 조회 실패', details: membersError }, { status: 500 })
    }

    // 팀 목표 조회
    const { data: teamGoals, error: goalsError } = await supabase
      .from('team_goals')
      .select('*')
      .order('created_at', { ascending: true })

    if (goalsError) {
      console.error('팀 목표 조회 실패:', goalsError)
      console.error('팀 목표 조회 오류 상세:', JSON.stringify(goalsError, null, 2))
      return NextResponse.json({ error: '팀 목표 조회 실패', details: goalsError }, { status: 500 })
    }

    return NextResponse.json({
      teamMembers: teamMembers || [],
      teamGoals: teamGoals || []
    })

  } catch (error) {
    console.error('팀 API 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Supabase 클라이언트 확인
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 설정이 필요합니다' }, { status: 500 })
    }

    const body = await request.json()
    const { type, data } = body

    if (type === 'team_member') {
      // 팀원 생성/수정
      const { data: member, error } = await supabase
        .from('team_members')
        .upsert({
          id: data.id,
          name: data.name,
          role: data.role,
          avatar: data.avatar,
          status: data.status,
          level: data.level,
          xp: data.xp,
          achievements: data.achievements,
          tasks_completed: data.tasks_completed,
          tasks_total: data.tasks_total
        })
        .select()
        .single()

      if (error) {
        console.error('팀원 저장 실패:', error)
        return NextResponse.json({ error: '팀원 저장 실패' }, { status: 500 })
      }

      return NextResponse.json({ member })

    } else if (type === 'team_goal') {
      // 팀 목표 생성/수정
      const { data: goal, error } = await supabase
        .from('team_goals')
        .upsert({
          id: data.id,
          title: data.title,
          description: data.description,
          target: data.target,
          progress: data.progress || 0,
          deadline: data.deadline,
          category: data.category,
          reward: data.reward
        })
        .select()
        .single()

      if (error) {
        console.error('팀 목표 저장 실패:', error)
        return NextResponse.json({ error: '팀 목표 저장 실패' }, { status: 500 })
      }

      return NextResponse.json({ goal })

    } else {
      return NextResponse.json({ error: '잘못된 요청 타입' }, { status: 400 })
    }

  } catch (error) {
    console.error('팀 생성/수정 API 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Supabase 클라이언트 확인
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 설정이 필요합니다' }, { status: 500 })
    }

    const body = await request.json()
    console.log('🔍 PUT 요청 받음:', JSON.stringify(body, null, 2))
    
    const { type, id, data } = body

    if (type === 'team_member') {
      console.log('👤 팀원 수정 시도:', { id, data })
      
      // 팀원 수정
      const updateData = {
        name: data.name,
        role: data.role,
        avatar: data.avatar,
        status: data.status,
        level: data.level,
        xp: data.xp,
        tasks_completed: data.tasks_completed || data.weekly_goals_completed || 0,
        tasks_total: data.tasks_total || data.weekly_goals_total || 10
      }
      
      console.log('📝 업데이트할 데이터:', JSON.stringify(updateData, null, 2))
      
      const { data: member, error } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ 팀원 수정 실패:', error)
        console.error('❌ 오류 상세:', JSON.stringify(error, null, 2))
        return NextResponse.json({ 
          error: '팀원 수정 실패', 
          details: error,
          sentData: updateData 
        }, { status: 500 })
      }

      console.log('✅ 팀원 수정 성공:', member)
      return NextResponse.json({ member })

    } else if (type === 'team_goal') {
      // 팀 목표 수정
      const { data: goal, error } = await supabase
        .from('team_goals')
        .update({
          title: data.title,
          description: data.description,
          target: data.target,
          progress: data.progress || 0,
          deadline: data.deadline,
          category: data.category,
          reward: data.reward
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('팀 목표 수정 실패:', error)
        return NextResponse.json({ error: '팀 목표 수정 실패' }, { status: 500 })
      }

      return NextResponse.json({ goal })

    } else {
      return NextResponse.json({ error: '잘못된 요청 타입' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ 팀 수정 API 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다', details: error }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Supabase 클라이언트 확인
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 설정이 필요합니다' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json({ error: '타입과 ID가 필요합니다' }, { status: 400 })
    }

    if (type === 'team_member') {
      // 팀원 삭제
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('팀원 삭제 실패:', error)
        return NextResponse.json({ error: '팀원 삭제 실패' }, { status: 500 })
      }

      return NextResponse.json({ message: '팀원이 삭제되었습니다' })

    } else if (type === 'team_goal') {
      // 팀 목표 삭제
      const { error } = await supabase
        .from('team_goals')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('팀 목표 삭제 실패:', error)
        return NextResponse.json({ error: '팀 목표 삭제 실패' }, { status: 500 })
      }

      return NextResponse.json({ message: '팀 목표가 삭제되었습니다' })

    } else {
      return NextResponse.json({ error: '잘못된 요청 타입' }, { status: 400 })
    }

  } catch (error) {
    console.error('팀 삭제 API 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
} 