import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Supabase 클라이언트 생성
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 설정이 필요합니다' }, { status: 500 })
    }

    console.log('업적 데이터 조회 시작...')

    // 단일 테이블에서 모든 업적 정보 조회 (JOIN 없음!)
    const { data: achievements, error } = await supabase
      .from('achievement_definitions')
      .select('*')
      .order('row', { ascending: true })

    if (error) {
      console.error('업적 조회 실패:', error)
      return NextResponse.json({ 
        error: '업적을 불러올 수 없습니다',
        details: error.message || '알 수 없는 오류'
      }, { status: 500 })
    }

    console.log(`총 ${achievements?.length || 0}개의 업적을 찾았습니다.`)

    // 간단한 데이터 가공 (필드명 통일)
    const processedAchievements = achievements?.map((achievement, index) => {
      return {
        ...achievement,
        // 기존 필드 그대로 사용 (변환 없음)
        target_value: achievement.target_value || 0,
        current_value: achievement.current_value || 0,
        unlocked: achievement.unlocked || false,
        unlocked_at: achievement.unlocked_at || null,
        tier: achievement.tier || 'bronze',
        category: achievement.category || '',
        row: achievement.row || (index + 1),
        is_active: achievement.is_active ?? true
      }
    }) || []

    return NextResponse.json({
      achievements: processedAchievements
    })

  } catch (error) {
    console.error('업적 API 오류:', error)
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 설정이 필요합니다' }, { status: 500 })
    }

    const body = await request.json()
    const { type, data } = body

    if (type === 'achievement_definition') {
      // 단일 테이블에 모든 업적 정보 저장
      const insertData = {
        id: data.id,
        achievement_id: data.achievement_id || data.id,
        title: data.title,
        description: data.description,
        icon: data.icon,
        category: data.category || '',
        target_value: data.target_value || 0,
        tier: data.tier || 'bronze',
        row: data.row || 1,
        is_active: data.is_active ?? true,
        // 진행 상황 정보도 함께 저장
        current_value: data.current_value || 0,
        unlocked: data.unlocked || false,
        unlocked_at: data.unlocked_at || null
      }

      const { data: achievement, error } = await supabase
        .from('achievement_definitions')
        .upsert(insertData)
        .select()
        .single()

      if (error) {
        console.error('업적 저장 실패:', error)
        return NextResponse.json({ error: '업적 저장 실패' }, { status: 500 })
      }

      return NextResponse.json({ achievement })

    } else {
      return NextResponse.json({ error: '잘못된 요청 타입' }, { status: 400 })
    }

  } catch (error) {
    console.error('업적 생성 API 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 설정이 필요합니다' }, { status: 500 })
    }

    const body = await request.json()
    console.log('업적 업데이트 요청:', body)

    // 모든 필드를 하나의 테이블에서 관리
    const allowedFields = [
      'title', 'description', 'icon', 'category', 
      'target_value', 'tier', 'row', 'is_active',
      'current_value', 'unlocked', 'unlocked_at'
    ]
    
    const updates: any = {}
    
    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = body[key]
      }
    })

    // 달성 시간 자동 설정
    if (body.unlocked && !body.unlocked_at) {
      updates.unlocked_at = new Date().toISOString()
    } else if (!body.unlocked) {
      updates.unlocked_at = null
    }

    // 단일 테이블 업데이트 (매우 간단!)
    const { data: updated, error } = await supabase
      .from('achievement_definitions')
      .update(updates)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('업적 업데이트 실패:', error)
      return NextResponse.json({ error: '업적 업데이트 실패' }, { status: 500 })
    }

    console.log('업적 업데이트 완료:', updated)
    return NextResponse.json({ 
      success: true, 
      updated: updated
    })

  } catch (error) {
    console.error('업적 업데이트 API 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 설정이 필요합니다' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID가 필요합니다' }, { status: 400 })
    }

    // 단일 테이블에서 삭제 (매우 간단!)
    const { error } = await supabase
      .from('achievement_definitions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('업적 삭제 실패:', error)
      return NextResponse.json({ error: '업적 삭제 실패' }, { status: 500 })
    }

    return NextResponse.json({ message: '업적이 삭제되었습니다' })

  } catch (error) {
    console.error('업적 삭제 API 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
} 