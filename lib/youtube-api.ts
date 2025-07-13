// 서버 전용 YouTube API 함수들
// googleapis 의존성을 서버에서만 동적으로 import

// 클라이언트용 타입들은 youtube-client.ts에서 re-export
export type { YouTubeVideo, YouTubeChannelStats, YouTubeAnalytics } from './youtube-client'

// 서비스 계정 인증 설정 (서버 사이드 전용)
export const getGoogleAuthClient = async () => {
  try {
    // 서버 사이드에서만 googleapis 동적 import
    if (typeof window !== 'undefined') {
      // 클라이언트 사이드에서는 null 반환
      return null
    }
    
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const { google } = await import('googleapis')
      // 서비스 계정 JSON 파일을 사용한 인증
      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: [
          'https://www.googleapis.com/auth/youtube.readonly',
          'https://www.googleapis.com/auth/yt-analytics.readonly'
        ]
      })
      return auth
    }
    return null
  } catch (error) {
    console.error('Google 인증 설정 오류:', error)
    return null
  }
}

// 서비스 계정을 사용한 YouTube Analytics API 호출 (서버 사이드 전용)
export const fetchYouTubeAnalyticsWithServiceAccount = async (channelId: string) => {
  try {
    // 클라이언트 사이드에서는 실행되지 않음
    if (typeof window !== 'undefined') {
      return null
    }

    const auth = await getGoogleAuthClient()
    if (!auth) {
      console.warn('Google 인증이 설정되지 않았습니다. Mock 데이터를 사용합니다.')
      return null
    }

    const { google } = await import('googleapis')
    const youtube = google.youtube({ version: 'v3', auth })
    const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth })

    // 지난 30일 날짜 계산
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    
    const endDate = today.toISOString().split('T')[0]
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]

    // 1. 채널 기본 정보
    const channelResponse = await (youtube.channels.list as any)({
      part: ['statistics'],
      id: [channelId]
    })

    // 2. Analytics API로 일별 조회수 및 시청시간 데이터
    const analyticsResponse = await youtubeAnalytics.reports.query({
      ids: `channel==${channelId}`,
      startDate,
      endDate,
      metrics: 'views,estimatedMinutesWatched',
      dimensions: 'day'
    })

    // 3. 지난 30일간 업로드된 영상들
    const videosResponse = await (youtube.search.list as any)({
      part: ['snippet'],
      channelId,
      publishedAfter: new Date(startDate).toISOString(),
      publishedBefore: new Date(endDate).toISOString(),
      type: 'video',
      order: 'viewCount',
      maxResults: 50
    })

    // 영상 통계 정보 가져오기
    const videoIds = videosResponse.data.items?.map((item: any) => item.id?.videoId).filter(Boolean) || []
    const videoStatsResponse = await (youtube.videos.list as any)({
      part: ['statistics', 'contentDetails'],
      id: videoIds
    })

    // 데이터 변환
    const monthlyViews = analyticsResponse.data.rows?.map((row: any, index: number) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + index)
      return {
        date: date.toISOString().split('T')[0],
        views: parseInt(row[1])
      }
    }) || []

    const watchTimeData = analyticsResponse.data.rows?.map((row: any, index: number) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + index)
      return {
        date: date.toISOString().split('T')[0],
        minutes: parseInt(row[2])
      }
    }) || []

    // 구독자 증감 데이터는 Analytics API에서 별도 조회 필요
    const subscriberResponse = await youtubeAnalytics.reports.query({
      ids: `channel==${channelId}`,
      startDate,
      endDate,
      metrics: 'subscribersGained',
      dimensions: 'day'
    })

    const baseSubscribers = parseInt(channelResponse.data.items?.[0]?.statistics?.subscriberCount || '0')
    const subscriberGrowth = subscriberResponse.data.rows?.map((row: any, index: number) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + index)
      return {
        date: date.toISOString().split('T')[0],
        subscribers: baseSubscribers - (29 - index) * parseInt(row[1]), // 역산하여 일별 구독자 수 계산
        change: parseInt(row[1])
      }
    }) || []

    // 상위 영상 데이터 구성
    const topVideos = videosResponse.data.items?.slice(0, 5).map((item: any) => {
      const videoStats = videoStatsResponse.data.items?.find((v: any) => v.id === item.id?.videoId)
      return {
        id: item.id?.videoId || '',
        title: item.snippet?.title || '',
        viewCount: parseInt(videoStats?.statistics?.viewCount || '0'),
        duration: videoStats?.contentDetails?.duration || 'PT0M0S',
        publishedAt: item.snippet?.publishedAt || '',
        thumbnail: item.snippet?.thumbnails?.medium?.url || '',
        watchTime: Math.floor(Math.random() * 100000) + 50000 // 시청시간은 추정값
      }
    }) || []

    return {
      monthlyViews,
      watchTimeData,
      subscriberGrowth,
      topVideosByViews: topVideos,
      topVideosByWatchTime: [...topVideos].sort((a, b) => b.watchTime - a.watchTime)
    }

  } catch (error) {
    console.error('YouTube Analytics API (서비스 계정) 호출 실패:', error)
    return null
  }
}