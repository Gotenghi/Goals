import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

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

// YouTube Analytics API 스코프 (댓글 읽기 권한 포함)
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl'  // 댓글 읽기 권한
]

export async function GET(request: NextRequest) {
  try {
    console.log('=== OAuth 인증 시작 ===')
    console.log('CLIENT_ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...')
    console.log('CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT_SET')
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
    console.log('VERCEL_URL:', process.env.VERCEL_URL)
    console.log('Request URL:', request.url)
    
    // 계산된 baseUrl 로그
    const baseUrl = process.env.NEXTAUTH_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    console.log('계산된 baseUrl:', baseUrl)
    console.log('리다이렉트 URI:', `${baseUrl}/api/auth/callback/google`)
    
    const oauth2Client = getOAuthClient()
    
    // 인증 URL 생성
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    })
    
    console.log('생성된 인증 URL:', authUrl)
    
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('OAuth 인증 시작 실패:', error)
    return NextResponse.json({ 
      error: 'OAuth 인증 실패', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 