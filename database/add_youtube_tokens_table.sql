-- YouTube 토큰 공유 테이블 생성
-- 팀 전체가 YouTube 데이터를 공유할 수 있도록 토큰을 중앙 관리

CREATE TABLE IF NOT EXISTS youtube_tokens (
    id TEXT PRIMARY KEY DEFAULT 'youtube_auth', -- 고정 ID로 하나의 레코드만 유지
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 트리거 추가 (updated_at 자동 업데이트)
CREATE TRIGGER update_youtube_tokens_updated_at 
    BEFORE UPDATE ON youtube_tokens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 초기 레코드 생성 (선택사항)
INSERT INTO youtube_tokens (id, created_by) 
VALUES ('youtube_auth', 'system') 
ON CONFLICT (id) DO NOTHING;

-- 설명 코멘트
COMMENT ON TABLE youtube_tokens IS '팀 공유 YouTube 인증 토큰 저장소';
COMMENT ON COLUMN youtube_tokens.id IS '고정 ID (youtube_auth)';
COMMENT ON COLUMN youtube_tokens.access_token IS 'YouTube API 액세스 토큰';
COMMENT ON COLUMN youtube_tokens.refresh_token IS 'YouTube API 리프레시 토큰';
COMMENT ON COLUMN youtube_tokens.expires_at IS '액세스 토큰 만료 시간';
COMMENT ON COLUMN youtube_tokens.created_by IS '토큰을 생성한 관리자'; 