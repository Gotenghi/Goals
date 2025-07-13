import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { cookies } from 'next/headers'

// Google OAuth 클라이언트 설정
const getOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`
  )
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')

    if (error) {
      console.error('OAuth 인증 오류:', error)
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?auth=error`)
    }

    if (!code) {
      return NextResponse.json({ error: '인증 코드가 없습니다' }, { status: 400 })
    }

    console.log('=== OAuth 콜백 처리 ===')
    console.log('받은 code:', code.substring(0, 20) + '...')
    console.log('전체 URL:', request.url)

    const oauth2Client = getOAuthClient()
    
    // OAuth 클라이언트 설정 확인
    console.log('OAuth 클라이언트 설정 완료')
    
    // 인증 코드를 액세스 토큰으로 교환
    console.log('토큰 교환 시도 중...')
    const { tokens } = await oauth2Client.getToken(code)
    console.log('토큰 교환 성공:', !!tokens.access_token)
    
    // 토큰을 쿠키에 저장 (실제 운영에서는 더 안전한 방법 사용)
    const cookieStore = cookies()
    
    if (tokens.access_token) {
      cookieStore.set('youtube_access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600 // 1시간
      })
    }
    
    if (tokens.refresh_token) {
      cookieStore.set('youtube_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30일
      })
    }

    console.log('YouTube OAuth 인증 성공!')
    
    // 메인 페이지로 리다이렉트
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?auth=success`)
    
  } catch (error) {
    console.error('OAuth 콜백 처리 실패:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?auth=error`)
  }
} 