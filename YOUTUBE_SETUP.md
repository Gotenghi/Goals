# YouTube API 연동 설정 가이드

## 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "라이브러리"로 이동
4. **"YouTube Data API v3"** 검색 후 활성화
5. **"YouTube Analytics API"** 검색 후 활성화 ⭐ (정확한 성과 데이터용)
6. "API 및 서비스" > "사용자 인증 정보"로 이동
7. "사용자 인증 정보 만들기" > "API 키" 선택

## 2. 인증 방법 선택

YouTube Analytics API 사용을 위한 두 가지 인증 방법:

### 방법 A: 서비스 계정 (권장 - 더 간단함) 🌟

1. Google Cloud Console > "사용자 인증 정보" > "사용자 인증 정보 만들기" > "서비스 계정"
2. 서비스 계정 이름 입력 (예: "youtube-dashboard")
3. 역할: "편집자" 또는 "소유자" 선택
4. 생성된 서비스 계정 클릭 > "키" 탭 > "키 추가" > "새 키 만들기" > "JSON"
5. **JSON 파일이 자동으로 다운로드됩니다** 📁
6. 이 파일을 프로젝트 루트에 `google-credentials.json`로 저장

### 방법 B: OAuth 2.0 설정

1. Google Cloud Console > "사용자 인증 정보" > "사용자 인증 정보 만들기" > "OAuth 2.0 클라이언트 ID"
2. 애플리케이션 유형: "웹 애플리케이션"
3. 승인된 리디렉션 URI: `http://localhost:3000/api/auth/callback/google`
4. 클라이언트 ID와 클라이언트 보안 비밀 생성

## 3. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 인증 방법에 따라 설정:

### 서비스 계정 방식 (권장) 🌟
```env
# YouTube Data API 설정 (현재 사용 중)
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=your_youtube_channel_id_here

# 서비스 계정 인증 설정
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Supabase 설정 (기존)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### OAuth 2.0 방식
```env
# YouTube Data API 설정 (현재 사용 중)
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=your_youtube_channel_id_here

# YouTube Analytics API 설정 (정확한 성과 데이터용)
YOUTUBE_CLIENT_ID=your_oauth_client_id
YOUTUBE_CLIENT_SECRET=your_oauth_client_secret
YOUTUBE_REFRESH_TOKEN=your_refresh_token

# Supabase 설정 (기존)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. OAuth 토큰 획득 방법

### 방법 1: Google OAuth Playground 사용
1. [Google OAuth Playground](https://developers.google.com/oauthplayground/) 접속
2. 오른쪽 상단 설정 아이콘 클릭
3. "Use your own OAuth credentials" 체크
4. Client ID와 Client Secret 입력
5. 왼쪽에서 "YouTube Analytics API v2" 선택
6. "Authorize APIs" 클릭하여 인증
7. 생성된 Refresh Token을 환경변수에 추가

### 방법 2: 코드로 직접 구현
OAuth 2.0 플로우를 구현하여 토큰을 자동으로 관리하는 방법도 있습니다.

## 5. YouTube Analytics API로 가능한 정확한 데이터

OAuth 인증 후 다음과 같은 정확한 데이터를 얻을 수 있습니다:

- ✅ **정확한 지난 30일 조회수 증가분**
- ✅ **실제 시청시간 순위**  
- ✅ **일별 구독자 증감 데이터**
- ✅ **영상별 실제 성과 지표**
- ✅ **지역별, 연령별, 성별 분석 데이터**

## 6. 채널 ID 찾기

YouTube 채널 ID를 찾는 방법:

1. YouTube Studio에서: `https://studio.youtube.com` → 설정 → 채널 → 고급 설정
2. 채널 URL에서: `https://www.youtube.com/channel/UC...` 에서 UC 뒤의 부분
3. 커스텀 URL의 경우: YouTube Data API의 `channels` 엔드포인트 사용

## 7. API 사용량 제한

YouTube Data API v3는 일일 할당량이 있습니다:
- 기본 할당량: 10,000 쿼리/일
- 각 API 호출은 1-100 쿼리 비용
- 상용 서비스의 경우 할당량 증가 신청 가능

YouTube Analytics API는 별도의 할당량을 가집니다:
- 더 관대한 할당량
- 채널 소유자만 접근 가능

## 8. 보안 주의사항

- API 키와 OAuth 정보는 절대 공개 저장소에 업로드하지 마세요
- `.env.local` 파일은 `.gitignore`에 추가되어 있는지 확인하세요
- **`google-credentials.json` 파일도 `.gitignore`에 추가하세요** 🔒
- 프로덕션 환경에서는 환경변수를 안전하게 관리하세요

### .gitignore에 추가할 항목:
```
# 환경 변수
.env.local
.env.development.local
.env.production.local

# Google 서비스 계정 키
google-credentials.json
*.json
```

---

## 🚀 빠른 시작 가이드

### 방법 1: 서비스 계정으로 간단하게 시작 (권장) ⭐

1. **Google Cloud Console에서 설정**:
   - 프로젝트 생성 → API 활성화 (YouTube Data v3, YouTube Analytics v2)
   - 서비스 계정 생성 → JSON 키 파일 다운로드

2. **파일 저장**:
   ```bash
   # 다운로드한 JSON 파일을 프로젝트 루트에 저장
   mv ~/Downloads/your-project-xxxx.json ./google-credentials.json
   ```

3. **환경변수 설정**:
   ```env
   YOUTUBE_API_KEY=your_api_key
   YOUTUBE_CHANNEL_ID=your_channel_id  
   GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
   ```

4. **바로 사용 가능!** 🎉
   - 정확한 지난 30일 성과 데이터
   - 실제 Analytics 지표
   - 자동 폴백 시스템

### 방법 2: 현재 구현으로 시작

OAuth 설정이 복잡하다면, 현재 구현된 Data API를 사용하여:
1. 최근 업로드된 영상들의 조회수 순위 확인
2. Mock 데이터와 혼합하여 실용적인 대시보드 구현

나중에 더 정확한 분석이 필요할 때 Analytics API로 업그레이드할 수 있습니다.

## 문의사항

API 연동 관련 문제가 있으시면 개발팀에 문의해주세요. 