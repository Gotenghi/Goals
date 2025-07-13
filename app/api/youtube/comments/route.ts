import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// OAuth 클라이언트 설정
const getOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

// 액세스 토큰 갱신
async function refreshAccessToken(refreshToken: string) {
  try {
    const oauth2Client = getOAuthClient()
    oauth2Client.setCredentials({ refresh_token: refreshToken })
    const { credentials } = await oauth2Client.refreshAccessToken()
    return credentials.access_token || ''
  } catch (error) {
    console.error('토큰 갱신 실패:', error)
    throw error
  }
}

interface Comment {
  id: string
  text: string
  author: string
  authorProfileImageUrl: string
  likeCount: number
  publishedAt: string
  videoId: string
  videoTitle: string
  isPositive?: boolean
  hasRequest?: boolean
  keywords?: string[]
}

interface CommentAnalysis {
  todaysHighlights: Comment[]
  ideaRequests: Comment[]
  recentComments: Comment[]
  sentimentStats: {
    positive: number
    neutral: number
    negative: number
    total: number
  }
  topKeywords: Array<{
    keyword: string
    count: number
  }>
}

// 댓글 감정 분석 (간단한 키워드 기반)
const analyzeCommentSentiment = (text: string): 'positive' | 'neutral' | 'negative' => {
  const positiveWords = [
    '좋아', '최고', '대박', '감사', '사랑', '훌륭', '완벽', '멋지', '재미있', '웃겨',
    '👍', '❤️', '😍', '🔥', '💕', '좋음', '굿', 'good', 'great', 'awesome', 'love',
    '감동', '행복', '기쁘', '즐거', '신나', '흥미', '놀라', '대단', '짱'
  ]
  
  const negativeWords = [
    '싫어', '별로', '나쁘', '실망', '화나', '짜증', '안좋', '못하', '최악', '지겨',
    '👎', '😠', '😡', '💢', 'bad', 'hate', 'terrible', 'awful', 'boring',
    '아쉬', '부족', '문제', '오류', '버그'
  ]

  const lowerText = text.toLowerCase()
  
  const positiveScore = positiveWords.filter(word => lowerText.includes(word)).length
  const negativeScore = negativeWords.filter(word => lowerText.includes(word)).length
  
  if (positiveScore > negativeScore) return 'positive'
  if (negativeScore > positiveScore) return 'negative'
  return 'neutral'
}

// 요청 키워드 검출
const hasRequestKeywords = (text: string): boolean => {
  const requestKeywords = [
    '해주세요', '해줘', '부탁', '요청', '원해', '하고싶', '해봐', '만들어',
    '다음에', '언제', '기대', '보고싶', '궁금', '알려줘', '설명해',
    '리뷰', '비교', '추천', '소개', '가르쳐', '알고싶'
  ]
  
  return requestKeywords.some(keyword => text.includes(keyword))
}

// 키워드 추출
const extractKeywords = (text: string): string[] => {
  // 간단한 키워드 추출 (실제로는 더 정교한 NLP 처리 필요)
  const commonWords = ['이', '그', '저', '것', '수', '있', '하', '되', '않', '없', '들', '만', '도', '를', '을', '가', '이', '에', '의', '로', '으로', '와', '과', '는', '은', '도', '만']
  
  const words = text
    .replace(/[^\w\s가-힣]/g, ' ') // 특수문자 제거
    .split(/\s+/)
    .filter(word => word.length > 1 && !commonWords.includes(word))
    .slice(0, 5) // 최대 5개 키워드
  
  return words
}

// 실제 YouTube 댓글 API 호출
async function fetchRealYouTubeComments(accessToken: string): Promise<CommentAnalysis> {
  try {
    const oauth2Client = getOAuthClient()
    oauth2Client.setCredentials({ access_token: accessToken })

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

    // 채널 정보 가져오기
    const channelResponse = await youtube.channels.list({
      part: ['statistics', 'snippet', 'contentDetails'],
      mine: true
    })

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      throw new Error('채널 정보를 찾을 수 없습니다')
    }

    const channel = channelResponse.data.items[0]
    const channelId = channel.id
    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads

    if (!uploadsPlaylistId) {
      throw new Error('업로드 플레이리스트를 찾을 수 없습니다')
    }

    console.log(`💬 댓글 데이터 수집 시작... (채널: ${channel.snippet?.title})`)

    // 최근 영상 목록 가져오기 (최대 10개)
    const playlistResponse = await youtube.playlistItems.list({
      part: ['snippet'],
      playlistId: uploadsPlaylistId,
      maxResults: 10
    })

    const videoIds = playlistResponse.data.items
      ?.map(item => item.snippet?.resourceId?.videoId)
      .filter(id => id !== undefined) as string[]

    if (!videoIds.length) {
      console.log('⚠️ 최근 영상을 찾을 수 없습니다')
      return getMockCommentData()
    }

    // 영상 정보 가져오기
    const videosResponse = await youtube.videos.list({
      part: ['snippet', 'statistics'],
      id: videoIds
    })

    const videos = videosResponse.data.items || []
    console.log(`🎬 ${videos.length}개 영상의 댓글 수집 중...`)

    // 모든 댓글 수집
    const allComments: Comment[] = []
    
    for (const video of videos) {
      try {
        const commentsResponse = await youtube.commentThreads.list({
          part: ['snippet', 'replies'],
          videoId: video.id!,
          maxResults: 50, // 영상당 최대 50개 댓글
          order: 'time' // 최신순
        })

        const videoComments = commentsResponse.data.items?.map(item => {
          const comment = item.snippet?.topLevelComment?.snippet
          if (!comment) return null

          const text = comment.textDisplay || ''
          const sentiment = analyzeCommentSentiment(text)
          
          return {
            id: item.id || '',
            text: text,
            author: comment.authorDisplayName || '익명',
            authorProfileImageUrl: comment.authorProfileImageUrl || '',
            likeCount: comment.likeCount || 0,
            publishedAt: comment.publishedAt || new Date().toISOString(),
            videoId: video.id!,
            videoTitle: video.snippet?.title || '제목 없음',
            isPositive: sentiment === 'positive',
            hasRequest: hasRequestKeywords(text),
            keywords: extractKeywords(text)
          }
        }).filter(Boolean) as Comment[]

        allComments.push(...videoComments)
        console.log(`📝 "${video.snippet?.title}" 댓글 ${videoComments.length}개 수집`)
        
      } catch (commentError) {
        console.warn(`⚠️ 영상 "${video.snippet?.title}" 댓글 수집 실패:`, commentError)
        // 댓글이 비활성화된 영상은 건너뛰기
        continue
      }
    }

    console.log(`✅ 총 ${allComments.length}개 댓글 수집 완료`)

    // 댓글이 하나도 없으면 Mock 데이터 반환
    if (allComments.length === 0) {
      console.log('⚠️ 수집된 댓글이 없어 Mock 데이터를 반환합니다.')
      return getMockCommentData()
    }

    // 오늘 날짜 계산
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // 오늘의 하이라이트 (긍정적이고 좋아요가 많은 댓글)
    const todaysHighlights = allComments
      .filter(comment => {
        const commentDate = new Date(comment.publishedAt)
        return commentDate >= todayStart && comment.isPositive
      })
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 5)

    // 아이디어 요청 댓글
    const ideaRequests = allComments
      .filter(comment => comment.hasRequest)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 10)

    // 최근 댓글 (최신 20개)
    const recentComments = allComments
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 20)

    // 감정 통계
    const sentimentStats = {
      positive: allComments.filter(c => analyzeCommentSentiment(c.text) === 'positive').length,
      neutral: allComments.filter(c => analyzeCommentSentiment(c.text) === 'neutral').length,
      negative: allComments.filter(c => analyzeCommentSentiment(c.text) === 'negative').length,
      total: allComments.length
    }

    // 상위 키워드
    const keywordCount: { [key: string]: number } = {}
    allComments.forEach(comment => {
      comment.keywords?.forEach(keyword => {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1
      })
    })

    const topKeywords = Object.entries(keywordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }))

    console.log(`📊 댓글 분석 완료:`)
    console.log(`- 오늘의 하이라이트: ${todaysHighlights.length}개`)
    console.log(`- 아이디어 요청: ${ideaRequests.length}개`)
    console.log(`- 감정 분포: 긍정 ${sentimentStats.positive}, 중립 ${sentimentStats.neutral}, 부정 ${sentimentStats.negative}`)

    return {
      todaysHighlights,
      ideaRequests,
      recentComments,
      sentimentStats,
      topKeywords
    }

  } catch (error: any) {
    console.error('실제 YouTube 댓글 API 호출 실패:', error)
    throw error
  }
}

// Mock 댓글 데이터 생성
function getMockCommentData(): CommentAnalysis {
  const mockComments: Comment[] = [
    {
      id: '1',
      text: '웃소님 영상 정말 재미있어요! 항상 감사합니다 ❤️',
      author: '구독자A',
      authorProfileImageUrl: '/api/placeholder/32/32',
      likeCount: 45,
      publishedAt: new Date().toISOString(),
      videoId: 'mock1',
      videoTitle: '최신 영상',
      isPositive: true,
      hasRequest: false,
      keywords: ['재미있', '감사']
    },
    {
      id: '2', 
      text: '다음에는 게임 리뷰 영상도 해주세요! 기대하고 있어요',
      author: '구독자B',
      authorProfileImageUrl: '/api/placeholder/32/32',
      likeCount: 23,
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      videoId: 'mock1',
      videoTitle: '최신 영상',
      isPositive: true,
      hasRequest: true,
      keywords: ['게임', '리뷰', '기대']
    },
    {
      id: '3',
      text: '웃소님 덕분에 하루가 즐거워요! 최고입니다 👍',
      author: '구독자C',
      authorProfileImageUrl: '/api/placeholder/32/32',
      likeCount: 67,
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      videoId: 'mock2',
      videoTitle: '이전 영상',
      isPositive: true,
      hasRequest: false,
      keywords: ['즐거', '최고']
    },
    {
      id: '4',
      text: '요리 콘텐츠도 만들어주세요! 웃소님이 요리하는 모습 보고싶어요',
      author: '구독자D',
      authorProfileImageUrl: '/api/placeholder/32/32',
      likeCount: 34,
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      videoId: 'mock2',
      videoTitle: '이전 영상',
      isPositive: true,
      hasRequest: true,
      keywords: ['요리', '콘텐츠', '보고싶']
    },
    {
      id: '5',
      text: '편집 퀄리티가 정말 좋아졌네요! 계속 발전하는 모습이 보기 좋습니다',
      author: '구독자E',
      authorProfileImageUrl: '/api/placeholder/32/32',
      likeCount: 28,
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      videoId: 'mock3',
      videoTitle: '편집 영상',
      isPositive: true,
      hasRequest: false,
      keywords: ['편집', '퀄리티', '발전']
    }
  ]

  return {
    todaysHighlights: mockComments.filter(c => c.isPositive).slice(0, 3),
    ideaRequests: mockComments.filter(c => c.hasRequest),
    recentComments: mockComments,
    sentimentStats: {
      positive: 4,
      neutral: 1,
      negative: 0,
      total: 5
    },
    topKeywords: [
      { keyword: '재미있', count: 3 },
      { keyword: '요리', count: 2 },
      { keyword: '편집', count: 2 },
      { keyword: '게임', count: 1 },
      { keyword: '리뷰', count: 1 }
    ]
  }
}

export async function GET(request: NextRequest) {
  console.log('💬 YouTube 댓글 분석 API 호출됨')

  try {
    // 쿠키에서 토큰 확인
    const accessToken = request.cookies.get('youtube_access_token')?.value
    const refreshToken = request.cookies.get('youtube_refresh_token')?.value

    if (!accessToken) {
      console.log('액세스 토큰이 없습니다. 리프레시 토큰으로 갱신을 시도합니다.')
      
      if (!refreshToken) {
        console.log('리프레시 토큰도 없습니다. Mock 데이터를 반환합니다.')
        const mockData = getMockCommentData()
        return NextResponse.json({
          ...mockData,
          isAuthenticated: false,
          needsReAuth: true,
          message: 'YouTube 인증이 필요합니다. Mock 데이터를 표시합니다.'
        })
      }

      try {
        const newAccessToken = await refreshAccessToken(refreshToken)
        console.log('토큰 갱신 성공:', !!newAccessToken)
        
        if (newAccessToken) {
          const commentData = await fetchRealYouTubeComments(newAccessToken)
          return NextResponse.json({
            ...commentData,
            isAuthenticated: true,
            message: '토큰 갱신 후 실제 YouTube 댓글 데이터입니다.'
          })
        }
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError)
      }
    }

    try {
      // 실제 YouTube 댓글 API 호출
      const commentData = await fetchRealYouTubeComments(accessToken!)
      
      return NextResponse.json({
        ...commentData,
        isAuthenticated: true,
        message: '실제 YouTube 댓글 데이터입니다.'
      })
    } catch (apiError: any) {
      // API 호출 실패시 토큰 갱신 시도
      if (apiError.message?.includes('401') || apiError.message?.includes('Invalid Credentials')) {
        console.log('API 호출 실패 - 토큰 만료로 추정됩니다. 갱신을 시도합니다.')
        
        if (refreshToken) {
          try {
            const newAccessToken = await refreshAccessToken(refreshToken)
            const commentData = await fetchRealYouTubeComments(newAccessToken)
            
            return NextResponse.json({
              ...commentData,
              isAuthenticated: true,
              message: '토큰 갱신 후 실제 YouTube 댓글 데이터입니다.'
            })
          } catch (refreshError) {
            console.error('토큰 갱신 후 재시도 실패:', refreshError)
          }
        }
      }
      
      throw apiError // 다른 에러는 그대로 전파
    }

  } catch (error) {
    console.error('YouTube 댓글 API 오류:', error)
    
    // 오류 발생시 Mock 데이터 반환
    const mockData = getMockCommentData()
    return NextResponse.json({
      ...mockData,
      isAuthenticated: false,
      error: '실제 데이터 로드 실패, Mock 데이터를 표시합니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    })
  }
} 