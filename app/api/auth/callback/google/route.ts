import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getSupabaseClient } from '@/lib/supabase'

// Google OAuth 클라이언트 설정
const getOAuthClient = () => {
  const baseUrl = process.env.NEXTAUTH_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${baseUrl}/api/auth/callback/google`
  )
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')
    
    // 배포된 URL로 리디렉션하도록 수정
    const baseUrl = process.env.NEXTAUTH_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : url.origin)

    if (error) {
      console.error('OAuth 인증 오류:', error)
      return NextResponse.redirect(`${baseUrl}/?auth=error`)
    }

    if (!code) {
      return NextResponse.json({ error: '인증 코드가 없습니다' }, { status: 400 })
    }

    console.log('=== OAuth 콜백 처리 ===')
    console.log('받은 code:', code.substring(0, 20) + '...')
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
    console.log('VERCEL_URL:', process.env.VERCEL_URL)
    console.log('계산된 baseUrl:', baseUrl)
    console.log('리디렉션 URL:', baseUrl)

    const oauth2Client = getOAuthClient()
    
    // 인증 코드를 액세스 토큰으로 교환
    console.log('토큰 교환 시도 중...')
    const { tokens } = await oauth2Client.getToken(code)
    console.log('토큰 교환 성공:', !!tokens.access_token)
    
    // 🚀 팀 공유를 위해 Supabase에 토큰 저장
    try {
      const supabase = getSupabaseClient()
      
      const tokenData = {
        id: 'youtube_auth', // 고정 ID로 하나의 레코드만 유지
        access_token: tokens.access_token || null,
        refresh_token: tokens.refresh_token || null,
        expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        updated_at: new Date().toISOString(),
        created_by: 'admin' // 인증한 관리자 표시
      }

      // upsert를 사용해서 기존 토큰 업데이트 또는 새로 생성
      const { error: dbError } = await supabase
        .from('youtube_tokens')
        .upsert(tokenData, { onConflict: 'id' })

      if (dbError) {
        console.error('토큰 저장 실패:', dbError)
        // 저장 실패해도 인증은 성공이므로 계속 진행
      } else {
        console.log('✅ YouTube 토큰이 팀 공유 저장소에 저장되었습니다!')
      }
    } catch (dbError) {
      console.error('데이터베이스 저장 오류:', dbError)
      // 저장 실패해도 인증은 성공
    }

    console.log('🎉 YouTube OAuth 인증 성공! 이제 모든 팀원이 데이터를 볼 수 있습니다.')
    
    // 성공 시 메인 페이지로 리다이렉트
    return NextResponse.redirect(`${baseUrl}/?auth=success`)
    
  } catch (error) {
    console.error('OAuth 콜백 처리 실패:', error)
    const baseUrl = process.env.NEXTAUTH_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : new URL(request.url).origin)
    return NextResponse.redirect(`${baseUrl}/?auth=error`)
  }
} 