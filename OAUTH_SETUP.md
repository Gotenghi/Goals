# YouTube OAuth 인증 설정 가이드

## 1. 환경변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가하세요:

```bash
# YouTube OAuth 설정 (google-credentials.json 파일의 정보)
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_URL=http://localhost:3001

# 기존 YouTube API 설정 (선택사항)
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=your_channel_id_here
```

## 2. google-credentials.json 파일에서 정보 추출

`google-credentials.json` 파일을 열어서 다음 정보를 찾아 `.env.local`에 입력하세요:

```json
{
  "web": {
    "client_id": "여기의 값을 GOOGLE_CLIENT_ID에 입력",
    "client_secret": "여기의 값을 GOOGLE_CLIENT_SECRET에 입력",
    "redirect_uris": ["http://localhost:3001/api/auth/youtube/callback"]
  }
}
```

## 3. Google Cloud Console에서 리다이렉트 URI 추가

1. [Google Cloud Console](https://console.cloud.google.com)에 접속
2. 해당 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보" 이동
4. OAuth 2.0 클라이언트 ID 편집
5. 승인된 리디렉션 URI에 추가:
   - `http://localhost:3001/api/auth/youtube/callback`
   - `http://localhost:3000/api/auth/youtube/callback` (개발용)

## 4. 인증 플로우

1. 서버 시작: `npm run dev`
2. 브라우저에서 `/api/auth/youtube` 접속
3. Google 로그인 및 권한 승인
4. 자동으로 메인 페이지로 리다이렉트
5. 실제 YouTube Analytics 데이터 확인

## 5. 필요한 API 권한

다음 권한이 활성화되어야 합니다:
- YouTube Data API v3
- YouTube Analytics API

## 6. 문제 해결

### 인증 실패시
- Google Cloud Console에서 리다이렉트 URI 확인
- 환경변수 값 재확인
- 서버 재시작

### API 호출 실패시
- YouTube Analytics API 활성화 확인
- 채널 소유자 권한 확인
- API 할당량 확인

## 실제 데이터 확인

인증 완료 후 대시보드에서 다음을 확인할 수 있습니다:
- 실제 구독자 수, 조회수, 영상 수
- 지난 30일간 일별 조회수/시청시간 그래프
- 실제 상위 영상 TOP 5 (조회수/시청시간 기준)
- 모든 데이터는 YouTube Analytics API에서 실시간으로 가져옴 