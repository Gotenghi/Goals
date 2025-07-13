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

// 토큰 갱신 함수
async function refreshAccessToken(refreshToken: string) {
  try {
    const oauth2Client = getOAuthClient()
    oauth2Client.setCredentials({ refresh_token: refreshToken })
    
    const { credentials } = await oauth2Client.refreshAccessToken()
    console.log('토큰 갱신 성공:', !!credentials.access_token)
    
    // 새 액세스 토큰을 쿠키에 저장
    const cookieStore = cookies()
    if (credentials.access_token) {
      cookieStore.set('youtube_access_token', credentials.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600 // 1시간
      })
    }
    
    return credentials.access_token
  } catch (error) {
    console.error('토큰 갱신 실패:', error)
    throw error
  }
}

// 실제 YouTube Analytics API 호출
async function fetchRealYouTubeAnalytics(accessToken: string) {
  try {
    const oauth2Client = getOAuthClient()
    oauth2Client.setCredentials({ access_token: accessToken })

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client })
    const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2Client })

          // 채널 정보 가져오기
      const channelResponse = await (youtube.channels.list as any)({
        part: ['statistics', 'snippet'],
        mine: true
      })

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      throw new Error('채널 정보를 찾을 수 없습니다')
    }

    const channel = channelResponse.data.items[0]
    const channelId = channel.id
    
    if (!channelId) {
      throw new Error('채널 ID를 찾을 수 없습니다')
    }

    // 현재 달과 이전 달 날짜 계산
    const today = new Date()
    
    // 현재 달 (지난 30일)
    const currentEndDate = new Date()
    const currentStartDate = new Date()
    currentStartDate.setDate(currentStartDate.getDate() - 30)
    
    // 이전 달 (31-60일 전)
    const previousEndDate = new Date()
    previousEndDate.setDate(previousEndDate.getDate() - 31)
    const previousStartDate = new Date()
    previousStartDate.setDate(previousStartDate.getDate() - 60)

    // 날짜를 YYYY-MM-DD 형식으로 변환
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0]
    }

    console.log(`📊 Analytics 데이터 요청:`)
    console.log(`현재 기간: ${formatDate(currentStartDate)} ~ ${formatDate(currentEndDate)}`)
    console.log(`이전 기간: ${formatDate(previousStartDate)} ~ ${formatDate(previousEndDate)}`)

    // 🎯 실제 구독자 증감 데이터 가져오기 (본인 채널만 가능!)
    const [currentSubscriberData, previousSubscriberData] = await Promise.all([
      youtubeAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate: formatDate(currentStartDate),
        endDate: formatDate(currentEndDate),
        metrics: 'subscribersGained,subscribersLost',
        dimensions: 'day'
      }),
      youtubeAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate: formatDate(previousStartDate),
        endDate: formatDate(previousEndDate),
        metrics: 'subscribersGained,subscribersLost',
        dimensions: 'day'
      })
    ])

    // 구독자 증감 계산
    const calculateSubscriberChange = (data: any) => {
      if (!data.data.rows || data.data.rows.length === 0) return { gained: 0, lost: 0, net: 0 }
      
      let totalGained = 0
      let totalLost = 0
      
      data.data.rows.forEach((row: any[]) => {
        totalGained += parseInt(row[1]) || 0  // subscribersGained
        totalLost += parseInt(row[2]) || 0    // subscribersLost
      })
      
      return {
        gained: totalGained,
        lost: totalLost,
        net: totalGained - totalLost
      }
    }

    const currentPeriodSubs = calculateSubscriberChange(currentSubscriberData)
    const previousPeriodSubs = calculateSubscriberChange(previousSubscriberData)

    console.log(`🔢 구독자 변화 (현재 30일): +${currentPeriodSubs.gained}, -${currentPeriodSubs.lost}, 순증가: ${currentPeriodSubs.net}`)
    console.log(`🔢 구독자 변화 (이전 30일): +${previousPeriodSubs.gained}, -${previousPeriodSubs.lost}, 순증가: ${previousPeriodSubs.net}`)

    // 실제 구독자 증감률 계산
    let realSubscriberGrowthRate: number | null = null
    if (previousPeriodSubs.net !== 0) {
      realSubscriberGrowthRate = ((currentPeriodSubs.net - previousPeriodSubs.net) / Math.abs(previousPeriodSubs.net)) * 100
      console.log(`✅ 실제 구독자 증감률: ${realSubscriberGrowthRate.toFixed(2)}%`)
    } else if (currentPeriodSubs.net > 0) {
      realSubscriberGrowthRate = 100 // 이전 기간 대비 100% 증가
      console.log(`✅ 실제 구독자 증감률: 100% (이전 기간 대비 신규 증가)`)
    } else {
      console.log(`⚠️ 구독자 증감률 계산 불가: 기준 데이터 부족`)
    }

    // 일별 데이터 가져오기 (그래프용)
    const [dailyViewsData, dailyWatchTimeData, currentMonthlyData, previousMonthlyData] = await Promise.all([
      youtubeAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate: formatDate(currentStartDate),
        endDate: formatDate(currentEndDate),
        metrics: 'views',
        dimensions: 'day'
      }),
      youtubeAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate: formatDate(currentStartDate),
        endDate: formatDate(currentEndDate),
        metrics: 'estimatedMinutesWatched',
        dimensions: 'day'
      }),
      youtubeAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate: formatDate(currentStartDate),
        endDate: formatDate(currentEndDate),
        metrics: 'views,estimatedMinutesWatched,averageViewDuration'
      }),
      youtubeAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate: formatDate(previousStartDate),
        endDate: formatDate(previousEndDate),
        metrics: 'views,estimatedMinutesWatched,averageViewDuration'
      })
    ])

    // 현재 기간 데이터 추출
    const currentRow = currentMonthlyData.data.rows?.[0] || []
    const currentMonthlyViews = parseInt(currentRow[0]) || 0
    const currentMonthlyWatchTime = parseInt(currentRow[1]) || 0
    const currentAverageViewDurationSeconds = parseFloat(currentRow[2]) || 0

    // 이전 기간 데이터 추출
    const previousRow = previousMonthlyData.data.rows?.[0] || []
    const previousMonthlyViews = parseInt(previousRow[0]) || 0
    const previousMonthlyWatchTime = parseInt(previousRow[1]) || 0
    const previousAverageViewDurationSeconds = parseFloat(previousRow[2]) || 0

    // 분 단위로 변환
    const currentAverageViewDurationMinutes = currentAverageViewDurationSeconds / 60
    const previousAverageViewDurationMinutes = previousAverageViewDurationSeconds / 60

    console.log(`📈 현재 기간 데이터:`)
    console.log(`- 조회수: ${currentMonthlyViews.toLocaleString()}`)
    console.log(`- 시청시간: ${currentMonthlyWatchTime.toLocaleString()}분`)
    console.log(`- 평균 시청시간: ${currentAverageViewDurationMinutes.toFixed(1)}분`)

    console.log(`📉 이전 기간 데이터:`)
    console.log(`- 조회수: ${previousMonthlyViews.toLocaleString()}`)
    console.log(`- 시청시간: ${previousMonthlyWatchTime.toLocaleString()}분`)
    console.log(`- 평균 시청시간: ${previousAverageViewDurationMinutes.toFixed(1)}분`)

    // 증감률 계산 함수
    const calculateGrowthRate = (current: number, previous: number): number | null => {
      if (previous === 0) {
        return current > 0 ? 100 : null
      }
      return ((current - previous) / previous) * 100
    }

    // 각 지표별 증감률 계산
    const viewsGrowthRate = calculateGrowthRate(currentMonthlyViews, previousMonthlyViews)
    const watchTimeGrowthRate = calculateGrowthRate(currentMonthlyWatchTime, previousMonthlyWatchTime)
    const avgViewDurationGrowthRate = calculateGrowthRate(currentAverageViewDurationMinutes, previousAverageViewDurationMinutes)

    console.log(`📊 실제 증감률:`)
    console.log(`- 조회수: ${viewsGrowthRate?.toFixed(1)}%`)
    console.log(`- 시청시간: ${watchTimeGrowthRate?.toFixed(1)}%`)
    console.log(`- 평균 시청시간: ${avgViewDurationGrowthRate?.toFixed(1)}%`)
    console.log(`- 구독자: ${realSubscriberGrowthRate?.toFixed(1)}%`)

    // 일별 데이터 처리
    const dailyViews = dailyViewsData.data.rows?.map((row: any[], index: number) => ({
      date: row[0], // YYYY-MM-DD 형식
      views: parseInt(row[1]) || 0
    })) || []

    const dailyWatchTime = dailyWatchTimeData.data.rows?.map((row: any[], index: number) => ({
      date: row[0], // YYYY-MM-DD 형식
      watchTime: parseInt(row[1]) || 0 // 분 단위
    })) || []

    console.log(`📊 일별 데이터 수집:`)
    console.log(`- 조회수 데이터: ${dailyViews.length}일`)
    console.log(`- 시청시간 데이터: ${dailyWatchTime.length}일`)

    // 실제 상위 영상 데이터 가져오기
    let topVideosByViews: any[] = []
    let topVideosByWatchTime: any[] = []
    let shortFormVideos: any[] = []
    let longFormVideos: any[] = []
    
    try {
      // 채널의 업로드 플레이리스트 ID 가져오기 (더 안전한 방법)
      const channelInfo = await youtube.channels.list({
        part: ['contentDetails'],
        id: [channelId]
      })

      const uploadsPlaylistId = channelInfo.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads

      if (uploadsPlaylistId) {
        console.log(`🎬 업로드 플레이리스트에서 영상 목록 조회 중... (${uploadsPlaylistId})`)
        
        // 플레이리스트에서 최근 영상들 가져오기
        const playlistResponse = await youtube.playlistItems.list({
          part: ['snippet'],
          playlistId: uploadsPlaylistId,
          maxResults: 50
        })

        if (playlistResponse.data.items && playlistResponse.data.items.length > 0) {
          // 영상 ID 추출
          const videoIds = playlistResponse.data.items
            .map(item => item.snippet?.resourceId?.videoId)
            .filter(id => id !== undefined) as string[]
          
          if (videoIds.length > 0) {
            console.log(`📊 ${videoIds.length}개 영상 통계 조회 중...`)
            
            // 영상 통계 가져오기
            const videosResponse = await youtube.videos.list({
              part: ['statistics', 'snippet', 'contentDetails'],
              id: videoIds
            })

            if (videosResponse.data.items && videosResponse.data.items.length > 0) {
              const videoData = videosResponse.data.items.map((video: any) => {
                // YouTube duration을 초 단위로 변환하는 함수
                const parseDuration = (duration: string): number => {
                  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
                  if (!match) return 0
                  
                  const hours = parseInt(match[1] || '0')
                  const minutes = parseInt(match[2] || '0')
                  const seconds = parseInt(match[3] || '0')
                  
                  return hours * 3600 + minutes * 60 + seconds
                }

                // 초 단위를 시:분:초 형태로 포맷팅하는 함수
                const formatDuration = (seconds: number): string => {
                  const hours = Math.floor(seconds / 3600)
                  const minutes = Math.floor((seconds % 3600) / 60)
                  const remainingSeconds = seconds % 60
                  
                  if (hours > 0) {
                    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
                  } else {
                    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
                  }
                }

                const durationInSeconds = parseDuration(video.contentDetails?.duration || 'PT0S')
                const isShortForm = durationInSeconds <= 60 // 60초 이하는 숏폼
                
                return {
                  id: video.id || '',
                  title: video.snippet?.title || '제목 없음',
                  views: parseInt(video.statistics?.viewCount || '0'),
                  publishedAt: video.snippet?.publishedAt || new Date().toISOString(),
                  thumbnail: video.snippet?.thumbnails?.medium?.url || '',
                  duration: durationInSeconds,
                  isShortForm,
                  durationFormatted: formatDuration(durationInSeconds)
                }
              })

              // 숏폼과 롱폼 분리
              shortFormVideos = videoData.filter(video => video.isShortForm)
              longFormVideos = videoData.filter(video => !video.isShortForm)

              // 조회수 기준 상위 5개 (전체)
              topVideosByViews = videoData
                .sort((a: any, b: any) => b.views - a.views)
                .slice(0, 5)

              // 시청시간 기준 상위 5개 (조회수 × 평균 시청시간으로 추정)
              topVideosByWatchTime = videoData
                .map((video: any) => ({
                  ...video,
                  watchTime: Math.floor(video.views * currentAverageViewDurationMinutes)
                }))
                .sort((a: any, b: any) => b.watchTime - a.watchTime)
                .slice(0, 5)

              console.log(`✅ 실제 상위 영상 데이터 로드 완료:`)
              console.log(`- 조회수 1위: ${topVideosByViews[0]?.title} (${topVideosByViews[0]?.views.toLocaleString()}회)`)
              console.log(`- 시청시간 1위: ${topVideosByWatchTime[0]?.title} (${topVideosByWatchTime[0]?.watchTime.toLocaleString()}분)`)
              console.log(`📊 영상 분류: 숏폼 ${shortFormVideos.length}개, 롱폼 ${longFormVideos.length}개`)
            }
          }
        }
      } else {
        console.log('⚠️ 업로드 플레이리스트 ID를 찾을 수 없습니다.')
      }
    } catch (videoError) {
      console.error('⚠️ 영상 데이터 로드 실패:', videoError)
      // 실패시 빈 배열 유지
      topVideosByViews = []
      topVideosByWatchTime = []
      shortFormVideos = []
      longFormVideos = []
    }

    return {
      analytics: {
        dailyViews,
        dailyWatchTime,
        topVideosByViews,
        topVideosByWatchTime,
        shortFormVideos,
        longFormVideos,
        monthlyTotals: {
          views: currentMonthlyViews,
          watchTimeMinutes: currentMonthlyWatchTime,
          impressions: 0,
          revenue: 0,
          averageViewDurationMinutes: currentAverageViewDurationMinutes,
          clickThroughRate: 0
        },
        growthRates: {
          views: viewsGrowthRate,
          watchTime: watchTimeGrowthRate,
          averageViewDuration: avgViewDurationGrowthRate,
          subscribers: realSubscriberGrowthRate // 🎯 실제 구독자 증감률!
        },
        subscriberDetails: {
          current: currentPeriodSubs,
          previous: previousPeriodSubs
        }
      },
      channelStats: {
        subscriberCount: parseInt(channel.statistics?.subscriberCount || '0'),
        viewCount: parseInt(channel.statistics?.viewCount || '0'),
        videoCount: parseInt(channel.statistics?.videoCount || '0'),
        title: channel.snippet?.title || '알 수 없는 채널'
      },
      isAuthenticated: true
    }

  } catch (error: any) {
    console.error('실제 YouTube Analytics API 호출 실패:', error)
    throw error
  }
}

// Mock 데이터 생성 함수
function getMockData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Mock 월간 총계 데이터
  const mockMonthlyViews = 19900000 // 19.9M
  const mockMonthlyWatchTime = 6150000 // 102.5M분 (102.5 * 60 * 1000)
  const mockMonthlyImpressions = 45000000 // 45M
  const mockMonthlyRevenue = 8500 // $8,500
  const mockAverageViewDuration = 4.2 // 4.2분
  const mockClickThroughRate = 12.3 // 12.3%
  
  const analytics = {
    dailyViews: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (30 - i))
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 500000) + 600000 // 60만~110만 (월간 19.9M이 되도록 조정)
      }
    }),
    dailyWatchTime: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (30 - i))
      return {
        date: date.toISOString().split('T')[0],
        watchTime: Math.floor(Math.random() * 150000) + 150000 // 15만~30만분 (월간 6.15M분이 되도록 조정)
      }
    }),
    dailyImpressions: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (30 - i))
      return {
        date: date.toISOString().split('T')[0],
        impressions: Math.floor(Math.random() * 800000) + 1200000 // 120만~200만 노출
      }
    }),
    dailyRevenue: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (30 - i))
      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 200) + 200 // $200~$400/일
      }
    }),
    monthlyTotals: {
      views: mockMonthlyViews,
      watchTimeMinutes: mockMonthlyWatchTime,
      impressions: mockMonthlyImpressions,
      revenue: mockMonthlyRevenue,
      averageViewDurationMinutes: mockAverageViewDuration,
      clickThroughRate: mockClickThroughRate
    },
    growthRates: {
      views: 12.3, // Mock 조회수 증가율
      watchTime: 8.7, // Mock 시청시간 증가율
      averageViewDuration: 1.2, // Mock 평균 시청시간 증가율
      subscribers: 5.8 // Mock 구독자 증가율
    },
    subscriberDetails: {
      current: {
        gained: 1250, // Mock 신규 구독자
        lost: 180,    // Mock 구독 취소
        net: 1070     // Mock 순증가
      },
      previous: {
        gained: 1100, // Mock 이전 기간 신규 구독자
        lost: 190,    // Mock 이전 기간 구독 취소
        net: 910      // Mock 이전 기간 순증가
      }
    },
    topVideosByViews: [
      {
        id: '1',
        title: '웃소의 역대급 콘텐츠! 이것만은 꼭 봐야 해',
        views: 3200000,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90'
      },
      {
        id: '2',
        title: '팬들이 가장 사랑하는 웃소 모먼트 모음',
        views: 2800000,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90'
      },
      {
        id: '3',
        title: '웃소가 알려주는 성공 비결',
        views: 2600000,
        publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90'
      },
      {
        id: '4',
        title: '구독자 250만 감사 라이브!',
        views: 2400000,
        publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90'
      },
      {
        id: '5',
        title: '웃소의 하루 일과 공개',
        views: 2200000,
        publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90'
      }
    ],
    topVideosByWatchTime: [
      {
        id: '1',
        title: '구독자 250만 감사 라이브!',
        watchTime: 156000,
        publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90'
      },
      {
        id: '2',
        title: '웃소가 알려주는 성공 비결',
        watchTime: 92000,
        publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90'
      },
      {
        id: '3',
        title: '웃소의 역대급 콘텐츠! 이것만은 꼭 봐야 해',
        watchTime: 89000,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90'
      },
      {
        id: '4',
        title: '팬들이 가장 사랑하는 웃소 모먼트 모음',
        watchTime: 75000,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90'
      },
      {
        id: '5',
        title: '웃소의 하루 일과 공개',
        watchTime: 68000,
        publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90'
      }
    ],
    // 숏폼 영상 목록 (Mock)
    shortFormVideos: [
      {
        id: 'short1',
        title: '30초 만에 보는 웃소 하이라이트',
        views: 1500000,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90',
        duration: 30,
        isShortForm: true,
        durationFormatted: '0:30'
      },
      {
        id: 'short2',
        title: '웃소의 꿀팁 #Shorts',
        views: 2200000,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90',
        duration: 45,
        isShortForm: true,
        durationFormatted: '0:45'
      },
      {
        id: 'short3',
        title: '이것만 알면 끝! #Shorts',
        views: 1800000,
        publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90',
        duration: 55,
        isShortForm: true,
        durationFormatted: '0:55'
      }
    ],
    // 롱폼 영상 목록 (Mock)
    longFormVideos: [
      {
        id: 'long1',
        title: '웃소의 역대급 콘텐츠! 이것만은 꼭 봐야 해',
        views: 3200000,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90',
        duration: 765, // 12분 45초
        isShortForm: false,
        durationFormatted: '12:45'
      },
      {
        id: 'long2',
        title: '팬들이 가장 사랑하는 웃소 모먼트 모음',
        views: 2800000,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90',
        duration: 920, // 15분 20초
        isShortForm: false,
        durationFormatted: '15:20'
      },
      {
        id: 'long3',
        title: '구독자 250만 감사 라이브!',
        views: 2400000,
        publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: '/api/placeholder/120/90',
        duration: 2712, // 45분 12초
        isShortForm: false,
        durationFormatted: '45:12'
      }
    ]
  }
  
  const channelStats = {
    subscriberCount: 2567000, // 256.7만명
    viewCount: 1250000000, // 12.5억 조회수
    videoCount: 1247,
    title: 'Mock 웃소 채널'
  }
  
  return { analytics, channelStats }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    let accessToken = cookieStore.get('youtube_access_token')?.value
    const refreshToken = cookieStore.get('youtube_refresh_token')?.value

    // 액세스 토큰이 없으면 리프레시 토큰으로 갱신 시도
    if (!accessToken && refreshToken) {
      console.log('액세스 토큰이 없습니다. 리프레시 토큰으로 갱신을 시도합니다.')
      try {
        const newToken = await refreshAccessToken(refreshToken)
        if (newToken) {
          accessToken = newToken
          console.log('토큰 갱신 완료')
        } else {
          throw new Error('토큰 갱신 실패')
        }
      } catch (error) {
        console.error('토큰 갱신 실패:', error)
        // 갱신 실패시 재인증 필요
      }
    }

    if (!accessToken) {
      console.log('사용 가능한 토큰이 없습니다. Mock 데이터를 반환합니다.')
      const { analytics, channelStats } = getMockData()
      return NextResponse.json({ 
        analytics, 
        channelStats,
        isAuthenticated: false,
        needsReAuth: !refreshToken, // 리프레시 토큰도 없으면 재인증 필요
        message: refreshToken 
          ? '토큰 갱신에 실패했습니다. /api/auth/callback로 이동하여 재인증하세요.'
          : 'YouTube 인증이 필요합니다. /api/auth/callback로 이동하여 인증하세요.'
      })
    }

    try {
      // 실제 YouTube Analytics API 호출
      const { analytics, channelStats } = await fetchRealYouTubeAnalytics(accessToken)
      
      return NextResponse.json({ 
        analytics, 
        channelStats,
        isAuthenticated: true,
        message: '실제 YouTube Analytics 데이터입니다.'
      })
    } catch (apiError: any) {
      // API 호출 실패시 토큰 갱신 시도
      if (apiError.message?.includes('401') || apiError.message?.includes('Invalid Credentials')) {
        console.log('API 호출 실패 - 토큰 만료로 추정됩니다. 갱신을 시도합니다.')
        
        if (refreshToken) {
          try {
            const newAccessToken = await refreshAccessToken(refreshToken)
            if (!newAccessToken) {
              throw new Error('토큰 갱신 실패')
            }
            const { analytics, channelStats } = await fetchRealYouTubeAnalytics(newAccessToken)
            
            return NextResponse.json({ 
              analytics, 
              channelStats,
              isAuthenticated: true,
              message: '토큰 갱신 후 실제 YouTube Analytics 데이터입니다.'
            })
          } catch (refreshError) {
            console.error('토큰 갱신 후 재시도 실패:', refreshError)
          }
        }
      }
      
      throw apiError // 다른 에러는 그대로 전파
    }

  } catch (error) {
    console.error('YouTube Analytics API 오류:', error)
    
    // 오류 발생시 Mock 데이터 반환
    const { analytics, channelStats } = getMockData()
    return NextResponse.json({ 
      analytics, 
      channelStats,
      isAuthenticated: false,
      error: '실제 데이터 로드 실패, Mock 데이터를 표시합니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    })
  }
} 