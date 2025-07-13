// 클라이언트 전용 YouTube API 함수들
// googleapis 의존성 없이 fetch만 사용

// YouTube API 연동을 위한 타입 정의
export interface YouTubeVideo {
  id: string
  title: string
  viewCount: number
  duration: string
  publishedAt: string
  thumbnail: string
  watchTime: number // 분 단위
}

export interface YouTubeChannelStats {
  subscriberCount: number
  totalViews: number
  videoCount: number
}

export interface YouTubeAnalytics {
  monthlyViews: Array<{
    date: string
    views: number
  }>
  watchTimeData: Array<{
    date: string
    minutes: number
  }>
  subscriberGrowth: Array<{
    date: string
    subscribers: number
    change: number
  }>
  topVideosByViews: YouTubeVideo[]
  topVideosByWatchTime: YouTubeVideo[]
}

// Mock 데이터 생성 함수 (실제 YouTube API 연동 전까지 사용)
export const generateMockYouTubeData = (): YouTubeAnalytics => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // 시간을 00:00:00으로 설정
  
  // 지난 30일 데이터 생성 (30일 전부터 어제까지)
  const monthlyViews = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (30 - i)) // 30일 전부터 1일 전까지
    return {
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 500000) + 1000000 // 100만~150만 조회수
    }
  })

  // 시청 시간 데이터 (지난 30일)
  const watchTimeData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (30 - i)) // 30일 전부터 1일 전까지
    return {
      date: date.toISOString().split('T')[0],
      minutes: Math.floor(Math.random() * 200000) + 800000 // 80만~100만 분
    }
  })

  // 구독자 증감 데이터 (지난 30일)
  const baseSubscribers = 2500000
  const subscriberGrowth = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (30 - i)) // 30일 전부터 1일 전까지
    const dailyGrowth = Math.floor(Math.random() * 5000) + 2000 // 2000~7000 증가
    return {
      date: date.toISOString().split('T')[0],
      subscribers: baseSubscribers + (i * dailyGrowth),
      change: dailyGrowth
    }
  })

  // 상위 영상 데이터 (조회수 기준) - 지난 30일 내 게시된 영상들
  const getRecentDate = (daysAgo: number) => {
    const date = new Date(today)
    date.setDate(date.getDate() - daysAgo)
    return date.toISOString().split('T')[0]
  }

  const topVideosByViews: YouTubeVideo[] = [
    {
      id: '1',
      title: '웃소의 역대급 콘텐츠! 이것만은 꼭 봐야 해',
      viewCount: 3200000,
      duration: '12:45',
      publishedAt: getRecentDate(3), // 3일 전
      thumbnail: '/api/placeholder/120/90',
      watchTime: 89000
    },
    {
      id: '2',
      title: '팬들이 가장 사랑하는 웃소 모먼트 모음',
      viewCount: 2800000,
      duration: '15:20',
      publishedAt: getRecentDate(7), // 7일 전
      thumbnail: '/api/placeholder/120/90',
      watchTime: 75000
    },
    {
      id: '3',
      title: '웃소가 알려주는 성공 비결',
      viewCount: 2600000,
      duration: '18:33',
      publishedAt: getRecentDate(12), // 12일 전
      thumbnail: '/api/placeholder/120/90',
      watchTime: 92000
    },
    {
      id: '4',
      title: '구독자 250만 감사 라이브!',
      viewCount: 2400000,
      duration: '45:12',
      publishedAt: getRecentDate(18), // 18일 전
      thumbnail: '/api/placeholder/120/90',
      watchTime: 156000
    },
    {
      id: '5',
      title: '웃소의 하루 일과 공개',
      viewCount: 2200000,
      duration: '22:18',
      publishedAt: getRecentDate(25), // 25일 전
      thumbnail: '/api/placeholder/120/90',
      watchTime: 68000
    }
  ]

  // 상위 영상 데이터 (시청 시간 기준) - 지난 30일 내 게시된 영상들
  const topVideosByWatchTime: YouTubeVideo[] = [
    {
      id: '4',
      title: '구독자 250만 감사 라이브!',
      viewCount: 2400000,
      duration: '45:12',
      publishedAt: getRecentDate(18), // 18일 전
      thumbnail: '/api/placeholder/120/90',
      watchTime: 156000
    },
    {
      id: '3',
      title: '웃소가 알려주는 성공 비결',
      viewCount: 2600000,
      duration: '18:33',
      publishedAt: getRecentDate(12), // 12일 전
      thumbnail: '/api/placeholder/120/90',
      watchTime: 92000
    },
    {
      id: '1',
      title: '웃소의 역대급 콘텐츠! 이것만은 꼭 봐야 해',
      viewCount: 3200000,
      duration: '12:45',
      publishedAt: getRecentDate(3), // 3일 전
      thumbnail: '/api/placeholder/120/90',
      watchTime: 89000
    },
    {
      id: '2',
      title: '팬들이 가장 사랑하는 웃소 모먼트 모음',
      viewCount: 2800000,
      duration: '15:20',
      publishedAt: getRecentDate(7), // 7일 전
      thumbnail: '/api/placeholder/120/90',
      watchTime: 75000
    },
    {
      id: '5',
      title: '웃소의 하루 일과 공개',
      viewCount: 2200000,
      duration: '22:18',
      publishedAt: getRecentDate(25), // 25일 전
      thumbnail: '/api/placeholder/120/90',
      watchTime: 68000
    }
  ]

  return {
    monthlyViews,
    watchTimeData,
    subscriberGrowth,
    topVideosByViews,
    topVideosByWatchTime
  }
}

// 실제 YouTube API 호출 함수 (서버 사이드 API 라우트 사용)
export const fetchYouTubeAnalytics = async (channelId: string): Promise<YouTubeAnalytics> => {
  try {
    // 클라이언트 사이드에서 현재 도메인 기준으로 절대 URL 생성
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const response = await fetch(`${baseUrl}/api/youtube/analytics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.error('Analytics API 응답 에러:', response.status, response.statusText)
      throw new Error(`Analytics API 호출 실패: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Analytics 데이터 성공적으로 로드됨:', data)
    return data
  } catch (error) {
    console.error('YouTube Analytics 데이터 로딩 실패:', error)
    // 실패시 Mock 데이터 반환
    console.log('Mock 데이터로 폴백')
    return generateMockYouTubeData()
  }
}

// 채널 통계 가져오기
export const fetchChannelStats = async (channelId: string): Promise<YouTubeChannelStats> => {
  try {
    // 클라이언트 사이드에서 현재 도메인 기준으로 절대 URL 생성
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const response = await fetch(`${baseUrl}/api/youtube/channel`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.error('Channel API 응답 에러:', response.status, response.statusText)
      throw new Error(`Channel API 호출 실패: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Channel 데이터 성공적으로 로드됨:', data)
    return data
  } catch (error) {
    console.error('YouTube 채널 통계 로딩 실패:', error)
    // 실패시 Mock 데이터 반환
    console.log('Mock 데이터로 폴백')
    return {
      subscriberCount: 2567000,
      totalViews: 1250000000,
      videoCount: 1247
    }
  }
}

// 숫자 포맷팅 유틸리티
export const formatViewCount = (count: number): string => {
  if (count >= 100000000) {
    return `${(count / 100000000).toFixed(1)}억`
  }
  if (count >= 10000) {
    return `${(count / 10000).toFixed(0)}만`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toLocaleString()
}

export const formatWatchTime = (minutes: number): string => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    return `${hours.toLocaleString()}시간`
  }
  return `${minutes.toLocaleString()}분`
} 