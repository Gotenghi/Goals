# 웃소 목표 대시보드 🎯

YouTube Analytics 기반의 실시간 목표 관리 및 팀 성과 추적 대시보드입니다.

## 📋 주요 기능

### 💰 수익 목표 추적
- **애드센스 수익**: 2억 6천 4백만원 목표
- **광고 수익**: 7,500만원 목표  
- **인세 수익**: 8,000만원 목표 (책읽는 코뿔소 + 미래엔)
- **상품 판매**: 5,000만원 목표

### 📊 채널 지표 모니터링
- 월간 조회수 5,000만 목표
- 일일 발행량 2.5개 목표
- 구독자 순증 10만명 목표
- 인스타그램 팔로워 3,200명 목표

### 📊 **실시간 YouTube Analytics**
- 월간 조회수, 시청시간, 구독자 수 등 핵심 지표
- 실제 YouTube Data API 연동
- 성장률 및 트렌드 분석

### 🎯 **목표 관리 시스템**
- 3분기 목표 설정 및 추적
- 하위 목표 및 세부 실행 계획
- 진행률 시각화 및 달성률 계산
- **데이터베이스 저장**으로 팀원 간 공유 가능

### 👥 **팀 성과 관리**
- 팀원별 레벨 및 경험치 시스템
- 주간 목표 완료도 추적
- 개별 성과 지표 관리

### 🏆 **게이미피케이션 업적 시스템**
- 구독자, 조회수, 수익 등 다양한 업적
- 희귀도별 업적 분류
- 실시간 업적 달성 알림

### 👥 팀별 진행 상황
- 10명 팀원의 개별 과제 추적
- 실시간 진행률 및 상태 모니터링
- 우선순위별 작업 관리

### ⚙️ 관리자 페이지
- 수익 목표와 채널 지표를 실시간으로 업데이트
- 현재값과 목표값을 간편하게 수정
- 빠른 액션: 데이터 초기화, 샘플 데이터 생성
- 직관적인 관리 인터페이스

## 🚀 기술 스택

- **Frontend**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: Next.js API Routes
- **Authentication**: Google OAuth 2.0
- **API**: YouTube Data API v3
- **Deployment**: Vercel

## 📦 설치 및 실행

### 1. 의존성 설치
\`\`\`bash
npm install
# 또는
yarn install
\`\`\`

### 2. 환경 변수 설정
\`.env.local\` 파일을 생성하고 다음과 같이 설정하세요:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# YouTube API
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
\`\`\`

### 3. 개발 서버 실행
\`\`\`bash
npm run dev
# 또는
yarn dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🎯 사용법

### 메인 대시보드
1. 전체 목표 진행률을 한눈에 확인
2. 각 수익 카드에서 세부 달성률 모니터링
3. 채널 지표로 콘텐츠 성과 추적
4. 팀별 진행 상황에서 개별 작업 확인

### 관리자 페이지 (`/admin`)
1. 메인 대시보드 헤더의 **"관리자"** 버튼 클릭
2. **수익 목표 업데이트**: 현재 달성액과 목표액을 실시간 수정
3. **채널 지표 업데이트**: 조회수, 발행량, 구독자 등 성과 입력
4. **빠른 액션**: 데이터 초기화, 샘플 데이터 생성 등 편의 기능

### 지표 업데이트 방법
- 입력 필드에 숫자를 입력하면 실시간으로 진행률 계산
- 변경사항은 즉시 반영되어 메인 대시보드에서 확인 가능
- 억/만 단위 자동 변환으로 한국식 숫자 표기 지원

## 🏗️ 프로젝트 구조

\`\`\`
├── app/
│   ├── admin/
│   │   └── page.tsx         # 관리자 페이지
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── GoalCard.tsx     # 목표 카드 컴포넌트
│   │   ├── ChannelMetrics.tsx # 채널 지표 컴포넌트
│   │   └── TeamProgress.tsx # 팀 진행 상황 컴포넌트
│   ├── globals.css          # 전역 스타일
│   ├── layout.tsx           # 루트 레이아웃
│   └── page.tsx             # 메인 대시보드 페이지
├── lib/
│   ├── supabase.ts          # Supabase 클라이언트 설정
│   └── utils.ts             # 유틸리티 함수들
└── ...
\`\`\`

## 📊 데이터베이스 구조

### Goals 테이블
- \`id\`: 고유 식별자
- \`title\`: 목표 제목
- \`target\`: 목표값
- \`current\`: 현재값
- \`unit\`: 단위
- \`color\`: 색상 클래스
- \`description\`: 설명
- \`deadline\`: 마감일

### ChannelMetrics 테이블
- \`id\`: 고유 식별자
- \`metric_name\`: 지표명
- \`target\`: 목표값
- \`current\`: 현재값
- \`unit\`: 단위
- \`date\`: 측정일

### TeamMembers 테이블
- \`id\`: 고유 식별자
- \`name\`: 이름
- \`role\`: 역할
- \`avatar\`: 아바타 이모지
- \`status\`: 상태 (active/warning/inactive)

### Tasks 테이블
- \`id\`: 고유 식별자
- \`member_id\`: 팀원 ID (외래키)
- \`title\`: 과제명
- \`progress\`: 진행률 (0-100)
- \`status\`: 상태 (completed/in-progress/pending)
- \`priority\`: 우선순위 (high/medium/low)

## 🎨 디자인 시스템

### 웃소 브랜드 컬러
- **Primary**: #FF6B35 (웃소 오렌지)
- **Secondary**: #4ECDC4 (웃소 민트)
- **Accent**: #FFE66D (웃소 옐로우)
- **Dark**: #2C3E50 (다크 그레이)
- **Light**: #F8F9FA (라이트 그레이)

## 🔧 추가 개발 예정 기능

- [ ] 실시간 데이터 동기화
- [ ] 모바일 반응형 최적화
- [ ] 알림 시스템
- [ ] 데이터 내보내기 기능
- [ ] 팀원별 대시보드 개인화
- [ ] 히스토리 및 트렌드 분석

## 👥 팀원

- **우디** - 콘텐츠 기획 🎬
- **민보** - 영상 제작 🎥
- **하지** - 숏폼 제작 📱
- **단하** - 편집 ✂️
- **승끼** - 콘텐츠 제작 🎭
- **최맹** - 기술 & 분석 📊
- **이브** - 출판 & 인세 📚
- **고탱** - 광고 영업 💼
- **지다** - 상품 개발 🛍️
- **혜경** - SNS 마케팅 📸

## 📝 라이선스

이 프로젝트는 웃소 팀 내부용입니다.

---

**웃소 화이팅! 함께 목표를 달성해봅시다!** 

## 🎯 데이터베이스 설정 및 배포

### 데이터베이스 설정

#### Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `database/schema.sql` 실행
3. 샘플 데이터 필요시 `database/sample-data.sql` 실행

#### 데이터베이스 스키마
```sql
-- 주요 테이블들
- goal_sections: 목표 섹션 (예: "2025년 3분기 목표")
- goals: 메인 목표
- sub_goals: 하위 목표
- team_members: 팀원 정보
- team_goals: 팀 목표
- achievement_definitions: 업적 정의
- achievement_records: 업적 달성 기록
```

### YouTube API 설정
1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. YouTube Data API v3 활성화
3. OAuth 2.0 클라이언트 ID 생성
4. 승인된 리디렉션 URI 추가: `http://localhost:3000/api/auth/callback/google`

### 배포 (Vercel)

#### 1. GitHub 레포지토리 연결
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. Vercel 배포
1. [Vercel](https://vercel.com)에서 GitHub 레포지토리 연결
2. 환경 변수 설정:
   ```
   YOUTUBE_CLIENT_ID=your_youtube_client_id
   YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
   YOUTUBE_REDIRECT_URI=https://your-domain.vercel.app/api/auth/callback/google
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. 배포 완료 후 YouTube API 리디렉션 URI 업데이트

#### 3. 팀원 접근 설정
- 배포된 URL을 팀원들과 공유
- 모든 팀원이 동일한 목표 데이터를 볼 수 있음
- 실시간 목표 업데이트 및 진행률 공유

## 🎯 데이터 흐름

### 목표 관리
1. **생성**: 관리자가 목표 생성 → Supabase 저장
2. **조회**: 모든 팀원이 실시간 목표 데이터 조회
3. **업데이트**: 진행률 업데이트 → 자동 동기화
4. **공유**: 팀원 간 실시간 목표 상태 공유

### 데이터 저장소 변경
- **이전**: localStorage (브라우저 종속적)
- **현재**: Supabase (클라우드 데이터베이스)
- **장점**: 
  - 팀원 간 데이터 공유
  - 데이터 영구 보존
  - 다중 기기 접근 가능
  - 실시간 동기화

## �� API 엔드포인트

### 목표 관리
- `GET /api/goals` - 목표 목록 조회
- `POST /api/goals` - 목표 생성/수정
- `PUT /api/goals` - 목표 업데이트
- `DELETE /api/goals` - 목표 삭제

### 팀 관리
- `GET /api/team` - 팀원 및 팀 목표 조회
- `POST /api/team` - 팀원/팀 목표 생성
- `PUT /api/team` - 팀 데이터 업데이트
- `DELETE /api/team` - 팀 데이터 삭제

### 업적 시스템
- `GET /api/achievements` - 업적 목록 조회
- `POST /api/achievements` - 업적 생성
- `PUT /api/achievements` - 업적 진행도 업데이트
- `DELETE /api/achievements` - 업적 삭제

### YouTube Analytics
- `GET /api/youtube/analytics` - YouTube 데이터 조회
- `GET /api/auth/callback/google` - OAuth 인증

## 🎯 문제 해결

### 일반적인 문제들

1. **YouTube API 인증 실패**
   - OAuth 설정 확인
   - 리디렉션 URI 정확성 검증
   - API 키 유효성 확인

2. **데이터베이스 연결 실패**
   - Supabase URL 및 키 확인
   - RLS 정책 설정 확인
   - 네트워크 연결 상태 확인

3. **목표 데이터 동기화 문제**
   - 브라우저 새로고침
   - API 응답 상태 확인
   - 데이터베이스 로그 검토

## �� 기여 방법

1. Fork 프로젝트
2. Feature 브랜치 생성
3. 변경 사항 커밋
4. Pull Request 생성

## 🎯 라이선스

MIT License 