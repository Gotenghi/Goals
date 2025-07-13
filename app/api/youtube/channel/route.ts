import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY
    const channelId = process.env.YOUTUBE_CHANNEL_ID

    // API 키가 없으면 Mock 데이터 반환
    if (!apiKey || !channelId) {
      console.log('YouTube API 키 또는 채널 ID가 설정되지 않았습니다. Mock 데이터를 사용합니다.')
      return NextResponse.json({
        subscriberCount: 2567000,
        totalViews: 1250000000,
        videoCount: 1247
      })
    }

    try {
      const { google } = await import('googleapis')
      const youtube = google.youtube('v3')
      
      // 채널 통계 정보 가져오기
      const response = await youtube.channels.list({
        key: apiKey,
        part: ['statistics'],
        id: [channelId]
      })

      const channelData = response.data.items?.[0]
      if (!channelData || !channelData.statistics) {
        throw new Error('채널 통계 데이터를 찾을 수 없습니다.')
      }

      const stats = channelData.statistics
      
      return NextResponse.json({
        subscriberCount: parseInt(stats.subscriberCount || '0'),
        totalViews: parseInt(stats.viewCount || '0'),
        videoCount: parseInt(stats.videoCount || '0')
      })

    } catch (apiError) {
      console.error('YouTube API 호출 실패:', apiError)
      // API 호출 실패시 Mock 데이터 반환
      return NextResponse.json({
        subscriberCount: 2567000,
        totalViews: 1250000000,
        videoCount: 1247
      })
    }

  } catch (error) {
    console.error('서버 오류:', error)
    return NextResponse.json(
      { error: '채널 통계를 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
} 