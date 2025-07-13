# 웃소 목표 대시보드 설치 가이드 🚀

## 1. 사전 준비사항

- **Node.js 18+**: [Node.js 다운로드](https://nodejs.org/)
- **npm** 또는 **yarn** 패키지 매니저
- **Supabase 계정**: [Supabase 가입](https://supabase.com/)

## 2. 프로젝트 설정

### 2.1 의존성 설치

\`\`\`bash
npm install
# 또는
yarn install
\`\`\`

### 2.2 환경 변수 설정

프로젝트 루트에 \`.env.local\` 파일을 생성하고 다음 내용을 입력하세요:

\`\`\`env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

## 3. Supabase 데이터베이스 설정

### 3.1 Supabase 프로젝트 생성

1. [Supabase 대시보드](https://app.supabase.com/)에 로그인
2. "New project" 클릭
3. 프로젝트 이름을 "usso-goals-dashboard"로 설정
4. 데이터베이스 비밀번호 설정
5. 지역을 "Northeast Asia (Seoul)"로 선택

### 3.2 데이터베이스 스키마 생성

1. Supabase 대시보드에서 "SQL Editor" 탭으로 이동
2. \`database/schema.sql\` 파일의 내용을 복사하여 붙여넣기
3. "Run" 버튼 클릭하여 테이블 생성

### 3.3 샘플 데이터 추가

1. 같은 SQL Editor에서 새 쿼리 생성
2. \`database/sample-data.sql\` 파일의 내용을 복사하여 붙여넣기
3. "Run" 버튼 클릭하여 샘플 데이터 삽입

### 3.4 API 키 확인

1. Supabase 대시보드에서 "Settings" → "API" 탭으로 이동
2. "Project URL"과 "anon public" 키를 복사
3. \`.env.local\` 파일에 해당 값들을 입력

## 4. 개발 서버 실행

\`\`\`bash
npm run dev
# 또는
yarn dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 대시보드를 확인하세요.

## 5. 배포 (선택사항)

### 5.1 Vercel 배포

1. [Vercel](https://vercel.com/)에 로그인
2. GitHub 리포지토리와 연결
3. 환경 변수를 Vercel 프로젝트 설정에 추가
4. 자동 배포 완료

### 5.2 환경 변수 설정 (Vercel)

Vercel 대시보드에서 다음 환경 변수를 추가:

- \`NEXT_PUBLIC_SUPABASE_URL\`: Supabase 프로젝트 URL
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`: Supabase anon 키

## 6. 사용법

### 6.1 목표 업데이트

1. Supabase 대시보드에서 "Table Editor" 탭으로 이동
2. \`goals\` 테이블에서 \`current\` 값을 업데이트
3. 대시보드에서 실시간으로 진행률 확인

### 6.2 채널 지표 업데이트

1. \`channel_metrics\` 테이블에서 \`current\` 값을 업데이트
2. 필요시 새로운 날짜의 레코드 추가

### 6.3 팀원 과제 관리

1. \`tasks\` 테이블에서 \`progress\` 값을 업데이트
2. \`status\`를 변경하여 작업 상태 관리
3. \`team_members\` 테이블에서 멤버 상태 업데이트

## 7. 추가 설정

### 7.1 실시간 업데이트 (Realtime)

Supabase에서 실시간 업데이트를 활성화하려면:

1. Supabase 대시보드에서 "Database" → "Replication" 탭으로 이동
2. 필요한 테이블에 대해 "Realtime" 활성화

### 7.2 백업 설정

정기적인 데이터 백업을 위해:

1. Supabase에서 자동 백업 설정
2. 또는 수동으로 SQL 덤프 생성

## 8. 문제 해결

### 8.1 일반적인 문제들

**Q: 대시보드가 로드되지 않아요**
A: 환경 변수가 올바르게 설정되었는지 확인하세요. \`.env.local\` 파일이 프로젝트 루트에 있는지 확인하세요.

**Q: 데이터가 표시되지 않아요**
A: Supabase에서 데이터베이스 스키마와 샘플 데이터가 올바르게 생성되었는지 확인하세요.

**Q: 실시간 업데이트가 작동하지 않아요**
A: Supabase에서 Realtime이 활성화되어 있는지 확인하세요.

### 8.2 로그 확인

개발 서버에서 콘솔 로그를 확인하여 에러 메시지를 파악하세요:

\`\`\`bash
npm run dev
\`\`\`

## 9. 추가 기능 개발

필요에 따라 다음 기능들을 추가할 수 있습니다:

- 데이터 내보내기 (CSV, PDF)
- 알림 시스템 (이메일, 슬랙)
- 모바일 앱 (React Native)
- 대시보드 개인화
- 히스토리 및 트렌드 분석

## 10. 지원

문제가 발생하면 다음 채널을 통해 도움을 요청하세요:

- GitHub Issues
- 웃소 팀 내부 채팅
- 개발자 문의

---

**웃소 화이팅! 🎯 목표 달성을 위해 함께 노력해요!** 

npm run dev

앱이 http://localhost:3000 에서 실행됩니다.

## Supabase 데이터베이스 설정

### 1. UUID 확장 기능 활성화

Supabase SQL Editor에서 다음 명령을 실행하세요:

```sql
-- UUID 생성을 위한 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2. 데이터베이스 스키마 적용

`database/schema.sql` 파일의 전체 내용을 Supabase SQL Editor에 복사하여 실행하세요.

### 3. 샘플 데이터 생성 (선택사항)

`database/sample-data.sql` 파일의 내용을 실행하거나, 또는 애플리케이션에서 다음과 같이 실행할 수 있습니다:

1. 브라우저에서 애플리케이션 열기
2. 개발자 도구 콘솔 열기 (F12)
3. 다음 코드 실행:

```javascript
// 샘플 데이터 생성
fetch('/api/setup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'create_sample_data' })
})
.then(res => res.json())
.then(data => console.log('샘플 데이터 생성 결과:', data))
```

### 4. 문제 해결

#### UUID 생성 오류가 발생하는 경우

만약 여전히 UUID 관련 오류가 발생한다면, Supabase 대시보드에서:

1. Database → Extensions 메뉴로 이동
2. "uuid-ossp" 확장 기능이 활성화되어 있는지 확인
3. 비활성화되어 있다면 활성화

#### RLS (Row Level Security) 정책 확인

데이터가 조회되지 않는다면:

1. Supabase 대시보드에서 Authentication → Policies 확인
2. 각 테이블에 대한 정책이 올바르게 설정되어 있는지 확인
3. 필요시 `database/schema.sql`의 RLS 정책 부분을 다시 실행

## 사용 방법

1. 대시보드 페이지 접속: http://localhost:3000
2. 목표 관리: 목표 카드의 편집 버튼을 클릭하여 수정
3. 팀 진행 상황: 팀원별 성과 및 작업 현황 확인 